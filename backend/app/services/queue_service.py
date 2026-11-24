import uuid
import re
from datetime import datetime, date
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.queue_entry import QueueEntry
from app.models.barber import Barber
from app.models.service import Service
from app.models.setting import Setting
from app.schemas.queue import QueueJoinRequest
from app.websocket.connection_manager import ws_manager

class QueueService:

    @staticmethod
    def is_queue_open(db: Session) -> bool:
        setting = db.query(Setting).filter(Setting.key == "is_queue_open").first()
        if not setting:
            return True
        return setting.value.lower() in ("true", "1", "yes")

    @staticmethod
    def set_queue_open(db: Session, is_open: bool) -> bool:
        setting = db.query(Setting).filter(Setting.key == "is_queue_open").first()
        if not setting:
            setting = Setting(key="is_queue_open", value="true" if is_open else "false")
            db.add(setting)
        else:
            setting.value = "true" if is_open else "false"
        db.commit()
        return is_open

    @staticmethod
    def get_active_queue(db: Session) -> List[QueueEntry]:
        """Returns all entries currently Waiting, Called, or In Chair, ordered by position/join time."""
        return (
            db.query(QueueEntry)
            .filter(QueueEntry.status.in_(["Waiting", "Called", "In Chair"]))
            .order_by(QueueEntry.joined_at.asc())
            .all()
        )

    @staticmethod
    def get_entry_by_token(db: Session, token: str) -> QueueEntry:
        entry = db.query(QueueEntry).filter(QueueEntry.token == token.upper()).first()
        if not entry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Token '{token}' not found"
            )
        return entry

    @staticmethod
    def generate_token(db: Session) -> str:
        """Generates next token in sequence S-001, S-002, etc."""
        all_tokens = db.query(QueueEntry.token).all()
        max_num = 0
        for (tok,) in all_tokens:
            if tok and tok.startswith("S-"):
                num_str = tok[2:]
                if num_str.isdigit():
                    max_num = max(max_num, int(num_str))
        return f"S-{max_num + 1:03d}"

    @classmethod
    def recalculate_wait_times(cls, db: Session):
        """Updates queue positions and estimated wait times for all waiting entries."""
        # Count available working barbers (Available or Busy)
        working_barbers_count = (
            db.query(Barber)
            .filter(Barber.status != "On Break")
            .count()
        )
        if working_barbers_count < 1:
            working_barbers_count = 1

        waiting_entries = (
            db.query(QueueEntry)
            .filter(QueueEntry.status == "Waiting")
            .order_by(QueueEntry.joined_at.asc())
            .all()
        )

        cumulative_duration = 0
        for idx, entry in enumerate(waiting_entries):
            entry.position_in_queue = idx + 1
            # Wait time = sum of services ahead / available barbers
            entry.estimated_wait_minutes = max(0, int(cumulative_duration / working_barbers_count))
            cumulative_duration += entry.total_duration_minutes

        db.commit()

    @classmethod
    def join_queue(cls, db: Session, req: QueueJoinRequest) -> QueueEntry:
        # 1. Check if queue is open (online requests only)
        if not req.is_walk_in and not cls.is_queue_open(db):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Online queue is currently closed. Walk-ins only at the salon."
            )

        # 2. Check for duplicate phone in active queue
        existing_active = (
            db.query(QueueEntry)
            .filter(
                QueueEntry.customer_phone == req.customer_phone,
                QueueEntry.status.in_(["Waiting", "Called", "In Chair"])
            )
            .first()
        )
        if existing_active:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"You already have an active spot in the queue with token {existing_active.token}."
            )

        # 3. Validate services (1 to 3, must be active)
        if len(req.service_ids) < 1 or len(req.service_ids) > 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You must select between 1 and 3 services."
            )

        services = db.query(Service).filter(Service.id.in_(req.service_ids)).all()
        if len(services) != len(req.service_ids):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One or more selected services are invalid."
            )

        for s in services:
            if not s.is_active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Service '{s.name_en}' is currently unavailable."
                )

        # 4. Preferred Barber validation if provided
        if req.preferred_barber_id:
            barber = db.query(Barber).filter(Barber.id == req.preferred_barber_id).first()
            if not barber:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Selected preferred barber does not exist."
                )

        total_duration = sum(s.duration_minutes for s in services)
        total_price = sum(s.price for s in services)
        new_token = cls.generate_token(db)

        new_entry = QueueEntry(
            id=str(uuid.uuid4()),
            token=new_token,
            customer_name=req.customer_name.strip(),
            customer_phone=req.customer_phone.strip(),
            service_ids=req.service_ids,
            preferred_barber_id=req.preferred_barber_id,
            status="Waiting",
            joined_at=datetime.utcnow(),
            total_duration_minutes=total_duration,
            total_price=total_price,
            estimated_wait_minutes=15,
            position_in_queue=1,
        )
        db.add(new_entry)
        db.commit()

        # Recalculate wait times for all waiting entries
        cls.recalculate_wait_times(db)
        db.refresh(new_entry)

        return new_entry

    @classmethod
    def call_next(cls, db: Session, barber_id: str) -> QueueEntry:
        barber = db.query(Barber).filter(Barber.id == barber_id).first()
        if not barber:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Barber not found"
            )

        # Barber cannot call next if they already have an active customer
        if barber.current_customer_token:
            active_cust = db.query(QueueEntry).filter(
                QueueEntry.token == barber.current_customer_token,
                QueueEntry.status.in_(["Called", "In Chair"])
            ).first()
            if active_cust:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Barber {barber.name} is already serving or calling {active_cust.token} ({active_cust.customer_name})."
                )

        # Queue assignment rules:
        # Priority 1: First customer in Waiting who chose this barber specifically
        waiting_entries = (
            db.query(QueueEntry)
            .filter(QueueEntry.status == "Waiting")
            .order_by(QueueEntry.joined_at.asc())
            .all()
        )

        candidate: Optional[QueueEntry] = None
        for entry in waiting_entries:
            if entry.preferred_barber_id == barber_id:
                candidate = entry
                break

        # Priority 2: If none, first customer who chose "Any Barber" (preferred_barber_id is None)
        if not candidate:
            for entry in waiting_entries:
                if entry.preferred_barber_id is None:
                    candidate = entry
                    break

        if not candidate:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No waiting customers available for {barber.name}."
            )

        candidate.status = "Called"
        candidate.called_at = datetime.utcnow()
        candidate.assigned_barber_id = barber.id

        barber.status = "Busy"
        barber.current_customer_token = candidate.token
        barber.current_customer_name = candidate.customer_name

        db.commit()
        cls.recalculate_wait_times(db)
        db.refresh(candidate)

        return candidate

    @classmethod
    def start_service(cls, db: Session, token: str) -> QueueEntry:
        entry = cls.get_entry_by_token(db, token)
        if entry.status not in ["Called", "Waiting"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot start service for token in '{entry.status}' status."
            )

        entry.status = "In Chair"
        entry.started_at = datetime.utcnow()

        if entry.assigned_barber_id:
            barber = db.query(Barber).filter(Barber.id == entry.assigned_barber_id).first()
            if barber:
                barber.status = "Busy"
                barber.current_customer_token = entry.token
                barber.current_customer_name = entry.customer_name
                barber.service_start_time = entry.started_at

        db.commit()
        cls.recalculate_wait_times(db)
        db.refresh(entry)
        return entry

    @classmethod
    def finish_service(cls, db: Session, token: str) -> QueueEntry:
        entry = cls.get_entry_by_token(db, token)
        if entry.status not in ["In Chair", "Called"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot complete service for token in '{entry.status}' status."
            )

        entry.status = "Completed"
        entry.completed_at = datetime.utcnow()

        if entry.assigned_barber_id:
            barber = db.query(Barber).filter(Barber.id == entry.assigned_barber_id).first()
            if barber and barber.current_customer_token == entry.token:
                barber.current_customer_token = None
                barber.current_customer_name = None
                barber.service_start_time = None
                if barber.status == "Busy":
                    barber.status = "Available"

        db.commit()
        cls.recalculate_wait_times(db)
        db.refresh(entry)
        return entry

    @classmethod
    def mark_no_show(cls, db: Session, token: str) -> QueueEntry:
        entry = cls.get_entry_by_token(db, token)
        if entry.status not in ["Called", "Waiting"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot mark '{entry.status}' customer as No-show."
            )

        entry.status = "No-show"

        if entry.assigned_barber_id:
            barber = db.query(Barber).filter(Barber.id == entry.assigned_barber_id).first()
            if barber and barber.current_customer_token == entry.token:
                barber.current_customer_token = None
                barber.current_customer_name = None
                barber.service_start_time = None
                if barber.status == "Busy":
                    barber.status = "Available"

        db.commit()
        cls.recalculate_wait_times(db)
        db.refresh(entry)
        return entry

    @classmethod
    def cancel_entry(cls, db: Session, token: str) -> QueueEntry:
        entry = cls.get_entry_by_token(db, token)
        # Customer can cancel only while in Waiting status (Rule from docs)
        if entry.status != "Waiting":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Spots can only be cancelled while in 'Waiting' status. Current status is '{entry.status}'."
            )

        entry.status = "Cancelled"
        db.commit()
        cls.recalculate_wait_times(db)
        db.refresh(entry)
        return entry

    @classmethod
    def toggle_barber_break(cls, db: Session, barber_id: str) -> Barber:
        barber = db.query(Barber).filter(Barber.id == barber_id).first()
        if not barber:
            raise HTTPException(status_code=404, detail="Barber not found")

        if barber.status == "On Break":
            barber.status = "Available"
        else:
            barber.status = "On Break"

        db.commit()
        cls.recalculate_wait_times(db)
        db.refresh(barber)
        return barber

    @classmethod
    def get_today_stats(cls, db: Session) -> dict:
        today_start = datetime.combine(date.today(), datetime.min.time())

        completed = (
            db.query(QueueEntry)
            .filter(QueueEntry.status == "Completed", QueueEntry.joined_at >= today_start)
            .all()
        )
        served_count = len(completed)
        total_revenue = sum(e.total_price for e in completed)

        no_show_count = (
            db.query(QueueEntry)
            .filter(QueueEntry.status == "No-show", QueueEntry.joined_at >= today_start)
            .count()
        )

        in_queue_count = (
            db.query(QueueEntry)
            .filter(QueueEntry.status.in_(["Waiting", "Called"]))
            .count()
        )

        # Calculate average wait time (in minutes) for customers served or currently waiting
        wait_times = [e.estimated_wait_minutes for e in completed]
        average_wait = int(sum(wait_times) / len(wait_times)) if wait_times else 15

        is_open = cls.is_queue_open(db)

        return {
            "served_count": served_count,
            "average_wait_minutes": average_wait,
            "in_queue_count": in_queue_count,
            "no_show_count": no_show_count,
            "total_revenue": total_revenue,
            "is_queue_open": is_open,
        }

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.services.queue_service import QueueService
from app.schemas.queue import QueueJoinRequest, QueueEntryResponse, CallNextRequest, QueueListResponse
from app.schemas.service import ServiceResponse
from app.models.service import Service
from app.websocket.connection_manager import ws_manager

router = APIRouter(prefix="/api/queue", tags=["Queue"])

def enrich_entry(db: Session, entry) -> QueueEntryResponse:
    services = db.query(Service).filter(Service.id.in_(entry.service_ids or [])).all()
    resp = QueueEntryResponse.model_validate(entry)
    resp.services = [ServiceResponse.model_validate(s) for s in services]
    return resp

@router.get("", response_model=QueueListResponse)
def get_queue(db: Session = Depends(get_db)):
    entries = QueueService.get_active_queue(db)
    enriched = [enrich_entry(db, e) for e in entries]
    waiting = sum(1 for e in entries if e.status == "Waiting")
    return QueueListResponse(waiting_count=waiting, active_entries=enriched)

@router.get("/{token}", response_model=QueueEntryResponse)
def get_queue_entry(token: str, db: Session = Depends(get_db)):
    entry = QueueService.get_entry_by_token(db, token)
    return enrich_entry(db, entry)

@router.post("/join", response_model=QueueEntryResponse, status_code=status.HTTP_201_CREATED)
async def join_queue(req: QueueJoinRequest, db: Session = Depends(get_db)):
    entry = QueueService.join_queue(db, req)
    enriched = enrich_entry(db, entry)
    await ws_manager.broadcast("queue_updated", {"action": "join", "token": entry.token})
    return enriched

@router.post("/call-next", response_model=QueueEntryResponse)
async def call_next(req: CallNextRequest, db: Session = Depends(get_db)):
    entry = QueueService.call_next(db, req.barber_id)
    enriched = enrich_entry(db, entry)
    await ws_manager.broadcast("customer_called", {
        "token": entry.token,
        "customer_name": entry.customer_name,
        "assigned_barber_id": entry.assigned_barber_id
    })
    await ws_manager.broadcast("queue_updated", {"action": "call_next", "token": entry.token})
    return enriched

@router.post("/{token}/start", response_model=QueueEntryResponse)
async def start_service(token: str, db: Session = Depends(get_db)):
    entry = QueueService.start_service(db, token)
    enriched = enrich_entry(db, entry)
    await ws_manager.broadcast("queue_updated", {"action": "start", "token": entry.token})
    return enriched

@router.post("/{token}/done", response_model=QueueEntryResponse)
async def finish_service(token: str, db: Session = Depends(get_db)):
    entry = QueueService.finish_service(db, token)
    enriched = enrich_entry(db, entry)
    await ws_manager.broadcast("queue_updated", {"action": "done", "token": entry.token})
    return enriched

@router.post("/{token}/no-show", response_model=QueueEntryResponse)
async def mark_no_show(token: str, db: Session = Depends(get_db)):
    entry = QueueService.mark_no_show(db, token)
    enriched = enrich_entry(db, entry)
    await ws_manager.broadcast("queue_updated", {"action": "no_show", "token": entry.token})
    return enriched

@router.post("/{token}/cancel", response_model=QueueEntryResponse)
async def cancel_queue_entry(token: str, db: Session = Depends(get_db)):
    entry = QueueService.cancel_entry(db, token)
    enriched = enrich_entry(db, entry)
    await ws_manager.broadcast("queue_updated", {"action": "cancel", "token": entry.token})
    return enriched

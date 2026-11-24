from sqlalchemy.orm import Session
from app.db.session import engine, SessionLocal
from app.models.base import Base
from app.models.barber import Barber
from app.models.service import Service
from app.models.queue_entry import QueueEntry
from app.models.setting import Setting
from datetime import datetime, timedelta

def init_db():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        # Seed Barbers if none exist
        if db.query(Barber).count() == 0:
            barbers = [
                Barber(
                    id="b-ravi",
                    name="Ravi",
                    status="Busy",
                    current_customer_token="S-008",
                    current_customer_name="Rohan Gupta",
                    service_start_time=datetime.utcnow() - timedelta(minutes=18),
                ),
                Barber(
                    id="b-amit",
                    name="Amit",
                    status="Busy",
                    current_customer_token="S-009",
                    current_customer_name="Kunal Patel",
                    service_start_time=datetime.utcnow() - timedelta(minutes=5),
                ),
                Barber(
                    id="b-imran",
                    name="Imran",
                    status="On Break",
                ),
            ]
            db.add_all(barbers)

        # Seed Services if none exist
        if db.query(Service).count() == 0:
            services = [
                Service(id="s-haircut", name_en="Haircut", name_gu="હેરકટ", duration_minutes=30, price=150, is_active=True),
                Service(id="s-beard", name_en="Beard Trim", name_gu="દાઢી ટ્રીમ", duration_minutes=15, price=80, is_active=True),
                Service(id="s-spa", name_en="Hair Spa", name_gu="હેર સ્પા", duration_minutes=45, price=400, is_active=True),
                Service(id="s-color", name_en="Hair Coloring", name_gu="હેર કલરિંગ", duration_minutes=60, price=500, is_active=True),
                Service(id="s-facial", name_en="Facial", name_gu="ફેશિયલ", duration_minutes=40, price=350, is_active=True),
                Service(id="s-massage", name_en="Head Massage", name_gu="હેડ મસાજ", duration_minutes=20, price=120, is_active=True),
            ]
            db.add_all(services)

        # Seed Queue Entries if none exist
        if db.query(QueueEntry).count() == 0:
            now = datetime.utcnow()
            entries = [
                QueueEntry(
                    id="q-1",
                    token="S-008",
                    customer_name="Rohan Gupta",
                    customer_phone="9811002211",
                    service_ids=["s-haircut"],
                    preferred_barber_id="b-ravi",
                    assigned_barber_id="b-ravi",
                    status="In Chair",
                    joined_at=now - timedelta(minutes=40),
                    started_at=now - timedelta(minutes=18),
                    total_duration_minutes=30,
                    total_price=150,
                    estimated_wait_minutes=0,
                    position_in_queue=0,
                ),
                QueueEntry(
                    id="q-2",
                    token="S-009",
                    customer_name="Kunal Patel",
                    customer_phone="9876543210",
                    service_ids=["s-haircut", "s-beard"],
                    preferred_barber_id="b-amit",
                    assigned_barber_id="b-amit",
                    status="Called",
                    joined_at=now - timedelta(minutes=30),
                    called_at=now - timedelta(minutes=5),
                    total_duration_minutes=45,
                    total_price=230,
                    estimated_wait_minutes=5,
                    position_in_queue=1,
                ),
                QueueEntry(
                    id="q-3",
                    token="S-010",
                    customer_name="Devang Joshi",
                    customer_phone="9877001122",
                    service_ids=["s-haircut"],
                    preferred_barber_id="b-amit",
                    status="Waiting",
                    joined_at=now - timedelta(minutes=25),
                    total_duration_minutes=30,
                    total_price=150,
                    estimated_wait_minutes=15,
                    position_in_queue=2,
                ),
                QueueEntry(
                    id="q-4",
                    token="S-011",
                    customer_name="Priya Verma",
                    customer_phone="9899112233",
                    service_ids=["s-spa"],
                    preferred_barber_id=None,
                    status="Waiting",
                    joined_at=now - timedelta(minutes=20),
                    total_duration_minutes=45,
                    total_price=400,
                    estimated_wait_minutes=30,
                    position_in_queue=3,
                ),
                QueueEntry(
                    id="q-5",
                    token="S-012",
                    customer_name="Karan Mehra",
                    customer_phone="9811223344",
                    service_ids=["s-beard", "s-massage"],
                    preferred_barber_id="b-ravi",
                    status="Waiting",
                    joined_at=now - timedelta(minutes=65),
                    total_duration_minutes=35,
                    total_price=200,
                    estimated_wait_minutes=65,
                    position_in_queue=4,
                ),
            ]
            db.add_all(entries)

        # Seed Settings if none exist
        if db.query(Setting).filter(Setting.key == "is_queue_open").count() == 0:
            db.add(Setting(key="is_queue_open", value="true"))

        db.commit()
    finally:
        db.close()

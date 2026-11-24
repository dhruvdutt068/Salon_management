from sqlalchemy.orm import Session
from app.db.session import engine, SessionLocal
from app.models.base import Base
from app.models.barber import Barber
from app.models.service import Service
from app.models.queue_entry import QueueEntry
from app.models.setting import Setting
from app.models.user import User
from app.core.security import hash_pin
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
                    status="Available",
                ),
                Barber(
                    id="b-amit",
                    name="Amit",
                    status="Available",
                ),
                Barber(
                    id="b-imran",
                    name="Imran",
                    status="Available",
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

        # Queue entries start empty in clean / fresh state

        # Seed Settings if none exist
        if db.query(Setting).filter(Setting.key == "is_queue_open").count() == 0:
            db.add(Setting(key="is_queue_open", value="true"))

        # Seed Users if none exist
        if db.query(User).count() == 0:
            users = [
                User(
                    id="u-admin",
                    username="admin",
                    name="Salon Owner",
                    hashed_pin=hash_pin("9999"),
                    role="admin"
                ),
                User(
                    id="u-reception",
                    username="reception",
                    name="Front Desk Reception",
                    hashed_pin=hash_pin("1234"),
                    role="receptionist"
                ),
                User(
                    id="u-ravi",
                    username="ravi",
                    name="Ravi (Senior Stylist)",
                    hashed_pin=hash_pin("1111"),
                    role="barber",
                    barber_id="b-ravi"
                ),
                User(
                    id="u-amit",
                    username="amit",
                    name="Amit (Master Stylist)",
                    hashed_pin=hash_pin("2222"),
                    role="barber",
                    barber_id="b-amit"
                ),
                User(
                    id="u-imran",
                    username="imran",
                    name="Imran (Hair Specialist)",
                    hashed_pin=hash_pin("3333"),
                    role="barber",
                    barber_id="b-imran"
                ),
            ]
            db.add_all(users)

        db.commit()
    finally:
        db.close()

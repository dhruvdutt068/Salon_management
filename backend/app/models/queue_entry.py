from sqlalchemy import String, Integer, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
from typing import Optional, List
from datetime import datetime
from app.models.base import Base

class QueueEntry(Base):
    __tablename__ = "queue_entries"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, index=True)
    token: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    customer_name: Mapped[str] = mapped_column(String(100), nullable=False)
    customer_phone: Mapped[str] = mapped_column(String(20), index=True, nullable=False)
    service_ids: Mapped[List[str]] = mapped_column(JSON, default=list)
    preferred_barber_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    assigned_barber_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="Waiting", index=True) # Waiting, Called, In Chair, Completed, Cancelled, No-show
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    called_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    total_duration_minutes: Mapped[int] = mapped_column(Integer, default=30)
    total_price: Mapped[int] = mapped_column(Integer, default=150)
    estimated_wait_minutes: Mapped[int] = mapped_column(Integer, default=15)
    position_in_queue: Mapped[int] = mapped_column(Integer, default=1)

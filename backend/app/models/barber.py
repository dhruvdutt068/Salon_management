from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from typing import Optional
from datetime import datetime
from app.models.base import Base

class Barber(Base):
    __tablename__ = "barbers"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="Available")  # Available, Busy, On Break
    current_customer_token: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    current_customer_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    service_start_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

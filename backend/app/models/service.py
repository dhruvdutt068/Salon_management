from sqlalchemy import String, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base

class Service(Base):
    __tablename__ = "services"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, index=True)
    name_en: Mapped[str] = mapped_column(String(100), nullable=False)
    name_gu: Mapped[str] = mapped_column(String(100), nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

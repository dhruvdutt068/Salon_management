from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.schemas.service import ServiceResponse

class QueueJoinRequest(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=100)
    customer_phone: str = Field(..., pattern=r"^[6-9]\d{9}$", description="10-digit Indian mobile number")
    service_ids: List[str] = Field(..., min_length=1, max_length=3, description="1 to 3 selected services")
    preferred_barber_id: Optional[str] = None
    is_walk_in: bool = False

class CallNextRequest(BaseModel):
    barber_id: str

class QueueEntryResponse(BaseModel):
    id: str
    token: str
    customer_name: str
    customer_phone: str
    service_ids: List[str]
    preferred_barber_id: Optional[str] = None
    assigned_barber_id: Optional[str] = None
    status: str  # Waiting, Called, In Chair, Completed, Cancelled, No-show
    joined_at: datetime
    called_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    total_duration_minutes: int
    total_price: int
    estimated_wait_minutes: int
    position_in_queue: int
    services: Optional[List[ServiceResponse]] = None

    class Config:
        from_attributes = True

class QueueListResponse(BaseModel):
    waiting_count: int
    active_entries: List[QueueEntryResponse]

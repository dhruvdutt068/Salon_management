from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class BarberBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    status: str = Field("Available", pattern="^(Available|Busy|On Break)$")

class BarberUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(Available|Busy|On Break)$")

class BarberResponse(BarberBase):
    id: str
    current_customer_token: Optional[str] = None
    current_customer_name: Optional[str] = None
    service_start_time: Optional[datetime] = None

    class Config:
        from_attributes = True

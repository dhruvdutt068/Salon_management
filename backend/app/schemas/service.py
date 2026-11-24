from pydantic import BaseModel, Field
from typing import Optional

class ServiceBase(BaseModel):
    name_en: str = Field(..., min_length=2, max_length=100)
    name_gu: str = Field(..., min_length=2, max_length=100)
    duration_minutes: int = Field(..., gt=0, le=300)
    price: int = Field(..., gt=0)
    is_active: bool = True

class ServiceCreate(ServiceBase):
    id: str

class ServiceUpdate(BaseModel):
    name_en: Optional[str] = None
    name_gu: Optional[str] = None
    duration_minutes: Optional[int] = Field(None, gt=0, le=300)
    price: Optional[int] = Field(None, gt=0)
    is_active: Optional[bool] = None

class ServiceResponse(ServiceBase):
    id: str

    class Config:
        from_attributes = True

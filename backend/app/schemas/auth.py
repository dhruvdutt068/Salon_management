from pydantic import BaseModel, Field
from typing import Optional

class LoginRequest(BaseModel):
    username: str = Field(..., min_length=2, max_length=100, description="Username or 10-digit mobile number")
    pin: str = Field(..., min_length=4, max_length=50, description="4-to-6 digit PIN or password")

class CustomerRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., pattern=r"^[6-9]\d{9}$", description="10-digit Indian mobile number")
    pin: str = Field(..., min_length=4, max_length=10, description="4-digit personal security PIN")

class UserResponse(BaseModel):
    id: str
    username: str
    name: str
    role: str
    barber_id: Optional[str] = None
    phone: Optional[str] = None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

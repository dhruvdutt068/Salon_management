import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, CustomerRegisterRequest, UserResponse, TokenResponse
from app.core.security import verify_pin, hash_pin, create_access_token, decode_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
security_scheme = HTTPBearer(auto_error=False)

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Extracts and validates the JWT bearer token from the Authorization header."""
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a valid Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = decode_access_token(credentials.credentials)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload["sub"]
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Returns the current user if token is provided, or None for public endpoints."""
    if not credentials or not credentials.credentials:
        return None
    payload = decode_access_token(credentials.credentials)
    if not payload or "sub" not in payload:
        return None
    return db.query(User).filter(User.id == payload["sub"]).first()

def require_roles(allowed_roles: List[str]):
    """Role-Based Access Control dependency factory.
    Admins are granted access to all protected endpoints.
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role == "admin":
            return current_user
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires one of roles: {allowed_roles}. Your role: '{current_user.role}'."
            )
        return current_user
    return role_checker

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    clean_identifier = req.username.strip().lower()
    user = (
        db.query(User)
        .filter((User.username.ilike(clean_identifier)) | (User.phone == req.username.strip()))
        .first()
    )

    if not user or not verify_pin(req.pin.strip(), user.hashed_pin):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username, phone number, or PIN."
        )

    access_token = create_access_token({
        "sub": user.id,
        "username": user.username,
        "role": user.role,
        "name": user.name,
        "barber_id": user.barber_id
    })

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/customer-register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_customer(req: CustomerRegisterRequest, db: Session = Depends(get_db)):
    clean_phone = req.phone.strip()
    existing = db.query(User).filter((User.phone == clean_phone) | (User.username == clean_phone)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A customer account with phone number {clean_phone} already exists. Please log in."
        )

    user = User(
        id=f"u-{uuid.uuid4().hex[:10]}",
        username=clean_phone,
        name=req.name.strip(),
        phone=clean_phone,
        role="customer",
        hashed_pin=hash_pin(req.pin.strip())
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token({
        "sub": user.id,
        "username": user.username,
        "role": user.role,
        "name": user.name,
        "barber_id": None
    })

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)

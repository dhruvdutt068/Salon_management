from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.db.session import get_db
from app.models.service import Service
from app.schemas.service import ServiceResponse, ServiceCreate, ServiceUpdate
from app.websocket.connection_manager import ws_manager

router = APIRouter(prefix="/api/services", tags=["Services"])

@router.get("", response_model=List[ServiceResponse])
def get_services(active_only: bool = False, db: Session = Depends(get_db)):
    query = db.query(Service)
    if active_only:
        query = query.filter(Service.is_active == True)
    return query.all()

@router.post("", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
async def create_service(req: ServiceCreate, db: Session = Depends(get_db)):
    existing = db.query(Service).filter(Service.id == req.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Service with this ID already exists")

    service = Service(
        id=req.id or f"s-{uuid.uuid4().hex[:6]}",
        name_en=req.name_en,
        name_gu=req.name_gu,
        duration_minutes=req.duration_minutes,
        price=req.price,
        is_active=req.is_active
    )
    db.add(service)
    db.commit()
    db.refresh(service)
    await ws_manager.broadcast("services_updated")
    return service

@router.put("/{id}", response_model=ServiceResponse)
async def update_service(id: str, req: ServiceUpdate, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    if req.name_en is not None:
        service.name_en = req.name_en
    if req.name_gu is not None:
        service.name_gu = req.name_gu
    if req.duration_minutes is not None:
        service.duration_minutes = req.duration_minutes
    if req.price is not None:
        service.price = req.price
    if req.is_active is not None:
        service.is_active = req.is_active

    db.commit()
    db.refresh(service)
    await ws_manager.broadcast("services_updated")
    return service

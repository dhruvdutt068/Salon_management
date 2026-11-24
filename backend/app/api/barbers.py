from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.barber import Barber
from app.schemas.barber import BarberResponse, BarberUpdate
from app.services.queue_service import QueueService
from app.websocket.connection_manager import ws_manager

router = APIRouter(prefix="/api/barbers", tags=["Barbers"])

@router.get("", response_model=List[BarberResponse])
def get_barbers(db: Session = Depends(get_db)):
    barbers = db.query(Barber).all()
    return barbers

@router.get("/{id_or_name}", response_model=BarberResponse)
def get_barber(id_or_name: str, db: Session = Depends(get_db)):
    barber = (
        db.query(Barber)
        .filter((Barber.id == id_or_name) | (Barber.name.ilike(id_or_name)))
        .first()
    )
    if not barber:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Barber not found")
    return barber

@router.post("/{id}/break", response_model=BarberResponse)
async def toggle_break(id: str, db: Session = Depends(get_db)):
    barber = QueueService.toggle_barber_break(db, id)
    await ws_manager.broadcast("barber_updated", {"barber_id": barber.id, "status": barber.status})
    await ws_manager.broadcast("queue_updated", {"action": "barber_break"})
    return barber

@router.put("/{id}", response_model=BarberResponse)
async def update_barber(id: str, req: BarberUpdate, db: Session = Depends(get_db)):
    barber = db.query(Barber).filter(Barber.id == id).first()
    if not barber:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Barber not found")
    
    if req.name is not None:
        barber.name = req.name
    if req.status is not None:
        barber.status = req.status
        QueueService.recalculate_wait_times(db)

    db.commit()
    db.refresh(barber)
    await ws_manager.broadcast("barber_updated", {"barber_id": barber.id, "status": barber.status})
    await ws_manager.broadcast("queue_updated", {"action": "barber_updated"})
    return barber

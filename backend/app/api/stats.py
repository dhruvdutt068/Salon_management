from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.queue_service import QueueService
from app.schemas.stats import TodayStatsResponse, QueueSettingsUpdate
from app.websocket.connection_manager import ws_manager

router = APIRouter(prefix="/api", tags=["Stats & Settings"])

@router.get("/stats", response_model=TodayStatsResponse)
def get_today_stats(db: Session = Depends(get_db)):
    stats = QueueService.get_today_stats(db)
    return stats

@router.get("/settings")
def get_settings(db: Session = Depends(get_db)):
    is_open = QueueService.is_queue_open(db)
    return {"is_queue_open": is_open}

@router.post("/settings")
async def update_settings(req: QueueSettingsUpdate, db: Session = Depends(get_db)):
    if req.is_queue_open is not None:
        QueueService.set_queue_open(db, req.is_queue_open)
        await ws_manager.broadcast("settings_updated", {"is_queue_open": req.is_queue_open})
    is_open = QueueService.is_queue_open(db)
    return {"is_queue_open": is_open}

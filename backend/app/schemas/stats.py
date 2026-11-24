from pydantic import BaseModel
from typing import Optional

class TodayStatsResponse(BaseModel):
    served_count: int
    average_wait_minutes: int
    in_queue_count: int
    no_show_count: int
    total_revenue: int
    is_queue_open: bool

class QueueSettingsUpdate(BaseModel):
    is_queue_open: Optional[bool] = None

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict

from app.modules.base_module.enums import Rank, QualityStatus


class TaskPointsHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    task_id: int
    user_id: int
    period_date: date
    base_points: int
    rank: Rank
    deadline: date
    completed_at: date
    quality_status: QualityStatus
    delay_days: int
    deadline_multiplier: float
    success_multiplier: float
    preliminary_points: int
    final_points: int | None
    is_finalized: bool
    calculated_at: datetime
    finalized_at: date | None


class TaskPointsHistoryFilter(BaseModel):
    period_date: date
    user_id: int
    is_finalized: bool | None
    rank: Rank | None




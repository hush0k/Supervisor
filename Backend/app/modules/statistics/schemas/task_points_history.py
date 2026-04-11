from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class TaskPointsHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    task_id: int
    user_id: int
    period_date: date
    deadline: date
    completed_at: date
    delay_days: int
    difficulty_multiplier: float
    deadline_multiplier: float
    raw_points: float
    points: int
    earned_amount: int
    calculated_at: datetime


class TaskPointsHistoryCreate(BaseModel):
    task_id: int
    user_id: int
    period_date: date
    deadline: date
    completed_at: date
    delay_days: int
    difficulty_multiplier: float
    deadline_multiplier: float
    raw_points: float
    points: int
    earned_amount: int


class TaskPointsHistoryFilter(BaseModel):
    period_date: date
    user_id: int

from datetime import date
from typing import Literal

from pydantic import BaseModel


class LeaderBoardEntity(BaseModel):
    user_id: int
    user_first_name: str
    user_last_name: str
    rank_position: int
    total_points: int
    success_rate: float

class LeaderBoardFilter(BaseModel):
    period_date: date
    min_success_rate: float
    position_id: int | None

class LeaderBoardSort(BaseModel):
    field: Literal["total_points", "success_rate"]
    order: Literal["asc", "desc"]

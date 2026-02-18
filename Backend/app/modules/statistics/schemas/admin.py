from datetime import date
from typing import Literal

from pydantic import BaseModel


class RecalculateRequest(BaseModel):
    period_date: date
    user_id: int | None
    recalculate_type: Literal["preliminary", "final", "ranks"]

class RecalculateResponse(BaseModel):
    success: bool
    users_affected: int
    tasks_affected: int
    message: str | None

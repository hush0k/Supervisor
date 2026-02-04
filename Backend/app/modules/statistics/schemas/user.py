from datetime import date, datetime
from pydantic import BaseModel, ConfigDict
from app.modules.base_module.enums import PeriodType

class UserStatisticsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    period_type: PeriodType
    period_date: date

    count_of_completed_tasks: int
    count_of_verified_tasks: int
    count_of_failed_tasks: int
    completed_before_deadline: int
    completed_after_deadline: int
    avg_days_to_complete_task: float
    profit_for_period: int
    avg_payment_per_task: float
    percent_of_success: float
    count_of_task_as_head: int
    avg_size_of_group: float
    percent_of_success_as_head: float

    created_at: datetime
    updated_at: datetime


class UserDashboard(BaseModel):
    tasks_in_progress: int
    tasks_available: int
    tasks_verified: int
    profit_earned: int
    success_rate: float
    avg_completion_days: float
    lifetime_tasks_verified: int
    lifetime_profit: int

    group_tasks_completed: int
    avg_team_size: float
    group_success_rate: float


class LeaderBordEntity(BaseModel):
    user_id: int
    user_first_name: str
    user_second_name: str
    
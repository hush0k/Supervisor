from datetime import datetime, date

from pydantic import BaseModel, ConfigDict

from app.modules.base_module.enums import PeriodType


class CompanyStatisticsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    period_type: PeriodType
    period_date: date

    count_of_all_tasks: int
    count_of_available_tasks: int
    count_of_in_progress_tasks: int
    count_of_completed_tasks: int
    count_of_verified_tasks: int
    count_of_failed_tasks: int
    count_of_tasks_out_of_deadline: int
    avg_days_to_verification: float
    total_payments_made: int
    total_pending_payments: int
    avg_payment_per_task: float
    highest_payment_made: int
    lowest_payment_made: int
    count_of_employees: int
    count_of_employees_with_tasks: int
    count_of_employees_without_tasks: int
    avg_task_per_employee: float
    created_at: datetime
    updated_at: datetime



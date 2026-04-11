from datetime import date, datetime
from typing import Annotated, Optional, List, Literal

from pydantic import Field, BaseModel, ConfigDict

from app.modules.base_module.enums import Role

class CompanyBase(BaseModel):
    owner_id: int
    name: Annotated[str, Field(min_length=1, max_length=100)]
    logo: Optional[str] = None
    description: Optional[Annotated[str, Field(min_length=1, max_length=500)]] = None
    date_established: date


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(BaseModel):
    owner_id: Optional[int] = None
    name: Optional[str] = None
    logo: Optional[str] = None
    description: Optional[str] = None
    date_established: Optional[date] = None


class CompanyResponse(CompanyBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class CompanyList(BaseModel):
    companies: List[CompanyBase]
    total: int


class CompanyFilter(BaseModel):
    search: Optional[str] = Field(None, min_length=1, max_length=100)


class CompanySort(BaseModel):
    field: Literal["id", "name", "date_established"] = "name"
    order: Literal["asc", "desc"] = "asc"


class CompanyRoleStat(BaseModel):
    role: Role
    count: int


class CompanyPositionStat(BaseModel):
    position_name: str
    count: int


class CompanyMonthlyTaskStat(BaseModel):
    month: str
    verified: int
    failed: int
    completed: int


class CompanyMonthlyCompensationStat(BaseModel):
    month: str
    employees_count: int
    payroll_fund: int
    avg_salary: float
    bonus_paid: int


class CompanyOverviewResponse(BaseModel):
    company: CompanyResponse
    employees_count: int
    avg_salary: float
    total_salary: int
    total_bonus: int
    tasks_total: int
    tasks_available: int
    tasks_in_progress: int
    tasks_completed: int
    tasks_verified: int
    tasks_failed: int
    success_rate: float
    role_distribution: list[CompanyRoleStat]
    position_distribution: list[CompanyPositionStat]
    monthly_task_stats: list[CompanyMonthlyTaskStat]
    monthly_compensation_stats: list[CompanyMonthlyCompensationStat]

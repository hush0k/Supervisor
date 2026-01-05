from datetime import date
from typing import Annotated, Optional, List, Literal

from pydantic import BaseModel, Field, field_validator, ConfigDict, model_validator

from app.modules.base_module.enums import TaskType, City, TaskStep


class TaskBase(BaseModel):
    name: Annotated[str, Field(min_length=1, max_length=100)]
    description: Annotated[str, Field(min_length=1, max_length=1000)]
    deadline: date
    is_active: Annotated[bool, Field(default=True)]
    task_type: Annotated[TaskType, Field(default=TaskType.SOLO)]
    payment: Annotated[int, Field(ge=0, default=0)]
    city: City
    task_step: Annotated[TaskStep, Field(default=TaskStep.AVAILABLE)]

    @field_validator("deadline")
    @classmethod
    def deadline_validator(cls, v: date) -> date:
        if v < date.today():
            raise ValueError("Дедлайн не может быть раньше сегодняшнего дня")
        return v


class TaskCreate(TaskBase):
    duration: Optional[Annotated[int, Field(gt=0)]] = None

    @model_validator(mode="after")
    def set_duration_from_deadline(self) -> "TaskCreate":
        if self.duration is None:
            now = date.today()
            days = (self.deadline - now).days
            weeks = days // 7
            if days % 7 != 0:
                weeks += 1
            self.duration = max(weeks, 1)
        return self


class TaskUpdate(BaseModel):
    name: Optional[Annotated[str, Field(min_length=1, max_length=100)]] = None
    description: Optional[Annotated[str, Field(min_length=1, max_length=1000)]] = None
    deadline: Optional[date] = None
    is_active: Optional[bool] = None
    task_type: Optional[TaskType] = None
    payment: Optional[Annotated[int, Field(ge=0)]] = None
    duration: Optional[Annotated[int, Field(gt=0)]] = None
    city: Optional[City] = None
    task_step: Optional[TaskStep] = None


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str
    deadline: date
    is_active: bool
    task_type: TaskType
    payment: int
    duration: int
    city: City
    task_step: TaskStep
    completed_at: Optional[date] = None
    verified_at: Optional[date] = None

    executor_id: Optional[int] = None


class TaskList(BaseModel):
    tasks: List[TaskResponse]
    total: int


class TaskFilter(BaseModel):
    deadline: Optional[date] = None
    is_active: Optional[bool] = None
    task_type: Optional[TaskType] = None
    min_payment: Optional[int] = None
    max_payment: Optional[int] = None
    min_duration: Optional[int] = None
    max_duration: Optional[int] = None
    city: Optional[City] = None
    task_step: Optional[TaskStep] = None
    search: Optional[str] = Field(None, min_length=1, max_length=100)


class TaskSort(BaseModel):
    field: Literal[
        "id",
        "name",
        "deadline",
        "is_active",
        "task_type",
        "city",
        "task_step",
        "executors",
        "accesses",
    ] = "deadline"
    order: Literal["asc", "desc"] = "asc"

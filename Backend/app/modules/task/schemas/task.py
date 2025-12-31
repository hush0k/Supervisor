from datetime import date
from typing import Annotated, Optional, List, Literal

from pydantic import BaseModel, Field, field_validator, ConfigDict

from app.core.enums import TaskType, City
from app.modules.users.schemas.user import UserResponse


class TaskBase(BaseModel):
    name: Annotated[str, Field(min_length=1, max_length=100)]
    description: Annotated[str, Field(min_length=1, max_length=1000)]
    deadline: date
    is_active: Annotated[bool, Field(default=True)]
    task_type: Annotated[TaskType, Field(default=TaskType.SOLO)]
    payment: Annotated[int, Field(ge=0, default=0)]
    duration: Annotated[int, Field(gt=0, default=1)]
    city: City
    is_taken: Annotated[bool, Field(default=False)]
    executor_ids: List[int] = Field(default_factory=list)
    access_ids: List[int] = Field(default_factory=list)

    @field_validator("deadline")
    @classmethod
    def deadline_validator(cls, v: date) -> date:
        if v < date.today():
            raise ValueError("Дедлайн не может быть раньше сегодняшнего дня")
        return v


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    name: Optional[Annotated[str, Field(min_length=1, max_length=100)]] = None
    description: Optional[Annotated[str, Field(min_length=1, max_length=1000)]] = None
    deadline: Optional[date] = None
    is_active: Optional[bool] = None
    task_type: Optional[TaskType] = None
    payment: Optional[Annotated[int, Field(ge=0)]] = None
    duration: Optional[Annotated[int, Field(gt=0)]] = None
    city: Optional[City] = None
    is_taken: Optional[bool] = None
    executor_ids: Optional[list[int]] = None
    access_ids: Optional[list[int]] = None


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
    is_taken: bool

    executors: List[UserResponse] = []
    accesses: List[UserResponse] = []


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
    is_taken: Optional[bool] = None

    executor_ids: List[int] = []
    access_ids: List[int] = []
    search: Optional[str] = Field(None, min_length=1, max_length=100)


class TaskSort(BaseModel):
    field: Literal[
        "id",
        "name",
        "deadline",
        "is_active",
        "task_type",
        "city",
        "is_taken",
        "executors",
        "accesses",
    ] = "deadline"
    order: Literal["asc", "desc"] = "asc"

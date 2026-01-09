from typing import Optional, TYPE_CHECKING

from sqlalchemy import (
    Integer,
    String,
    Boolean,
    Enum,
    Date,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.modules.base_module.base_class import TimestampMixin
from app.core.db import Base
from app.modules.base_module.enums import TaskType, City, TaskStep


if TYPE_CHECKING:
    from app.modules.task_operations.model.task_operation import TaskOperation

class Task(Base, TimestampMixin):
    __tablename__ = "task"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(String(1000), nullable=True)
    deadline: Mapped[Date] = mapped_column(Date, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    task_type: Mapped[TaskType] = mapped_column(Enum(TaskType), nullable=False)
    payment: Mapped[int] = mapped_column(Integer, nullable=False)
    duration: Mapped[int] = mapped_column(Integer, nullable=False)
    city: Mapped[City] = mapped_column(Enum(City), nullable=True)
    task_step: Mapped[TaskStep] = mapped_column(Enum(TaskStep), nullable=False, default=TaskStep.AVAILABLE)
    completed_at: Mapped[Optional[Date]] = mapped_column(Date, nullable=True)
    verified_at: Mapped[Optional[Date]] = mapped_column(Date, nullable=True)

    operations: Mapped["TaskOperation"] = relationship("TaskOperation", back_populates="task", uselist=False)
from typing import List, Optional

from sqlalchemy import (
    Integer,
    String,
    Boolean,
    Enum,
    ForeignKey,
    Column,
    Table,
    Date,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.modules.base_module.base_class import TimestampMixin
from app.core.db import Base
from app.modules.base_module.enums import TaskType, City, TaskStep

task_executor = Table(
    "task_executor",
    Base.metadata,
    Column("task_id", Integer, ForeignKey("task.id"), primary_key=True),
    Column("user_id", Integer, ForeignKey("user.id"), primary_key=True),
)

accessed = Table(
    "accessed",
    Base.metadata,
    Column("task_id", Integer, ForeignKey("task.id"), primary_key=True),
    Column("user_id", Integer, ForeignKey("user.id"), primary_key=True),
)


class Task(Base, TimestampMixin):
    __tablename__ = "task"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, nullable=False)
    executor_id: Mapped[Optional[int]] = mapped_column(ForeignKey("user.id"), nullable=True)
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

    executor: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[executor_id],
        back_populates="taken_tasks"
    )

    executors: Mapped[List["User"]] = relationship(
        "User",
        secondary=task_executor,
        back_populates="brigade_tasks"
    )

    accesses: Mapped[List["User"]] = relationship(
        "User",
        secondary=accessed,
        back_populates="accessible_tasks"
    )
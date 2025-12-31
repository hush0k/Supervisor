from typing import List

from sqlalchemy import (
    Integer,
    String,
    DateTime,
    Boolean,
    Enum,
    ForeignKey,
    Column,
    Table,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import date

from app.core.base_class import TimestampMixin
from app.core.db import Base
from app.core.enums import TaskType, City

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
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(String(1000), nullable=True)
    deadline: Mapped[date] = mapped_column(DateTime, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False)
    task_type: Mapped[TaskType] = mapped_column(Enum(TaskType), nullable=False)
    payment: Mapped[int] = mapped_column(Integer, nullable=False)
    duration: Mapped[int] = mapped_column(Integer, nullable=False)
    city: Mapped[City] = mapped_column(Enum(City), nullable=True)
    is_taken: Mapped[bool] = mapped_column(Boolean, nullable=False)

    executors: Mapped[List["User"]] = relationship(
        "User", secondary=task_executor, back_populates="tasks"
    )
    accesses: Mapped[List["User"]] = relationship(
        "User", secondary=accessed, back_populates="accesses"
    )

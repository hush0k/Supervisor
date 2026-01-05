from typing import List, TYPE_CHECKING

from sqlalchemy import Integer, ForeignKey, Column, Table
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base


if TYPE_CHECKING:
    from app.modules.task.model.task import Task
    from app.modules.users.models.user import User


accessed_users = Table(
    "accessed_users",
    Base.metadata,
    Column("user_id", ForeignKey("user.id"), primary_key=True),
    Column("task_id", ForeignKey("task_operations.id"), primary_key=True),
)

executors = Table(
    "executors",
    Base.metadata,
    Column("user_id", ForeignKey("user.id"), primary_key=True),
    Column("task_id", ForeignKey("task_operations.id"), primary_key=True),
)

class TaskOperation(Base):
    __tablename__ = "task_operations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, nullable=False)
    task_id: Mapped[int] = mapped_column(ForeignKey("task.id"), nullable=False)

    task: Mapped["Task"] = relationship("Task", back_populates="operations")
    accessed_users: Mapped[List["User"]] = relationship(
        "User",
        secondary=accessed_users,
        back_populates="accessed_users",
    )
    executors: Mapped[List["User"]] = relationship(
        "User",
        secondary=executors,
        back_populates="executed_tasks",
    )
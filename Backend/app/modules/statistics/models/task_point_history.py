from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, Integer, Float, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base
from app.modules.base_module.base_class import TimestampMixin

if TYPE_CHECKING:
    from app.modules.task.model.task import Task
    from app.modules.users.models.user import User


class TaskPointHistory(Base, TimestampMixin):
    __tablename__ = "task_point_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, nullable=False)
    task_id: Mapped[int] = mapped_column(ForeignKey("task.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    period_date: Mapped[date] = mapped_column(Date, nullable=False)

    # Input data - что было на момент расчета
    deadline: Mapped[date] = mapped_column(Date, nullable=False)
    completed_at: Mapped[date] = mapped_column(Date, nullable=False)

    # Calculated data - что посчитали
    delay_days: Mapped[int] = mapped_column(Integer, nullable=False)
    difficulty_multiplier: Mapped[float] = mapped_column(Float, nullable=False)
    deadline_multiplier: Mapped[float] = mapped_column(Float, nullable=False)
    raw_points: Mapped[float] = mapped_column(Float, nullable=False)
    points: Mapped[int] = mapped_column(Integer, nullable=False)
    earned_amount: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Timestamps
    calculated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.now())

    # Relationships
    task: Mapped["Task"] = relationship("Task", back_populates="task_point_history")
    user: Mapped["User"] = relationship("User", back_populates="task_point_history")

    # Indexes для производительности
    __table_args__ = (
        Index("idx_tph_user_period", "user_id", "period_date"),
        Index("idx_tph_task", "task_id"),
    )

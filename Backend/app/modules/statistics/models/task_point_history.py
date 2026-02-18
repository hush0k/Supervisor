from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, Integer, Float, Boolean, ForeignKey, Enum, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base
from app.modules.base_module.base_class import TimestampMixin
from app.modules.base_module.enums import Rank, QualityStatus

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
    base_points: Mapped[int] = mapped_column(Integer, nullable=False)
    rank: Mapped[Rank] = mapped_column(Enum(Rank), nullable=False)
    deadline: Mapped[date] = mapped_column(Date, nullable=False)
    completed_at: Mapped[date] = mapped_column(Date, nullable=False)
    quality_status: Mapped[QualityStatus] = mapped_column(Enum(QualityStatus), nullable=False)

    # Calculated data - что посчитали
    delay_days: Mapped[int] = mapped_column(Integer, nullable=False)
    deadline_multiplier: Mapped[float] = mapped_column(Float, nullable=False)
    success_multiplier: Mapped[float] = mapped_column(Float, nullable=False)
    preliminary_points: Mapped[int] = mapped_column(Integer, nullable=False)
    final_points: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_finalized: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Timestamps
    calculated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    finalized_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Relationships
    task: Mapped["Task"] = relationship("Task", back_populates="task_point_history")
    user: Mapped["User"] = relationship("User", back_populates="task_point_history")

    # Indexes для производительности
    __table_args__ = (
        Index('idx_user_period', 'user_id', 'period_date'),
        Index('idx_task', 'task_id'),
        Index('idx_finalized', 'is_finalized', 'period_date'),
    )
from __future__ import annotations

from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, Enum, Date, Float, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base
from app.modules.base_module.base_class import TimestampMixin
from app.modules.base_module.enums import PeriodType

if TYPE_CHECKING:
    from app.modules.users.models.user import User


class UserStatistic(Base, TimestampMixin):
    __tablename__ = 'user_statistic'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('user.id'), nullable=False)
    period_type: Mapped[PeriodType] = mapped_column(Enum(PeriodType), nullable=False)
    period_date: Mapped[date] = mapped_column(Date, nullable=False)

    # Performance statistics
    count_of_completed_tasks: Mapped[int] = mapped_column(Integer, default=0)
    count_of_verified_tasks: Mapped[int] = mapped_column(Integer, default=0)
    count_of_failed_tasks: Mapped[int] = mapped_column(Integer, default=0)

    # Time management statistics
    completed_before_deadline: Mapped[int] = mapped_column(Integer, default=0)
    completed_after_deadline: Mapped[int] = mapped_column(Integer, default=0)
    avg_days_to_complete_task: Mapped[float] = mapped_column(Float, default=0)

    # Financial statistics
    profit_for_period: Mapped[int] = mapped_column(Integer, default=0)
    avg_payment_per_task: Mapped[float] = mapped_column(Float, default=0)

    # Quality statistics
    percent_of_success: Mapped[float] = mapped_column(Float, default=0)

    # HEAD/SUPERVISOR statistics
    count_of_task_as_head: Mapped[int] = mapped_column(Integer, default=0)
    avg_size_of_group: Mapped[float] = mapped_column(Float, default=0)
    percent_of_success_as_head: Mapped[float] = mapped_column(Float, default=0)


    user: Mapped["User"] = relationship("User", back_populates="user_statistics")

    __table_args__ = (
        Index('idx_user_period', 'user_id', 'period_type', 'period_date', unique=True),
    )





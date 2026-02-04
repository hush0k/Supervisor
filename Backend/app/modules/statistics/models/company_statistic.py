from datetime import date
from sqlalchemy import ForeignKey, Enum, Date, Integer, Float, Index
from sqlalchemy.orm import mapped_column, Mapped, relationship

from app.core.db import Base
from app.modules.base_module.base_class import TimestampMixin
from app.modules.base_module.enums import PeriodType

class CompanyStatistic(Base, TimestampMixin):
    __tablename__ = 'company_statistic'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    company_id: Mapped[int] = mapped_column(ForeignKey('company.id'), nullable=False)
    period_type: Mapped[PeriodType] = mapped_column(Enum(PeriodType), nullable=False)
    period_date: Mapped[date] = mapped_column(Date, nullable=False)

    # Task distribution statistics
    count_of_all_tasks: Mapped[int] = mapped_column(Integer, default=0)
    count_of_available_tasks: Mapped[int] = mapped_column(Integer, default=0)
    count_of_in_progress_tasks: Mapped[int] = mapped_column(Integer, default=0)
    count_of_completed_tasks: Mapped[int] = mapped_column(Integer, default=0)
    count_of_verified_tasks: Mapped[int] = mapped_column(Integer, default=0)
    count_of_failed_tasks: Mapped[int] = mapped_column(Integer, default=0)

    # Task quality statistics
    count_of_tasks_out_of_deadline: Mapped[int] = mapped_column(Integer, default=0)
    avg_days_to_verification: Mapped[float] = mapped_column(Float, default=0.0)

    # Financial statistics
    total_payments_made: Mapped[int] = mapped_column(Integer, default=0)
    total_pending_payments: Mapped[int] = mapped_column(Integer, default=0)
    avg_payment_per_task: Mapped[float] = mapped_column(Float, default=0.0)
    highest_payment_made: Mapped[int] = mapped_column(Integer, default=0)
    lowest_payment_made: Mapped[int] = mapped_column(Integer, default=0)

    # Employee statistics
    count_of_employees: Mapped[int] = mapped_column(Integer, default=0)
    count_of_employees_with_tasks: Mapped[int] = mapped_column(Integer, default=0)
    count_of_employees_without_tasks: Mapped[int] = mapped_column(Integer, default=0)
    avg_task_per_employee: Mapped[float] = mapped_column(Float, default=0.0)

    # Relationship
    company: Mapped["Company"] = relationship("Company", back_populates="company_statistics")

    # Index
    __table_args__ = (
        Index('idx_company_period', 'company_id', 'period_type', 'period_date', unique=True),
    )
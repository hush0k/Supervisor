from __future__ import annotations

from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import (
    Integer,
    String,
    Date,
    CheckConstraint,
    ForeignKey,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.modules.base_module.base_class import TimestampMixin
from app.core.db import Base
from app.modules.base_module.enums import Role

if TYPE_CHECKING:
    from app.modules.company.model.company import Company
    from app.modules.users.models.position import Position
    from app.modules.task_operations.model.task_operation import TaskOperation
    from app.modules.statistics.models.user_statistic import UserStatistic


class User(Base, TimestampMixin):
    __tablename__ = "user"
    __table_args__ = (CheckConstraint("salary > 0", name="check_salary_non_negative"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, nullable=False)
    login: Mapped[str] = mapped_column(String(100), index=True, unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(100), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=False)
    role: Mapped[Role] = mapped_column(String(50), default=Role.USER, nullable=False)
    salary: Mapped[int] = mapped_column(Integer, nullable=False)
    position_id: Mapped[int | None] = mapped_column(ForeignKey("position.id"), nullable=True)
    company_id: Mapped[int | None] = mapped_column(ForeignKey("company.id"), nullable=True)
    bonus: Mapped[int] = mapped_column(Integer, nullable=True)

    position: Mapped["Position"] = relationship("Position", back_populates="user")

    company: Mapped["Company"] = relationship(
        "Company",
        back_populates="employees",
        foreign_keys=[company_id]
    )

    companies: Mapped[list["Company"]] = relationship(
        "Company",
        back_populates="owner",
        foreign_keys="Company.owner_id"
    )

    accessed_operations: Mapped[list["TaskOperation"]] = relationship(
        "TaskOperation",
        secondary="accessed_users",
        back_populates="accessed_users",
    )
    executed_operations: Mapped[list["TaskOperation"]] = relationship(
        "TaskOperation",
        secondary="executors",
        back_populates="executors",
    )

    user_statistics: Mapped[list["UserStatistic"]] = relationship(
        "UserStatistic",
        back_populates="user"
    )
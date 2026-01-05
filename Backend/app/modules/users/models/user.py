# Backend/app/modules/users/models/user.py
from __future__ import annotations

from datetime import date
from typing import List

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


class User(Base, TimestampMixin):
    __tablename__ = "user"
    __table_args__ = (CheckConstraint("salary > 0", name="check_salary_non_negative"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, nullable=False)
    login: Mapped[str] = mapped_column(
        String(100),
        index=True,
        unique=True,
        nullable=False,
    )
    hashed_password: Mapped[str] = mapped_column(String(100), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=False)
    role: Mapped[Role] = mapped_column(String(50), default=Role.USER, nullable=False)
    salary: Mapped[int] = mapped_column(Integer, nullable=False)
    position_id: Mapped[int] = mapped_column(ForeignKey("position.id"), nullable=False)

    position: Mapped["Position"] = relationship("Position", back_populates="user")

    companies: Mapped[List["Company"]] = relationship(
        "Company",
        back_populates="owner"
    )
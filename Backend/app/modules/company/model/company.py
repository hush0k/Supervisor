from datetime import datetime, date
from typing import List

from sqlalchemy import Integer, String, ForeignKey, Date
from sqlalchemy.orm import Mapped, relationship, mapped_column

from app.modules.base_module.base_class import TimestampMixin
from app.core.db import Base


class Company(Base, TimestampMixin):
    __tablename__ = "company"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, nullable=False)
    owner_id: Mapped[int] = mapped_column(Integer, ForeignKey("user.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    logo: Mapped[str | None] = mapped_column(String(100), nullable=True)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    date_established: Mapped[date] = mapped_column(Date, nullable=False)

    owner: Mapped["User"] = relationship(
        "User",
        back_populates="companies",
        foreign_keys=[owner_id]
    )

    employees: Mapped[list["User"]] = relationship(
        "User",
        back_populates="company",
        foreign_keys="User.company_id"
    )
from datetime import datetime

from sqlalchemy import Integer, String, ForeignKey, Date
from sqlalchemy.orm import Mapped, relationship, mapped_column

from app.core.base_class import TimestampMixin
from app.core.db import Base


class Company(Base, TimestampMixin):
    __tablename__ = "company"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, nullable=False)
    owner_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("user.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    logo: Mapped[str] = mapped_column(String(100), nullable=True)
    description: Mapped[str] = mapped_column(String(500), nullable=True)
    date_established: Mapped[datetime] = mapped_column(Date, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="company")

from typing import List

from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column, Relationship, relationship

from app.core.db import Base


class Position(Base):
    __tablename__ = "position"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, nullable=False)
    name: Mapped[str] = mapped_column(String, index=True, nullable=False)

    user: Mapped[List["User"]] = relationship("User", back_populates="position")

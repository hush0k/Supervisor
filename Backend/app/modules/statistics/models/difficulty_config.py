from typing import TYPE_CHECKING

from sqlalchemy import Integer, ForeignKey
from sqlalchemy.orm import mapped_column, Mapped, relationship

from app.core.db import Base
from app.modules.base_module.base_class import TimestampMixin

if TYPE_CHECKING:
    from app.modules.company.model.company import Company


class DifficultyConfig(Base, TimestampMixin):
    __tablename__ = "difficulty_config"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    company_id: Mapped[int] = mapped_column(
        ForeignKey("company.id"), nullable=False, unique=True
    )
    low_max: Mapped[int] = mapped_column(Integer, nullable=False)
    medium_max: Mapped[int] = mapped_column(Integer, nullable=False)

    company: Mapped["Company"] = relationship(
        "Company", back_populates="difficulty_config"
    )

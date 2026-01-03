from sqlalchemy import Column, DateTime, func
from datetime import datetime, UTC

from sqlalchemy.orm import declarative_mixin, mapped_column, Mapped


@declarative_mixin
class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
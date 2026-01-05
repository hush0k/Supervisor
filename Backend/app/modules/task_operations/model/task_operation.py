from typing import List

from sqlalchemy import Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base


class TaskOperation(Base):
    __tablename__ = "task_operations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, nullable=False)
    task_id: Mapped[int] = mapped_column(Integer, nullable=False)
    user_ids: Mapped[list[int]] = mapped_column(list[int], nullable=False)
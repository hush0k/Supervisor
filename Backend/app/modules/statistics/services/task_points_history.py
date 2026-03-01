from sqlalchemy import select

from app.modules.statistics.schemas.task_points_history import (
    TaskPointsHistoryCreate,
    TaskPointsHistoryResponse,
)
from app.modules.statistics.models.task_point_history import TaskPointHistory


class TaskPointsHistoryService:
    def __init__(self, db):
        self.db = db

    async def create(
        self, task_in: TaskPointsHistoryCreate
    ) -> TaskPointsHistoryResponse:
        task_data = task_in.model_dump()
        task_points_history = TaskPointHistory(**task_data)  # type: ignore

        self.db.add(task_points_history)
        await self.db.commit()
        await self.db.refresh(task_points_history)

        return task_points_history

    async def get_all(self) -> list[TaskPointsHistoryResponse]:
        result = await self.db.execute(
            select(TaskPointHistory)
        )
        return result.scalars().all()

    async def get_by_id(self, task_id: int) -> TaskPointsHistoryResponse:
        result = await self.db.execute(
            select(TaskPointHistory).where(TaskPointHistory.task_id == task_id)
        )
        task_points_history = result.scalar_one_or_none()
        if task_points_history is None:
            raise ValueError("TaskPointsHistory not found for the given task_id")

        return task_points_history

    async def get_by_task_id(self, task_id: int) -> TaskPointsHistoryResponse:
        result = await self.db.execute(
            select(TaskPointHistory).where(TaskPointHistory.task_id == task_id)
        )
        task_points_history = result.scalar_one_or_none()
        if task_points_history is None:
            raise ValueError("TaskPointsHistory not found for the given task_id")

        return task_points_history

    async def get_by_user_id(self, user_id: int) -> list[TaskPointsHistoryResponse]:
        result = await self.db.execute(
            select(TaskPointHistory).where(TaskPointHistory.user_id == user_id)
        )
        return result.scalars().all()


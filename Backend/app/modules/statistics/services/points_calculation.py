from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.statistics.schemas.task_points_history import (
    TaskPointsHistoryResponse,
    TaskPointsHistoryCreate,
)
from app.modules.statistics.services.difficulty_config import DifficultyConfigService
from app.modules.statistics.services.task_points_history import TaskPointsHistoryService
from app.modules.task.model.task import Task


class PointsCalculationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    @staticmethod
    def deadline_multiplier(delay) -> float:
        if delay < 0:
            return 1.2
        elif delay == 0:
            return 1.0
        elif 0 < delay <= 3:
            return 0.8
        elif 3 < delay <= 5:
            return 0.6
        else:
            return 0.4

    @staticmethod
    def get_devisor(row_points: float) -> int:
        integer = int(row_points)
        length = len(str(integer))
        if length <= 3:
            return 1
        else:
            return 10 ** (length - 3)

    async def calculate_and_save(
        self, task: Task, user_id: int, earned_amount: int
    ) -> TaskPointsHistoryResponse:
        difficulty_service = DifficultyConfigService(self.db)
        task_history_service = TaskPointsHistoryService(self.db)
        difficulty_multiplier = await difficulty_service.get_with_difficulty_level(task.company_id, earned_amount)  # type: ignore
        delay = (task.completed_at - task.deadline).days
        deadline_multiplier = self.deadline_multiplier(delay)
        raw_points = earned_amount * difficulty_multiplier * deadline_multiplier
        devisor = self.get_devisor(raw_points)
        points = round(raw_points / devisor)
        task_in = TaskPointsHistoryCreate(
            task_id=task.id,
            user_id=user_id,
            period_date=task.completed_at,
            deadline=task.deadline,
            completed_at=task.completed_at,
            delay_days=delay,
            difficulty_multiplier=difficulty_multiplier,
            deadline_multiplier=deadline_multiplier,
            raw_points=raw_points,
            points=points,
            earned_amount=earned_amount,
        )
        return await task_history_service.create(task_in)

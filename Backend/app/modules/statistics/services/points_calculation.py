from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.statistics.services.task_points_history import TaskPointsHistory

class PointsCalculation:
    def __init__(self, db: AsyncSession):
        self.db = db

    @staticmethod
    def calculate_delay_days(self, completed_at: date, deadline: date) -> int:
        delay = (completed_at - deadline).days
        # For 1.1 coefficient
        if delay < 0:
            return -1
        # For minus coefficient
        return max(0, delay)

    # For deadline multiplier
    @staticmethod
    def get_deadline_multiplier(delay_days: int) -> float:
        if delay_days == -1:
            return 1.1
        elif delay_days == 0:
            return 1.0
        elif 1 <= delay_days <= 2:
            return 0.9
        elif 3 <= delay_days <= 5:
            return 0.75
        else:
            return 0.5

    async def calculate_success_rate(self, user_id: int, period_date: date) -> float:
        task = await self.db.execute(select(TaskPointsHistory).where(TaskPointsHistory.user_id == user_id))
        result = task.scalars().all()




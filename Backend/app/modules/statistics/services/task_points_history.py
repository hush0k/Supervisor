from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


class TaskPointsHistory:
    def __init__(self, db: AsyncSession):
        self.db = db


    async def get_by_user_id(self, user_id: int):
        task = await self.db.execute(select(TaskPointsHistory).where(TaskPointsHistory.user_id == user_id))
        return task.scalars().all()

from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from Backend.app.modules.users.models.position import Position
from Backend.app.modules.users.shcemas.position import PositionCreate, PositionUpdate


class PositionServices:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, position_in: PositionCreate):
        position = Position(**position_in.model_dump())

        self.db.add(position)
        await self.db.flush()
        await self.db.refresh(position)
        return position

    async def get_by_id(self, position_id: int) -> Position:
        result = await self.db.execute(
            select(Position).where(Position.id == position_id)
        )
        return result.scalar_one_or_none()

    async def get_by_name(self, name: str) -> Position:
        result = await self.db.execute(select(Position).where(Position.name == name))
        return result.scalar_one_or_none()

    async def update(
        self, position_id: int, position_new: PositionUpdate
    ) -> Optional[Position]:
        position = await self.get_by_id(position_id)
        if not position:
            return None

        update_data = position_new.model_dump()

        for field, value in update_data.item():
            setattr(position, field, value)

        await self.db.flush()
        await self.db.refresh(position)
        return position

    async def delete(self, position_id: int) -> bool:
        position = self.get_by_id(position_id)
        if not position:
            return False

        await self.db.delete(position)
        return True

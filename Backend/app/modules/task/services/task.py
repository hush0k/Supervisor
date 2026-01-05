from typing import Optional

from sqlalchemy import select, asc, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.task.model.task import Task
from app.modules.task.schemas.task import (
    TaskCreate,
    TaskResponse,
    TaskFilter,
    TaskSort,
    TaskUpdate
)


class TaskService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, task_in: TaskCreate) -> TaskResponse:
        task_data = task_in.model_dump()

        task = Task(**task_data)

        self.db.add(task)
        await self.db.flush()
        await self.db.refresh(task)

        return task

    async def get_by_id(self, task_id: int) -> TaskResponse:
        result = await self.db.execute(select(Task).where(Task.id == task_id))
        return result.scalar_one_or_none()

    async def get_all(
        self,
        filters: TaskFilter,
        sort: TaskSort,
        skip: int = 0,
        limit: int = 100,
    ) -> list[TaskResponse]:
        query = select(Task)

        if filters.deadline:
            query = query.where(Task.deadline >= filters.deadline)
        if filters.is_active:
            query = query.where(Task.is_active == filters.is_active)
        if filters.task_type:
            query = query.where(Task.task_type == filters.task_type)
        if filters.min_payment:
            query = query.where(Task.payment >= filters.min_payment)
        if filters.max_payment:
            query = query.where(Task.payment <= filters.max_payment)
        if filters.min_duration:
            query = query.where(Task.duration >= filters.min_duration)
        if filters.max_duration:
            query = query.where(Task.duration <= filters.max_duration)
        if filters.city:
            query = query.where(Task.city == filters.city)
        if filters.task_step:
            query = query.where(Task.task_step == filters.task_step)
        if filters.search:
            search_pattern = f"%{filters.search}%"
            query = query.where(Task.name.ilike(search_pattern))

        order_func = desc if sort.order == "desc" else asc
        query = query.order_by(order_func(getattr(Task, sort.field)))

        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def update(self, task_id: int, task_in: TaskUpdate) -> Optional[TaskResponse]:
        task = await self.get_by_id(task_id)
        if not task:
            return None

        updated_task = task_in.model_dump(exclude_unset=True)

        for field, value in updated_task.items():
            setattr(task, field, value)

        await self.db.flush()
        await self.db.refresh(task)
        return task

    async def delete(self, task_id: int) -> bool:
        task = await self.get_by_id(task_id)

        if not task:
            return False

        await self.db.delete(task)
        return True

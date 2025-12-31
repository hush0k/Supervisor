from datetime import date
from typing import Optional

from sqlalchemy import select, asc, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.task.model.task import Task
from app.modules.users.models.user import User
from app.modules.task.schemas.task import (
    TaskCreate,
    TaskResponse,
    TaskFilter,
    TaskSort,
    TaskUpdate,
)


def _calculate_duration(deadline: date) -> int:
    now = date.today()
    if (deadline - now).days % 30 != 0:
        return ((deadline - now).days // 30) + 1
    return (deadline - now).days // 30


class TaskService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, task_in: TaskCreate) -> TaskResponse:
        task_data = task_in.model_dump()
        executor_ids = task_data.pop("executor_ids", [])
        access_ids = task_data.pop("access_ids", [])

        task = Task(**task_data)

        if executor_ids:
            executors = await self.db.execute(select(User).where(User.id.in_(executor_ids)))
            task.executors = list(executors.scalars().all())

        if access_ids:
            accesses = await self.db.execute(select(User).where(User.id.in_(access_ids)))
            task.accesses = list(accesses.scalars().all())

        self.db.add(task)
        await self.db.flush()
        await self.db.refresh(task, ["executors", "accesses"])

        return task

    async def get_by_id(self, task_id: int) -> TaskResponse:
        result = await self.db.execute(
            select(Task)
            .options(selectinload(Task.executors), selectinload(Task.accesses))
            .where(Task.id == task_id)
        )
        return result.scalar_one_or_none()

    async def get_all(
        self,
        filters: TaskFilter,
        sort: TaskSort,
        skip: int = 0,
        limit: int = 100,
    ) -> list[TaskResponse]:
        query = select(Task).options(selectinload(Task.executors), selectinload(Task.accesses))

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
        if filters.is_taken:
            query = query.where(Task.is_taken == filters.is_taken)
        if filters.search:
            search_pattern = f"%{filters.search}%"
            query = query.where(Task.name.ilike(search_pattern))
        if filters.executor_ids:
            query = query.join(Task.executors).where(User.id.in_(filters.executor_ids))
        if filters.access_ids:
            query = query.join(Task.accesses).where(User.id.in_(filters.access_ids))

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
        executor_ids = updated_task.pop("executor_ids", None)
        access_ids = updated_task.pop("access_ids", None)

        for field, value in updated_task.items():
            setattr(task, field, value)

        if executor_ids is not None:
            executors = await self.db.execute(select(User).where(User.id.in_(executor_ids)))
            task.executors = list(executors.scalars().all())

        if access_ids is not None:
            accesses = await self.db.execute(select(User).where(User.id.in_(access_ids)))
            task.accesses = list(accesses.scalars().all())

        await self.db.flush()
        await self.db.refresh(task, ["executors", "accesses"])
        return task

    async def delete(self, task_id: int) -> bool:
        task = await self.get_by_id(task_id)

        if not task:
            return False

        await self.db.delete(task)
        return True

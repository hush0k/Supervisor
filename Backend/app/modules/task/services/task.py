from typing import Optional

from sqlalchemy import select, asc, desc
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date

from app.modules.base_module.enums import TaskType, TaskStep, Role
from app.modules.task.model.task import Task
from app.modules.task.schemas.task import (
    TaskCreate,
    TaskResponse,
    TaskFilter,
    TaskSort,
    TaskUpdate,
)
from app.modules.task_operations.model.task_operation import (
    TaskOperation,
    accessed_users,
    executors,
)
from app.modules.users.models.user import User


class TaskService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, task_in: TaskCreate, company_id: int) -> TaskResponse:
        task_data = task_in.model_dump()

        task = Task(**task_data, company=company_id)    # type: ignore

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
        if filters.is_active is not None:
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

    async def take_task(
            self,
            task_id: int,
            user_id: int,
            executors_list: Optional[list[int]] = None
    ) -> Optional[TaskResponse]:
        task = await self.get_by_id(task_id)
        if not task or task.task_step != TaskStep.AVAILABLE:
            return None

        result = await self.db.execute(
            select(TaskOperation).where(TaskOperation.task_id == task_id)
        )
        task_operation = result.scalar_one_or_none()
        if not task_operation:
            return None
        # noinspection PyTypeChecker
        check = await self.db.execute(
            select(accessed_users).where(
                (accessed_users.c.task_id == task_operation.id)
                & (accessed_users.c.user_id == user_id)
            )
        )
        if not check.scalar_one_or_none():
            return None

        user = await self.db.get(User, user_id)
        if not user:
            return None

        if task.task_type == TaskType.GROUP and user.role != Role.HEAD:
            return None

        task.task_step = TaskStep.IN_PROGRESS
        task_operation.executors.append(user)

        if task.task_type == TaskType.GROUP:
            for executor_id in executors_list or []:
                executor = await self.db.get(User, executor_id)
                if executor:
                    task_operation.executors.append(executor)

        await self.db.flush()
        await self.db.refresh(task)
        await self.db.refresh(task_operation)
        return task


    async def complete_task(self, task_id: int, user_id: int) -> Optional[TaskResponse]:
        task = await self.get_by_id(task_id)
        if not task or task.task_step != TaskStep.IN_PROGRESS:
            return None

        result = await self.db.execute(
            select(TaskOperation).where(TaskOperation.task_id == task_id)
        )
        task_operation = result.scalar_one_or_none()
        if not task_operation:
            return None

        # noinspection PyTypeChecker
        check = await self.db.execute(
            select(executors).where(
                (executors.c.task_id == task_operation.id)
                & (executors.c.user_id == user_id)
            )
        )
        if not check.scalar_one_or_none():
            return None

        if task.task_type == TaskType.GROUP:
            user = await self.db.get(User, user_id)
            if not user or user.role != Role.HEAD:
                return None

        task.task_step = TaskStep.COMPLETED
        task.completed_at = date.today()

        await self.db.flush()
        await self.db.refresh(task)
        return task


    async def verify_task(self, task_id: int) -> Optional[bool]:
        task = await self.get_by_id(task_id)
        if not task or task.task_step != TaskStep.COMPLETED:
            return None

        task.task_step = TaskStep.VERIFIED
        task.verified_at = date.today()

        await self.db.flush()
        await self.db.refresh(task)
        return True

    async def reject_task(self, task_id: int) -> Optional[bool]:
        task = await self.get_by_id(task_id)
        if not task or task.task_step != TaskStep.COMPLETED:
            return None

        task.task_step = TaskStep.IN_PROGRESS
        task.completed_at = None

        await self.db.flush()
        await self.db.refresh(task)
        return False
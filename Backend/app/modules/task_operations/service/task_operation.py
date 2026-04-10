from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.task.model.task import Task
from app.modules.task_operations.model.task_operation import TaskOperation
from app.modules.task_operations.schema.task_operation import TaskOperationCreate, TaskOperationBase, \
    TaskOperationUpdate, TaskOperationResponse
from app.modules.users.models.user import User


class TaskOperationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, task_id: int, task_in: TaskOperationCreate) -> TaskOperationResponse:
        task = await self.db.scalar(select(Task).where(Task.id == task_id))
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Задание не найдено",
            )

        task_operation = TaskOperation(task_id=task_id)

        if task_in.accessed_users_ids:
            unique_ids = list(set(task_in.accessed_users_ids))
            result = await self.db.execute(
                select(User).where(
                    User.id.in_(unique_ids),
                    User.company_id == task.company_id,
                )
            )
            accessed_users_list = list(result.scalars().all())
            if len(accessed_users_list) != len(unique_ids):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Список допущенных сотрудников содержит некорректные id",
                )
            task_operation.accessed_users = accessed_users_list

        if task_in.executors_ids:
            unique_ids = list(set(task_in.executors_ids))
            result = await self.db.execute(
                select(User).where(
                    User.id.in_(unique_ids),
                    User.company_id == task.company_id,
                )
            )
            executors_list = list(result.scalars().all())
            if len(executors_list) != len(unique_ids):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Список исполнителей содержит некорректные id",
                )
            task_operation.executors = executors_list

        self.db.add(task_operation)
        await self.db.flush()
        await self.db.refresh(task_operation)
        return task_operation

    async def get_by_id(self, task_operation_id: int) -> TaskOperationResponse:
        result = await self.db.execute(
            select(TaskOperation).where(TaskOperation.id == task_operation_id)
        )
        return result.scalar_one_or_none()

    async def update(self, task_operation_id: int, task_in: TaskOperationUpdate) -> Optional[TaskOperationResponse]:
        task_operation = await self.get_by_id(task_operation_id)
        if not task_operation:
            return None

        for key, value in task_in.model_dump().items():
            setattr(task_operation, key, value)

        await self.db.flush()
        await self.db.refresh(task_operation)
        return task_operation

    async def delete(self, task_operation_id: int) -> bool:
        task_operation = await self.get_by_id(task_operation_id)
        if not task_operation:
            return False

        await self.db.delete(task_operation)
        await self.db.flush()
        return True


from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select, or_, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password, verify_password
from app.modules.base_module.enums import TaskStep
from app.modules.task.model.task import Task
from app.modules.task.schemas.task import TaskResponse
from app.modules.task_operations.model.task_operation import TaskOperation, executors
from app.modules.users.models.user import User
from app.modules.users.schemas.user import (
    UserCreate,
    UserUpdate,
    UserUpdatePassword,
    UserFilter,
    UserSort,
)


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_in: UserCreate) -> User:
        user = User(
            **user_in.model_dump(exclude={"password"}),
            hashed_password=hash_password(user_in.password),
        )

        existing_user = await self.db.execute(select(User).where(User.login == user.login))
        if existing_user.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Пользователь уже существует.")

        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def get_by_id(self, user_id: int) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_all(
        self, filters: UserFilter, sort: UserSort, skip: int = 0, limit: int = 100
    ) -> list[User]:

        query = select(User)

        if filters.role:
            query = query.where(User.role == filters.role)

        if filters.position_id:
            query = query.where(User.position_id == filters.position_id)

        if filters.max_salary is not None:
            query = query.where(User.salary <= filters.max_salary)

        if filters.min_salary is not None:
            query = query.where(User.salary >= filters.min_salary)

        if filters.search:
            search_pattern = f"%{filters.search}"
            query = query.where(
                or_(
                    User.first_name.ilike(search_pattern),
                    User.last_name.ilike(search_pattern),
                    User.login.ilike(search_pattern),
                )
            )

        order_func = desc if sort.order == "desc" else asc
        query = query.order_by(order_func(getattr(User, sort.field)))

        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())


    async def get_tasks_in_progress(self, user_id: int) -> Optional[list[TaskResponse]]:
        user = await self.get_by_id(user_id)
        if not user:
            return None

        # noinspection PyTypeChecker
        user_executing = await self.db.execute(
            select(Task)
            .join(TaskOperation, Task.id == TaskOperation.task_id)
            .join(executors, executors.c.task_id == TaskOperation.id)
            .where(
                (executors.c.user_id == user_id) &
                (Task.task_step == TaskStep.IN_PROGRESS)
            )
        )

        return list(user_executing.scalars().all())


    async def get_tasks_available(self, user_id: int) -> Optional[list[TaskResponse]]:
        user = await self.get_by_id(user_id)
        if not user:
            return None

        user_accessible = await self.db.execute(
            select(Task)
            .join(TaskOperation)
            .join(TaskOperation.accessed_users)
            .where(
                (User.id == user_id) &
                (Task.task_step == TaskStep.AVAILABLE)
            )
        )

        return list(user_accessible.scalars().all())


    async def get_tasks_completed(self, user_id: int) -> Optional[list[TaskResponse]]:
        user = await self.get_by_id(user_id)
        if not user:
            return None

        # noinspection PyTypeChecker
        user_completed = await self.db.execute(
            select(Task)
            .join(TaskOperation)
            .join(executors)
            .where(
                (executors.c.user_id == user_id) &
                (Task.task_step == TaskStep.COMPLETED)
            )
        )

        return list(user_completed.scalars().all())


    async def update(self, user_id, user_in: UserUpdate) -> Optional[User]:
        user = await self.get_by_id(user_id)
        if not user:
            return None

        update_data = user_in.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(user, field, value)

        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def update_password(
        self, user_id: int, passwords: UserUpdatePassword
    ) -> Optional[User]:
        user = await self.get_by_id(user_id)

        if not user:
            return None

        # noinspection PyTypeChecker
        if not verify_password(passwords.old_password, user.hashed_password):
            return None

        hashed_password = hash_password(passwords.new_password)
        user.hashed_password = hashed_password

        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def delete(self, user_id) -> bool:
        user = await self.get_by_id(user_id)

        if not user:
            return False

        await self.db.delete(user)
        return True

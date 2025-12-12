from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from Backend.app.core.security import hash_password, verify_password
from Backend.app.modules.users.models.user import User
from Backend.app.modules.users.shcemas.user import (
    UserCreate,
    UserUpdate,
    UserUpdatePassword,
)


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_in: UserCreate) -> User:
        user = User(
            **user_in.model_dump(exclude={"password"}),
            hashed_password=hash_password(user_in.password)
        )

        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def get_by_id(self, user_id: int) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_all(self, skip: int = 0, limit: int = 100) -> list[User]:
        result = await self.db.execute(select(User).offset(skip).limit(limit))
        return list(result.scalars().all())

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
    ) -> bool:
        user = await self.get_by_id(user_id)

        if not user:
            return False

        if not verify_password(passwords.old_password, passwords.new_password):
            return False

        hashed_password = hash_password(passwords.new_password)
        user.hashed_password = hashed_password

        await self.db.flush()
        await self.db.refresh(user)
        return True

    async def delete(self, user_id) -> bool:
        user = await self.get_by_id(user_id)

        if not user:
            return False

        await self.db.delete(user)
        return True

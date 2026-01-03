from typing import Annotated

from fastapi import Depends, status, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.modules.base_module.enums import Role
from app.modules.auth.service.auth import security, AuthService
from app.modules.users.models.user import User


async def get_current_user(
        credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
        db: Annotated[AsyncSession, Depends(get_db)]
):
    auth_service = AuthService(db)
    return await auth_service.get_current_user(credentials)


CurrentUser = Annotated[User, Depends(get_current_user)]

def require_role(*allowed_roles: Role):
    async def role_checker(current_user: CurrentUser) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Недостаточно прав для выполнения операции")
        return current_user

    return role_checker


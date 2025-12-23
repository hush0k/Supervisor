from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db

from app.modules.auth.service.auth import AuthService, security
from app.modules.auth.shemas.auth import Token, LoginRequest, RefreshRequest
from app.modules.users.services.user import UserService
from app.modules.users.shcemas.user import UserResponse

router = APIRouter(prefix="/auth", tags=["Auth"])


def get_auth_service(db: Annotated[AsyncSession, Depends(get_db)]) -> AuthService:
    return AuthService(db)


def get_user_service(db: Annotated[AsyncSession, Depends(get_db)]) -> UserService:
    return UserService(db)


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]
UserServiceDep = Annotated[UserService, Depends(get_user_service)]


@router.post("/login", response_model=Token)
async def login(credentials: LoginRequest, service: AuthServiceDep):
    user = await service.authenticate_user(credentials.login, credentials.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный логин или пароль",
        )

    access_token = service.create_access_token(user.id)
    refresh_token = service.create_refresh_token(user.id)

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_data: RefreshRequest, service: AuthServiceDep, user_service: UserServiceDep
):
    token_data = service.verify_token(refresh_data.refresh_token, "refresh")

    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Невалидный refresh токен",
        )

    user = await user_service.get_by_id(token_data.sub)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не найден",
        )

    access_token = service.create_access_token(user.id)
    new_refresh_token = service.create_refresh_token(user.id)

    return Token(
        access_token=access_token,
        refresh_token=new_refresh_token,
    )


@router.get("/me", response_model=UserResponse)
async def get_me(
    service: AuthServiceDep,
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
):
    return await service.get_current_user(credentials)

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy import select  # ← уже есть
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import hash_password  # ← добавь эту строку
from app.modules.auth.service.auth import AuthService, security
from app.modules.auth.schemas.auth import Token, LoginRequest, RefreshRequest, RegisterCompanyRequest
from app.modules.users.services.user import UserService
from app.modules.users.schemas.user import UserResponse
from app.modules.users.models.user import User  # ← добавь
from app.modules.company.model.company import Company  # ← добавь
from app.modules.base_module.enums import Role

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

    user = await user_service.get_by_id(int(token_data.sub))
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

@router.post("/register-company", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register_company(
        data: RegisterCompanyRequest,
        service: AuthServiceDep,
        db: Annotated[AsyncSession, Depends(get_db)]
):
    # 1. Проверка логина
    existing = await db.execute(select(User).where(User.login == data.login))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Логин уже занят"
        )

    # 2. Создать владельца БЕЗ company_id
    user = User(
        login=data.login,
        hashed_password=hash_password(data.password),
        first_name=data.first_name,
        last_name=data.last_name,
        date_of_birth=data.date_of_birth,
        salary=data.salary,
        role=Role.SUPERVISOR,
        company_id=None,
        position_id=None
    )
    db.add(user)
    await db.flush()  # получить user.id

    # 3. Создать компанию с owner_id = user.id
    company = Company(
        owner_id=user.id,  # ← теперь user.id существует
        name=data.company_name,
        description=data.company_description,
        date_established=data.date_established,
    )
    db.add(company)
    await db.flush()

    # 4. Обновить company_id у юзера
    user.company_id = company.id
    await db.flush()

    # 5. Коммит
    await db.commit()
    await db.refresh(user)

    # 6. Токены
    access_token = service.create_access_token(user.id)
    refresh_tokens = service.create_refresh_token(user.id)

    return Token(
        access_token=access_token,
        refresh_token=refresh_tokens,
    )

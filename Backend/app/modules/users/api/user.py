from typing import List, Optional, Literal, Annotated

from fastapi import APIRouter, Depends, status as http_status, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.modules.base_module.enums import Role
from app.modules.users.services.user import UserService
from app.modules.users.schemas.user import (
    UserResponse,
    UserCreate,
    UserFilter,
    UserSort,
    UserUpdate,
    UserUpdatePassword,
)

router = APIRouter(prefix="/user", tags=["User"])


def get_user_service(db: Annotated[AsyncSession, Depends(get_db)]) -> UserService:
    return UserService(db)


ServiceDep = Annotated[UserService, Depends(get_user_service)]


@router.post(
    "/create", response_model=UserResponse, status_code=http_status.HTTP_201_CREATED
)
async def create_user_endpoint(
    user_in: UserCreate, service: ServiceDep
) -> UserResponse:
    return await service.create(user_in)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, service: ServiceDep) -> UserResponse:
    user = await service.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND, detail="Пользователь не найден"
        )
    return user


@router.get("/", response_model=List[UserResponse])
async def get_all_users(
    service: ServiceDep,
    role: Optional[Role] = None,
    position_id: Optional[int] = None,
    min_salary: Optional[int] = None,
    max_salary: Optional[int] = None,
    search: Optional[str] = None,
    sort_field: Literal[
        "id", "login", "first_name", "last_name", "salary", "created_at"
    ] = Query("id"),
    sort_order: Literal["asc", "desc"] = Query("asc"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
) -> List[UserResponse]:
    filters = UserFilter(
        role=role,
        position_id=position_id,
        min_salary=min_salary,
        max_salary=max_salary,
        search=search,
    )

    sort = UserSort(field=sort_field, order=sort_order)

    return await service.get_all(filters=filters, sort=sort, skip=skip, limit=limit)


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int, user_in: UserUpdate, service: ServiceDep
) -> UserResponse:
    user = await service.update(user_id, user_in)
    if not user:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND, detail="Пользователь не найден"
        )

    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_password(
    user_id: int, password: UserUpdatePassword, service: ServiceDep
) -> UserResponse:
    user = await service.update_password(user_id, password)

    if not user:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail="Неверный старый пароль или пользователь не найден",
        )

    return user


@router.delete("/{user_id}", status_code=http_status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int, service: ServiceDep):
    success = await service.delete(user_id)
    if not success:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND, detail="Пользователь не найден"
        )

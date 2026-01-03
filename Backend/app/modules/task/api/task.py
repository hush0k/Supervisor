from datetime import date
from typing import Annotated, List, Optional, Literal

from fastapi import APIRouter, Depends, status, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.modules.base_module.dependencies import require_role
from app.modules.base_module.enums import Role, TaskType, City
from app.modules.task.schemas.task import (
    TaskResponse,
    TaskCreate,
    TaskSort,
    TaskFilter,
    TaskUpdate,
)
from app.modules.task.services.task import TaskService
from app.modules.users.models.user import User

router = APIRouter(prefix="/task", tags=["Task"])


def get_task_service(db: Annotated[AsyncSession, Depends(get_db)]):
    return TaskService(db)


ServiceDep = Annotated[TaskService, Depends(get_task_service)]


@router.post(
    "/create", response_model=TaskResponse, status_code=status.HTTP_201_CREATED
)
async def create_task(
    task_in: TaskCreate,
    service: ServiceDep,
    _current_user: Annotated[User, Depends(require_role(Role.ADMIN, Role.SUPERVISOR))],
) -> TaskResponse:
    return await service.create(task_in)


@router.get("/", response_model=List[TaskResponse])
async def get_all_tasks(
    service: ServiceDep,
    deadline: Optional[date] = None,
    is_active: Optional[bool] = None,
    task_type: Optional[TaskType] = None,
    min_duration: Optional[int] = None,
    max_duration: Optional[int] = None,
    min_payment: Optional[int] = None,
    max_payment: Optional[int] = None,
    city: Optional[City] = None,
    is_taken: Optional[bool] = None,
    search: Optional[str] = None,
    executor_ids: Optional[List[int]] = None,
    access_ids: Optional[List[int]] = None,
    sort_field: Literal[
        "id",
        "name",
        "deadline",
        "is_active",
        "task_type",
        "city",
        "is_taken",
        "executors",
        "accesses",
    ] = "deadline",
    sort_order: Literal["asc", "desc"] = "asc",
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
) -> List[TaskResponse]:
    filters = TaskFilter(
        deadline=deadline,
        is_active=is_active,
        task_type=task_type,
        min_duration=min_duration,
        max_duration=max_duration,
        min_payment=min_payment,
        max_payment=max_payment,
        city=city,
        is_taken=is_taken,
        search=search,
        executor_ids=executor_ids or [],
        access_ids=access_ids or [],
    )

    sort = TaskSort(field=sort_field, order=sort_order)

    return await service.get_all(filters=filters, sort=sort, skip=skip, limit=limit)


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: int, service: ServiceDep) -> TaskResponse:
    task = await service.get_by_id(task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Задание не найдено"
        )

    return task


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_in: TaskUpdate,
    service: ServiceDep,
    _current_user: Annotated[User, Depends(require_role(Role.ADMIN, Role.SUPERVISOR))],
) -> TaskResponse:
    task = await service.get_by_id(task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Задание не найдено"
        )

    task = await service.update(task_id, task_in)

    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(task_id: int, service: ServiceDep):
    success = await service.get_by_id(task_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Задание не найдено"
        )

    await service.delete(task_id)

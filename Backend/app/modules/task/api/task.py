from datetime import date
from typing import Annotated, List, Optional, Literal

from fastapi import APIRouter, Depends, status, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql.functions import current_user

from app.core.db import get_db
from app.modules.base_module.dependencies import require_role, get_current_user
from app.modules.base_module.enums import Role, TaskType, City, TaskStep
from app.modules.task.schemas.task import (
    TaskResponse,
    TaskCreate,
    TaskSort,
    TaskFilter,
    TaskUpdate, TakeTaskRequest
)
from app.modules.task.services.task import TaskService
from app.modules.task_operations.schema.task_operation import TaskOperationCreate
from app.modules.task_operations.service.task_operation import TaskOperationService
from app.modules.users.models.user import User

router = APIRouter(prefix="/task", tags=["Task"])


def get_task_service(db: Annotated[AsyncSession, Depends(get_db)]):
    return TaskService(db)

def get_task_operation_service(db: Annotated[AsyncSession, Depends(get_db)]):
    return TaskOperationService(db)


ServiceDep = Annotated[TaskService, Depends(get_task_service)]
ServiceOperationDep = Annotated[TaskOperationService, Depends(get_task_operation_service)]


@router.post(
    "/create", response_model=TaskResponse, status_code=status.HTTP_201_CREATED
)
async def create_task(
    task_in: TaskCreate,
    current_user_id: Annotated[User, Depends(get_current_user)],
    task_operation_in: TaskOperationCreate,
    service: ServiceDep,
    operation_service:  ServiceOperationDep,
    _current_user_req: Annotated[User, Depends(require_role(Role.ADMIN, Role.SUPERVISOR))],
) -> TaskResponse:
    task = await service.create(task_in, current_user_id.company_id)    # type: ignore
    await operation_service.create(task.id, task_operation_in)
    return task



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
    task_step: Optional[TaskStep] = None,
    search: Optional[str] = None,
    sort_field: Literal[
        "id",
        "name",
        "deadline",
        "is_active",
        "task_type",
        "city",
        "task_step",
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
        task_step=task_step,
        search=search,
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


@router.post("/task/{task_id}/take", response_model=TaskResponse)
async def take_task_endpoint(
        service: ServiceDep,
        task_id: int,
        current_user: Annotated[User, Depends(get_current_user)],
        body: TakeTaskRequest,
) -> Optional[TaskResponse]:
    user_id = current_user.id
    task = await service.take_task(task_id, user_id, body.executors_ids) # type: ignore

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Задание невозможно взять"
        )

    return task


@router.post("/task/{task_id}/complete", response_model=TaskResponse)
async def complete_task_endpoint(
    task_id: int,
    service: ServiceDep,
    current_user: Annotated[User, Depends(get_current_user)],
) -> TaskResponse:
    user_id = current_user.id
    task = await service.complete_task(task_id, user_id)   # type: ignore

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Задание невозможно завершить"
        )

    return task

@router.post("/task/{task_id}/verify")
async def verify_task_endpoint(
        task_id: int,
        service: ServiceDep,
        _current_user: Annotated[User, Depends(require_role(Role.ADMIN, Role.SUPERVISOR))],
) -> bool:
    success = await service.verify_task(task_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Задание невозможно проверить"
        )

    return success


@router.post("/task/{task_id}/reject")
async def reject_task_endpoint(
        task_id: int,
        service: ServiceDep,
        _current_user: Annotated[User, Depends(require_role(Role.ADMIN, Role.SUPERVISOR))],
) -> bool:
    success = await service.reject_task(task_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Задание невозможно отклонить"
        )

    return success




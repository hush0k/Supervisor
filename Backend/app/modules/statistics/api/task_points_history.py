from typing import Annotated

from fastapi import Depends, APIRouter
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status

from app.core.db import get_db
from app.modules.statistics.schemas.task_points_history import TaskPointsHistoryCreate, TaskPointsHistoryResponse
from app.modules.statistics.services.task_points_history import TaskPointsHistoryService


def task_points_history_service(db: Annotated[AsyncSession, Depends(get_db)]) -> TaskPointsHistoryService:
    return TaskPointsHistoryService(db)

ServiceDep = Annotated[TaskPointsHistoryService, Depends(task_points_history_service)]

router = APIRouter(prefix="/task_points_history", tags=["Task Points History"])

@router.get("/all")
async def get_task_points_history(service: ServiceDep) -> list[TaskPointsHistoryResponse]:
    return await service.get_all()

@router.get("/task/{task_id}")
async def get_task_points_history_by_task(task_id: int, service: ServiceDep) -> TaskPointsHistoryResponse:
    return await service.get_by_task_id(task_id)

@router.get("/user/{user_id}")
async def get_task_points_history_by_user(user_id: int, service: ServiceDep) -> list[TaskPointsHistoryResponse]:
    return await service.get_by_user_id(user_id)

@router.get("/{task_history_id}")
async def get_task_points_history_by_id(task_history_id: int, service: ServiceDep) -> TaskPointsHistoryResponse:
    return await service.get_by_id(task_history_id)



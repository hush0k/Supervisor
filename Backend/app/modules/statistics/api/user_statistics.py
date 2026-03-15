from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.modules.base_module.enums import PeriodType
from app.modules.statistics.schemas.user import UserStatisticsResponse, UserDashboard
from app.modules.statistics.services.user_statistics import UserStatisticsService
from app.modules.users.services.user import UserService

router = APIRouter(prefix="/statistics", tags=["Statistics"])

def get_statistics_service(db: Annotated[AsyncSession, Depends(get_db)]) -> UserStatisticsService:
    return UserStatisticsService(db)



ServiceDep = Annotated[UserStatisticsService, Depends(get_statistics_service)]


@router.get("/statistics/{user_id}")
async def calc_statistics(user_id: int, period_type: PeriodType, service: ServiceDep) -> UserStatisticsResponse:
    return await service.calculate_statistics(user_id, period_type)

@router.get("/dashboard/{user_id}")
async def dashboard_statistics(user_id: int, period_type: PeriodType, service: ServiceDep) -> UserDashboard:
    return await service.get_dashboard(user_id, period_type)
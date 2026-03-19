from datetime import date
from typing import Literal, Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.modules.statistics.schemas.leaderbord import LeaderBoardEntity
from app.modules.statistics.services.user_statistics import UserStatisticsService

router = APIRouter(prefix="/company_statistics", tags=["Company Statistics"])

def get_statistics_service(db: Annotated[AsyncSession, Depends(get_db)]) -> UserStatisticsService:
    return UserStatisticsService(db)



UserServiceDep = Annotated[UserStatisticsService, Depends(get_statistics_service)]



@router.get("/leaderboard/{company_id}")
async def get_leaderboard(
        company_id: int,
        service: UserServiceDep,
        sort_field: Literal["total_points", "success_rate"] = "total_points",
        sort_order: Literal["asc", "desc"] = "desc",
        min_success_rate: float = 0.0,
        position_id: int | None = None,
        limit: int | None = None,
) -> list[LeaderBoardEntity]:
    return await service.get_leaderboard(
        company_id,  sort_field, sort_order, min_success_rate, position_id, limit
    )
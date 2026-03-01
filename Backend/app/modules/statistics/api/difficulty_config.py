from typing import Annotated

from fastapi import APIRouter, status
from fastapi.params import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.modules.base_module.dependencies import get_current_user, require_role
from app.modules.base_module.enums import Role
from app.modules.statistics.schemas.difficulty_config import (
    DifficultyConfigResponse,
    DifficultyConfigCreate,
    DifficultyConfigUpdate,
)
from app.modules.statistics.services.difficulty_config import DifficultyConfigService
from app.modules.users.models.user import User


def get_config_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> DifficultyConfigService:
    return DifficultyConfigService(db)


ServiceDep = Annotated[DifficultyConfigService, Depends(get_config_service)]

router = APIRouter(prefix="/difficulty-config", tags=["DifficultyConfig"])


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_difficulty_config(
    service: ServiceDep,
    config_in: DifficultyConfigCreate,
    current_user: Annotated[User, Depends(require_role(Role.ADMIN, Role.SUPERVISOR))],
) -> DifficultyConfigResponse:
    company_id = current_user.company_id
    return await service.create(config_in, company_id)  # type: ignore


@router.patch("/", status_code=status.HTTP_200_OK)
async def update_difficulty_config(
    service: ServiceDep,
    config_in: DifficultyConfigUpdate,
    current_user: Annotated[User, Depends(require_role(Role.ADMIN, Role.SUPERVISOR))],
) -> DifficultyConfigResponse:
    company_id = current_user.company_id
    return await service.update(config_in, company_id)  # type: ignore


@router.get("/", status_code=status.HTTP_200_OK)
async def get_difficulty_config(
    service: ServiceDep, current_user: Annotated[User, Depends(get_current_user)]
) -> DifficultyConfigResponse:
    company_id = current_user.company_id
    return await service.get_by_company_id(company_id)  # type: ignore

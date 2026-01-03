from typing import Annotated

from fastapi import APIRouter, Depends, status as http_status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.modules.base_module.dependencies import require_role
from app.modules.base_module.enums import Role
from app.modules.users.models.user import User
from app.modules.users.services.position import PositionServices
from app.modules.users.schemas.position import PositionResponse, PositionCreate

router = APIRouter(prefix="/position", tags=["Position"])


def get_position_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PositionServices:
    return PositionServices(db)


ServiceDep = Annotated[PositionServices, Depends(get_position_service)]


@router.post(
    "/create", response_model=PositionResponse, status_code=http_status.HTTP_201_CREATED
)
async def create_position(
        pos_in: PositionCreate,
        service: ServiceDep,
        _current_user: Annotated[User, Depends(require_role(Role.ADMIN, Role.SUPERVISOR))]
):
    return await service.create(pos_in)


@router.get("/{pos_id}", response_model=PositionResponse)
async def get_pos_by_id(pos_id: int, service: ServiceDep):
    pos = await service.get_by_id(pos_id)
    if not pos:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND, detail="Позиция не найдена"
        )

    return pos


@router.get("/", response_model=list[PositionResponse])
async def get_all_pos(service: ServiceDep):
    return await service.get_all()

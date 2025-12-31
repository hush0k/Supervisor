from typing import Annotated, List, Optional, Literal

from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.dependencies import require_role
from app.core.enums import Role
from app.modules.company.schemas.company import (
    CompanyCreate,
    CompanyResponse,
    CompanySort,
    CompanyFilter,
    CompanyUpdate,
)
from app.modules.company.service.company import CompanyService
from app.modules.users.models.user import User

router = APIRouter(prefix="/company", tags=["Company"])


def get_company_service(db: Annotated[AsyncSession, Depends(get_db)]) -> CompanyService:
    return CompanyService(db)


ServiceDep = Annotated[CompanyService, Depends(get_company_service)]


@router.post(
    "/create", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED
)
async def create_company(
    company_in: CompanyCreate,
    service: ServiceDep,
    _current_user: Annotated[User, Depends(require_role(Role.ADMIN, Role.SUPERVISOR))],
) -> CompanyResponse:
    return await service.create(company_in)


@router.get("/", response_model=List[CompanyResponse])
async def get_all_companies(
    service: ServiceDep,
    search: Optional[str] = None,
    sort_field: Literal["id", "name", "date_established"] = Query("name"),
    sort_order: Literal["asc", "desc"] = Query("asc"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
) -> List[CompanyResponse]:
    filters = CompanyFilter(
        search=search,
    )

    sort = CompanySort(field=sort_field, order=sort_order)

    return await service.get_all(filters=filters, sort=sort, skip=skip, limit=limit)


@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(company_id: int, service: ServiceDep) -> CompanyResponse:
    company = await service.get_by_id(company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Компания не найдено"
        )

    return company


@router.patch("/{company_id}", response_model=CompanyResponse)
async def update_company(
    company_in: CompanyUpdate,
    company_id: int,
    service: ServiceDep,
    _current_user: Annotated[User, Depends(require_role(Role.ADMIN, Role.SUPERVISOR))],
) -> CompanyResponse:
    company = await service.update(company_in, company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Компания не найдено"
        )

    return company


@router.delete("/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_company(
    company_id: int,
    service: ServiceDep,
    _current_user: Annotated[User, Depends(require_role(Role.ADMIN, Role.SUPERVISOR))],
):
    success = await service.delete(company_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Компания не найдено"
        )

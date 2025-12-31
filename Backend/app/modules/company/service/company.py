from typing import Optional

from sqlalchemy import select, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.company.model.company import Company
from app.modules.company.schemas.company import (
    CompanyCreate,
    CompanyFilter,
    CompanySort,
    CompanyUpdate,
)


class CompanyService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, company_in: CompanyCreate) -> Company:
        company = Company(**company_in.model_dump())

        self.db.add(company)
        await self.db.flush()
        await self.db.refresh(company)
        return company

    async def get_by_id(self, company_id: int) -> Company:
        result = await self.db.execute(select(Company).where(Company.id == company_id))
        return result.scalar_one_or_none()

    async def get_all(
        self, filters: CompanyFilter, sort: CompanySort, skip: int = 0, limit: int = 100
    ) -> list[Company]:
        query = select(Company)

        if filters.search:
            search_pattern = f"%{filters.search}%"
            query = query.where(Company.name.ilike(search_pattern))

        order_func = desc if sort.order == "desc" else asc
        query = query.order_by(order_func(getattr(Company, sort.field)))

        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def update(
        self, company_in: CompanyUpdate, company_id: int
    ) -> Optional[Company]:
        company = await self.get_by_id(company_id)
        if not company:
            return None

        update_data = company_in.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(company, field, value)

        await self.db.flush()
        await self.db.refresh(company)
        return company

    async def delete(self, company_id: int) -> bool:
        company = await self.get_by_id(company_id)

        if not company:
            return False

        await self.db.delete(company)
        return True

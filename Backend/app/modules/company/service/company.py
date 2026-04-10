from datetime import date
from typing import Optional

from sqlalchemy import select, desc, asc, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.base_module.enums import TaskStep
from app.modules.company.model.company import Company
from app.modules.company.schemas.company import (
    CompanyCreate,
    CompanyFilter,
    CompanyMonthlyTaskStat,
    CompanyOverviewResponse,
    CompanyPositionStat,
    CompanyRoleStat,
    CompanySort,
    CompanyUpdate,
)
from app.modules.task.model.task import Task
from app.modules.users.models.position import Position
from app.modules.users.models.user import User


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

    async def get_my_company_overview(self, user_id: int) -> Optional[CompanyOverviewResponse]:
        user_result = await self.db.execute(select(User).where(User.id == user_id))
        user = user_result.scalar_one_or_none()
        if not user or not user.company_id:
            return None

        company = await self.get_by_id(user.company_id)
        if not company:
            return None

        employees_stats = await self.db.execute(
            select(
                func.count(User.id).label("employees_count"),
                func.coalesce(func.avg(User.salary), 0.0).label("avg_salary"),
                func.coalesce(func.sum(User.salary), 0).label("total_salary"),
                func.coalesce(func.sum(User.bonus), 0).label("total_bonus"),
            ).where(
                User.company_id == company.id,
                User.id != company.owner_id,
            )
        )
        e = employees_stats.one()

        tasks_stats = await self.db.execute(
            select(
                func.count(Task.id).label("tasks_total"),
                func.count(Task.id).filter(Task.task_step == TaskStep.AVAILABLE).label("tasks_available"),
                func.count(Task.id).filter(Task.task_step == TaskStep.IN_PROGRESS).label("tasks_in_progress"),
                func.count(Task.id).filter(Task.task_step == TaskStep.COMPLETED).label("tasks_completed"),
                func.count(Task.id).filter(Task.task_step == TaskStep.VERIFIED).label("tasks_verified"),
                func.count(Task.id).filter(Task.task_step == TaskStep.FAILED).label("tasks_failed"),
            ).where(Task.company_id == company.id)
        )
        t = tasks_stats.one()

        success_denominator = (t.tasks_verified or 0) + (t.tasks_failed or 0)
        success_rate = (t.tasks_verified / success_denominator * 100) if success_denominator > 0 else 0.0

        role_distribution_result = await self.db.execute(
            select(User.role, func.count(User.id))
            .where(
                User.company_id == company.id,
                User.id != company.owner_id,
            )
            .group_by(User.role)
            .order_by(desc(func.count(User.id)))
        )
        role_distribution = [
            CompanyRoleStat(role=row[0], count=row[1])
            for row in role_distribution_result.all()
        ]

        position_distribution_result = await self.db.execute(
            select(Position.name, func.count(User.id))
            .join(User, User.position_id == Position.id)
            .where(
                User.company_id == company.id,
                User.id != company.owner_id,
            )
            .group_by(Position.name)
            .order_by(desc(func.count(User.id)))
        )
        position_distribution = [
            CompanyPositionStat(position_name=row[0], count=row[1])
            for row in position_distribution_result.all()
        ]

        monthly_start = date.today().replace(day=1)
        if monthly_start.month > 6:
            monthly_start = monthly_start.replace(month=monthly_start.month - 5)
        else:
            monthly_start = monthly_start.replace(year=monthly_start.year - 1, month=monthly_start.month + 7)

        monthly_stats_result = await self.db.execute(
            select(
                func.extract("year", Task.completed_at).label("year"),
                func.extract("month", Task.completed_at).label("month"),
                func.count(Task.id).filter(Task.task_step == TaskStep.VERIFIED).label("verified"),
                func.count(Task.id).filter(Task.task_step == TaskStep.FAILED).label("failed"),
                func.count(Task.id).filter(Task.task_step == TaskStep.COMPLETED).label("completed"),
            )
            .where(
                Task.company_id == company.id,
                Task.completed_at.is_not(None),
                Task.completed_at >= monthly_start,
            )
            .group_by(
                func.extract("year", Task.completed_at),
                func.extract("month", Task.completed_at),
            )
            .order_by(
                func.extract("year", Task.completed_at),
                func.extract("month", Task.completed_at),
            )
        )

        monthly_task_stats = [
            CompanyMonthlyTaskStat(
                month=f"{int(row.year):04d}-{int(row.month):02d}",
                verified=row.verified or 0,
                failed=row.failed or 0,
                completed=row.completed or 0,
            )
            for row in monthly_stats_result.all()
        ]

        return CompanyOverviewResponse(
            company=company,
            employees_count=e.employees_count or 0,
            avg_salary=float(e.avg_salary or 0.0),
            total_salary=e.total_salary or 0,
            total_bonus=e.total_bonus or 0,
            tasks_total=t.tasks_total or 0,
            tasks_available=t.tasks_available or 0,
            tasks_in_progress=t.tasks_in_progress or 0,
            tasks_completed=t.tasks_completed or 0,
            tasks_verified=t.tasks_verified or 0,
            tasks_failed=t.tasks_failed or 0,
            success_rate=success_rate,
            role_distribution=role_distribution,
            position_distribution=position_distribution,
            monthly_task_stats=monthly_task_stats,
        )

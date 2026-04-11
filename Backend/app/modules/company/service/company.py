from datetime import date, timedelta
from typing import Optional

from sqlalchemy import select, desc, asc, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.base_module.enums import TaskStep
from app.modules.company.model.company import Company
from app.modules.company.schemas.company import (
    CompanyCreate,
    CompanyFilter,
    CompanyMonthlyCompensationStat,
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

    @staticmethod
    def _month_start(value: date) -> date:
        return value.replace(day=1)

    @staticmethod
    def _next_month(value: date) -> date:
        if value.month == 12:
            return value.replace(year=value.year + 1, month=1, day=1)
        return value.replace(month=value.month + 1, day=1)

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

    async def get_my_company_overview(self, user_id: int, days: int = 30) -> Optional[CompanyOverviewResponse]:
        user_result = await self.db.execute(select(User).where(User.id == user_id))
        user = user_result.scalar_one_or_none()
        if not user or not user.company_id:
            return None

        company = await self.get_by_id(user.company_id)
        if not company:
            return None

        period_start = date.today() - timedelta(days=days)

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

        # All-time current state
        tasks_stats = await self.db.execute(
            select(
                func.count(Task.id).label("tasks_total"),
                func.count(Task.id).filter(Task.task_step == TaskStep.AVAILABLE).label("tasks_available"),
                func.count(Task.id).filter(Task.task_step == TaskStep.IN_PROGRESS).label("tasks_in_progress"),
            ).where(Task.company_id == company.id)
        )
        t = tasks_stats.one()

        # Period-filtered completions
        period_tasks = await self.db.execute(
            select(
                func.count(Task.id).filter(Task.task_step == TaskStep.COMPLETED).label("tasks_completed"),
                func.count(Task.id).filter(Task.task_step == TaskStep.VERIFIED).label("tasks_verified"),
                func.count(Task.id).filter(Task.task_step == TaskStep.FAILED).label("tasks_failed"),
            ).where(
                Task.company_id == company.id,
                Task.completed_at >= period_start,
            )
        )
        pt = period_tasks.one()

        success_denominator = (pt.tasks_verified or 0) + (pt.tasks_failed or 0)
        success_rate = (pt.tasks_verified / success_denominator * 100) if success_denominator > 0 else 0.0

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

        monthly_start = date.today() - timedelta(days=days)

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

        company_start_month = self._month_start(company.date_established)
        user_start_month = self._month_start(user.created_at.date()) if user.created_at else company_start_month
        visible_start_month = max(company_start_month, user_start_month)
        current_month = self._month_start(date.today())

        bonuses_result = await self.db.execute(
            select(
                func.extract("year", Task.verified_at).label("year"),
                func.extract("month", Task.verified_at).label("month"),
                func.coalesce(func.sum(Task.payment), 0).label("bonus_paid"),
            )
            .where(
                Task.company_id == company.id,
                Task.task_step == TaskStep.VERIFIED,
                Task.verified_at.is_not(None),
                Task.verified_at >= visible_start_month,
            )
            .group_by(
                func.extract("year", Task.verified_at),
                func.extract("month", Task.verified_at),
            )
        )
        bonuses_by_month = {
            (int(row.year), int(row.month)): int(row.bonus_paid or 0)
            for row in bonuses_result.all()
        }

        employees_result = await self.db.execute(
            select(User.salary, User.created_at).where(
                User.company_id == company.id,
                User.id != company.owner_id,
            )
        )
        employees_rows = employees_result.all()

        monthly_compensation_stats: list[CompanyMonthlyCompensationStat] = []
        month_cursor = visible_start_month
        while month_cursor <= current_month:
            month_end = self._next_month(month_cursor) - timedelta(days=1)
            active_salaries = [
                int(row.salary or 0)
                for row in employees_rows
                if row.created_at and row.created_at.date() <= month_end
            ]
            employees_count = len(active_salaries)
            payroll_fund = sum(active_salaries)
            avg_salary = float(payroll_fund / employees_count) if employees_count > 0 else 0.0
            bonus_paid = bonuses_by_month.get((month_cursor.year, month_cursor.month), 0)

            monthly_compensation_stats.append(
                CompanyMonthlyCompensationStat(
                    month=f"{month_cursor.year:04d}-{month_cursor.month:02d}",
                    employees_count=employees_count,
                    payroll_fund=payroll_fund,
                    avg_salary=avg_salary,
                    bonus_paid=bonus_paid,
                )
            )

            month_cursor = self._next_month(month_cursor)

        return CompanyOverviewResponse(
            company=company,
            employees_count=e.employees_count or 0,
            avg_salary=float(e.avg_salary or 0.0),
            total_salary=e.total_salary or 0,
            total_bonus=e.total_bonus or 0,
            tasks_total=t.tasks_total or 0,
            tasks_available=t.tasks_available or 0,
            tasks_in_progress=t.tasks_in_progress or 0,
            tasks_completed=pt.tasks_completed or 0,
            tasks_verified=pt.tasks_verified or 0,
            tasks_failed=pt.tasks_failed or 0,
            success_rate=success_rate,
            role_distribution=role_distribution,
            position_distribution=position_distribution,
            monthly_task_stats=monthly_task_stats,
            monthly_compensation_stats=monthly_compensation_stats,
        )

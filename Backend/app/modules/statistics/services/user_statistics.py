from datetime import date, timedelta
from typing import Literal

from sqlalchemy import select, func
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.base_module.enums import TaskStep, PeriodType, Role, TaskType
from app.modules.company.model.company import Company
from app.modules.statistics.models.task_point_history import TaskPointHistory
from app.modules.statistics.models.user_statistic import UserStatistic
from app.modules.statistics.schemas.chart import ChartPoint
from app.modules.statistics.schemas.leaderbord import LeaderBoardEntity
from app.modules.statistics.schemas.user import UserStatisticsResponse, UserDashboard
from app.modules.task.model.task import Task
from app.modules.task_operations.model.task_operation import TaskOperation, executors, accessed_users
from app.modules.users.models.user import User


class UserStatisticsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    @staticmethod
    def get_period_start(period_type: PeriodType):
        today = date.today()
        if period_type == PeriodType.DAY:
            return today
        elif period_type == PeriodType.WEEK:
            return today - timedelta(days=7)
        elif period_type == PeriodType.MONTH:
            return today.replace(day=1)
        elif period_type == PeriodType.SIX_MONTH:
            return (today.replace(day=1) - timedelta(days=150)).replace(day=1)
        elif period_type == PeriodType.YEAR:
            return today.replace(month=1, day=1)  
        return None

    async def calculate_statistics(self, user_id: int, period_type: PeriodType) -> UserStatisticsResponse:
        user = await self.db.get(User, user_id)
        if not user:
            raise ValueError("User not found")

        period_start = self.get_period_start(period_type)

        base_executors = [executors.c.user_id == user.id]
        if period_start:
            base_executors.append(Task.completed_at >= period_start) #type: ignore

        task_stats = await self.db.execute(
            select(
                func.count(Task.id).filter(
                    Task.task_step == TaskStep.COMPLETED
                ).label("completed"),

                func.count(Task.id).filter(
                    Task.task_step == TaskStep.VERIFIED
                ).label("verified"),

                func.count(Task.id).filter(
                    Task.task_step == TaskStep.FAILED
                ).label("failed"),

                func.count(Task.id).filter(
                    Task.task_step == TaskStep.VERIFIED,
                    Task.deadline >= Task.completed_at
                ).label("before_deadline"),

                func.count(Task.id).filter(
                    Task.task_step == TaskStep.VERIFIED,
                    Task.deadline < Task.completed_at
                ).label("after_deadline"),

                func.coalesce(func.avg(
                    func.extract('epoch', Task.completed_at - Task.created_at) / 86400
                ).filter(Task.task_step == TaskStep.VERIFIED), 0.0).label("avg_days"),

                func.coalesce(func.sum(Task.payment).filter(
                    Task.task_step == TaskStep.VERIFIED
                ), 0).label("profit"),

                func.coalesce(func.avg(Task.payment).filter(
                    Task.task_step == TaskStep.VERIFIED
                ), 0.0).label("avg_payment"),
            )
            .join(TaskOperation, TaskOperation.task_id == Task.id)
            .join(executors, executors.c.task_id == TaskOperation.id) #type: ignore
            .where(*base_executors)
        )
        s = task_stats.one()

        points_query = select(func.coalesce(func.sum(TaskPointHistory.points), 0)).where(
            TaskPointHistory.user_id == user.id
        )
        if period_start:
            points_query = points_query.where(TaskPointHistory.period_date >= period_start)
        total_points = await self.db.scalar(points_query)

        count_of_tasks_as_head = 0
        avg_size_of_group = 0.0
        percent_of_success_as_head = 0.0

        if user.role == Role.HEAD:
            head_stats = await self.db.execute(
                select(
                    func.count(Task.id).filter(
                        Task.task_type == TaskType.GROUP
                    ).label("group_total"),

                    func.count(Task.id).filter(
                        Task.task_type == TaskType.GROUP,
                        Task.task_step == TaskStep.VERIFIED
                    ).label("group_verified"),

                    func.count(Task.id).filter(
                        Task.task_type == TaskType.GROUP,
                        Task.task_step == TaskStep.FAILED
                    ).label("group_failed"),
                )
                .join(TaskOperation, TaskOperation.task_id == Task.id)
                .join(executors, executors.c.task_id == TaskOperation.id) #type: ignore
                .where(*base_executors)
            )
            hs = head_stats.one()

            team_size_subq = (
                select(func.count(executors.c.user_id).label("size"))
                .join(Task, Task.id == TaskOperation.task_id)
                .join(executors, executors.c.task_id == TaskOperation.id) #type: ignore
                .where(*base_executors, Task.task_type == TaskType.GROUP)
                .group_by(TaskOperation.id)
                .subquery()
            )
            avg_size_of_group = await self.db.scalar(
                select(func.coalesce(func.avg(team_size_subq.c.size), 0.0))
            ) or 0.0

            count_of_tasks_as_head = hs.group_total or 0
            total_group = (hs.group_verified or 0) + (hs.group_failed or 0)
            percent_of_success_as_head = (hs.group_verified / total_group * 100) if total_group > 0 else 0.0

        total = (s.verified or 0) + (s.failed or 0)
        percent_of_success = (s.verified / total * 100) if total > 0 else 0.0

        stmt = insert(UserStatistic).values(
            user_id=user.id,
            period_type=period_type,
            period_date=date.today(),
            count_of_completed_tasks=s.completed or 0,
            count_of_verified_tasks=s.verified or 0,
            count_of_failed_tasks=s.failed or 0,
            total_points=total_points or 0,
            completed_before_deadline=s.before_deadline or 0,
            completed_after_deadline=s.after_deadline or 0,
            avg_days_to_complete_task=float(s.avg_days or 0.0),
            profit_for_period=s.profit or 0,
            avg_payment_per_task=float(s.avg_payment or 0.0),
            percent_of_success=percent_of_success,
            count_of_task_as_head=count_of_tasks_as_head,
            avg_size_of_group=avg_size_of_group,
            percent_of_success_as_head=percent_of_success_as_head,
        ).on_conflict_do_update(
            index_elements=['user_id', 'period_type', 'period_date'],
            set_=dict(
                count_of_completed_tasks=s.completed or 0,
                count_of_verified_tasks=s.verified or 0,
                count_of_failed_tasks=s.failed or 0,
                total_points=total_points or 0,
                completed_before_deadline=s.before_deadline or 0,
                completed_after_deadline=s.after_deadline or 0,
                avg_days_to_complete_task=float(s.avg_days or 0.0),
                profit_for_period=s.profit or 0,
                avg_payment_per_task=float(s.avg_payment or 0.0),
                percent_of_success=percent_of_success,
                count_of_task_as_head=count_of_tasks_as_head,
                avg_size_of_group=avg_size_of_group,
                percent_of_success_as_head=percent_of_success_as_head,
            )
        ).returning(UserStatistic)

        result = await self.db.execute(stmt)
        await self.db.commit()
        return result.scalar_one()


    async def get_dashboard(self, user_id: int, period_type: PeriodType) -> UserDashboard:
        user = await self.db.get(User, user_id)
        if not user:
            raise ValueError("User not found")

        today = date.today()
        first_day_of_month = today.replace(day=1)

        if first_day_of_month.month > 1:
            first_day_of_last_month = first_day_of_month.replace(month=first_day_of_month.month - 1)
        else:
            first_day_of_last_month = first_day_of_month.replace(year=first_day_of_month.year - 1, month=12)

        period_start = self.get_period_start(period_type)

        task_stats = await self.db.execute(
            select(
                func.count(Task.id).filter(
                    Task.task_step == TaskStep.IN_PROGRESS
                ).label("in_progress"),

                func.count(Task.id).filter(
                    Task.task_step == TaskStep.VERIFIED,
                    Task.completed_at >= period_start if period_start else True
                ).label("verified"),

                func.count(Task.id).filter(
                    Task.task_step == TaskStep.FAILED,
                    Task.completed_at >= period_start if period_start else True
                ).label("failed"),

                func.coalesce(func.sum(Task.payment).filter(
                    Task.task_step == TaskStep.VERIFIED,
                    Task.completed_at >= period_start if period_start else True
                ), 0).label("profit"),

                func.count(Task.id).filter(
                    Task.task_type == TaskType.GROUP,
                    Task.task_step == TaskStep.VERIFIED,
                    Task.completed_at >= period_start if period_start else True
                ).label("group_verified"),

                func.count(Task.id).filter(
                    Task.task_type == TaskType.GROUP,
                    Task.task_step == TaskStep.FAILED,
                    Task.completed_at >= period_start if period_start else True
                ).label("group_failed"),
            )
            .join(TaskOperation, TaskOperation.task_id == Task.id)
            .join(executors, executors.c.task_id == TaskOperation.id)  # type: ignore
            .where(executors.c.user_id == user_id)
        )
        stats = task_stats.one()

        points_and_available = await self.db.execute(
            select(
                func.coalesce(
                    select(func.sum(TaskPointHistory.points))
                    .where(
                        TaskPointHistory.user_id == user_id,
                        TaskPointHistory.period_date >= first_day_of_month,
                        )
                    .scalar_subquery(),
                    0
                ).label("current_month_points"),

                func.coalesce(
                    select(func.sum(TaskPointHistory.points))
                    .where(
                        TaskPointHistory.user_id == user_id,
                        TaskPointHistory.period_date >= first_day_of_last_month,
                        TaskPointHistory.period_date < first_day_of_month,
                        )
                    .scalar_subquery(),
                    0
                ).label("last_month_points"),

                func.coalesce(
                    select(func.count(Task.id))
                    .join(TaskOperation, TaskOperation.task_id == Task.id)
                    .join(accessed_users, accessed_users.c.task_id == TaskOperation.id)  # type: ignore
                    .where(
                        Task.task_step == TaskStep.AVAILABLE,
                        accessed_users.c.user_id == user_id,
                        )
                    .scalar_subquery(),
                    0
                ).label("tasks_available"),
            )
        )
        pa = points_and_available.one()

        team_size_subq = (
            select(func.count(executors.c.user_id).label("size"))
            .select_from(TaskOperation)
            .join(Task, Task.id == TaskOperation.task_id)
            .join(executors, executors.c.task_id == TaskOperation.id)  # type: ignore
            .where(
                executors.c.user_id == user_id,
                Task.task_type == TaskType.GROUP,
                *([] if not period_start else [Task.completed_at >= period_start])
            )
            .group_by(TaskOperation.id)
            .subquery()
        )

        leaderboard_position = None
        if user.company_id is not None:
            leaderboard = await self.get_leaderboard(
                company_id=user.company_id,
                sort_field="total_points",
                sort_order="desc",
                min_success_rate=0.0,
                position_id=None,
                limit=1000,
            )
            position_map = {entry.user_id: entry.rank_position for entry in leaderboard}
            leaderboard_position = position_map.get(user_id)

        avg_team_size = await self.db.scalar(
            select(func.coalesce(func.avg(team_size_subq.c.size), 0.0))
        )

        total = (stats.verified or 0) + (stats.failed or 0)
        total_group = (stats.group_verified or 0) + (stats.group_failed or 0)

        return UserDashboard(
            tasks_in_progress=stats.in_progress or 0,
            current_month_points=pa.current_month_points,
            last_month_points=pa.last_month_points,
            leaderboard_position=leaderboard_position,
            tasks_available=pa.tasks_available or 0,
            tasks_verified=stats.verified or 0,
            profit_for_period=stats.profit,
            success_rate=(stats.verified / total * 100) if total > 0 else 0.0,
            group_tasks_completed=stats.group_verified or 0,
            avg_team_size=float(avg_team_size or 0.0),
            group_success_rate=(stats.group_verified / total_group * 100) if total_group > 0 else 0.0,
        )


    async def get_chart_data(
            self,
            user_id: int,
            metric: str,
            limit: int = 15
    ) -> list[ChartPoint] | None:
        user = await self.db.get(User, user_id)
        if not user:
            return None

        result = await self.db.execute(
            select(UserStatistic.period_date, getattr(UserStatistic, metric))
            .where(
                UserStatistic.user_id == user_id,
                UserStatistic.period_type == PeriodType.MONTH,
            )
            .order_by(UserStatistic.period_date.asc())
            .limit(limit)
        )

        return [ChartPoint(date=row.period_date, value=row[1]) for row in result.all()]


    async def get_leaderboard(
            self,
            company_id: int,
            sort_field: Literal["total_points", "success_rate"] = "total_points",
            sort_order: Literal["desc", "asc"] = "desc",
            min_success_rate: float = 0.0,
            position_id: int | None = None,
            limit: int = 50
    ) -> list[LeaderBoardEntity]:
        today = date.today()
        first_day_of_month = today.replace(day=1)

        # Points aggregated directly from TaskPointHistory (always up-to-date)
        points_subq = (
            select(
                TaskPointHistory.user_id,
                func.coalesce(func.sum(TaskPointHistory.points), 0).label("total_points"),
            )
            .where(TaskPointHistory.period_date >= first_day_of_month)
            .group_by(TaskPointHistory.user_id)
            .subquery()
        )

        # Success rate from tasks completed this month
        success_subq = (
            select(
                executors.c.user_id,
                func.count(Task.id).filter(Task.task_step == TaskStep.VERIFIED).label("verified"),
                func.count(Task.id).label("total_closed"),
            )
            .select_from(Task)
            .join(TaskOperation, TaskOperation.task_id == Task.id)
            .join(executors, executors.c.task_id == TaskOperation.id)  # type: ignore
            .where(
                Task.task_step.in_([TaskStep.VERIFIED, TaskStep.FAILED]),
                Task.completed_at >= first_day_of_month,
            )
            .group_by(executors.c.user_id)
            .subquery()
        )

        success_rate_expr = func.coalesce(
            success_subq.c.verified * 100.0 / func.nullif(success_subq.c.total_closed, 0),
            0.0,
        )

        points_order_col = func.coalesce(points_subq.c.total_points, 0)
        sort_col = points_order_col if sort_field == "total_points" else success_rate_expr
        order_expr = sort_col.asc() if sort_order == "asc" else sort_col.desc()

        user_filters = [
            User.company_id == company_id,
            User.id != select(Company.owner_id).where(Company.id == company_id).scalar_subquery(),
        ]
        if position_id is not None:
            user_filters.append(User.position_id == position_id)

        rows = (await self.db.execute(
            select(
                User.id.label("user_id"),
                User.first_name,
                User.last_name,
                User.avatar_url,
                func.coalesce(points_subq.c.total_points, 0).label("total_points"),
                success_rate_expr.label("success_rate"),
            )
            .outerjoin(points_subq, points_subq.c.user_id == User.id)
            .outerjoin(success_subq, success_subq.c.user_id == User.id)
            .where(*user_filters)
            .order_by(order_expr, User.id.asc())
            .limit(limit)
        )).all()

        return [
            LeaderBoardEntity(
                user_id=row.user_id,
                user_first_name=row.first_name,
                user_last_name=row.last_name,
                avatar_url=row.avatar_url,
                rank_position=idx + 1,
                total_points=row.total_points,
                success_rate=float(row.success_rate or 0.0),
            )
            for idx, row in enumerate(rows)
            if float(row.success_rate or 0.0) >= min_success_rate
        ]










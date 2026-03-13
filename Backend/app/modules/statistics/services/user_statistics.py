from datetime import date, timedelta

from sqlalchemy import select, func
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.base_module.enums import TaskStep, PeriodType, Role, TaskType
from app.modules.statistics.models.task_point_history import TaskPointHistory
from app.modules.statistics.models.user_statistic import UserStatistic
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
            return today - timedelta(days=30)
        elif period_type == PeriodType.SIX_MONTH:
            return today - timedelta(days=180)
        elif period_type == PeriodType.YEAR:
            return today - timedelta(days=365)
        return None

    async def calculate_statistics(self, user_id: int, period_type: PeriodType) -> UserStatisticsResponse:
        user = await self.db.get(User, user_id)

        if not user:
            raise ValueError("User not found")

        period_start = self.get_period_start(period_type)

        base_where = [executors.c.user_id == user.id]
        if period_start:
            base_where.append(Task.completed_at >= period_start) #type: ignore

        count_of_completed_tasks = await self.db.scalar(
            select(func.count(Task.id))
            .join(TaskOperation, TaskOperation.task_id == Task.id)
            .join(executors, executors.c.task_id == TaskOperation.id) #type: ignore
            .where(
                *base_where, Task.task_step ==TaskStep.COMPLETED #type: ignore
            )
        )

        count_of_verified_tasks = await self.db.scalar(
            select(func.count(Task.id))
            .join(TaskOperation, TaskOperation.task_id == Task.id)
            .join(executors, executors.c.task_id == TaskOperation.id) #type: ignore
            .where(
                *base_where, Task.task_step ==TaskStep.VERIFIED #type: ignore
            )
        )

        count_of_failed_tasks = await self.db.scalar(
            select(func.count(Task.id))
            .join(TaskOperation, TaskOperation.task_id == Task.id)
            .join(executors, executors.c.task_id == TaskOperation.id) #type: ignore
            .where(
                *base_where, Task.task_step ==TaskStep.FAILED #type: ignore
            )
        )

        total_points_query = (
            select(func.coalesce(func.sum(TaskPointHistory.points), 0))
            .where(TaskPointHistory.user_id == user.id)
        )

        if period_start:
            total_points_query = total_points_query.where(TaskPointHistory.period_date >= period_start)

        total_points = await self.db.scalar(total_points_query)

        completed_before_deadline = await self.db.scalar(
            select(func.count(Task.id))
            .join(TaskOperation, TaskOperation.task_id == Task.id)
            .join(executors, executors.c.task_id == TaskOperation.id) #type: ignore
            .where(
                *base_where, Task.deadline >= Task.completed_at, #type: ignore
                Task.task_step == TaskStep.VERIFIED
            )
        )

        completed_after_deadline = await self.db.scalar(
            select(func.count(Task.id))
            .join(TaskOperation, TaskOperation.task_id == Task.id)
            .join(executors, executors.c.task_id == TaskOperation.id) #type: ignore
            .where(
                *base_where, Task.deadline < Task.completed_at, #type: ignore
                Task.task_step == TaskStep.VERIFIED
            )
        )

        avg_days_to_complete_task = await self.db.scalar(
            select(func.avg(
                func.extract('epoch', Task.completed_at - Task.created_at) / 86400
            ))
            .join(TaskOperation, TaskOperation.task_id == Task.id)
            .join(executors, executors.c.task_id == TaskOperation.id) #type: ignore
            .where(
                *base_where, Task.task_step == TaskStep.VERIFIED
            )
        )

        profit_for_period = await self.db.scalar(
            select(func.coalesce(func.sum(Task.payment), 0))
            .join(TaskOperation, TaskOperation.task_id == Task.id)
            .join(executors, executors.c.task_id == TaskOperation.id) #type: ignore
            .where(*base_where, Task.task_step == TaskStep.VERIFIED)
        )

        avg_payment_per_task = await self.db.scalar(
            select(func.coalesce(func.avg(Task.payment), 0))
            .join(TaskOperation, TaskOperation.task_id == Task.id)
            .join(executors, executors.c.task_id == TaskOperation.id) #type: ignore
            .where(*base_where, Task.task_step == TaskStep.VERIFIED)
        )

        total = (count_of_verified_tasks or 0) + (count_of_failed_tasks or 0)
        percent_of_success = (count_of_verified_tasks / total * 100) if total > 0 else 0.0

        count_of_tasks_as_head = 0
        avg_size_of_group = 0
        percent_of_success_as_head = 0
        if user.role == Role.HEAD:
            count_of_tasks_as_head = await self.db.scalar(
                select(func.coalesce(func.count(Task.id), 0))
                .join(TaskOperation, TaskOperation.task_id == Task.id)
                .join(executors, executors.c.task_id == TaskOperation.id) # type: ignore
                .where(*base_where, Task.task_type == TaskType.GROUP)
            )

            subq = (
                select(
                    TaskOperation.id,
                    func.count(executors.c.user_id).label("group_size")
                )
                .join(executors, executors.c.task_id == TaskOperation.id) #type: ignore
                .join(Task, Task.id == TaskOperation.task_id)
                .where(*base_where, Task.task_type == TaskType.GROUP)
                .group_by(TaskOperation.id)
                .subquery()
            )

            avg_size_of_group = await self.db.scalar(
                select(func.coalesce(func.avg(subq.c.group_size), 0))
            )

            count_of_verified_group_tasks = await self.db.scalar(
                select(func.count(Task.id))
                .join(TaskOperation, TaskOperation.task_id == Task.id)
                .join(executors, executors.c.task_id == TaskOperation.id) #type: ignore
                .where(
                    *base_where, Task.task_step ==TaskStep.VERIFIED, #type: ignore
                    Task.task_type == TaskType.GROUP
                )
            )

            count_of_failed_group_tasks = await self.db.scalar(
                select(func.count(Task.id))
                .join(TaskOperation, TaskOperation.task_id == Task.id)
                .join(executors, executors.c.task_id == TaskOperation.id) #type: ignore
                .where(
                    *base_where, Task.task_step ==TaskStep.FAILED, #type: ignore
                    Task.task_type==TaskType.GROUP
                )
            )

            total_group = (count_of_verified_group_tasks or 0) + (count_of_failed_group_tasks or 0)
            percent_of_success_as_head = (count_of_verified_group_tasks / total_group * 100) if total_group > 0 else 0.0


        stmt = insert(UserStatistic).values(
            user_id=user.id,
            period_type=period_type,
            period_date=date.today(),
            count_of_completed_tasks=count_of_completed_tasks or 0,
            count_of_verified_tasks=count_of_verified_tasks or 0,
            count_of_failed_tasks=count_of_failed_tasks or 0,
            total_points=total_points or 0,
            completed_before_deadline=completed_before_deadline or 0,
            completed_after_deadline=completed_after_deadline or 0,
            avg_days_to_complete_task=avg_days_to_complete_task or 0.0,
            profit_for_period=profit_for_period or 0,
            avg_payment_per_task=avg_payment_per_task or 0.0,
            percent_of_success=percent_of_success,
            count_of_task_as_head=count_of_tasks_as_head or 0,
            avg_size_of_group=avg_size_of_group or 0.0,
            percent_of_success_as_head=percent_of_success_as_head,
        ).on_conflict_do_update(
            index_elements=['user_id', 'period_type', 'period_date'],
            set_=dict(
                count_of_completed_tasks=count_of_completed_tasks or 0,
                count_of_verified_tasks=count_of_verified_tasks or 0,
                count_of_failed_tasks=count_of_failed_tasks or 0,
                total_points=total_points or 0,
                completed_before_deadline=completed_before_deadline or 0,
                completed_after_deadline=completed_after_deadline or 0,
                avg_days_to_complete_task=avg_days_to_complete_task or 0.0,
                profit_for_period=profit_for_period or 0,
                avg_payment_per_task=avg_payment_per_task or 0.0,
                percent_of_success=percent_of_success,
                count_of_task_as_head=count_of_tasks_as_head or 0,
                avg_size_of_group=avg_size_of_group or 0.0,
                percent_of_success_as_head=percent_of_success_as_head,
            )
        ).returning(UserStatistic)

        result = await self.db.execute(stmt)
        await self.db.commit()
        return result.scalar_one()


    async def get_dashboard(self, user_id: int, period_type: PeriodType) -> UserDashboard:
        user = await self.db.get(User, user_id)

        period_start = self.get_period_start(period_type)

        base_where = [executors.c.user_id == user.id]
        if period_start:
            base_where.append(Task.completed_at >= period_start) #type: ignore

        count_of_in_progress_tasks = await self.db.scalar(
            select(func.count(Task.id))
            .join(TaskOperation, TaskOperation.task_id == Task.id)
            .join(executors, executors.c.task_id == TaskOperation.id) # type: ignore
            .where(
                executors.c.user_id == user_id,
                Task.task_step == TaskStep.IN_PROGRESS
            )
        )

        current_month_points = await self.db.scalar(
            select(func.coalesce(func.sum(TaskPointHistory.points), 0))
            .where(TaskPointHistory.user_id ==user_id)
        )

        today = date.today()
        first_day_of_current_month = today.replace(day=1)
        ranked = (
            select(
                UserStatistic.user_id,
                func.rank().over(order_by=UserStatistic.total_points.desc()).label('rank'),
            )
            .where(
                UserStatistic.period_type == PeriodType.MONTH,
                UserStatistic.period_date >= first_day_of_current_month,
                UserStatistic.user_id.in_(
                    select(User.id).where(User.company_id == user.company_id)
                )
            )
            .subquery()
        )

        leaderboard_position = await self.db.execute(
            select(ranked.c.rank).where(ranked.c.user_id == user.id) #type: ignore
        )

        tasks_available = await self.db.execute(
            select(func.count(Task.id))
            .join(TaskOperation, TaskOperation.task_id == Task.id)
            .join(accessed_users, accessed_users.c.task_id == Task.id) #type: ignore
            .where(
                Task.task_step == TaskStep.AVAILABLE,
                accessed_users.c.user_id == user.id
            )
        )

        task_verified = await self.db.execute(
            select(func.count(Task.id))
            .join(TaskOperation, TaskOperation.task_id == Task.id)
            .join(executors, executors.c.task_id == TaskOperation.id) #type: ignore
            .where(
                executors.c.user_id == user.id,
                Task.task_step == TaskStep.VERIFIED,
            )
        )

        profit_for_period = await self.db.scalar(
            select(func.coalesce(func.sum(Task.payment), 0))
            .join(TaskOperation, TaskOperation.task_id == Task.id)
            .join(executors, executors.c.task_id == TaskOperation.id) #type: ignore
            .where(*base_where, Task.task_step == TaskStep.VERIFIED)
        )

        count_of_verified_tasks = await self.db.scalar(
            select(func.count(Task.id))
            .join(TaskOperation, TaskOperation.task_id == Task.id)
            .join(executors, executors.c.task_id == TaskOperation.id) #type: ignore
            .where(
                *base_where, Task.task_step ==TaskStep.VERIFIED #type: ignore
            )
        )

        count_of_failed_tasks = await self.db.scalar(
            select(func.count(Task.id))
            .join(TaskOperation, TaskOperation.task_id == Task.id)
            .join(executors, executors.c.task_id == TaskOperation.id) #type: ignore
            .where(
                *base_where, Task.task_step ==TaskStep.FAILED #type: ignore
            )
        )

        total = (count_of_verified_tasks or 0) + (count_of_failed_tasks or 0)
        percent_of_success = (count_of_verified_tasks / total * 100) if total > 0 else 0.0

        group_tasks_completed = await self.db.scalar(
            select(func.count(Task.id))
            .join(TaskOperation, TaskOperation.task_id == Task.id)
            .join(executors, executors.c.task_id == TaskOperation.id) #type: ignore
            .where(
                *base_where,
                Task.step_type == TaskStep.VERIFIED,
                Task.task_type == TaskType.GROUP
            )
        )

        avg_team_size = await self.db.scalar(
            select(func.avg(TaskOperation.executors))
            .where(TaskOperation.executors.c.user_id == user.id) #type: ignore
        )

        count_of_verified_group_tasks = await self.db.scalar(
            select(func.count(Task.id))
            .join(TaskOperation, TaskOperation.task_id == Task.id)
            .join(executors, executors.c.task_id == TaskOperation.id) #type: ignore
            .where(
                *base_where, Task.task_step ==TaskStep.VERIFIED, #type: ignore
                             Task.task_type == TaskType.GROUP
            )
        )

        count_of_failed_group_tasks = await self.db.scalar(
            select(func.count(Task.id))
            .join(TaskOperation, TaskOperation.task_id == Task.id)
            .join(executors, executors.c.task_id == TaskOperation.id) #type: ignore
            .where(
                *base_where, Task.task_step ==TaskStep.FAILED, #type: ignore
                             Task.task_type==TaskType.GROUP
            )
        )

        total_group = (count_of_verified_group_tasks or 0) + (count_of_failed_group_tasks or 0)
        group_success_rate = (count_of_verified_group_tasks / total_group * 100) if total_group > 0 else 0.0











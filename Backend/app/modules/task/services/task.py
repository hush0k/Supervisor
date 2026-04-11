from typing import Optional

from sqlalchemy import select, asc, desc
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date

from sqlalchemy.orm import selectinload

from app.core.logging import get_logger
from app.modules.base_module.enums import TaskType, TaskStep, Role, QualityStatus

logger = get_logger("tasks")
from app.modules.statistics.services.points_calculation import PointsCalculationService
from app.modules.task.model.task import Task
from app.modules.task.schemas.task import (
    TaskCreate,
    TaskResponse,
    TaskFilter,
    TaskSort,
    TaskUpdate,
    TaskParticipantsResponse,
    TaskParticipantUser,
)
from app.modules.task_operations.model.task_operation import (
    TaskOperation,
    accessed_users,
    executors,
)
from app.modules.users.models.user import User


class TaskService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, task_in: TaskCreate, company_id: int) -> TaskResponse:
        task_data = task_in.model_dump()
        if task_data.get("task_type") != TaskType.GROUP:
            task_data["group_size_limit"] = None
            task_data["head_payment"] = None
        elif (
            task_data.get("head_payment") is not None
            and task_data.get("head_payment") > task_data.get("payment", 0)
        ):
            raise ValueError("Выплата бригадиру не может быть больше общей суммы")

        task = Task(**task_data, company_id=company_id)    # type: ignore

        self.db.add(task)
        await self.db.flush()
        await self.db.refresh(task)

        logger.info("Task created: id=%s name='%s' company_id=%s", task.id, task.name, company_id)
        return task

    async def get_by_id(self, task_id: int) -> TaskResponse:
        result = await self.db.execute(select(Task).where(Task.id == task_id))
        return result.scalar_one_or_none()

    async def get_all(
        self,
        filters: TaskFilter,
        sort: TaskSort,
        skip: int = 0,
        limit: int = 100,
    ) -> list[TaskResponse]:
        query = select(Task)

        if filters.deadline:
            query = query.where(Task.deadline >= filters.deadline)
        if filters.is_active is not None:
            query = query.where(Task.is_active == filters.is_active)
        if filters.task_type:
            query = query.where(Task.task_type == filters.task_type)
        if filters.min_payment:
            query = query.where(Task.payment >= filters.min_payment)
        if filters.max_payment:
            query = query.where(Task.payment <= filters.max_payment)
        if filters.min_duration:
            query = query.where(Task.duration >= filters.min_duration)
        if filters.max_duration:
            query = query.where(Task.duration <= filters.max_duration)
        if filters.city:
            query = query.where(Task.city == filters.city)
        if filters.task_step:
            query = query.where(Task.task_step == filters.task_step)
        if filters.priority:
            query = query.where(Task.priority == filters.priority)
        if filters.search:
            search_pattern = f"%{filters.search}%"
            query = query.where(Task.name.ilike(search_pattern))

        order_func = desc if sort.order == "desc" else asc
        query = query.order_by(order_func(getattr(Task, sort.field)))

        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def update(self, task_id: int, task_in: TaskUpdate) -> Optional[TaskResponse]:
        task = await self.get_by_id(task_id)
        if not task:
            return None
        if task.task_step == TaskStep.VERIFIED:
            return None

        updated_task = task_in.model_dump(exclude_unset=True)
        # Task type is immutable after creation.
        # Ignore incoming changes from API clients and keep original type.
        if "task_type" in updated_task:
            if updated_task["task_type"] != task.task_type:
                logger.warning(
                    "Blocked task_type change: task_id=%s from=%s to=%s",
                    task_id,
                    task.task_type,
                    updated_task["task_type"],
                )
            updated_task.pop("task_type", None)

        effective_payment = updated_task.get("payment", task.payment)
        effective_head_payment = updated_task.get("head_payment", task.head_payment)
        if task.task_type != TaskType.GROUP:
            updated_task["head_payment"] = None
        elif effective_head_payment is not None and effective_head_payment > effective_payment:
            raise ValueError("Выплата бригадиру не может быть больше общей суммы")

        for field, value in updated_task.items():
            setattr(task, field, value)

        if task.task_type != TaskType.GROUP:
            task.group_size_limit = None

        await self.db.flush()
        await self.db.refresh(task)
        return task

    async def get_accessed_users_ids(self, task_id: int) -> Optional[list[int]]:
        result = await self.db.execute(
            select(TaskOperation)
            .options(selectinload(TaskOperation.accessed_users))
            .where(TaskOperation.task_id == task_id)
        )
        task_operation = result.scalar_one_or_none()
        if not task_operation:
            return None
        return [user.id for user in task_operation.accessed_users]

    async def update_accessed_users(
        self,
        task_id: int,
        accessed_user_ids: list[int],
        company_id: int,
    ) -> Optional[list[int]]:
        task = await self.get_by_id(task_id)
        if not task or task.company_id != company_id:
            return None
        if task.task_step == TaskStep.VERIFIED:
            return None

        result = await self.db.execute(
            select(TaskOperation)
            .options(selectinload(TaskOperation.accessed_users))
            .where(TaskOperation.task_id == task_id)
        )
        task_operation = result.scalar_one_or_none()
        if not task_operation:
            return None

        unique_ids = list(set(accessed_user_ids))
        if unique_ids:
            users_result = await self.db.execute(
                select(User)
                .options(selectinload(User.position))
                .where(User.id.in_(unique_ids), User.company_id == task.company_id)
            )
            users = list(users_result.scalars().all())
            if len(users) != len(unique_ids):
                return None
            if task.task_type == TaskType.GROUP:
                invalid = [
                    user.id
                    for user in users
                    if user.role != Role.HEAD and not bool(user.position and user.position.head_of_group)
                ]
                if invalid:
                    return None
        else:
            users = []

        task_operation.accessed_users = users
        await self.db.flush()
        await self.db.refresh(task_operation)
        return [user.id for user in task_operation.accessed_users]

    async def get_task_participants(self, task_id: int) -> Optional[TaskParticipantsResponse]:
        result = await self.db.execute(
            select(TaskOperation)
            .options(
                selectinload(TaskOperation.accessed_users),
                selectinload(TaskOperation.executors),
            )
            .where(TaskOperation.task_id == task_id)
        )
        task_operation = result.scalar_one_or_none()
        if not task_operation:
            return None

        return TaskParticipantsResponse(
            accessed_users=[
                TaskParticipantUser(
                    id=user.id,
                    first_name=user.first_name,
                    last_name=user.last_name,
                    login=user.login,
                )
                for user in task_operation.accessed_users
            ],
            executors=[
                TaskParticipantUser(
                    id=user.id,
                    first_name=user.first_name,
                    last_name=user.last_name,
                    login=user.login,
                )
                for user in task_operation.executors
            ],
        )

    async def delete(self, task_id: int) -> bool:
        task = await self.get_by_id(task_id)

        if not task:
            logger.warning("Delete task: not found id=%s", task_id)
            return False

        await self.db.delete(task)
        logger.info("Task deleted: id=%s", task_id)
        return True

    async def take_task(
            self,
            task_id: int,
            user_id: int,
            executors_list: Optional[list[int]] = None
    ) -> Optional[TaskResponse]:
        task = await self.get_by_id(task_id)
        if not task or task.task_step != TaskStep.AVAILABLE:
            return None

        result = await self.db.execute(
            select(TaskOperation)
            .options(
                selectinload(TaskOperation.executors),
                selectinload(TaskOperation.accessed_users),
            )
            .where(TaskOperation.task_id == task_id)
        )

        task_operation = result.scalar_one_or_none()
        if not task_operation:
            return None

        if user_id not in [u.id for u in task_operation.accessed_users]:
            return None

        user_result = await self.db.execute(
            select(User).options(selectinload(User.position)).where(User.id == user_id)
        )
        user = user_result.scalar_one_or_none()
        if not user:
            return None

        is_group_head = user.role == Role.HEAD or bool(user.position and user.position.head_of_group)
        if task.task_type == TaskType.GROUP and not is_group_head:
            return None

        task.task_step = TaskStep.IN_PROGRESS
        task_operation.executors.append(user)

        if task.task_type == TaskType.GROUP:
            candidate_ids = list({uid for uid in (executors_list or []) if uid != user_id})
            if candidate_ids:
                users_result = await self.db.execute(
                    select(User).where(
                        User.id.in_(candidate_ids),
                        User.company_id == task.company_id,
                    )
                )
                brigade_users = list(users_result.scalars().all())
                if len(brigade_users) != len(candidate_ids):
                    return None
            else:
                brigade_users = []

            full_group_size = 1 + len(brigade_users)
            if task.group_size_limit is not None and full_group_size > task.group_size_limit:
                return None

            for executor in brigade_users:
                if executor.id not in [u.id for u in task_operation.executors]:
                    task_operation.executors.append(executor)

        await self.db.flush()
        await self.db.refresh(task)
        logger.info("Task taken: task_id=%s user_id=%s type=%s", task_id, user_id, task.task_type)
        return task


    async def complete_task(self, task_id: int, user_id: int) -> Optional[TaskResponse]:
        task = await self.get_by_id(task_id)
        if not task or task.task_step != TaskStep.IN_PROGRESS:
            return None

        result = await self.db.execute(
            select(TaskOperation)
            .options(
                selectinload(TaskOperation.executors),
                selectinload(TaskOperation.accessed_users),
            )
            .where(TaskOperation.task_id == task_id)
        )

        task_operation = result.scalar_one_or_none()
        if not task_operation:
            return None

        if user_id not in [u.id for u in task_operation.executors]:
            return None

        if task.task_type == TaskType.GROUP:
            user_result = await self.db.execute(
                select(User).options(selectinload(User.position)).where(User.id == user_id)
            )
            user = user_result.scalar_one_or_none()
            is_group_head = bool(user and (user.role == Role.HEAD or (user.position and user.position.head_of_group)))
            if not is_group_head:
                return None

        task.task_step = TaskStep.COMPLETED
        task.completed_at = date.today()

        await self.db.flush()
        await self.db.refresh(task)
        logger.info("Task completed: task_id=%s user_id=%s", task_id, user_id)
        return task


    async def verify_task(self, task_id: int) -> Optional[bool]:
        task = await self.get_by_id(task_id)
        if not task or task.task_step != TaskStep.COMPLETED:
            return None

        points_calculation_service = PointsCalculationService(self.db)

        result = await self.db.execute(
            select(TaskOperation)
            .options(selectinload(TaskOperation.executors))
            .where(TaskOperation.task_id == task_id)
        )
        task_operation = result.scalar_one_or_none()

        if not task_operation:
            return None

        payouts = self._build_executor_payouts(task, task_operation.executors)
        for executor in task_operation.executors:
            payout = payouts.get(executor.id, 0)
            await points_calculation_service.calculate_and_save(
                task,
                user_id=executor.id,  # type: ignore
                earned_amount=payout,
            )
            if executor.bonus is None:
                executor.bonus = payout
            else:
                executor.bonus += payout


        task.task_step = TaskStep.VERIFIED
        task.quality_status = QualityStatus.VERIFIED
        task.verified_at = date.today()

        await self.db.flush()
        await self.db.refresh(task)
        logger.info("Task verified: task_id=%s", task_id)
        return True

    @staticmethod
    def _build_executor_payouts(task: Task, executors_list: list[User]) -> dict[int, int]:
        if not executors_list:
            return {}

        total = int(task.payment or 0)
        count = len(executors_list)
        payouts: dict[int, int] = {}

        if task.task_type != TaskType.GROUP:
            per = total // count
            remainder = total - (per * count)
            for index, user in enumerate(executors_list):
                payouts[user.id] = per + (1 if index < remainder else 0)
            return payouts

        if count == 1:
            payouts[executors_list[0].id] = total
            return payouts

        head_user = executors_list[0]
        if task.head_payment is None:
            per = total // count
            remainder = total - (per * count)
            for index, user in enumerate(executors_list):
                payouts[user.id] = per + (1 if index < remainder else 0)
            return payouts

        head_amount = int(task.head_payment)
        payouts[head_user.id] = head_amount

        rest_total = total - head_amount
        members = executors_list[1:]
        members_count = len(members)
        if members_count <= 0:
            payouts[head_user.id] = total
            return payouts

        per_member = rest_total // members_count
        remainder = rest_total - (per_member * members_count)
        for index, user in enumerate(members):
            payouts[user.id] = per_member + (1 if index < remainder else 0)

        return payouts

    async def reject_task(self, task_id: int) -> Optional[bool]:
        task = await self.get_by_id(task_id)
        if not task or task.task_step != TaskStep.COMPLETED:
            return None

        task.task_step = TaskStep.FAILED
        task.quality_status = QualityStatus.FAILED
        task.completed_at = None

        await self.db.flush()
        await self.db.refresh(task)
        logger.info("Task rejected: task_id=%s", task_id)
        return False


    async def accessed_tasks(self, user_id: int) -> Optional[list[TaskResponse]]:
        user = await self.db.get(User, user_id)
        if not user:
            return None

        # noinspection PyTypeChecker
        user_accessible = await self.db.execute(
            select(Task)
            .join(TaskOperation, Task.id == TaskOperation.task_id)
            .join(accessed_users, accessed_users.c.task_id == TaskOperation.id)
            .where(
                (accessed_users.c.user_id == user_id) &
                (Task.task_step == TaskStep.AVAILABLE)
            )
        )

        return list(user_accessible.scalars().all())


    async def executing_tasks(self, user_id: int) -> Optional[list[TaskResponse]]:
        user = await self.db.get(User, user_id)
        if not user:
            return None

        # noinspection PyTypeChecker
        user_executing = await self.db.execute(
            select(Task)
            .join(TaskOperation, Task.id == TaskOperation.task_id)
            .join(executors, executors.c.task_id == TaskOperation.id)
            .where(
                (executors.c.user_id == user_id) &
                (Task.task_step == TaskStep.IN_PROGRESS)
            )
        )

        return list(user_executing.scalars().all())


    async def completed_tasks(self, user_id: int) -> Optional[list[TaskResponse]]:
        user = await self.db.get(User, user_id)
        if not user:
            return None

        # noinspection PyTypeChecker
        user_completed = await self.db.execute(
            select(Task)
            .join(TaskOperation, Task.id == TaskOperation.task_id)
            .join(executors, executors.c.task_id == TaskOperation.id)
            .where(
                (executors.c.user_id == user_id) &
                (Task.task_step == TaskStep.COMPLETED)
            )
        )


        return list(user_completed.scalars().all())

    async def verified_tasks(self, user_id: int) -> Optional[list[TaskResponse]]:
        user = await self.db.get(User, user_id)
        if not user:
            return None

        # noinspection PyTypeChecker
        user_verified = await self.db.execute(
            select(Task)
            .join(TaskOperation, Task.id == TaskOperation.task_id)
            .join(executors, executors.c.task_id == TaskOperation.id)
            .where(
                (executors.c.user_id == user_id) &
                (Task.task_step == TaskStep.VERIFIED)
            )
        )

        return list(user_verified.scalars().all())

    async def failed_tasks(self, user_id: int) -> Optional[list[TaskResponse]]:
        user = await self.db.get(User, user_id)
        if not user:
            return None

        # noinspection PyTypeChecker
        user_failed = await self.db.execute(
            select(Task)
            .join(TaskOperation, Task.id == TaskOperation.task_id)
            .join(executors, executors.c.task_id == TaskOperation.id)
            .where(
                (executors.c.user_id == user_id) &
                (Task.task_step == TaskStep.FAILED)
            )
        )

        return list(user_failed.scalars().all())

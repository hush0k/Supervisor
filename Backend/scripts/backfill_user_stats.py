"""
Backfill UserStatistic records for all existing users who don't have one
for the current month. Run once from the Backend directory:

    python -m scripts.backfill_user_stats
"""

import asyncio
from datetime import date

from sqlalchemy import select

from app.core.db import db_manager
from app.modules.base_module.enums import PeriodType
from app.modules.statistics.models.user_statistic import UserStatistic
from app.modules.users.models.user import User


async def backfill() -> None:
    today = date.today()
    first_day_of_month = today.replace(day=1)

    async with db_manager.AsyncSessionLocal() as session:
        # Найти всех пользователей у которых нет UserStatistic за текущий месяц
        existing_subq = (
            select(UserStatistic.user_id)
            .where(
                UserStatistic.period_type == PeriodType.MONTH,
                UserStatistic.period_date >= first_day_of_month,
            )
            .subquery()
        )

        result = await session.execute(
            select(User.id).where(User.id.not_in(select(existing_subq)))
        )
        user_ids = result.scalars().all()

        if not user_ids:
            print("Все пользователи уже имеют записи в UserStatistic — ничего не нужно делать.")
            return

        for user_id in user_ids:
            session.add(
                UserStatistic(
                    user_id=user_id,
                    period_type=PeriodType.MONTH,
                    period_date=today,
                    total_points=0,
                )
            )

        await session.commit()
        print(f"Создано {len(user_ids)} записей UserStatistic для пользователей: {list(user_ids)}")


if __name__ == "__main__":
    asyncio.run(backfill())
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.modules.statistics.models.difficulty_config import DifficultyConfig
from app.modules.statistics.schemas.difficulty_config import (
    DifficultyConfigCreate,
    DifficultyConfigResponse,
    DifficultyConfigUpdate,
)

logger = get_logger("difficulty-config")

# Fallback thresholds for companies where config has not been created yet.
DEFAULT_LOW_MAX = 100_000
DEFAULT_MEDIUM_MAX = 300_000


class DifficultyConfigService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self, config_in: DifficultyConfigCreate, company_id: int
    ) -> DifficultyConfigResponse:
        config_data = config_in.model_dump()

        config = DifficultyConfig(**config_data, company_id=company_id)  # type: ignore

        self.db.add(config)
        await self.db.commit()
        await self.db.refresh(config)

        return config

    async def update(
        self, config_in: DifficultyConfigUpdate, company_id: int
    ) -> DifficultyConfigResponse:
        config_data = await self.db.execute(
            select(DifficultyConfig).where(DifficultyConfig.company_id == company_id)
        )
        config_data = config_data.scalar_one_or_none()
        if config_data is None:
            raise ValueError("DifficultyConfig not found for the given company_id")

        for key, value in config_in.model_dump(exclude_unset=True).items():
            setattr(config_data, key, value)

        await self.db.commit()
        await self.db.refresh(config_data)

        return config_data

    async def get_by_company_id(self, company_id: int) -> DifficultyConfigResponse | None:
        config_data = await self.db.execute(
            select(DifficultyConfig).where(DifficultyConfig.company_id == company_id)
        )
        config_data = config_data.scalar_one_or_none()
        if config_data is None:
            return None

        return config_data

    async def get_with_difficulty_level(self, company_id: int, payment: int) -> float:
        config_data = await self.get_by_company_id(company_id)

        low_max = config_data.low_max if config_data else DEFAULT_LOW_MAX
        medium_max = config_data.medium_max if config_data else DEFAULT_MEDIUM_MAX

        if medium_max <= low_max:
            logger.warning(
                "DifficultyConfig invalid for company_id=%s (low_max=%s, medium_max=%s), using defaults",
                company_id, low_max, medium_max,
            )
            low_max = DEFAULT_LOW_MAX
            medium_max = DEFAULT_MEDIUM_MAX

        if config_data is None:
            logger.warning(
                "DifficultyConfig not found for company_id=%s, using default thresholds (%s, %s)",
                company_id, low_max, medium_max,
            )

        if payment < low_max:
            return 1.5
        elif low_max <= payment < medium_max:
            return 1.8
        else:
            return 2.0

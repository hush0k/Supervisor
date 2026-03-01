from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.statistics.models.difficulty_config import DifficultyConfig
from app.modules.statistics.schemas.difficulty_config import (
    DifficultyConfigCreate,
    DifficultyConfigResponse,
    DifficultyConfigUpdate,
)


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

    async def get_by_company_id(self, company_id: int) -> DifficultyConfigResponse:
        config_data = await self.db.execute(
            select(DifficultyConfig).where(DifficultyConfig.company_id == company_id)
        )
        config_data = config_data.scalar_one_or_none()
        if config_data is None:
            raise ValueError("DifficultyConfig not found for the given company_id")

        return config_data

    async def get_with_difficulty_level(self, company_id: int, payment: int) -> float:
        config_data = await self.get_by_company_id(company_id)

        if payment < config_data.low_max:
            return 1.5
        elif config_data.low_max <= payment < config_data.medium_max:
            return 1.8
        else:
            return 2.0

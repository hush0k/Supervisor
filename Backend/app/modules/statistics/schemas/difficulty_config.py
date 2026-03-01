from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DifficultyConfigCreate(BaseModel):
    low_max: int
    medium_max: int


class DifficultyConfigUpdate(DifficultyConfigCreate):
    pass


class DifficultyConfigResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    low_max: int
    medium_max: int
    created_at: datetime
    updated_at: datetime

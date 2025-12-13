from typing import Annotated, Optional

from pydantic import BaseModel, Field, ConfigDict


class PositionBase(BaseModel):
    name: Annotated[str, Field(min_length=1, max_length=100)]


class PositionCreate(PositionBase):
    pass


class PositionUpdate(BaseModel):
    name: Optional[Annotated[str, Field(min_length=1, max_length=100)]] = None


class PositionResponse(PositionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int

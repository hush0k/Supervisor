from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy.sql.annotation import Annotated


class PositionBase(BaseModel):
    name: Annotated[str, Field(min_length=1, max_length=100)]


class PositionCreate(PositionBase):
    pass


class PositionUpdate(BaseModel):
    name: Annotated[str | None, Field(min_length=1, max_length=100) | None]


class PositionResponse(PositionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int

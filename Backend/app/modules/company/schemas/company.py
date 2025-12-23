from datetime import date, datetime
from typing import Annotated, Optional, List, Literal

from pydantic import Field, BaseModel, ConfigDict


class CompanyBase(BaseModel):
    owner_id: int
    name: Annotated[str, Field(min_length=1, max_length=100)]
    logo: Optional[str] = None
    description: Optional[Annotated[str, Field(min_length=1, max_length=500)]] = None
    date_established: date


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(BaseModel):
    owner_id: Optional[int] = None
    name: Optional[str] = None
    logo: Optional[str] = None
    description: Optional[str] = None
    date_established: Optional[date] = None


class CompanyResponse(CompanyBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class CompanyList(BaseModel):
    companies: List[CompanyBase]
    total: int


class CompanyFilter(BaseModel):
    search: Optional[str] = Field(None, min_length=1, max_length=100)


class CompanySort(BaseModel):
    field: Literal["id", "name", "date_established"] = "name"
    order: Literal["asc", "desc"] = "asc"

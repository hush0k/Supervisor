from datetime import datetime, date
from typing import Annotated

from pydantic import BaseModel, Field, field_validator

from app.modules.users.schemas.user import validate_strong_password


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str  # User ID as string (JWT standard requires string)
    exp: int  # Unix timestamp
    type: str


class LoginRequest(BaseModel):
    login: Annotated[str, Field(min_length=3, max_length=100)]
    password: Annotated[str, Field(min_length=1)]


class RefreshRequest(BaseModel):
    refresh_token: str


class RegisterCompanyRequest(BaseModel):
    company_name: str
    company_description: str | None = None
    date_established: date

    login: Annotated[str, Field(min_length=3, max_length=100)]
    password: Annotated[str, Field(min_length=8, max_length=100)]
    first_name: Annotated[str, Field(min_length=1, max_length=100)]
    last_name: Annotated[str, Field(min_length=1, max_length=100)]
    date_of_birth: date
    salary: Annotated[int, Field(gt=0)]

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        return validate_strong_password(v)
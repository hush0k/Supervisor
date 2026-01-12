from datetime import datetime, date
from typing import Annotated

from pydantic import BaseModel, Field


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

    login: str
    password: str
    first_name: str
    last_name: str
    date_of_birth: date
    salary: int
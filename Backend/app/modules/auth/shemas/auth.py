from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, Field


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: int
    exp: int  # Unix timestamp
    type: str


class LoginRequest(BaseModel):
    login: Annotated[str, Field(min_length=3, max_length=100)]
    password: Annotated[str, Field(min_length=1)]


class RefreshRequest(BaseModel):
    refresh_token: str

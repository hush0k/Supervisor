import re
from datetime import date, datetime
from typing import Optional, Literal, Annotated

from pydantic import BaseModel, Field, field_validator, ConfigDict, model_validator

from app.modules.base_module.enums import Role


def validate_strong_password(password: str) -> str:
    pattern = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
    if not re.match(pattern, password):
        raise ValueError(
            "Пароль должен содержать: "
            "минимум 8 символов, заглавную букву, "
            "строчную букву, цифру и спецсимвол"
        )
    return password


class UserBase(BaseModel):
    login: Annotated[str, Field(min_length=3, max_length=100)]
    first_name: Annotated[str, Field(min_length=1, max_length=100)]
    last_name: Annotated[str, Field(min_length=1, max_length=100)]
    date_of_birth: date
    salary: Annotated[int, Field(gt=0)]
    position_id: int


class UserCreate(UserBase):
    password: Annotated[str, Field(min_length=8, max_length=100)]

    _validate_password = field_validator("password")(
        lambda cls, v: validate_strong_password(v)
    )


class UserUpdate(BaseModel):
    login: Optional[Annotated[str, Field(min_length=3, max_length=100)]] = None
    first_name: Optional[Annotated[str, Field(min_length=1, max_length=100)]] = None
    last_name: Optional[Annotated[str, Field(min_length=1, max_length=100)]] = None
    date_of_birth: Optional[date] = None
    role: Optional[Role] = None
    salary: Optional[Annotated[int, Field(gt=0)]] = None
    position_id: Optional[int] = None


class UserUpdatePassword(BaseModel):
    old_password: str
    new_password: str
    repeat_new_password: str

    _validate_password = field_validator("new_password")(
        lambda cls, v: validate_strong_password(v)
    )

    @model_validator(mode="after")
    def validate_passwords_match(self) -> "UserUpdatePassword":
        if self.new_password != self.repeat_new_password:
            raise ValueError("Пароли не совпадают")
        return self


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: Role
    created_at: datetime
    updated_at: datetime


class UserListResponse(BaseModel):
    items: list[UserResponse]
    total: int


class UserFilter(BaseModel):
    role: Optional[Role] = None
    position_id: Optional[int] = None
    min_salary: Optional[int] = Field(None, gt=0)
    max_salary: Optional[int] = Field(None, gt=0)
    search: Optional[str] = Field(None, min_length=1, max_length=100)


class UserSort(BaseModel):
    field: Literal["id", "login", "first_name", "last_name", "salary", "created_at"] = (
        "id"
    )
    order: Literal["asc", "desc"] = "asc"

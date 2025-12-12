import re
from datetime import date

from pydantic import BaseModel, Field, field_validator, ConfigDict, model_validator
from sqlalchemy.sql.annotation import Annotated

from Backend.app.modules.users.models.enums import Role

def validate_strong_password(password: str) -> str:
    """Валидация сильного пароля"""
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
    first_name: Annotated[str | None, Field(min_length=1, max_length=100) | None]
    last_name: Annotated[str | None, Field(min_length=1, max_length=100) | None]
    salary: Annotated[int | None, Field(gt=0) | None]
    position_id: int | None
    role: Role | None

class UserUpdatePassword(BaseModel):
    old_password: str
    new_password: str
    repeat_new_password: str

    _validate_password = field_validator("new_password")(
        lambda cls, v: validate_strong_password(v)
    )

    @model_validator(mode='after')
    def validate_passwords_match(self) -> 'UserUpdatePassword':
        if self.new_password != self.repeat_new_password:
            raise ValueError("Пароли не совпадают")
        return self

class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: Role
    created_at: date
    updated_at: date


class UserListResponse(BaseModel):
    items: list[UserResponse]
    total: int

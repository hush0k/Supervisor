from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.modules.users.schemas.user import UserResponse


class TaskOperationBase(BaseModel):
    accessed_users: list[UserResponse]
    executors: list[UserResponse]

class TaskOperationCreate(TaskOperationBase):
    pass

class TaskOperationUpdate(BaseModel):
    accessed_users: Optional[list[UserResponse]] = None
    executors: Optional[list[UserResponse]] = None

class TaskOperationResponse(TaskOperationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
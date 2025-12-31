from datetime import datetime, timedelta, UTC
from typing import Optional

from fastapi import HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import verify_password
from app.modules.auth.schemas.auth import TokenPayload
from app.modules.users.models.user import User


security = HTTPBearer()


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    def create_access_token(self, user_id: int) -> str:
        expire = datetime.now(UTC) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
        payload = TokenPayload(
            sub=str(user_id), exp=int(expire.timestamp()), type="access"
        )
        return jwt.encode(
            payload.model_dump(), settings.SECRET_KEY, algorithm=settings.ALGORITHM
        )

    def create_refresh_token(self, user_id: int) -> str:
        """Создать refresh токен"""
        expire = datetime.now(UTC) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        payload = TokenPayload(
            sub=str(user_id), exp=int(expire.timestamp()), type="refresh"
        )
        return jwt.encode(
            payload.model_dump(), settings.SECRET_KEY, algorithm=settings.ALGORITHM
        )

    def verify_token(self, token: str, token_type: str) -> Optional[TokenPayload]:
        """Проверить токен и вернуть payload"""
        try:
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
            )
            token_data = TokenPayload(**payload)

            if token_data.type != token_type:
                return None

            return token_data
        except JWTError:
            return None

    async def authenticate_user(self, login: str, password: str) -> Optional[User]:
        """Аутентификация юзера по логину и паролю"""
        result = await self.db.execute(select(User).where(User.login == login))
        user = result.scalar_one_or_none()

        if not user:
            return None

        if not verify_password(password, user.hashed_password):
            return None

        return user

    async def get_current_user(self, credentials: HTTPAuthorizationCredentials) -> User:
        token = credentials.credentials

        token_data = self.verify_token(token, "access")
        if not token_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Невалидный токен или токен истёк",
                headers={"WWW-Authenticate": "Bearer"},
            )

        result = await self.db.execute(
            select(User).where(User.id == int(token_data.sub))
        )
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Пользователь не найден",
            )

        return user

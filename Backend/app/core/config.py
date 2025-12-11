from typing import Any

from pydantic import Field, PostgresDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    PROJECT_NAME: str = "Supervisor Dashboard API"
    DEBUG: bool = Field(default=False)
    VERSION: str = "0.0.1"

    DB_URL: PostgresDsn

    @field_validator("DB_URL", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: Any) -> Any:
        if isinstance(v, str) and v.startswith("postgres://"):
            return v.replace("postgres://", "postgres+asyncpg://", 1)
        return v


settings = Settings()

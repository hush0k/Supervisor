from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    create_async_engine,
    async_sessionmaker,
    AsyncSession,
)
from sqlalchemy.orm import declarative_base

from Backend.app.core.config import settings

Base = declarative_base()


class DatabaseManager:
    def __init__(self):
        self.engine: AsyncEngine = create_async_engine(
            str(settings.DB_URL), future=True
        )

        self.AsyncSessionLocal: async_sessionmaker[AsyncSession] = async_sessionmaker(
            self.engine, class_=AsyncSession, expire_on_commit=False
        )

    async def get_db_session(self) -> AsyncGenerator[AsyncSession, None]:
        async with self.AsyncSessionLocal() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                pass

    async def init_db(self):
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)


db_manager = DatabaseManager()

get_db = db_manager.get_db_session

init_db = db_manager.init_db

Base = Base

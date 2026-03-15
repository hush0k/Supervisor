from contextlib import asynccontextmanager

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.db import init_db
from app.modules.statistics.api.task_points_history import task_points_history_service
from app.modules.statistics.models import user_statistic

# Import all models to register them with SQLAlchemy before any queries
# Order matters: import models that are referenced by relationships FIRST
from app.modules.users.models.position import Position  # noqa: F401
from app.modules.company.model.company import Company  # noqa: F401
from app.modules.task.model.task import Task  # noqa: F401
from app.modules.task_operations.model.task_operation import TaskOperation  # noqa: F401
from app.modules.statistics.models.user_statistic import UserStatistic  # noqa: F401
from app.modules.statistics.models.company_statistic import CompanyStatistic  # noqa: F401
from app.modules.statistics.models.task_point_history import TaskPointHistory  # noqa: F401
from app.modules.users.models.user import User  # noqa: F401

from app.modules.auth.api import auth
from app.modules.company.api import company
from app.modules.task.api import task
from app.modules.users.api import user, position
from app.modules.statistics.api import difficulty_config, task_points_history, user_statistics


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await init_db()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        debug=settings.DEBUG,
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*" ""],
    )

    app.include_router(auth.router, prefix="/api/v1")
    app.include_router(user.router, prefix="/api/v1")
    app.include_router(position.router, prefix="/api/v1")
    app.include_router(company.router, prefix="/api/v1")
    app.include_router(task.router, prefix="/api/v1")
    app.include_router(difficulty_config.router, prefix="/api/v1")
    app.include_router(task_points_history.router, prefix="/api/v1")
    app.include_router(user_statistics.router, prefix="/api/v1")

    return app


app = create_app()


@app.get("/")
async def health_check():
    return {"status": "ok", "version": settings.VERSION}

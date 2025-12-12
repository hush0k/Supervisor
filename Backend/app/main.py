from contextlib import asynccontextmanager

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from Backend.app.core.config import settings
from Backend.app.core.db import init_db
from Backend.app.modules.users.api import user


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await init_db()
    yield


def create_app() -> FastAPI:
    _app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        debug=settings.DEBUG,
        lifespan=lifespan,
    )

    _app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"
                       ""],
    )

    _app.include_router(user.router, prefix="/api/v1")

    return _app


_app = create_app()


@_app.get("/")
async def health_check():
    return {"status": "ok", "version": settings.VERSION}

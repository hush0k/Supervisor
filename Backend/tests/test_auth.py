import pytest
import pytest_asyncio
from datetime import date
from jose import jwt
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.modules.auth.service.auth import AuthService
from app.modules.users.models.user import Base as UserBase, User
from app.modules.users.models.position import Position, Base as PositionBase
from app.modules.users.schemas.user import UserCreate, UserUpdatePassword
from app.core.config import settings

# ------------------------------
# Настройка in-memory базы для тестов
# ------------------------------
DATABASE_URL = "sqlite+aiosqlite:///:memory:"
engine = create_async_engine(DATABASE_URL, echo=False, future=True)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

@pytest_asyncio.fixture(scope="model")
async def db_session():
    # Создаем таблицы
    async with engine.begin() as conn:
        await conn.run_sync(PositionBase.metadata.create_all)
        await conn.run_sync(UserBase.metadata.create_all)

    async with AsyncSessionLocal() as session:
        yield session

# ------------------------------
# Фикстура Position
# ------------------------------
@pytest_asyncio.fixture
async def test_position(db_session):
    pos = Position(name="Developer")
    db_session.add(pos)
    await db_session.commit()
    await db_session.refresh(pos)
    return pos

# ------------------------------
# Фикстура User
# ------------------------------
@pytest_asyncio.fixture
async def test_user(db_session, test_position):
    user_in = UserCreate(
        login="anna",
        password="StrongPass1!",
        first_name="Anna",
        last_name="Taylor",
        date_of_birth=date(1992, 2, 2),
        salary=1200,
        position_id=test_position.id
    )
    # Хэшируем пароль
    from app.core.security import hash_password
    user = User(
        **user_in.model_dump(exclude={"password"}),
        hashed_password=hash_password(user_in.password)
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

# ------------------------------
# Фикстура AuthService
# ------------------------------
@pytest_asyncio.fixture
async def auth_service(db_session):
    return AuthService(db_session)

# ------------------------------
# Тесты
# ------------------------------
@pytest.mark.asyncio
async def test_authenticate_user_success(auth_service, test_user):
    user = await auth_service.authenticate_user("anna", "StrongPass1!")
    assert user is not None
    assert user.login == "anna"

@pytest.mark.asyncio
async def test_authenticate_user_fail_wrong_password(auth_service, test_user):
    user = await auth_service.authenticate_user("anna", "WrongPass!")
    assert user is None

@pytest.mark.asyncio
async def test_create_access_and_refresh_token(auth_service, test_user):
    access_token = auth_service.create_access_token(test_user.id)
    refresh_token = auth_service.create_refresh_token(test_user.id)

    access_payload = jwt.decode(access_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    refresh_payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

    assert access_payload["sub"] == str(test_user.id)
    assert refresh_payload["sub"] == str(test_user.id)

@pytest.mark.asyncio
async def test_verify_token(auth_service, test_user):
    token = auth_service.create_access_token(test_user.id)
    payload = auth_service.verify_token(token, "access")
    assert payload is not None
    assert payload.sub == str(test_user.id)

@pytest.mark.asyncio
async def test_get_current_user(auth_service, test_user):
    token = auth_service.create_access_token(test_user.id)

    class DummyCreds:
        credentials = token

    user = await auth_service.get_current_user(DummyCreds())
    assert user is not None
    assert user.id == test_user.id

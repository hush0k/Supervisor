# Backend/tests/test_user.py
import pytest_asyncio
import pytest
from datetime import date

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from app.modules.users.models.user import Base as UserBaseModel
from app.modules.users.models.position import Base as PositionBaseModel
from app.modules.users.services.user import UserService
from app.modules.users.services.position import PositionServices
from app.modules.users.schemas.user import UserCreate, UserUpdate, UserUpdatePassword, UserFilter, UserSort
from app.modules.users.schemas.position import PositionCreate
from app.core.enums import Role

# ---------------- Настройка тестовой базы ----------------
DATABASE_URL = "sqlite+aiosqlite:///:memory:"
engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

@pytest_asyncio.fixture(scope="model", autouse=True)
async def setup_db():
    """Создаём таблицы перед тестами и удаляем после"""
    async with engine.begin() as conn:
        await conn.run_sync(UserBaseModel.metadata.create_all)
        await conn.run_sync(PositionBaseModel.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(UserBaseModel.metadata.drop_all)
        await conn.run_sync(PositionBaseModel.metadata.drop_all)

@pytest_asyncio.fixture
async def db_session():
    async with AsyncSessionLocal() as session:
        yield session

@pytest_asyncio.fixture
async def position_service(db_session):
    return PositionServices(db_session)

@pytest_asyncio.fixture
async def user_service(db_session):
    return UserService(db_session)

@pytest_asyncio.fixture
async def test_position(position_service):
    pos_in = PositionCreate(name="Developer")
    position = await position_service.create(pos_in)
    return position

# ---------------- CRUD тесты User ----------------
@pytest.mark.asyncio
async def test_create_user(user_service, test_position):
    user_in = UserCreate(
        login="john_doe",
        password="StrongPass1!",
        first_name="John",
        last_name="Doe",
        date_of_birth=date(1990, 1, 1),
        salary=1000,
        position_id=test_position.id
    )
    user = await user_service.create(user_in)
    assert user.id is not None
    assert user.login == "john_doe"

@pytest.mark.asyncio
async def test_get_user_by_id(user_service, test_position):
    user_in = UserCreate(
        login="jane_doe",
        password="StrongPass1!",
        first_name="Jane",
        last_name="Doe",
        date_of_birth=date(1995, 5, 5),
        salary=2000,
        position_id=test_position.id
    )
    user = await user_service.create(user_in)
    fetched_user = await user_service.get_by_id(user.id)
    assert fetched_user.login == "jane_doe"

@pytest.mark.asyncio
async def test_update_user(user_service, test_position):
    user_in = UserCreate(
        login="mike",
        password="StrongPass1!",
        first_name="Mike",
        last_name="Smith",
        date_of_birth=date(1985, 3, 3),
        salary=1500,
        position_id=test_position.id
    )
    user = await user_service.create(user_in)

    update_data = UserUpdate(first_name="Michael", salary=1800)
    updated_user = await user_service.update(user.id, update_data)
    assert updated_user.first_name == "Michael"
    assert updated_user.salary == 1800

@pytest.mark.asyncio
async def test_update_password(user_service, test_position):
    # Создаём пользователя
    user_in = UserCreate(
        login="anna",
        password="StrongPass1!",
        first_name="Anna",
        last_name="Taylor",
        date_of_birth=date(1992, 2, 2),
        salary=1200,
        position_id=test_position.id
    )
    user = await user_service.create(user_in)

    # Сохраняем старый хэш
    old_hashed = user.hashed_password

    # Данные для смены пароля
    passwords = UserUpdatePassword(
        old_password="StrongPass1!",
        new_password="NewStrongPass1!",
        repeat_new_password="NewStrongPass1!"
    )

    # Вызываем метод смены пароля
    updated_user = await user_service.update_password(user.id, passwords)
    assert updated_user is not None

    # Проверяем, что хэш изменился
    assert updated_user.hashed_password != old_hashed

    # Дополнительно: проверяем, что новый пароль валидный
    from app.core.security import verify_password
    assert verify_password("NewStrongPass1!", updated_user.hashed_password)

@pytest.mark.asyncio
async def test_delete_user(user_service, test_position):
    user_in = UserCreate(
        login="delete_me",
        password="StrongPass1!",
        first_name="Delete",
        last_name="Me",
        date_of_birth=date(2000, 1, 1),
        salary=1000,
        position_id=test_position.id
    )
    user = await user_service.create(user_in)
    result = await user_service.delete(user.id)
    assert result is True
    deleted_user = await user_service.get_by_id(user.id)
    assert deleted_user is None

# ---------------- Тест фильтров и сортировки ----------------
@pytest.mark.asyncio
async def test_get_all_users_filters_and_sort(user_service, test_position):
    users_data = [
        UserCreate(
            login="alice",
            password="StrongPass1!",
            first_name="Alice",
            last_name="Wonder",
            date_of_birth=date(1990, 1, 1),
            salary=3000,
            position_id=test_position.id
        ),
        UserCreate(
            login="bob",
            password="StrongPass1!",
            first_name="Bob",
            last_name="Builder",
            date_of_birth=date(1992, 2, 2),
            salary=2500,
            position_id=test_position.id
        ),
        UserCreate(
            login="carol",
            password="StrongPass1!",
            first_name="Carol",
            last_name="King",
            date_of_birth=date(1995, 3, 3),
            salary=4000,
            position_id=test_position.id
        ),
    ]
    for u in users_data:
        await user_service.create(u)

    # проверка сортировки по salary asc
    user_list = await user_service.get_all(
        filters=UserFilter(min_salary=2500, max_salary=4000),
        sort=UserSort(field="salary", order="asc")
    )
    salaries = [u.salary for u in user_list]
    assert salaries == sorted(salaries)

    # проверка поиска по имени
    user_list_search = await user_service.get_all(
        filters=UserFilter(search="Alice"),
        sort=UserSort(field="id", order="asc")
    )
    assert len(user_list_search) == 1
    assert user_list_search[0].first_name == "Alice"

    # проверка фильтра по роли
    user_list_role = await user_service.get_all(
        filters=UserFilter(role=Role.USER),
        sort=UserSort(field="id", order="asc")
    )
    assert all(u.role == Role.USER for u in user_list_role)

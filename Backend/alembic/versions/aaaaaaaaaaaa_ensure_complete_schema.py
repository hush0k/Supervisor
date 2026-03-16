"""Ensure complete schema for fresh deployments

Revision ID: aaaaaaaaaaaa
Revises: 7c09d1d7f3f6
Create Date: 2026-03-16 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'aaaaaaaaaaaa'
down_revision: Union[str, Sequence[str], None] = '7c09d1d7f3f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create all missing tables and fix user table columns."""
    bind = op.get_bind()

    # Import all models to ensure Base.metadata is fully populated
    from app.core.db import Base
    import app.modules.users.models.user  # noqa
    import app.modules.users.models.position  # noqa
    import app.modules.company.model.company  # noqa
    import app.modules.task.model.task  # noqa
    import app.modules.task_operations.model.task_operation  # noqa
    import app.modules.statistics.models.user_statistic  # noqa
    import app.modules.statistics.models.company_statistic  # noqa
    import app.modules.statistics.models.task_point_history  # noqa
    import app.modules.statistics.models.difficulty_config  # noqa

    # Create all tables that don't exist yet (skips existing ones)
    Base.metadata.create_all(bind=bind, checkfirst=True)

    # Add missing columns to 'user' table (create_all skips existing tables)
    op.execute("""
        DO $$ BEGIN
            ALTER TABLE "user" ADD COLUMN company_id INTEGER;
        EXCEPTION WHEN duplicate_column THEN NULL;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            ALTER TABLE "user" ADD CONSTRAINT user_company_id_fkey
                FOREIGN KEY (company_id) REFERENCES company(id);
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            ALTER TABLE "user" ADD COLUMN bonus INTEGER;
        EXCEPTION WHEN duplicate_column THEN NULL;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            ALTER TABLE "user" ALTER COLUMN position_id DROP NOT NULL;
        EXCEPTION WHEN others THEN NULL;
        END $$;
    """)


def downgrade() -> None:
    pass

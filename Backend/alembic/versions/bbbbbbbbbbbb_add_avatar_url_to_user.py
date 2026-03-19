"""Add avatar_url to user table

Revision ID: bbbbbbbbbbbb
Revises: aaaaaaaaaaaa
Create Date: 2026-03-19 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'bbbbbbbbbbbb'
down_revision: Union[str, Sequence[str], None] = 'aaaaaaaaaaaa'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        DO $$ BEGIN
            ALTER TABLE "user" ADD COLUMN avatar_url VARCHAR(500);
        EXCEPTION WHEN duplicate_column THEN NULL;
        END $$;
    """)


def downgrade() -> None:
    op.execute("""
        DO $$ BEGIN
            ALTER TABLE "user" DROP COLUMN avatar_url;
        EXCEPTION WHEN undefined_column THEN NULL;
        END $$;
    """)
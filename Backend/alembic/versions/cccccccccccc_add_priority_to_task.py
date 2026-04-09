"""Add priority to task table

Revision ID: cccccccccccc
Revises: 7715c54bb51f
Create Date: 2026-04-07 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op

revision: str = 'cccccccccccc'
down_revision: Union[str, Sequence[str], None] = '7715c54bb51f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        DO $$ BEGIN
            ALTER TABLE task ADD COLUMN priority VARCHAR(20) NOT NULL DEFAULT 'medium';
        EXCEPTION WHEN duplicate_column THEN NULL;
        END $$;
    """)


def downgrade() -> None:
    op.execute("""
        DO $$ BEGIN
            ALTER TABLE task DROP COLUMN priority;
        EXCEPTION WHEN undefined_column THEN NULL;
        END $$;
    """)

"""Normalize task priority values to lowercase enum values

Revision ID: dddddddddddd
Revises: cccccccccccc
Create Date: 2026-04-08 21:25:00.000000

"""

from typing import Sequence, Union

from alembic import op


revision: str = "dddddddddddd"
down_revision: Union[str, Sequence[str], None] = "cccccccccccc"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        UPDATE task
        SET priority = LOWER(priority)
        WHERE priority IS NOT NULL
        """
    )


def downgrade() -> None:
    op.execute(
        """
        UPDATE task
        SET priority = UPPER(priority)
        WHERE priority IS NOT NULL
        """
    )


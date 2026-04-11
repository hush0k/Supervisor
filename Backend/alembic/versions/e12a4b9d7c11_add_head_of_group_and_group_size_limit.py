"""add head_of_group to position and group_size_limit to task

Revision ID: e12a4b9d7c11
Revises: 7db1636b0048
Create Date: 2026-04-12
"""

from alembic import op
import sqlalchemy as sa


revision = "e12a4b9d7c11"
down_revision = "7db1636b0048"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "position",
        sa.Column("head_of_group", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column("task", sa.Column("group_size_limit", sa.Integer(), nullable=True))
    op.alter_column("position", "head_of_group", server_default=None)


def downgrade() -> None:
    op.drop_column("task", "group_size_limit")
    op.drop_column("position", "head_of_group")

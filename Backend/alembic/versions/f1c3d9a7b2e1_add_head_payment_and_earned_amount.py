"""add head payment and earned amount

Revision ID: f1c3d9a7b2e1
Revises: 4b3d41fe0e29
Create Date: 2026-04-12 02:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f1c3d9a7b2e1"
down_revision: Union[str, Sequence[str], None] = "4b3d41fe0e29"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("task", sa.Column("head_payment", sa.Integer(), nullable=True))
    op.add_column(
        "task_point_history",
        sa.Column("earned_amount", sa.Integer(), server_default="0", nullable=False),
    )
    op.alter_column("task_point_history", "earned_amount", server_default=None)


def downgrade() -> None:
    op.drop_column("task_point_history", "earned_amount")
    op.drop_column("task", "head_payment")


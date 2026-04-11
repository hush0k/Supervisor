"""merge priority and group-size heads

Revision ID: 4b3d41fe0e29
Revises: dddddddddddd, e12a4b9d7c11
Create Date: 2026-04-12 00:26:02.114882

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4b3d41fe0e29'
down_revision: Union[str, Sequence[str], None] = ('dddddddddddd', 'e12a4b9d7c11')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass

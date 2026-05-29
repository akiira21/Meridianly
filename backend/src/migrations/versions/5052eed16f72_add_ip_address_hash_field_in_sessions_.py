"""Add ip_address_hash field in sessions table

Revision ID: 5052eed16f72
Revises: 8e1e3d3bac31
Create Date: 2026-05-29 21:03:29.397445

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5052eed16f72'
down_revision: Union[str, Sequence[str], None] = '8e1e3d3bac31'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_column('sessions', 'ip_address')
    op.add_column('sessions', sa.Column('ip_address_hash', sa.LargeBinary(length=16), nullable=False))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('sessions', 'ip_address_hash')
    op.add_column('sessions', sa.Column('ip_address', sa.String(length=45), nullable=True))

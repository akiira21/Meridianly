"""add_serving_units_and_ai_insights

Revision ID: e6c4170320d1
Revises: 220484e0b0d7
Create Date: 2026-06-20 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e6c4170320d1'
down_revision: Union[str, Sequence[str], None] = '220484e0b0d7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add serving_units to food_presets
    op.add_column('food_presets', sa.Column('serving_units', sa.JSON(), nullable=True))
    
    # Add serving info to food_logs
    op.add_column('food_logs', sa.Column('serving_unit', sa.String(length=20), nullable=True))
    op.add_column('food_logs', sa.Column('serving_quantity', sa.Float(), nullable=True))
    
    # Add ai_insights_enabled to users
    op.add_column('users', sa.Column('ai_insights_enabled', sa.Boolean(), server_default=sa.text('true'), nullable=False))
    
    # Create ai_insights table
    op.create_table('ai_insights',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('insight_type', sa.String(length=20), nullable=False),
        sa.Column('content', sa.JSON(), nullable=False),
        sa.Column('is_read', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.Column('generated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ai_insights_id'), 'ai_insights', ['id'], unique=False)
    op.create_index(op.f('ix_ai_insights_user_id'), 'ai_insights', ['user_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_ai_insights_user_id'), table_name='ai_insights')
    op.drop_index(op.f('ix_ai_insights_id'), table_name='ai_insights')
    op.drop_table('ai_insights')
    
    op.drop_column('users', 'ai_insights_enabled')
    
    op.drop_column('food_logs', 'serving_quantity')
    op.drop_column('food_logs', 'serving_unit')
    
    op.drop_column('food_presets', 'serving_units')

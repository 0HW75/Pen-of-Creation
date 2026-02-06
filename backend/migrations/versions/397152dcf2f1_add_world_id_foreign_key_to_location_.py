"""Add world_id foreign key to location, item, and faction tables

Revision ID: 397152dcf2f1
Revises: 15146ceeb53e
Create Date: 2026-02-06 13:52:06.919838

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '397152dcf2f1'
down_revision: Union[str, Sequence[str], None] = '15146ceeb53e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 使用batch mode来支持SQLite的外键添加
    with op.batch_alter_table('faction', schema=None) as batch_op:
        batch_op.add_column(sa.Column('world_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key('fk_faction_world_id', 'worlds', ['world_id'], ['id'])

    with op.batch_alter_table('item', schema=None) as batch_op:
        batch_op.add_column(sa.Column('world_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key('fk_item_world_id', 'worlds', ['world_id'], ['id'])

    with op.batch_alter_table('location', schema=None) as batch_op:
        batch_op.add_column(sa.Column('world_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key('fk_location_world_id', 'worlds', ['world_id'], ['id'])


def downgrade() -> None:
    """Downgrade schema."""
    # 使用batch mode来支持SQLite的外键删除
    with op.batch_alter_table('location', schema=None) as batch_op:
        batch_op.drop_constraint('fk_location_world_id', type_='foreignkey')
        batch_op.drop_column('world_id')

    with op.batch_alter_table('item', schema=None) as batch_op:
        batch_op.drop_constraint('fk_item_world_id', type_='foreignkey')
        batch_op.drop_column('world_id')

    with op.batch_alter_table('faction', schema=None) as batch_op:
        batch_op.drop_constraint('fk_faction_world_id', type_='foreignkey')
        batch_op.drop_column('world_id')

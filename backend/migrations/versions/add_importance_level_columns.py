"""添加 importance_level 列到相关表

Revision ID: add_importance_level_columns
Revises: f1a2b3c4d5e6
Create Date: 2026-03-27 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_importance_level_columns'
down_revision: Union[str, Sequence[str], None] = 'f1a2b3c4d5e6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """添加 importance_level 列到相关表"""
    tables_and_columns = [
        ('energy_systems', 'importance_level', sa.Integer(), 5),
        ('civilizations', 'importance_level', sa.Integer(), 5),
        ('political_systems', 'importance_level', sa.Integer(), 5),
        ('economic_systems', 'importance_level', sa.Integer(), 5),
        ('social_classes', 'importance_level', sa.Integer(), 5),
        ('cultural_customs', 'importance_level', sa.Integer(), 5),
        ('natural_laws', 'importance_level', sa.Integer(), 5),
        ('celestial_bodies', 'importance_level', sa.Integer(), 5),
        ('regions', 'importance_level', sa.Integer(), 5),
        ('historical_eras', 'importance_level', sa.Integer(), 5),
        ('historical_events', 'importance_level', sa.Integer(), 5),
        ('historical_figures', 'importance_level', sa.Integer(), 5),
    ]

    for table_name, column_name, column_type, default_value in tables_and_columns:
        try:
            # 检查列是否已存在
            conn = op.get_bind()
            result = conn.execute(sa.text(f"PRAGMA table_info({table_name})"))
            columns = [row[1] for row in result.fetchall()]

            if column_name not in columns:
                op.add_column(table_name, sa.Column(column_name, column_type, default=default_value))
                print(f"已添加 {column_name} 列到 {table_name} 表")
            else:
                print(f"{table_name}.{column_name} 列已存在，跳过")
        except Exception as e:
            print(f"处理 {table_name}.{column_name} 时出错: {e}")


def downgrade() -> None:
    """删除 importance_level 列"""
    tables = [
        'energy_systems', 'civilizations', 'political_systems', 'economic_systems',
        'social_classes', 'cultural_customs', 'natural_laws', 'celestial_bodies',
        'regions', 'historical_eras', 'historical_events', 'historical_figures'
    ]

    for table_name in tables:
        try:
            op.drop_column(table_name, 'importance_level')
            print(f"已删除 {table_name}.importance_level 列")
        except Exception as e:
            print(f"删除 {table_name}.importance_level 时出错: {e}")
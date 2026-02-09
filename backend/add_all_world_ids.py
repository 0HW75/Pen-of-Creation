#!/usr/bin/env python3
"""
为所有相关表添加 world_id 字段
"""

import sqlite3
import os

# 数据库路径
db_path = r'D:\个人\myproj\AI_novel_editor\backend\app\novel_editor.db'

print(f'数据库路径: {db_path}')
print(f'文件存在: {os.path.exists(db_path)}')

# 需要添加 world_id 字段的表
tables_to_update = [
    'item',
    'timeline',
    'relationship',
    'race',
    'creature',
    'special_creature',
    'ability',
    'skill',
    'talent'
]

# 连接数据库
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

for table in tables_to_update:
    print(f"\n=== {table} 表 ===")
    
    # 检查当前表结构
    cursor.execute(f"PRAGMA table_info({table})")
    columns = cursor.fetchall()
    
    # 检查是否已有 world_id 字段
    has_world_id = any(col[1] == 'world_id' for col in columns)
    
    if has_world_id:
        print(f"world_id 字段已存在，跳过")
    else:
        try:
            cursor.execute(f"ALTER TABLE {table} ADD COLUMN world_id INTEGER")
            conn.commit()
            print(f"成功添加 world_id 字段")
        except Exception as e:
            print(f"错误: {e}")

# 验证修改
print("\n=== 验证 ===")
for table in tables_to_update:
    cursor.execute(f"PRAGMA table_info({table})")
    columns = cursor.fetchall()
    has_world_id = any(col[1] == 'world_id' for col in columns)
    status = "✓" if has_world_id else "✗"
    print(f"{status} {table}")

conn.close()
print("\n完成!")

import sqlite3
import os

# 数据库路径
db_path = r'D:\个人\myproj\AI_novel_editor\backend\app\novel_editor.db'

print(f'数据库路径: {db_path}')
print(f'文件存在: {os.path.exists(db_path)}')

# 连接数据库
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 为 location 表添加 world_id 字段
print("\n=== Location 表 ===")
cursor.execute("PRAGMA table_info(location)")
columns = cursor.fetchall()
has_world_id = any(col[1] == 'world_id' for col in columns)

if has_world_id:
    print("world_id 字段已存在，无需修改")
else:
    try:
        cursor.execute("ALTER TABLE location ADD COLUMN world_id INTEGER")
        conn.commit()
        print("成功添加 world_id 字段到 location 表")
    except Exception as e:
        print(f"错误: {e}")

# 为 faction 表添加 world_id 字段
print("\n=== Faction 表 ===")
cursor.execute("PRAGMA table_info(faction)")
columns = cursor.fetchall()
has_world_id = any(col[1] == 'world_id' for col in columns)

if has_world_id:
    print("world_id 字段已存在，无需修改")
else:
    try:
        cursor.execute("ALTER TABLE faction ADD COLUMN world_id INTEGER")
        conn.commit()
        print("成功添加 world_id 字段到 faction 表")
    except Exception as e:
        print(f"错误: {e}")

# 验证修改
print("\n=== 验证 ===")
cursor.execute("PRAGMA table_info(location)")
print("Location表字段:")
for col in cursor.fetchall():
    if col[1] in ['id', 'project_id', 'world_id', 'name']:
        print(f"  {col[1]}: {col[2]} (notnull={col[3]})")

cursor.execute("PRAGMA table_info(faction)")
print("\nFaction表字段:")
for col in cursor.fetchall():
    if col[1] in ['id', 'project_id', 'world_id', 'name']:
        print(f"  {col[1]}: {col[2]} (notnull={col[3]})")

conn.close()
print("\n完成!")

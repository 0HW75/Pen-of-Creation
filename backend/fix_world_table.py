import sqlite3
import os

# 数据库路径
db_path = r'D:\个人\myproj\AI_novel_editor\backend\app\novel_editor.db'

print(f'数据库路径: {db_path}')
print(f'文件存在: {os.path.exists(db_path)}')

# 连接数据库
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 检查当前表结构
cursor.execute("PRAGMA table_info(worlds)")
columns = cursor.fetchall()
print("\n当前表结构:")
for col in columns:
    print(f"  {col[1]}: type={col[2]}, notnull={col[3]}")

# 检查是否已有 project_id 字段
has_project_id = any(col[1] == 'project_id' for col in columns)

if has_project_id:
    print("\nproject_id 字段已存在，无需修改")
else:
    # 添加 project_id 字段
    try:
        cursor.execute("ALTER TABLE worlds ADD COLUMN project_id INTEGER")
        conn.commit()
        print("\n成功添加 project_id 字段")
    except Exception as e:
        print(f"\n错误: {e}")

# 验证修改
cursor.execute("PRAGMA table_info(worlds)")
columns = cursor.fetchall()
print("\n修改后的表结构:")
for col in columns:
    print(f"  {col[1]}: type={col[2]}, notnull={col[3]}")

conn.close()
print("\n完成!")

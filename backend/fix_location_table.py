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
cursor.execute("PRAGMA table_info(location)")
columns = cursor.fetchall()
print("\n当前表结构:")
for col in columns:
    if col[1] == 'project_id':
        print(f"  {col[1]}: type={col[2]}, notnull={col[3]}, dflt_value={col[4]}")

# 修改 project_id 字段为可空
try:
    # SQLite 不直接支持修改列，需要重建表
    cursor.execute("""
        CREATE TABLE location_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER,
            name VARCHAR(255) NOT NULL,
            description TEXT DEFAULT '',
            location_type VARCHAR(100) DEFAULT '城市',
            region VARCHAR(255) DEFAULT '',
            geographical_location TEXT DEFAULT '',
            terrain TEXT DEFAULT '',
            climate TEXT DEFAULT '',
            special_environment TEXT DEFAULT '',
            controlling_faction VARCHAR(255) DEFAULT '',
            population_composition TEXT DEFAULT '',
            economic_status TEXT DEFAULT '',
            cultural_features TEXT DEFAULT '',
            overall_layout TEXT DEFAULT '',
            functional_areas TEXT DEFAULT '',
            key_buildings TEXT DEFAULT '',
            secret_areas TEXT DEFAULT '',
            defense_facilities TEXT DEFAULT '',
            guard_force TEXT DEFAULT '',
            defense_weaknesses TEXT DEFAULT '',
            emergency_plans TEXT DEFAULT '',
            main_resources TEXT DEFAULT '',
            potential_dangers TEXT DEFAULT '',
            access_restrictions TEXT DEFAULT '',
            survival_conditions TEXT DEFAULT '',
            importance INTEGER DEFAULT 0,
            FOREIGN KEY (project_id) REFERENCES project (id)
        )
    """)
    
    # 复制数据
    cursor.execute("""
        INSERT INTO location_new SELECT * FROM location
    """)
    
    # 删除旧表
    cursor.execute("DROP TABLE location")
    
    # 重命名新表
    cursor.execute("ALTER TABLE location_new RENAME TO location")
    
    conn.commit()
    print("\n表结构修改成功!")
    
    # 验证修改
    cursor.execute("PRAGMA table_info(location)")
    columns = cursor.fetchall()
    print("\n修改后的表结构:")
    for col in columns:
        if col[1] == 'project_id':
            print(f"  {col[1]}: type={col[2]}, notnull={col[3]}, dflt_value={col[4]}")
        
except Exception as e:
    print(f"\n错误: {e}")
    conn.rollback()
finally:
    conn.close()

import sqlite3
import os

# 正确的数据库路径
db_path = r'D:\个人\myproj\AI_novel_editor\backend\app\novel_editor.db'

print(f'数据库路径: {db_path}')
print(f'文件存在: {os.path.exists(db_path)}')

# 连接数据库
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 检查当前表结构
cursor.execute("PRAGMA table_info(character)")
columns = cursor.fetchall()
print("\n当前表结构:")
for col in columns:
    if col[1] == 'project_id':
        print(f"  {col[1]}: type={col[2]}, notnull={col[3]}, dflt_value={col[4]}")

# 修改 project_id 字段为可空
try:
    # SQLite 不直接支持修改列，需要重建表
    cursor.execute("""
        CREATE TABLE character_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER,
            world_id INTEGER,
            name VARCHAR(255) NOT NULL,
            alternative_names TEXT DEFAULT '',
            description TEXT DEFAULT '',
            character_type VARCHAR(50) DEFAULT '配角',
            role_type VARCHAR(50) DEFAULT '配角',
            status VARCHAR(50) DEFAULT '存活',
            importance_level INTEGER DEFAULT 5,
            race VARCHAR(100) DEFAULT '',
            gender VARCHAR(50) DEFAULT '',
            age INTEGER DEFAULT 0,
            birth_date VARCHAR(100) DEFAULT '',
            death_date VARCHAR(100) DEFAULT '',
            appearance TEXT DEFAULT '',
            appearance_age INTEGER DEFAULT 0,
            distinguishing_features TEXT DEFAULT '',
            personality TEXT DEFAULT '',
            background TEXT DEFAULT '',
            character_arc TEXT DEFAULT '',
            motivation TEXT DEFAULT '',
            secrets TEXT DEFAULT '',
            birthplace VARCHAR(255) DEFAULT '',
            nationality VARCHAR(255) DEFAULT '',
            occupation VARCHAR(255) DEFAULT '',
            faction VARCHAR(255) DEFAULT '',
            current_location VARCHAR(255) DEFAULT '',
            core_traits TEXT DEFAULT '',
            psychological_fear TEXT DEFAULT '',
            "values" TEXT DEFAULT '',
            growth_experience TEXT DEFAULT '',
            important_turning_points TEXT DEFAULT '',
            psychological_trauma TEXT DEFAULT '',
            physical_abilities TEXT DEFAULT '',
            intelligence_perception TEXT DEFAULT '',
            special_talents TEXT DEFAULT '',
            current_level VARCHAR(50) DEFAULT '',
            special_abilities TEXT DEFAULT '',
            ability_levels TEXT DEFAULT '',
            ability_limits TEXT DEFAULT '',
            growth_path TEXT DEFAULT '',
            common_equipment TEXT DEFAULT '',
            special_items TEXT DEFAULT '',
            personal_items TEXT DEFAULT '',
            key_items TEXT DEFAULT '',
            family_members TEXT DEFAULT '',
            family_background TEXT DEFAULT '',
            close_friends TEXT DEFAULT '',
            mentor_student TEXT DEFAULT '',
            colleagues TEXT DEFAULT '',
            grudges TEXT DEFAULT '',
            love_relationships TEXT DEFAULT '',
            complex_emotions TEXT DEFAULT '',
            unrequited_love TEXT DEFAULT '',
            emotional_changes TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES project (id),
            FOREIGN KEY (world_id) REFERENCES worlds (id)
        )
    """)
    
    # 复制数据
    cursor.execute("""
        INSERT INTO character_new SELECT * FROM character
    """)
    
    # 删除旧表
    cursor.execute("DROP TABLE character")
    
    # 重命名新表
    cursor.execute("ALTER TABLE character_new RENAME TO character")
    
    conn.commit()
    print("\n表结构修改成功!")
    
    # 验证修改
    cursor.execute("PRAGMA table_info(character)")
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

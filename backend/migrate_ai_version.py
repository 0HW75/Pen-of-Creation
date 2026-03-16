"""
数据库迁移脚本：添加AI生成版本管理表
"""
import sqlite3
import os

# 数据库路径
DB_PATH = os.path.join(os.path.dirname(__file__), 'novel_editor.db')

def migrate():
    """执行迁移"""
    print(f"正在连接数据库: {DB_PATH}")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # 检查表是否已存在
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='ai_generation_versions'")
        if cursor.fetchone():
            print("表 ai_generation_versions 已存在，跳过创建")
        else:
            print("创建表 ai_generation_versions...")
            
            # 创建AI生成版本表
            cursor.execute('''
                CREATE TABLE ai_generation_versions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    project_id INTEGER NOT NULL,
                    entity_type VARCHAR(50) NOT NULL,
                    entity_id INTEGER NOT NULL,
                    version_number INTEGER DEFAULT 1,
                    version_name VARCHAR(255) DEFAULT '',
                    content TEXT DEFAULT '',
                    prompt TEXT DEFAULT '',
                    provider VARCHAR(50) DEFAULT '',
                    temperature FLOAT DEFAULT 0.7,
                    is_current BOOLEAN DEFAULT 0,
                    is_favorite BOOLEAN DEFAULT 0,
                    parent_version_id INTEGER,
                    generation_params TEXT DEFAULT '{}',
                    word_count INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (project_id) REFERENCES project (id),
                    FOREIGN KEY (parent_version_id) REFERENCES ai_generation_versions (id)
                )
            ''')
            
            # 创建索引
            cursor.execute('''
                CREATE INDEX idx_ai_versions_project ON ai_generation_versions (project_id)
            ''')
            cursor.execute('''
                CREATE INDEX idx_ai_versions_entity ON ai_generation_versions (entity_type, entity_id)
            ''')
            cursor.execute('''
                CREATE INDEX idx_ai_versions_current ON ai_generation_versions (entity_type, entity_id, is_current)
            ''')
            
            print("表和索引创建成功")
        
        conn.commit()
        print("迁移完成")
        
    except Exception as e:
        conn.rollback()
        print(f"迁移失败: {str(e)}")
        raise
    finally:
        conn.close()

if __name__ == '__main__':
    migrate()

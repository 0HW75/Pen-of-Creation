"""
数据库迁移脚本：为 chapter 表添加 volume 字段
"""
import sqlite3
import os

# 获取数据库路径
basedir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
db_path = os.path.join(basedir, 'app.db')

def migrate():
    """添加 volume 字段到 chapter 表"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # 检查 volume 字段是否已存在
        cursor.execute("PRAGMA table_info(chapter)")
        columns = cursor.fetchall()
        column_names = [col[1] for col in columns]

        if 'volume' not in column_names:
            # 添加 volume 字段
            cursor.execute("ALTER TABLE chapter ADD COLUMN volume VARCHAR(255) DEFAULT ''")
            conn.commit()
            print("✅ 成功添加 volume 字段到 chapter 表")
        else:
            print("✅ volume 字段已存在，无需添加")

    except Exception as e:
        print(f"❌ 迁移失败: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == '__main__':
    migrate()

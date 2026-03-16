import sqlite3
import os

# 两个数据库路径
db1 = 'novel_editor.db'
db2 = 'app/novel_editor.db'

print('数据库文件分析')
print('=' * 60)

for db_path in [db1, db2]:
    print(f'\n路径: {db_path}')
    print(f'存在: {os.path.exists(db_path)}')
    if os.path.exists(db_path):
        size = os.path.getsize(db_path)
        print(f'大小: {size} bytes')
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 获取所有表
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        print(f'表数量: {len(tables)}')
        
        # 检查关键表的数据量
        for table in ['project', 'worlds', 'character', 'chapter']:
            try:
                cursor.execute(f'SELECT COUNT(*) FROM {table}')
                count = cursor.fetchone()[0]
                print(f'  {table}: {count} 条记录')
            except:
                print(f'  {table}: 表不存在')
        
        conn.close()

print('\n' + '=' * 60)
print('影响分析:')
print('1. 应用实际使用的是 app/novel_editor.db')
print('2. 根目录的 novel_editor.db 是孤立的数据库')
print('3. 这会导致数据不一致和丢失的风险')

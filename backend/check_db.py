from app import create_app, db
from sqlalchemy import inspect

app = create_app()

with app.app_context():
    inspector = inspect(db.engine)
    
    # 获取所有表名
    tables = inspector.get_table_names()
    print("数据库中的表:")
    for table in tables:
        print(f"  - {table}")
    
    # 检查character表的列
    if 'character' in tables:
        print("\ncharacter表的列:")
        columns = inspector.get_columns('character')
        for col in columns:
            print(f"  - {col['name']}: {col['type']}")
    else:
        print("\ncharacter表不存在!")

from app import create_app, db
from sqlalchemy import text

app = create_app()

with app.app_context():
    # 检查character表是否存在这些列
    from sqlalchemy import inspect
    inspector = inspect(db.engine)
    columns = [col['name'] for col in inspector.get_columns('character')]
    
    print("当前character表的列:", columns)
    
    # 需要添加的列
    columns_to_add = [
        ('world_id', 'INTEGER'),
        ('alternative_names', 'TEXT'),
        ('role_type', 'VARCHAR(50)'),
        ('importance_level', 'INTEGER'),
        ('birth_date', 'VARCHAR(100)'),
        ('death_date', 'VARCHAR(100)'),
        ('appearance_age', 'INTEGER'),
        ('distinguishing_features', 'TEXT'),
    ]
    
    for col_name, col_type in columns_to_add:
        if col_name not in columns:
            print(f"添加列: {col_name} ({col_type})")
            try:
                db.session.execute(text(f'ALTER TABLE character ADD COLUMN {col_name} {col_type}'))
                db.session.commit()
                print(f"  ✓ 成功添加 {col_name}")
            except Exception as e:
                print(f"  ✗ 添加失败: {e}")
                db.session.rollback()
        else:
            print(f"列已存在: {col_name}")
    
    print("\n修复完成!")

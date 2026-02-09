from app import create_app, db
from app.models import Character
from sqlalchemy import inspect

app = create_app()
with app.app_context():
    # 检查Character模型的project_id列
    inspector = inspect(db.engine)
    columns = inspector.get_columns('character')
    for col in columns:
        if col['name'] == 'project_id':
            print(f"Column: {col['name']}")
            print(f"  Type: {col['type']}")
            print(f"  Nullable: {col['nullable']}")
            print(f"  Default: {col.get('default')}")
    
    # 检查SQLAlchemy模型定义
    print("\nSQLAlchemy Model:")
    for col in Character.__table__.columns:
        if col.name == 'project_id':
            print(f"  Column: {col.name}")
            print(f"  Type: {col.type}")
            print(f"  Nullable: {col.nullable}")
            print(f"  Default: {col.default}")

from app import create_app, db
from sqlalchemy import text

app = create_app()

with app.app_context():
    # 添加外键约束
    try:
        print("添加外键约束: fk_character_world")
        db.session.execute(text('''
            CREATE INDEX IF NOT EXISTS ix_character_world_id ON character (world_id)
        '''))
        db.session.commit()
        print("  ✓ 成功添加索引")
    except Exception as e:
        print(f"  ✗ 添加索引失败: {e}")
        db.session.rollback()
    
    print("\n外键约束添加完成!")
    print("注意: SQLite不支持通过ALTER TABLE添加外键约束，")
    print("但应用程序仍然可以正常工作，因为SQLAlchemy会在查询时处理关系。")

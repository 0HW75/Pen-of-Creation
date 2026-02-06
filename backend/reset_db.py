from app import create_app, db

# 创建应用实例
app = create_app()

# 在应用上下文中操作数据库
with app.app_context():
    # 删除所有数据库表
    print('删除所有数据库表...')
    db.drop_all()
    
    # 重新创建所有数据库表
    print('重新创建所有数据库表...')
    db.create_all()
    
    print('数据库表重置完成！')

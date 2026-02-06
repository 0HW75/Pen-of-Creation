from app import create_app

# 创建应用实例
app = create_app()

# 打印所有路由
print('后端服务器的所有路由:')
print('-' * 80)

for rule in app.url_map.iter_rules():
    methods = ', '.join(sorted(rule.methods))
    print(f'{rule.endpoint:50s} {methods:20s} {rule}')

print('-' * 80)
print('路由检查完成！')

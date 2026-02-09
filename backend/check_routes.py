#!/usr/bin/env python3
"""
检查 Flask 路由注册情况
"""

from app import create_app

app = create_app()

print("已注册的路由:")
print("-" * 50)
for rule in app.url_map.iter_rules():
    if 'api' in str(rule):
        print(f"{rule.endpoint:40s} {rule.methods} {rule}")

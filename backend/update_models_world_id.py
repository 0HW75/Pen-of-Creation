#!/usr/bin/env python3
"""
批量为模型添加 world_id 字段的脚本
"""

import re

# 读取模型文件
with open('app/models.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 需要添加 world_id 的模型列表
models_to_update = [
    'Race',
    'Creature',
    'SpecialCreature',
    'Timeline',
    'Relationship'
]

# 为每个模型添加 world_id 字段
for model_name in models_to_update:
    # 匹配类定义中的 project_id 行
    pattern = rf'(class {model_name}\(db\.Model\):.*?id = db\.Column\(db\.Integer, primary_key=True, autoincrement=True\)\n)(    project_id = db\.Column\(db\.Integer, db\.ForeignKey\(\'project\.id\'\), nullable=(False|True)\)\n)'
    replacement = r'\1\2    world_id = db.Column(db.Integer, db.ForeignKey(\'worlds.id\'), nullable=True)\n'

    content_new = re.sub(pattern, replacement, content, flags=re.DOTALL)

    if content_new == content:
        print(f"警告: {model_name} 的字段添加可能失败或已存在")
    else:
        print(f"成功为 {model_name} 添加 world_id 字段")
        content = content_new

    # 为 to_dict 方法添加 world_id
    # 匹配 to_dict 方法中的 project_id 行
    pattern_dict = rf"(class {model_name}.*?def to_dict\(self\):.*?return \{{\n)(            'id': self\.id,\n            'project_id': self\.project_id,)"
    replacement_dict = r"\1            'id': self.id,\n            'project_id': self.project_id,\n            'world_id': self.world_id,"

    content_new = re.sub(pattern_dict, replacement_dict, content, flags=re.DOTALL)

    if content_new == content:
        # 尝试另一种匹配方式
        pattern_dict2 = rf"(class {model_name}.*?def to_dict\(self\):\s*return \{{\s*'id': self\.id,\s*'project_id': self\.project_id,)"
        replacement_dict2 = r"\1\n            'world_id': self.world_id,"
        content_new = re.sub(pattern_dict2, replacement_dict2, content, flags=re.DOTALL)

    if content_new != content:
        print(f"成功为 {model_name} 的 to_dict 添加 world_id")
        content = content_new
    else:
        print(f"警告: {model_name} 的 to_dict 修改可能失败或已存在")

# 写回文件
with open('app/models.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n模型文件更新完成!")

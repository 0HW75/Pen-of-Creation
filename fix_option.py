#!/usr/bin/env python3
"""
修复所有文件中的 <Option> 为 <Select.Option>
"""

import os
import re

# 需要修复的文件列表
files_to_fix = [
    'frontend/src/pages/WorldManagement.jsx',
    'frontend/src/pages/SystemSetting.jsx',
    'frontend/src/components/WorldSetting/EnergySociety.jsx',
    'frontend/src/components/TextEditor.jsx',
    'frontend/src/components/TaskList.jsx',
    'frontend/src/components/InspirationGenerator.jsx',
    'frontend/src/components/DataVisualization.jsx',
]

base_path = r'D:\个人\myproj\AI_novel_editor'

for file_path in files_to_fix:
    full_path = os.path.join(base_path, file_path)
    
    if not os.path.exists(full_path):
        print(f"文件不存在: {file_path}")
        continue
    
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 替换 <Option 为 <Select.Option
    new_content = re.sub(r'<Option ', '<Select.Option ', content)
    # 替换 </Option> 为 </Select.Option>
    new_content = re.sub(r'</Option>', '</Select.Option>', new_content)
    
    if new_content != content:
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"已修复: {file_path}")
    else:
        print(f"无需修改: {file_path}")

print("\n完成!")

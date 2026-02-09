import re
import os

base_path = r'd:\个人\myproj\AI_novel_editor\frontend\src'

# 获取所有jsx文件
jsx_files = []
for root, dirs, files in os.walk(base_path):
    for file in files:
        if file.endswith('.jsx'):
            jsx_files.append(os.path.join(root, file))

fixed_count = 0
for file_path in jsx_files:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace styles={content: { ... } with styles={{ content: { ... } }}
        new_content = re.sub(
            r'styles=\{content:\s*\{([^}]+)\}\s*\}',
            r'styles={{ content: { \1 } }}',
            content
        )
        
        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'Fixed: {os.path.basename(file_path)}')
            fixed_count += 1
    except Exception as e:
        print(f'Error with {file_path}: {e}')

print(f'\nTotal fixed: {fixed_count} files')

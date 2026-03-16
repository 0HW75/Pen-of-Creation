import os

# 显示脚本所在目录
script_dir = os.path.dirname(__file__)
print(f'脚本所在目录: {script_dir}')

# 显示数据库相对路径
relative_path = os.path.join(script_dir, 'app', 'novel_editor.db')
print(f'数据库绝对路径: {relative_path}')

# 检查文件是否存在
print(f'文件存在: {os.path.exists(relative_path)}')

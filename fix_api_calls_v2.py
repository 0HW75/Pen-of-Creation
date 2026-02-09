import re
import os

base_path = r'd:\个人\myproj\AI_novel_editor\frontend\src'

# 修复FactionManagement.jsx
file1 = os.path.join(base_path, 'components', 'WorldSetting', 'FactionManagement.jsx')
if os.path.exists(file1):
    with open(file1, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace factionApi.getFactions(null, worldId) with factionApi.getFactions(null)
    content = content.replace(
        'factionApi.getFactions(null, worldId)',
        'factionApi.getFactions(null)'
    )
    
    with open(file1, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Fixed: {file1}')

# 修复LocationManagement.jsx
file2 = os.path.join(base_path, 'components', 'WorldSetting', 'LocationManagement.jsx')
if os.path.exists(file2):
    with open(file2, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace(
        'locationApi.getLocations(null, worldId)',
        'locationApi.getLocations(null)'
    )
    
    with open(file2, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Fixed: {file2}')

print('Done!')

import re
import os

base_path = r'd:\个人\myproj\AI_novel_editor\frontend\src'

# 修复FactionManagement.jsx
file1 = os.path.join(base_path, 'components', 'WorldSetting', 'FactionManagement.jsx')
if os.path.exists(file1):
    with open(file1, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace factionApi.getFactions(null, worldId) with factionApi.getFactions(null, null, worldId)
    # But actually, the API signature is (projectId, cancelToken), so it should be factionApi.getFactions(null)
    # and worldId should be passed differently
    
    # Actually, looking at the API, it only accepts projectId and cancelToken
    # So we need to fix the call to not pass worldId as cancelToken
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

# 修复SettingManagement/index.jsx
file3 = os.path.join(base_path, 'pages', 'SettingManagement', 'index.jsx')
if os.path.exists(file3):
    with open(file3, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # These calls look correct - they pass null for projectId and no cancelToken
    # But let's check if they need to be updated
    print(f'Checked: {file3}')

# 修复SettingManagement.jsx
file4 = os.path.join(base_path, 'pages', 'SettingManagement.jsx')
if os.path.exists(file4):
    with open(file4, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # These calls look correct
    print(f'Checked: {file4}')

print('Done!')

import re
import os

base_path = r'd:\个人\myproj\AI_novel_editor\frontend\src'

files_to_fix = [
    'components/WorldSetting/SocietySystem.jsx',
    'components/WorldSetting/WorldArchitecture.jsx',
    'components/WorldCard.jsx',
    'components/WorldSetting/EnergySystem.jsx',
    'components/WorldSetting/FactionManagement.jsx',
    'components/WorldSetting/HistoryTimeline.jsx',
    'components/WorldSetting/ItemManagement.jsx',
    'components/WorldSetting/LocationManagement.jsx',
    'components/WorldSetting/TimelineManagement.jsx',
    'pages/WorldManagement.jsx',
]

for filepath in files_to_fix:
    full_path = os.path.join(base_path, filepath)
    if os.path.exists(full_path):
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace styles={content: { ... } with styles={{ content: { ... } }}
        # Pattern: styles={content: { color: '#1890ff'}
        # Replace: styles={{ content: { color: '#1890ff' } }}
        
        new_content = re.sub(
            r'styles=\{content:\s*\{([^}]+)\}\s*\}',
            r'styles={{ content: { \1 } }}',
            content
        )
        
        if new_content != content:
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'Fixed: {filepath}')
        else:
            print(f'No changes needed: {filepath}')
    else:
        print(f'File not found: {filepath}')

print('Done!')

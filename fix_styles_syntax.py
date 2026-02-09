import re
import os

base_path = r'd:\个人\myproj\AI_novel_editor\frontend\src'

files = [
    'pages/WorldManagement.jsx',
    'components/WorldSetting/TimelineManagement.jsx',
    'components/WorldSetting/SocietySystem.jsx',
    'components/WorldSetting/LocationManagement.jsx',
    'components/WorldSetting/ItemManagement.jsx',
    'components/WorldSetting/HistoryTimeline.jsx',
    'components/WorldSetting/FactionManagement.jsx',
    'components/WorldSetting/EnergySystem.jsx',
    'components/WorldCard.jsx',
    'components/WorldSetting/WorldArchitecture.jsx',
]

for filepath in files:
    full_path = os.path.join(base_path, filepath)
    if os.path.exists(full_path):
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Fix styles={ content: { ... } } to styles={{ content: { ... } }}
        # Pattern: styles={ content: { color: '#1890ff'  } }
        # Replace: styles={{ content: { color: '#1890ff'  } }}
        
        def fix_styles(match):
            inner = match.group(1)
            return f'styles={{{inner}}}'
        
        new_content = re.sub(r'styles=\{\s*([^{].*?)\s*\}\s*\}', fix_styles, content)
        
        if new_content != content:
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'Fixed: {filepath}')
        else:
            print(f'No changes: {filepath}')
    else:
        print(f'File not found: {filepath}')

print('Done!')

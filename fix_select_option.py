import re
import os

base_path = r'd:\个人\myproj\AI_novel_editor\frontend\src'

files = [
    'components/WorldSetting/EnergySociety.jsx',
    'components/WorldSetting/WorldArchitecture.jsx',
    'components/DataVisualization.jsx',
    'pages/SystemSetting.jsx',
    'pages/ProjectManagement.jsx',
    'components/NavigationPage.jsx',
    'components/WorkAnalysis.jsx',
    'components/TextEditor.jsx',
    'components/TaskList.jsx',
    'components/InspirationGenerator.jsx'
]

for filepath in files:
    full_path = os.path.join(base_path, filepath)
    if os.path.exists(full_path):
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove const { Option } = Select;
        content = re.sub(r'const \{ Option \} = Select;\n?', '', content)
        
        # Replace <Option with <Select.Option (but not if already <Select.Option)
        content = re.sub(r'<Option(?![a-zA-Z])', '<Select.Option', content)
        
        # Replace </Option> with </Select.Option>
        content = re.sub(r'</Option>', '</Select.Option>', content)
        
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f'Fixed: {filepath}')
    else:
        print(f'File not found: {filepath}')

print('Done!')

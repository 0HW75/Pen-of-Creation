# 问题分析与解决计划

## 问题现状

从用户提供的最新 JSON 输出可以看到，AI 仍然使用了错误的键名：

| AI 返回的键名 | 应该使用的键名 |
|--------------|---------------|
| `organizations` | `factions` |
| `world_architectures` | `world_architecture` |
| items 中的"门" | 应该在 `energy_systems` |
| `social_systems` | 可能是正确的，但需要确认 |

## 原因分析

### 1. Prompt 修改可能未生效
- 用户可能还没有重新运行 Step1
- 或者后端服务需要重启才能加载新的代码

### 2. AI 对键名的理解问题
- 即使明确禁止，AI 仍然会"自作聪明"使用它认为对的同义词
- 需要更强制性的约束

### 3. 根本解决方案
**与其强制约束 AI 使用特定键名，不如让后端代码兼容 AI 可能返回的各种键名别名**

## 实施计划

### 步骤 1: 调查后端解析逻辑
- 找到解析 AI 响应的代码位置
- 确认是否对键名做了规范化处理

### 步骤 2: 修改后端兼容各种别名
在 `_parse_ai_response` 或相关解析方法中添加键名映射：

```python
# AI 可能返回的别名 -> 标准键名
key_mapping = {
    'organizations': 'factions',
    'groups': 'factions',
    'teams': 'factions',
    'world_architectures': 'world_architecture',
    'worldarchitecture': 'world_architecture',
    'items_resources': 'items',
    'equipment': 'items',
    'historical_context': 'timeline_events',
    'events': 'timeline_events',
    'relationship_networks': 'relations',
    'relationships': 'relations',
}
```

### 步骤 3: 确保合并结果时使用标准键名
- 在 `_merge_results` 方法中确保使用标准 9 种键名

### 步骤 4: 测试验证
- 不需要修改 prompt（保持简单）
- 通过后端兼容方式解决问题
- 重新运行 Step1 测试

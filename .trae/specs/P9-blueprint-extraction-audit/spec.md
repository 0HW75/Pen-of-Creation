# 故事蓝图提取设定功能一致性分析报告

## Why
需要彻查从故事蓝图提取设定的功能中，前端、后端的提取、合并、生成、检查点、保存到数据库，以及数据库中各个表、字段的逻辑关系是否一致，并输出详细的分析报告。

## What Changes
本次任务是**代码审计/分析**，不是功能修改。需要输出详细的分析报告，验证以下问题是否仍然存在：
- 前后端字段命名不一致
- API 接口参数/响应结构不匹配
- 数据库表字段与代码逻辑不匹配
- 检查点机制的问题
- 元素类型映射错误

## Impact
- 影响功能：故事蓝图提取世界观设定
- 影响代码：
  - 前端：`CreateWorldWizard`, `Step1WithStream`, `Step2ConfirmList`, `Step3Generate`
  - 后端：`worldview_extraction.py`, `worldview_generation.py`, `worldview_storage.py`, `worldview_element_extractor.py`
  - 数据库：13个设定相关表

---

# 一、整体流程梳理

## 1.1 流程图

```
Step1 (前端)                    Step2 (前端)                    Step3 (前端)
    │                              │                               │
    ▼                              ▼                               ▼
┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
│ 选择蓝图内容     │          │ 确认提取清单     │          │ 生成详细设定     │
│ - 项目          │          │ - 显示元素列表   │          │ - 分批次生成    │
│ - 范围          │          │ - 用户选择       │          │ - 实时进度      │
└────────┬────────┘          └────────┬────────┘          └────────┬────────┘
         │                            │                            │
         ▼                            │                            │
┌─────────────────┐                   │                            │
│ 调用API         │                   │                            │
│ extract-blueprint│◄─────────────────┘                            │
│ -elements-stream │                   │                            │
└────────┬────────┘                   │                            │
         │                            │                            │
         ▼                            │                            │
┌─────────────────┐                   │                            │
│ 后端处理         │                   │                            │
│ 1. 内容提取      │                   │                            │
│ 2. AI提取元素    │                   │                            │
│ 3. 保存检查点    │                   │                            │
└────────┬────────┘                   │                            │
         │                            │                            │
         ▼                            │                            │
┌─────────────────┐                   │                            │
│ 流式返回         │                   │                            │
│ - elements      │───────────────────┘                            │
│ - statistics    │                                            │
│ - story_context │                                            │
└────────┬────────┘                                            │
         │         ┌────────────────────────────────────────────┘
         │         │
         ▼         ▼
┌─────────────────┐
│ create-generation│
│ -batches        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ execute-batch   │
│ -generation-    │
│ stream          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Generator.save_│
│ to_database     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 数据库表         │
│ - Character     │
│ - Location      │
│ - Faction       │
│ - Item          │
│ - EnergySystem  │
│ - ...           │
└─────────────────┘
```

---

# 二、元素类型定义分析

## 2.1 前端定义的元素类型

**文件**: `frontend/src/components/CreateWorldWizard/Step1WithStream.jsx` L394
```javascript
target_types: [
  'characters', 'locations', 'factions', 'items',
  'world_architecture', 'energy_systems',
  'civilizations', 'social_classes', 'political_systems',
  'economic_systems', 'cultural_customs',
  'timeline_events', 'relations'
]
```
**共13种类型** ✅

## 2.2 后端提取服务定义的类型

**文件**: `backend/app/services/worldview_element_extractor.py` L65-71
```python
target_types = config.get('target_types', [
    'characters', 'locations', 'factions', 'items',
    'world_architecture', 'energy_systems',
    'civilizations', 'social_classes', 'political_systems',
    'economic_systems', 'cultural_customs',
    'timeline_events', 'relations'
])
```
**共13种类型** ✅

## 2.3 结论

前后端元素类型定义**完全一致**，均为13种类型。

---

# 三、API 接口分析

## 3.1 提取元素 API

**端点**: `POST /api/worldview/extract-blueprint-elements-stream`

### 请求结构
```javascript
{
  project_id: number,
  content_scope: {
    type: "full" | "outline" | "volume" | "chapter",
    outline_id?: number,
    volume_id?: number,
    chapter_id?: number
  },
  extraction_config: {
    target_types: string[],  // 13种类型
    strategy: "infer_potential",
    include_evidence: true
  }
}
```

### 响应结构
```javascript
{
  type: "complete",
  elements: {
    characters: [],
    locations: [],
    factions: [],
    items: [],
    world_architecture: [],
    energy_systems: [],
    timeline_events: [],
    relations: []
    // 注意：civilizations, social_classes 等已整合到上述键中
  },
  statistics: {
    characters: number,
    locations: number,
    // ...
  },
  story_context: {
    outline: string,
    volume: string,
    chapters: string[]
  },
  checkpoint_id: number
}
```

## 3.2 创建批次 API

**端点**: `POST /api/worldview/create-generation-batches`

### type_mapping (worldview_generation.py L78-92)
```python
type_mapping = {
    'characters': 'character',
    'locations': 'location',
    'factions': 'faction',
    'items': 'item',
    'world_architecture': 'dimension',      # ✅ 正确
    'energy_systems': 'energy_system',
    'civilizations': 'civilization',
    'social_classes': 'social_class',
    'political_systems': 'political_system',
    'economic_systems': 'economic_system',
    'cultural_customs': 'cultural_custom',
    'timeline_events': 'timeline',           # ✅ 正确
    'relations': 'relation'
}
```

---

# 四、数据库表结构分析

## 4.1 设定相关表一览

| 表名 | Model类 | 关键字段 | 对应元素类型 |
|-----|--------|---------|------------|
| `character` | Character | name, race, age, faction... | characters |
| `location` | Location | name, location_type, region... | locations |
| `faction` | Faction | name, faction_type, leader... | factions |
| `item` | Item | name, item_type, rarity_level... | items |
| `energy_system` | EnergySystem | name, energy_type, source... | energy_systems |
| `civilization` | Civilization | name, civilization_type... | civilizations |
| `social_class` | SocialClass | name, class_level... | social_classes |
| `political_system` | PoliticalSystem | name, government_type... | political_systems |
| `economic_system` | EconomicSystem | name, economic_model... | economic_systems |
| `cultural_custom` | CulturalCustom | name, custom_type... | cultural_customs |
| `timeline` | Timeline | name, timeline_type... | timeline_events |
| `historical_event` | HistoricalEvent | name, event_type... | (额外) |
| `dimension` | Dimension | name, dimension_type... | world_architecture |

## 4.2 EnergySystem 表结构

根据 database_schema.md L533-556:
```python
# EnergySystem 表字段
id, world_id, name, energy_type, description, source,
acquisition_method, storage_method, usage_limitations,
common_applications, rarity, stability, interaction_with_other_energies,
cultivation_method, typical_manifestations, status, order_index,
created_at, updated_at
# 注意：没有 project_id 字段
```

---

# 五、检查点机制分析

## 5.1 检查点数据模型

**表**: `AIGenerationCheckpoint`

| 字段 | 说明 |
|-----|-----|
| id | 主键 |
| session_id | 会话ID (唯一索引) |
| project_id | 项目ID |
| user_id | 用户ID |
| stage | 阶段 (extraction/generation) |
| checkpoint_type | 检查点类型 |
| checkpoint_data | JSON格式的检查点数据 |
| progress_percent | 进度百分比 |
| status | in_progress/completed/aborted |
| parent_checkpoint_id | 关联的Step1检查点ID |
| name | 检查点名称 |

## 5.2 检查点保存

**文件**: `worldview_extraction.py` L666-682
```python
checkpoint_service.save_checkpoint(
    session_id=session_id,
    project_id=project_id,
    user_id=1,
    stage='extraction',
    checkpoint_type='extraction_complete',
    data={
        'merged_result': merged_result,
        'content_scope': content_scope,
        'story_context': story_context,
        'statistics': statistics,
        'elements': integrated_elements
    },
    progress_percent=100,
    status='completed'
)
```

---

# 六、验证的问题列表

## 问题1: statistics 响应中仍包含 society_systems (低严重)

**文件**: `worldview_extraction.py` L639-648
```python
statistics = {
    'characters': len(integrated_elements.get('characters', [])),
    'locations': len(integrated_elements.get('locations', [])),
    'factions': len(integrated_elements.get('factions', [])),
    'items': len(integrated_elements.get('items', [])),
    'world_architecture': len(integrated_elements.get('world_architecture', [])),
    'energy_systems': len(integrated_elements.get('energy_systems', [])),
    'society_systems': len(integrated_elements.get('society_systems', [])),  # ⚠️ 旧名称
    'timeline_events': len(integrated_elements.get('timeline_events', [])),
    'relations': len(integrated_elements.get('relations', []))
}
```

**问题分析**:
- `society_systems` 是旧名称，后端实际已不使用
- `integrated_elements` 中不会有 `society_systems` 键
- 这行代码只会返回 0，不会造成功能错误
- 但仍是代码中的不一致（返回了不存在的键）

**建议**: 移除 `society_systems` 键，或改为正确的类型

---

# 七、已修复/正确的功能

## 7.1 前端 target_types ✅

**状态**: 已修复
- 前端现在发送完整的13种类型
- 包括 `civilizations`, `social_classes`, `political_systems`, `economic_systems`, `cultural_customs`

## 7.2 timeline_events 映射 ✅

**状态**: 已修复
- `timeline_events` 正确映射到 `timeline`
- `TimelineGenerator` 负责生成时间线设定

## 7.3 world_architecture 映射 ✅

**状态**: 已修复
- `world_architecture` 正确映射到 `dimension`
- `DimensionGenerator` 负责生成维度/位面设定

## 7.4 EnergySystemGenerator project_id ✅

**状态**: 已修复
- `EnergySystemGenerator.save_to_database()` 不再包含 `project_id` 字段
- 与 `EnergySystem` Model 定义一致

## 7.5 Generator 类型映射 ✅

**worldview_generation.py** 中的 generators 字典:
```python
generators = {
    'character': CharacterGenerator(),
    'location': LocationGenerator(),
    'item': ItemGenerator(),
    'faction': FactionGenerator(),
    'energy_system': EnergySystemGenerator(),
    'civilization': CivilizationGenerator(),
    'timeline': TimelineGenerator(),
    'dimension': DimensionGenerator(),
    'world_architecture': DimensionGenerator(),  # ✅ 复用
    'relation': RelationGenerator(),
    'social_class': SocialClassGenerator(),
    'political_system': PoliticalSystemGenerator(),
    'economic_system': EconomicSystemGenerator(),
    'cultural_custom': CulturalCustomGenerator()
}
```

---

# 八、数据流问题汇总

## 8.1 Step1 → Step2 数据传递

```javascript
// Step1 完成时
onComplete({
  projectId: values.projectId,
  contentScope,
  extractionResult: {
    elements: data.elements,
    statistics: data.statistics,
  },
  storyContext: data.story_context,  // ✅ 存在
  checkpointId: data.checkpoint_id,   // ✅ 存在
})
```

## 8.2 Step2 → Step3 数据传递

```javascript
// Step2 完成时
handleStep2Complete: async (selectedElements) => {
  const response = await worldviewGenerationApi.createGenerationBatches({
    extraction_id: step2Data.extractionId,
    elements: step2Data.elements,
    selected_elements: selectedElements,
    parent_checkpoint_id: step1Data.checkpointId,
    batch_config: {...}
  })

  setStep3Data({
    generationSessionId: response.data.data.generation_session_id,
    batches: response.data.data.batches,
    generatedWorldId: null,
    parentCheckpointId: step1Data.checkpointId,
    // ⚠️ storyContext 未显式传递
  });
}
```

---

# 九、建议修复方案

## 方案1: 修复 statistics 响应中的旧键名

```python
# worldview_extraction.py L639-648
statistics = {
    'characters': len(integrated_elements.get('characters', [])),
    'locations': len(integrated_elements.get('locations', [])),
    'factions': len(integrated_elements.get('factions', [])),
    'items': len(integrated_elements.get('items', [])),
    'world_architecture': len(integrated_elements.get('world_architecture', [])),
    'energy_systems': len(integrated_elements.get('energy_systems', [])),
    # 删除 society_systems，或添加正确的键
    'timeline_events': len(integrated_elements.get('timeline_events', [])),
    'relations': len(integrated_elements.get('relations', []))
}
```

---

# 十、验证检查清单

- [x] 前端 `target_types` 是否与后端一致 (13种)
- [x] `timeline_events` 映射是否正确 (→ timeline)
- [x] `world_architecture` 映射是否正确 (→ dimension)
- [x] `EnergySystemGenerator` 是否传入不存在的 `project_id`
- [x] `parent_checkpoint_id` 是否正确传递
- [ ] Generator 的 `save_to_database` 字段是否与 Model 一致

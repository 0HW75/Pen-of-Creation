# 分批次生成设定功能一致性深入分析

## Why

用户反馈"分批次生成详细设定"界面存在**中英文混杂问题**，同时需要分析：
1. 子类型是否被提取？
2. 提取后怎么体现在生成批次里？
3. 是否调用了生成？
4. 生成后是否调用了保存？
5. 能否正确保存到表里？

---

## 一、完整数据链路分析

### 1.1 链路总览

```
提取阶段          →     批次创建      →     生成阶段      →     保存阶段
(worldview_     →     (create_      →     (execute_     →     (save_to_
element_         →     generation_   →     batch_        →     database)
extractor)              batches)           generation)
```

---

## 二、提取阶段分析

### 2.1 当前提取的13种类型

**文件**: `worldview_element_extractor.py` L560-574

```python
type_descriptions = {
    'characters': '角色（姓名、身份、性格、能力等）',
    'locations': '地点场景（城市、建筑，自然景观等）',
    'factions': '组织势力（门派、国家、组织、机构等）',
    'items': '物品资源（武器、法宝、道具、信息载体等）',
    'world_architecture': '世界架构（世界规则、维度、地理、空间通道等）',  # ⚠️ 只提取 world_architecture
    'energy_systems': '能量体系（力量等级、修炼体系、超自然能力等）',       # ⚠️ 只提取 energy_systems
    'civilizations': '文明体系（文明类型，发展阶段、人口规模、政治体制等）',
    'social_classes': '社会阶层（贵族、平民、奴隶等不同阶层及其特权和义务）',
    'political_systems': '政治体系（政府类型、权力结构、决策流程等）',
    'economic_systems': '经济体系（货币名称、经济模式、贸易体系等）',
    'cultural_customs': '文化习俗（节日、礼仪、禁忌、传统等）',
    'timeline_events': '历史脉络（历史事件、时间线、起点事件等）',          # ⚠️ 只提取 timeline_events
    'relations': '关系网络（角色与组织关系、组织间关系等）'
}
```

### 2.2 提取阶段问题

| 用户期望的子类型 | 是否被提取 | 说明 |
|---------------|---------|------|
| **维度/位面** | ❌ 否 | 只提取 `world_architecture`，不细分 |
| **地理区域** | ❌ 否 | 只提取 `world_architecture`，不细分 |
| **天体** | ❌ 否 | 只提取 `world_architecture`，不细分 |
| **自然法则** | ❌ 否 | 只提取 `world_architecture`，不细分 |
| **能量形态** | ❌ 否 | 只提取 `energy_systems`，不细分 |
| **力量等级** | ❌ 否 | 只提取 `energy_systems`，不细分 |
| **力量代价** | ❌ 否 | 只提取 `energy_systems`，不细分 |
| **通用技能** | ❌ 否 | 只提取 `energy_systems`，不细分 |
| **历史纪元** | ❌ 否 | 只提取 `timeline_events`，不细分 |
| **历史人物** | ❌ 否 | 只提取 `timeline_events`，不细分 |
| **装备系统** | ❌ 否 | 只提取 `items`，不细分 |
| **特殊物品** | ❌ 否 | 只提取 `items`，不细分 |

**结论**：提取阶段**没有细分**，所有子类型都被归入主类型。

---

## 三、批次创建阶段分析

### 3.1 type_mapping 映射

**文件**: `worldview_generation.py` L78-92

```python
type_mapping = {
    'characters': 'character',
    'locations': 'location',
    'factions': 'faction',
    'items': 'item',
    'world_architecture': 'dimension',      # ⚠️ world_architecture 映射为 dimension
    'energy_systems': 'energy_system',
    'civilizations': 'civilization',
    'social_classes': 'social_class',
    'political_systems': 'political_system',
    'economic_systems': 'economic_system',
    'cultural_customs': 'cultural_custom',
    'timeline_events': 'timeline',          # ⚠️ timeline_events 映射为 timeline
    'relations': 'relation'
}
```

### 3.2 batch_name_map

**文件**: `worldview_generation.py` L94-108

```python
batch_name_map = {
    'energy_system': '能量体系详细设定',
    'character': '主要角色详细设定',
    'location': '地点场景详细设定',
    'faction': '组织势力详细设定',
    'civilization': '文明体系详细设定',
    'social_class': '社会阶层详细设定',
    'political_system': '政治体系详细设定',
    'economic_system': '经济体系详细设定',
    'cultural_custom': '文化习俗详细设定',
    'historical_event': '历史事件详细设定',
    'item': '物品资源详细设定',
    'world_architecture': '世界架构详细设定',  # ⚠️ 有 world_architecture
    'relation': '关系网络详细设定'
    # ⚠️ 缺少 'dimension' 映射！
    # ⚠️ 缺少 'timeline' 映射！
}
```

### 3.3 批次创建逻辑

**文件**: `worldview_generation.py` L120-149

```python
for element_type in priority_order:  # 遍历13种 element_type
    if element_type not in selected_elements:
        continue

    selected_ids = selected_elements.get(element_type, [])
    if not selected_ids:
        continue

    type_elements = elements.get(element_type, [])
    selected_type_elements = [
        el for el in type_elements
        if el.get('id') in selected_ids
    ]

    if not selected_type_elements:
        continue

    generator_type = type_mapping.get(element_type, element_type)  # 转换为 generator_type
    batch_count += 1

    batches.append({
        'batch_id': f'batch_{extraction_id}_{batch_count:03d}',
        'batch_name': batch_name_map.get(generator_type, f'{generator_type}详细设定'),
        'type': generator_type,         # ← 这个 type 会传给 Generator
        'element_type': element_type,
        'elements': selected_type_elements,
        'element_count': len(selected_type_elements),
        'status': 'pending',
        'estimated_time': f'{len(selected_type_elements) * 30}秒'
    })
```

### 3.4 批次创建阶段问题

| 用户期望的子类型 | 创建的批次type | 问题 |
|---------------|--------------|------|
| 维度/位面 | `dimension` | ❌ 批次名回退为 `dimension详细设定` |
| 地理区域 | ❌ 未创建 | RegionGenerator 永远不会被调用 |
| 天体 | ❌ 未创建 | CelestialBodyGenerator 永远不会被调用 |
| 自然法则 | ❌ 未创建 | NaturalLawGenerator 永远不会被调用 |
| 能量形态 | `energy_system` | ⚠️ 子类型未分离 |
| 力量等级 | `energy_system` | ⚠️ 子类型未分离 |
| 力量代价 | `energy_system` | ⚠️ 子类型未分离 |
| 通用技能 | `energy_system` | ⚠️ 子类型未分离 |
| 历史纪元 | `timeline` | ⚠️ 子类型未分离 |
| 历史人物 | `timeline` | ⚠️ 子类型未分离 |
| 装备系统 | `item` | ⚠️ 子类型未分离 |
| 特殊物品 | `item` | ⚠️ 子类型未分离 |

---

## 四、生成阶段分析

### 4.1 Generator 调用逻辑

**文件**: `worldview_generation.py` (execute-batch-generation 流式处理)

生成时使用 `batch.type`（即 `generator_type`）来获取对应的 Generator：

```python
generator = generators.get(entity_type)  # entity_type = batch.type
```

### 4.2 generators 字典

```python
generators = {
    'character': CharacterGenerator(),
    'location': LocationGenerator(),
    'item': ItemGenerator(),
    'faction': FactionGenerator(),
    'energy_system': EnergySystemGenerator(),
    'civilization': CivilizationGenerator(),
    'historical_event': HistoricalEventGenerator(),
    'historical_era': HistoricalEraGenerator(),      # ⚠️ 存在但 type_mapping 中没有
    'historical_figure': HistoricalFigureGenerator(), # ⚠️ 存在但 type_mapping 中没有
    'timeline': TimelineGenerator(),
    'region': RegionGenerator(),                       # ⚠️ 存在但 type_mapping 中没有
    'dimension': DimensionGenerator(),
    'celestial_body': CelestialBodyGenerator(),       # ⚠️ 存在但 type_mapping 中没有
    'natural_law': NaturalLawGenerator(),             # ⚠️ 存在但 type_mapping 中没有
    'world_architecture': DimensionGenerator(),        # ⚠️ 重复指向
    'relation': RelationGenerator(),
    'social_class': SocialClassGenerator(),
    'political_system': PoliticalSystemGenerator(),
    'economic_system': EconomicSystemGenerator(),
    'cultural_custom': CulturalCustomGenerator()
}
```

### 4.3 Generator 调用情况

| Generator | 是否会被调用 | 调用的条件 |
|-----------|------------|----------|
| DimensionGenerator | ✅ 会 | world_architecture 被选择 |
| RegionGenerator | ❌ 不会 | type_mapping 中没有 region |
| CelestialBodyGenerator | ❌ 不会 | type_mapping 中没有 celestial_body |
| NaturalLawGenerator | ❌ 不会 | type_mapping 中没有 natural_law |
| EnergySystemGenerator | ✅ 会 | energy_systems 被选择 |
| TimelineGenerator | ✅ 会 | timeline_events 被选择 |
| HistoricalEraGenerator | ❌ 不会 | type_mapping 中没有 historical_era |
| HistoricalFigureGenerator | ❌ 不会 | type_mapping 中没有 historical_figure |
| ItemGenerator | ✅ 会 | items 被选择 |
| FactionGenerator | ✅ 会 | factions 被选择 |

---

## 五、保存阶段分析

### 5.1 Generator.save_to_database 实现情况

| Generator | save_to_database 实现 | 保存到的表 | 状态 |
|-----------|---------------------|----------|------|
| DimensionGenerator | ✅ 有 | Dimension | ✅ 正确 |
| RegionGenerator | ✅ 有 | Region | ✅ 能保存，但永远不会被调用 |
| CelestialBodyGenerator | ✅ 有 | CelestialBody | ✅ 能保存，但永远不会被调用 |
| NaturalLawGenerator | ✅ 有 | NaturalLaw | ✅ 能保存，但永远不会被调用 |
| EnergySystemGenerator | ✅ 有 | EnergySystem, EnergyForm, PowerLevel, PowerCost, CommonSkill | ⚠️ 能保存，但子类型未分离 |
| TimelineGenerator | ✅ 有 | Timeline, HistoricalEra, HistoricalFigure | ⚠️ 能保存，但子类型未分离 |
| ItemGenerator | ✅ 有 | Item | ⚠️ EquipmentSystem, SpecialItem 不会被保存 |

---

## 六、完整问题汇总

### 6.1 问题1：提取阶段未细分

所有子类型都被归入主类型提取，不支持独立提取。

### 6.2 问题2：批次创建只创建主类型批次

即使提取内容包含"地理区域"、"天体"等子类型，创建批次时也只会创建 `world_architecture` 批次。

### 6.3 问题3：Generator不会被调用

5个 Generator（RegionGenerator、CelestialBodyGenerator、NaturalLawGenerator、HistoricalEraGenerator、HistoricalFigureGenerator）存在但永远不会被调用。

### 6.4 问题4：子类型未保存到正确表

- Region、CelestialBody、NaturalLaw 表永远没有数据
- HistoricalEra、HistoricalFigure 表永远没有数据
- EquipmentSystem、SpecialItem 表可能没有被正确填充

### 6.5 问题5：batch_name_map 英文残留

`dimension详细设定` 和 `timeline详细设定` 显示英文。

---

## 七、完整数据流问题表

| 子类型 | 提取 | 批次创建 | Generator调用 | 保存到表 |
|-------|-----|---------|--------------|---------|
| 维度/位面 | world_architecture | ✅ dimension | ✅ DimensionGenerator | ✅ Dimension |
| 地理区域 | world_architecture | ❌ 未创建 | ❌ RegionGenerator不调用 | ❌ Region表无数据 |
| 天体 | world_architecture | ❌ 未创建 | ❌ CelestialBodyGenerator不调用 | ❌ CelestialBody表无数据 |
| 自然法则 | world_architecture | ❌ 未创建 | ❌ NaturalLawGenerator不调用 | ❌ NaturalLaw表无数据 |
| 能量形态 | energy_systems | ✅ energy_system | ⚠️ 未分离 | ⚠️ 可能存到EnergySystem表 |
| 力量等级 | energy_systems | ✅ energy_system | ⚠️ 未分离 | ⚠️ 可能存到EnergySystem表 |
| 力量代价 | energy_systems | ✅ energy_system | ⚠️ 未分离 | ⚠️ 可能存到EnergySystem表 |
| 通用技能 | energy_systems | ✅ energy_system | ⚠️ 未分离 | ⚠️ 可能存到EnergySystem表 |
| 历史纪元 | timeline_events | ✅ timeline | ⚠️ 未分离 | ⚠️ 可能存到Timeline表 |
| 历史人物 | timeline_events | ✅ timeline | ⚠️ 未分离 | ⚠️ 可能存到Timeline表 |
| 装备系统 | items | ✅ item | ⚠️ 未分离 | ⚠️ 可能存到Item表 |
| 特殊物品 | items | ✅ item | ⚠️ 未分离 | ⚠️ 可能存到Item表 |

---

## 八、修复建议

### 8.1 紧急修复：batch_name_map（中英文混杂）

```python
batch_name_map = {
    # ... 现有 ...
    'dimension': '维度详细设定',        # 新增
    'timeline': '历史脉络详细设定',    # 新增
}
```

### 8.2 架构修复：分离子类型

需要较大改动，包括：
1. 提取阶段：拆分为独立子类型
2. type_mapping：添加新映射
3. batch_name_map：添加新映射
4. Generator：实现子类型分离逻辑

---

## 九、验证清单

### 提取阶段
- [ ] 确认 world_architecture 提取后是否包含维度/区域/天体/法则信息
- [ ] 确认 energy_systems 提取后是否包含形态/等级/代价/技能信息

### 批次创建阶段
- [ ] 确认是否创建了 dimension/timeline 批次
- [ ] 确认是否创建了 region/celestial_body/natural_law 批次

### 生成阶段
- [ ] 确认是否调用了 RegionGenerator/CelestialBodyGenerator/NaturalLawGenerator
- [ ] 确认是否调用了 HistoricalEraGenerator/HistoricalFigureGenerator

### 保存阶段
- [ ] 确认 Dimension 表有数据
- [ ] 确认 Region/CelestialBody/NaturalLaw 表是否有数据
- [ ] 确认 EnergyForm/PowerLevel/PowerCost/CommonSkill 表是否有数据
- [ ] 确认 HistoricalEra/HistoricalFigure 表是否有数据
- [ ] 确认 EquipmentSystem/SpecialItem 表是否有数据

---

## ADDED Requirements

### Requirement: 子类型提取支持

系统 SHALL 支持独立提取 world_architecture 下的四个子类型（维度/位面、地理区域、天体、自然法则）。

### Requirement: 子类型批次创建

如果提取了子类型，系统 SHALL 创建对应的子类型批次。

### Requirement: Generator 调用完整性

所有存在的 Generator 都应该在适当的条件下被调用。

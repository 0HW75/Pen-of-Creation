# 故事蓝图提取设定功能一致性审查报告（第三篇）

## 类型映射与Generator分析

**审查日期**：2026-03-27
**审查范围**：类型映射正确性、Generator与Model字段匹配度

---

## 一、类型映射机制

### 1.1 type_mapping 概述

在创建生成批次时，后端需要将提取的元素类型（如 `characters`）映射到对应的数据库Model（如 `Character`）和生成器（如 `CharacterGenerator`）。

**文件位置**：`backend/app/api/worldview_generation.py` L78-92

```python
type_mapping = {
    'characters': 'character',           # 角色
    'locations': 'location',             # 地点
    'factions': 'faction',               # 势力
    'items': 'item',                     # 物品
    'world_architecture': 'world_architecture',  # ⚠️ 问题1
    'energy_systems': 'energy_system',   # 能量系统
    'civilizations': 'civilization',     # 文明
    'social_classes': 'social_class',    # 社会阶层
    'political_systems': 'political_system',  # 政治体系
    'economic_systems': 'economic_system',    # 经济体系
    'cultural_customs': 'cultural_custom',    # 文化习俗
    'timeline_events': 'historical_event',    # ⚠️ 问题2
    'relations': 'relation'               # 关系
}
```

### 1.2 映射流程图

```
┌─────────────────┐     type_mapping      ┌─────────────────┐
│  提取元素类型     │ ──────────────────►  │  数据库Model     │
│  (characters)   │                      │  (character)     │
└─────────────────┘                      └─────────────────┘
                                                  │
                                                  ▼
                                         ┌─────────────────┐
                                         │ Generator       │
                                         │ (CharacterGenerator) │
                                         └─────────────────┘
```

---

## 二、发现的问题

### 问题1：timeline_events 映射错误 ⚠️ 高严重

#### 2.1.1 当前映射

```python
'timeline_events': 'historical_event'  # ❌ 错误
```

#### 2.1.2 问题分析

| 映射目标 | 表名 | 用途 |
|---------|------|------|
| 当前映射 | `historical_events` | 存储具体的历史事件 |
| 应该映射 | `timeline` | 存储完整的时间线 |

**原因**：

1. **Timeline 表结构**（用于个人/组织/世界的完整生命周期）：
   - `birth_growth`: 出生/成长
   - `key_events`: 关键事件
   - `development_changes`: 发展变化
   - `ending_destination`: 结局/归宿

2. **HistoricalEvent 表结构**（用于具体的历史事件）：
   - `event_type`: 事件类型
   - `start_year`, `end_year`: 起始/结束年份
   - `primary_causes`: 主要原因
   - `event_sequence`: 事件序列
   - `immediate_outcomes`: 即时后果

3. **从故事蓝图中提取的时间线**应该是：
   - "角色A的一生" → Timeline
   - "帝国建立战争" → HistoricalEvent

**结论**：提取的"时间线事件"（timeline_events）应该是完整的时间线结构，而非单一历史事件。

#### 2.1.3 修复方案

```python
'timeline_events': 'timeline'  # ✅ 修正
```

#### 2.1.4 影响范围

| 文件 | 需要修改 |
|-----|---------|
| `worldview_generation.py` L139 | `type_mapping` |

---

### 问题2：world_architecture 映射到不存在的Generator ⚠️ 高严重

#### 2.2.1 当前映射

```python
'world_architecture': 'world_architecture'  # ❌ 错误
```

#### 2.2.2 问题分析

**当前假设**：代码希望映射到 `WorldArchitectureGenerator`，但这个Generator**不存在**。

**检查 Generator 目录**：

```
backend/app/services/generation/generators/
├── __init__.py
├── base_generator.py
├── character_generator.py
├── location_generator.py
├── faction_generator.py
├── item_generator.py
├── energy_system_generator.py
├── dimension_generator.py      # ⚠️ 维度/位面
├── civilization_generator.py
├── timeline_generator.py
├── historical_event_generator.py
├── relation_generator.py
├── social_class_generator.py
├── political_system_generator.py
├── economic_system_generator.py
├── cultural_custom_generator.py
└── world_architecture_generator.py  # ❌ 不存在
```

**可用的相关Generator**：

| Generator | 用途 |
|----------|------|
| `dimension_generator.py` | 维度/位面设定 |
| `location_generator.py` | 地点设定 |

#### 2.2.3 修复方案

**方案A**：如果"世界架构"概念接近"维度/位面"
```python
'world_architecture': 'dimension'  # ✅ 映射到DimensionGenerator
```

**方案B**：如果"世界架构"是地点的特殊类型
```python
'world_architecture': 'location'  # 映射到LocationGenerator
```

**建议**：采用方案A，`DimensionGenerator` 的字段（如 `dimension_type`, `entry_conditions`, `physical_properties`）更接近"世界架构"概念。

---

## 三、Generator与Model字段匹配分析

### 3.1 分析概述

Generator 的 `save_to_database` 方法负责将AI生成的数据保存到数据库。本节分析Generator使用的字段与Model定义的字段是否匹配。

### 3.2 CharacterGenerator 分析

#### 3.2.1 Generator字段列表

**文件**：`character_generator.py` L79-129

```python
character_data = {
    'world_id': world_id,
    'project_id': project_id,
    'name': data.get('name', '未命名角色'),
    'race': data.get('race', ''),
    'gender': data.get('gender', ''),
    'age': extract_age(data.get('age', 0)),
    'description': data.get('description', ''),
    'importance_level': int(data.get('importance_level', 5)),
    # ... 更多字段
}
```

**完整字段列表**：
```
world_id, project_id, name, race, gender, age, description,
appearance, appearance_age, distinguishing_features, personality,
background, character_arc, motivation, secrets, birthplace,
nationality, occupation, faction, current_location, core_traits,
psychological_fear, values, growth_experience, important_turning_points,
psychological_trauma, physical_abilities, intelligence_perception,
special_talents, current_level, special_abilities, ability_levels,
ability_limits, growth_path, common_equipment, special_items,
personal_items, key_items, family_members, family_background,
close_friends, mentor_student, colleagues, grudges, love_relationships,
complex_emotions, unrequited_love, emotional_changes, importance_level
```

#### 3.2.2 Model字段列表

**文件**：`models.py` L187-307 (Character)

```
id, project_id, world_id, name, alternative_names, description,
character_type, role_type, status, importance_level, race, gender, age,
birth_date, death_date, appearance, appearance_age, distinguishing_features,
personality, background, character_arc, motivation, secrets, birthplace,
nationality, occupation, faction, current_location, core_traits,
psychological_fear, values, growth_experience, important_turning_points,
psychological_trauma, physical_abilities, intelligence_perception,
special_talents, current_level, special_abilities, ability_levels,
ability_limits, growth_path, common_equipment, special_items,
personal_items, key_items, family_members, family_background,
close_friends, mentor_student, colleagues, grudges, love_relationships,
complex_emotions, unrequited_love, emotional_changes, created_at, updated_at
```

#### 3.2.3 差异分析

| 方向 | 字段名 | 说明 |
|------|--------|------|
| Model 有，Generator 没有 | `alternative_names` | 别名 |
| Model 有，Generator 没有 | `character_type` | 角色类型 |
| Model 有，Generator 没有 | `role_type` | 角色定位（主角/配角/反派/龙套） |
| Model 有，Generator 没有 | `status` | 存活状态 |
| Model 有，Generator 没有 | `birth_date` | 出生日期 |
| Model 有，Generator 没有 | `death_date` | 死亡日期 |

**影响**：AI生成的Character数据缺少这些字段时，数据库会保存为空值，但不影响功能。

---

### 3.3 LocationGenerator 分析 ✅

#### 3.3.1 匹配状态：**完全匹配**

Generator使用的所有字段都存在于Model中，Model只有 `id`, `created_at`, `updated_at` 三个系统字段。

---

### 3.4 FactionGenerator 分析

#### 3.4.1 差异分析

| 方向 | 字段名 | 说明 |
|------|--------|------|
| Model 有，Generator 没有 | `logo` | 势力标志 |

**影响**：AI生成的Faction数据不会有 `logo` 字段，需手动上传。

---

### 3.5 EnergySystemGenerator 分析 ❌ 严重问题

#### 3.5.1 问题概述

**Generator 传入不存在的字段**，会导致数据库错误。

#### 3.5.2 Generator代码

**文件**：`energy_system_generator.py` L40-56

```python
energy_system_data = {
    'world_id': world_id,
    'project_id': project_id,  # ⚠️ Model没有此字段！
    'name': data.get('name', ''),
    'energy_type': data.get('energy_type', ''),
    # ... 其他字段
}
```

#### 3.5.3 Model定义

**文件**：`models.py` L1296-1342 (EnergySystem)

```
id, world_id, name, energy_type, description, source,
acquisition_method, storage_method, usage_limitations,
common_applications, rarity, stability, interaction_with_other_energies,
cultivation_method, typical_manifestations, importance_level,
status, order_index, created_at, updated_id
# ⚠️ 没有 project_id 字段！
```

#### 3.5.4 问题影响

| 错误类型 | 说明 |
|---------|------|
| `IntegrityError` | 如果数据库有外键约束 |
| `AttributeError` | SQLAlchemy尝试设置不存在的字段 |
| 数据丢失 | `project_id` 数据被忽略 |

#### 3.5.5 修复方案

**方案A**：移除 Generator 中的 `project_id`
```python
energy_system_data = {
    'world_id': world_id,
    # 'project_id': project_id,  # 删除
    'name': data.get('name', ''),
    # ...
}
```

**方案B**：在 Model 中添加 `project_id` 字段
```python
class EnergySystem(BaseModel):
    id = Column(Integer, primary_key=True)
    world_id = Column(Integer, ForeignKey('world.id'))
    project_id = Column(Integer, ForeignKey('project.id'))  # 新增
    # ... 其他字段
```

**建议**：采用方案A，因为其他同类表（如 Character, Location, Faction）可以通过查询 `world_id` 关联到 `project_id`。

---

## 四、Generator字段缺失影响汇总

### 4.1 CharacterGenerator

| 缺失字段 | 影响 | 严重程度 |
|---------|------|---------|
| `alternative_names` | 角色别名无法保存 | 低 |
| `character_type` | 角色类型无法保存 | 中 |
| `role_type` | 角色定位无法保存 | 中 |
| `status` | 存活状态无法保存 | 中 |
| `birth_date` | 出生日期无法保存 | 低 |
| `death_date` | 死亡日期无法保存 | 低 |

### 4.2 FactionGenerator

| 缺失字段 | 影响 | 严重程度 |
|---------|------|---------|
| `logo` | 势力标志无法保存 | 低 |

### 4.3 EnergySystemGenerator

| 问题字段 | 影响 | 严重程度 |
|---------|------|---------|
| `project_id` | **数据库错误** | **高** |

---

## 五、本篇小结

### 5.1 发现的问题

| # | 问题 | 严重程度 | 位置 |
|---|------|---------|------|
| 1 | `timeline_events` 映射到 `historical_event` | 高 | worldview_generation.py:139 |
| 2 | `world_architecture` 映射到不存在的Generator | 高 | worldview_generation.py:132 |
| 3 | `EnergySystemGenerator` 传入不存在的 `project_id` | 高 | energy_system_generator.py |
| 4 | `CharacterGenerator` 缺少多个字段 | 中 | character_generator.py |
| 5 | `FactionGenerator` 缺少 `logo` 字段 | 低 | faction_generator.py |

### 5.2 修复优先级

| 优先级 | 问题 | 操作 |
|-------|------|------|
| P0 | EnergySystemGenerator project_id | **立即修复**，会导致数据库错误 |
| P1 | timeline_events 映射 | 改为 `timeline` |
| P1 | world_architecture 映射 | 改为 `dimension` |
| P2 | CharacterGenerator 添加缺失字段 | 建议添加 |
| P3 | FactionGenerator 添加 logo | 建议添加 |

---

## 下篇预告

**第四篇：数据流与检查点机制分析**
- Step1 → Step2 → Step3 数据传递链路
- storyContext 丢失问题
- parent_checkpoint_id 传递分析
- 检查点数据结构一致性

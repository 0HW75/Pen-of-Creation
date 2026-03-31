# Tasks - 分批次生成设定功能一致性分析

## 任务列表

### 已完成分析

- [x] Task 1: 分析提取阶段：world_architecture等子类型是否被提取
  - [x] 结论：提取阶段**没有细分**，所有子类型都被归入主类型
  - [x] world_architecture 只提取为单一类型
  - [x] energy_systems 只提取为单一类型
  - [x] timeline_events 只提取为单一类型
  - [x] items 只提取为单一类型

- [x] Task 2: 分析批次创建阶段：子类型如何映射到batch
  - [x] type_mapping 只映射13种主类型
  - [x] 缺少 region, celestial_body, natural_law 等子类型映射
  - [x] batch_name_map 缺少 'dimension' 和 'timeline' 映射

- [x] Task 3: 分析生成阶段：是否调用了对应的Generator
  - [x] 5个Generator存在但永远不会被调用：
    - RegionGenerator
    - CelestialBodyGenerator
    - NaturalLawGenerator
    - HistoricalEraGenerator
    - HistoricalFigureGenerator

- [x] Task 4: 分析保存阶段：save_to_database是否正确保存到子表
  - [x] Generator.save_to_database 实现正确
  - [x] 但因为Generator不会被调用，所以子表永远没有数据

- [x] Task 5: 汇总完整链路问题
  - [x] 输出完整数据流问题表

---

## 完整数据流问题汇总

### 提取 → 批次 → 生成 → 保存 链路问题

| 子类型 | 提取 | 批次创建 | Generator调用 | 保存到表 |
|-------|-----|---------|--------------|---------|
| 维度/位面 | world_architecture | ✅ dimension | ✅ DimensionGenerator | ✅ Dimension |
| 地理区域 | world_architecture | ❌ 未创建 | ❌ RegionGenerator不调用 | ❌ Region表无数据 |
| 天体 | world_architecture | ❌ 未创建 | ❌ CelestialBodyGenerator不调用 | ❌ CelestialBody表无数据 |
| 自然法则 | world_architecture | ❌ 未创建 | ❌ NaturalLawGenerator不调用 | ❌ NaturalLaw表无数据 |
| 能量形态 | energy_systems | ✅ energy_system | ⚠️ 未分离 | ⚠️ 可能存错表 |
| 力量等级 | energy_systems | ✅ energy_system | ⚠️ 未分离 | ⚠️ 可能存错表 |
| 力量代价 | energy_systems | ✅ energy_system | ⚠️ 未分离 | ⚠️ 可能存错表 |
| 通用技能 | energy_systems | ✅ energy_system | ⚠️ 未分离 | ⚠️ 可能存错表 |
| 历史纪元 | timeline_events | ✅ timeline | ⚠️ 未分离 | ⚠️ 可能存错表 |
| 历史人物 | timeline_events | ✅ timeline | ⚠️ 未分离 | ⚠️ 可能存错表 |
| 装备系统 | items | ✅ item | ⚠️ 未分离 | ⚠️ EquipmentSystem表无数据 |
| 特殊物品 | items | ✅ item | ⚠️ 未分离 | ⚠️ SpecialItem表无数据 |

---

## 核心修复任务（待用户确认后执行）

### 紧急修复

- [ ] Task 6: 修复 batch_name_map（中英文混杂）
  - [ ] 6.1 补充 'dimension': '维度详细设定'
  - [ ] 6.2 补充 'timeline': '历史脉络详细设定'

### 架构修复（重大改动）

- [ ] Task 7: 评估是否需要分离子类型
  - [ ] 7.1 确认用户需求：是只需要分离世界架构四板块，还是所有子类型
  - [ ] 7.2 制定分离方案

---

## Task Dependencies

- Task 6 可以独立执行（紧急修复）
- Task 7 依赖用户确认修复范围

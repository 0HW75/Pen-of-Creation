# 分批次生成设定子类型分离修复方案

## Why

当前系统存在严重的架构问题：多个 Generator 存在但永远不会被调用，导致对应数据库表永远没有数据。需要修复提取→批次→生成→保存的完整链路。

---

## 一、问题根因

### 1.1 当前链路问题

```
提取(13种) → type_mapping → 批次(13种generator_type) → generators字典 → 保存
     ↓            ↓                  ↓                      ↓           ↓
  没有细分    缺少子类型映射      批次type不匹配          找不到对应    无法正确保存
                                                    Generator
```

### 1.2 type_mapping 现状

```python
type_mapping = {
    'characters': 'character',
    'locations': 'location',
    'factions': 'faction',
    'items': 'item',
    'world_architecture': 'dimension',        # ⚠️ 错误映射
    'energy_systems': 'energy_system',
    'civilizations': 'civilization',
    'social_classes': 'social_class',
    'political_systems': 'political_system',
    'economic_systems': 'economic_system',
    'cultural_customs': 'cultural_custom',
    'timeline_events': 'timeline',            # ⚠️ 错误映射
    'relations': 'relation'
}
```

### 1.3 generators 字典现状

```python
generators = {
    # ... 存在的Generator ...
    'dimension': DimensionGenerator(),
    'region': RegionGenerator(),                      # ⚠️ 永远不会被调用
    'celestial_body': CelestialBodyGenerator(),        # ⚠️ 永远不会被调用
    'natural_law': NaturalLawGenerator(),             # ⚠️ 永远不会被调用
    'timeline': TimelineGenerator(),
    'historical_era': HistoricalEraGenerator(),       # ⚠️ 永远不会被调用
    'historical_figure': HistoricalFigureGenerator(), # ⚠️ 永远不会被调用
    # ...
}
```

---

## 二、修复目标

### 2.1 需要支持的子类型

根据用户提供的层级结构：

| 主类型 | 子类型 | 对应Generator | 对应数据库表 |
|-------|-------|--------------|-------------|
| world_architecture | 维度/位面 | DimensionGenerator | Dimension |
| world_architecture | 地理区域 | RegionGenerator | Region |
| world_architecture | 天体 | CelestialBodyGenerator | CelestialBody |
| world_architecture | 自然法则 | NaturalLawGenerator | NaturalLaw |
| energy_system | 能量形态 | EnergySystemGenerator | EnergyForm |
| energy_system | 力量等级 | EnergySystemGenerator | PowerLevel |
| energy_system | 力量代价 | EnergySystemGenerator | PowerCost |
| energy_system | 通用技能 | EnergySystemGenerator | CommonSkill |
| timeline | 历史纪元 | TimelineGenerator | HistoricalEra |
| timeline | 历史人物 | TimelineGenerator | HistoricalFigure |

### 2.2 修复原则

1. **最小改动**：尽量在现有架构上扩展
2. **向后兼容**：不破坏现有功能
3. **可配置**：支持用户选择是否细分子类型

---

## 三、修复方案

### 方案A：提取阶段细分（推荐）

#### 3.1.1 修改提取提示词 (worldview_element_extractor.py)

将 `world_architecture` 拆分为4个独立提取类型：

```python
type_descriptions = {
    # ... 其他类型 ...
    'dimensions': '维度/位面（独立的世界、位面、空间维度等）',
    'regions': '地理区域（大陆、国家、地区、领地等）',
    'celestial_bodies': '天体（星球、恒星、卫星、星系等）',
    'natural_laws': '自然法则（物理法则、魔法规则、世界规则等）',
    # ... 其他类型 ...
}
```

将 `timeline_events` 拆分为3个独立提取类型：

```python
    'historical_eras': '历史纪元（时代、纪年、重要时期等）',
    'historical_events': '历史事件（战争、革命、发明、灾难等）',
    'historical_figures': '历史人物（重要的历史人物、领袖、英雄等）',
```

#### 3.1.2 修改 type_mapping (worldview_generation.py)

```python
type_mapping = {
    # ... 其他类型 ...
    'dimensions': 'dimension',
    'regions': 'region',
    'celestial_bodies': 'celestial_body',
    'natural_laws': 'natural_law',
    # ...
    'historical_eras': 'historical_era',
    'historical_events': 'historical_event',
    'historical_figures': 'historical_figure',
    # ... 其他类型 ...
}
```

#### 3.1.3 修改 batch_name_map (worldview_generation.py)

```python
batch_name_map = {
    # ... 其他类型 ...
    'dimension': '维度详细设定',
    'region': '地理区域详细设定',
    'celestial_body': '天体详细设定',
    'natural_law': '自然法则详细设定',
    # ...
    'historical_era': '历史纪元详细设定',
    'historical_event': '历史事件详细设定',
    'historical_figure': '历史人物详细设定',
    # ... 其他类型 ...
}
```

#### 3.1.4 修改 priority_order (worldview_generation.py)

```python
priority_order = [
    'energy_systems', 'characters', 'locations', 'factions',
    'dimensions', 'regions', 'celestial_bodies', 'natural_laws',  # 世界架构4子类型
    'civilizations', 'social_classes',
    'political_systems', 'economic_systems', 'cultural_customs',
    'historical_eras', 'historical_events', 'historical_figures',  # 历史脉络3子类型
    'items', 'relations'
]
```

#### 3.1.5 前端 batchTypeConfig 补充 (BatchList.jsx)

```javascript
const batchTypeConfig = {
    // ... 现有9种 ...
    dimension: { title: '维度/位面', icon: <GlobalOutlined />, color: '#722ed1', priority: 'P1' },
    region: { title: '地理区域', icon: <EnvironmentOutlined />, color: '#52c41a', priority: 'P1' },
    celestial_body: { title: '天体', icon: <SunOutlined />, color: '#fa8c16', priority: 'P1' },
    natural_law: { title: '自然法则', icon: <ThunderboltOutlined />, color: '#f5222d', priority: 'P1' },
    historical_era: { title: '历史纪元', icon: <HistoryOutlined />, color: '#fa541c', priority: 'P2' },
    historical_event: { title: '历史事件', icon: <CalendarOutlined />, color: '#eb2f96', priority: 'P2' },
    historical_figure: { title: '历史人物', icon: <UserOutlined />, color: '#1890ff', priority: 'P2' },
};
```

---

### 方案B：Generator内部处理子类型（备选）

如果不修改提取阶段，可以让 Generator 在生成时根据元素类型字段来判断保存到哪个表。

#### 3.2.1 修改 DimensionGenerator

```python
def save_to_database(self, data, ...):
    # 根据元素类型字段判断保存到哪个表
    element_type = data.get('type', 'dimension')

    if element_type == 'region':
        # 保存到 Region 表
        return self._save_region(data, ...)
    elif element_type == 'celestial_body':
        # 保存到 CelestialBody 表
        return self._save_celestial_body(data, ...)
    elif element_type == 'natural_law':
        # 保存到 NaturalLaw 表
        return self._save_natural_law(data, ...)
    else:
        # 保存到 Dimension 表
        return self._save_dimension(data, ...)
```

**缺点**：
1. Generator 代码复杂度增加
2. 违背单一职责原则
3. 难以维护

---

## 四、修改文件清单

### 4.1 后端文件

| 文件 | 修改内容 |
|-----|---------|
| `worldview_element_extractor.py` | 扩展 type_descriptions，增加子类型描述 |
| `worldview_generation.py` | 修改 type_mapping, batch_name_map, priority_order, generators |
| `worldview_storage.py` | 如需要，同步修改 |

### 4.2 前端文件

| 文件 | 修改内容 |
|-----|---------|
| `BatchList.jsx` | 补充 batchTypeConfig 配置 |
| `index.jsx` | 更新 priority_order |

---

## 五、实施步骤

### 第一阶段：后端修改

1. **修改 worldview_element_extractor.py**
   - 扩展提取类型为16种（拆分world_architecture和timeline_events）
   - 修改提取提示词，让AI细分子类型

2. **修改 worldview_generation.py**
   - 扩展 type_mapping
   - 扩展 batch_name_map
   - 扩展 priority_order
   - 确保 generators 字典完整

### 第二阶段：前端修改

3. **修改 BatchList.jsx**
   - 补充所有新类型的前端配置

4. **修改 index.jsx**
   - 更新 priority_order

### 第三阶段：测试验证

5. **端到端测试**
   - 提取阶段是否正确细分
   - 批次创建是否正确
   - Generator是否正确调用
   - 保存是否正确

---

## 六、风险评估

### 6.1 风险点

| 风险 | 影响 | 缓解措施 |
|-----|------|---------|
| 提取阶段修改可能影响现有数据 | 中 | 向后兼容，保持旧数据格式 |
| 前端需要同步修改 | 中 | 确保前后端同步发布 |
| 已有数据需要迁移 | 低 | 设计迁移脚本 |

### 6.2 兼容性考虑

1. **向后兼容**：提取提示词中保留旧类型作为降级方案
2. **数据迁移**：提供迁移脚本处理历史数据
3. **灰度发布**：先在小范围测试

---

## 七、验证清单

### 提取阶段
- [ ] AI能正确区分维度/地理区域/天体/自然法则
- [ ] AI能正确区分历史纪元/历史事件/历史人物
- [ ] 提取结果包含正确的子类型字段

### 批次创建
- [ ] 创建了 dimension/region/celestial_body/natural_law 批次
- [ ] 创建了 historical_era/historical_event/historical_figure 批次
- [ ] batch_name 显示正确中文

### Generator调用
- [ ] RegionGenerator 被正确调用
- [ ] CelestialBodyGenerator 被正确调用
- [ ] NaturalLawGenerator 被正确调用
- [ ] HistoricalEraGenerator 被正确调用
- [ ] HistoricalFigureGenerator 被正确调用

### 保存阶段
- [ ] Dimension 表有正确数据
- [ ] Region 表有正确数据
- [ ] CelestialBody 表有正确数据
- [ ] NaturalLaw 表有正确数据
- [ ] HistoricalEra 表有正确数据
- [ ] HistoricalFigure 表有正确数据

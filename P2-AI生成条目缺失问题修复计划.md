# P2-AI生成条目缺失问题修复计划

## 问题分析

### 问题1: 8个character未保存
**原因**: AI解析器问题 - 这8个角色虽然checkpoint显示"成功"，但实际`data`是空字典

```
未保存的角色: 赵刚, 苏瑾, 赵海峰, 沈清, 王铁, 赵雪, 艾尔芙, 长老瑟兰迪尔
Checkpoint数据: data keys: [], name字段: (无)
```

**根因**: AI生成时可能因为流式输出中断或解析器问题，导致数据为空但仍被标记为成功

### 问题2: 4个world_architecture未保存
**原因**: 数据库表不存在

```
CP48的4个元素:
- 异世界（艾恩兰德）→ 应保存到 dimensions 表
- 门/稳定通道 → 应保存到 dimensions 表
- 地球（禹州） → 应保存到 celestial_bodies 表或 regions 表
- 玛娜泉眼与危险区域 → 应保存到 regions 表

数据库现状: world_architecture 表不存在！
```

### 问题3: 25个relation未保存
**原因**: 依赖顺序问题 - relation需要先有character/location/faction等实体存在

## 修复方案

### 步骤1: 修复character生成/解析逻辑
1. 在`execute_batch_generation_stream`中添加空数据检查
2. 只有data非空时才标记为成功或保存
3. 或者使用element_name作为fallback

### 步骤2: 修复world_architecture保存
1. 将world_architecture类型映射到正确的表:
   - `dimension_type` → `dimensions`表
   - `celestial_type` → `celestial_bodies`表
   - `region_type` → `regions`表

### 步骤3: 修复relation保存顺序
1. 修改生成流程，确保先生成character/location/faction
2. 再生成relation
3. relation保存时需要能找到对应的实体ID

## 执行步骤

### 步骤1: 修改 `worldview_generation.py` 的保存逻辑
添加空数据过滤和world_architecture类型映射

### 步骤2: 修改 `relation_generator.py`
实现完整的保存逻辑，将relation保存到relationship表

### 步骤3: 修复旧数据
使用脚本将CP48的4个world_architecture元素保存到正确的表

### 步骤4: 验证
重新运行分析脚本确认问题已修复

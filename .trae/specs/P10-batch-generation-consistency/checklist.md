# Checklist - 分批次生成设定功能一致性分析

## 已完成分析

### 中英文混杂问题根源
- [x] 确认 `dimension详细设定` 根因：batch_name_map 缺少 'dimension' 键
- [x] 确认 `timeline详细设定` 根因：batch_name_map 缺少 'timeline' 键

### Generator调用情况（5个Generator存在但未被调用）
- [x] HistoricalEraGenerator - 存在但type_mapping中没有
- [x] HistoricalFigureGenerator - 存在但type_mapping中没有
- [x] RegionGenerator - 存在但type_mapping中没有
- [x] CelestialBodyGenerator - 存在但type_mapping中没有
- [x] NaturalLawGenerator - 存在但type_mapping中没有

### 子类型分离情况
- [x] 组织势力(3个子类型) - Generator存在但子类型未分离
- [x] 物品资源(3个子类型) - ItemGenerator存在但EquipmentSystem/SpecialItem未处理
- [x] 能量体系(5个子类型) - EnergySystemGenerator存在但EnergyForm/PowerLevel/PowerCost/CommonSkill未处理
- [x] 社会体系(5个子类型) - 大部分有独立Generator
- [x] 历史脉络(3个子类型) - HistoricalEra/HistoricalFigure未被调用
- [x] 世界架构(4个子类型) - Region/CelestialBody/NaturalLaw未被调用

## 待确认问题

- [ ] 是否需要修复 Generator 调用问题（分离子类型）？
- [ ] 是否执行 batch_name_map 的紧急修复？

## 紧急修复验证

- [ ] batch_name_map 补充 'dimension' 后返回正确中文
- [ ] batch_name_map 补充 'timeline' 后返回正确中文

## 架构修复验证（如果执行）

- [ ] type_mapping 添加 historical_era, historical_figure, region, celestial_body, natural_law
- [ ] batch_name_map 添加对应映射
- [ ] 前端 batchTypeConfig 添加对应配置

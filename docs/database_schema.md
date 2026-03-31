# AI小说编辑器 - 数据库表结构文档

> 生成时间: 2026-03-24
> 数据库: SQLite (SQLAlchemy ORM)
> 模型数量: 60+

---

## 📚 目录

1. [核心项目表](#1-核心项目表)
2. [世界观设定表](#2-世界观设定表)
3. [角色系统表](#3-角色系统表)
4. [地点与物品表](#4-地点与物品表)
5. [势力与关系表](#5-势力与关系表)
6. [能量与力量体系表](#6-能量与力量体系表)
7. [社会文化体系表](#7-社会文化体系表)
8. [历史脉络表](#8-历史脉络表)
9. [能力与种族表](#9-能力与种族表)
10. [结构扩展表](#10-结构扩展表)
11. [AI生成表](#11-ai生成表)
12. [辅助功能表](#12-辅助功能表)

---

## 1. 核心项目表

### 1.1 Project (项目表)
存储小说项目的基本信息。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键，自增 | - |
| title | String(255) | 作品标题 | - |
| pen_name | String(255) | 作者笔名 | - |
| genre | String(100) | 作品类型 | - |
| target_audience | String(100) | 目标读者 | - |
| core_theme | Text | 核心主题 | - |
| synopsis | Text | 作品简介 | - |
| writing_style | String(100) | 写作风格 | '' |
| reference_works | Text | 参考作品 | '' |
| daily_word_goal | Integer | 日更字数目标 | 0 |
| total_word_goal | Integer | 总字数目标 | 0 |
| estimated_completion_date | Date | 预计完成日期 | - |
| word_count | Integer | 当前字数 | 0 |
| world_id | Integer | 关联世界ID(外键) | nullable |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 1.2 World (世界表)
存储世界观设定。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| project_id | Integer | 关联项目ID(外键) | nullable |
| name | String(255) | 世界名称 | - |
| core_concept | Text | 核心概念 | '' |
| world_type | String(100) | 世界类型 | '单一世界' |
| description | Text | 描述 | '' |
| creation_origin | Text | 创世起源 | '' |
| world_essence | Text | 世界本质 | '' |
| status | String(50) | 状态 | 'active' |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 1.3 Outline (大纲表)
存储故事大纲。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| project_id | Integer | 关联项目ID(外键) | nullable |
| title | String(255) | 大纲标题 | - |
| content | Text | 大纲内容 | '' |
| story_model | String(100) | 故事模型 | '' |
| version | Integer | 版本号 | 1 |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 1.4 Volume (卷/部表)
存储小说的卷/部信息。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| project_id | Integer | 关联项目ID(外键) | - |
| outline_id | Integer | 关联大纲ID(外键) | nullable |
| title | String(255) | 卷标题 | - |
| content | Text | 内容 | '' |
| core_conflict | Text | 核心冲突 | '' |
| character_development | Text | 角色发展 | '' |
| key_events | Text | 关键事件(JSON) | '[]' |
| chapter_count | Integer | 章节数量 | 0 |
| order_index | Integer | 排序索引 | - |
| version | Integer | 版本号 | 1 |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 1.5 Chapter (章节表)
存储章节信息。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| project_id | Integer | 关联项目ID(外键) | - |
| volume_id | Integer | 关联卷ID(外键) | nullable |
| volume | String(255) | 卷/分组名称 | '' |
| title | String(255) | 章节标题 | - |
| content | Text | 章节内容 | '' |
| scenes | Text | 场景列表(JSON) | '[]' |
| characters | Text | 角色列表(JSON) | '[]' |
| core_event | Text | 核心事件 | '' |
| emotional_goal | Text | 情感目标 | '' |
| keywords | Text | 关键词(JSON) | '[]' |
| word_count_estimate | Integer | 预估字数 | 0 |
| status | String(50) | 状态 | '未写' |
| type | String(50) | 类型 | '普通' |
| word_count | Integer | 实际字数 | 0 |
| order_index | Integer | 排序索引 | - |
| version | Integer | 版本号 | 1 |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

---

## 2. 世界观设定表

### 2.1 WorldSetting (世界观设定表)

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| project_id | Integer | 关联项目ID(外键) | - |
| name | String(255) | 设定名称 | - |
| description | Text | 描述 | '' |
| world_type | String(100) | 世界类型 | '单一世界' |
| creation_origin | Text | 创世起源 | '' |
| world_essence | Text | 世界本质 | '' |
| spatial_hierarchy | Text | 空间层级 | '' |
| world_map | Text | 世界地图 | '' |
| main_regions | Text | 主要区域 | '' |
| time_system | Text | 时间系统 | '' |
| spatial_properties | Text | 空间属性 | '' |
| physical_laws | Text | 物理法则 | '' |
| special_rules | Text | 特殊规则 | '' |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 2.2 SocietyCulture (社会文化表)

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| project_id | Integer | 关联项目ID(外键) | - |
| political_system | Text | 政治体制 | '' |
| class_hierarchy | Text | 阶级体系 | '' |
| power_institutions | Text | 权力机构 | '' |
| legal_system | Text | 法律体系 | '' |
| currency_system | Text | 货币体系 | '' |
| trade_network | Text | 贸易网络 | '' |
| resource_distribution | Text | 资源分配 | '' |
| economic_model | Text | 经济模式 | '' |
| language_writing | Text | 语言文字 | '' |
| religion | Text | 宗教信仰 | '' |
| customs | Text | 风俗习惯 | '' |
| art_forms | Text | 艺术形式 | '' |
| etiquette | Text | 礼仪规范 | '' |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 2.3 History (历史表)

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| project_id | Integer | 关联项目ID(外键) | - |
| era_division | Text | 时代划分 | '' |
| historical_events | Text | 历史事件 | '' |
| civilization_development | Text | 文明发展 | '' |
| historical_gaps | Text | 历史空白 | '' |
| wars | Text | 战争记录 | '' |
| disasters_reconstruction | Text | 灾难与重建 | '' |
| major_discoveries | Text | 重大发现 | '' |
| treaties | Text | 重要条约 | '' |
| important_figures | Text | 重要人物 | '' |
| historical_evaluations | Text | 历史评价 | '' |
| influence_heritage | Text | 影响与遗产 | '' |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

---

## 3. 角色系统表

### 3.1 Character (角色表)
存储角色详细信息。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| project_id | Integer | 关联项目ID(外键) | nullable |
| world_id | Integer | 关联世界ID(外键) | nullable |
| name | String(255) | 角色名 | - |
| alternative_names | Text | 别名(JSON) | '' |
| description | Text | 描述 | '' |
| character_type | String(50) | 角色类型 | '配角' |
| role_type | String(50) | 角色定位 | '配角' |
| status | String(50) | 状态 | '存活' |
| importance_level | Integer | 重要程度(1-10) | 5 |
| race | String(100) | 种族 | '' |
| gender | String(50) | 性别 | '' |
| age | Integer | 年龄 | 0 |
| birth_date | String(100) | 出生日期 | '' |
| death_date | String(100) | 死亡日期 | '' |
| appearance | Text | 外貌描述 | '' |
| appearance_age | Integer | 外貌年龄 | 0 |
| distinguishing_features | Text | 显著特征 | '' |
| personality | Text | 性格 | '' |
| background | Text | 背景 | '' |
| character_arc | Text | 角色弧线 | '' |
| motivation | Text | 动机 | '' |
| secrets | Text | 秘密 | '' |
| birthplace | String(255) | 出生地 | '' |
| nationality | String(255) | 国籍 | '' |
| occupation | String(255) | 职业 | '' |
| faction | String(255) | 所属势力 | '' |
| current_location | String(255) | 当前位置 | '' |
| core_traits | Text | 核心特质 | '' |
| psychological_fear | Text | 心理恐惧 | '' |
| values | Text | 价值观 | '' |
| growth_experience | Text | 成长经历 | '' |
| important_turning_points | Text | 重要转折点 | '' |
| psychological_trauma | Text | 心理创伤 | '' |
| physical_abilities | Text | 身体能力 | '' |
| intelligence_perception | Text | 智力感知 | '' |
| special_talents | Text | 特殊天赋 | '' |
| current_level | String(50) | 当前等级 | '' |
| special_abilities | Text | 特殊能力 | '' |
| ability_levels | Text | 能力等级 | '' |
| ability_limits | Text | 能力限制 | '' |
| growth_path | Text | 成长路径 | '' |
| common_equipment | Text | 常用装备 | '' |
| special_items | Text | 特殊物品 | '' |
| personal_items | Text | 个人物品 | '' |
| key_items | Text | 关键物品 | '' |
| family_members | Text | 家庭成员 | '' |
| family_background | Text | 家庭背景 | '' |
| close_friends | Text | 挚友 | '' |
| mentor_student | Text | 师徒关系 | '' |
| colleagues | Text | 同事 | '' |
| grudges | Text | 仇敌 | '' |
| love_relationships | Text | 爱情关系 | '' |
| complex_emotions | Text | 复杂情感 | '' |
| unrequited_love | Text | 暗恋 | '' |
| emotional_changes | Text | 情感变化 | '' |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 3.2 CharacterBackground (角色背景表)
存储角色不同人生阶段的背景。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| character_id | Integer | 关联角色ID(外键) | - |
| period_name | String(100) | 时期名称 | '' |
| start_age | Integer | 开始年龄 | 0 |
| end_age | Integer | 结束年龄 | 0 |
| key_events | Text | 关键事件(JSON) | '' |
| influential_people | Text | 影响人物 | '' |
| traumas | Text | 创伤 | '' |
| turning_points | Text | 转折点 | '' |
| core_memory | Text | 核心记忆 | '' |
| description | Text | 描述 | '' |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 3.3 CharacterAbilityDetail (角色能力详情表)
存储角色具体能力。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| character_id | Integer | 关联角色ID(外键) | - |
| ability_type | String(50) | 能力类型 | '' |
| ability_name | String(255) | 能力名称 | '' |
| proficiency_level | String(50) | 熟练度 | '入门' |
| acquired_age | Integer | 获得年龄 | 0 |
| acquired_method | Text | 获得方式 | '' |
| usage_restrictions | Text | 使用限制 | '' |
| is_signature | Boolean | 是否招牌 | False |
| description | Text | 描述 | '' |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 3.4 CharacterTrait (角色特质表)

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| project_id | Integer | 关联项目ID(外键) | - |
| name | String(255) | 特质名称 | - |
| description | Text | 描述 | '' |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 3.5 CharacterAbility (角色能力表)

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| project_id | Integer | 关联项目ID(外键) | - |
| name | String(255) | 能力名称 | - |
| description | Text | 描述 | '' |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 3.6 CharacterRelationship (角色关系结构表)

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| project_id | Integer | 关联项目ID(外键) | - |
| name | String(255) | 关系名称 | - |
| description | Text | 描述 | '' |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

---

## 4. 地点与物品表

### 4.1 Location (地点表)
存储地点详细信息。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| project_id | Integer | 关联项目ID(外键) | nullable |
| world_id | Integer | 关联世界ID(外键) | nullable |
| name | String(255) | 地点名称 | - |
| description | Text | 描述 | '' |
| location_type | String(100) | 地点类型 | '城市' |
| region | String(255) | 所属区域 | '' |
| geographical_location | Text | 地理位置 | '' |
| terrain | Text | 地形 | '' |
| climate | Text | 气候 | '' |
| special_environment | Text | 特殊环境 | '' |
| controlling_faction | String(255) | 控制势力 | '' |
| population_composition | Text | 人口构成 | '' |
| economic_status | Text | 经济状况 | '' |
| cultural_features | Text | 文化特色 | '' |
| overall_layout | Text | 整体布局 | '' |
| functional_areas | Text | 功能区域 | '' |
| key_buildings | Text | 重要建筑 | '' |
| secret_areas | Text | 秘密区域 | '' |
| defense_facilities | Text | 防御设施 | '' |
| guard_force | Text | 守卫力量 | '' |
| defense_weaknesses | Text | 防御弱点 | '' |
| emergency_plans | Text | 应急预案 | '' |
| main_resources | Text | 主要资源 | '' |
| potential_dangers | Text | 潜在危险 | '' |
| access_restrictions | Text | 进入限制 | '' |
| survival_conditions | Text | 生存条件 | '' |
| importance | Integer | 重要程度 | 0 |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 4.2 Item (物品表)
存储物品信息。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| project_id | Integer | 关联项目ID(外键) | - |
| world_id | Integer | 关联世界ID(外键) | nullable |
| name | String(255) | 物品名称 | - |
| description | Text | 描述 | '' |
| item_type | String(100) | 物品类型 | '普通' |
| rarity_level | String(50) | 稀有度 | '普通' |
| physical_properties | Text | 物理属性 | '' |
| special_effects | Text | 特殊效果 | '' |
| usage_requirements | Text | 使用要求 | '' |
| durability | Integer | 耐久度 | 100 |
| creator | String(255) | 制造者 | '' |
| source | Text | 来源 | '' |
| historical_heritage | Text | 历史传承 | '' |
| current_owner | String(255) | 当前所有者 | '' |
| acquisition_method | Text | 获取方式 | '' |
| importance | Integer | 重要程度 | 0 |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 4.3 LocationStructure (地点结构表)

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| project_id | Integer | 关联项目ID(外键) | - |
| name | String(255) | 结构名称 | - |
| description | Text | 描述 | '' |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 4.4 SpecialLocation (特殊地点表)

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| project_id | Integer | 关联项目ID(外键) | - |
| name | String(255) | 地点名称 | - |
| description | Text | 描述 | '' |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

---

## 5. 势力与关系表

### 5.1 Faction (势力表)
存储势力/组织信息。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| project_id | Integer | 关联项目ID(外键) | - |
| world_id | Integer | 关联世界ID(外键) | nullable |
| name | String(255) | 势力名称 | - |
| description | Text | 描述 | '' |
| faction_type | String(100) | 势力类型 | '国家' |
| faction_status | String(50) | 势力状态 | '活跃' |
| logo | Text | 标志 | '' |
| core_ideology | Text | 核心思想 | '' |
| sphere_of_influence | Text | 势力范围 | '' |
| influence_level | String(50) | 影响力等级 | '区域' |
| establishment_time | String(255) | 建立时间 | '' |
| member_size | String(255) | 成员规模 | '' |
| headquarters_location | String(255) | 总部位置 | '' |
| economic_strength | Text | 经济实力 | '' |
| leadership_system | Text | 领导体制 | '' |
| hierarchy | Text | 等级制度 | '' |
| department_setup | Text | 部门设置 | '' |
| decision_mechanism | Text | 决策机制 | '' |
| leader | String(255) | 领导者 | '' |
| key_members | Text | 核心成员 | '' |
| talent_reserve | Text | 人才储备 | '' |
| defectors | Text | 叛逃者 | '' |
| recruitment_method | Text | 招募方式 | '' |
| training_system | Text | 培训体系 | '' |
| disciplinary_rules | Text | 纪律规则 | '' |
| promotion_path | Text | 晋升路径 | '' |
| special_abilities | Text | 特殊能力 | '' |
| heritage_system | Text | 传承体系 | '' |
| resource_reserves | Text | 资源储备 | '' |
| intelligence_network | Text | 情报网络 | '' |
| short_term_goals | Text | 短期目标 | '' |
| medium_term_plans | Text | 中期计划 | '' |
| long_term_vision | Text | 长期愿景 | '' |
| secret_plans | Text | 秘密计划 | '' |
| ally_relationships | Text | 盟友关系 | '' |
| enemy_relationships | Text | 敌对关系 | '' |
| subordinate_relationships | Text | 从属关系 | '' |
| neutral_relationships | Text | 中立关系 | '' |
| importance | Integer | 重要程度 | 0 |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 5.2 Relationship (关系表)
存储实体间关系。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| project_id | Integer | 关联项目ID(外键) | - |
| world_id | Integer | 关联世界ID(外键) | nullable |
| name | String(255) | 关系名称 | - |
| source_type | String(50) | 源实体类型 | - |
| source_id | Integer | 源实体ID | - |
| target_type | String(50) | 目标实体类型 | - |
| target_id | Integer | 目标实体ID | - |
| relationship_type | String(100) | 关系类型 | - |
| strength | Integer | 关系强度 | 5 |
| description | Text | 描述 | '' |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 5.3 EntityRelation (实体关系网络表)
通用关系网络表。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| world_id | Integer | 关联世界ID(外键) | - |
| source_type | String(50) | 源实体类型 | - |
| source_id | Integer | 源实体ID | - |
| target_type | String(50) | 目标实体类型 | - |
| target_id | Integer | 目标实体ID | - |
| relation_type | String(100) | 关系类型 | - |
| strength | Integer | 关系强度(1-10) | 5 |
| description | Text | 描述 | '' |
| is_bidirectional | Boolean | 是否双向关系 | True |
| status | String(50) | 状态 | 'active' |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 5.4 FactionStructure (势力结构表)

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| project_id | Integer | 关联项目ID(外键) | - |
| name | String(255) | 结构名称 | - |
| description | Text | 描述 | '' |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 5.5 FactionGoal (势力目标表)

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| project_id | Integer | 关联项目ID(外键) | - |
| name | String(255) | 目标名称 | - |
| description | Text | 描述 | '' |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

---

## 6. 能量与力量体系表

### 6.1 EnergySystem (能量体系表)
存储世界的能量类型和体系。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| world_id | Integer | 关联世界ID(外键) | - |
| name | String(255) | 体系名称 | - |
| energy_type | String(100) | 能量类型 | '魔法' |
| description | Text | 描述 | '' |
| source | Text | 能量来源 | '' |
| acquisition_method | Text | 获取方式 | '' |
| storage_method | Text | 储存方式 | '' |
| usage_limitations | Text | 使用限制 | '' |
| common_applications | Text | 常见应用 | '' |
| rarity | String(50) | 稀有度 | '常见' |
| stability | String(50) | 稳定性 | '稳定' |
| interaction_with_other_energies | Text | 与其他能量交互 | '' |
| cultivation_method | Text | 修炼方法 | '' |
| typical_manifestations | Text | 典型表现 | '' |
| status | String(50) | 状态 | 'active' |
| order_index | Integer | 排序索引 | 0 |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 6.2 EnergyForm (能量形态表)
存储具体能量形态。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| world_id | Integer | 关联世界ID(外键) | - |
| energy_system_id | Integer | 关联能量体系ID(外键) | nullable |
| name | String(255) | 形态名称 | - |
| form_type | String(100) | 形态类型 | '元素' |
| description | Text | 描述 | '' |
| basic_properties | Text | 基本属性 | '' |
| interaction_rules | Text | 相互作用规则 | '' |
| purification_method | Text | 提纯方法 | '' |
| corruption_effects | Text | 污染效果 | '' |
| visual_manifestation | Text | 视觉表现 | '' |
| sensory_perception | Text | 感官感知 | '' |
| status | String(50) | 状态 | 'active' |
| order_index | Integer | 排序索引 | 0 |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 6.3 PowerLevel (力量等级表)
存储修炼等级体系。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| world_id | Integer | 关联世界ID(外键) | - |
| name | String(255) | 等级名称 | - |
| level | Integer | 等级数值 | - |
| level_name | String(255) | 等级称号 | - |
| description | Text | 描述 | '' |
| requirements | Text | 晋升要求 | '' |
| characteristics | Text | 等级特征 | '' |
| abilities | Text | 获得能力 | '' |
| lifespan_extension | String(100) | 寿命延长 | '' |
| typical_combat_power | Text | 典型战斗力 | '' |
| rarity | String(50) | 稀有度 | '常见' |
| social_status | String(100) | 社会地位 | '' |
| energy_system_id | Integer | 关联能量体系ID | nullable |
| status | String(50) | 状态 | 'active' |
| order_index | Integer | 排序索引 | 0 |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 6.4 PowerCost (力量代价表)
存储使用力量的代价系统。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| world_id | Integer | 关联世界ID(外键) | - |
| cost_type | String(100) | 代价类型 | '寿命' |
| description | Text | 描述 | '' |
| trigger_conditions | Text | 触发条件 | '' |
| payment_mechanism | Text | 支付机制 | '' |
| severity_level | Integer | 严重程度(1-10) | 5 |
| reversible | Boolean | 是否可逆 | False |
| mitigation_methods | Text | 缓解方法 | '' |
| accumulation_effect | Text | 累积效应 | '' |
| status | String(50) | 状态 | 'active' |
| order_index | Integer | 排序索引 | 0 |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 6.5 CommonSkill (通用技能表)
存储世界通用技能。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| world_id | Integer | 关联世界ID(外键) | - |
| name | String(255) | 技能名称 | - |
| skill_type | String(100) | 技能类型 | '战斗' |
| description | Text | 描述 | '' |
| difficulty | String(50) | 难度 | '普通' |
| requirements | Text | 学习要求 | '' |
| learning_time | String(100) | 学习时间 | '' |
| commonality | String(50) | 普及程度 | '常见' |
| power_level_required | Integer | 所需等级 | 0 |
| energy_consumption | String(100) | 能量消耗 | '' |
| effects | Text | 技能效果 | '' |
| limitations | Text | 使用限制 | '' |
| typical_users | Text | 典型使用者 | '' |
| energy_system_id | Integer | 关联能量体系ID | nullable |
| status | String(50) | 状态 | 'active' |
| order_index | Integer | 排序索引 | 0 |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

---

## 7. 社会文化体系表

### 7.1 Civilization (文明表)
存储世界文明类型。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| world_id | Integer | 关联世界ID(外键) | - |
| name | String(255) | 文明名称 | - |
| civilization_type | String(100) | 文明类型 | '魔法文明' |
| description | Text | 描述 | '' |
| development_level | String(100) | 发展阶段 | '中世纪' |
| population_scale | String(100) | 人口规模 | '' |
| territory_size | String(100) | 领土范围 | '' |
| political_system | Text | 政治体制 | '' |
| economic_system | Text | 经济体制 | '' |
| technological_level | String(100) | 科技水平 | '' |
| magical_level | String(100) | 魔法水平 | '' |
| cultural_characteristics | Text | 文化特征 | '' |
| religious_beliefs | Text | 宗教信仰 | '' |
| taboos | Text | 禁忌 | '' |
| values | Text | 价值观 | '' |
| historical_origin | Text | 历史起源 | '' |
| status | String(50) | 状态 | 'active' |
| order_index | Integer | 排序索引 | 0 |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 7.2 CivilizationRegion (文明区域关联表)
多对多关联表。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| civilization_id | Integer | 关联文明ID(外键) | - |
| region_id | Integer | 关联区域ID(外键) | - |
| relationship_type | String(100) | 关系类型 | '统治' |
| influence_level | Integer | 影响力等级(1-10) | 5 |
| description | Text | 描述 | '' |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 7.3 SocialClass (社会阶级表)
存储社会阶层结构。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| world_id | Integer | 关联世界ID(外键) | - |
| civilization_id | Integer | 关联文明ID(外键) | nullable |
| name | String(255) | 阶级名称 | - |
| class_level | Integer | 阶级层级 | 1 |
| description | Text | 描述 | '' |
| typical_occupations | Text | 典型职业 | '' |
| privileges | Text | 特权 | '' |
| obligations | Text | 义务 | '' |
| living_standards | Text | 生活水平 | '' |
| education_access | String(100) | 教育机会 | '' |
| social_mobility | String(100) | 社会流动性 | '' |
| percentage_of_population | String(50) | 人口比例 | '' |
| typical_power_level | Integer | 典型力量等级 | 0 |
| status | String(50) | 状态 | 'active' |
| order_index | Integer | 排序索引 | 0 |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 7.4 CulturalCustom (文化习俗表)
存储文化传统和习俗。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| world_id | Integer | 关联世界ID(外键) | - |
| civilization_id | Integer | 关联文明ID(外键) | nullable |
| name | String(255) | 习俗名称 | - |
| custom_type | String(100) | 习俗类型 | '节日' |
| description | Text | 描述 | '' |
| origin | Text | 起源 | '' |
| significance | Text | 意义 | '' |
| participants | Text | 参与者 | '' |
| time_period | String(100) | 时间周期 | '' |
| location | Text | 地点 | '' |
| procedures | Text | 流程 | '' |
| related_beliefs | Text | 相关信仰 | '' |
| variations | Text | 变体形式 | '' |
| importance_level | Integer | 重要性(1-10) | 5 |
| status | String(50) | 状态 | 'active' |
| order_index | Integer | 排序索引 | 0 |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 7.5 EconomicSystem (经济体系表)
存储文明的经济运行方式。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| world_id | Integer | 关联世界ID(外键) | - |
| civilization_id | Integer | 关联文明ID(外键) | nullable |
| name | String(255) | 体系名称 | - |
| economic_model | String(100) | 经济模式 | '市场经济' |
| description | Text | 描述 | '' |
| currency_name | String(255) | 货币名称 | '' |
| currency_material | Text | 货币材质 | '' |
| denomination_system | Text | 面额体系 | '' |
| exchange_rates | Text | 汇率体系(JSON) | '' |
| major_industries | Text | 主要产业(JSON) | '' |
| trade_routes | Text | 主要商路 | '' |
| trade_partners | Text | 贸易伙伴 | '' |
| resource_dependencies | Text | 资源依赖 | '' |
| wealth_distribution | Text | 财富分布 | '' |
| taxation_system | Text | 税收系统 | '' |
| banking_system | Text | 银行系统 | '' |
| economic_challenges | Text | 经济挑战 | '' |
| status | String(50) | 状态 | 'active' |
| order_index | Integer | 排序索引 | 0 |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 7.6 PoliticalSystem (政治体系表)
存储文明的政治结构。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| world_id | Integer | 关联世界ID(外键) | - |
| civilization_id | Integer | 关联文明ID(外键) | nullable |
| name | String(255) | 体系名称 | - |
| government_type | String(100) | 政体类型 | '君主制' |
| description | Text | 描述 | '' |
| power_structure | Text | 权力结构 | '' |
| succession_system | Text | 继承制度 | '' |
| decision_process | Text | 决策流程 | '' |
| administrative_divisions | Text | 行政区划 | '' |
| legal_system | Text | 法律体系 | '' |
| military_organization | Text | 军事组织 | '' |
| diplomatic_style | Text | 外交风格 | '' |
| internal_conflicts | Text | 内部矛盾 | '' |
| external_threats | Text | 外部威胁 | '' |
| political_stability | String(50) | 政治稳定性 | '稳定' |
| status | String(50) | 状态 | 'active' |
| order_index | Integer | 排序索引 | 0 |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

---

## 8. 历史脉络表

### 8.1 HistoricalEra (历史纪元表)
划分大的历史时期。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| world_id | Integer | 关联世界ID(外键) | - |
| name | String(255) | 纪元名称 | - |
| start_year | String(100) | 开始年份 | '' |
| end_year | String(100) | 结束年份 | '' |
| duration_description | Text | 持续时间描述 | '' |
| main_characteristics | Text | 时代特征 | '' |
| key_technologies | Text | 关键技术 | '' |
| dominant_civilizations | Text | 主导文明 | '' |
| ending_cause | Text | 结束原因 | '' |
| legacy_impact | Text | 遗留影响 | '' |
| description | Text | 描述 | '' |
| order_index | Integer | 排序索引 | 0 |
| status | String(50) | 状态 | 'active' |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 8.2 HistoricalEvent (历史事件表)
存储具体历史事件。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| world_id | Integer | 关联世界ID(外键) | - |
| era_id | Integer | 关联纪元ID(外键) | nullable |
| name | String(255) | 事件名称 | - |
| event_type | String(100) | 事件类型 | '战争' |
| description | Text | 描述 | '' |
| start_year | String(100) | 开始年份 | '' |
| end_year | String(100) | 结束年份 | '' |
| location_ids | Text | 地点ID列表(JSON) | '' |
| primary_causes | Text | 主要原因 | '' |
| key_participants | Text | 主要参与者 | '' |
| event_sequence | Text | 事件过程 | '' |
| immediate_outcomes | Text | 直接结果 | '' |
| long_term_consequences | Text | 长期影响 | '' |
| historical_significance | Text | 历史意义 | '' |
| conflicting_accounts | Text | 矛盾记载 | '' |
| importance_level | Integer | 重要性(1-10) | 5 |
| status | String(50) | 状态 | 'active' |
| order_index | Integer | 排序索引 | 0 |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 8.3 HistoricalFigure (历史人物表)
存储历史上有记载的人物。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| world_id | Integer | 关联世界ID(外键) | - |
| civilization_id | Integer | 关联文明ID(外键) | nullable |
| character_id | Integer | 关联角色ID(外键) | nullable |
| name | String(255) | 人物名称 | - |
| birth_year | String(100) | 出生年份 | '' |
| death_year | String(100) | 死亡年份 | '' |
| birth_place_id | Integer | 出生地ID | nullable |
| death_place_id | Integer | 死亡地ID | nullable |
| primary_role | String(100) | 主要身份 | '' |
| social_class | String(100) | 社会阶级 | '' |
| key_achievements | Text | 主要成就 | '' |
| controversies | Text | 争议 | '' |
| historical_legacy | Text | 历史遗产 | '' |
| description | Text | 描述 | '' |
| importance_level | Integer | 重要性(1-10) | 5 |
| status | String(50) | 状态 | 'active' |
| order_index | Integer | 排序索引 | 0 |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 8.4 EventParticipant (事件参与者表)
多对多关联，记录人物在事件中的角色。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| event_id | Integer | 关联事件ID(外键) | - |
| figure_id | Integer | 关联人物ID(外键) | - |
| role_type | String(100) | 角色类型 | '参与者' |
| contribution_level | Integer | 贡献程度(1-10) | 5 |
| motivation | Text | 动机 | '' |
| outcome_for_participant | Text | 对参与者的结果 | '' |
| description | Text | 描述 | '' |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

---

## 9. 能力与种族表

### 9.1 Ability (能力定义表)

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| project_id | Integer | 关联项目ID(外键) | - |
| world_id | Integer | 关联世界ID(外键) | nullable |
| name | String(255) | 能力名称 | - |
| description | Text | 描述 | '' |
| ability_type | String(100) | 能力类型 | '' |
| level_system | Text | 等级系统 | '' |
| cultivation_methods | Text | 修炼方法 | '' |
| resource_requirements | Text | 资源需求 | '' |
| growth_limits | Text | 成长极限 | '' |
| bottleneck_breakthrough | Text | 瓶颈突破 | '' |
| career_branches | Text | 职业分支 | '' |
| specialization_directions | Text | 专业方向 | '' |
| fusion_possibilities | Text | 融合可能性 | '' |
| ultimate_forms | Text | 最终形态 | '' |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 9.2 Skill (技能定义表)

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| project_id | Integer | 关联项目ID(外键) | - |
| world_id | Integer | 关联世界ID(外键) | nullable |
| name | String(255) | 技能名称 | - |
| description | Text | 描述 | '' |
| skill_type | String(100) | 技能类型 | '' |
| skill_level | String(50) | 技能等级 | '初级' |
| casting_conditions | Text | 施法条件 | '' |
| resource_consumption | Text | 资源消耗 | '' |
| cooldown_time | String(50) | 冷却时间 | '' |
| effect_range | Text | 效果范围 | '' |
| duration | String(50) | 持续时间 | '' |
| prerequisite_skills | Text | 前置技能 | '' |
| advanced_skills | Text | 进阶技能 | '' |
| combination_skills | Text | 组合技能 | '' |
| counter_relationship | Text | 克制关系 | '' |
| skill_tree | Text | 技能树 | '' |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 9.3 Talent (天赋定义表)

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| project_id | Integer | 关联项目ID(外键) | - |
| world_id | Integer | 关联世界ID(外键) | nullable |
| name | String(255) | 天赋名称 | - |
| description | Text | 描述 | '' |
| talent_type | String(100) | 天赋类型 | '先天' |
| bloodline_talent | Text | 血脉天赋 | '' |
| special_physique | Text | 特殊体质 | '' |
| innate_abilities | Text | 天生能力 | '' |
| genetic_characteristics | Text | 遗传特征 | '' |
| awakened_abilities | Text | 觉醒能力 | '' |
| modified_enhancements | Text | 改造强化 | '' |
| contract_abilities | Text | 契约能力 | '' |
| learning_abilities | Text | 学习能力 | '' |
| awakening_conditions | Text | 觉醒条件 | '' |
| development_methods | Text | 培养方法 | '' |
| ability_limits | Text | 能力极限 | '' |
| evolution_possibilities | Text | 进化可能性 | '' |
| cost_risks | Text | 代价风险 | '' |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 9.4 Race (种族表)

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| project_id | Integer | 关联项目ID(外键) | - |
| world_id | Integer | 关联世界ID(外键) | nullable |
| name | String(255) | 种族名称 | - |
| description | Text | 描述 | '' |
| origin_legend | Text | 起源传说 | '' |
| distribution_area | Text | 分布区域 | '' |
| social_form | Text | 社会形态 | '' |
| appearance_features | Text | 外貌特征 | '' |
| physiological_characteristics | Text | 生理特征 | '' |
| lifespan_cycle | Text | 寿命周期 | '' |
| special_abilities | Text | 特殊能力 | '' |
| weaknesses_limits | Text | 弱点限制 | '' |
| subspecies | Text | 亚种 | '' |
| hybrids | Text | 混血 | '' |
| mutants | Text | 突变体 | '' |
| legendary_species | Text | 传说物种 | '' |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 9.5 Creature (生物表)

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| project_id | Integer | 关联项目ID(外键) | - |
| world_id | Integer | 关联世界ID(外键) | nullable |
| name | String(255) | 生物名称 | - |
| description | Text | 描述 | '' |
| creature_type | String(100) | 生物类型 | '野兽' |
| threat_level | String(50) | 威胁等级 | '低' |
| habitat | Text | 栖息地 | '' |
| behavior_habits | Text | 行为习惯 | '' |
| special_abilities | Text | 特殊能力 | '' |
| weaknesses_predators | Text | 弱点/天敌 | '' |
| domestication_possibility | Text | 驯化可能性 | '' |
| contract_methods | Text | 契约方式 | '' |
| use_value | Text | 使用价值 | '' |
| material_sources | Text | 材料来源 | '' |
| legendary_stories | Text | 传说故事 | '' |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 9.6 SpecialCreature (特殊生物表)

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| project_id | Integer | 关联项目ID(外键) | - |
| world_id | Integer | 关联世界ID(外键) | nullable |
| name | String(255) | 生物名称 | - |
| description | Text | 描述 | '' |
| creature_type | String(100) | 生物类型 | '异界生物' |
| spatial_properties | Text | 空间属性 | '' |
| entry_conditions | Text | 进入条件 | '' |
| internal_laws | Text | 内部法则 | '' |
| existence_limits | Text | 存在限制 | '' |
| summoning_type | Text | 召唤类型 | '' |
| summoning_contract | Text | 召唤契约 | '' |
| ability_characteristics | Text | 能力特点 | '' |
| control_difficulty | String(50) | 控制难度 | '低' |
| concept_type | String(100) | 概念类型 | '精神空间' |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

---

## 10. 结构扩展表

### 10.1 EquipmentSystem (装备系统表)

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| project_id | Integer | 关联项目ID(外键) | - |
| name | String(255) | 系统名称 | - |
| description | Text | 描述 | '' |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 10.2 SpecialItem (特殊物品表)

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| project_id | Integer | 关联项目ID(外键) | - |
| name | String(255) | 物品名称 | - |
| description | Text | 描述 | '' |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

---

## 11. AI生成表

### 11.1 AIGenerationVersion (AI生成版本表)
存储AI生成的各个版本内容。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| project_id | Integer | 关联项目ID(外键) | - |
| entity_type | String(50) | 实体类型 | - |
| entity_id | Integer | 关联实体ID | - |
| version_number | Integer | 版本号 | 1 |
| version_name | String(255) | 版本名称 | '' |
| content | Text | 生成的内容 | '' |
| prompt | Text | 使用的提示词 | '' |
| provider | String(50) | AI服务提供商 | '' |
| temperature | Float | 温度参数 | 0.7 |
| is_current | Boolean | 是否为当前版本 | False |
| is_favorite | Boolean | 是否收藏 | False |
| parent_version_id | Integer | 父版本ID(外键) | nullable |
| generation_params | Text | 生成参数(JSON) | '{}' |
| word_count | Integer | 字数统计 | 0 |
| created_at | DateTime | 创建时间 | utcnow |

### 11.2 AIGenerationCheckpoint (AI生成检查点表)
存储生成过程的中间状态。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| session_id | String(64) | 会话ID(索引) | - |
| project_id | Integer | 项目ID | - |
| user_id | Integer | 用户ID | - |
| stage | String(50) | 阶段 | - |
| checkpoint_type | String(50) | 检查点类型 | nullable |
| checkpoint_data | Text | 检查点数据(JSON) | nullable |
| progress_percent | Integer | 进度百分比 | 0 |
| status | String(20) | 状态 | 'in_progress' |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |
| expires_at | DateTime | 过期时间 | nullable |
| parent_checkpoint_id | Integer | 父检查点ID | nullable |
| name | String(255) | 检查点名称 | nullable |

### 11.3 ConceptMergeRecord (概念融合记录表)
存储重复概念合并的历史记录。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| session_id | String(64) | 会话ID(索引) | - |
| concept_type | String(50) | 概念类型 | - |
| source_concepts | Text | 源概念(JSON) | nullable |
| merged_concept | Text | 融合概念(JSON) | nullable |
| attribute_changes | Text | 属性变化(JSON) | nullable |
| similarity_score | Float | 相似度评分 | nullable |
| merge_strategy | String(20) | 融合策略 | nullable |
| created_at | DateTime | 创建时间 | utcnow |

### 11.4 EntityChapterAppearance (实体章节出现表)
记录世界观实体在章节中的出现。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| project_id | Integer | 关联项目ID(外键) | - |
| chapter_id | Integer | 关联章节ID(外键) | - |
| entity_type | String(50) | 实体类型 | - |
| entity_id | Integer | 实体ID | - |
| appearance_type | String(50) | 出现类型 | '提及' |
| description | Text | 描述 | '' |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

索引: `idx_entity_chapter`, `idx_chapter_entity`, `uq_chapter_entity`

### 11.5 StoryModel (故事模型表)
存储故事模型模板。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| key | String(100) | 模型键(唯一) | - |
| name | String(255) | 模型名称 | - |
| description | Text | 描述 | '' |
| is_default | Boolean | 是否默认 | False |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

---

## 12. 辅助功能表

### 12.1 Version (版本表)
存储项目版本信息。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| project_id | Integer | 关联项目ID(外键) | - |
| version_name | String(255) | 版本名称 | - |
| description | Text | 描述 | '' |
| tags | Text | 标签 | '' |
| content_hash | String(255) | 内容哈希 | '' |
| created_at | DateTime | 创建时间 | utcnow |

### 12.2 Note (笔记表)
存储笔记信息。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| project_id | Integer | 关联项目ID(外键) | - |
| chapter_id | Integer | 关联章节ID(外键) | nullable |
| title | String(255) | 笔记标题 | - |
| content | Text | 内容 | '' |
| type | String(50) | 类型 | '普通' |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 12.3 NavigationFlow (导航流程表)
存储创作导航流程。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| project_id | Integer | 项目ID | - |
| current_stage | String(50) | 当前阶段 | 'project_creation' |
| overall_progress | Float | 整体进度 | 0 |
| stage_progress | Text | 阶段进度(JSON) | '[]' |
| last_updated | DateTime | 最后更新 | utcnow |

### 12.4 Task (任务表)
存储创作任务。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| project_id | Integer | 项目ID | - |
| title | String(255) | 任务标题 | - |
| description | Text | 描述 | - |
| type | String(50) | 类型 | 'chapter' |
| priority | Integer | 优先级 | 3 |
| status | String(50) | 状态 | 'pending' |
| due_date | Date | 截止日期 | - |
| created_at | DateTime | 创建时间 | utcnow |
| completed_at | DateTime | 完成时间 | nullable |

### 12.5 Inspiration (灵感表)
存储创作灵感。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| project_id | Integer | 项目ID | - |
| type | String(50) | 类型 | 'plot' |
| content | Text | 内容 | - |
| context | Text | 上下文 | - |
| rating | Integer | 评分 | 0 |
| status | String(50) | 状态 | '未使用' |
| created_at | DateTime | 创建时间 | utcnow |
| used_at | DateTime | 使用时间 | nullable |

### 12.6 EmotionBoard (情绪板表)
存储情绪板图片。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| project_id | Integer | 关联项目ID(外键) | - |
| image_url | Text | 图片URL | - |
| description | Text | 描述 | '' |
| tags | Text | 标签 | '' |
| order_index | Integer | 排序索引 | 0 |
| created_at | DateTime | 创建时间 | utcnow |

### 12.7 Timeline (时间线表)

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| project_id | Integer | 关联项目ID(外键) | - |
| world_id | Integer | 关联世界ID(外键) | nullable |
| name | String(255) | 时间线名称 | - |
| description | Text | 描述 | '' |
| timeline_type | String(100) | 时间线类型 | '个人时间线' |
| related_id | Integer | 关联ID | 0 |
| birth_growth | Text | 出生/成长 | '' |
| key_events | Text | 关键事件 | '' |
| development_changes | Text | 发展变化 | '' |
| important_turning_points | Text | 重要转折点 | '' |
| ending_destination | Text | 结局/终点 | '' |
| establishment_development | Text | 建立/发展 | '' |
| rise_fall_changes | Text | 兴衰变化 | '' |
| major_events | Text | 重大事件 | '' |
| power_changes | Text | 力量变化 | '' |
| ending_transformation | Text | 结局转变 | '' |
| world_creation | Text | 世界创造 | '' |
| civilization_development | Text | 文明发展 | '' |
| major_changes | Text | 重大变化 | '' |
| current_era | Text | 当前时代 | '' |
| future_possibilities | Text | 未来可能 | '' |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 12.8 DataAssociation (数据关联表)

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| project_id | Integer | 关联项目ID(外键) | - |
| association_type | String(100) | 关联类型 | '人物关联' |
| source_type | String(50) | 源实体类型 | '' |
| source_id | Integer | 源实体ID | 0 |
| target_type | String(50) | 目标实体类型 | '' |
| target_id | Integer | 目标实体ID | 0 |
| association_details | Text | 关联详情 | '' |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 12.9 Tag (标签表)
用于分类和检索。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| world_id | Integer | 关联世界ID(外键) | - |
| name | String(255) | 标签名称 | - |
| tag_type | String(100) | 标签类型 | '通用' |
| description | Text | 描述 | '' |
| color | String(50) | 标签颜色 | '#1890ff' |
| usage_count | Integer | 使用次数 | 0 |
| status | String(50) | 状态 | 'active' |
| created_at | DateTime | 创建时间 | utcnow |
| updated_at | DateTime | 更新时间 | utcnow |

### 12.10 EntityTag (实体标签关联表)
多对多关联。

| 字段名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| id | Integer | 主键 | - |
| tag_id | Integer | 关联标签ID(外键) | - |
| entity_type | String(50) | 实体类型 | - |
| entity_id | Integer | 实体ID | - |
| created_at | DateTime | 创建时间 | utcnow |

---

## 附录

### 通用字段说明

所有表都包含以下通用字段（部分表）：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | Integer | 主键，自增 |
| created_at | DateTime | 记录创建时间 |
| updated_at | DateTime | 记录最后更新时间 |
| status | String(50) | 记录状态 (active/inactive/deleted) |
| order_index | Integer | 排序索引 |

### 外键关系说明

- `project_id` -> Project.id
- `world_id` -> World.id
- `character_id` -> Character.id
- `civilization_id` -> Civilization.id
- `energy_system_id` -> EnergySystem.id
- `era_id` -> HistoricalEra.id

### JSON字段说明

部分字段使用JSON格式存储数组或对象：
- `alternative_names` - 别名列表
- `scenes` - 场景列表
- `characters` - 角色列表
- `keywords` - 关键词列表
- `exchange_rates` - 汇率对象
- `major_industries` - 产业列表
- `location_ids` - 地点ID列表
- `satellites` - 卫星列表
- `key_events` - 关键事件列表
- `generation_params` - 生成参数字典
- `source_concepts` - 源概念列表
- `attribute_changes` - 属性变化记录

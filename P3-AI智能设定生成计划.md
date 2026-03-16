# P3-AI智能设定生成计划

## 1. 项目概述

基于现有的统一AI服务架构 (`AIService`)，开发AI智能设定生成功能，让AI能够根据用户需求自动生成设定数据库中各项数据条目，包括角色、地点、物品、势力、能量体系、文明文化等，大幅提升创作效率。

## 2. 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                    AI智能设定生成系统                        │
├─────────────────────────────────────────────────────────────┤
│  生成策略层                                                  │
│  ├─ 提示词模板管理 (PromptTemplateManager)                  │
│  ├─ 生成策略选择 (GenerationStrategySelector)               │
│  ├─ 上下文组装 (ContextAssembler)                           │
│  └─ 结果解析 (ResultParser)                                 │
├─────────────────────────────────────────────────────────────┤
│  实体生成器                                                  │
│  ├─ CharacterGenerator (角色生成器)                         │
│  ├─ LocationGenerator (地点生成器)                          │
│  ├─ ItemGenerator (物品生成器)                              │
│  ├─ FactionGenerator (势力生成器)                           │
│  ├─ EnergySystemGenerator (能量体系生成器)                  │
│  ├─ CivilizationGenerator (文明生成器)                      │
│  ├─ HistoricalEventGenerator (历史事件生成器)               │
│  └─ ... 其他实体生成器                                       │
├─────────────────────────────────────────────────────────────┤
│  基础服务层                                                  │
│  └─ AIService (现有统一AI服务接口)                          │
└─────────────────────────────────────────────────────────────┘
```

## 3. 开发任务分解

### 第1周：基础架构搭建

#### 任务1.1：提示词模板系统设计

**目标**：设计并实现提示词模板管理器

**具体任务**：
- [ ] 设计提示词模板数据结构
- [ ] 实现 `PromptTemplateManager` 类
- [ ] 创建基础提示词模板库（角色、地点、物品、势力）
- [ ] 支持模板变量替换和动态组装
- [ ] 实现模板版本管理

**输出文件**：
- `backend/app/services/generation/prompt_template_manager.py`
- `backend/app/services/generation/templates/` 目录及模板文件

**提示词模板示例**：
```json
{
  "entity_type": "character",
  "template_name": "detailed_character",
  "prompt_template": "基于以下世界观信息，创建一个详细的角色设定...",
  "variables": ["world_info", "prompt", "style"],
  "strategy": "detailed",
  "version": 1,
  "is_default": true
}
```

#### 任务1.2：生成策略系统

**目标**：设计并实现生成策略选择器

**具体任务**：
- [ ] 设计生成策略选择器 (`GenerationStrategySelector`)
- [ ] 实现基于实体类型的策略路由
- [ ] 支持简单/详细/批量三种生成模式
- [ ] 实现生成参数配置（温度、token限制等）

**输出文件**：
- `backend/app/services/generation/generation_strategy.py`

**生成策略定义**：
```python
class GenerationStrategy(Enum):
    SIMPLE = "simple"      # 简单生成，基础信息
    DETAILED = "detailed"  # 详细生成，完整字段
    BATCH = "batch"        # 批量生成，多个条目
```

#### 任务1.3：上下文组装器

**目标**：实现上下文组装器，支持关联实体信息注入

**具体任务**：
- [ ] 实现 `ContextAssembler` 类
- [ ] 支持关联实体信息注入（如生成角色时注入世界观信息）
- [ ] 实现用户输入与模板变量的映射
- [ ] 支持多轮对话上下文维护

**输出文件**：
- `backend/app/services/generation/context_assembler.py`

#### 任务1.4：数据库迁移

**目标**：创建AI生成相关数据表

**具体任务**：
- [ ] 创建 `ai_generation_templates` 表
- [ ] 创建 `ai_generation_history` 表
- [ ] 创建 `ai_generation_feedback` 表
- [ ] 编写Alembic迁移脚本

**输出文件**：
- `backend/migrations/versions/xxx_add_ai_generation_tables.py`

**数据库表结构**：

**`ai_generation_templates`** - AI生成模板表
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | Integer | 主键 |
| entity_type | String(50) | 实体类型 |
| template_name | String(255) | 模板名称 |
| prompt_template | Text | 提示词模板 |
| variables | Text | 模板变量(JSON) |
| strategy | String(50) | 生成策略 |
| version | Integer | 模板版本 |
| is_default | Boolean | 是否默认 |
| created_at | DateTime | 创建时间 |

**`ai_generation_history`** - AI生成历史表
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | Integer | 主键 |
| project_id | Integer | 项目ID |
| user_id | Integer | 用户ID |
| entity_type | String(50) | 生成的实体类型 |
| prompt | Text | 用户输入提示 |
| generated_content | Text | 生成的内容 |
| parameters | Text | 生成参数(JSON) |
| provider | String(50) | AI提供商 |
| status | String(50) | 生成状态 |
| rating | Integer | 用户评分 |
| created_at | DateTime | 创建时间 |

**`ai_generation_feedback`** - AI生成反馈表
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | Integer | 主键 |
| history_id | Integer | 关联历史记录 |
| feedback_type | String(50) | 反馈类型 |
| content | Text | 反馈内容 |
| created_at | DateTime | 创建时间 |

---

### 第2周：核心实体生成器实现

#### 任务2.1：角色生成器 (CharacterGenerator)

**目标**：实现完整的角色生成功能

**具体任务**：
- [ ] 实现基础角色信息生成（姓名、年龄、性别、种族等）
- [ ] 实现外貌特征生成（外貌描述、显著特征等）
- [ ] 实现性格与心理生成（性格、价值观、恐惧等）
- [ ] 实现背景故事生成（出身、成长经历、转折点等）
- [ ] 实现能力与装备生成（能力等级、特殊技能、装备等）
- [ ] 实现关系网络生成（家庭、朋友、仇敌等）
- [ ] 支持基于世界观的角色适配

**输出文件**：
- `backend/app/services/generation/generators/character_generator.py`

**生成字段映射**：
| 后端字段 | 生成内容 |
|---------|---------|
| name | 角色姓名 |
| race | 种族 |
| age | 年龄 |
| gender | 性别 |
| appearance | 外貌描述 |
| personality | 性格特征 |
| background | 背景故事 |
| abilities | 能力/技能 |
| equipment | 装备 |
| relationships | 关系网络 |

#### 任务2.2：地点生成器 (LocationGenerator)

**目标**：实现完整的地点生成功能

**具体任务**：
- [ ] 实现基础地点信息生成（名称、类型、地理位置等）
- [ ] 实现环境特征生成（地形、气候、特殊环境等）
- [ ] 实现社会属性生成（人口、经济、文化等）
- [ ] 实现建筑与布局生成（整体布局、功能区、重要建筑等）
- [ ] 实现防御与资源生成（防御设施、守卫力量、资源等）
- [ ] 支持地点间的层级关系生成

**输出文件**：
- `backend/app/services/generation/generators/location_generator.py`

**生成字段映射**：
| 后端字段 | 生成内容 |
|---------|---------|
| name | 地点名称 |
| location_type | 地点类型 |
| geography | 地理位置 |
| environment | 环境特征 |
| population | 人口信息 |
| layout | 建筑布局 |
| defense | 防御设施 |
| resources | 资源信息 |

#### 任务2.3：物品生成器 (ItemGenerator)

**目标**：实现完整的物品生成功能

**具体任务**：
- [ ] 实现基础物品信息生成（名称、类型、稀有度等）
- [ ] 实现物理属性生成（材质、外观、耐久度等）
- [ ] 实现功能效果生成（特殊效果、使用要求等）
- [ ] 实现来源与传承生成（制造者、历史、获取方式等）
- [ ] 支持基于世界观的物品适配（魔法物品、科技物品等）

**输出文件**：
- `backend/app/services/generation/generators/item_generator.py`

**生成字段映射**：
| 后端字段 | 生成内容 |
|---------|---------|
| name | 物品名称 |
| item_type | 物品类型 |
| rarity | 稀有度 |
| material | 材质 |
| appearance | 外观描述 |
| effects | 特殊效果 |
| requirements | 使用要求 |
| history | 历史传承 |

---

### 第3周：扩展实体生成器实现

#### 任务3.1：势力生成器 (FactionGenerator)

**目标**：实现完整的势力生成功能

**具体任务**：
- [ ] 实现基础势力信息生成（名称、类型、状态等）
- [ ] 实现理念与目标生成（核心思想、势力范围、目标等）
- [ ] 实现组织结构生成（领导体制、等级制度、部门设置等）
- [ ] 实现成员与资源生成（领导者、核心成员、人才储备等）
- [ ] 实现关系网络生成（盟友、敌对、从属关系等）

**输出文件**：
- `backend/app/services/generation/generators/faction_generator.py`

#### 任务3.2：能量体系生成器 (EnergySystemGenerator)

**目标**：实现完整的能量体系生成功能

**具体任务**：
- [ ] 实现能量类型定义生成（魔法、斗气、灵气等）
- [ ] 实现能量来源与获取生成
- [ ] 实现修炼体系生成（等级划分、晋升要求、特征等）
- [ ] 实现力量代价生成（使用限制、副作用、代价等）
- [ ] 实现通用技能生成

**输出文件**：
- `backend/app/services/generation/generators/energy_system_generator.py`

#### 任务3.3：文明文化生成器 (CivilizationGenerator)

**目标**：实现完整的文明文化生成功能

**具体任务**：
- [ ] 实现文明基础信息生成（名称、类型、发展阶段等）
- [ ] 实现社会结构生成（阶级体系、政治体制、法律体系等）
- [ ] 实现经济体系生成（货币、贸易、产业等）
- [ ] 实现文化习俗生成（节日、仪式、禁忌、价值观等）

**输出文件**：
- `backend/app/services/generation/generators/civilization_generator.py`

---

### 第4周：历史与地理生成器

#### 任务4.1：历史事件生成器 (HistoricalEventGenerator)

**目标**：实现完整的历史事件生成功能

**具体任务**：
- [ ] 实现历史纪元生成（时代划分、特征、技术等）
- [ ] 实现历史事件生成（战争、灾难、发现、革命等）
- [ ] 实现历史人物生成
- [ ] 支持事件间的因果关系和时间线

**输出文件**：
- `backend/app/services/generation/generators/historical_event_generator.py`

#### 任务4.2：地理区域生成器 (RegionGenerator)

**目标**：实现完整的地理区域生成功能

**具体任务**：
- [ ] 实现区域层级结构生成（大陆、国家、城市等）
- [ ] 实现地理特征生成（地形、气候、资源等）
- [ ] 实现区域关系生成（控制关系、贸易路线等）

**输出文件**：
- `backend/app/services/generation/generators/region_generator.py`

#### 任务4.3：维度位面生成器 (DimensionGenerator)

**目标**：实现完整的维度位面生成功能

**具体任务**：
- [ ] 实现维度/位面信息生成
- [ ] 实现物理规则生成（时间流速、重力、魔法浓度等）
- [ ] 实现进入条件和限制生成

**输出文件**：
- `backend/app/services/generation/generators/dimension_generator.py`

---

### 第5周：前端集成与API开发

#### 任务5.1：AI生成服务API

**目标**：创建统一的AI设定生成API

**具体任务**：
- [ ] 创建统一的AI设定生成API (`/api/ai/generate-setting`)
- [ ] 实现各实体类型的生成端点
- [ ] 实现批量生成接口
- [ ] 实现生成进度反馈（流式输出）

**输出文件**：
- `backend/app/routes/ai_generation_routes.py`

**API接口设计**：

**统一生成接口**
```
POST /api/ai/generate-setting
```

请求参数：
```json
{
  "entity_type": "character",
  "prompt": "一个来自魔法学院的年轻天才",
  "world_id": 1,
  "strategy": "detailed",
  "parameters": {
    "temperature": 0.7,
    "max_tokens": 2000
  },
  "context": {
    "include_world_info": true,
    "include_related_entities": ["faction", "location"]
  }
}
```

响应：
```json
{
  "success": true,
  "data": {
    "name": "艾琳娜·星辉",
    "race": "人类",
    "age": 19,
    "description": "来自星辰魔法学院的年轻天才...",
    "appearance": "银白色的长发...",
    "personality": "聪明、好奇、有些固执...",
    "background": "出生于魔法世家...",
    "abilities": [...],
    "relationships": [...]
  },
  "generation_id": "gen_123456",
  "provider": "openai",
  "tokens_used": 1500
}
```

**批量生成接口**
```
POST /api/ai/generate-setting/batch
```

**流式生成接口**
```
POST /api/ai/generate-setting/stream
```

**模板管理接口**
```
GET    /api/ai/generation-templates
POST   /api/ai/generation-templates
PUT    /api/ai/generation-templates/:id
DELETE /api/ai/generation-templates/:id
```

#### 任务5.2：前端生成界面

**目标**：开发前端AI生成界面

**具体任务**：
- [ ] 创建 `aiGenerationService.js` 服务
- [ ] 开发 `AIGenerateButton` 组件
- [ ] 开发 `AIGenerateModal` 组件
- [ ] 开发 `GenerationResultPreview` 组件
- [ ] 在各设定管理页面集成AI生成按钮

**输出文件**：
- `frontend/src/services/aiGenerationService.js`
- `frontend/src/components/AIGeneration/AIGenerateButton.jsx`
- `frontend/src/components/AIGeneration/AIGenerateModal.jsx`
- `frontend/src/components/AIGeneration/GenerationResultPreview.jsx`

**界面设计**：

**生成对话框元素**：
- 提示词输入框（支持占位符提示）
- 生成策略选择（简单/详细/批量）
- 高级参数配置（温度、长度等）
- 关联上下文选择
- 生成按钮和进度显示

**结果预览面板**：
- 生成结果结构化展示
- 字段级编辑功能
- 重新生成选项
- 保存到数据库按钮

#### 任务5.3：智能提示与引导

**目标**：实现智能提示与引导功能

**具体任务**：
- [ ] 实现生成提示词建议功能
- [ ] 实现基于已有设定的智能补全
- [ ] 实现生成示例展示

---

### 第6周：测试与优化

#### 任务6.1：生成质量测试

**目标**：建立生成质量评估标准并进行测试

**具体任务**：
- [ ] 建立生成质量评估标准
- [ ] 进行多轮生成测试和调优
- [ ] 收集生成样本进行人工评估
- [ ] 优化提示词模板

**质量评估标准**：
- 字段完整性（必填字段是否都有）
- 内容一致性（各字段间是否逻辑一致）
- 创意性（是否有新颖的设定）
- 可用性（是否可以直接使用或稍作修改即可使用）

#### 任务6.2：性能优化

**目标**：优化生成性能

**具体任务**：
- [ ] 优化生成速度和响应时间
- [ ] 实现生成结果缓存
- [ ] 优化并发生成处理

#### 任务6.3：用户反馈集成

**目标**：实现用户反馈机制

**具体任务**：
- [ ] 实现生成结果反馈机制（点赞/点踩）
- [ ] 实现用户修正学习
- [ ] 完善错误处理和提示

---

## 4. 文件清单

### 后端文件

```
backend/
├── app/
│   ├── services/
│   │   └── generation/
│   │       ├── __init__.py
│   │       ├── prompt_template_manager.py
│   │       ├── generation_strategy.py
│   │       ├── context_assembler.py
│   │       ├── result_parser.py
│   │       └── generators/
│   │           ├── __init__.py
│   │           ├── base_generator.py
│   │           ├── character_generator.py
│   │           ├── location_generator.py
│   │           ├── item_generator.py
│   │           ├── faction_generator.py
│   │           ├── energy_system_generator.py
│   │           ├── civilization_generator.py
│   │           ├── historical_event_generator.py
│   │           ├── region_generator.py
│   │           └── dimension_generator.py
│   ├── routes/
│   │   └── ai_generation_routes.py
│   └── models/
│       └── ai_generation.py
└── migrations/
    └── versions/
        └── xxx_add_ai_generation_tables.py
```

### 前端文件

```
frontend/
├── src/
│   ├── services/
│   │   └── aiGenerationService.js
│   └── components/
│       └── AIGeneration/
│           ├── AIGenerateButton.jsx
│           ├── AIGenerateModal.jsx
│           └── GenerationResultPreview.jsx
```

---

## 5. 里程碑

| 里程碑 | 时间 | 完成标准 |
|--------|------|----------|
| 基础架构完成 | 第1周末 | 提示词模板系统和生成策略系统可用 |
| 核心生成器完成 | 第3周末 | 角色、地点、物品、势力生成器可用 |
| 扩展生成器完成 | 第4周末 | 能量、文明、历史、地理生成器可用 |
| 前端集成完成 | 第5周末 | 各设定管理页面集成AI生成功能 |
| 阶段完成 | 第6周末 | 所有生成器经过测试优化，质量达标 |

---

## 6. 风险评估

| 风险 | 影响 | 应对策略 |
|------|------|----------|
| AI生成质量不稳定 | 高 | 建立多轮提示词优化机制，支持人工修正 |
| 生成速度慢 | 中 | 实现流式输出，优化提示词长度，使用缓存 |
| 生成结果不符合预期 | 中 | 提供详细的生成参数配置，支持生成前预览 |
| API调用成本高 | 低 | 实现生成结果缓存，批量生成优化 |

---

## 7. 依赖关系

- **前置依赖**：统一AI服务架构 (`AIService`) 已完成
- **并行开发**：前端界面可以与后端生成器并行开发
- **后置任务**：生成质量优化依赖于所有生成器完成

---

**计划版本**：1.0
**制定日期**：2026-02-12
**预计周期**：6周
**负责人**：待定

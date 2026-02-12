## 计划概述

基于现有统一AI服务架构 (`AIService`)，开发AI智能设定生成功能，让AI能够根据用户需求自动生成设定数据库中各项数据条目。

## 需要修改的文件

### 1. project_rules.md
在文件末尾添加计划文件命名规范：

```markdown
## 六、计划文件命名规范

**核心原则：所有开发计划文件必须以 P+编号 开头命名。**

### 6.1 命名格式

```
P{编号}-{计划主题}.md
```

### 6.2 示例

- `P1-项目初始化计划.md`
- `P2-设定管理开发计划.md`
- `P3-AI智能设定生成计划.md`
- `P4-编辑器功能开发计划.md`

### 6.3 编号规则

- 编号从1开始递增
- 已完成的计划保留编号，不重复使用
- 新计划取当前最大编号+1

### 6.4 存放位置

所有计划文件统一存放在项目根目录下
```

### 2. 创建 P3-AI智能设定生成计划.md

创建详细的AI智能设定生成功能开发计划文档，包含：

**第1周：基础架构搭建**
- 提示词模板系统设计 (`PromptTemplateManager`)
- 生成策略系统 (`GenerationStrategySelector`)
- 上下文组装器 (`ContextAssembler`)

**第2周：核心实体生成器**
- 角色生成器 (`CharacterGenerator`)
- 地点生成器 (`LocationGenerator`)
- 物品生成器 (`ItemGenerator`)

**第3周：扩展实体生成器**
- 势力生成器 (`FactionGenerator`)
- 能量体系生成器 (`EnergySystemGenerator`)
- 文明文化生成器 (`CivilizationGenerator`)

**第4周：历史与地理生成器**
- 历史事件生成器 (`HistoricalEventGenerator`)
- 地理区域生成器 (`RegionGenerator`)
- 维度位面生成器 (`DimensionGenerator`)

**第5周：前端集成与API**
- AI生成服务API开发
- 前端生成界面开发
- 智能提示与引导功能

**第6周：测试与优化**
- 生成质量测试
- 性能优化
- 用户反馈集成

### 3. 后端开发（第1-4周）

创建以下文件：
- `backend/app/services/generation/prompt_template_manager.py`
- `backend/app/services/generation/generation_strategy.py`
- `backend/app/services/generation/context_assembler.py`
- `backend/app/services/generation/generators/character_generator.py`
- `backend/app/services/generation/generators/location_generator.py`
- `backend/app/services/generation/generators/item_generator.py`
- `backend/app/services/generation/generators/faction_generator.py`
- `backend/app/services/generation/generators/energy_system_generator.py`
- `backend/app/services/generation/generators/civilization_generator.py`
- `backend/app/services/generation/generators/historical_event_generator.py`
- `backend/app/services/generation/generators/region_generator.py`
- `backend/app/services/generation/generators/dimension_generator.py`
- `backend/app/routes/ai_generation_routes.py`

### 4. 数据库迁移（第1周）

创建Alembic迁移脚本，新增表：
- `ai_generation_templates` - AI生成模板表
- `ai_generation_history` - AI生成历史表
- `ai_generation_feedback` - AI生成反馈表

### 5. 前端开发（第5周）

创建/修改以下文件：
- `frontend/src/services/aiGenerationService.js`
- `frontend/src/components/AIGeneration/AIGenerateButton.jsx`
- `frontend/src/components/AIGeneration/AIGenerateModal.jsx`
- `frontend/src/components/AIGeneration/GenerationResultPreview.jsx`
- 在各设定管理页面集成AI生成按钮

## 确认后执行步骤

1. 首先更新 project_rules.md 添加计划文件命名规范
2. 创建 P3-AI智能设定生成计划.md 详细计划文档
3. 开始按周执行开发任务
# Pen-of-Creation（创世之笔）

## 项目介绍

Pen-of-Creation（创世之笔）是一个基于AI的小说编辑器，专为独立创作者设计的智能小说创作伙伴。它深度融合AI能力于创作全流程，提供非线性、深度智能辅助的创作环境，从故事大纲生成到章节细化，从角色设定到世界构建，全方位辅助小说创作过程。

**版本**: 0.3

## 功能特性

### 核心模块

#### 📋 故事蓝图系统
- **智能大纲生成**: 基于项目信息自动生成详细故事大纲
- **卷纲分解**: 将大纲分解为合理的卷纲结构，支持手动编辑
- **章纲细化**: 将卷纲分解为详细的章纲，支持分批生成
- **大纲架构师**: 多种风格的故事大纲架构师，专为男频爽文优化
- **版本管理**: 自动管理大纲、卷纲、章纲的版本
- **数据库持久化**: 所有大纲数据自动保存到数据库
- **流式输出**: 实时显示AI生成过程，提升用户体验

#### 📝 智能写作工坊
- **沉浸式编辑器**: 基于Monaco Editor的专业文本编辑环境
- **AI辅助写作**: 提供灵感和建议，帮助克服写作障碍
- **内容生成**: 根据设定自动生成章节内容
- **风格分析**: 分析作品风格，提供一致性建议
- **场景卡片**: 支持快速切换不同场景/视角
- **章节外观管理**: 追踪角色和地点在各章节的出现情况

#### 🗺️ 创作导航
- **可视化故事结构**: 直观展示故事脉络和结构
- **情节地图**: 构建和管理情节发展
- **章节关系图**: 展示章节之间的逻辑关系和联系
- **今日任务**: 基于创作目标生成今日建议任务
- **灵感激发器**: 提供情节转折建议/冲突点子/对话开场/场景灵感

#### 🧠 创作智库（智能设定管理）
- **世界观管理**: 创建和管理多个世界，支持复杂的世界设定
- **角色管理**: 创建和管理角色的详细设定（基础信息、外貌、性格、能力、关系等）
- **地点管理**: 构建和管理故事地点（城市、建筑、区域等详细信息）
- **物品管理**: 管理故事中的关键物品（装备、道具、特殊物品等）
- **势力管理**: 管理故事中的派系和组织（国家、门派、组织等）
- **关系管理**: 维护角色、地点、物品、势力之间的关系网络
- **关系图谱**: 可视化展示实体间的关系网络
- **标签系统**: 支持对实体进行标签分类和检索
- **全局搜索**: 支持跨实体的全局搜索功能

#### 🌍 世界构建系统（AI智能生成）
- **能量体系**: 定义世界的能量类型（魔法、斗气、灵气等）
- **力量等级**: 构建修炼等级体系和晋升规则
- **通用技能**: 管理世界中的通用技能
- **能量形态**: 定义具体能量表现形式
- **力量代价**: 设置使用力量的代价系统
- **文明文化**: 创建不同的文明类型和文化特征
- **社会阶级**: 定义社会阶层结构和流动性
- **文化习俗**: 管理节日、仪式、礼仪、禁忌等传统
- **经济体系**: 构建货币、贸易、产业等经济系统
- **政治体系**: 定义政体、权力结构、法律体系
- **历史脉络**: 记录历史纪元、重大事件、历史人物
- **地理区域**: 构建世界的地理结构和区域划分（支持树状结构）
- **维度位面**: 支持多维度、多位面的复杂世界设定
- **天体星球**: 管理天体和星球信息
- **自然法则**: 定义世界的物理法则和特殊规则
- **种族设定**: 管理不同种族信息
- **生物类型**: 管理普通生物和特殊生物

#### 🤖 AI生成系统
- **世界观元素生成**: AI自动生成角色、地点、势力、物品、关系等元素
- **概念融合**: 将AI生成的内容与现有设定智能融合
- **检查点机制**: 支持生成过程中的检查点和恢复
- **会话管理**: 管理AI生成会话，支持中断和继续
- **生成策略**: 多种生成策略可选（批量生成、渐进生成等）
- **上下文传递**: 确保分批生成的内容保持连贯

#### 📊 作品分析
- **结构分析**: 分析作品结构和节奏
- **风格分析**: 评估作品风格一致性
- **长度分析**: 分析章节长度分布
- **情感曲线**: 分析故事情感变化
- **健康度分析**: 综合评估作品健康度
- **世界统计**: 提供世界设定的统计信息

#### 📄 作品导出
- **多种格式支持**: 支持导出为Word、PDF、Markdown、纯文本格式
- **内容整理**: 自动整理和格式化内容
- **阶段性版本**: 支持创建版本节点、版本对比

#### 🔄 实时一致性维护
- **情节一致性检查**: 确保故事情节连贯一致
- **角色一致性检查**: 确保角色行为和设定一致
- **世界设定一致性**: 确保世界设定的一致性

### 高级特性

- **⚙️ 可配置的AI提示词**: 自定义AI生成策略和模板管理
- **🔧 批量生成**: 支持大批量章节的分批生成，避免token限制
- **🔗 上下文传递**: 确保分批生成的章节保持情节连贯
- **✏️ 手动编辑**: 支持对所有层级的大纲进行手动修改
- **📈 进度跟踪**: 实时显示生成进度和章节数量
- **🌐 多AI提供商支持**: 支持OpenAI、Anthropic、Google、Azure、SiliconFlow等多种AI服务
- **🏷️ 标签系统**: 支持对实体进行标签分类和检索
- **🔍 全局搜索**: 支持跨实体的全局搜索功能

## 技术栈

### 前端
- **React 19** - 用户界面框架
- **Vite 7** - 构建工具
- **Ant Design 6** - UI组件库
- **Monaco Editor** - 代码编辑器（用于文本编辑）
- **ECharts 6** - 数据可视化图表
- **Axios** - HTTP客户端
- **React Router 7** - 路由管理

### 后端
- **Python 3** - 编程语言
- **Flask 2** - Web框架
- **SQLite** - 本地数据库
- **SQLAlchemy** - ORM框架
- **Alembic** - 数据库迁移工具
- **Flask-CORS** - 跨域支持
- **Flask-Compress** - 响应压缩

### AI服务
- **OpenAI API** - GPT模型
- **Anthropic API** - Claude模型
- **Google AI API** - Gemini模型
- **Azure OpenAI API** - Azure托管的OpenAI服务
- **SiliconFlow API** - 国内AI服务

### 导出支持
- **python-docx** - Word文档生成
- **WeasyPrint** - PDF生成

## 快速开始

### 环境要求
- Node.js 18+
- Python 3.8+
- SQLite 3

### 前端启动
```bash
cd frontend
npm install
npm run dev
```
前端服务将运行在 http://localhost:5173

### 后端启动
```bash
cd backend
pip install -r requirements.txt
python run.py
```
后端服务将运行在 http://localhost:5000

### 数据库初始化
后端首次启动时会自动创建数据库表。如需执行迁移：
```bash
cd backend
alembic upgrade head
```

## 项目结构

```
.
├── backend/                 # 后端代码
│   ├── app/                 # 应用代码
│   │   ├── api/             # API路由
│   │   │   ├── routes/      # 路由模块
│   │   │   │   ├── ai_outline_routes.py      # AI大纲生成路由
│   │   │   │   ├── chapter_routes.py         # 章节路由
│   │   │   │   ├── decompose_routes.py      # 分解路由
│   │   │   │   ├── generation_setting_routes.py  # 生成设置路由
│   │   │   │   ├── generation_utils_routes.py    # 生成工具路由
│   │   │   │   ├── outline_routes.py       # 大纲路由
│   │   │   │   ├── story_model_routes.py    # 故事模型路由
│   │   │   │   ├── volume_routes.py         # 卷路由
│   │   │   │   ├── world_routes.py          # 世界路由
│   │   │   │   └── world_stats_routes.py    # 世界统计路由
│   │   │   ├── ai.py            # AI服务接口
│   │   │   ├── ai_generation_routes.py  # AI生成路由
│   │   │   ├── ai_version.py    # AI版本管理
│   │   │   ├── analysis.py      # 作品分析接口
│   │   │   ├── blueprint.py     # 故事蓝图接口
│   │   │   ├── chapter.py       # 章节管理接口
│   │   │   ├── chapter_appearance.py  # 章节外观管理
│   │   │   ├── character.py     # 角色管理接口
│   │   │   ├── civilization_api.py   # 文明API
│   │   │   ├── cultural_api.py       # 文化API
│   │   │   ├── energy_society.py     # 能量与社会API
│   │   │   ├── energy_system_api.py  # 能量体系API
│   │   │   ├── export.py         # 导出接口
│   │   │   ├── faction.py        # 势力管理接口
│   │   │   ├── history_timeline.py  # 历史时间线接口
│   │   │   ├── item.py           # 物品管理接口
│   │   │   ├── location.py       # 地点管理接口
│   │   │   ├── navigation.py     # 创作导航接口
│   │   │   ├── power_cost_api.py     # 力量代价API
│   │   │   ├── power_level_api.py     # 力量等级API
│   │   │   ├── project.py        # 项目管理接口
│   │   │   ├── relationship.py    # 关系管理接口
│   │   │   ├── setting.py         # 设定管理接口
│   │   │   ├── setting_ability.py     # 能力设定
│   │   │   ├── setting_character.py   # 角色设定
│   │   │   ├── setting_energy.py      # 能量设定
│   │   │   ├── setting_equipment.py   # 装备设定
│   │   │   ├── setting_faction.py     # 势力设定
│   │   │   ├── setting_history.py      # 历史设定
│   │   │   ├── setting_location.py     # 地点设定
│   │   │   ├── setting_society.py      # 社会设定
│   │   │   ├── setting_timeline.py    # 时间线设定
│   │   │   ├── setting_world.py        # 世界设定
│   │   │   ├── tags_relations.py   # 标签与关系接口
│   │   │   ├── world_setting.py    # 世界设定接口
│   │   │   ├── worlds.py           # 世界管理接口
│   │   │   ├── worldview_extraction.py    # 世界观提取
│   │   │   ├── worldview_generation.py   # 世界观生成
│   │   │   ├── worldview_storage.py      # 世界观存储
│   │   │   └── worldview_validation.py   # 世界观验证
│   │   ├── config/              # 配置文件
│   │   │   ├── ai_config.json   # AI配置文件
│   │   │   └── ai_config.py     # AI配置
│   │   ├── services/            # 服务层
│   │   │   ├── generation/      # AI生成服务
│   │   │   │   ├── generators/  # 生成器
│   │   │   │   │   ├── base_generator.py       # 基础生成器
│   │   │   │   │   ├── character_generator.py   # 角色生成器
│   │   │   │   │   ├── civilization_generator.py # 文明生成器
│   │   │   │   │   ├── dimension_generator.py   # 维度生成器
│   │   │   │   │   ├── energy_system_generator.py # 能量体系生成器
│   │   │   │   │   ├── faction_generator.py     # 势力生成器
│   │   │   │   │   ├── historical_event_generator.py # 历史事件生成器
│   │   │   │   │   ├── item_generator.py         # 物品生成器
│   │   │   │   │   ├── location_generator.py     # 地点生成器
│   │   │   │   │   ├── region_generator.py       # 区域生成器
│   │   │   │   │   └── relation_generator.py     # 关系生成器
│   │   │   │   ├── checkpoint_service.py     # 检查点服务
│   │   │   │   ├── concept_merge_service.py  # 概念融合服务
│   │   │   │   ├── context_assembler.py      # 上下文组装器
│   │   │   │   ├── generation_strategy.py    # 生成策略
│   │   │   │   ├── prompt_template_manager.py # 提示词模板管理
│   │   │   │   ├── result_parser.py          # 结果解析器
│   │   │   │   └── session_manager.py         # 会话管理
│   │   │   ├── providers/         # AI服务提供商
│   │   │   │   ├── anthropic_provider.py
│   │   │   │   ├── azure_provider.py
│   │   │   │   ├── google_provider.py
│   │   │   │   ├── openai_provider.py
│   │   │   │   └── siliconflow_provider.py
│   │   │   ├── ai_service.py              # AI服务
│   │   │   ├── chapter_appearance_service.py  # 章节外观服务
│   │   │   ├── content_extractor.py       # 内容提取器
│   │   │   └── worldview_element_extractor.py # 世界观元素提取器
│   │   └── models.py          # 数据模型（60+张表）
│   ├── migrations/            # 数据库迁移文件
│   ├── requirements.txt       # 依赖文件
│   └── run.py                 # 启动文件
├── frontend/                  # 前端代码
│   ├── public/                # 静态资源
│   ├── src/                   # 源代码
│   │   ├── components/        # 组件
│   │   │   ├── SettingManagement/  # 设定管理组件
│   │   │   │   ├── Common/         # 通用组件
│   │   │   │   │   ├── EntityCard.jsx
│   │   │   │   │   ├── GlobalSearchModal.jsx
│   │   │   │   │   ├── RelationManagement.jsx
│   │   │   │   │   ├── RelationNetworkGraph.jsx
│   │   │   │   │   ├── RelationsPanel.jsx
│   │   │   │   │   └── StatCard.jsx
│   │   │   │   └── WorldSetting/   # 世界设定组件
│   │   │   │       ├── EnergySystem.jsx
│   │   │   │       ├── FactionManagement.jsx
│   │   │   │       ├── HistoryTimeline.jsx
│   │   │   │       ├── ItemManagement.jsx
│   │   │   │       ├── LocationManagement.jsx
│   │   │   │       ├── SocietySystem.jsx
│   │   │   │       ├── TimelineManagement.jsx
│   │   │   │       └── WorldArchitecture.jsx
│   │   │   ├── AIChat.jsx
│   │   │   ├── ArchitectManager.jsx
│   │   │   ├── CharacterCard.jsx
│   │   │   ├── CreationFlowChart.jsx
│   │   │   ├── DataVisualization.jsx
│   │   │   ├── InspirationGenerator.jsx
│   │   │   ├── MainLayout.jsx
│   │   │   ├── OutlineTree.jsx
│   │   │   ├── ProjectCreation.jsx
│   │   │   ├── StreamingOutput.jsx
│   │   │   ├── SystemPromptConfig.jsx
│   │   │   ├── TaskList.jsx
│   │   │   ├── TextEditor.jsx
│   │   │   ├── WorkAnalysis.jsx
│   │   │   └── WorldCard.jsx
│   │   ├── config/          # 配置文件
│   │   ├── contexts/        # React Context
│   │   ├── hooks/          # 自定义Hooks
│   │   ├── pages/          # 页面
│   │   ├── services/       # API服务
│   │   ├── styles/          # 样式文件
│   │   └── utils/          # 工具函数
│   ├── package.json         # 依赖配置
│   └── vite.config.js       # Vite配置
├── .trae/                   # Trae IDE配置
│   ├── documents/          # 开发文档
│   ├── rules/              # 项目规则
│   └── skills/             # 自定义技能
├── docs/                    # 技术文档
│   └── database_schema.md   # 数据库结构文档
├── 模块功能定义/            # 功能定义文档
├── .gitignore               # Git忽略文件
├── README.md                # 项目说明
├── P3-AI智能设定生成计划.md  # AI生成计划
├── 开发文档.md              # 开发文档
└── 未来功能规划.md          # 未来功能规划
```

## 数据库结构

项目使用SQLite数据库，包含以下主要表结构：

### 核心表
- **Project** - 项目信息
- **World** - 世界管理
- **Outline** - 故事大纲
- **Volume** - 卷/部信息
- **Chapter** - 章节信息

### 设定表
- **Character** - 角色详细设定（50+字段）
- **CharacterBackground** - 角色背景（多阶段）
- **CharacterAbility/CharacterAbilityDetail** - 角色能力详情
- **CharacterTrait** - 角色特质
- **Location** - 地点详细设定（30+字段）
- **Item** - 物品详细设定
- **Faction** - 势力详细设定（40+字段）
- **Relationship** - 实体间关系
- **EntityRelation** - 实体关系网络

### 世界构建表
- **WorldSetting** - 世界观设定
- **SocietyCulture** - 社会文化
- **History** - 历史
- **EnergySystem** - 能量体系
- **EnergyForm** - 能量形态
- **PowerLevel** - 力量等级
- **PowerCost** - 力量代价
- **CommonSkill** - 通用技能
- **Civilization** - 文明类型
- **CivilizationRegion** - 文明区域
- **SocialClass** - 社会阶级
- **CulturalCustom** - 文化习俗
- **EconomicSystem** - 经济体系
- **PoliticalSystem** - 政治体系
- **HistoricalEra** - 历史纪元
- **HistoricalEvent** - 历史事件
- **HistoricalFigure** - 历史人物
- **EventParticipant** - 事件参与者
- **Region** - 地理区域（支持树状结构）
- **Dimension** - 维度/位面
- **CelestialBody** - 天体
- **NaturalLaw** - 自然法则

### 能力与种族表
- **Ability** - 能力定义
- **Skill** - 技能定义
- **Talent** - 天赋定义
- **Race** - 种族
- **Creature** - 生物
- **SpecialCreature** - 特殊生物

### 结构扩展表
- **CharacterRelationship** - 角色关系结构
- **FactionStructure** - 势力结构
- **FactionGoal** - 势力目标
- **LocationStructure** - 地点结构
- **SpecialLocation** - 特殊地点
- **EquipmentSystem** - 装备系统
- **SpecialItem** - 特殊物品

### AI生成表
- **AIGenerationVersion** - AI生成版本
- **AIGenerationCheckpoint** - AI生成检查点
- **ConceptMergeRecord** - 概念融合记录
- **StoryModel** - 故事模型

### 辅助表
- **Version** - 版本管理
- **Note** - 笔记
- **Task** - 创作任务
- **Inspiration** - 灵感记录
- **EmotionBoard** - 情绪板
- **NavigationFlow** - 导航流程
- **Timeline** - 时间线
- **DataAssociation** - 数据关联
- **Tag/EntityTag** - 标签系统
- **EntityChapterAppearance** - 实体章节出现记录

完整的数据库结构文档请参见 [docs/database_schema.md](docs/database_schema.md)

## 配置说明

### AI配置
在 `backend/app/config/ai_config.json` 中配置AI服务：
```json
{
    "openai": {
        "api_key": "your-api-key",
        "model": "gpt-4",
        "temperature": 0.7
    },
    "anthropic": {
        "api_key": "your-api-key",
        "model": "claude-3-opus-20240229"
    }
}
```

### 前端配置
在 `frontend/src/config/` 目录下配置前端参数，包括：
- 模块配置
- API端点
- UI主题

## 开发文档

- **AI生成计划**: 项目的AI生成功能开发计划 ([P3-AI智能设定生成计划.md](P3-AI智能设定生成计划.md))
- **开发文档**: 技术架构和实现细节 ([开发文档.md](开发文档.md))
- **数据库结构**: 完整的数据库表结构说明 ([docs/database_schema.md](docs/database_schema.md))
- **未来功能规划**: 计划中的新功能和改进 ([未来功能规划.md](未来功能规划.md))
- **项目规则**: 开发规范和最佳实践 ([.trae/rules/project_rules.md](.trae/rules/project_rules.md))

## 开发规范

### 代码规范
- 遵循 `.trae/rules/project_rules.md` 中定义的项目开发规则
- 前后端字段命名保持一致，必要时进行字段映射转换
- 单个文件代码行数超过1200行时，考虑拆分为多个文件

### 数据库变更
- 所有数据库结构变更必须通过 Alembic 迁移脚本执行
- 修改字段时需同时更新前端表单和后端API
- 保留数据库备份以防数据丢失

### 前后端命名规范
- 后端数据库字段名为标准，前端必须适配后端
- 表格列必须使用后端返回的字段名作为 `dataIndex`
- 编辑回显时需要进行字段反向映射

## 版本历史

### v0.3 (当前版本)
- ✅ AI世界观元素生成系统（角色、地点、势力、物品、关系等）
- ✅ 概念融合服务 - 智能合并AI生成内容与现有设定
- ✅ 检查点机制 - 支持生成过程中断和恢复
- ✅ 会话管理 - 多会话支持和生成进度追踪
- ✅ 提示词模板管理 - 可配置的AI生成策略
- ✅ 章节外观管理 - 追踪实体在各章节的出现
- ✅ 世界统计功能 - 提供世界设定统计信息
- ✅ 新增60+数据库模型表

### v0.2
- ✅ 完整的世界构建系统（能量、文明、历史、地理等）
- ✅ 扩展的角色、地点、物品、势力设定字段
- ✅ 关系图谱可视化
- ✅ 标签系统
- ✅ 全局搜索功能
- ✅ 多AI提供商支持
- ✅ 数据库迁移系统

### v0.1
- ✅ 基础项目管理
- ✅ 故事蓝图系统
- ✅ 基础设定管理
- ✅ 章节编辑器
- ✅ AI辅助写作
- ✅ 作品导出

## 未来规划

### 版本 0.4 计划
- [ ] 增强AI写作能力，支持更多写作风格
- [ ] 实现多语言支持
- [ ] 添加协作功能，支持多人共同创作
- [ ] 开发移动应用，支持移动端写作

### 版本 0.5 计划
- [ ] 实现更高级的故事分析算法
- [ ] 添加智能编辑建议功能
- [ ] 开发插件系统，支持扩展功能
- [ ] 添加更多导出格式，支持专业出版格式

## 贡献指南

欢迎贡献代码和提出建议！

1. Fork 项目仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请通过以下方式联系我们：

- GitHub Issues: 在项目仓库中提交Issue
- 邮件: 请在项目中查找联系信息

---

**Pen-of-Creation（创世之笔）- 释放你的创作潜能** 🚀

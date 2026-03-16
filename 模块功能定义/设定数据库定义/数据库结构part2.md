世界观设定模块数据库字段设计

前言

我采用分表、结构化、可扩展的设计理念，避免大宽表。每个主表对应核心概念，子表存储一对多关系。所有表都通过world_id关联到主世界表。

模块一：世界基本框架

1. 世界主表

表名：worlds
说明：每个独立世界观的核心记录
• world_id (唯一标识)

• world_name (世界名称)

• core_theme (核心主题/类型：史诗、悬疑、科幻、奇幻)

• core_concept (一句话核心理念)

• creation_myth (创世神话文本)

• world_type (世界类型：单一/多元/位面/嵌套)

• status (状态：草稿/完善/归档)

• creator_id (创建者)

• created_at (创建时间)

• updated_at (更新时间)

• version (版本号)

• cover_image (封面图URL)

• description (简要介绍)

2. 维度/位面表

表名：dimensions
说明：一个世界可以有多个维度/位面
• dimension_id

• world_id (外键)

• dimension_name (维度名称)

• dimension_type (类型：主物质位面/元素位面/神国/冥界/口袋空间)

• parent_dimension_id (父维度ID，支持嵌套)

• access_conditions (进入条件)

• physical_laws (特殊物理法则)

• time_flow_ratio (时间流速比，相对于主世界)

• energy_concentration (能量浓度)

• stability_level (稳定性)

• inhabitants (主要栖居者)

• description (详细描述)

3. 地理区域表

表名：regions
说明：多级地理结构（世界→大陆→国家→行省）
• region_id

• world_id (外键)

• parent_region_id (父区域ID，支持层级)

• region_name (区域名称)

• region_type (类型：大陆/海洋/国家/山脉/森林/沙漠)

• area_size (面积大小)

• climate_type (气候类型)

• terrain_features (地形特征JSON)

• natural_resources (自然资源列表)

• strategic_importance (战略重要性)

• danger_level (危险等级)

• description (地理描述)

• map_coordinates (地图坐标JSON)

4. 自然法则表

表名：natural_laws
说明：世界的物理/魔法基础法则
• law_id

• world_id (外键)

• law_name (法则名称)

• law_type (类型：物理/魔法/时空/生命/因果)

• is_universal (是否全局适用)

• affected_dimensions (适用维度ID列表)

• affected_regions (适用区域ID列表)

• law_statement (法则陈述)

• exceptions (例外情况)

• enforcement_mechanism (执行机制)

• discovery_history (发现历史)

• description (详细解释)

5. 天体系统表

表名：celestial_bodies
说明：恒星、行星、卫星等天体
• body_id

• world_id (外键)

• parent_body_id (绕哪个天体运行)

• body_name (天体名称)

• body_type (类型：恒星/行星/卫星/彗星/小行星)

• size_category (大小分类)

• orbital_period (轨道周期)

• rotation_period (自转周期)

• atmosphere_type (大气类型)

• surface_conditions (表面条件)

• inhabitable (是否可居住)

• inhabitants (栖居物种)

• special_features (特殊特征)

• description (详细描述)

模块二：能量与规则体系

6. 能量体系表

表名：energy_systems
说明：定义世界的能量类型和规则
• system_id

• world_id (外键)

• system_name (体系名称：魔力/真气/灵能/原力)

• energy_source (能量来源)

• philosophical_alignment (哲学倾向：守序/混沌/创造/毁灭)

• natural_abundance (自然丰度)

• tidal_cycle (潮汐周期)

• conversion_efficiency (转化效率)

• pollution_effect (污染效应)

• storage_methods (存储方式)

• detection_methods (探测方式)

• fundamental_principles (基本原理)

• description (体系概述)

7. 能量形态表

表名：energy_forms
说明：具体能量形态（一个体系可有多种形态）
• form_id

• system_id (外键，关联能量体系)

• form_name (形态名称：火元素/生命能/时空能)

• form_type (类型：元素/生命/概念/复合)

• basic_properties (基本属性)

• interaction_rules (相互作用规则)

• purification_method (提纯方法)

• corruption_effects (污染/腐化效果)

• visual_manifestation (视觉表现)

• sensory_perception (感官感知)

• description (详细描述)

8. 力量等级体系表

表名：power_level_systems
说明：境界/等级划分系统
• level_system_id

• world_id (外键)

• system_name (体系名称：修仙九境/魔法十阶)

• total_levels (总等级数)

• level_framework (等级框架JSON，包含各级名称、特征、寿命)

• breakthrough_conditions (突破通用条件)

• bottleneck_description (瓶颈描述)

• tribulation_system (天劫/考验系统)

• regression_risk (倒退风险)

• ultimate_form (巅峰形态)

• description (体系概述)

9. 通用技能表

表名：common_skills
说明：世界公用的基础技能/法术
• skill_id

• world_id (外键)

• skill_name (技能名称)

• skill_type (类型：攻击/防御/辅助/治疗/生活)

• energy_system_id (所需能量体系)

• required_level (最低等级要求)

• casting_components (施法组件：咒语/手势/材料)

• effect_range (影响范围)

• duration (持续时间)

• cooldown (冷却时间)

• cost_resource (消耗资源)

• side_effects (副作用)

• learning_difficulty (学习难度)

• description (技能描述)

• common_variations (常见变体)

10. 力量代价表

表名：power_costs
说明：使用力量的代价系统
• cost_id

• world_id (外键)

• cost_type (代价类型：寿命/记忆/情感/理智/随机)

• trigger_conditions (触发条件)

• payment_mechanism (支付机制)

• severity_level (严重程度)

• reversible (是否可逆)

• mitigation_methods (缓解方法)

• accumulation_effect (累积效应)

• description (详细说明)

模块三：社会与文化体系

11. 文明/文化圈表

表名：civilizations
说明：定义不同的文明实体
• civilization_id

• world_id (外键)

• civilization_name (文明名称)

• primary_region_id (主要区域)

• development_stage (发展阶段：原始/农耕/工业/信息/后信息)

• tech_magic_level (科技魔法水平)

• core_ideology (核心意识形态)

• core_values (核心价值观JSON)

• population_estimate (人口估算)

• average_lifespan (平均寿命)

• social_model (社会模型)

• description (文明概述)

• historical_origin (历史起源)

12. 文明-区域关联表

表名：civilization_regions
说明：多对多关系，记录文明在哪些区域有影响
• id

• civilization_id (外键)

• region_id (外键)

• influence_level (影响力：核心/主要/次要/边缘)

• control_strength (控制强度)

• settlement_year (在此定居年份)

• conflict_history (冲突历史)

• current_relation (当前关系)

13. 社会阶级表

表名：social_classes
说明：一个文明内的阶级划分
• class_id

• civilization_id (外键)

• class_name (阶级名称)

• hierarchy_level (层级数字，1为最高)

• population_percentage (人口占比%)

• birth_rights (与生俱来的权利)

• social_privileges (社会特权)

• legal_restrictions (法律限制)

• mobility_conditions (阶级流动条件)

• typical_lifestyle (典型生活方式)

• education_access (教育机会)

• political_power (政治权力)

• economic_status (经济状况)

• description (阶级描述)

14. 文化习俗表

表名：cultural_customs
说明：具体的文化习俗
• custom_id

• civilization_id (外键)

• custom_name (习俗名称)

• custom_type (类型：节日/礼仪/禁忌/艺术/饮食/服饰/婚丧)

• frequency (频率：每日/每周/每年/一生一次)

• participants (参与者范围)

• required_actions (必需行为)

• forbidden_actions (禁忌行为)

• symbolic_meanings (象征意义)

• historical_origin (历史起源)

• variations (地区变体)

• modern_adaptation (现代适应)

• description (习俗详情)

15. 经济体系表

表名：economic_systems
说明：文明的经济运行方式
• economy_id

• civilization_id (外键)

• economic_model (经济模式：物物交换/市场经济/计划经济/混合)

• currency_name (货币名称)

• currency_material (货币材质)

• denomination_system (面额体系)

• exchange_rates (汇率体系JSON)

• major_industries (主要产业JSON)

• trade_routes (主要商路)

• trade_partners (贸易伙伴)

• resource_dependencies (资源依赖)

• wealth_distribution (财富分布)

• taxation_system (税收系统)

• banking_system (银行系统)

• economic_challenges (经济挑战)

• description (经济概述)

16. 政治体系表

表名：political_systems
说明：文明的政治结构
• polity_id

• civilization_id (外键)

• government_type (政体类型：君主制/共和制/神权制/寡头制)

• power_structure (权力结构描述)

• succession_system (继承制度)

• decision_process (决策流程)

• administrative_divisions (行政区划)

• legal_system (法律体系)

• military_organization (军事组织)

• diplomatic_style (外交风格)

• internal_conflicts (内部矛盾)

• external_threats (外部威胁)

• political_stability (政治稳定性)

• description (政治概述)

模块四：历史脉络

17. 历史纪元表

表名：historical_eras
说明：划分大的历史时期
• era_id

• world_id (外键)

• era_name (纪元名称)

• start_year (开始年份，可自定义纪年)

• end_year (结束年份)

• duration_description (持续时间描述)

• main_characteristics (时代特征)

• key_technologies (关键技术)

• dominant_civilizations (主导文明)

• ending_cause (结束原因)

• legacy_impact (遗留影响)

• description (纪元详述)

18. 历史事件表

表名：historical_events
说明：具体的历史事件
• event_id

• world_id (外键)

• era_id (外键，所属纪元)

• event_name (事件名称)

• event_type (类型：战争/灾难/发现/发明/条约/革命)

• start_year (开始年份)

• end_year (结束年份)

• location_ids (发生地点ID列表)

• primary_causes (主要原因)

• key_participants (主要参与者)

• event_sequence (事件过程)

• immediate_outcomes (直接结果)

• long_term_consequences (长期影响)

• historical_significance (历史意义)

• conflicting_accounts (矛盾记载)

• description (事件详述)

19. 历史人物表

表名：historical_figures
说明：历史上有记载的人物
• figure_id

• world_id (外键)

• figure_name (人物名称)

• birth_year (出生年份)

• death_year (死亡年份)

• birth_place_id (出生地)

• death_place_id (死亡地)

• primary_role (主要身份：统治者/将军/学者/艺术家)

• civilization_id (所属文明)

• social_class (社会阶级)

• key_achievements (主要成就)

• controversies (争议)

• historical_legacy (历史遗产)

• character_id (可选：关联到具体角色)

• description (人物详述)

20. 事件-人物关联表

表名：event_participants
说明：多对多，记录人物在事件中的角色
• id

• event_id (外键)

• figure_id (外键)

• role_type (角色：领导者/参与者/反对者/受害者/旁观者)

• contribution_level (贡献程度)

• motivation (动机)

• outcome_for_participant (对参与者的结果)

• description (参与详情)

模块间关键关系总结

核心外键关联

1. 所有表 → worlds.world_id (每个设定都属于一个世界观)
2. dimensions → worlds (一个世界有多个维度)
3. regions → regions.parent_region_id (区域层级结构)
4. regions → worlds (区域属于世界)
5. civilizations → worlds (文明属于世界)
6. civilization_regions → civilizations + regions (多对多)
7. historical_events → historical_eras (事件属于纪元)
8. event_participants → historical_events + historical_figures (多对多)
9. common_skills → energy_systems (技能需要能量体系)
10. power_level_systems → worlds (等级体系属于世界)

可选关联

• historical_figures.character_id → characters.character_id (如果历史人物在故事中出场)

• celestial_bodies.parent_body_id → celestial_bodies.body_id (天体绕行关系)

• regions.primary_civilization_id → civilizations.civilization_id (区域主要文明)

层级结构实现

1. 地理层级：regions.parent_region_id 自引用
2. 维度嵌套：dimensions.parent_dimension_id 自引用
3. 天体系统：celestial_bodies.parent_body_id 自引用
4. 时间层级：historical_events.era_id → historical_eras

多对多中间表

1. civilization_regions (文明-区域)
2. event_participants (事件-人物)
3. 未来可扩展：region_resources (区域-资源)、civilization_conflicts (文明-冲突)等

扩展性设计

JSON字段的合理使用

1. 存储列表/数组：terrain_features、natural_resources、core_values
2. 存储键值对：level_framework、exchange_rates
3. 存储复杂结构：map_coordinates、orbital_data

预留扩展字段

每个主表可包含：
• custom_data (JSON，用户自定义扩展)

• tags (标签数组，方便分类检索)

• attachments (附件ID列表，关联文件表)

• notes (作者私密备注)

版本控制

• 所有表都有version字段

• 可考虑单独的world_versions表存储完整快照

• 支持分支设定：branch_name字段


小说设定数据库表结构设计（续）

模块五：角色设定模块

21. 角色主表

表名：characters
说明：所有角色的核心档案
• character_id

• world_id (外键，所属世界观)

• character_name (角色姓名)

• alternative_names (别名/称号JSON)

• role_type (角色类型：主角/配角/反派/龙套/背景)

• status (状态：存活/死亡/失踪/转生)

• importance_level (重要程度：1-10级)

• birth_date (出生日期)

• death_date (死亡日期)

• birth_place_id (出生地，关联regions)

• current_location_id (当前位置)

• race_id (种族，关联生物图鉴)

• gender (性别)

• age (年龄)

• appearance_age (外貌年龄)

• physical_description (外貌描述)

• distinguishing_features (显著特征)

• portrait_image (角色肖像)

• brief_intro (一句话简介)

• description (详细档案)

22. 角色属性表

表名：character_attributes
说明：角色的能力属性数值化
• attribute_id

• character_id (外键)

• attribute_type (属性类型：力量/敏捷/智力/感知/体质/魅力)

• base_value (基础值)

• current_value (当前值)

• max_value (最大值)

• growth_rate (成长率)

• last_updated (最后更新时间)

• description (属性说明)

23. 角色背景故事表

表名：character_backgrounds
说明：角色的经历和背景
• background_id

• character_id (外键)

• period_name (时期名称：童年/少年/成年)

• start_age (开始年龄)

• end_age (结束年龄)

• key_events (关键事件JSON)

• influential_people (影响人物)

• traumas (心理创伤)

• turning_points (人生转折)

• core_memory (核心记忆)

• description (时期详述)

24. 角色性格表

表名：character_personalities
说明：角色的性格特质
• personality_id

• character_id (外键)

• core_motivation (核心动机)

• deepest_desire (最深渴望)

• greatest_fear (最大恐惧)

• moral_alignment (道德倾向：守序善良/混乱中立等)

• key_values (核心价值观JSON)

• virtues (美德)

• flaws (缺点)

• habits (习惯)

• catchphrases (口头禅)

• character_arc (角色弧光：成长/悲剧/救赎)

• description (性格分析)

25. 角色能力表

表名：character_abilities
说明：角色掌握的能力和技能
• ability_id

• character_id (外键)

• ability_type (能力类型：天赋/学习/觉醒/装备)

• skill_id (关联common_skills)

• proficiency_level (掌握程度：入门/熟练/精通/大师)

• acquired_age (获得年龄)

• acquired_method (获得方式)

• usage_restrictions (使用限制)

• signature_move (是否为招牌能力)

• description (能力详述)

26. 角色装备表

表名：character_equipments
说明：角色拥有的装备物品
• equipment_id

• character_id (外键)

• item_id (关联物品表)

• equipment_type (装备类型：武器/防具/饰品/道具)

• equipped_slot (装备栏位)

• acquired_time (获得时间)

• acquired_method (获得方式)

• current_condition (当前状态：完好/损坏/丢失)

• enhancement_level (强化等级)

• custom_mods (自定义改造)

• emotional_value (情感价值)

• description (装备详述)

27. 角色关系表

表名：character_relationships
说明：角色之间的社交关系
• relationship_id

• world_id (外键)

• character_a_id (角色A)

• character_b_id (角色B)

• relationship_type (关系类型：血缘/爱情/友情/师徒/敌对/同事)

• closeness_level (亲密程度：1-10)

• relationship_dynamics (关系动态：平等/依赖/控制)

• start_time (关系开始时间)

• end_time (关系结束时间)

• key_shared_events (关键共享事件)

• current_status (当前状态：和睦/紧张/破裂)

• description (关系详述)

模块六：势力组织模块

28. 组织主表

表名：organizations
说明：所有势力组织的核心档案
• organization_id

• world_id (外键)

• organization_name (组织名称)

• alternative_names (别名)

• organization_type (组织类型：国家/宗派/家族/公司/秘密结社)

• founding_year (成立年份)

• founder_id (创始人，关联characters)

• current_leader_id (现任领袖)

• headquarters_id (总部地点)

• primary_region_id (主要活动区域)

• size_scale (规模：小型/中型/大型/跨国)

• member_count (成员数量)

• influence_level (影响力等级：地方/国家/世界)

• ideology (核心理念)

• symbol (组织标志)

• status (状态：活跃/衰落/解散/潜伏)

• description (组织概述)

29. 组织架构表

表名：organization_structures
说明：组织的内部结构
• structure_id

• organization_id (外键)

• hierarchy_level (层级：顶层/中层/基层)

• department_name (部门名称)

• parent_department_id (上级部门)

• function_description (职能描述)

• typical_positions (典型职位JSON)

• recruitment_criteria (招募标准)

• promotion_path (晋升路径)

• disciplinary_rules (纪律规定)

• description (部门详述)

30. 组织成员表

表名：organization_members
说明：组织成员及其职位
• membership_id

• organization_id (外键)

• character_id (外键，关联角色)

• join_date (加入日期)

• leave_date (离开日期)

• position_title (职位名称)

• rank_level (职级)

• responsibilities (职责)

• privileges (特权)

• loyalty_level (忠诚度)

• membership_status (成员状态：正式/实习/荣誉/叛逃)

• description (成员履历)

31. 组织目标表

表名：organization_objectives
说明：组织的目标和计划
• objective_id

• organization_id (外键)

• objective_type (目标类型：短期/中期/长期/秘密)

• priority_level (优先级：1-10)

• objective_statement (目标陈述)

• key_strategies (关键策略)

• required_resources (所需资源)

• timeline (时间线)

• success_criteria (成功标准)

• potential_obstacles (潜在障碍)

• current_progress (当前进度)

• description (目标详述)

32. 组织关系表

表名：organization_relations
说明：组织之间的关系
• relation_id

• world_id (外键)

• organization_a_id (组织A)

• organization_b_id (组织B)

• relation_type (关系类型：盟友/敌对/竞争/附庸/贸易伙伴)

• relation_strength (关系强度：1-10)

• historical_context (历史背景)

• current_interactions (当前互动)

• future_outlook (未来展望)

• description (关系详述)

33. 组织资源表

表名：organization_resources
说明：组织拥有的资源
• resource_id

• organization_id (外键)

• resource_type (资源类型：财力/人力/物资/情报/技术)

• quantity (数量/规模)

• quality (质量评估)

• location_ids (存储位置)

• guarding_level (守卫等级)

• acquisition_method (获取方式)

• utilization_rate (利用率)

• description (资源详述)

模块七：地点场景模块

34. 地点主表

表名：locations
说明：所有地点的核心档案
• location_id

• world_id (外键)

• location_name (地点名称)

• location_type (地点类型：城市/村庄/山脉/森林/建筑/遗迹)

• parent_location_id (所属上级地点)

• region_id (所属区域)

• geographical_coordinates (地理坐标JSON)

• altitude (海拔)

• climate_zone (气候带)

• average_temperature (平均温度)

• precipitation_level (降水量)

• natural_hazards (自然灾害)

• strategic_position (战略位置重要性)

• accessibility (可达性：容易/困难/秘密)

• defensive_features (防御特征)

• description (地点概述)

• historical_significance (历史意义)

35. 建筑结构表

表名：building_structures
说明：具体建筑的内部结构
• building_id

• location_id (外键，所在地点)

• building_name (建筑名称)

• building_type (建筑类型：宫殿/民居/商铺/工坊/神庙)

• architectural_style (建筑风格)

• construction_year (建造年份)

• builder_id (建造者)

• floors_count (楼层数)

• total_area (总面积)

• room_layout (房间布局JSON)

• defensive_features (防御设施)

• hidden_spaces (隐藏空间)

• current_condition (当前状况：完好/废弃/翻修中)

• owner_id (当前拥有者)

• description (建筑详述)

36. 区域特征表

表名：location_features
说明：地点的具体特征
• feature_id

• location_id (外键)

• feature_type (特征类型：地貌/植被/水体/矿产/特殊能量)

• feature_name (特征名称)

• scale_size (规模大小)

• unique_properties (独特属性)

• ecological_role (生态作用)

• resource_value (资源价值)

• danger_level (危险等级)

• discovery_history (发现历史)

• description (特征详述)

37. 地点居民表

表名：location_inhabitants
说明：地点的居民构成
• inhabitant_id

• location_id (外键)

• population_group (人群类型：常住居民/流动人口/统治者/守卫)

• race_id (主要种族)

• population_count (人口数量)

• population_density (人口密度)

• social_structure (社会结构)

• governing_body (管理机构)

• living_conditions (生活条件)

• economic_activities (经济活动)

• cultural_practices (文化习俗)

• description (居民详述)

38. 特殊地点表

表名：special_locations
说明：具有特殊规则的地点
• special_id

• location_id (外键)

• special_type (特殊类型：秘境/遗迹/异空间/概念领域/时间异常区)

• access_conditions (进入条件)

• internal_rules (内部规则)

• time_flow (时间流速)

• spatial_anomalies (空间异常)

• treasures (存在的宝藏)

• dangers (存在的危险)

• origin_story (起源故事)

• description (特殊地点详述)

模块八：物品与资源模块

39. 物品主表

表名：items
说明：所有物品的核心档案
• item_id

• world_id (外键)

• item_name (物品名称)

• item_type (物品类型：武器/防具/工具/材料/消耗品/艺术品)

• rarity_level (稀有度：普通/罕见/稀有/史诗/传说)

• creation_method (制作方式：天然/手工/魔法/科技)

• creator_id (创造者)

• creation_date (创造日期)

• material_composition (材料组成JSON)

• physical_properties (物理属性：重量/尺寸/硬度)

• durability (耐久度)

• decay_rate (衰变率)

• value_estimation (价值估算)

• current_owner_id (当前拥有者)

• current_location_id (当前位置)

• description (物品描述)

• historical_provenance (历史流传)

40. 装备属性表

表名：equipment_attributes
说明：装备的具体属性
• attribute_id

• item_id (外键)

• attribute_type (属性类型：攻击力/防御力/特效/加成)

• base_value (基础值)

• enhancement_bonus (强化加成)

• enchantment_effects (附魔效果JSON)

• usage_requirements (使用要求：等级/属性/技能)

• energy_cost (能量消耗)

• cooldown_time (冷却时间)

• degradation_rate (损耗率)

• maintenance_needs (维护需求)

• description (属性详述)

41. 消耗品效果表

表名：consumable_effects
说明：消耗品的使用效果
• effect_id

• item_id (外键)

• effect_type (效果类型：治疗/增益/减益/变形/召唤)

• potency_level (效力等级)

• duration (持续时间)

• application_method (使用方式：口服/注射/涂抹/吸入)

• side_effects (副作用)

• addiction_risk (成瘾风险)

• tolerance_build (耐受性积累)

• counteragents (解药/中和剂)

• synthesis_recipe (合成配方JSON)

• description (效果详述)

42. 材料资源表

表名：material_resources
说明：基础材料资源
• material_id

• world_id (外键)

• material_name (材料名称)

• material_type (材料类型：金属/木材/石材/草药/矿石/能量结晶)

• natural_abundance (自然丰度)

• primary_locations (主要产地ID列表)

• harvesting_method (采集方法)

• processing_techniques (加工技术)

• quality_grades (品质等级)

• key_properties (关键特性)

• common_uses (常见用途)

• substitute_materials (替代材料)

• market_value (市场价值)

• strategic_importance (战略重要性)

• description (材料详述)

43. 物品制作配方表

表名：item_recipes
说明：物品的制作配方
• recipe_id

• world_id (外键)

• result_item_id (成品物品)

• recipe_name (配方名称)

• recipe_type (配方类型：锻造/炼金/附魔/烹饪/合成)

• required_skill (所需技能)

• skill_level_requirement (技能等级要求)

• required_tools (所需工具列表)

• required_materials (所需材料及数量JSON)

• production_time (制作时间)

• success_rate (成功率)

• failure_consequences (失败后果)

• recipe_source (配方来源：发现/购买/传授/研发)

• description (配方详述)

模块九：生物图鉴模块

44. 种族主表

表名：races
说明：智慧种族定义
• race_id

• world_id (外键)

• race_name (种族名称)

• classification_type (分类：类人/兽人/精灵/龙族/机械/元素)

• origin_story (起源故事)

• average_lifespan (平均寿命)

• maturity_age (成年年龄)

• reproductive_method (繁殖方式)

• social_structure (社会结构)

• technological_level (科技水平)

• magical_affinity (魔法亲和)

• primary_locations (主要分布区域)

• population_estimate (人口估算)

• physical_description (外貌特征)

• unique_physiology (独特生理)

• natural_abilities (天生能力)

• weaknesses (种族弱点)

• typical_culture (典型文化)

• description (种族详述)

45. 生物种类表

表名：creature_species
说明：非智慧生物种类
• species_id

• world_id (外键)

• species_name (物种名称)

• classification_kingdom (生物界：动物/植物/真菌/元素/亡灵)

• diet_type (食性：肉食/草食/杂食/能量吸收)

• habitat_preference (栖息地偏好)

• threat_level (威胁等级：无害/危险/致命/天灾)

• average_size (平均体型)

• intelligence_level (智力水平)

• social_behavior (社会行为)

• hunting_methods (狩猎方式)

• defensive_mechanisms (防御机制)

• special_abilities (特殊能力)

• natural_predators (天敌)

• reproduction_rate (繁殖速度)

• ecological_role (生态角色)

• description (物种详述)

46. 变异/亚种表

表名：creature_variants
说明：种族的变异和亚种
• variant_id

• race_id或species_id (外键)

• variant_name (变种名称)

• mutation_cause (变异原因：环境/魔法/实验/杂交)

• distinct_features (显著特征)

• enhanced_abilities (增强能力)

• additional_weaknesses (新增弱点)

• viability_status (生存状态：稳定/濒危/灭绝)

• discovery_history (发现历史)

• description (变种详述)

47. 生物能力表

表名：creature_abilities
说明：生物的特殊能力
• ability_id

• creature_type (关联类型：race/species/variant)

• creature_id (关联ID)

• ability_name (能力名称)

• activation_condition (触发条件)

• energy_cost (能量消耗)

• effect_description (效果描述)

• cooldown_period (冷却时间)

• inheritance_pattern (遗传模式：显性/隐性/随机)

• description (能力详述)

模块十：关系网络模块

48. 事件时间线表

表名：timeline_events
说明：按时间顺序排列的事件
• timeline_id

• world_id (外键)

• event_type (事件类型：历史/个人/组织/自然)

• referenced_event_id (关联的事件ID)

• referenced_character_id (关联的角色ID)

• referenced_organization_id (关联的组织ID)

• event_time (事件时间点)

• event_title (事件标题)

• brief_description (简要描述)

• importance_rating (重要性评级)

• description (详述)

49. 因果关联表

表名：causal_relationships
说明：事件之间的因果关系
• causal_id

• world_id (外键)

• cause_event_id (原因事件)

• effect_event_id (结果事件)

• causal_strength (因果强度：弱/中/强)

• causal_mechanism (作用机制)

• time_lag (时间延迟)

• evidence_level (证据等级)

• description (因果详述)

50. 物品流转表

表名：item_movements
说明：重要物品的所有权流转
• movement_id

• world_id (外键)

• item_id (外键)

• previous_owner_id (前拥有者)

• new_owner_id (新拥有者)

• transfer_time (转移时间)

• transfer_method (转移方式：赠与/买卖/抢夺/继承)

• transfer_location_id (转移地点)

• witnesses (见证者列表)

• description (流转详述)

模块十一：数据关联系统

51. 标签系统表

表名：world_tags
说明：用于分类检索的标签系统
• tag_id

• world_id (外键)

• tag_name (标签名称)

• tag_category (标签分类：类型/属性/主题/风格/元素)

• tag_color (显示颜色)

• usage_count (使用次数)

• description (标签说明)

52. 实体标签关联表

表名：entity_tags
说明：实体与标签的多对多关联
• association_id

• tag_id (外键)

• entity_type (实体类型：world/character/organization/location/item)

• entity_id (实体ID)

• association_strength (关联强度：1-10)

• applied_by (添加者)

• applied_time (添加时间)

53. 跨模块关联表

表名：cross_module_links
说明：记录任意两个实体间的关系
• link_id

• world_id (外键)

• source_type (源实体类型)

• source_id (源实体ID)

• target_type (目标实体类型)

• target_id (目标实体ID)

• relationship_type (关系类型：使用/属于/创造/影响/对抗)

• relationship_description (关系描述)

• relationship_strength (关系强度)

• evidence_sources (证据来源)

54. 数据版本表

表名：data_versions
说明：支持版本管理和分支设定
• version_id

• world_id (外键)

• version_number (版本号，如2.1.0)

• branch_name (分支名称：主线/分支A)

• parent_version_id (父版本ID)

• change_summary (变更摘要)

• change_details (变更详情JSON)

• created_by (创建者)

• created_time (创建时间)

• is_current (是否为当前版本)

55. 文件附件表

表名：world_attachments
说明：存储相关文件
• file_id

• world_id (外键)

• file_name (文件名称)

• file_type (文件类型：地图/肖像/概念图/音频)

• file_path (存储路径)

• file_size (文件大小)

• uploaded_by (上传者)

• upload_time (上传时间)

• description (文件描述)

• linked_entities (关联的实体JSON)

全局关联关系总结

核心关联路径

1. 所有实体 → worlds.world_id (世界观隔离)
2. 角色相关：
   • characters → regions (出生地/当前位置)

   • characters → races (种族)

   • character_abilities → common_skills (能力关联)

   • character_equipments → items (装备物品)

   
3. 组织相关：
   • organizations → characters (领袖/成员)

   • organizations → locations (总部/据点)

   • organization_members (多对多关联表)

   
4. 地点相关：
   • locations → regions (地理层级)

   • building_structures → locations (建筑从属)

   • location_inhabitants → characters/locations (居民关系)

   
5. 物品相关：
   • items → characters (创造者/拥有者)

   • items → locations (当前位置)

   • equipment_attributes → items (装备属性)

   • item_recipes → items (制作配方)

6. 历史关系：
   • historical_events → historical_eras (时间层级)

   • historical_figures → characters (历史人物关联)

   • event_participants (多对多关联)

7. 生物关系：
   • creatures → races/species (生物分类)

   • creature_variants → races/species (变异关联)

检索优化设计

1. 常用联合索引：
   • (world_id, character_type, importance_level) - 角色筛选

   • (world_id, organization_type, influence_level) - 组织筛选

   • (world_id, location_type, region_id) - 地点检索

   • (world_id, item_type, rarity_level) - 物品筛选

2. JSON字段检索：为常用JSON路径创建生成列索引

3. 全文检索：为description等长文本字段添加全文索引

数据一致性保证

1. 外键约束：所有关联字段都设置外键约束
2. 级联策略：
   • 世界观删除 → 所有相关数据级联删除

   • 角色删除 → 关联关系设为NULL

   • 物品删除 → 装备记录保留但标记为“已销毁”

3. 事务处理：复杂的关联操作在事务中完成

这个完整的表结构体系为AI小说编辑器提供了强大的数据支撑能力，既保证了数据的结构化存储，又通过灵活的关联设计支持复杂的创作需求。
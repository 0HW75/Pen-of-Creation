"""
提示词模板管理器
管理AI生成设定所需的提示词模板
"""
import json
import os
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class PromptTemplate:
    """提示词模板类"""
    
    def __init__(self, template_data: Dict[str, Any]):
        self.id = template_data.get('id')
        self.entity_type = template_data.get('entity_type', '')
        self.template_name = template_data.get('template_name', '')
        self.prompt_template = template_data.get('prompt_template', '')
        self.variables = template_data.get('variables', [])
        self.strategy = template_data.get('strategy', 'detailed')
        self.version = template_data.get('version', 1)
        self.is_default = template_data.get('is_default', False)
        self.description = template_data.get('description', '')
        self.created_at = template_data.get('created_at', datetime.utcnow())
        self.updated_at = template_data.get('updated_at', datetime.utcnow())
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'entity_type': self.entity_type,
            'template_name': self.template_name,
            'prompt_template': self.prompt_template,
            'variables': self.variables,
            'strategy': self.strategy,
            'version': self.version,
            'is_default': self.is_default,
            'description': self.description,
            'created_at': self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at,
            'updated_at': self.updated_at.isoformat() if isinstance(self.updated_at, datetime) else self.updated_at
        }
    
    def render(self, variables: Dict[str, Any]) -> str:
        """渲染模板，替换变量"""
        result = self.prompt_template
        for key, value in variables.items():
            placeholder = f"{{{key}}}"
            if placeholder in result:
                result = result.replace(placeholder, str(value))
        return result


class PromptTemplateManager:
    """提示词模板管理器"""
    
    def __init__(self, templates_dir: Optional[str] = None):
        """
        初始化模板管理器
        
        Args:
            templates_dir: 模板文件存放目录，默认为模块下的templates目录
        """
        if templates_dir is None:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            self.templates_dir = os.path.join(current_dir, 'templates')
        else:
            self.templates_dir = templates_dir
        
        self._templates: Dict[str, List[PromptTemplate]] = {}
        self._load_default_templates()
    
    def _load_default_templates(self):
        """加载默认模板"""
        # 如果模板目录不存在，创建它
        if not os.path.exists(self.templates_dir):
            os.makedirs(self.templates_dir)
            logger.info(f"创建模板目录: {self.templates_dir}")
        
        # 加载目录中的所有JSON模板文件
        if os.path.exists(self.templates_dir):
            for filename in os.listdir(self.templates_dir):
                if filename.endswith('.json'):
                    filepath = os.path.join(self.templates_dir, filename)
                    try:
                        with open(filepath, 'r', encoding='utf-8') as f:
                            template_data = json.load(f)
                            if isinstance(template_data, list):
                                for data in template_data:
                                    self._add_template(PromptTemplate(data))
                            else:
                                self._add_template(PromptTemplate(template_data))
                        logger.info(f"加载模板文件: {filename}")
                    except Exception as e:
                        logger.error(f"加载模板文件失败 {filename}: {e}")
        
        # 如果没有加载到任何模板，初始化默认模板
        if not self._templates:
            self._init_default_templates()
    
    def _add_template(self, template: PromptTemplate):
        """添加模板到内存"""
        entity_type = template.entity_type
        if entity_type not in self._templates:
            self._templates[entity_type] = []
        self._templates[entity_type].append(template)
    
    def _init_default_templates(self):
        """初始化默认模板"""
        default_templates = self._get_default_templates()
        for template_data in default_templates:
            self._add_template(PromptTemplate(template_data))
        logger.info("初始化默认模板完成")
    
    def _get_default_templates(self) -> List[Dict[str, Any]]:
        """获取默认模板列表"""
        return [
            {
                'entity_type': 'character',
                'template_name': 'simple_character',
                'strategy': 'simple',
                'description': '简单角色生成模板',
                'variables': ['world_info', 'prompt', 'style'],
                'prompt_template': """基于以下世界观信息，创建一个简单的角色设定：

世界观信息：
{world_info}

用户要求：
{prompt}

风格要求：
{style}

请生成一个角色，包含以下字段（以JSON格式返回）：
{{
    "name": "角色姓名",
    "race": "种族",
    "gender": "性别",
    "age": "年龄",
    "description": "角色简介",
    "appearance": "外貌描述",
    "personality": "性格特征",
    "background": "背景故事"
}}""",
                'version': 1,
                'is_default': True
            },
            {
                'entity_type': 'character',
                'template_name': 'detailed_character',
                'strategy': 'detailed',
                'description': '详细角色生成模板',
                'variables': ['world_info', 'prompt', 'style', 'related_entities'],
                'prompt_template': """基于以下世界观信息，创建一个详细的角色设定：

世界观信息：
{world_info}

用户要求：
{prompt}

风格要求：
{style}

相关实体信息：
{related_entities}

请生成一个完整的角色设定，包含以下字段（以JSON格式返回）：
{{
    "name": "角色姓名",
    "race": "种族",
    "gender": "性别",
    "age": 25,
    "description": "角色简介",
    "appearance": "外貌描述",
    "appearance_age": 25,
    "distinguishing_features": "显著特征",
    "personality": "性格特征",
    "background": "背景故事",
    "character_arc": "角色弧线",
    "motivation": "动机",
    "secrets": "秘密",
    "birthplace": "出生地",
    "nationality": "国籍",
    "occupation": "职业",
    "faction": "所属势力",
    "current_location": "当前位置",
    "core_traits": "核心特质",
    "psychological_fear": "心理恐惧",
    "values": "价值观",
    "growth_experience": "成长经历",
    "important_turning_points": "重要转折点",
    "psychological_trauma": "心理创伤",
    "physical_abilities": "身体能力",
    "intelligence_perception": "智力与感知",
    "special_talents": "特殊天赋",
    "current_level": "当前等级",
    "special_abilities": "特殊能力",
    "ability_levels": "能力等级",
    "ability_limits": "能力限制",
    "growth_path": "成长路径",
    "common_equipment": "常用装备",
    "special_items": "特殊物品",
    "personal_items": "个人物品",
    "key_items": "关键物品",
    "family_members": "家庭成员",
    "family_background": "家庭背景",
    "close_friends": "挚友",
    "mentor_student": "师徒关系",
    "colleagues": "同事",
    "grudges": "仇敌",
    "love_relationships": "恋爱关系",
    "complex_emotions": "复杂情感",
    "unrequited_love": "单恋",
    "emotional_changes": "情感变化"
}}""",
                'version': 1,
                'is_default': True
            },
            {
                'entity_type': 'location',
                'template_name': 'simple_location',
                'strategy': 'simple',
                'description': '简单地点生成模板',
                'variables': ['world_info', 'prompt', 'style'],
                'prompt_template': """基于以下世界观信息，创建一个简单的地点设定：

世界观信息：
{world_info}

用户要求：
{prompt}

风格要求：
{style}

请生成一个地点，包含以下字段（以JSON格式返回）：
{{
    "name": "地点名称",
    "location_type": "地点类型",
    "description": "地点描述",
    "region": "所属区域",
    "geographical_location": "地理位置"
}}""",
                'version': 1,
                'is_default': True
            },
            {
                'entity_type': 'location',
                'template_name': 'detailed_location',
                'strategy': 'detailed',
                'description': '详细地点生成模板',
                'variables': ['world_info', 'prompt', 'style', 'related_entities'],
                'prompt_template': """基于以下世界观信息，创建一个详细的地点设定：

世界观信息：
{world_info}

用户要求：
{prompt}

风格要求：
{style}

相关实体信息：
{related_entities}

请生成一个完整的地点设定，包含以下字段（以JSON格式返回）：
{{
    "name": "地点名称",
    "location_type": "地点类型",
    "description": "地点描述",
    "region": "所属区域",
    "geographical_location": "地理位置",
    "terrain": "地形特征",
    "climate": "气候条件",
    "special_environment": "特殊环境",
    "controlling_faction": "控制势力",
    "population_composition": "人口构成",
    "economic_status": "经济状况",
    "cultural_features": "文化特色",
    "overall_layout": "整体布局",
    "functional_areas": "功能分区",
    "key_buildings": "重要建筑",
    "secret_areas": "秘密区域",
    "defense_facilities": "防御设施",
    "guard_force": "守卫力量",
    "defense_weaknesses": "防御弱点",
    "emergency_plans": "应急预案",
    "main_resources": "主要资源",
    "potential_dangers": "潜在危险",
    "access_restrictions": "进入限制",
    "survival_conditions": "生存条件",
    "importance": 5
}}""",
                'version': 1,
                'is_default': True
            },
            {
                'entity_type': 'item',
                'template_name': 'simple_item',
                'strategy': 'simple',
                'description': '简单物品生成模板',
                'variables': ['world_info', 'prompt', 'style'],
                'prompt_template': """基于以下世界观信息，创建一个简单的物品设定：

世界观信息：
{world_info}

用户要求：
{prompt}

风格要求：
{style}

请生成一个物品，包含以下字段（以JSON格式返回）：
{{
    "name": "物品名称",
    "item_type": "物品类型",
    "rarity_level": "稀有度",
    "description": "物品描述",
    "physical_properties": "物理属性"
}}""",
                'version': 1,
                'is_default': True
            },
            {
                'entity_type': 'item',
                'template_name': 'detailed_item',
                'strategy': 'detailed',
                'description': '详细物品生成模板',
                'variables': ['world_info', 'prompt', 'style', 'related_entities'],
                'prompt_template': """基于以下世界观信息，创建一个详细的物品设定：

世界观信息：
{world_info}

用户要求：
{prompt}

风格要求：
{style}

相关实体信息：
{related_entities}

请生成一个完整的物品设定，包含以下字段（以JSON格式返回）：
{{
    "name": "物品名称",
    "item_type": "物品类型",
    "rarity_level": "稀有度",
    "description": "物品描述",
    "physical_properties": "物理属性（材质、外观、重量等）",
    "special_effects": "特殊效果",
    "usage_requirements": "使用要求",
    "durability": 100,
    "creator": "制造者",
    "source": "来源",
    "historical_heritage": "历史传承",
    "current_owner": "当前拥有者",
    "acquisition_method": "获取方式",
    "importance": 5
}}""",
                'version': 1,
                'is_default': True
            },
            {
                'entity_type': 'faction',
                'template_name': 'simple_faction',
                'strategy': 'simple',
                'description': '简单势力生成模板',
                'variables': ['world_info', 'prompt', 'style'],
                'prompt_template': """基于以下世界观信息，创建一个简单的势力设定：

世界观信息：
{world_info}

用户要求：
{prompt}

风格要求：
{style}

请生成一个势力，包含以下字段（以JSON格式返回）：
{{
    "name": "势力名称",
    "faction_type": "势力类型",
    "description": "势力描述",
    "core_ideology": "核心理念",
    "leader": "领导者"
}}""",
                'version': 1,
                'is_default': True
            },
            {
                'entity_type': 'faction',
                'template_name': 'detailed_faction',
                'strategy': 'detailed',
                'description': '详细势力生成模板',
                'variables': ['world_info', 'prompt', 'style', 'related_entities'],
                'prompt_template': """基于以下世界观信息，创建一个详细的势力设定：

世界观信息：
{world_info}

用户要求：
{prompt}

风格要求：
{style}

相关实体信息：
{related_entities}

请生成一个完整的势力设定，包含以下字段（以JSON格式返回）：
{{
    "name": "势力名称",
    "faction_type": "势力类型",
    "faction_status": "势力状态",
    "description": "势力描述",
    "core_ideology": "核心理念",
    "sphere_of_influence": "势力范围",
    "influence_level": "影响等级",
    "establishment_time": "建立时间",
    "member_size": "成员规模",
    "headquarters_location": "总部位置",
    "economic_strength": "经济实力",
    "leadership_system": "领导体制",
    "hierarchy": "等级制度",
    "department_setup": "部门设置",
    "decision_mechanism": "决策机制",
    "leader": "领导者",
    "key_members": "核心成员",
    "talent_reserve": "人才储备",
    "defectors": "叛逃者",
    "recruitment_method": "招募方式",
    "training_system": "培训体系",
    "disciplinary_rules": "纪律规则",
    "promotion_path": "晋升路径",
    "special_abilities": "特殊能力",
    "heritage_system": "传承体系",
    "resource_reserves": "资源储备",
    "intelligence_network": "情报网络",
    "short_term_goals": "短期目标",
    "medium_term_plans": "中期计划",
    "long_term_vision": "长期愿景",
    "secret_plans": "秘密计划",
    "ally_relationships": "盟友关系",
    "enemy_relationships": "敌对关系",
    "subordinate_relationships": "从属关系",
    "neutral_relationships": "中立关系",
    "importance": 5
}}""",
                'version': 1,
                'is_default': True
            },
            {
                'entity_type': 'energy_system',
                'template_name': 'simple_energy_system',
                'strategy': 'simple',
                'description': '简单能量体系生成模板',
                'variables': ['world_info', 'prompt', 'style'],
                'prompt_template': """基于以下世界观信息，创建一个简单的能量体系设定：

世界观信息：
{world_info}

用户要求：
{prompt}

风格要求：
{style}

请生成一个能量体系，包含以下字段（以JSON格式返回）：
{{
    "name": "能量体系名称",
    "energy_type": "能量类型（魔法/斗气/灵气/科技/混合）",
    "description": "能量体系描述",
    "source": "能量来源",
    "acquisition_method": "获取方式"
}}""",
                'version': 1,
                'is_default': True
            },
            {
                'entity_type': 'energy_system',
                'template_name': 'detailed_energy_system',
                'strategy': 'detailed',
                'description': '详细能量体系生成模板',
                'variables': ['world_info', 'prompt', 'style', 'related_entities'],
                'prompt_template': """基于以下世界观信息，创建一个详细的能量体系设定：

世界观信息：
{world_info}

用户要求：
{prompt}

风格要求：
{style}

相关实体信息：
{related_entities}

请生成一个完整的能量体系设定，包含以下字段（以JSON格式返回）：
{{
    "name": "能量体系名称",
    "energy_type": "能量类型（魔法/斗气/灵气/科技/混合）",
    "description": "能量体系描述",
    "source": "能量来源",
    "acquisition_method": "获取方式",
    "storage_method": "储存方式",
    "usage_limitations": "使用限制",
    "common_applications": "常见应用",
    "rarity": "稀有度（常见/稀有/传说）",
    "stability": "稳定性（稳定/不稳定/波动）",
    "interaction_with_other_energies": "与其他能量交互",
    "cultivation_method": "修炼方法",
    "typical_manifestations": "典型表现形式"
}}""",
                'version': 1,
                'is_default': True
            },
            {
                'entity_type': 'civilization',
                'template_name': 'simple_civilization',
                'strategy': 'simple',
                'description': '简单文明生成模板',
                'variables': ['world_info', 'prompt', 'style'],
                'prompt_template': """基于以下世界观信息，创建一个简单的文明设定：

世界观信息：
{world_info}

用户要求：
{prompt}

风格要求：
{style}

请生成一个文明，包含以下字段（以JSON格式返回）：
{{
    "name": "文明名称",
    "civilization_type": "文明类型（魔法文明/科技文明/修真文明/混合文明）",
    "description": "文明描述",
    "development_level": "发展阶段（原始/古代/中世纪/近代/现代/未来）",
    "population_scale": "人口规模"
}}""",
                'version': 1,
                'is_default': True
            },
            {
                'entity_type': 'civilization',
                'template_name': 'detailed_civilization',
                'strategy': 'detailed',
                'description': '详细文明生成模板',
                'variables': ['world_info', 'prompt', 'style', 'related_entities'],
                'prompt_template': """基于以下世界观信息，创建一个详细的文明设定：

世界观信息：
{world_info}

用户要求：
{prompt}

风格要求：
{style}

相关实体信息：
{related_entities}

请生成一个完整的文明设定，包含以下字段（以JSON格式返回）：
{{
    "name": "文明名称",
    "civilization_type": "文明类型（魔法文明/科技文明/修真文明/混合文明）",
    "description": "文明描述",
    "development_level": "发展阶段（原始/古代/中世纪/近代/现代/未来）",
    "population_scale": "人口规模",
    "territory_size": "领土范围",
    "political_system": "政治体制",
    "economic_system": "经济体制",
    "technological_level": "科技水平",
    "magical_level": "魔法水平",
    "cultural_characteristics": "文化特征",
    "religious_beliefs": "宗教信仰",
    "taboos": "禁忌",
    "values": "价值观",
    "historical_origin": "历史起源"
}}""",
                'version': 1,
                'is_default': True
            },
            {
                'entity_type': 'historical_event',
                'template_name': 'simple_historical_event',
                'strategy': 'simple',
                'description': '简单历史事件生成模板',
                'variables': ['world_info', 'prompt', 'style'],
                'prompt_template': """基于以下世界观信息，创建一个简单的历史事件设定：

世界观信息：
{world_info}

用户要求：
{prompt}

风格要求：
{style}

请生成一个历史事件，包含以下字段（以JSON格式返回）：
{{
    "name": "事件名称",
    "event_type": "事件类型（战争/灾难/发现/发明/条约/革命）",
    "description": "事件描述",
    "start_year": "开始年份",
    "end_year": "结束年份"
}}""",
                'version': 1,
                'is_default': True
            },
            {
                'entity_type': 'historical_event',
                'template_name': 'detailed_historical_event',
                'strategy': 'detailed',
                'description': '详细历史事件生成模板',
                'variables': ['world_info', 'prompt', 'style', 'related_entities'],
                'prompt_template': """基于以下世界观信息，创建一个详细的历史事件设定：

世界观信息：
{world_info}

用户要求：
{prompt}

风格要求：
{style}

相关实体信息：
{related_entities}

请生成一个完整的历史事件设定，包含以下字段（以JSON格式返回）：
{{
    "name": "事件名称",
    "event_type": "事件类型（战争/灾难/发现/发明/条约/革命）",
    "description": "事件描述",
    "start_year": "开始年份",
    "end_year": "结束年份",
    "primary_causes": "主要原因",
    "key_participants": "主要参与者",
    "event_sequence": "事件过程",
    "immediate_outcomes": "直接结果",
    "long_term_consequences": "长期影响",
    "historical_significance": "历史意义",
    "importance_level": 5
}}""",
                'version': 1,
                'is_default': True
            },
            {
                'entity_type': 'region',
                'template_name': 'simple_region',
                'strategy': 'simple',
                'description': '简单区域生成模板',
                'variables': ['world_info', 'prompt', 'style'],
                'prompt_template': """基于以下世界观信息，创建一个简单的地理区域设定：

世界观信息：
{world_info}

用户要求：
{prompt}

风格要求：
{style}

请生成一个地理区域，包含以下字段（以JSON格式返回）：
{{
    "name": "区域名称",
    "region_type": "区域类型（大陆/国家/省份/城市/区域）",
    "description": "区域描述",
    "climate": "气候",
    "terrain": "地形特征"
}}""",
                'version': 1,
                'is_default': True
            },
            {
                'entity_type': 'region',
                'template_name': 'detailed_region',
                'strategy': 'detailed',
                'description': '详细区域生成模板',
                'variables': ['world_info', 'prompt', 'style', 'related_entities'],
                'prompt_template': """基于以下世界观信息，创建一个详细的地理区域设定：

世界观信息：
{world_info}

用户要求：
{prompt}

风格要求：
{style}

相关实体信息：
{related_entities}

请生成一个完整的地理区域设定，包含以下字段（以JSON格式返回）：
{{
    "name": "区域名称",
    "region_type": "区域类型（大陆/国家/省份/城市/区域）",
    "description": "区域描述",
    "geographical_coordinates": "地理坐标",
    "climate": "气候",
    "terrain": "地形特征",
    "area_size": "面积",
    "population": 10000,
    "resources": "资源分布",
    "strategic_importance": 5,
    "danger_level": "安全/低危/中危/高危/禁地"
}}""",
                'version': 1,
                'is_default': True
            },
            {
                'entity_type': 'dimension',
                'template_name': 'simple_dimension',
                'strategy': 'simple',
                'description': '简单维度生成模板',
                'variables': ['world_info', 'prompt', 'style'],
                'prompt_template': """基于以下世界观信息，创建一个简单的维度/位面设定：

世界观信息：
{world_info}

用户要求：
{prompt}

风格要求：
{style}

请生成一个维度/位面，包含以下字段（以JSON格式返回）：
{{
    "name": "维度名称",
    "dimension_type": "维度类型（主世界/位面/维度/异空间）",
    "description": "维度描述",
    "entry_conditions": "进入条件"
}}""",
                'version': 1,
                'is_default': True
            },
            {
                'entity_type': 'dimension',
                'template_name': 'detailed_dimension',
                'strategy': 'detailed',
                'description': '详细维度生成模板',
                'variables': ['world_info', 'prompt', 'style', 'related_entities'],
                'prompt_template': """基于以下世界观信息，创建一个详细的维度/位面设定：

世界观信息：
{world_info}

用户要求：
{prompt}

风格要求：
{style}

相关实体信息：
{related_entities}

请生成一个完整的维度/位面设定，包含以下字段（以JSON格式返回）：
{{
    "name": "维度名称",
    "dimension_type": "维度类型（主世界/位面/维度/异空间）",
    "description": "维度描述",
    "entry_conditions": "进入条件",
    "physical_properties": "物理特性",
    "time_flow": "时间流速（如1:1表示与主世界相同）",
    "spatial_hierarchy": 1,
    "special_rules": "特殊规则",
    "magic_concentration": "魔法浓度（极低/低/中等/高/极高）",
    "element_activity": "元素活跃度",
    "gravity": "重力（如1.0G）"
}}""",
                'version': 1,
                'is_default': True
            }
        ]
    
    def get_template(self, entity_type: str, strategy: str = 'detailed', 
                     template_name: Optional[str] = None) -> Optional[PromptTemplate]:
        """
        获取模板
        
        Args:
            entity_type: 实体类型
            strategy: 生成策略
            template_name: 模板名称，如果指定则优先使用
        
        Returns:
            匹配的模板，如果没有找到则返回None
        """
        if entity_type not in self._templates:
            logger.warning(f"未找到实体类型 '{entity_type}' 的模板")
            return None
        
        templates = self._templates[entity_type]
        
        # 如果指定了模板名称，优先查找
        if template_name:
            for template in templates:
                if template.template_name == template_name:
                    return template
        
        # 按策略查找
        for template in templates:
            if template.strategy == strategy:
                return template
        
        # 查找默认模板
        for template in templates:
            if template.is_default:
                return template
        
        # 返回第一个模板
        return templates[0] if templates else None
    
    def get_templates_by_entity(self, entity_type: str) -> List[PromptTemplate]:
        """获取指定实体类型的所有模板"""
        return self._templates.get(entity_type, [])
    
    def list_entity_types(self) -> List[str]:
        """列出所有支持的实体类型"""
        return list(self._templates.keys())
    
    def add_template(self, template_data: Dict[str, Any]) -> PromptTemplate:
        """添加新模板"""
        template = PromptTemplate(template_data)
        self._add_template(template)
        logger.info(f"添加模板: {template.entity_type}/{template.template_name}")
        return template
    
    def save_template_to_file(self, entity_type: str, filename: Optional[str] = None):
        """将模板保存到文件"""
        if entity_type not in self._templates:
            logger.warning(f"未找到实体类型 '{entity_type}' 的模板")
            return
        
        if filename is None:
            filename = f"{entity_type}_templates.json"
        
        filepath = os.path.join(self.templates_dir, filename)
        templates_data = [t.to_dict() for t in self._templates[entity_type]]
        
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(templates_data, f, ensure_ascii=False, indent=2)
            logger.info(f"模板已保存到: {filepath}")
        except Exception as e:
            logger.error(f"保存模板失败: {e}")
    
    def save_all_templates(self):
        """保存所有模板到文件"""
        for entity_type in self._templates:
            self.save_template_to_file(entity_type)


# 创建全局模板管理器实例
template_manager = PromptTemplateManager()

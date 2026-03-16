"""
生成策略模块
定义和管理不同的AI生成策略
"""
from enum import Enum
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


class GenerationStrategy(Enum):
    """生成策略枚举"""
    SIMPLE = "simple"          # 简单生成，基础信息
    DETAILED = "detailed"      # 详细生成，完整字段
    BATCH = "batch"            # 批量生成，多个条目
    CREATIVE = "creative"      # 创意生成，强调创新
    CONSERVATIVE = "conservative"  # 保守生成，强调稳定


class GenerationParameters:
    """生成参数类"""
    
    def __init__(self, 
                 temperature: float = 0.7,
                 max_tokens: int = 2000,
                 top_p: float = 0.9,
                 frequency_penalty: float = 0.0,
                 presence_penalty: float = 0.0,
                 **kwargs):
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.top_p = top_p
        self.frequency_penalty = frequency_penalty
        self.presence_penalty = presence_penalty
        self.extra_params = kwargs
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        params = {
            'temperature': self.temperature,
            'max_tokens': self.max_tokens,
            'top_p': self.top_p,
            'frequency_penalty': self.frequency_penalty,
            'presence_penalty': self.presence_penalty
        }
        params.update(self.extra_params)
        return params
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'GenerationParameters':
        """从字典创建"""
        return cls(**data)


class GenerationStrategySelector:
    """生成策略选择器"""
    
    # 策略默认参数配置
    STRATEGY_PARAMS = {
        GenerationStrategy.SIMPLE: {
            'temperature': 0.5,
            'max_tokens': 1000,
            'top_p': 0.9,
            'frequency_penalty': 0.0,
            'presence_penalty': 0.0
        },
        GenerationStrategy.DETAILED: {
            'temperature': 0.7,
            'max_tokens': 3000,
            'top_p': 0.9,
            'frequency_penalty': 0.0,
            'presence_penalty': 0.0
        },
        GenerationStrategy.BATCH: {
            'temperature': 0.6,
            'max_tokens': 4000,
            'top_p': 0.9,
            'frequency_penalty': 0.1,
            'presence_penalty': 0.1
        },
        GenerationStrategy.CREATIVE: {
            'temperature': 0.9,
            'max_tokens': 2500,
            'top_p': 0.95,
            'frequency_penalty': 0.2,
            'presence_penalty': 0.2
        },
        GenerationStrategy.CONSERVATIVE: {
            'temperature': 0.3,
            'max_tokens': 2000,
            'top_p': 0.8,
            'frequency_penalty': 0.0,
            'presence_penalty': 0.0
        }
    }
    
    # 实体类型推荐策略
    ENTITY_STRATEGY_MAPPING = {
        'character': {
            'default': GenerationStrategy.DETAILED,
            'simple_fields': ['name', 'race', 'gender', 'age', 'description'],
            'detailed_fields': [
                'name', 'race', 'gender', 'age', 'description', 'appearance',
                'personality', 'background', 'motivation', 'abilities',
                'relationships', 'secrets', 'character_arc'
            ]
        },
        'location': {
            'default': GenerationStrategy.DETAILED,
            'simple_fields': ['name', 'location_type', 'description', 'region'],
            'detailed_fields': [
                'name', 'location_type', 'description', 'region',
                'geographical_location', 'terrain', 'climate',
                'controlling_faction', 'population_composition',
                'economic_status', 'defense_facilities'
            ]
        },
        'item': {
            'default': GenerationStrategy.DETAILED,
            'simple_fields': ['name', 'item_type', 'rarity_level', 'description'],
            'detailed_fields': [
                'name', 'item_type', 'rarity_level', 'description',
                'physical_properties', 'special_effects',
                'usage_requirements', 'creator', 'historical_heritage'
            ]
        },
        'faction': {
            'default': GenerationStrategy.DETAILED,
            'simple_fields': ['name', 'faction_type', 'description', 'core_ideology'],
            'detailed_fields': [
                'name', 'faction_type', 'description', 'core_ideology',
                'sphere_of_influence', 'leadership_system',
                'hierarchy', 'key_members', 'ally_relationships',
                'enemy_relationships'
            ]
        },
        'energy_system': {
            'default': GenerationStrategy.DETAILED,
            'simple_fields': ['name', 'energy_type', 'description'],
            'detailed_fields': [
                'name', 'energy_type', 'description', 'source',
                'acquisition_method', 'cultivation_method',
                'usage_limitations', 'common_applications'
            ]
        },
        'civilization': {
            'default': GenerationStrategy.DETAILED,
            'simple_fields': ['name', 'civilization_type', 'description'],
            'detailed_fields': [
                'name', 'civilization_type', 'description',
                'development_level', 'political_system',
                'economic_system', 'cultural_characteristics',
                'religious_beliefs', 'taboos', 'values'
            ]
        },
        'historical_event': {
            'default': GenerationStrategy.DETAILED,
            'simple_fields': ['name', 'event_type', 'description'],
            'detailed_fields': [
                'name', 'event_type', 'description', 'start_year',
                'end_year', 'primary_causes', 'key_participants',
                'event_sequence', 'immediate_outcomes',
                'long_term_consequences', 'historical_significance'
            ]
        },
        'region': {
            'default': GenerationStrategy.DETAILED,
            'simple_fields': ['name', 'region_type', 'description'],
            'detailed_fields': [
                'name', 'region_type', 'description', 'climate',
                'terrain', 'area_size', 'population', 'resources',
                'strategic_importance', 'controlling_faction_id'
            ]
        },
        'dimension': {
            'default': GenerationStrategy.DETAILED,
            'simple_fields': ['name', 'dimension_type', 'description'],
            'detailed_fields': [
                'name', 'dimension_type', 'description',
                'entry_conditions', 'physical_properties',
                'time_flow', 'special_rules', 'magic_concentration'
            ]
        }
    }
    
    @classmethod
    def select_strategy(cls, entity_type: str, 
                        strategy_name: Optional[str] = None,
                        user_preferences: Optional[Dict[str, Any]] = None) -> GenerationStrategy:
        """
        选择生成策略
        
        Args:
            entity_type: 实体类型
            strategy_name: 策略名称，如果指定则使用
            user_preferences: 用户偏好设置
        
        Returns:
            选择的生成策略
        """
        # 如果指定了策略名称，直接解析
        if strategy_name:
            try:
                return GenerationStrategy(strategy_name.lower())
            except ValueError:
                logger.warning(f"未知的策略名称: {strategy_name}，使用默认策略")
        
        # 根据实体类型获取默认策略
        if entity_type in cls.ENTITY_STRATEGY_MAPPING:
            return cls.ENTITY_STRATEGY_MAPPING[entity_type]['default']
        
        # 返回通用默认策略
        return GenerationStrategy.DETAILED
    
    @classmethod
    def get_parameters(cls, strategy: GenerationStrategy, 
                       custom_params: Optional[Dict[str, Any]] = None) -> GenerationParameters:
        """
        获取生成参数
        
        Args:
            strategy: 生成策略
            custom_params: 自定义参数，会覆盖默认参数
        
        Returns:
            生成参数对象
        """
        # 获取策略默认参数
        base_params = cls.STRATEGY_PARAMS.get(strategy, cls.STRATEGY_PARAMS[GenerationStrategy.DETAILED]).copy()
        
        # 应用自定义参数
        if custom_params:
            base_params.update(custom_params)
        
        return GenerationParameters(**base_params)
    
    @classmethod
    def get_entity_fields(cls, entity_type: str, strategy: GenerationStrategy) -> list:
        """
        获取实体类型在指定策略下需要生成的字段
        
        Args:
            entity_type: 实体类型
            strategy: 生成策略
        
        Returns:
            字段列表
        """
        if entity_type not in cls.ENTITY_STRATEGY_MAPPING:
            return []
        
        mapping = cls.ENTITY_STRATEGY_MAPPING[entity_type]
        
        if strategy == GenerationStrategy.SIMPLE:
            return mapping.get('simple_fields', [])
        else:
            return mapping.get('detailed_fields', mapping.get('simple_fields', []))
    
    @classmethod
    def get_strategy_description(cls, strategy: GenerationStrategy) -> str:
        """获取策略描述"""
        descriptions = {
            GenerationStrategy.SIMPLE: "简单生成模式，生成基础信息，适合快速创建",
            GenerationStrategy.DETAILED: "详细生成模式，生成完整字段，适合深度设定",
            GenerationStrategy.BATCH: "批量生成模式，一次生成多个条目，适合快速填充",
            GenerationStrategy.CREATIVE: "创意生成模式，强调创新和独特性，适合需要新颖设定的场景",
            GenerationStrategy.CONSERVATIVE: "保守生成模式，强调稳定和一致性，适合需要符合传统设定的场景"
        }
        return descriptions.get(strategy, "未知策略")
    
    @classmethod
    def list_available_strategies(cls) -> list:
        """列出所有可用策略"""
        return [
            {
                'name': strategy.value,
                'description': cls.get_strategy_description(strategy)
            }
            for strategy in GenerationStrategy
        ]


# 创建全局策略选择器实例
strategy_selector = GenerationStrategySelector()

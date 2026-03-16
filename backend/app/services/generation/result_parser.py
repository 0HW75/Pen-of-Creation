"""
结果解析器
解析AI生成的结果，提取结构化数据
"""
import json
import re
from typing import Dict, Any, Optional, List
import logging

logger = logging.getLogger(__name__)


class ResultParser:
    """结果解析器"""
    
    def __init__(self):
        pass
    
    def parse(self, raw_result: str, entity_type: str) -> Dict[str, Any]:
        """
        解析AI生成的原始结果
        
        Args:
            raw_result: AI返回的原始文本
            entity_type: 实体类型
        
        Returns:
            解析后的结构化数据
        """
        # 尝试提取JSON
        json_data = self._extract_json(raw_result)
        
        if json_data:
            # 验证和清理数据
            cleaned_data = self._clean_and_validate(json_data, entity_type)
            return {
                'success': True,
                'data': cleaned_data,
                'raw': raw_result
            }
        else:
            # 尝试从文本中提取关键信息
            extracted_data = self._extract_from_text(raw_result, entity_type)
            return {
                'success': True,
                'data': extracted_data,
                'raw': raw_result,
                'note': '从文本中提取，可能不完整'
            }
    
    def _extract_json(self, text: str) -> Optional[Dict[str, Any]]:
        """从文本中提取JSON"""
        # 尝试找到JSON代码块
        json_pattern = r'```(?:json)?\s*([\s\S]*?)```'
        matches = re.findall(json_pattern, text)
        
        for match in matches:
            try:
                return json.loads(match.strip())
            except json.JSONDecodeError:
                continue
        
        # 尝试直接解析整个文本
        try:
            return json.loads(text.strip())
        except json.JSONDecodeError:
            pass
        
        # 尝试找到JSON对象
        # 匹配最外层的大括号
        brace_count = 0
        start_idx = -1
        for i, char in enumerate(text):
            if char == '{':
                if brace_count == 0:
                    start_idx = i
                brace_count += 1
            elif char == '}':
                brace_count -= 1
                if brace_count == 0 and start_idx != -1:
                    try:
                        json_str = text[start_idx:i+1]
                        return json.loads(json_str)
                    except json.JSONDecodeError:
                        continue
        
        return None
    
    def _clean_and_validate(self, data: Dict[str, Any], entity_type: str) -> Dict[str, Any]:
        """清理和验证数据"""
        cleaned = {}
        
        # 获取该实体类型的有效字段
        valid_fields = self._get_valid_fields(entity_type)
        
        for key, value in data.items():
            # 跳过None值
            if value is None:
                continue
            
            # 转换值为字符串
            if isinstance(value, (list, dict)):
                cleaned[key] = json.dumps(value, ensure_ascii=False)
            else:
                cleaned[key] = str(value)
        
        return cleaned
    
    def _extract_from_text(self, text: str, entity_type: str) -> Dict[str, Any]:
        """从纯文本中提取关键信息"""
        data = {}
        
        # 获取该实体类型的有效字段
        valid_fields = self._get_valid_fields(entity_type)
        
        # 尝试提取名称（通常在开头）
        name_match = re.search(r'[名称|姓名|名字][:：]\s*(.+?)(?:\n|$)', text)
        if name_match:
            data['name'] = name_match.group(1).strip()
        
        # 尝试提取描述
        desc_match = re.search(r'[描述|简介|介绍][:：]\s*(.+?)(?:\n\n|\n[A-Z]|$)', text, re.DOTALL)
        if desc_match:
            data['description'] = desc_match.group(1).strip()
        
        # 根据实体类型提取特定字段
        if entity_type == 'character':
            self._extract_character_fields(text, data)
        elif entity_type == 'location':
            self._extract_location_fields(text, data)
        elif entity_type == 'item':
            self._extract_item_fields(text, data)
        elif entity_type == 'faction':
            self._extract_faction_fields(text, data)
        
        return data
    
    def _extract_character_fields(self, text: str, data: Dict[str, Any]):
        """提取角色特定字段"""
        # 种族
        race_match = re.search(r'[种族|种族类型][:：]\s*(.+?)(?:\n|$)', text)
        if race_match:
            data['race'] = race_match.group(1).strip()
        
        # 性别
        gender_match = re.search(r'[性别][:：]\s*(.+?)(?:\n|$)', text)
        if gender_match:
            data['gender'] = gender_match.group(1).strip()
        
        # 年龄
        age_match = re.search(r'[年龄|年纪][:：]\s*(\d+)', text)
        if age_match:
            data['age'] = int(age_match.group(1))
        
        # 外貌
        appearance_match = re.search(r'[外貌|外貌描述|外表][:：]\s*(.+?)(?:\n\n|\n[A-Z]|$)', text, re.DOTALL)
        if appearance_match:
            data['appearance'] = appearance_match.group(1).strip()
        
        # 性格
        personality_match = re.search(r'[性格|性格特征|个性][:：]\s*(.+?)(?:\n\n|\n[A-Z]|$)', text, re.DOTALL)
        if personality_match:
            data['personality'] = personality_match.group(1).strip()
        
        # 背景
        background_match = re.search(r'[背景|背景故事|经历][:：]\s*(.+?)(?:\n\n|\n[A-Z]|$)', text, re.DOTALL)
        if background_match:
            data['background'] = background_match.group(1).strip()
    
    def _extract_location_fields(self, text: str, data: Dict[str, Any]):
        """提取地点特定字段"""
        # 地点类型
        type_match = re.search(r'[类型|地点类型][:：]\s*(.+?)(?:\n|$)', text)
        if type_match:
            data['location_type'] = type_match.group(1).strip()
        
        # 区域
        region_match = re.search(r'[区域|所属区域|地区][:：]\s*(.+?)(?:\n|$)', text)
        if region_match:
            data['region'] = region_match.group(1).strip()
        
        # 地理位置
        geo_match = re.search(r'[地理位置|位置][:：]\s*(.+?)(?:\n|$)', text)
        if geo_match:
            data['geographical_location'] = geo_match.group(1).strip()
    
    def _extract_item_fields(self, text: str, data: Dict[str, Any]):
        """提取物品特定字段"""
        # 物品类型
        type_match = re.search(r'[类型|物品类型][:：]\s*(.+?)(?:\n|$)', text)
        if type_match:
            data['item_type'] = type_match.group(1).strip()
        
        # 稀有度
        rarity_match = re.search(r'[稀有度|稀有等级|珍贵度][:：]\s*(.+?)(?:\n|$)', text)
        if rarity_match:
            data['rarity_level'] = rarity_match.group(1).strip()
        
        # 物理属性
        physical_match = re.search(r'[物理属性|材质|外观][:：]\s*(.+?)(?:\n\n|\n[A-Z]|$)', text, re.DOTALL)
        if physical_match:
            data['physical_properties'] = physical_match.group(1).strip()
    
    def _extract_faction_fields(self, text: str, data: Dict[str, Any]):
        """提取势力特定字段"""
        # 势力类型
        type_match = re.search(r'[类型|势力类型][:：]\s*(.+?)(?:\n|$)', text)
        if type_match:
            data['faction_type'] = type_match.group(1).strip()
        
        # 核心理念
        ideology_match = re.search(r'[核心理念|理念|宗旨][:：]\s*(.+?)(?:\n\n|\n[A-Z]|$)', text, re.DOTALL)
        if ideology_match:
            data['core_ideology'] = ideology_match.group(1).strip()
        
        # 领导者
        leader_match = re.search(r'[领导者|首领|领袖][:：]\s*(.+?)(?:\n|$)', text)
        if leader_match:
            data['leader'] = leader_match.group(1).strip()
    
    def _get_valid_fields(self, entity_type: str) -> List[str]:
        """获取实体类型的有效字段列表"""
        fields_map = {
            'character': [
                'name', 'race', 'gender', 'age', 'description', 'appearance',
                'personality', 'background', 'character_arc', 'motivation',
                'secrets', 'birthplace', 'nationality', 'occupation', 'faction',
                'current_location', 'core_traits', 'psychological_fear', 'values',
                'growth_experience', 'important_turning_points', 'psychological_trauma',
                'physical_abilities', 'intelligence_perception', 'special_talents',
                'current_level', 'special_abilities', 'ability_levels', 'ability_limits',
                'growth_path', 'common_equipment', 'special_items', 'personal_items',
                'key_items', 'family_members', 'family_background', 'close_friends',
                'mentor_student', 'colleagues', 'grudges', 'love_relationships',
                'complex_emotions', 'unrequited_love', 'emotional_changes'
            ],
            'location': [
                'name', 'location_type', 'description', 'region', 'geographical_location',
                'terrain', 'climate', 'special_environment', 'controlling_faction',
                'population_composition', 'economic_status', 'cultural_features',
                'overall_layout', 'functional_areas', 'key_buildings', 'secret_areas',
                'defense_facilities', 'guard_force', 'defense_weaknesses',
                'emergency_plans', 'main_resources', 'potential_dangers',
                'access_restrictions', 'survival_conditions', 'importance'
            ],
            'item': [
                'name', 'item_type', 'rarity_level', 'description', 'physical_properties',
                'special_effects', 'usage_requirements', 'durability', 'creator',
                'source', 'historical_heritage', 'current_owner', 'acquisition_method',
                'importance'
            ],
            'faction': [
                'name', 'faction_type', 'faction_status', 'description', 'core_ideology',
                'sphere_of_influence', 'influence_level', 'establishment_time',
                'member_size', 'headquarters_location', 'economic_strength',
                'leadership_system', 'hierarchy', 'department_setup',
                'decision_mechanism', 'leader', 'key_members', 'talent_reserve',
                'defectors', 'recruitment_method', 'training_system',
                'disciplinary_rules', 'promotion_path', 'special_abilities',
                'heritage_system', 'resource_reserves', 'intelligence_network',
                'short_term_goals', 'medium_term_plans', 'long_term_vision',
                'secret_plans', 'ally_relationships', 'enemy_relationships',
                'subordinate_relationships', 'neutral_relationships', 'importance'
            ],
            'energy_system': [
                'name', 'energy_type', 'description', 'source', 'acquisition_method',
                'storage_method', 'usage_limitations', 'common_applications',
                'rarity', 'stability', 'interaction_with_other_energies',
                'cultivation_method', 'typical_manifestations'
            ],
            'civilization': [
                'name', 'civilization_type', 'description', 'development_level',
                'population_scale', 'territory_size', 'political_system',
                'economic_system', 'technological_level', 'magical_level',
                'cultural_characteristics', 'religious_beliefs', 'taboos',
                'values', 'historical_origin'
            ],
            'historical_event': [
                'name', 'event_type', 'description', 'start_year', 'end_year',
                'primary_causes', 'key_participants', 'event_sequence',
                'immediate_outcomes', 'long_term_consequences', 'historical_significance',
                'importance_level'
            ],
            'region': [
                'name', 'region_type', 'description', 'climate', 'terrain',
                'area_size', 'population', 'resources', 'strategic_importance',
                'danger_level', 'geographical_coordinates'
            ],
            'dimension': [
                'name', 'dimension_type', 'description', 'entry_conditions',
                'physical_properties', 'time_flow', 'spatial_hierarchy',
                'special_rules', 'magic_concentration', 'element_activity', 'gravity'
            ]
        }
        
        return fields_map.get(entity_type, [])
    
    def validate_result(self, data: Dict[str, Any], entity_type: str) -> Dict[str, Any]:
        """
        验证生成结果
        
        Args:
            data: 解析后的数据
            entity_type: 实体类型
        
        Returns:
            验证结果
        """
        errors = []
        warnings = []
        
        # 检查必要字段
        required_fields = self._get_required_fields(entity_type)
        for field in required_fields:
            if field not in data or not data[field]:
                errors.append(f"缺少必要字段: {field}")
        
        # 检查字段类型和长度
        for key, value in data.items():
            if isinstance(value, str):
                if len(value) > 10000:  # 字段长度限制
                    warnings.append(f"字段 {key} 内容过长，已截断")
                    data[key] = value[:10000]
        
        return {
            'valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings
        }
    
    def _get_required_fields(self, entity_type: str) -> List[str]:
        """获取实体类型的必要字段"""
        required_map = {
            'character': ['name'],
            'location': ['name', 'location_type'],
            'item': ['name', 'item_type'],
            'faction': ['name', 'faction_type'],
            'energy_system': ['name', 'energy_type'],
            'civilization': ['name', 'civilization_type'],
            'historical_event': ['name', 'event_type'],
            'region': ['name', 'region_type'],
            'dimension': ['name', 'dimension_type']
        }
        
        return required_map.get(entity_type, ['name'])


# 创建全局结果解析器实例
result_parser = ResultParser()

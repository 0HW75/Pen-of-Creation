"""
势力生成器
生成势力设定
"""
from typing import Dict, Any, Optional
import logging

from .base_generator import BaseGenerator

logger = logging.getLogger(__name__)


class FactionGenerator(BaseGenerator):
    """势力生成器"""
    
    def __init__(self):
        super().__init__('faction')
    
    def save_to_database(self, data: Dict[str, Any],
                        world_id: Optional[int] = None,
                        project_id: Optional[int] = None) -> Dict[str, Any]:
        """
        保存势力数据到数据库
        
        Args:
            data: 生成的势力数据
            world_id: 世界观ID
            project_id: 项目ID
        
        Returns:
            保存结果
        """
        try:
            from app.models import Faction
            from app import db
            
            # 准备势力数据
            faction_data = {
                'world_id': world_id,
                'project_id': project_id,
                'name': data.get('name', '未命名势力'),
                'faction_type': data.get('faction_type', '国家'),
                'faction_status': data.get('faction_status', '活跃'),
                'description': data.get('description', ''),
                'core_ideology': data.get('core_ideology', ''),
                'sphere_of_influence': data.get('sphere_of_influence', ''),
                'influence_level': data.get('influence_level', '区域'),
                'establishment_time': data.get('establishment_time', ''),
                'member_size': data.get('member_size', ''),
                'headquarters_location': data.get('headquarters_location', ''),
                'economic_strength': data.get('economic_strength', ''),
                'leadership_system': data.get('leadership_system', ''),
                'hierarchy': data.get('hierarchy', ''),
                'department_setup': data.get('department_setup', ''),
                'decision_mechanism': data.get('decision_mechanism', ''),
                'leader': data.get('leader', ''),
                'key_members': data.get('key_members', ''),
                'talent_reserve': data.get('talent_reserve', ''),
                'defectors': data.get('defectors', ''),
                'recruitment_method': data.get('recruitment_method', ''),
                'training_system': data.get('training_system', ''),
                'disciplinary_rules': data.get('disciplinary_rules', ''),
                'promotion_path': data.get('promotion_path', ''),
                'special_abilities': data.get('special_abilities', ''),
                'heritage_system': data.get('heritage_system', ''),
                'resource_reserves': data.get('resource_reserves', ''),
                'intelligence_network': data.get('intelligence_network', ''),
                'short_term_goals': data.get('short_term_goals', ''),
                'medium_term_plans': data.get('medium_term_plans', ''),
                'long_term_vision': data.get('long_term_vision', ''),
                'secret_plans': data.get('secret_plans', ''),
                'ally_relationships': data.get('ally_relationships', ''),
                'enemy_relationships': data.get('enemy_relationships', ''),
                'subordinate_relationships': data.get('subordinate_relationships', ''),
                'neutral_relationships': data.get('neutral_relationships', ''),
                'importance': int(data.get('importance', 0)) if data.get('importance') else 0
            }
            
            # 创建势力对象
            faction = Faction(**faction_data)
            db.session.add(faction)
            db.session.commit()
            
            logger.info(f"势力已保存到数据库: {faction.name} (ID: {faction.id})")
            
            return {
                'success': True,
                'faction_id': faction.id,
                'faction': faction.to_dict()
            }
            
        except Exception as e:
            logger.error(f"保存势力失败: {e}")
            return {
                'success': False,
                'error': str(e)
            }

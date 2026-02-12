"""
地点生成器
生成地点设定
"""
from typing import Dict, Any, Optional
import logging

from .base_generator import BaseGenerator

logger = logging.getLogger(__name__)


class LocationGenerator(BaseGenerator):
    """地点生成器"""
    
    def __init__(self):
        super().__init__('location')
    
    def save_to_database(self, data: Dict[str, Any],
                        world_id: Optional[int] = None,
                        project_id: Optional[int] = None) -> Dict[str, Any]:
        """
        保存地点数据到数据库
        
        Args:
            data: 生成的地点数据
            world_id: 世界观ID
            project_id: 项目ID
        
        Returns:
            保存结果
        """
        try:
            from app.models import Location
            from app import db
            
            # 准备地点数据
            location_data = {
                'world_id': world_id,
                'project_id': project_id,
                'name': data.get('name', '未命名地点'),
                'location_type': data.get('location_type', '城市'),
                'description': data.get('description', ''),
                'region': data.get('region', ''),
                'geographical_location': data.get('geographical_location', ''),
                'terrain': data.get('terrain', ''),
                'climate': data.get('climate', ''),
                'special_environment': data.get('special_environment', ''),
                'controlling_faction': data.get('controlling_faction', ''),
                'population_composition': data.get('population_composition', ''),
                'economic_status': data.get('economic_status', ''),
                'cultural_features': data.get('cultural_features', ''),
                'overall_layout': data.get('overall_layout', ''),
                'functional_areas': data.get('functional_areas', ''),
                'key_buildings': data.get('key_buildings', ''),
                'secret_areas': data.get('secret_areas', ''),
                'defense_facilities': data.get('defense_facilities', ''),
                'guard_force': data.get('guard_force', ''),
                'defense_weaknesses': data.get('defense_weaknesses', ''),
                'emergency_plans': data.get('emergency_plans', ''),
                'main_resources': data.get('main_resources', ''),
                'potential_dangers': data.get('potential_dangers', ''),
                'access_restrictions': data.get('access_restrictions', ''),
                'survival_conditions': data.get('survival_conditions', ''),
                'importance': int(data.get('importance', 5)) if data.get('importance') else 5
            }
            
            # 创建地点对象
            location = Location(**location_data)
            db.session.add(location)
            db.session.commit()
            
            logger.info(f"地点已保存到数据库: {location.name} (ID: {location.id})")
            
            return {
                'success': True,
                'location_id': location.id,
                'location': location.to_dict()
            }
            
        except Exception as e:
            logger.error(f"保存地点失败: {e}")
            return {
                'success': False,
                'error': str(e)
            }

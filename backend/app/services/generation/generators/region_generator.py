"""
区域生成器
生成地理区域设定
"""
from typing import Dict, Any, Optional
import logging

from .base_generator import BaseGenerator

logger = logging.getLogger(__name__)


class RegionGenerator(BaseGenerator):
    """区域生成器"""
    
    def __init__(self):
        super().__init__('region')
    
    def save_to_database(self, data: Dict[str, Any],
                        world_id: Optional[int] = None,
                        project_id: Optional[int] = None) -> Dict[str, Any]:
        """
        保存区域数据到数据库
        
        Args:
            data: 生成的区域数据
            world_id: 世界观ID
            project_id: 项目ID
        
        Returns:
            保存结果
        """
        try:
            from app.models import Region
            from app import db
            
            region_data = {
                'world_id': world_id,
                'name': data.get('name', '未命名区域'),
                'region_type': data.get('region_type', '大陆'),
                'description': data.get('description', ''),
                'geographical_coordinates': data.get('geographical_coordinates', ''),
                'climate': data.get('climate', '温带'),
                'terrain': data.get('terrain', ''),
                'area_size': data.get('area_size', ''),
                'population': int(data.get('population', 0)) if data.get('population') else 0,
                'resources': data.get('resources', ''),
                'strategic_importance': int(data.get('strategic_importance', 5)) if data.get('strategic_importance') else 5,
                'danger_level': data.get('danger_level', '安全')
            }
            
            region = Region(**region_data)
            db.session.add(region)
            db.session.commit()
            
            logger.info(f"区域已保存到数据库: {region.name} (ID: {region.id})")
            
            return {
                'success': True,
                'region_id': region.id,
                'region': region.to_dict()
            }
            
        except Exception as e:
            logger.error(f"保存区域失败: {e}")
            return {
                'success': False,
                'error': str(e)
            }

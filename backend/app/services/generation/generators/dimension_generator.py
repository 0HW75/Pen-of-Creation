"""
维度位面生成器
生成维度位面设定
"""
from typing import Dict, Any, Optional
import logging

from .base_generator import BaseGenerator

logger = logging.getLogger(__name__)


class DimensionGenerator(BaseGenerator):
    """维度位面生成器"""
    
    def __init__(self):
        super().__init__('dimension')
    
    def save_to_database(self, data: Dict[str, Any],
                        world_id: Optional[int] = None,
                        project_id: Optional[int] = None) -> Dict[str, Any]:
        """
        保存维度位面数据到数据库
        
        Args:
            data: 生成的维度位面数据
            world_id: 世界观ID
            project_id: 项目ID
        
        Returns:
            保存结果
        """
        try:
            from app.models import Dimension
            from app import db
            
            dimension_data = {
                'world_id': world_id,
                'name': data.get('name', '未命名维度'),
                'dimension_type': data.get('dimension_type', '主世界'),
                'description': data.get('description', ''),
                'entry_conditions': data.get('entry_conditions', ''),
                'physical_properties': data.get('physical_properties', ''),
                'time_flow': data.get('time_flow', '1:1'),
                'spatial_hierarchy': int(data.get('spatial_hierarchy', 1)) if data.get('spatial_hierarchy') else 1,
                'special_rules': data.get('special_rules', ''),
                'magic_concentration': data.get('magic_concentration', '中等'),
                'element_activity': data.get('element_activity', ''),
                'gravity': data.get('gravity', '1.0G')
            }
            
            dimension = Dimension(**dimension_data)
            db.session.add(dimension)
            db.session.commit()
            
            logger.info(f"维度已保存到数据库: {dimension.name} (ID: {dimension.id})")
            
            return {
                'success': True,
                'dimension_id': dimension.id,
                'dimension': dimension.to_dict()
            }
            
        except Exception as e:
            logger.error(f"保存维度失败: {e}")
            return {
                'success': False,
                'error': str(e)
            }

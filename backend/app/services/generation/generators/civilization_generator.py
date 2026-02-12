"""
文明文化生成器
生成文明文化设定
"""
from typing import Dict, Any, Optional
import logging

from .base_generator import BaseGenerator

logger = logging.getLogger(__name__)


class CivilizationGenerator(BaseGenerator):
    """文明文化生成器"""
    
    def __init__(self):
        super().__init__('civilization')
    
    def save_to_database(self, data: Dict[str, Any],
                        world_id: Optional[int] = None,
                        project_id: Optional[int] = None) -> Dict[str, Any]:
        """
        保存文明文化数据到数据库
        
        Args:
            data: 生成的文明文化数据
            world_id: 世界观ID
            project_id: 项目ID
        
        Returns:
            保存结果
        """
        try:
            from app.models import Civilization
            from app import db
            
            civilization_data = {
                'world_id': world_id,
                'name': data.get('name', '未命名文明'),
                'civilization_type': data.get('civilization_type', '魔法文明'),
                'description': data.get('description', ''),
                'development_level': data.get('development_level', '中世纪'),
                'population_scale': data.get('population_scale', ''),
                'territory_size': data.get('territory_size', ''),
                'political_system': data.get('political_system', ''),
                'economic_system': data.get('economic_system', ''),
                'technological_level': data.get('technological_level', ''),
                'magical_level': data.get('magical_level', ''),
                'cultural_characteristics': data.get('cultural_characteristics', ''),
                'religious_beliefs': data.get('religious_beliefs', ''),
                'taboos': data.get('taboos', ''),
                'values': data.get('values', ''),
                'historical_origin': data.get('historical_origin', '')
            }
            
            civilization = Civilization(**civilization_data)
            db.session.add(civilization)
            db.session.commit()
            
            logger.info(f"文明已保存到数据库: {civilization.name} (ID: {civilization.id})")
            
            return {
                'success': True,
                'civilization_id': civilization.id,
                'civilization': civilization.to_dict()
            }
            
        except Exception as e:
            logger.error(f"保存文明失败: {e}")
            return {
                'success': False,
                'error': str(e)
            }

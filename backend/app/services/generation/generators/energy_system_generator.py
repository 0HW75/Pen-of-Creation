"""
能量体系生成器
生成能量体系设定
"""
from typing import Dict, Any, Optional
import logging

from .base_generator import BaseGenerator

logger = logging.getLogger(__name__)


class EnergySystemGenerator(BaseGenerator):
    """能量体系生成器"""
    
    def __init__(self):
        super().__init__('energy_system')
    
    def save_to_database(self, data: Dict[str, Any],
                        world_id: Optional[int] = None,
                        project_id: Optional[int] = None) -> Dict[str, Any]:
        """
        保存能量体系数据到数据库
        
        Args:
            data: 生成的能量体系数据
            world_id: 世界观ID
            project_id: 项目ID
        
        Returns:
            保存结果
        """
        try:
            from app.models import EnergySystem
            from app import db
            
            energy_data = {
                'world_id': world_id,
                'name': data.get('name', '未命名能量体系'),
                'energy_type': data.get('energy_type', '魔法'),
                'description': data.get('description', ''),
                'source': data.get('source', ''),
                'acquisition_method': data.get('acquisition_method', ''),
                'storage_method': data.get('storage_method', ''),
                'usage_limitations': data.get('usage_limitations', ''),
                'common_applications': data.get('common_applications', ''),
                'rarity': data.get('rarity', '常见'),
                'stability': data.get('stability', '稳定'),
                'interaction_with_other_energies': data.get('interaction_with_other_energies', ''),
                'cultivation_method': data.get('cultivation_method', ''),
                'typical_manifestations': data.get('typical_manifestations', '')
            }
            
            energy_system = EnergySystem(**energy_data)
            db.session.add(energy_system)
            db.session.commit()
            
            logger.info(f"能量体系已保存到数据库: {energy_system.name} (ID: {energy_system.id})")
            
            return {
                'success': True,
                'energy_system_id': energy_system.id,
                'energy_system': energy_system.to_dict()
            }
            
        except Exception as e:
            logger.error(f"保存能量体系失败: {e}")
            return {
                'success': False,
                'error': str(e)
            }

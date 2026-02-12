"""
物品生成器
生成物品设定
"""
from typing import Dict, Any, Optional
import logging

from .base_generator import BaseGenerator

logger = logging.getLogger(__name__)


class ItemGenerator(BaseGenerator):
    """物品生成器"""
    
    def __init__(self):
        super().__init__('item')
    
    def save_to_database(self, data: Dict[str, Any],
                        world_id: Optional[int] = None,
                        project_id: Optional[int] = None) -> Dict[str, Any]:
        """
        保存物品数据到数据库
        
        Args:
            data: 生成的物品数据
            world_id: 世界观ID
            project_id: 项目ID
        
        Returns:
            保存结果
        """
        try:
            from app.models import Item
            from app import db
            
            # 准备物品数据
            item_data = {
                'world_id': world_id,
                'project_id': project_id,
                'name': data.get('name', '未命名物品'),
                'item_type': data.get('item_type', '普通'),
                'rarity_level': data.get('rarity_level', '普通'),
                'description': data.get('description', ''),
                'physical_properties': data.get('physical_properties', ''),
                'special_effects': data.get('special_effects', ''),
                'usage_requirements': data.get('usage_requirements', ''),
                'durability': int(data.get('durability', 100)) if data.get('durability') else 100,
                'creator': data.get('creator', ''),
                'source': data.get('source', ''),
                'historical_heritage': data.get('historical_heritage', ''),
                'current_owner': data.get('current_owner', ''),
                'acquisition_method': data.get('acquisition_method', ''),
                'importance': int(data.get('importance', 0)) if data.get('importance') else 0
            }
            
            # 创建物品对象
            item = Item(**item_data)
            db.session.add(item)
            db.session.commit()
            
            logger.info(f"物品已保存到数据库: {item.name} (ID: {item.id})")
            
            return {
                'success': True,
                'item_id': item.id,
                'item': item.to_dict()
            }
            
        except Exception as e:
            logger.error(f"保存物品失败: {e}")
            return {
                'success': False,
                'error': str(e)
            }

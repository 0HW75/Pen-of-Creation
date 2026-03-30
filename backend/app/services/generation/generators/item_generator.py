"""
物品生成器
生成物品设定
"""
from typing import Dict, Any, Optional, List
import logging

from .base_generator import BaseGenerator
from logs import generation_logger

logger = logging.getLogger(__name__)


class ItemGenerator(BaseGenerator):
    """物品生成器"""
    
    def __init__(self):
        super().__init__('item')
    
    def save_to_database(self, data: Dict[str, Any],
                        world_id: Optional[int] = None,
                        project_id: Optional[int] = None,
                        source_chapters: Optional[List[Dict]] = None) -> Dict[str, Any]:
        """
        保存物品数据到数据库
        
        Args:
            data: 生成的物品数据
            world_id: 世界观ID
            project_id: 项目ID
            source_chapters: 来源章节列表，用于维护章节出现索引
        
        Returns:
            保存结果
        """
        try:
            from app.models import Item
            from app import db
            from app.services.chapter_appearance_service import chapter_appearance_service
            
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
                'importance_level': int(data.get('importance_level', 5)) if data.get('importance_level') else 5
            }
            
            item = Item(**item_data)
            db.session.add(item)
            db.session.commit()

            logger.info(f"物品已保存到数据库: {item.name} (ID: {item.id})")
            generation_logger.log_step4_save('item', item.name, item_data, {
                'success': True,
                'item_id': item.id
            })

            if source_chapters and project_id:
                chapter_appearance_service.create_appearances_from_source(
                    project_id=project_id,
                    entity_type='item',
                    entity_id=item.id,
                    source_chapters=source_chapters,
                    appearance_type='首次出现'
                )
            
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

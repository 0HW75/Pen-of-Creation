"""
文化习俗生成器
生成文化习俗设定
"""
from typing import Dict, Any, Optional
import logging

from .base_generator import BaseGenerator
from logs import generation_logger

logger = logging.getLogger(__name__)


class CulturalCustomGenerator(BaseGenerator):
    """文化习俗生成器"""

    def __init__(self):
        super().__init__('cultural_custom')

    def save_to_database(self, data: Dict[str, Any],
                        world_id: Optional[int] = None,
                        project_id: Optional[int] = None,
                        source_chapters: Any = None) -> Dict[str, Any]:
        """
        保存文化习俗数据到数据库
        """
        try:
            from app.models import CulturalCustom
            from app import db

            custom_data = {
                'world_id': world_id,
                'civilization_id': data.get('civilization_id'),
                'name': data.get('name', '未命名文化习俗'),
                'custom_type': data.get('custom_type', '节日'),
                'description': data.get('description', ''),
                'origin': data.get('origin', ''),
                'significance': data.get('significance', ''),
                'participants': data.get('participants', ''),
                'time_period': data.get('time_period', ''),
                'location': data.get('location', ''),
                'procedures': data.get('procedures', ''),
                'related_beliefs': data.get('related_beliefs', ''),
                'variations': data.get('variations', ''),
                'importance_level': data.get('importance_level', 5),
            }

            cultural_custom = CulturalCustom(**custom_data)
            db.session.add(cultural_custom)
            db.session.commit()

            logger.info(f"文化习俗已保存到数据库: {cultural_custom.name} (ID: {cultural_custom.id})")
            generation_logger.log_step4_save('cultural_custom', cultural_custom.name, custom_data, {
                'success': True,
                'cultural_custom_id': cultural_custom.id
            })

            if source_chapters and project_id:
                from app.services.chapter_appearance_service import chapter_appearance_service
                chapter_appearance_service.create_appearances_from_source(
                    project_id=project_id,
                    entity_type='cultural_custom',
                    entity_id=cultural_custom.id,
                    source_chapters=source_chapters,
                    appearance_type='首次出现'
                )

            return {
                'success': True,
                'cultural_custom_id': cultural_custom.id,
                'cultural_custom': cultural_custom.to_dict()
            }

        except Exception as e:
            logger.error(f"保存文化习俗失败: {e}")
            return {
                'success': False,
                'error': str(e)
            }

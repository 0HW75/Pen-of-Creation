"""
天体生成器
生成天体星球设定
"""
from typing import Dict, Any, Optional
import logging

from .base_generator import BaseGenerator
from logs import generation_logger

logger = logging.getLogger(__name__)


class CelestialBodyGenerator(BaseGenerator):
    """天体生成器"""

    def __init__(self):
        super().__init__('celestial_body')

    def save_to_database(self, data: Dict[str, Any],
                        world_id: Optional[int] = None,
                        project_id: Optional[int] = None,
                        source_chapters: Any = None) -> Dict[str, Any]:
        """
        保存天体数据到数据库

        Args:
            data: 生成的天体数据
            world_id: 世界观ID
            project_id: 项目ID
            source_chapters: 来源章节列表

        Returns:
            保存结果
        """
        try:
            from app.models import CelestialBody
            from app import db

            celestial_data = {
                'world_id': world_id,
                'name': data.get('name', '未命名天体'),
                'body_type': data.get('body_type', '行星'),
                'description': data.get('description', ''),
                'size': data.get('size', ''),
                'mass': data.get('mass', ''),
                'orbit_period': data.get('orbit_period', ''),
                'rotation_period': data.get('rotation_period', ''),
                'distance_from_star': data.get('distance_from_star', ''),
                'surface_temperature': data.get('surface_temperature', ''),
                'atmosphere': data.get('atmosphere', ''),
                'satellites': data.get('satellites', ''),
                'magical_properties': data.get('magical_properties', ''),
                'cultural_significance': data.get('cultural_significance', ''),
                'strategic_importance': int(data.get('strategic_importance', 5)) if data.get('strategic_importance') else 5,
                'importance_level': int(data.get('importance_level', 5)) if data.get('importance_level') else 5
            }

            celestial = CelestialBody(**celestial_data)
            db.session.add(celestial)
            db.session.commit()

            logger.info(f"天体已保存到数据库: {celestial.name} (ID: {celestial.id})")
            generation_logger.log_step4_save('celestial_body', celestial.name, celestial_data, {
                'success': True,
                'celestial_body_id': celestial.id
            })

            if source_chapters and project_id:
                from app.services.chapter_appearance_service import chapter_appearance_service
                chapter_appearance_service.create_appearances_from_source(
                    project_id=project_id,
                    entity_type='celestial_body',
                    entity_id=celestial.id,
                    source_chapters=source_chapters,
                    appearance_type='首次出现'
                )

            return {
                'success': True,
                'celestial_body_id': celestial.id,
                'celestial_body': celestial.to_dict()
            }

        except Exception as e:
            logger.error(f"保存天体失败: {e}")
            return {
                'success': False,
                'error': str(e)
            }
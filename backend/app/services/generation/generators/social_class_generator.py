"""
社会阶层生成器
生成社会阶层设定
"""
from typing import Dict, Any, Optional
import logging

from .base_generator import BaseGenerator
from logs import generation_logger

logger = logging.getLogger(__name__)


class SocialClassGenerator(BaseGenerator):
    """社会阶层生成器"""

    def __init__(self):
        super().__init__('social_class')

    def save_to_database(self, data: Dict[str, Any],
                        world_id: Optional[int] = None,
                        project_id: Optional[int] = None,
                        source_chapters: Any = None) -> Dict[str, Any]:
        """
        保存社会阶层数据到数据库
        """
        try:
            from app.models import SocialClass
            from app import db

            class_data = {
                'world_id': world_id,
                'civilization_id': data.get('civilization_id'),
                'name': data.get('name', '未命名社会阶层'),
                'class_level': data.get('class_level', 1),
                'description': data.get('description', ''),
                'typical_occupations': data.get('typical_occupations', ''),
                'privileges': data.get('privileges', ''),
                'obligations': data.get('obligations', ''),
                'living_standards': data.get('living_standards', ''),
                'education_access': data.get('education_access', ''),
                'social_mobility': data.get('social_mobility', ''),
                'percentage_of_population': data.get('percentage_of_population', ''),
                'typical_power_level': data.get('typical_power_level', 0),
                'importance_level': int(data.get('importance_level', 5)) if data.get('importance_level') else 5
            }

            social_class = SocialClass(**class_data)
            db.session.add(social_class)
            db.session.commit()

            logger.info(f"社会阶层已保存到数据库: {social_class.name} (ID: {social_class.id})")
            generation_logger.log_step4_save('social_class', social_class.name, class_data, {
                'success': True,
                'social_class_id': social_class.id
            })

            if source_chapters and project_id:
                from app.services.chapter_appearance_service import chapter_appearance_service
                chapter_appearance_service.create_appearances_from_source(
                    project_id=project_id,
                    entity_type='social_class',
                    entity_id=social_class.id,
                    source_chapters=source_chapters,
                    appearance_type='首次出现'
                )

            return {
                'success': True,
                'social_class_id': social_class.id,
                'social_class': social_class.to_dict()
            }

        except Exception as e:
            logger.error(f"保存社会阶层失败: {e}")
            return {
                'success': False,
                'error': str(e)
            }

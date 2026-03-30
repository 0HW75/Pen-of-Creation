"""
自然法则生成器
生成自然法则设定
"""
from typing import Dict, Any, Optional
import logging

from .base_generator import BaseGenerator
from logs import generation_logger

logger = logging.getLogger(__name__)


class NaturalLawGenerator(BaseGenerator):
    """自然法则生成器"""

    def __init__(self):
        super().__init__('natural_law')

    def save_to_database(self, data: Dict[str, Any],
                        world_id: Optional[int] = None,
                        project_id: Optional[int] = None,
                        source_chapters: Any = None) -> Dict[str, Any]:
        """
        保存自然法则数据到数据库

        Args:
            data: 生成的自然法则数据
            world_id: 世界观ID
            project_id: 项目ID
            source_chapters: 来源章节列表

        Returns:
            保存结果
        """
        try:
            from app.models import NaturalLaw
            from app import db

            natural_law_data = {
                'world_id': world_id,
                'name': data.get('name', '未命名法则'),
                'law_type': data.get('law_type', '物理法则'),
                'description': data.get('description', ''),
                'basic_principles': data.get('basic_principles', ''),
                'exceptions': data.get('exceptions', ''),
                'limitations': data.get('limitations', ''),
                'interactions': data.get('interactions', ''),
                'common_applications': data.get('common_applications', ''),
                'taboos': data.get('taboos', ''),
                'consequences': data.get('consequences', ''),
                'importance_level': int(data.get('importance_level', 5)) if data.get('importance_level') else 5
            }

            natural_law = NaturalLaw(**natural_law_data)
            db.session.add(natural_law)
            db.session.commit()

            logger.info(f"自然法则已保存到数据库: {natural_law.name} (ID: {natural_law.id})")
            generation_logger.log_step4_save('natural_law', natural_law.name, natural_law_data, {
                'success': True,
                'natural_law_id': natural_law.id
            })

            if source_chapters and project_id:
                from app.services.chapter_appearance_service import chapter_appearance_service
                chapter_appearance_service.create_appearances_from_source(
                    project_id=project_id,
                    entity_type='natural_law',
                    entity_id=natural_law.id,
                    source_chapters=source_chapters,
                    appearance_type='首次出现'
                )

            return {
                'success': True,
                'natural_law_id': natural_law.id,
                'natural_law': natural_law.to_dict()
            }

        except Exception as e:
            logger.error(f"保存自然法则失败: {e}")
            return {
                'success': False,
                'error': str(e)
            }
"""
历史人物生成器
生成历史人物设定
"""
from typing import Dict, Any, Optional
import logging

from .base_generator import BaseGenerator
from logs import generation_logger

logger = logging.getLogger(__name__)


class HistoricalFigureGenerator(BaseGenerator):
    """历史人物生成器"""

    def __init__(self):
        super().__init__('historical_figure')

    def save_to_database(self, data: Dict[str, Any],
                        world_id: Optional[int] = None,
                        project_id: Optional[int] = None,
                        source_chapters: Any = None) -> Dict[str, Any]:
        """
        保存历史人物数据到数据库

        Args:
            data: 生成的历史人物数据
            world_id: 世界观ID
            project_id: 项目ID
            source_chapters: 来源章节列表

        Returns:
            保存结果
        """
        try:
            from app.models import HistoricalFigure
            from app import db

            figure_data = {
                'world_id': world_id,
                'name': data.get('name', '未命名历史人物'),
                'birth_year': data.get('birth_year', ''),
                'death_year': data.get('death_year', ''),
                'birth_place_id': data.get('birth_place_id'),
                'death_place_id': data.get('death_place_id'),
                'primary_role': data.get('primary_role', ''),
                'social_class': data.get('social_class', ''),
                'key_achievements': data.get('key_achievements', ''),
                'controversies': data.get('controversies', ''),
                'historical_legacy': data.get('historical_legacy', ''),
                'description': data.get('description', ''),
                'importance_level': int(data.get('importance_level', 5)) if data.get('importance_level') else 5
            }

            figure = HistoricalFigure(**figure_data)
            db.session.add(figure)
            db.session.commit()

            logger.info(f"历史人物已保存到数据库: {figure.name} (ID: {figure.id})")
            generation_logger.log_step4_save('historical_figure', figure.name, figure_data, {
                'success': True,
                'historical_figure_id': figure.id
            })

            if source_chapters and project_id:
                from app.services.chapter_appearance_service import chapter_appearance_service
                chapter_appearance_service.create_appearances_from_source(
                    project_id=project_id,
                    entity_type='historical_figure',
                    entity_id=figure.id,
                    source_chapters=source_chapters,
                    appearance_type='首次出现'
                )

            return {
                'success': True,
                'historical_figure_id': figure.id,
                'historical_figure': figure.to_dict()
            }

        except Exception as e:
            logger.error(f"保存历史人物失败: {e}")
            return {
                'success': False,
                'error': str(e)
            }
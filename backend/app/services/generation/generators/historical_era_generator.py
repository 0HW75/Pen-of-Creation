"""
历史纪元生成器
生成历史纪元设定
"""
from typing import Dict, Any, Optional
import logging

from .base_generator import BaseGenerator
from logs import generation_logger

logger = logging.getLogger(__name__)


class HistoricalEraGenerator(BaseGenerator):
    """历史纪元生成器"""

    def __init__(self):
        super().__init__('historical_era')

    def save_to_database(self, data: Dict[str, Any],
                        world_id: Optional[int] = None,
                        project_id: Optional[int] = None,
                        source_chapters: Any = None) -> Dict[str, Any]:
        """
        保存历史纪元数据到数据库

        Args:
            data: 生成的历史纪元数据
            world_id: 世界观ID
            project_id: 项目ID
            source_chapters: 来源章节列表

        Returns:
            保存结果
        """
        try:
            from app.models import HistoricalEra
            from app import db

            era_data = {
                'world_id': world_id,
                'name': data.get('name', '未命名纪元'),
                'start_year': data.get('start_year', ''),
                'end_year': data.get('end_year', ''),
                'duration_description': data.get('duration_description', ''),
                'main_characteristics': data.get('main_characteristics', ''),
                'key_technologies': data.get('key_technologies', ''),
                'dominant_civilizations': data.get('dominant_civilizations', ''),
                'ending_cause': data.get('ending_cause', ''),
                'legacy_impact': data.get('legacy_impact', ''),
                'description': data.get('description', ''),
                'importance_level': int(data.get('importance_level', 5)) if data.get('importance_level') else 5,
                'order_index': int(data.get('order_index', 0)) if data.get('order_index') else 0
            }

            era = HistoricalEra(**era_data)
            db.session.add(era)
            db.session.commit()

            logger.info(f"历史纪元已保存到数据库: {era.name} (ID: {era.id})")
            generation_logger.log_step4_save('historical_era', era.name, era_data, {
                'success': True,
                'historical_era_id': era.id
            })

            if source_chapters and project_id:
                from app.services.chapter_appearance_service import chapter_appearance_service
                chapter_appearance_service.create_appearances_from_source(
                    project_id=project_id,
                    entity_type='historical_era',
                    entity_id=era.id,
                    source_chapters=source_chapters,
                    appearance_type='首次出现'
                )

            return {
                'success': True,
                'historical_era_id': era.id,
                'historical_era': era.to_dict()
            }

        except Exception as e:
            logger.error(f"保存历史纪元失败: {e}")
            return {
                'success': False,
                'error': str(e)
            }
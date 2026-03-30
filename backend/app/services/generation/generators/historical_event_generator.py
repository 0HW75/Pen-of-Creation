"""
历史事件生成器
生成历史事件设定
"""
from typing import Dict, Any, Optional
import logging

from .base_generator import BaseGenerator
from logs import generation_logger

logger = logging.getLogger(__name__)


class HistoricalEventGenerator(BaseGenerator):
    """历史事件生成器"""
    
    def __init__(self):
        super().__init__('historical_event')
    
    def save_to_database(self, data: Dict[str, Any],
                        world_id: Optional[int] = None,
                        project_id: Optional[int] = None,
                        source_chapters: Any = None) -> Dict[str, Any]:
        """
        保存历史事件数据到数据库

        Args:
            data: 生成的历史事件数据
            world_id: 世界观ID
            project_id: 项目ID
            source_chapters: 来源章节列表

        Returns:
            保存结果
        """
        try:
            from app.models import HistoricalEvent
            from app import db
            
            event_data = {
                'world_id': world_id,
                'name': data.get('name', '未命名历史事件'),
                'event_type': data.get('event_type', '战争'),
                'description': data.get('description', ''),
                'start_year': data.get('start_year', ''),
                'end_year': data.get('end_year', ''),
                'primary_causes': data.get('primary_causes', ''),
                'key_participants': data.get('key_participants', ''),
                'event_sequence': data.get('event_sequence', ''),
                'immediate_outcomes': data.get('immediate_outcomes', ''),
                'long_term_consequences': data.get('long_term_consequences', ''),
                'historical_significance': data.get('historical_significance', ''),
                'importance_level': int(data.get('importance_level', 5)) if data.get('importance_level') else 5
            }
            
            event = HistoricalEvent(**event_data)
            db.session.add(event)
            db.session.commit()

            logger.info(f"历史事件已保存到数据库: {event.name} (ID: {event.id})")
            generation_logger.log_step4_save('historical_event', event.name, event_data, {
                'success': True,
                'event_id': event.id
            })

            if source_chapters and project_id:
                from app.services.chapter_appearance_service import chapter_appearance_service
                chapter_appearance_service.create_appearances_from_source(
                    project_id=project_id,
                    entity_type='historical_event',
                    entity_id=event.id,
                    source_chapters=source_chapters,
                    appearance_type='首次出现'
                )

            return {
                'success': True,
                'event_id': event.id,
                'event': event.to_dict()
            }
            
        except Exception as e:
            logger.error(f"保存历史事件失败: {e}")
            return {
                'success': False,
                'error': str(e)
            }

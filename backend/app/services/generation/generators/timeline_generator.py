"""
时间线生成器
生成时间线设定
"""
from typing import Dict, Any, Optional
import logging

from .base_generator import BaseGenerator
from logs import generation_logger

logger = logging.getLogger(__name__)


class TimelineGenerator(BaseGenerator):
    """时间线生成器"""

    def __init__(self):
        super().__init__('timeline')

    def save_to_database(self, data: Dict[str, Any],
                        world_id: Optional[int] = None,
                        project_id: Optional[int] = None,
                        source_chapters: Any = None) -> Dict[str, Any]:
        """
        保存时间线数据到数据库

        Args:
            data: 生成的时间线数据
            world_id: 世界观ID
            project_id: 项目ID
            source_chapters: 来源章节列表

        Returns:
            保存结果
        """
        try:
            from app.models import Timeline
            from app import db

            timeline_type = data.get('timeline_type', '个人时间线')

            if timeline_type == '个人时间线':
                timeline_data = {
                    'project_id': project_id,
                    'world_id': world_id,
                    'name': data.get('name', '未命名时间线'),
                    'description': data.get('description', ''),
                    'timeline_type': timeline_type,
                    'related_id': data.get('related_id', 0),
                    'birth_growth': data.get('birth_growth', ''),
                    'key_events': data.get('key_events', ''),
                    'development_changes': data.get('development_changes', ''),
                    'important_turning_points': data.get('important_turning_points', ''),
                    'ending_destination': data.get('ending_destination', '')
                }
            elif timeline_type == '组织时间线':
                timeline_data = {
                    'project_id': project_id,
                    'world_id': world_id,
                    'name': data.get('name', '未命名时间线'),
                    'description': data.get('description', ''),
                    'timeline_type': timeline_type,
                    'related_id': data.get('related_id', 0),
                    'establishment_development': data.get('establishment_development', ''),
                    'rise_fall_changes': data.get('rise_fall_changes', ''),
                    'major_events': data.get('major_events', ''),
                    'power_changes': data.get('power_changes', ''),
                    'ending_transformation': data.get('ending_transformation', '')
                }
            elif timeline_type == '世界时间线':
                timeline_data = {
                    'project_id': project_id,
                    'world_id': world_id,
                    'name': data.get('name', '未命名时间线'),
                    'description': data.get('description', ''),
                    'timeline_type': timeline_type,
                    'world_creation': data.get('world_creation', ''),
                    'civilization_development': data.get('civilization_development', ''),
                    'major_changes': data.get('major_changes', ''),
                    'current_era': data.get('current_era', ''),
                    'future_possibilities': data.get('future_possibilities', '')
                }
            else:
                timeline_data = {
                    'project_id': project_id,
                    'world_id': world_id,
                    'name': data.get('name', '未命名时间线'),
                    'description': data.get('description', ''),
                    'timeline_type': timeline_type,
                    'key_events': data.get('key_events', '')
                }

            timeline = Timeline(**timeline_data)
            db.session.add(timeline)
            db.session.commit()

            logger.info(f"时间线已保存到数据库: {timeline.name} (ID: {timeline.id})")
            generation_logger.log_step4_save('timeline', timeline.name, timeline_data, {
                'success': True,
                'timeline_id': timeline.id
            })

            if source_chapters and project_id:
                from app.services.chapter_appearance_service import chapter_appearance_service
                chapter_appearance_service.create_appearances_from_source(
                    project_id=project_id,
                    entity_type='timeline',
                    entity_id=timeline.id,
                    source_chapters=source_chapters,
                    appearance_type='首次出现'
                )

            return {
                'success': True,
                'timeline_id': timeline.id,
                'timeline': timeline.to_dict()
            }

        except Exception as e:
            logger.error(f"保存时间线失败: {e}")
            return {
                'success': False,
                'error': str(e)
            }
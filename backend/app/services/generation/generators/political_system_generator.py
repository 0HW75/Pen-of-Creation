"""
政治体系生成器
生成政治体系设定
"""
from typing import Dict, Any, Optional
import logging

from .base_generator import BaseGenerator
from logs import generation_logger

logger = logging.getLogger(__name__)


class PoliticalSystemGenerator(BaseGenerator):
    """政治体系生成器"""

    def __init__(self):
        super().__init__('political_system')

    def save_to_database(self, data: Dict[str, Any],
                       world_id: Optional[int] = None,
                       project_id: Optional[int] = None,
                       source_chapters: Any = None) -> Dict[str, Any]:
        """
        保存政治体系数据到数据库
        """
        try:
            from app.models import PoliticalSystem
            from app import db

            system_data = {
                'world_id': world_id,
                'civilization_id': data.get('civilization_id'),
                'name': data.get('name', '未命名政治体系'),
                'government_type': data.get('government_type', '君主制'),
                'description': data.get('description', ''),
                'power_structure': data.get('power_structure', ''),
                'succession_system': data.get('succession_system', ''),
                'decision_process': data.get('decision_process', ''),
                'administrative_divisions': data.get('administrative_divisions', ''),
                'legal_system': data.get('legal_system', ''),
                'military_organization': data.get('military_organization', ''),
                'diplomatic_style': data.get('diplomatic_style', ''),
                'internal_conflicts': data.get('internal_conflicts', ''),
                'external_threats': data.get('external_threats', ''),
                'political_stability': data.get('political_stability', '稳定'),
                'importance_level': int(data.get('importance_level', 5)) if data.get('importance_level') else 5
            }

            political_system = PoliticalSystem(**system_data)
            db.session.add(political_system)
            db.session.commit()

            logger.info(f"政治体系已保存到数据库: {political_system.name} (ID: {political_system.id})")
            generation_logger.log_step4_save('political_system', political_system.name, system_data, {
                'success': True,
                'political_system_id': political_system.id
            })

            if source_chapters and project_id:
                from app.services.chapter_appearance_service import chapter_appearance_service
                chapter_appearance_service.create_appearances_from_source(
                    project_id=project_id,
                    entity_type='political_system',
                    entity_id=political_system.id,
                    source_chapters=source_chapters,
                    appearance_type='首次出现'
                )

            return {
                'success': True,
                'political_system_id': political_system.id,
                'political_system': political_system.to_dict()
            }

        except Exception as e:
            logger.error(f"保存政治体系失败: {e}")
            return {
                'success': False,
                'error': str(e)
            }

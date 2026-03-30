"""
经济体系生成器
生成经济体系设定
"""
from typing import Dict, Any, Optional
import logging

from .base_generator import BaseGenerator
from logs import generation_logger

logger = logging.getLogger(__name__)


class EconomicSystemGenerator(BaseGenerator):
    """经济体系生成器"""

    def __init__(self):
        super().__init__('economic_system')

    def save_to_database(self, data: Dict[str, Any],
                       world_id: Optional[int] = None,
                       project_id: Optional[int] = None,
                       source_chapters: Any = None) -> Dict[str, Any]:
        """
        保存经济体系数据到数据库
        """
        try:
            from app.models import EconomicSystem
            from app import db

            system_data = {
                'world_id': world_id,
                'civilization_id': data.get('civilization_id'),
                'name': data.get('name', '未命名经济体系'),
                'economic_model': data.get('economic_model', '市场经济'),
                'description': data.get('description', ''),
                'currency_name': data.get('currency_name', ''),
                'currency_material': data.get('currency_material', ''),
                'denomination_system': data.get('denomination_system', ''),
                'exchange_rates': data.get('exchange_rates', ''),
                'major_industries': data.get('major_industries', ''),
                'trade_routes': data.get('trade_routes', ''),
                'trade_partners': data.get('trade_partners', ''),
                'resource_dependencies': data.get('resource_dependencies', ''),
                'wealth_distribution': data.get('wealth_distribution', ''),
                'taxation_system': data.get('taxation_system', ''),
                'banking_system': data.get('banking_system', ''),
                'economic_challenges': data.get('economic_challenges', ''),
                'importance_level': int(data.get('importance_level', 5)) if data.get('importance_level') else 5
            }

            economic_system = EconomicSystem(**system_data)
            db.session.add(economic_system)
            db.session.commit()

            logger.info(f"经济体系已保存到数据库: {economic_system.name} (ID: {economic_system.id})")
            generation_logger.log_step4_save('economic_system', economic_system.name, system_data, {
                'success': True,
                'economic_system_id': economic_system.id
            })

            if source_chapters and project_id:
                from app.services.chapter_appearance_service import chapter_appearance_service
                chapter_appearance_service.create_appearances_from_source(
                    project_id=project_id,
                    entity_type='economic_system',
                    entity_id=economic_system.id,
                    source_chapters=source_chapters,
                    appearance_type='首次出现'
                )

            return {
                'success': True,
                'economic_system_id': economic_system.id,
                'economic_system': economic_system.to_dict()
            }

        except Exception as e:
            logger.error(f"保存经济体系失败: {e}")
            return {
                'success': False,
                'error': str(e)
            }

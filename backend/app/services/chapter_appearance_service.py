"""
章节出现索引服务
用于维护世界观实体与章节的关联关系
"""
import logging
from typing import Dict, Any, Optional, List
from app import db
from app.models import EntityChapterAppearance, Chapter

logger = logging.getLogger(__name__)


class ChapterAppearanceService:
    """章节出现索引服务"""

    ENTITY_TYPE_MAP = {
        'character': 'character',
        'location': 'location',
        'item': 'item',
        'faction': 'faction',
        'civilization': 'civilization',
        'historical_event': 'historical_event',
        'historical_figure': 'historical_figure',
        'dimension': 'dimension',
        'region': 'region',
        'energy_system': 'energy_system',
        'power_level': 'power_level',
        'common_skill': 'common_skill',
    }

    @classmethod
    def create_appearance(cls,
                         project_id: int,
                         chapter_id: int,
                         entity_type: str,
                         entity_id: int,
                         appearance_type: str = '提及',
                         description: str = '') -> Optional[EntityChapterAppearance]:
        """
        创建章节出现记录

        Args:
            project_id: 项目ID
            chapter_id: 章节ID
            entity_type: 实体类型
            entity_id: 实体ID
            appearance_type: 出现类型
            description: 描述

        Returns:
            创建的记录或None
        """
        try:
            existing = EntityChapterAppearance.query.filter_by(
                chapter_id=chapter_id,
                entity_type=entity_type,
                entity_id=entity_id
            ).first()

            if existing:
                existing.appearance_type = appearance_type
                existing.description = description
                db.session.commit()
                logger.debug(f"更新章节出现记录: {entity_type}:{entity_id} -> 章节:{chapter_id}")
                return existing

            appearance = EntityChapterAppearance(
                project_id=project_id,
                chapter_id=chapter_id,
                entity_type=entity_type,
                entity_id=entity_id,
                appearance_type=appearance_type,
                description=description
            )
            db.session.add(appearance)
            db.session.commit()
            logger.debug(f"创建章节出现记录: {entity_type}:{entity_id} -> 章节:{chapter_id}")
            return appearance

        except Exception as e:
            logger.error(f"创建章节出现记录失败: {e}")
            db.session.rollback()
            return None

    @classmethod
    def create_appearances_from_source(cls,
                                      project_id: int,
                                      entity_type: str,
                                      entity_id: int,
                                      source_chapters: List[Dict[str, Any]],
                                      appearance_type: str = '提及') -> int:
        """
        从来源章节列表批量创建出现记录

        Args:
            project_id: 项目ID
            entity_type: 实体类型
            entity_id: 实体ID
            source_chapters: 来源章节列表，格式: [{'type': 'chapter', 'id': 1, 'title': '...'}, ...]
            appearance_type: 出现类型

        Returns:
            创建的记录数量
        """
        if not source_chapters:
            return 0

        created_count = 0
        for source in source_chapters:
            if isinstance(source, str):
                try:
                    source = {'type': 'chapter', 'id': int(source), 'title': ''}
                except (ValueError, TypeError):
                    continue
            if isinstance(source, dict) and source.get('type') == 'chapter':
                chapter_id = source.get('id')
                if chapter_id:
                    appearance = cls.create_appearance(
                        project_id=project_id,
                        chapter_id=chapter_id,
                        entity_type=entity_type,
                        entity_id=entity_id,
                        appearance_type=appearance_type,
                        description=f"来自章纲《{source.get('title', '')}》的提取"
                    )
                    if appearance:
                        created_count += 1

        return created_count

    @classmethod
    def update_appearances_for_entity(cls,
                                     project_id: int,
                                     entity_type: str,
                                     entity_id: int,
                                     chapter_ids: List[int],
                                     appearance_type: str = '提及') -> int:
        """
        更新实体的章节出现记录（替换模式）

        Args:
            project_id: 项目ID
            entity_type: 实体类型
            entity_id: 实体ID
            chapter_ids: 章节ID列表
            appearance_type: 出现类型

        Returns:
            更新后的记录数量
        """
        try:
            EntityChapterAppearance.query.filter_by(
                entity_type=entity_type,
                entity_id=entity_id
            ).delete()

            created_count = 0
            for chapter_id in chapter_ids:
                appearance = EntityChapterAppearance(
                    project_id=project_id,
                    chapter_id=chapter_id,
                    entity_type=entity_type,
                    entity_id=entity_id,
                    appearance_type=appearance_type
                )
                db.session.add(appearance)
                created_count += 1

            db.session.commit()
            return created_count

        except Exception as e:
            logger.error(f"更新章节出现记录失败: {e}")
            db.session.rollback()
            return 0

    @classmethod
    def delete_appearances_for_entity(cls, entity_type: str, entity_id: int) -> bool:
        """
        删除实体的所有章节出现记录

        Args:
            entity_type: 实体类型
            entity_id: 实体ID

        Returns:
            是否成功
        """
        try:
            EntityChapterAppearance.query.filter_by(
                entity_type=entity_type,
                entity_id=entity_id
            ).delete()
            db.session.commit()
            return True
        except Exception as e:
            logger.error(f"删除章节出现记录失败: {e}")
            db.session.rollback()
            return False

    @classmethod
    def get_entity_appearances(cls, entity_type: str, entity_id: int) -> List[Dict]:
        """
        获取实体的所有章节出现记录

        Args:
            entity_type: 实体类型
            entity_id: 实体ID

        Returns:
            出现记录列表
        """
        appearances = EntityChapterAppearance.query.filter_by(
            entity_type=entity_type,
            entity_id=entity_id
        ).all()

        result = []
        for app in appearances:
            app_dict = app.to_dict()
            chapter = Chapter.query.get(app.chapter_id)
            if chapter:
                app_dict['chapter_title'] = chapter.title
                app_dict['chapter_order'] = chapter.order_index
                app_dict['volume'] = chapter.volume
                app_dict['volume_id'] = chapter.volume_id
            result.append(app_dict)

        result.sort(key=lambda x: x.get('chapter_order', 0))
        return result

    @classmethod
    def get_chapter_entities(cls, chapter_id: int) -> List[Dict]:
        """
        获取章节中出现的所有实体

        Args:
            chapter_id: 章节ID

        Returns:
            实体列表
        """
        appearances = EntityChapterAppearance.query.filter_by(chapter_id=chapter_id).all()
        return [app.to_dict() for app in appearances]

    @classmethod
    def normalize_entity_type(cls, entity_type: str) -> str:
        """
        标准化实体类型名称

        Args:
            entity_type: 原始实体类型

        Returns:
            标准化后的实体类型
        """
        type_mapping = {
            'characters': 'character',
            'locations': 'location',
            'items': 'item',
            'factions': 'faction',
            'civilizations': 'civilization',
            'historical_events': 'historical_event',
            'historical_eras': 'historical_era',
            'historical_figures': 'historical_figure',
            'dimensions': 'dimension',
            'regions': 'region',
            'energy_systems': 'energy_system',
            'power_levels': 'power_level',
            'common_skills': 'common_skill',
            'timelines': 'timeline',
            'celestial_bodies': 'celestial_body',
            'natural_laws': 'natural_law',
            'social_classes': 'social_class',
            'political_systems': 'political_system',
            'economic_systems': 'economic_system',
            'cultural_customs': 'cultural_custom',
            'relations': 'relation',
        }
        return type_mapping.get(entity_type, entity_type)


chapter_appearance_service = ChapterAppearanceService()

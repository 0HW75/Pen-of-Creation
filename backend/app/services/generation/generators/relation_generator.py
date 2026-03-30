"""
关系网络生成器
用于生成角色关系、势力关系等关系网络设定
"""
from typing import Dict, Any, Optional
import logging

from .base_generator import BaseGenerator
from app import db

logger = logging.getLogger(__name__)


class RelationGenerator(BaseGenerator):
    """关系网络生成器"""
    
    def __init__(self):
        super().__init__('relation')
    
    def save_to_database(self, data: Dict[str, Any],
                        world_id: Optional[int] = None,
                        project_id: Optional[int] = None,
                        source_chapters: Any = None) -> Dict[str, Any]:
        """
        保存生成的关系数据到数据库

        Args:
            data: 生成的关系数据
            world_id: 世界观ID
            project_id: 项目ID
            source_chapters: 来源章节列表

        Returns:
            保存结果
        """
        try:
            from app.models import Relationship, Character, Location, Faction, Item
            from app import db

            relation_name = data.get('name', '未命名关系')
            participants = data.get('participants', [])
            relation_type = data.get('relation_type', '未知')
            description = data.get('description', '')
            relation_nature = data.get('relation_nature', '')
            relation_strength = data.get('relation_strength', '')
            formation_reason = data.get('formation_reason', '')
            development_history = data.get('development_history', '')
            current_state = data.get('current_state', '')
            key_events = data.get('key_events', '')

            full_description = f"{relation_nature}\n{relation_strength}\n{formation_reason}\n{development_history}\n{current_state}\n{key_events}".strip()
            if len(full_description) > 5000:
                full_description = full_description[:5000]

            saved_relations = []

            if participants and len(participants) >= 2:
                if isinstance(participants[0], str):
                    participant_names = [p.split('（')[0].strip() if '（' in p else p.strip() for p in participants]
                else:
                    participant_names = [p.get('name', '') for p in participants]

                for i in range(len(participant_names) - 1):
                    source_name = participant_names[i]
                    target_name = participant_names[i + 1]

                    source_type, source_id = self._find_entity(source_name, project_id, world_id)
                    target_type, target_id = self._find_entity(target_name, project_id, world_id)

                    if source_type and target_id:
                        strength = self._parse_strength(relation_strength)

                        relationship = Relationship(
                            project_id=project_id,
                            world_id=world_id,
                            name=relation_name,
                            source_type=source_type,
                            source_id=source_id,
                            target_type=target_type,
                            target_id=target_id,
                            relationship_type=relation_type,
                            strength=strength,
                            description=full_description or description,
                            importance_level=int(data.get('importance_level', 5)) if data.get('importance_level') else 5
                        )
                        db.session.add(relationship)
                        saved_relations.append(f"{source_name} -> {target_name}")
                    else:
                        logger.warning(f"无法找到关系参与方: {source_name} (type={source_type}, id={source_id}) 或 {target_name} (type={target_type}, id={target_id})")

                if saved_relations:
                    db.session.commit()
                    logger.info(f"关系网络已保存: {relation_name}, 包含 {len(saved_relations)} 条关系")
                    return {
                        'success': True,
                        'relation_id': None,
                        'message': f'关系网络已保存，包含 {len(saved_relations)} 条关系',
                        'relations': saved_relations
                    }
                else:
                    logger.warning(f"无法找到任何关系参与方: {relation_name}")
                    return {
                        'success': False,
                        'error': f'无法找到关系参与方，参与者: {participant_names}'
                    }
            else:
                logger.warning(f"关系数据缺少参与者信息: {relation_name}")
                return {
                    'success': False,
                    'error': '关系数据缺少参与者信息'
                }

        except Exception as e:
            logger.error(f"保存关系网络失败: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def _find_entity(self, name: str, project_id: int, world_id: int):
        """查找实体ID"""
        from app.models import Character, Location, Faction, Item

        clean_name = name.split('（')[0].split('(')[0].strip()

        char = Character.query.filter(
            Character.project_id == project_id,
            (Character.name == clean_name) | (Character.name.like(f'%{clean_name}%'))
        ).first()
        if char:
            return ('character', char.id)

        loc = Location.query.filter(
            Location.project_id == project_id,
            (Location.name == clean_name) | (Location.name.like(f'%{clean_name}%'))
        ).first()
        if loc:
            return ('location', loc.id)

        faction = Faction.query.filter(
            Faction.project_id == project_id,
            (Faction.name == clean_name) | (Faction.name.like(f'%{clean_name}%'))
        ).first()
        if faction:
            return ('faction', faction.id)

        item = Item.query.filter(
            Item.project_id == project_id,
            (Item.name == clean_name) | (Item.name.like(f'%{clean_name}%'))
        ).first()
        if item:
            return ('item', item.id)

        return (None, None)

    def _parse_strength(self, strength_str: str) -> int:
        """解析关系强度"""
        if not strength_str:
            return 5

        strength_map = {
            '极弱': 1, '很弱': 2, '较弱': 3, '一般': 5, '较强': 7, '很强': 8, '极强': 10,
            '微弱': 2, '中等': 5, '强烈': 8, '强烈': 9, '绝对': 10
        }

        for key, value in strength_map.items():
            if key in strength_str:
                return value

        import re
        match = re.search(r'\d+', strength_str)
        if match:
            return min(10, max(1, int(match.group())))

        return 5

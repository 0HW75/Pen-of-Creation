"""
角色生成器
生成角色设定
"""
from typing import Dict, Any, Optional
import logging

from .base_generator import BaseGenerator

logger = logging.getLogger(__name__)


class CharacterGenerator(BaseGenerator):
    """角色生成器"""
    
    def __init__(self):
        super().__init__('character')
    
    def save_to_database(self, data: Dict[str, Any],
                        world_id: Optional[int] = None,
                        project_id: Optional[int] = None) -> Dict[str, Any]:
        """
        保存角色数据到数据库
        
        Args:
            data: 生成的角色数据
            world_id: 世界观ID
            project_id: 项目ID
        
        Returns:
            保存结果
        """
        try:
            from app.models import Character
            from app import db
            
            # 准备角色数据
            character_data = {
                'world_id': world_id,
                'project_id': project_id,
                'name': data.get('name', '未命名角色'),
                'race': data.get('race', ''),
                'gender': data.get('gender', ''),
                'age': int(data.get('age', 0)) if data.get('age') else 0,
                'description': data.get('description', ''),
                'appearance': data.get('appearance', ''),
                'appearance_age': int(data.get('appearance_age', 0)) if data.get('appearance_age') else 0,
                'distinguishing_features': data.get('distinguishing_features', ''),
                'personality': data.get('personality', ''),
                'background': data.get('background', ''),
                'character_arc': data.get('character_arc', ''),
                'motivation': data.get('motivation', ''),
                'secrets': data.get('secrets', ''),
                'birthplace': data.get('birthplace', ''),
                'nationality': data.get('nationality', ''),
                'occupation': data.get('occupation', ''),
                'faction': data.get('faction', ''),
                'current_location': data.get('current_location', ''),
                'core_traits': data.get('core_traits', ''),
                'psychological_fear': data.get('psychological_fear', ''),
                'values': data.get('values', ''),
                'growth_experience': data.get('growth_experience', ''),
                'important_turning_points': data.get('important_turning_points', ''),
                'psychological_trauma': data.get('psychological_trauma', ''),
                'physical_abilities': data.get('physical_abilities', ''),
                'intelligence_perception': data.get('intelligence_perception', ''),
                'special_talents': data.get('special_talents', ''),
                'current_level': data.get('current_level', ''),
                'special_abilities': data.get('special_abilities', ''),
                'ability_levels': data.get('ability_levels', ''),
                'ability_limits': data.get('ability_limits', ''),
                'growth_path': data.get('growth_path', ''),
                'common_equipment': data.get('common_equipment', ''),
                'special_items': data.get('special_items', ''),
                'personal_items': data.get('personal_items', ''),
                'key_items': data.get('key_items', ''),
                'family_members': data.get('family_members', ''),
                'family_background': data.get('family_background', ''),
                'close_friends': data.get('close_friends', ''),
                'mentor_student': data.get('mentor_student', ''),
                'colleagues': data.get('colleagues', ''),
                'grudges': data.get('grudges', ''),
                'love_relationships': data.get('love_relationships', ''),
                'complex_emotions': data.get('complex_emotions', ''),
                'unrequited_love': data.get('unrequited_love', ''),
                'emotional_changes': data.get('emotional_changes', '')
            }
            
            # 创建角色对象
            character = Character(**character_data)
            db.session.add(character)
            db.session.commit()
            
            logger.info(f"角色已保存到数据库: {character.name} (ID: {character.id})")
            
            return {
                'success': True,
                'character_id': character.id,
                'character': character.to_dict()
            }
            
        except Exception as e:
            logger.error(f"保存角色失败: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def generate_with_relationships(self,
                                   prompt: str,
                                   world_id: Optional[int] = None,
                                   project_id: Optional[int] = None,
                                   existing_character_ids: Optional[list] = None,
                                   **kwargs) -> Dict[str, Any]:
        """
        生成角色并建立关系
        
        Args:
            prompt: 生成提示
            world_id: 世界观ID
            project_id: 项目ID
            existing_character_ids: 现有角色ID列表，用于建立关系
            **kwargs: 其他参数
        
        Returns:
            生成结果
        """
        # 先生成角色
        result = self.generate(
            prompt=prompt,
            world_id=world_id,
            project_id=project_id,
            **kwargs
        )
        
        if not result.get('success'):
            return result
        
        # 如果需要建立关系，保存后建立关系
        if existing_character_ids and result.get('data'):
            # 先保存角色
            save_result = self.save_to_database(
                result['data'],
                world_id=world_id,
                project_id=project_id
            )
            
            if save_result.get('success'):
                new_character_id = save_result['character_id']
                
                # 建立关系（简化实现，实际可能需要更复杂的逻辑）
                try:
                    from app.models import Relationship
                    from app import db
                    
                    for existing_id in existing_character_ids:
                        relationship = Relationship(
                            project_id=project_id,
                            world_id=world_id,
                            name='关联',
                            source_type='character',
                            source_id=new_character_id,
                            target_type='character',
                            target_id=existing_id,
                            relationship_type='关联',
                            description='AI生成的关联关系'
                        )
                        db.session.add(relationship)
                    
                    db.session.commit()
                    result['relationships_created'] = len(existing_character_ids)
                    
                except Exception as e:
                    logger.error(f"建立关系失败: {e}")
                    result['relationship_error'] = str(e)
        
        return result

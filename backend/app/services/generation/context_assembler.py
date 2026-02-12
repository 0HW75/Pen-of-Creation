"""
上下文组装器
组装AI生成设定所需的上下文信息
"""
from typing import Dict, Any, List, Optional
import json
import logging

logger = logging.getLogger(__name__)


class ContextAssembler:
    """上下文组装器"""
    
    def __init__(self):
        self.max_context_length = 4000  # 最大上下文长度
    
    def assemble_context(self,
                        world_id: Optional[int] = None,
                        project_id: Optional[int] = None,
                        include_world_info: bool = True,
                        include_related_entities: Optional[List[str]] = None,
                        custom_context: Optional[Dict[str, Any]] = None) -> Dict[str, str]:
        """
        组装上下文信息
        
        Args:
            world_id: 世界观ID
            project_id: 项目ID
            include_world_info: 是否包含世界观信息
            include_related_entities: 需要包含的相关实体类型列表
            custom_context: 自定义上下文信息
        
        Returns:
            组装好的上下文字典
        """
        context = {}
        
        # 添加世界观信息
        if include_world_info and world_id:
            world_info = self._get_world_info(world_id)
            if world_info:
                context['world_info'] = self._format_world_info(world_info)
        
        # 添加相关实体信息
        if include_related_entities and world_id:
            related_entities = self._get_related_entities(
                world_id, include_related_entities
            )
            if related_entities:
                context['related_entities'] = self._format_related_entities(related_entities)
        
        # 添加自定义上下文
        if custom_context:
            context.update(custom_context)
        
        # 如果没有世界观信息，添加默认提示
        if 'world_info' not in context:
            context['world_info'] = "未指定世界观，请基于通用奇幻/科幻设定进行生成。"
        
        if 'related_entities' not in context:
            context['related_entities'] = "无相关实体信息。"
        
        return context
    
    def _get_world_info(self, world_id: int) -> Optional[Dict[str, Any]]:
        """获取世界观信息"""
        try:
            from app.models import World, WorldSetting
            from app import db
            
            world = db.session.query(World).filter_by(id=world_id).first()
            if not world:
                return None
            
            world_info = world.to_dict()
            
            # 获取详细的世界观设定
            world_setting = db.session.query(WorldSetting).filter_by(
                project_id=world.project_id
            ).first()
            
            if world_setting:
                world_info['setting'] = world_setting.to_dict()
            
            return world_info
            
        except Exception as e:
            logger.error(f"获取世界观信息失败: {e}")
            return None
    
    def _format_world_info(self, world_info: Dict[str, Any]) -> str:
        """格式化世界观信息为文本"""
        lines = []
        
        # 基本信息
        lines.append(f"世界名称: {world_info.get('name', '未命名')}")
        lines.append(f"世界类型: {world_info.get('world_type', '未知')}")
        
        if world_info.get('core_concept'):
            lines.append(f"核心概念: {world_info['core_concept']}")
        
        if world_info.get('description'):
            lines.append(f"世界描述: {world_info['description']}")
        
        if world_info.get('creation_origin'):
            lines.append(f"创世起源: {world_info['creation_origin']}")
        
        if world_info.get('world_essence'):
            lines.append(f"世界本质: {world_info['world_essence']}")
        
        # 详细设定
        setting = world_info.get('setting', {})
        if setting:
            if setting.get('spatial_hierarchy'):
                lines.append(f"空间层级: {setting['spatial_hierarchy']}")
            
            if setting.get('time_system'):
                lines.append(f"时间系统: {setting['time_system']}")
            
            if setting.get('physical_laws'):
                lines.append(f"物理法则: {setting['physical_laws']}")
            
            if setting.get('special_rules'):
                lines.append(f"特殊规则: {setting['special_rules']}")
        
        return "\n".join(lines)
    
    def _get_related_entities(self, world_id: int, 
                             entity_types: List[str]) -> Dict[str, List[Dict]]:
        """获取相关实体信息"""
        related = {}
        
        try:
            from app import db
            
            for entity_type in entity_types:
                entities = []
                
                if entity_type == 'character':
                    from app.models import Character
                    query = db.session.query(Character).filter_by(world_id=world_id)
                    entities = [e.to_dict() for e in query.limit(5).all()]
                
                elif entity_type == 'location':
                    from app.models import Location
                    query = db.session.query(Location).filter_by(world_id=world_id)
                    entities = [e.to_dict() for e in query.limit(5).all()]
                
                elif entity_type == 'faction':
                    from app.models import Faction
                    query = db.session.query(Faction).filter_by(world_id=world_id)
                    entities = [e.to_dict() for e in query.limit(5).all()]
                
                elif entity_type == 'item':
                    from app.models import Item
                    query = db.session.query(Item).filter_by(world_id=world_id)
                    entities = [e.to_dict() for e in query.limit(5).all()]
                
                elif entity_type == 'civilization':
                    from app.models import Civilization
                    query = db.session.query(Civilization).filter_by(world_id=world_id)
                    entities = [e.to_dict() for e in query.limit(5).all()]
                
                elif entity_type == 'energy_system':
                    from app.models import EnergySystem
                    query = db.session.query(EnergySystem).filter_by(world_id=world_id)
                    entities = [e.to_dict() for e in query.limit(5).all()]
                
                if entities:
                    related[entity_type] = entities
                    
        except Exception as e:
            logger.error(f"获取相关实体失败: {e}")
        
        return related
    
    def _format_related_entities(self, related_entities: Dict[str, List[Dict]]) -> str:
        """格式化相关实体信息为文本"""
        lines = []
        
        for entity_type, entities in related_entities.items():
            if not entities:
                continue
            
            lines.append(f"\n【{self._get_entity_type_name(entity_type)}】")
            
            for entity in entities:
                name = entity.get('name', '未命名')
                desc = entity.get('description', '')
                if desc:
                    # 限制描述长度
                    if len(desc) > 100:
                        desc = desc[:100] + "..."
                    lines.append(f"- {name}: {desc}")
                else:
                    lines.append(f"- {name}")
        
        return "\n".join(lines)
    
    def _get_entity_type_name(self, entity_type: str) -> str:
        """获取实体类型的中文名称"""
        names = {
            'character': '角色',
            'location': '地点',
            'item': '物品',
            'faction': '势力',
            'civilization': '文明',
            'energy_system': '能量体系',
            'region': '区域',
            'dimension': '维度',
            'historical_event': '历史事件'
        }
        return names.get(entity_type, entity_type)
    
    def build_prompt_variables(self,
                              user_prompt: str,
                              style: str = "",
                              world_id: Optional[int] = None,
                              project_id: Optional[int] = None,
                              include_world_info: bool = True,
                              include_related_entities: Optional[List[str]] = None,
                              custom_context: Optional[Dict[str, Any]] = None) -> Dict[str, str]:
        """
        构建提示词变量
        
        Args:
            user_prompt: 用户输入的提示
            style: 风格要求
            world_id: 世界观ID
            project_id: 项目ID
            include_world_info: 是否包含世界观信息
            include_related_entities: 需要包含的相关实体类型
            custom_context: 自定义上下文
        
        Returns:
            提示词变量字典
        """
        # 组装上下文
        context = self.assemble_context(
            world_id=world_id,
            project_id=project_id,
            include_world_info=include_world_info,
            include_related_entities=include_related_entities,
            custom_context=custom_context
        )
        
        # 构建变量
        variables = {
            'prompt': user_prompt,
            'style': style or "根据世界观自然发挥",
            'world_info': context.get('world_info', ''),
            'related_entities': context.get('related_entities', '')
        }
        
        # 添加其他自定义变量
        for key, value in context.items():
            if key not in variables:
                variables[key] = value
        
        return variables
    
    def truncate_context(self, context: str, max_length: Optional[int] = None) -> str:
        """
        截断上下文以适应长度限制
        
        Args:
            context: 上下文文本
            max_length: 最大长度，默认使用self.max_context_length
        
        Returns:
            截断后的文本
        """
        if max_length is None:
            max_length = self.max_context_length
        
        if len(context) <= max_length:
            return context
        
        # 保留开头和结尾，中间用省略号
        half_length = (max_length - 100) // 2
        return context[:half_length] + "\n\n... [内容已截断] ...\n\n" + context[-half_length:]


# 创建全局上下文组装器实例
context_assembler = ContextAssembler()

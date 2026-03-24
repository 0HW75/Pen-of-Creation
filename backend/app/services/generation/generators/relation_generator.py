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
                        project_id: Optional[int] = None) -> Dict[str, Any]:
        """
        保存生成的关系数据到数据库
        
        Args:
            data: 生成的关系数据
            world_id: 世界观ID
            project_id: 项目ID
        
        Returns:
            保存结果
        """
        try:
            # 关系网络通常是作为其他实体的属性保存
            # 这里返回成功，实际的关系数据会在保存角色/势力时处理
            logger.info(f"关系网络数据已准备: {data.get('name', '未命名')}")
            return {
                'success': True,
                'message': '关系网络数据已准备（作为关联数据保存）',
                'data': data
            }
        except Exception as e:
            logger.error(f"保存关系网络失败: {e}")
            return {
                'success': False,
                'error': str(e)
            }

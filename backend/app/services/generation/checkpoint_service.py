"""
检查点服务 - 管理AI生成过程的检查点保存和恢复
"""
import json
import logging
from typing import Dict, Optional, List, Any
from datetime import datetime, timedelta
from app import db
from app.models import AIGenerationCheckpoint

logger = logging.getLogger(__name__)


class CheckpointService:
    """
    检查点服务类
    
    提供检查点的保存、加载、列表查询、删除和过期清理功能
    """
    
    # 检查点默认过期时间（7天）
    DEFAULT_EXPIRY_DAYS = 7
    
    def __init__(self):
        """初始化检查点服务"""
        pass
    
    def save_checkpoint(self, 
                       session_id: str,
                       project_id: int,
                       user_id: int,
                       stage: str,
                       checkpoint_type: Optional[str] = None,
                       data: Optional[Dict[str, Any]] = None,
                       progress_percent: int = 0,
                       status: str = "in_progress") -> AIGenerationCheckpoint:
        """
        保存检查点
        
        Args:
            session_id: 会话ID
            project_id: 项目ID
            user_id: 用户ID
            stage: 当前阶段 (extraction/generation)
            checkpoint_type: 检查点类型 (outline/volume/chapter/element)
            data: 检查点数据（将被序列化为JSON）
            progress_percent: 进度百分比
            status: 状态 (in_progress/completed/aborted)
        
        Returns:
            AIGenerationCheckpoint: 保存的检查点对象
        """
        try:
            # 检查是否已存在相同session_id的检查点
            existing = AIGenerationCheckpoint.query.filter_by(
                session_id=session_id
            ).first()
            
            if existing:
                # 更新现有检查点
                existing.stage = stage
                existing.checkpoint_type = checkpoint_type
                existing.checkpoint_data = json.dumps(data, ensure_ascii=False) if data else None
                existing.progress_percent = progress_percent
                existing.status = status
                existing.updated_at = datetime.utcnow()
                existing.expires_at = datetime.utcnow() + timedelta(days=self.DEFAULT_EXPIRY_DAYS)
                checkpoint = existing
                logger.info(f"更新检查点: session_id={session_id}, stage={stage}")
            else:
                # 创建新检查点
                checkpoint = AIGenerationCheckpoint(
                    session_id=session_id,
                    project_id=project_id,
                    user_id=user_id,
                    stage=stage,
                    checkpoint_type=checkpoint_type,
                    checkpoint_data=json.dumps(data, ensure_ascii=False) if data else None,
                    progress_percent=progress_percent,
                    status=status,
                    expires_at=datetime.utcnow() + timedelta(days=self.DEFAULT_EXPIRY_DAYS)
                )
                db.session.add(checkpoint)
                logger.info(f"创建新检查点: session_id={session_id}, stage={stage}")
            
            db.session.commit()
            return checkpoint
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"保存检查点失败: {e}")
            raise
    
    def load_checkpoint(self, checkpoint_id: int) -> Optional[Dict[str, Any]]:
        """
        加载检查点
        
        Args:
            checkpoint_id: 检查点ID
        
        Returns:
            dict 或 None: 检查点数据字典
        """
        try:
            checkpoint = AIGenerationCheckpoint.query.get(checkpoint_id)
            if not checkpoint:
                logger.warning(f"检查点不存在: {checkpoint_id}")
                return None
            
            # 解析检查点数据
            data = None
            if checkpoint.checkpoint_data:
                try:
                    data = json.loads(checkpoint.checkpoint_data)
                except json.JSONDecodeError as e:
                    logger.error(f"解析检查点数据失败: {e}")
                    data = None
            
            result = checkpoint.to_dict()
            result['parsed_data'] = data
            
            logger.info(f"加载检查点: {checkpoint_id}")
            return result
            
        except Exception as e:
            logger.error(f"加载检查点失败: {e}")
            return None
    
    def load_checkpoint_by_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        通过会话ID加载检查点
        
        Args:
            session_id: 会话ID
        
        Returns:
            dict 或 None: 检查点数据字典
        """
        try:
            checkpoint = AIGenerationCheckpoint.query.filter_by(
                session_id=session_id
            ).first()
            
            if not checkpoint:
                logger.warning(f"会话的检查点不存在: {session_id}")
                return None
            
            # 解析检查点数据
            data = None
            if checkpoint.checkpoint_data:
                try:
                    data = json.loads(checkpoint.checkpoint_data)
                except json.JSONDecodeError as e:
                    logger.error(f"解析检查点数据失败: {e}")
                    data = None
            
            result = checkpoint.to_dict()
            result['parsed_data'] = data
            
            logger.info(f"加载会话检查点: session_id={session_id}")
            return result
            
        except Exception as e:
            logger.error(f"加载会话检查点失败: {e}")
            return None
    
    def list_checkpoints(self, 
                        project_id: Optional[int] = None,
                        user_id: Optional[int] = None,
                        stage: Optional[str] = None,
                        status: Optional[str] = None,
                        limit: int = 50,
                        offset: int = 0) -> Dict[str, Any]:
        """
        列出检查点
        
        Args:
            project_id: 可选的项目ID过滤
            user_id: 可选的用户ID过滤
            stage: 可选的阶段过滤
            status: 可选的状态过滤
            limit: 返回数量限制
            offset: 偏移量
        
        Returns:
            dict: 包含检查点列表和总数的字典
        """
        try:
            query = AIGenerationCheckpoint.query
            
            if project_id is not None:
                query = query.filter_by(project_id=project_id)
            if user_id is not None:
                query = query.filter_by(user_id=user_id)
            if stage is not None:
                query = query.filter_by(stage=stage)
            if status is not None:
                query = query.filter_by(status=status)
            
            # 按创建时间倒序排列
            query = query.order_by(AIGenerationCheckpoint.created_at.desc())
            
            total = query.count()
            checkpoints = query.offset(offset).limit(limit).all()
            
            result = []
            for cp in checkpoints:
                cp_dict = cp.to_dict()
                # 尝试解析数据以获取摘要
                if cp.checkpoint_data:
                    try:
                        parsed = json.loads(cp.checkpoint_data)
                        # 添加数据摘要
                        if isinstance(parsed, dict):
                            cp_dict['data_summary'] = self._generate_data_summary(parsed)
                    except:
                        pass
                result.append(cp_dict)
            
            logger.info(f"列出检查点: 总数={total}, 返回={len(result)}")
            
            return {
                'total': total,
                'checkpoints': result,
                'limit': limit,
                'offset': offset
            }
            
        except Exception as e:
            logger.error(f"列出检查点失败: {e}")
            return {'total': 0, 'checkpoints': [], 'limit': limit, 'offset': offset}
    
    def delete_checkpoint(self, checkpoint_id: int) -> bool:
        """
        删除检查点
        
        Args:
            checkpoint_id: 检查点ID
        
        Returns:
            bool: 是否成功删除
        """
        try:
            checkpoint = AIGenerationCheckpoint.query.get(checkpoint_id)
            if not checkpoint:
                logger.warning(f"删除失败，检查点不存在: {checkpoint_id}")
                return False
            
            db.session.delete(checkpoint)
            db.session.commit()
            logger.info(f"删除检查点: {checkpoint_id}")
            return True
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"删除检查点失败: {e}")
            return False
    
    def delete_checkpoints_by_session(self, session_id: str) -> int:
        """
        删除会话的所有检查点
        
        Args:
            session_id: 会话ID
        
        Returns:
            int: 删除的检查点数量
        """
        try:
            checkpoints = AIGenerationCheckpoint.query.filter_by(
                session_id=session_id
            ).all()
            
            count = len(checkpoints)
            for cp in checkpoints:
                db.session.delete(cp)
            
            db.session.commit()
            logger.info(f"删除会话检查点: session_id={session_id}, 数量={count}")
            return count
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"删除会话检查点失败: {e}")
            return 0
    
    def cleanup_expired_checkpoints(self) -> int:
        """
        清理过期检查点
        
        Returns:
            int: 清理的检查点数量
        """
        try:
            now = datetime.utcnow()
            expired = AIGenerationCheckpoint.query.filter(
                AIGenerationCheckpoint.expires_at < now
            ).all()
            
            count = len(expired)
            for cp in expired:
                db.session.delete(cp)
            
            db.session.commit()
            logger.info(f"清理过期检查点: {count} 个")
            return count
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"清理过期检查点失败: {e}")
            return 0
    
    def update_checkpoint_status(self, 
                                 checkpoint_id: int,
                                 status: str) -> bool:
        """
        更新检查点状态
        
        Args:
            checkpoint_id: 检查点ID
            status: 新状态
        
        Returns:
            bool: 是否成功更新
        """
        try:
            checkpoint = AIGenerationCheckpoint.query.get(checkpoint_id)
            if not checkpoint:
                return False
            
            checkpoint.status = status
            checkpoint.updated_at = datetime.utcnow()
            db.session.commit()
            
            logger.info(f"更新检查点状态: {checkpoint_id} -> {status}")
            return True
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"更新检查点状态失败: {e}")
            return False
    
    def save_generation_progress(self,
                                 session_id: str,
                                 project_id: int,
                                 user_id: int,
                                 stage: str,
                                 elements: List[Dict[str, Any]],
                                 current_index: int,
                                 results: List[Dict[str, Any]],
                                 story_context: Optional[Dict[str, Any]] = None,
                                 batch_config: Optional[Dict[str, Any]] = None) -> AIGenerationCheckpoint:
        """
        保存生成进度（专门用于批次生成）
        
        Args:
            session_id: 会话ID
            project_id: 项目ID
            user_id: 用户ID
            stage: 阶段
            elements: 所有要生成的元素列表
            current_index: 当前处理到的索引
            results: 已生成的结果列表
            story_context: 故事上下文
            batch_config: 批次配置
        
        Returns:
            AIGenerationCheckpoint: 保存的检查点
        """
        data = {
            'elements': elements,
            'current_index': current_index,
            'completed_count': len(results),
            'total_count': len(elements),
            'results': results,
            'story_context': story_context,
            'batch_config': batch_config,
            'saved_at': datetime.utcnow().isoformat()
        }
        
        progress_percent = int((current_index / len(elements)) * 100) if elements else 0
        
        return self.save_checkpoint(
            session_id=session_id,
            project_id=project_id,
            user_id=user_id,
            stage=stage,
            checkpoint_type='generation_progress',
            data=data,
            progress_percent=progress_percent,
            status='in_progress'
        )
    
    def load_generation_progress(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        加载生成进度
        
        Args:
            session_id: 会话ID
        
        Returns:
            dict 或 None: 生成进度数据
        """
        checkpoint_data = self.load_checkpoint_by_session(session_id)
        if not checkpoint_data:
            return None
        
        parsed_data = checkpoint_data.get('parsed_data')
        if not parsed_data:
            return None
        
        return {
            'checkpoint_id': checkpoint_data.get('id'),
            'session_id': checkpoint_data.get('session_id'),
            'project_id': checkpoint_data.get('project_id'),
            'user_id': checkpoint_data.get('user_id'),
            'stage': checkpoint_data.get('stage'),
            'status': checkpoint_data.get('status'),
            'progress_percent': checkpoint_data.get('progress_percent'),
            'elements': parsed_data.get('elements', []),
            'current_index': parsed_data.get('current_index', 0),
            'completed_count': parsed_data.get('completed_count', 0),
            'total_count': parsed_data.get('total_count', 0),
            'results': parsed_data.get('results', []),
            'story_context': parsed_data.get('story_context', {}),
            'batch_config': parsed_data.get('batch_config', {}),
            'created_at': checkpoint_data.get('created_at'),
            'updated_at': checkpoint_data.get('updated_at')
        }
    
    def _generate_data_summary(self, data: Dict[str, Any]) -> str:
        """
        生成数据摘要
        
        Args:
            data: 检查点数据
        
        Returns:
            str: 数据摘要
        """
        summaries = []
        
        if 'elements' in data:
            elements = data['elements']
            if isinstance(elements, list):
                summaries.append(f"元素: {len(elements)}个")
        
        if 'current_index' in data:
            current = data['current_index']
            total = data.get('total_count', 0)
            summaries.append(f"进度: {current}/{total}")
        
        if 'results' in data:
            results = data['results']
            if isinstance(results, list):
                success_count = sum(1 for r in results if r.get('success'))
                summaries.append(f"成功: {success_count}/{len(results)}")
        
        return ', '.join(summaries) if summaries else '无摘要'


# 全局检查点服务实例
checkpoint_service = CheckpointService()

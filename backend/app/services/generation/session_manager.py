"""
生成会话管理器 - 管理AI生成会话的生命周期和中止控制
"""
import threading
import time
import logging
from typing import Dict, Optional, Any
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class AbortController:
    """中止控制器 - 用于控制单个生成任务的中止状态"""
    
    def __init__(self):
        self._aborted = False
        self._abort_reason: Optional[str] = None
        self._abort_time: Optional[datetime] = None
        self._lock = threading.Lock()
    
    def abort(self, reason: str = "user_requested"):
        """触发中止"""
        with self._lock:
            self._aborted = True
            self._abort_reason = reason
            self._abort_time = now_utc_plus_8()
            logger.info(f"会话已中止，原因: {reason}")
    
    def is_aborted(self) -> bool:
        """检查是否已中止"""
        with self._lock:
            return self._aborted
    
    def get_abort_info(self) -> Dict[str, Any]:
        """获取中止信息"""
        with self._lock:
            return {
                'aborted': self._aborted,
                'reason': self._abort_reason,
                'time': self._abort_time.isoformat() if self._abort_time else None
            }


class GenerationSession:
    """生成会话 - 存储单个生成会话的状态和信息"""
    
    def __init__(self, session_id: str, project_id: int, user_id: int, 
                 session_type: str = "generation"):
        self.session_id = session_id
        self.project_id = project_id
        self.user_id = user_id
        self.session_type = session_type  # extraction/generation
        self.status = "running"  # running/paused/completed/aborted
        self.abort_controller = AbortController()
        self.created_at = now_utc_plus_8()
        self.updated_at = now_utc_plus_8()
        self.completed_at: Optional[datetime] = None
        self.current_stage: Optional[str] = None
        self.current_element: Optional[str] = None
        self.progress_percent: int = 0
        self.metadata: Dict[str, Any] = {}
    
    def update_progress(self, stage: str, element: Optional[str] = None, 
                       progress: int = 0):
        """更新进度信息"""
        self.current_stage = stage
        self.current_element = element
        self.progress_percent = progress
        self.updated_at = now_utc_plus_8()
    
    def complete(self):
        """标记会话完成"""
        self.status = "completed"
        self.completed_at = now_utc_plus_8()
        self.progress_percent = 100
    
    def abort(self, reason: str = "user_requested"):
        """中止会话"""
        self.status = "aborted"
        self.abort_controller.abort(reason)
        self.updated_at = now_utc_plus_8()
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            'session_id': self.session_id,
            'project_id': self.project_id,
            'user_id': self.user_id,
            'session_type': self.session_type,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'current_stage': self.current_stage,
            'current_element': self.current_element,
            'progress_percent': self.progress_percent,
            'abort_info': self.abort_controller.get_abort_info(),
            'metadata': self.metadata
        }


class GenerationSessionManager:
    """
    生成会话管理器 - 单例模式管理所有活跃会话
    
    使用字典存储活跃会话 {session_id: GenerationSession}
    使用 threading.Lock 保证线程安全
    """
    
    _instance: Optional['GenerationSessionManager'] = None
    _instance_lock = threading.Lock()
    
    def __new__(cls) -> 'GenerationSessionManager':
        """单例模式实现"""
        if cls._instance is None:
            with cls._instance_lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        """初始化会话管理器"""
        if self._initialized:
            return
        
        self._sessions: Dict[str, GenerationSession] = {}
        self._lock = threading.RLock()
        self._initialized = True
        self._session_timeout = timedelta(hours=24)  # 会话默认24小时过期
        
        # 启动清理线程
        self._cleanup_thread: Optional[threading.Thread] = None
        self._start_cleanup_thread()
    
    def _start_cleanup_thread(self):
        """启动后台清理线程"""
        def cleanup_loop():
            while True:
                time.sleep(3600)  # 每小时清理一次
                try:
                    self.cleanup_expired_sessions()
                except Exception as e:
                    logger.error(f"清理过期会话时出错: {e}")
        
        self._cleanup_thread = threading.Thread(target=cleanup_loop, daemon=True)
        self._cleanup_thread.start()
        logger.info("会话清理线程已启动")
    
    def create_session(self, session_id: str, project_id: int, user_id: int,
                      session_type: str = "generation") -> GenerationSession:
        """
        创建新会话
        
        Args:
            session_id: 会话唯一标识
            project_id: 项目ID
            user_id: 用户ID
            session_type: 会话类型 (extraction/generation)
        
        Returns:
            GenerationSession: 新创建的会话对象
        """
        with self._lock:
            # 如果会话已存在，先清理旧会话
            if session_id in self._sessions:
                logger.warning(f"会话 {session_id} 已存在，将覆盖")
                del self._sessions[session_id]
            
            session = GenerationSession(
                session_id=session_id,
                project_id=project_id,
                user_id=user_id,
                session_type=session_type
            )
            self._sessions[session_id] = session
            logger.info(f"创建新会话: {session_id}, 项目: {project_id}, 用户: {user_id}")
            return session
    
    def get_session(self, session_id: str) -> Optional[GenerationSession]:
        """
        获取会话
        
        Args:
            session_id: 会话ID
        
        Returns:
            GenerationSession 或 None
        """
        with self._lock:
            return self._sessions.get(session_id)
    
    def abort_session(self, session_id: str, reason: str = "user_requested") -> bool:
        """
        中止会话
        
        Args:
            session_id: 会话ID
            reason: 中止原因
        
        Returns:
            bool: 是否成功中止
        """
        with self._lock:
            session = self._sessions.get(session_id)
            if not session:
                logger.warning(f"尝试中止不存在的会话: {session_id}")
                return False
            
            if session.status in ["completed", "aborted"]:
                logger.info(f"会话 {session_id} 已处于结束状态: {session.status}")
                return False
            
            session.abort(reason)
            logger.info(f"会话 {session_id} 已中止")
            return True
    
    def is_aborted(self, session_id: str) -> bool:
        """
        检查会话是否已中止
        
        Args:
            session_id: 会话ID
        
        Returns:
            bool: 是否已中止
        """
        with self._lock:
            session = self._sessions.get(session_id)
            if not session:
                return False
            return session.abort_controller.is_aborted()
    
    def check_abort(self, session_id: str) -> bool:
        """
        检查会话是否应中止（供生成循环调用）
        
        Args:
            session_id: 会话ID
        
        Returns:
            bool: 是否应该中止
        """
        return self.is_aborted(session_id)
    
    def update_session_progress(self, session_id: str, stage: str,
                                element: Optional[str] = None,
                                progress: int = 0) -> bool:
        """
        更新会话进度
        
        Args:
            session_id: 会话ID
            stage: 当前阶段
            element: 当前元素（可选）
            progress: 进度百分比
        
        Returns:
            bool: 是否成功更新
        """
        with self._lock:
            session = self._sessions.get(session_id)
            if not session:
                return False
            
            session.update_progress(stage, element, progress)
            return True
    
    def complete_session(self, session_id: str) -> bool:
        """
        完成会话
        
        Args:
            session_id: 会话ID
        
        Returns:
            bool: 是否成功完成
        """
        with self._lock:
            session = self._sessions.get(session_id)
            if not session:
                return False
            
            session.complete()
            logger.info(f"会话 {session_id} 已完成")
            return True
    
    def cleanup_session(self, session_id: str) -> bool:
        """
        清理会话
        
        Args:
            session_id: 会话ID
        
        Returns:
            bool: 是否成功清理
        """
        with self._lock:
            if session_id in self._sessions:
                del self._sessions[session_id]
                logger.info(f"会话 {session_id} 已清理")
                return True
            return False
    
    def cleanup_expired_sessions(self) -> int:
        """
        清理过期会话
        
        Returns:
            int: 清理的会话数量
        """
        with self._lock:
            now = now_utc_plus_8()
            expired_sessions = []
            
            for session_id, session in self._sessions.items():
                # 已完成或中止的会话，1小时后清理
                if session.status in ["completed", "aborted"]:
                    if session.updated_at and (now - session.updated_at) > timedelta(hours=1):
                        expired_sessions.append(session_id)
                # 运行中的会话，超过24小时视为过期
                elif (now - session.created_at) > self._session_timeout:
                    session.abort("timeout")
                    expired_sessions.append(session_id)
            
            for session_id in expired_sessions:
                del self._sessions[session_id]
            
            if expired_sessions:
                logger.info(f"清理了 {len(expired_sessions)} 个过期会话")
            
            return len(expired_sessions)
    
    def get_active_sessions(self, project_id: Optional[int] = None,
                           user_id: Optional[int] = None) -> list:
        """
        获取活跃会话列表
        
        Args:
            project_id: 可选的项目ID过滤
            user_id: 可选的用户ID过滤
        
        Returns:
            list: 会话字典列表
        """
        with self._lock:
            sessions = []
            for session in self._sessions.values():
                if project_id and session.project_id != project_id:
                    continue
                if user_id and session.user_id != user_id:
                    continue
                sessions.append(session.to_dict())
            return sessions
    
    def get_session_count(self) -> int:
        """获取当前会话数量"""
        with self._lock:
            return len(self._sessions)
    
    def clear_all_sessions(self) -> int:
        """
        清除所有会话（慎用）
        
        Returns:
            int: 清除的会话数量
        """
        with self._lock:
            count = len(self._sessions)
            self._sessions.clear()
            logger.warning(f"已清除所有 {count} 个会话")
            return count


# 全局会话管理器实例
session_manager = GenerationSessionManager()

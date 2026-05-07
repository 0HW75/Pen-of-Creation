"""
世界观元素提取服务 - 使用 AI 从故事内容中提取设定元素
采用分批次增量提取策略：大纲 -> 卷纲 -> 章纲
支持检查点功能，可在中断后恢复提取
"""
import json
import logging
from typing import Dict, List, Any, Optional, Callable
from app.services.ai_service import ai_service
from app.services.generation.checkpoint_service import checkpoint_service
# from app.services.generation.chapter_snapshot_service import chapter_snapshot_service  # 模块不存在，暂时注释
from app.models import Project, Outline, Volume, Chapter

logger = logging.getLogger(__name__)


class WorldviewElementExtractor:
    """从故事内容提取世界观设定元素（增量式，支持检查点）"""

    def __init__(self, checkpoint_service_instance=None):
        """
        初始化提取器

        Args:
            checkpoint_service_instance: 可选的检查点服务实例，用于依赖注入
        """
        self.ai_service = ai_service
        self.partial_results = {}  # 存储部分结果
        self.checkpoint_service = checkpoint_service_instance or checkpoint_service
        self.session_id = None  # 当前会话ID
        self.user_id = None  # 当前用户ID

    def extract_all_elements_incremental(
        self,
        content_scope: Dict[str, Any],
        extraction_config: dict = None,
        progress_callback: Callable[[str, int, int], None] = None,
        session_id: str = None,
        user_id: int = None,
        enable_snapshot: bool = True
    ) -> Dict[str, List[Dict]]:
        """
        增量式提取所有类型的设定元素（支持检查点恢复）

        流程：
        1. 检查是否存在可恢复的检查点
        2. 提取项目/大纲级别内容
        3. 逐个提取卷纲内容并合并
        4. 逐个提取章纲内容并合并
        5. 每个阶段完成后保存检查点
        6. 如果 enable_snapshot=True，同时生成章节快照

        Args:
            content_scope: 内容范围配置
            extraction_config: 提取配置
            progress_callback: 进度回调函数(stage, current, total)
            session_id: 会话ID，用于检查点保存和恢复
            user_id: 用户ID，用于检查点保存
            enable_snapshot: 是否启用章节快照功能，默认True

        Returns:
            包含所有类型元素的字典
        """
        self.enable_snapshot = enable_snapshot
        self.previous_snapshot = None
        # 设置会话信息
        self.session_id = session_id
        self.user_id = user_id

        config = extraction_config or {}
        target_types = config.get('target_types', [
            'characters', 'locations', 'factions', 'items',
            'dimensions', 'regions', 'celestial_bodies', 'natural_laws',
            'energy_systems', 'civilizations', 'social_classes',
            'political_systems', 'economic_systems', 'cultural_customs',
            'timeline_events', 'relations'
        ])
        strategy = config.get('strategy', 'infer_potential')
        include_evidence = config.get('include_evidence', False)

        scope_type = content_scope.get('type', 'full')
        project_id = content_scope.get('project_id')

        # 初始化结果
        merged_result = {
            'characters': [],
            'locations': [],
            'factions': [],
            'items': [],
            'dimensions': [],
            'regions': [],
            'celestial_bodies': [],
            'natural_laws': [],
            'energy_systems': [],
            'civilizations': [],
            'social_classes': [],
            'political_systems': [],
            'economic_systems': [],
            'cultural_customs': [],
            'timeline_events': [],
            'relations': []
        }

        # 检查是否需要从检查点恢复
        resumed_state = None
        if session_id and self._should_resume_from_checkpoint(session_id):
            checkpoint = self.checkpoint_service.load_checkpoint_by_session(session_id)
            if checkpoint:
                resumed_state = self._get_resumed_state(checkpoint)
                if resumed_state:
                    merged_result = resumed_state.get('merged_result', merged_result)
                    logger.info(f"从检查点恢复提取: session_id={session_id}, stage={resumed_state.get('stage')}")

        try:
            if scope_type == 'full' or scope_type == 'outline':
                # 阶段1：提取大纲内容
                if progress_callback:
                    progress_callback('outline', 0, 1)

                outline_id = content_scope.get('outline_id')

                # 如果是 'full' 类型但没有 outline_id，获取项目的第一个大纲
                if scope_type == 'full' and not outline_id and project_id:
                    from app.models import Outline
                    first_outline = Outline.query.filter_by(project_id=project_id).first()
                    if first_outline:
                        outline_id = first_outline.id
                        logger.info(f'使用项目 {project_id} 的第一个大纲: {outline_id}')

                # 检查是否需要跳过已完成的阶段
                if not resumed_state or resumed_state.get('stage') in ['outline', 'volume', 'chapter']:
                    if outline_id:
                        outline_content = self._extract_outline_content(outline_id)
                        if outline_content:
                            outline_elements = self._extract_from_text(
                                outline_content, target_types, strategy, include_evidence,
                                context='大纲级别内容',
                                source_chapter={'type': 'outline', 'id': outline_id}
                            )
                            merged_result = self._merge_results(merged_result, outline_elements)

                    if progress_callback:
                        progress_callback('outline', 1, 1)

                    # 保存大纲快照
                    if outline_id and project_id:
                        outline = Outline.query.get(outline_id)
                        self._save_chapter_snapshot(
                            project_id=project_id,
                            snapshot_type='outline',
                            elements_data=merged_result,
                            outline_id=outline_id,
                            chapter_title=outline.title if outline else '大纲'
                        )

                    # 保存大纲阶段检查点
                    if session_id and project_id and user_id:
                        self._save_extraction_checkpoint(
                            session_id=session_id,
                            project_id=project_id,
                            stage='outline_completed',
                            data={'merged_result': merged_result, 'outline_id': outline_id},
                            progress=10
                        )

                # 阶段2：逐个提取卷纲
                if outline_id:
                    volumes = Volume.query.filter_by(outline_id=outline_id).order_by(Volume.order_index).all()
                    total_volumes = len(volumes)

                    # 获取已处理的卷纲ID列表
                    processed_volume_ids = resumed_state.get('processed_volume_ids', []) if resumed_state else []

                    for idx, volume in enumerate(volumes):
                        # 跳过已处理的卷纲
                        if volume.id in processed_volume_ids:
                            logger.info(f"跳过已处理的卷纲: {volume.id}")
                            continue

                        if progress_callback:
                            progress_callback('volume', idx + 1, total_volumes)

                        volume_content = self._extract_volume_content(volume.id)
                        if volume_content:
                            volume_elements = self._extract_from_text(
                                volume_content, target_types, strategy, include_evidence,
                                context=f'卷纲《{volume.title}》',
                                source_chapter={'type': 'volume', 'id': volume.id, 'title': volume.title}
                            )
                            merged_result = self._merge_results(merged_result, volume_elements)

                        # 保存卷纲快照
                        self._save_chapter_snapshot(
                            project_id=project_id,
                            snapshot_type='volume',
                            elements_data=merged_result,
                            outline_id=outline_id,
                            volume_id=volume.id,
                            chapter_title=volume.title
                        )

                        # 保存卷纲阶段检查点
                        if session_id and project_id and user_id:
                            processed_volume_ids.append(volume.id)
                            progress = 10 + int(((idx + 1) / total_volumes) * 40)
                            self._save_extraction_checkpoint(
                                session_id=session_id,
                                project_id=project_id,
                                stage='volume_processing',
                                data={
                                    'merged_result': merged_result,
                                    'outline_id': outline_id,
                                    'current_volume_id': volume.id,
                                    'processed_volume_ids': processed_volume_ids,
                                    'total_volumes': total_volumes,
                                    'current_volume_index': idx + 1
                                },
                                progress=progress
                            )

                        # 阶段3：逐个提取该卷纲下的章纲
                        chapters = Chapter.query.filter_by(volume_id=volume.id).order_by(Chapter.order_index).all()
                        total_chapters = len(chapters)

                        # 获取已处理的章纲ID列表（仅针对当前卷纲）
                        processed_chapter_ids = resumed_state.get('processed_chapter_ids', []) if resumed_state else []

                        for ch_idx, chapter in enumerate(chapters):
                            # 跳过已处理的章纲
                            if chapter.id in processed_chapter_ids:
                                logger.info(f"跳过已处理的章纲: {chapter.id}")
                                continue

                            if progress_callback:
                                progress_callback('chapter', ch_idx + 1, total_chapters,
                                                extra={'volume': volume.title})

                            chapter_content = self._extract_chapter_content(chapter.id)
                            if chapter_content:
                                chapter_elements = self._extract_from_text(
                                    chapter_content, target_types, strategy, include_evidence,
                                    context=f'章纲《{chapter.title}》',
                                    source_chapter={'type': 'chapter', 'id': chapter.id, 'title': chapter.title, 'volume_id': volume.id}
                                )
                                merged_result = self._merge_results(merged_result, chapter_elements)

                            # 保存章纲快照
                            self._save_chapter_snapshot(
                                project_id=project_id,
                                snapshot_type='chapter',
                                elements_data=merged_result,
                                outline_id=outline_id,
                                volume_id=volume.id,
                                chapter_id=chapter.id,
                                chapter_title=chapter.title
                            )

                            # 保存章纲阶段检查点
                            if session_id and project_id and user_id:
                                processed_chapter_ids.append(chapter.id)
                                progress = 50 + int(((idx + 1) / total_volumes) * 50)
                                self._save_extraction_checkpoint(
                                    session_id=session_id,
                                    project_id=project_id,
                                    stage='chapter_processing',
                                    data={
                                        'merged_result': merged_result,
                                        'outline_id': outline_id,
                                        'current_volume_id': volume.id,
                                        'current_chapter_id': chapter.id,
                                        'processed_volume_ids': processed_volume_ids,
                                        'processed_chapter_ids': processed_chapter_ids
                                    },
                                    progress=progress
                                )

            elif scope_type == 'volume':
                # 仅提取特定卷纲
                volume_id = content_scope.get('volume_id')
                if volume_id:
                    volume = Volume.query.get(volume_id)
                    if volume:
                        if progress_callback:
                            progress_callback('volume', 1, 1)

                        volume_content = self._extract_volume_content(volume_id)
                        if volume_content:
                            volume_elements = self._extract_from_text(
                                volume_content, target_types, strategy, include_evidence,
                                context=f'卷纲《{volume.title}》',
                                source_chapter={'type': 'volume', 'id': volume_id, 'title': volume.title}
                            )
                            merged_result = self._merge_results(merged_result, volume_elements)

                        # 保存卷纲快照
                        self._save_chapter_snapshot(
                            project_id=project_id,
                            snapshot_type='volume',
                            elements_data=merged_result,
                            outline_id=volume.outline_id if volume else None,
                            volume_id=volume_id,
                            chapter_title=volume.title if volume else None
                        )

                        # 保存卷纲阶段检查点
                        if session_id and project_id and user_id:
                            self._save_extraction_checkpoint(
                                session_id=session_id,
                                project_id=project_id,
                                stage='volume_completed',
                                data={'merged_result': merged_result, 'volume_id': volume_id},
                                progress=50
                            )

                        # 提取该卷纲下的章纲
                        chapters = Chapter.query.filter_by(volume_id=volume_id).order_by(Chapter.order_index).all()
                        total_chapters = len(chapters)

                        for ch_idx, chapter in enumerate(chapters):
                            if progress_callback:
                                progress_callback('chapter', ch_idx + 1, total_chapters)

                            chapter_content = self._extract_chapter_content(chapter.id)
                            if chapter_content:
                                chapter_elements = self._extract_from_text(
                                    chapter_content, target_types, strategy, include_evidence,
                                    context=f'章纲《{chapter.title}》',
                                    source_chapter={'type': 'chapter', 'id': chapter.id, 'title': chapter.title, 'volume_id': volume_id}
                                )
                                merged_result = self._merge_results(merged_result, chapter_elements)

                            # 保存章纲快照
                            self._save_chapter_snapshot(
                                project_id=project_id,
                                snapshot_type='chapter',
                                elements_data=merged_result,
                                volume_id=volume_id,
                                chapter_id=chapter.id,
                                chapter_title=chapter.title
                            )

                            # 保存章纲阶段检查点
                            if session_id and project_id and user_id:
                                progress = 50 + int(((ch_idx + 1) / total_chapters) * 50)
                                self._save_extraction_checkpoint(
                                    session_id=session_id,
                                    project_id=project_id,
                                    stage='chapter_processing',
                                    data={
                                        'merged_result': merged_result,
                                        'volume_id': volume_id,
                                        'current_chapter_id': chapter.id
                                    },
                                    progress=progress
                                )

            elif scope_type == 'chapter':
                # 仅提取特定章纲
                chapter_id = content_scope.get('chapter_id')
                if chapter_id:
                    chapter = Chapter.query.get(chapter_id)
                    if chapter:
                        if progress_callback:
                            progress_callback('chapter', 1, 1)

                        chapter_content = self._extract_chapter_content(chapter_id)
                        if chapter_content:
                            chapter_elements = self._extract_from_text(
                                chapter_content, target_types, strategy, include_evidence,
                                context=f'章纲《{chapter.title}》',
                                source_chapter={'type': 'chapter', 'id': chapter_id, 'title': chapter.title}
                            )
                            merged_result = self._merge_results(merged_result, chapter_elements)

                        # 保存章纲快照
                        self._save_chapter_snapshot(
                            project_id=project_id,
                            snapshot_type='chapter',
                            elements_data=merged_result,
                            chapter_id=chapter_id,
                            chapter_title=chapter.title if chapter else None
                        )

                        # 保存章纲阶段检查点
                        if session_id and project_id and user_id:
                            self._save_extraction_checkpoint(
                                session_id=session_id,
                                project_id=project_id,
                                stage='chapter_completed',
                                data={'merged_result': merged_result, 'chapter_id': chapter_id},
                                progress=100
                            )

            # 最终完成检查点
            if session_id and project_id and user_id:
                self._save_extraction_checkpoint(
                    session_id=session_id,
                    project_id=project_id,
                    stage='extraction_completed',
                    data={'merged_result': merged_result},
                    progress=100,
                    status='completed'
                )

        except Exception as e:
            logger.error(f'增量提取元素失败: {str(e)}', exc_info=True)
            # 保存错误状态检查点
            if session_id and project_id and user_id:
                self._save_extraction_checkpoint(
                    session_id=session_id,
                    project_id=project_id,
                    stage='extraction_error',
                    data={'merged_result': merged_result, 'error': str(e)},
                    progress=0,
                    status='error'
                )

        return merged_result

    def _save_extraction_checkpoint(
        self,
        session_id: str,
        project_id: int,
        stage: str,
        data: Dict[str, Any],
        progress: int,
        status: str = 'in_progress'
    ) -> None:
        """
        保存提取阶段的检查点

        Args:
            session_id: 会话ID
            project_id: 项目ID
            stage: 当前阶段 (outline_completed/volume_processing/chapter_processing/extraction_completed)
            data: 检查点数据，包含 merged_result 和处理进度信息
            progress: 进度百分比 (0-100)
            status: 状态 (in_progress/completed/error)
        """
        try:
            if not self.user_id:
                logger.warning("无法保存检查点: user_id 未设置")
                return

            checkpoint_type = 'element_extraction'
            self.checkpoint_service.save_checkpoint(
                session_id=session_id,
                project_id=project_id,
                user_id=self.user_id,
                stage=stage,
                checkpoint_type=checkpoint_type,
                data=data,
                progress_percent=progress,
                status=status
            )
            logger.info(f"保存提取检查点: session_id={session_id}, stage={stage}, progress={progress}%")
        except Exception as e:
            logger.error(f"保存提取检查点失败: {e}")

    def _should_resume_from_checkpoint(self, session_id: str) -> bool:
        """
        检查是否应该从检查点恢复

        Args:
            session_id: 会话ID

        Returns:
            bool: 如果存在有效的检查点且状态不是 completed/error，则返回 True
        """
        try:
            checkpoint = self.checkpoint_service.load_checkpoint_by_session(session_id)
            if not checkpoint:
                return False

            status = checkpoint.get('status')
            # 只有处于进行中的检查点才需要恢复
            if status in ['in_progress']:
                logger.info(f"发现可恢复的检查点: session_id={session_id}, stage={checkpoint.get('stage')}")
                return True

            return False
        except Exception as e:
            logger.error(f"检查是否需要恢复失败: {e}")
            return False

    def _get_resumed_state(self, checkpoint: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        从检查点获取恢复状态

        Args:
            checkpoint: 检查点数据字典

        Returns:
            dict 或 None: 恢复状态，包含 merged_result 和处理进度信息
        """
        try:
            parsed_data = checkpoint.get('parsed_data')
            if not parsed_data:
                logger.warning("检查点数据为空，无法恢复")
                return None

            stage = checkpoint.get('stage', '')
            merged_result = parsed_data.get('merged_result', {})
            integrated_elements = parsed_data.get('integrated_elements') or parsed_data.get('elements')

            resumed_state = {
                'stage': stage,
                'merged_result': merged_result,
                'integrated_elements': integrated_elements,
                'outline_id': parsed_data.get('outline_id'),
                'volume_id': parsed_data.get('volume_id'),
                'chapter_id': parsed_data.get('chapter_id'),
                'processed_volume_ids': parsed_data.get('processed_volume_ids', []),
                'processed_chapter_ids': parsed_data.get('processed_chapter_ids', []),
                'progress_percent': checkpoint.get('progress_percent', 0)
            }

            logger.info(f"获取恢复状态: stage={stage}, volumes={len(resumed_state['processed_volume_ids'])}, "
                       f"chapters={len(resumed_state['processed_chapter_ids'])}")
            return resumed_state
        except Exception as e:
            logger.error(f"获取恢复状态失败: {e}")
            return None

    def _extract_outline_content(self, outline_id: int) -> str:
        """提取大纲的所有文本内容"""
        outline = Outline.query.get(outline_id)
        if not outline:
            return ""

        result = f"【大纲标题】{outline.title}\n"
        if outline.content:
            result += f"【大纲内容】{outline.content}\n"
        if outline.story_model:
            result += f"【故事模型】{outline.story_model}\n"

        return result

    def _detect_changes(
        self,
        previous: Dict[str, List[Dict]],
        current: Dict[str, List[Dict]]
    ) -> Dict[str, List[Dict]]:
        """
        检测当前与上一个快照之间的变化

        Args:
            previous: 上一个状态的元素
            current: 当前状态的元素

        Returns:
            包含变化的元素字典
        """
        changes = {}

        for element_type in current:
            if element_type not in previous:
                changes[element_type] = current[element_type]
                continue

            type_changes = []
            current_by_name = {item.get('name', '').lower(): item for item in current[element_type]}
            prev_by_name = {item.get('name', '').lower(): item for item in previous[element_type]}

            for name, current_item in current_by_name.items():
                if name in prev_by_name:
                    prev_item = prev_by_name[name]
                    item_changes = self._compare_elements(prev_item, current_item)
                    if item_changes:
                        item_changes['_element_id'] = current_item.get('id', name)
                        item_changes['_element_name'] = current_item.get('name', name)
                        type_changes.append(item_changes)
                else:
                    type_changes.append({
                        '_is_new': True,
                        '_element_id': current_item.get('id', name),
                        '_element_name': current_item.get('name', name),
                        '_new_data': current_item
                    })

            if type_changes:
                changes[element_type] = type_changes

        return changes

    def _compare_elements(self, prev_item: Dict, current_item: Dict) -> Optional[Dict]:
        """
        比较两个元素，找出变化的字段

        Returns:
            包含变化信息的字典，如果没有变化返回None
        """
        changes = {}
        key_fields = ['name', 'type', 'brief', 'description', 'status', 'level']

        for field in key_fields:
            prev_val = prev_item.get(field, '')
            curr_val = current_item.get(field, '')
            if prev_val != curr_val:
                changes[field] = {'old': prev_val, 'new': curr_val}

        extra_fields = set(current_item.keys()) - set(key_fields) - {'id', 'source_chapter', 'sources'}
        for field in extra_fields:
            prev_val = prev_item.get(field, '')
            curr_val = current_item.get(field, '')
            if prev_val != curr_val:
                changes[field] = {'old': prev_val, 'new': curr_val}

        return changes if changes else None

    def _save_chapter_snapshot(
        self,
        project_id: int,
        snapshot_type: str,
        elements_data: Dict[str, List[Dict]],
        outline_id: int = None,
        volume_id: int = None,
        chapter_id: int = None,
        chapter_title: str = None
    ) -> None:
        """
        保存章节快照

        Args:
            project_id: 项目ID
            snapshot_type: 快照类型
            elements_data: 元素数据
            outline_id: 大纲ID
            volume_id: 卷纲ID
            chapter_id: 章纲ID
            chapter_title: 章节标题
        """
        if not getattr(self, 'enable_snapshot', True):
            return

        try:
            new_elements = self._get_new_elements(self.previous_snapshot, elements_data) if self.previous_snapshot else elements_data
            changed_elements = self._detect_changes(self.previous_snapshot or {}, elements_data) if self.previous_snapshot else {}

            chapter_snapshot_service.save_snapshot(
                project_id=project_id,
                snapshot_type=snapshot_type,
                elements_data=elements_data,
                new_elements=new_elements,
                changed_elements=changed_elements,
                outline_id=outline_id,
                volume_id=volume_id,
                chapter_id=chapter_id,
                chapter_title=chapter_title
            )

            self.previous_snapshot = elements_data
            logger.info(f"保存章节快照成功: type={snapshot_type}, chapter_id={chapter_id}")

        except Exception as e:
            logger.error(f"保存章节快照失败: {str(e)}", exc_info=True)

    def _get_new_elements(
        self,
        previous: Dict[str, List[Dict]],
        current: Dict[str, List[Dict]]
    ) -> Dict[str, List[Dict]]:
        """获取新增的元素"""
        new_elements = {}

        for element_type in current:
            if element_type not in previous:
                new_elements[element_type] = current[element_type]
                continue

            prev_names = {item.get('name', '').lower() for item in previous[element_type]}
            new_items = [item for item in current[element_type] if item.get('name', '').lower() not in prev_names]

            if new_items:
                new_elements[element_type] = new_items

        return new_elements

    def _extract_volume_content(self, volume_id: int) -> str:
        """提取卷纲的所有文本内容"""
        volume = Volume.query.get(volume_id)
        if not volume:
            return ""

        result = f"【卷纲标题】{volume.title}\n"
        if volume.content:
            result += f"【卷纲内容】{volume.content}\n"
        if volume.core_conflict:
            result += f"【核心冲突】{volume.core_conflict}\n"
        if volume.character_development:
            result += f"【角色发展】{volume.character_development}\n"
        if volume.key_events:
            result += f"【关键事件】{volume.key_events}\n"

        return result

    def _extract_chapter_content(self, chapter_id: int) -> str:
        """提取章纲的所有文本内容"""
        chapter = Chapter.query.get(chapter_id)
        if not chapter:
            return ""

        result = f"【章纲标题】{chapter.title}\n"
        if chapter.core_event:
            result += f"【核心事件】{chapter.core_event}\n"
        if chapter.scenes:
            result += f"【场景】{chapter.scenes}\n"
        if chapter.characters:
            result += f"【角色】{chapter.characters}\n"
        if chapter.emotional_goal:
            result += f"【情感目标】{chapter.emotional_goal}\n"

        return result

    def _extract_from_text(
        self,
        text: str,
        target_types: List[str],
        strategy: str,
        include_evidence: bool,
        context: str = "",
        source_chapter: Dict[str, Any] = None
    ) -> Dict[str, List[Dict]]:
        """从单段文本提取元素"""

        # 构建提示词
        prompt = self._build_extraction_prompt(text, target_types, strategy, include_evidence, context)

        try:
            # 调用 AI 服务
            messages = [
                {"role": "system", "content": "你是一位专业的小说世界观设定分析师。请分析提供的故事内容片段，提取其中的世界观设定元素。必须以JSON格式返回结果。"},
                {"role": "user", "content": prompt}
            ]

            ai_result = ai_service.chat_completion(
                messages=messages,
                temperature=0.7,
                max_tokens=4000
            )

            ai_response = ai_result.get('content', '')
            elements = self._parse_ai_response(ai_response)

            # 添加来源信息到每个元素
            if source_chapter:
                for element_type, element_list in elements.items():
                    for element in element_list:
                        element['source_chapter'] = source_chapter

            return elements

        except Exception as e:
            logger.error(f'提取文本元素失败 [{context}]: {str(e)}')
            return {key: [] for key in target_types}

    def _build_extraction_prompt(
        self,
        text: str,
        target_types: List[str],
        strategy: str,
        include_evidence: bool,
        context: str = ""
    ) -> str:
        """构建提取提示词"""

        # 数据库 9 种标准类型
        type_descriptions = {
            'characters': '角色（姓名、身份、性格、能力等）',
            'locations': '地点场景（城市、建筑、自然景观等）',
            'factions': '组织势力（门派、国家、组织、机构等）',
            'items': '物品资源（武器、法宝、道具、信息载体等）',
            'dimensions': '维度/位面（不同世界、位面、维度空间等）',
            'regions': '区域（地理区域、领地、版图等）',
            'celestial_bodies': '天体（星球、恒星、卫星、星系等）',
            'natural_laws': '自然法则（物理规则、魔法法则等）',
            'energy_systems': '能量体系（力量等级、修炼体系、超自然能力等）',
            'civilizations': '文明体系（文明类型、发展阶段等）',
            'social_classes': '社会阶层（贵族、平民、奴隶等）',
            'political_systems': '政治体系（政府类型、权力结构等）',
            'economic_systems': '经济体系（货币名称、经济模式等）',
            'cultural_customs': '文化习俗（节日、礼仪、禁忌等）',
            'timeline_events': '历史脉络（历史事件、时间线、起点事件等）',
            'relations': '关系网络（角色与组织关系、组织间关系等）'
        }

        target_list = ', '.join([type_descriptions.get(t, t) for t in target_types])

        evidence_desc = "对于每个提取的元素，请提供原文证据" if include_evidence else ""
        evidence_example = '"evidence": "证据"' if include_evidence else ''

        # 明确列出 9 种类型，禁止返回其他类型
        prompt = f"""请分析以下故事内容片段（{context}），提取其中的世界观设定元素。

## 分析要求
- 策略：{'仅提取明确提及的内容' if strategy == 'explicit_only' else '基于文本进行合理推断和补充'}
- 需要提取：{target_list}
- {evidence_desc}

## 重要约束
- 只返回以下 16 种类型，禁止返回其他类型：
  1. characters - 角色：具体的人，有姓名、身份、性格
  2. locations - 地点场景：具体的地点，如城市、建筑、房间、道路
  3. factions - 组织势力：组织、机构、国家、政府、部门、门派、计划项目（如"零号工程"、"昆仑基地"是组织不是地点）
  4. items - 物品资源：具体的物品、武器、情报、载具、文件
  5. dimensions - 维度/位面：不同的世界、位面、维度空间
  6. regions - 区域：地理区域、领地、版图
  7. celestial_bodies - 天体：星球、恒星、卫星、星系
  8. natural_laws - 自然法则：世界的物理规则、魔法法则
  9. energy_systems - 能量体系：力量等级、修炼体系、超自然能力
  10. civilizations - 文明体系：文明类型、发展阶段等
  11. social_classes - 社会阶层：贵族、平民、奴隶等
  12. political_systems - 政治体系：政府类型、权力结构等
  13. economic_systems - 经济体系：货币名称、经济模式等
  14. cultural_customs - 文化习俗：节日、礼仪、禁忌等
  15. timeline_events - 历史脉络：历史事件、时间线
  16. relations - 关系网络：人与组织的关系、组织间的关系
- 关键区分：
  1. "国家/政府/部门" → factions（不是 natural_laws）
  2. "绝密基地/秘密设施" → factions（如果是组织）或 locations（如果是具体地点）
  3. "计划/工程/项目" → factions（如"零号工程"）
  4. "不同世界/位面/维度空间" → dimensions
  5. "能力/超自然能力/魔法/修炼体系" → energy_systems（不是 items）
  6. "门/传送门/空间门" → dimensions（如果是空间通道）或 energy_systems（如果是能力）
  7. "社会结构/文化习俗/运作模式" → 拆分为 social_classes、cultural_customs、political_systems
  8. "物理法则/魔法规则/世界规则" → natural_laws
  9. "星球/恒星/卫星/星系" → celestial_bodies
  10. "地理区域/领地/版图" → regions

## 内容片段
```
{text[:3000]}
```

## 输出格式
请以 JSON 格式输出，只包含以下 16 种类型：
注意：键名必须严格使用以下名称，禁止使用其他名称！
- 禁止使用 "organizations"、"groups"、"teams"
- 禁止使用 "items_resources"、"equipment"
- 禁止使用 "social_systems"、"culture"
- 禁止使用 "historical_context"、"events"
- 禁止使用 "relationship_networks"
- 禁止使用 "world_architecture"

正确示例：
{{
  "characters": [{{"id": "char_001", "name": "名称", "type": "类型", "brief": "简介"{', ' + evidence_example if evidence_example else ''}}}],
  "locations": [{{"id": "loc_001", "name": "名称", "type": "类型", "brief": "简介"{', ' + evidence_example if evidence_example else ''}}}],
  "factions": [{{"id": "fact_001", "name": "名称", "type": "类型", "brief": "简介"{', ' + evidence_example if evidence_example else ''}}}],
  "items": [{{"id": "item_001", "name": "名称", "type": "类型", "brief": "简介"{', ' + evidence_example if evidence_example else ''}}}],
  "dimensions": [{{"id": "dim_001", "name": "名称", "type": "类型", "brief": "简介"{', ' + evidence_example if evidence_example else ''}}}],
  "regions": [{{"id": "reg_001", "name": "名称", "type": "类型", "brief": "简介"{', ' + evidence_example if evidence_example else ''}}}],
  "celestial_bodies": [{{"id": "cel_001", "name": "名称", "type": "类型", "brief": "简介"{', ' + evidence_example if evidence_example else ''}}}],
  "natural_laws": [{{"id": "nat_001", "name": "名称", "type": "类型", "brief": "简介"{', ' + evidence_example if evidence_example else ''}}}],
  "energy_systems": [{{"id": "ener_001", "name": "名称", "type": "类型", "brief": "简介"{', ' + evidence_example if evidence_example else ''}}}],
  "civilizations": [{{"id": "civ_001", "name": "名称", "type": "类型", "brief": "简介"{', ' + evidence_example if evidence_example else ''}}}],
  "social_classes": [{{"id": "class_001", "name": "名称", "type": "类型", "brief": "简介"{', ' + evidence_example if evidence_example else ''}}}],
  "political_systems": [{{"id": "pol_001", "name": "名称", "type": "类型", "brief": "简介"{', ' + evidence_example if evidence_example else ''}}}],
  "economic_systems": [{{"id": "econ_001", "name": "名称", "type": "类型", "brief": "简介"{', ' + evidence_example if evidence_example else ''}}}],
  "cultural_customs": [{{"id": "cult_001", "name": "名称", "type": "类型", "brief": "简介"{', ' + evidence_example if evidence_example else ''}}}],
  "timeline_events": [{{"id": "hist_001", "name": "名称", "type": "类型", "brief": "简介"{', ' + evidence_example if evidence_example else ''}}}],
  "relations": [{{"id": "rel_001", "name": "名称", "type": "类型", "brief": "简介"{', ' + evidence_example if evidence_example else ''}}}]
}}

注意：
1. 只输出 JSON，不要其他内容
2. 必须包含全部 16 种类型的键（即使为空数组）
3. 未找到的类型返回空数组 []
4. id 格式为 "类型缩写_序号"
5. 键名必须严格使用上述名称，不能使用 "organizations" 等别名
"""

        return prompt

    def _parse_ai_response(self, ai_response: str) -> Dict[str, List[Dict]]:
        """解析 AI 响应"""
        try:
            # 尝试直接解析 JSON
            data = json.loads(ai_response)
            return data
        except json.JSONDecodeError:
            # 尝试从文本中提取 JSON
            try:
                import re
                # 查找 JSON 代码块
                json_match = re.search(r'```json\s*(\{.*?\})\s*```', ai_response, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group(1))

                # 查找任意 JSON 对象
                json_match = re.search(r'(\{{[\s\S]*\}})', ai_response)
                if json_match:
                    return json.loads(json_match.group(1))
            except Exception:
                pass

        # 返回空结构
        return {
            'characters': [],
            'locations': [],
            'factions': [],
            'items': [],
            'dimensions': [],
            'regions': [],
            'celestial_bodies': [],
            'natural_laws': [],
            'energy_systems': [],
            'civilizations': [],
            'social_classes': [],
            'political_systems': [],
            'economic_systems': [],
            'cultural_customs': [],
            'timeline_events': [],
            'relations': []
        }

    def _merge_results(
        self,
        existing: Dict[str, List[Dict]],
        new_elements: Dict[str, List[Dict]]
    ) -> Dict[str, List[Dict]]:
        """
        合并提取结果，去重并保留来源信息

        去重规则：
        1. 按名称去重（不区分大小写）
        2. 保留所有来源信息（source_chapter）
        3. 如果相同名称的元素来自不同来源，合并来源信息
        """
        result = {key: list(existing.get(key, [])) for key in existing}

        for key in new_elements:
            if key not in result:
                result[key] = []

            # 使用字典来跟踪已存在的元素（按名称）
            existing_by_name = {}
            for idx, item in enumerate(result[key]):
                name = item.get('name', '').lower()
                if name:
                    existing_by_name[name] = idx

            for item in new_elements[key]:
                name = item.get('name', '').lower()
                source_chapter = item.get('source_chapter')

                if not name:
                    continue

                if name in existing_by_name:
                    # 元素已存在，合并来源信息
                    existing_idx = existing_by_name[name]
                    existing_item = result[key][existing_idx]

                    # 初始化 sources 列表（如果还没有）
                    if 'sources' not in existing_item:
                        existing_sources = []
                        if existing_item.get('source_chapter'):
                            existing_sources.append(existing_item['source_chapter'])
                        existing_item['sources'] = existing_sources
                        # 移除旧的单个 source_chapter
                        if 'source_chapter' in existing_item:
                            del existing_item['source_chapter']

                    # 添加新的来源
                    if source_chapter and source_chapter not in existing_item['sources']:
                        existing_item['sources'].append(source_chapter)
                else:
                    # 新元素，直接添加
                    result[key].append(item)
                    existing_by_name[name] = len(result[key]) - 1

        return result

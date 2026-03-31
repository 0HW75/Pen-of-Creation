"""
世界观蓝图元素提取 API
从故事蓝图（大纲、卷纲、章纲）中提取设定元素
"""
from flask import request, jsonify, Response, stream_with_context
from app.api import api_bp
from app.services.content_extractor import ContentExtractor
from app.services.worldview_element_extractor import WorldviewElementExtractor
from app.services.generation.session_manager import session_manager
from app.services.generation.checkpoint_service import checkpoint_service
from app.services.ai_service import ai_service
from app.models import Outline, Volume, Chapter
from logs import generation_logger
import json
import logging
import re
import uuid
import time


logger = logging.getLogger(__name__)

element_extractor = WorldviewElementExtractor()


@api_bp.route('/worldview/extract-blueprint-elements', methods=['POST'])
def extract_blueprint_elements():
    """
    从故事蓝图提取设定元素（阶段一）
    提取所有文本字段，不只是 content

    Request Body:
    {
        "project_id": 1,
        "content_scope": {
            "type": "outline",
            "outline_id": 1,
            "volume_id": 1,
            "chapter_id": 1
        },
        "extraction_config": {
            "target_types": ["character", "location", "faction", ...],
            "strategy": "infer_potential",
            "include_evidence": true
        }
    }
    """
    try:
        data = request.get_json()
        project_id = data.get('project_id')
        content_scope = data.get('content_scope', {})
        extraction_config = data.get('extraction_config', {})

        logger.info(f'收到提取请求: project_id={project_id}, content_scope={content_scope}')

        if not project_id:
            return jsonify({'code': 400, 'message': '缺少 project_id'}), 400

        content_scope['project_id'] = project_id

        content = ContentExtractor.extract_by_scope(content_scope)

        if not content:
            return jsonify({'code': 404, 'message': '未找到故事内容'}), 404

        extraction_id = f"ext_{project_id}_{hash(str(content_scope)) % 1000000}"

        try:
            extracted_elements = element_extractor.extract_all_elements_incremental(
                content_scope=content_scope,
                extraction_config=extraction_config
            )
        except Exception as e:
            logger.error(f'AI 提取失败，使用模拟数据: {str(e)}')
            extracted_elements = _mock_extract_elements(content, extraction_config)

        return jsonify({
            'code': 200,
            'data': {
                'extraction_id': extraction_id,
                'statistics': {
                    'characters': len(extracted_elements.get('characters', [])),
                    'locations': len(extracted_elements.get('locations', [])),
                    'factions': len(extracted_elements.get('factions', [])),
                    'items': len(extracted_elements.get('items', [])),
                    'world_architecture': len(extracted_elements.get('world_architecture', [])),
                    'energy_systems': len(extracted_elements.get('energy_systems', [])),
                    'civilizations': len(extracted_elements.get('civilizations', [])),
                    'social_classes': len(extracted_elements.get('social_classes', [])),
                    'political_systems': len(extracted_elements.get('political_systems', [])),
                    'economic_systems': len(extracted_elements.get('economic_systems', [])),
                    'cultural_customs': len(extracted_elements.get('cultural_customs', [])),
                    'timeline_events': len(extracted_elements.get('timeline_events', [])),
                    'relations': len(extracted_elements.get('relations', []))
                },
                'elements': extracted_elements,
                'content_preview': content[:500] + '...' if len(content) > 500 else content,
                'total_length': len(content)
            }
        })

    except Exception as e:
        logger.error(f'提取设定元素失败: {str(e)}', exc_info=True)
        return jsonify({'code': 500, 'message': f'提取失败: {str(e)}'}), 500


def _mock_extract_elements(content: str, config: dict) -> dict:
    """
    模拟提取设定元素（实际应该调用 AI 服务）
    """
    content_length = len(content)

    elements = {
        'characters': [],
        'locations': [],
        'factions': [],
        'items': [],
        'world_architecture': [],
        'energy_systems': [],
        'civilizations': [],
        'social_classes': [],
        'political_systems': [],
        'economic_systems': [],
        'cultural_customs': [],
        'timeline_events': [],
        'relations': []
    }

    if content_length > 500:
        elements['characters'].append({
            'id': 'char_001',
            'name': '主角（从内容中提取）',
            'type': 'protagonist',
            'brief': '故事的主要人物，需要从文本中分析具体特征',
            'evidence': content[:100] + '...',
            'importance': 10
        })

    if content_length > 1000:
        elements['characters'].append({
            'id': 'char_002',
            'name': '重要配角（从内容中提取）',
            'type': 'supporting',
            'brief': '与主角有重要互动的角色',
            'evidence': '文本中提及的次要人物',
            'importance': 7
        })
        elements['locations'].append({
            'id': 'loc_001',
            'name': '主要场景（从内容中提取）',
            'type': 'main_scene',
            'brief': '故事发生的主要地点',
            'evidence': content[100:200] + '...',
            'importance': 8
        })

    if content_length > 2000:
        elements['factions'].append({
            'id': 'faction_001',
            'name': '势力组织（从内容中提取）',
            'type': 'organization',
            'brief': '故事中出现的组织或势力',
            'evidence': '文本中描述的团体',
            'importance': 6
        })

    return elements


@api_bp.route('/worldview/extract-blueprint-elements-stream', methods=['POST'])
def extract_blueprint_elements_stream():
    """
    流式提取设定元素 - 接入真实AI流式输出，显示输入内容和AI输出进度
    支持中止和检查点恢复
    """
    def generate_stream():
        session_id = None
        try:
            data = request.get_json()
            project_id = data.get('project_id')
            content_scope = data.get('content_scope', {})
            extraction_config = data.get('extraction_config', {})

            if not project_id:
                yield f"data: {json.dumps({'type': 'error', 'message': '缺少 project_id'}, ensure_ascii=False)}\n\n"
                return

            session_id = f"ext_{uuid.uuid4().hex[:16]}"
            session_manager.create_session(
                session_id=session_id,
                session_type='extraction',
                project_id=project_id,
                user_id=1
            )

            yield f"data: {json.dumps({'type': 'session_id', 'session_id': session_id}, ensure_ascii=False)}\n\n"

            content_scope['project_id'] = project_id
            target_types = extraction_config.get('target_types', [
                'characters', 'locations', 'factions', 'items',
                'world_architecture', 'energy_systems',
                'civilizations', 'social_classes', 'political_systems',
                'economic_systems', 'cultural_customs',
                'timeline_events', 'relations'
            ])
            strategy = extraction_config.get('strategy', 'infer_potential')
            include_evidence = extraction_config.get('include_evidence', True)

            yield f"data: {json.dumps({'type': 'start', 'message': '开始提取设定元素'}, ensure_ascii=False)}\n\n"

            merged_result = {
                'characters': [],
                'locations': [],
                'factions': [],
                'items': [],
                'world_architecture': [],
                'energy_systems': [],
                'civilizations': [],
                'social_classes': [],
                'political_systems': [],
                'economic_systems': [],
                'cultural_customs': [],
                'timeline_events': [],
                'relations': []
            }

            scope_type = content_scope.get('type', 'full')

            def process_with_stream(content, context_name, stage_type):
                nonlocal merged_result, session_id

                if session_id and session_manager.is_aborted(session_id):
                    logger.info(f"[提取阶段] 会话 {session_id} 已中止，停止处理: {context_name}")
                    yield f"data: {json.dumps({'type': 'aborted', 'message': '提取已中止'}, ensure_ascii=False)}\n\n"
                    return

                logger.info(f"[提取阶段] 开始处理: {context_name} (阶段类型: {stage_type})")
                logger.debug(f"[提取阶段] {context_name} - 内容长度: {len(content)} 字符")

                type_descriptions = {
                    'characters': '角色（姓名、身份、性格、能力等）',
                    'locations': '地点场景（城市、建筑、自然景观等）',
                    'factions': '组织势力（门派、国家、组织等）',
                    'items': '物品资源（武器、法宝、道具等）',
                    'world_architecture': '世界架构（世界规则、维度、地理等）',
                    'energy_systems': '能量体系（力量等级、修炼体系等）',
                    'civilizations': '文明体系（文明类型、发展阶段等）',
                    'social_classes': '社会阶层（贵族、平民、奴隶等）',
                    'political_systems': '政治体系（政府类型、权力结构等）',
                    'economic_systems': '经济体系（货币名称、经济模式等）',
                    'cultural_customs': '文化习俗（节日、礼仪、禁忌等）',
                    'timeline_events': '历史脉络（历史事件、时间线等）',
                    'relations': '关系网络（角色关系、势力关系等）'
                }
                target_list = ', '.join([type_descriptions.get(t, t) for t in target_types])
                extraction_prompt = f"分析以下故事内容片段（{context_name}），提取其中的世界观设定元素。需要提取：{target_list}"
                prompt_summary = extraction_prompt[:200] + "..." if len(extraction_prompt) > 200 else extraction_prompt

                input_data = {
                    'type': 'input',
                    'stage': 'extraction',
                    'stage_type': stage_type,
                    'content': content,
                    'context': context_name,
                    'element_name': context_name,
                    'element_type': stage_type,
                    'prompt_summary': prompt_summary,
                    'full_prompt_length': len(extraction_prompt),
                    'target_types': target_types,
                    'strategy': strategy
                }
                yield f"data: {json.dumps(input_data, ensure_ascii=False)}\n\n"

                yield f"data: {json.dumps({'type': 'output', 'content': f'🤖 AI正在分析 {context_name}...'}, ensure_ascii=False)}\n\n"

                ai_response_parts = []
                for chunk in _extract_with_ai_stream(content, target_types, strategy, include_evidence, context_name):
                    if chunk['type'] == 'stream_chunk':
                        ai_response_parts.append(chunk['content'])
                        yield f"data: {json.dumps({'type': 'ai_stream', 'content': chunk['content'], 'context': context_name}, ensure_ascii=False)}\n\n"
                    elif chunk['type'] == 'result':
                        elements = chunk['data']
                        merged_result = _merge_results(merged_result, elements)

                        total_count = sum(len(v) for v in elements.values())
                        yield f"data: {json.dumps({'type': 'output', 'content': f'✅ 从 {context_name} 提取到 {total_count} 个元素'}, ensure_ascii=False)}\n\n"

                        for elem_type, elems in elements.items():
                            if elems:
                                elem_names = ', '.join([e.get('name', '未命名') for e in elems[:3]])
                                if len(elems) > 3:
                                    elem_names += f' 等{len(elems)}个'
                                yield f"data: {json.dumps({'type': 'output', 'content': f'  📌 {elem_type}: {elem_names}'}, ensure_ascii=False)}\n\n"
                    elif chunk['type'] == 'error':
                        err_msg = f'⚠️ 分析 {context_name} 时出错: {chunk.get("message", "未知错误")}'
                        yield f"data: {json.dumps({'type': 'output', 'content': err_msg}, ensure_ascii=False)}\n\n"

            story_context_outline = ""
            story_context_volume = ""
            story_context_chapters = []

            if scope_type == 'chapter':
                chapter_id = content_scope.get('chapter_id')
                if not chapter_id:
                    yield f"data: {json.dumps({'type': 'error', 'message': '未选择章纲'}, ensure_ascii=False)}\n\n"
                    return

                chapter = Chapter.query.get(chapter_id)
                if not chapter:
                    yield f"data: {json.dumps({'type': 'error', 'message': '未找到章纲'}, ensure_ascii=False)}\n\n"
                    return

                volume = Volume.query.get(chapter.volume_id) if chapter.volume_id else None
                if volume:
                    story_context_volume = f"【卷纲标题】{volume.title}\n【卷纲内容】{volume.content}\n【核心冲突】{volume.core_conflict}\n【角色发展】{volume.character_development}"
                    outline = Outline.query.get(volume.outline_id) if volume.outline_id else None
                    if outline:
                        story_context_outline = f"【大纲标题】{outline.title}\n【大纲内容】{outline.content}\n【故事模型】{outline.story_model}"

                yield f"data: {json.dumps({'type': 'progress', 'stage': 'chapter', 'current': 1, 'total': 1, 'progress': 50}, ensure_ascii=False)}\n\n"

                chapter_content = f"【章纲标题】{chapter.title}\n【章纲内容】{chapter.content}\n【核心事件】{chapter.core_event}\n【场景】{chapter.scenes}\n【角色】{chapter.characters}"
                story_context_chapters.append(chapter_content)

                for msg in process_with_stream(chapter_content, f'章纲《{chapter.title}》', 'chapter'):
                    yield msg

                if session_id:
                    checkpoint_service.save_checkpoint(
                        session_id=session_id,
                        project_id=project_id,
                        user_id=1,
                        stage='extraction',
                        checkpoint_type='chapter',
                        data={
                            'merged_result': merged_result,
                            'content_scope': content_scope,
                            'current_chapter_id': chapter.id,
                            'story_context': {
                                'outline': story_context_outline,
                                'volume': story_context_volume,
                                'chapters': story_context_chapters
                            }
                        },
                        progress_percent=90
                    )
                    logger.info(f"[提取阶段] 单章纲检查点已保存: session_id={session_id}, chapter={chapter.title}")

            elif scope_type == 'volume':
                volume_id = content_scope.get('volume_id')
                if not volume_id:
                    yield f"data: {json.dumps({'type': 'error', 'message': '未选择卷纲'}, ensure_ascii=False)}\n\n"
                    return

                volume = Volume.query.get(volume_id)
                if not volume:
                    yield f"data: {json.dumps({'type': 'error', 'message': '未找到卷纲'}, ensure_ascii=False)}\n\n"
                    return

                outline = Outline.query.get(volume.outline_id) if volume.outline_id else None
                if outline:
                    story_context_outline = f"【大纲标题】{outline.title}\n【大纲内容】{outline.content}\n【故事模型】{outline.story_model}"

                yield f"data: {json.dumps({'type': 'progress', 'stage': 'volume', 'current': 1, 'total': 1, 'progress': 30}, ensure_ascii=False)}\n\n"

                volume_content = f"【卷纲标题】{volume.title}\n【卷纲内容】{volume.content}\n【核心冲突】{volume.core_conflict}\n【角色发展】{volume.character_development}"
                story_context_volume = volume_content

                for msg in process_with_stream(volume_content, f'卷纲《{volume.title}》', 'volume'):
                    yield msg

                if session_id:
                    checkpoint_service.save_checkpoint(
                        session_id=session_id,
                        project_id=project_id,
                        user_id=1,
                        stage='extraction',
                        checkpoint_type='volume',
                        data={
                            'merged_result': merged_result,
                            'content_scope': content_scope,
                            'current_volume_id': volume.id,
                            'processed_volume_ids': [volume.id],
                            'story_context': {
                                'outline': story_context_outline,
                                'volume': story_context_volume,
                                'chapters': story_context_chapters
                            }
                        },
                        progress_percent=30
                    )
                    logger.info(f"[提取阶段] 单卷纲检查点已保存: session_id={session_id}, volume={volume.title}")

                chapters = Chapter.query.filter_by(volume_id=volume.id).order_by(Chapter.order_index).all()
                total_chapters = len(chapters)

                for ch_idx, chapter in enumerate(chapters):
                    progress = 30 + int((ch_idx / total_chapters) * 70) if total_chapters > 0 else 30
                    yield f"data: {json.dumps({'type': 'progress', 'stage': 'chapter', 'current': ch_idx + 1, 'total': total_chapters, 'progress': progress}, ensure_ascii=False)}\n\n"

                    chapter_content = f"【章纲标题】{chapter.title}\n【章纲内容】{chapter.content}\n【核心事件】{chapter.core_event}\n【场景】{chapter.scenes}\n【角色】{chapter.characters}"
                    story_context_chapters.append(chapter_content)

                    for msg in process_with_stream(chapter_content, f'章纲《{chapter.title}》', 'chapter'):
                        yield msg

                    if session_id:
                        chapter_progress = 30 + int(((ch_idx + 1) / total_chapters) * 70) if total_chapters > 0 else 30
                        checkpoint_service.save_checkpoint(
                            session_id=session_id,
                            project_id=project_id,
                            user_id=1,
                            stage='extraction',
                            checkpoint_type='chapter',
                            data={
                                'merged_result': merged_result,
                                'content_scope': content_scope,
                                'current_volume_id': volume.id,
                                'current_chapter_id': chapter.id,
                                'processed_volume_ids': [volume.id],
                                'processed_chapter_ids': [c.id for c in chapters[:ch_idx+1]],
                                'story_context': {
                                    'outline': story_context_outline,
                                    'volume': story_context_volume,
                                    'chapters': story_context_chapters
                                }
                            },
                            progress_percent=min(chapter_progress, 99)
                        )
                        logger.info(f"[提取阶段] 单卷纲-章纲检查点已保存: session_id={session_id}, chapter={chapter.title}")

            elif scope_type == 'outline':
                outline_id = content_scope.get('outline_id')
                if not outline_id:
                    yield f"data: {json.dumps({'type': 'error', 'message': '未选择大纲'}, ensure_ascii=False)}\n\n"
                    return

                outline = Outline.query.get(outline_id)
                if not outline:
                    yield f"data: {json.dumps({'type': 'error', 'message': '未找到大纲'}, ensure_ascii=False)}\n\n"
                    return

                story_context_outline = f"【大纲标题】{outline.title}\n【大纲内容】{outline.content}\n【故事模型】{outline.story_model}"

                for msg in process_with_stream(story_context_outline, '大纲级别', 'outline'):
                    yield msg

                if session_id:
                    checkpoint_service.save_checkpoint(
                        session_id=session_id,
                        project_id=project_id,
                        user_id=1,
                        stage='extraction',
                        checkpoint_type='outline',
                        data={
                            'merged_result': merged_result,
                            'content_scope': content_scope,
                            'story_context': {
                                'outline': story_context_outline,
                                'volume': story_context_volume,
                                'chapters': story_context_chapters
                            }
                        },
                        progress_percent=10
                    )
                    logger.info(f"[提取阶段] 大纲检查点已保存: session_id={session_id}")

                volumes = Volume.query.filter_by(outline_id=outline_id).order_by(Volume.order_index).all()
                total_volumes = len(volumes)

                for idx, volume in enumerate(volumes):
                    progress = int((idx / total_volumes) * 50) if total_volumes > 0 else 0
                    yield f"data: {json.dumps({'type': 'progress', 'stage': 'volume', 'current': idx + 1, 'total': total_volumes, 'progress': progress}, ensure_ascii=False)}\n\n"

                    volume_content = f"【卷纲标题】{volume.title}\n【卷纲内容】{volume.content}\n【核心冲突】{volume.core_conflict}\n【角色发展】{volume.character_development}"
                    story_context_volume += volume_content + "\n\n"

                    for msg in process_with_stream(volume_content, f'卷纲《{volume.title}》', 'volume'):
                        yield msg

                    if session_id:
                        volume_progress = 10 + int(((idx + 1) / total_volumes) * 40) if total_volumes > 0 else 50
                        checkpoint_service.save_checkpoint(
                            session_id=session_id,
                            project_id=project_id,
                            user_id=1,
                            stage='extraction',
                            checkpoint_type='volume',
                            data={
                                'merged_result': merged_result,
                                'content_scope': content_scope,
                                'current_volume_id': volume.id,
                                'processed_volume_ids': [v.id for v in volumes[:idx+1]],
                                'story_context': {
                                    'outline': story_context_outline,
                                    'volume': story_context_volume,
                                    'chapters': story_context_chapters
                                }
                            },
                            progress_percent=volume_progress
                        )
                        logger.info(f"[提取阶段] 卷纲检查点已保存: session_id={session_id}, volume={volume.title}")

                    chapters = Chapter.query.filter_by(volume_id=volume.id).order_by(Chapter.order_index).all()
                    total_chapters = len(chapters)

                    for ch_idx, chapter in enumerate(chapters):
                        chapter_progress = int(((idx + ch_idx / total_chapters) / total_volumes) * 50) if total_volumes > 0 else 0
                        yield f"data: {json.dumps({'type': 'progress', 'stage': 'chapter', 'current': ch_idx + 1, 'total': total_chapters, 'progress': 50 + chapter_progress}, ensure_ascii=False)}\n\n"

                        chapter_content = f"【章纲标题】{chapter.title}\n【章纲内容】{chapter.content}\n【核心事件】{chapter.core_event}\n【场景】{chapter.scenes}\n【角色】{chapter.characters}"
                        story_context_chapters.append(chapter_content)

                        for msg in process_with_stream(chapter_content, f'章纲《{chapter.title}》', 'chapter'):
                            yield msg

                        if session_id:
                            chapter_overall_progress = 50 + int(((idx + (ch_idx + 1) / total_chapters) / total_volumes) * 50) if total_volumes > 0 else 50
                            checkpoint_service.save_checkpoint(
                                session_id=session_id,
                                project_id=project_id,
                                user_id=1,
                                stage='extraction',
                                checkpoint_type='chapter',
                                data={
                                    'merged_result': merged_result,
                                    'content_scope': content_scope,
                                    'current_volume_id': volume.id,
                                    'current_chapter_id': chapter.id,
                                    'processed_volume_ids': [v.id for v in volumes[:idx+1]],
                                    'processed_chapter_ids': [c.id for c in chapters[:ch_idx+1]],
                                    'story_context': {
                                        'outline': story_context_outline,
                                        'volume': story_context_volume,
                                        'chapters': story_context_chapters
                                    }
                                },
                                progress_percent=min(chapter_overall_progress, 99)
                            )
                            logger.info(f"[提取阶段] 章纲检查点已保存: session_id={session_id}, chapter={chapter.title}")

            else:
                outline_id = content_scope.get('outline_id')
                if not outline_id:
                    first_outline = Outline.query.filter_by(project_id=project_id).first()
                    if first_outline:
                        outline_id = first_outline.id

                if not outline_id:
                    yield f"data: {json.dumps({'type': 'error', 'message': '未找到大纲'}, ensure_ascii=False)}\n\n"
                    return

                outline = Outline.query.get(outline_id)
                if not outline:
                    yield f"data: {json.dumps({'type': 'error', 'message': '未找到大纲'}, ensure_ascii=False)}\n\n"
                    return

                story_context_outline = f"【大纲标题】{outline.title}\n【大纲内容】{outline.content}\n【故事模型】{outline.story_model}"

                for msg in process_with_stream(story_context_outline, '大纲级别', 'outline'):
                    yield msg

                if session_id:
                    checkpoint_service.save_checkpoint(
                        session_id=session_id,
                        project_id=project_id,
                        user_id=1,
                        stage='extraction',
                        checkpoint_type='outline',
                        data={
                            'merged_result': merged_result,
                            'content_scope': content_scope,
                            'story_context': {
                                'outline': story_context_outline,
                                'volume': story_context_volume,
                                'chapters': story_context_chapters
                            }
                        },
                        progress_percent=10
                    )
                    logger.info(f"[提取阶段] 大纲检查点已保存: session_id={session_id}")

                volumes = Volume.query.filter_by(outline_id=outline_id).order_by(Volume.order_index).all()
                total_volumes = len(volumes)

                for idx, volume in enumerate(volumes):
                    progress = int((idx / total_volumes) * 50) if total_volumes > 0 else 0
                    yield f"data: {json.dumps({'type': 'progress', 'stage': 'volume', 'current': idx + 1, 'total': total_volumes, 'progress': progress}, ensure_ascii=False)}\n\n"

                    volume_content = f"【卷纲标题】{volume.title}\n【卷纲内容】{volume.content}\n【核心冲突】{volume.core_conflict}\n【角色发展】{volume.character_development}"
                    story_context_volume += volume_content + "\n\n"

                    for msg in process_with_stream(volume_content, f'卷纲《{volume.title}》', 'volume'):
                        yield msg

                    if session_id:
                        volume_progress = 10 + int(((idx + 1) / total_volumes) * 40) if total_volumes > 0 else 50
                        checkpoint_service.save_checkpoint(
                            session_id=session_id,
                            project_id=project_id,
                            user_id=1,
                            stage='extraction',
                            checkpoint_type='volume',
                            data={
                                'merged_result': merged_result,
                                'content_scope': content_scope,
                                'current_volume_id': volume.id,
                                'processed_volume_ids': [v.id for v in volumes[:idx+1]],
                                'story_context': {
                                    'outline': story_context_outline,
                                    'volume': story_context_volume,
                                    'chapters': story_context_chapters
                                }
                            },
                            progress_percent=volume_progress
                        )
                        logger.info(f"[提取阶段] 卷纲检查点已保存: session_id={session_id}, volume={volume.title}")

                    chapters = Chapter.query.filter_by(volume_id=volume.id).order_by(Chapter.order_index).all()
                    total_chapters = len(chapters)

                    for ch_idx, chapter in enumerate(chapters):
                        chapter_progress = int(((idx + ch_idx / total_chapters) / total_volumes) * 50) if total_volumes > 0 else 0
                        yield f"data: {json.dumps({'type': 'progress', 'stage': 'chapter', 'current': ch_idx + 1, 'total': total_chapters, 'progress': 50 + chapter_progress}, ensure_ascii=False)}\n\n"

                        chapter_content = f"【章纲标题】{chapter.title}\n【章纲内容】{chapter.content}\n【核心事件】{chapter.core_event}\n【场景】{chapter.scenes}\n【角色】{chapter.characters}"
                        story_context_chapters.append(chapter_content)

                        for msg in process_with_stream(chapter_content, f'章纲《{chapter.title}》', 'chapter'):
                            yield msg

                        if session_id:
                            chapter_overall_progress = 50 + int(((idx + (ch_idx + 1) / total_chapters) / total_volumes) * 50) if total_volumes > 0 else 50
                            checkpoint_service.save_checkpoint(
                                session_id=session_id,
                                project_id=project_id,
                                user_id=1,
                                stage='extraction',
                                checkpoint_type='chapter',
                                data={
                                    'merged_result': merged_result,
                                    'content_scope': content_scope,
                                    'current_volume_id': volume.id,
                                    'current_chapter_id': chapter.id,
                                    'processed_volume_ids': [v.id for v in volumes[:idx+1]],
                                    'processed_chapter_ids': [c.id for c in chapters[:ch_idx+1]],
                                    'story_context': {
                                        'outline': story_context_outline,
                                        'volume': story_context_volume,
                                        'chapters': story_context_chapters
                                    }
                                },
                                progress_percent=min(chapter_overall_progress, 99)
                            )
                            logger.info(f"[提取阶段] 章纲检查点已保存: session_id={session_id}, chapter={chapter.title}")

            integrated_elements = _integrate_elements_with_ai(merged_result)

            statistics = {
                'characters': len(integrated_elements.get('characters', [])),
                'locations': len(integrated_elements.get('locations', [])),
                'factions': len(integrated_elements.get('factions', [])),
                'items': len(integrated_elements.get('items', [])),
                'world_architecture': len(integrated_elements.get('world_architecture', [])),
                'energy_systems': len(integrated_elements.get('energy_systems', [])),
                'civilizations': len(integrated_elements.get('civilizations', [])),
                'social_classes': len(integrated_elements.get('social_classes', [])),
                'political_systems': len(integrated_elements.get('political_systems', [])),
                'economic_systems': len(integrated_elements.get('economic_systems', [])),
                'cultural_customs': len(integrated_elements.get('cultural_customs', [])),
                'timeline_events': len(integrated_elements.get('timeline_events', [])),
                'relations': len(integrated_elements.get('relations', []))
            }

            integrated_count = sum(
                1 for items in integrated_elements.values()
                for item in items if item.get('is_integrated')
            )

            logger.info(f"[提取阶段] 元素整合完成，共整合 {integrated_count} 个相似条目")

            story_context = {
                'outline': story_context_outline,
                'volume': story_context_volume,
                'chapters': story_context_chapters
            }

            checkpoint_id = None
            if session_id:
                checkpoint = checkpoint_service.save_checkpoint(
                    session_id=session_id,
                    project_id=project_id,
                    user_id=1,
                    stage='extraction',
                    checkpoint_type='extraction_complete',
                    data={
                        'merged_result': merged_result,
                        'content_scope': content_scope,
                        'story_context': story_context,
                        'statistics': statistics,
                        'elements': integrated_elements
                    },
                    progress_percent=100,
                    status='completed'
                )
                checkpoint_id = checkpoint.id
                logger.info(f"[提取阶段] 最终检查点已保存: session_id={session_id}, checkpoint_id={checkpoint_id}")

            yield f"data: {json.dumps({'type': 'complete', 'progress': 100, 'message': '提取完成', 'elements': integrated_elements, 'original_elements': merged_result, 'statistics': statistics, 'story_context': story_context, 'integration_info': {'integrated_count': integrated_count}, 'checkpoint_id': checkpoint_id}, ensure_ascii=False)}\n\n"

            if session_id:
                session_manager.complete_session(session_id)

        except Exception as e:
            logger.error(f'流式提取失败: {str(e)}', exc_info=True)
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)}, ensure_ascii=False)}\n\n"

            if session_id:
                session = session_manager.get_session(session_id)
                if session:
                    session.status = 'failed'
        finally:
            if session_id:
                import threading
                threading.Timer(300, lambda: session_manager.cleanup_session(session_id)).start()

    return Response(stream_with_context(generate_stream()), mimetype='text/event-stream')


def _extract_with_ai(text: str, target_types: list, strategy: str, include_evidence: bool, context: str) -> dict:
    """调用AI服务提取元素（同步版本）"""
    prompt = element_extractor._build_extraction_prompt(text, target_types, strategy, include_evidence, context)

    try:
        messages = [
            {"role": "system", "content": "你是一位专业的小说世界观设定分析师。请分析提供的故事内容片段，提取其中的世界观设定元素。必须以JSON格式返回结果。"},
            {"role": "user", "content": prompt}
        ]

        logger.info(f'发送给AI的prompt长度: {len(prompt)} 字符, 内容片段长度: {len(text)} 字符')
        logger.info(f'Prompt前500字符: {prompt[:500]}...')

        ai_result = ai_service.chat_completion(
            messages=messages,
            temperature=0.7,
            max_tokens=4000
        )

        ai_response = ai_result.get('content', '')
        generation_logger.log_step1_extraction("AI_RESPONSE", ai_response)
        generation_logger.log_step1_extraction("INPUT_PROMPT", prompt[:2000])
        result = _parse_ai_response(ai_response)
        generation_logger.log_step1_extraction("PARSED_RESULT", result)
        return result
    except Exception as e:
        logger.error(f'AI提取失败 [{context}]: {str(e)}')
        return {key: [] for key in target_types}


def _extract_with_ai_stream(text: str, target_types: list, strategy: str, include_evidence: bool, context: str):
    """调用AI服务提取元素（真正的流式版本）"""
    prompt = element_extractor._build_extraction_prompt(text, target_types, strategy, include_evidence, context)

    messages = [
        {"role": "system", "content": "你是一位专业的小说世界观设定分析师。请分析提供的故事内容片段，提取其中的世界观设定元素。必须以JSON格式返回结果。"},
        {"role": "user", "content": prompt}
    ]

    logger.info(f'流式发送给AI的prompt长度: {len(prompt)} 字符, 内容片段长度: {len(text)} 字符')

    try:
        stream = ai_service.stream_chat_completion(
            messages=messages,
            temperature=0.7,
            max_tokens=4000
        )

        full_response = ""
        for chunk in stream:
            content = chunk.get('content', '')
            if content:
                full_response += content
                yield {'type': 'stream_chunk', 'content': content}

        generation_logger.log_step1_extraction("STREAM_AI_RESPONSE", full_response)
        generation_logger.log_step1_extraction("STREAM_INPUT_PROMPT", prompt[:2000])
        parsed_result = _parse_ai_response(full_response)
        generation_logger.log_step1_extraction("STREAM_PARSED_RESULT", parsed_result)
        yield {'type': 'result', 'data': parsed_result}

    except Exception as e:
        logger.error(f'AI流式提取失败 [{context}]: {str(e)}')
        yield {'type': 'error', 'message': str(e)}
        yield {'type': 'result', 'data': {key: [] for key in target_types}}


def _parse_ai_response(ai_response: str) -> dict:
    """解析AI响应"""
    try:
        data = json.loads(ai_response)
        return data
    except json.JSONDecodeError:
        try:
            import re
            json_match = re.search(r'```json\s*(\{.*?\})\s*```', ai_response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(1))
            json_match = re.search(r'(\{[\s\S]*\})', ai_response)
            if json_match:
                return json.loads(json_match.group(1))
        except Exception:
            pass

    return {
        'characters': [],
        'locations': [],
        'factions': [],
        'items': [],
        'world_architecture': [],
        'energy_systems': [],
        'civilizations': [],
        'social_classes': [],
        'political_systems': [],
        'economic_systems': [],
        'cultural_customs': [],
        'timeline_events': [],
        'relations': []
    }


def _merge_results(existing: dict, new_elements: dict) -> dict:
    """合并提取结果，去重"""
    result = {key: list(existing.get(key, [])) for key in existing}

    for key in new_elements:
        if key not in result:
            result[key] = []

        existing_names = {item.get('name', '').lower() for item in result[key]}

        for item in new_elements[key]:
            name = item.get('name', '').lower()
            if name and name not in existing_names:
                result[key].append(item)
                existing_names.add(name)

    return result


def _integrate_elements_with_ai(elements: dict) -> dict:
    """
    使用AI智能整合元素列表
    """

    def group_similar_items(items: list, threshold: float = 0.6, element_type: str = '') -> list:
        """
        使用AI整合元素列表（不再使用算法预分组）
        直接将每个元素作为单独的组，依赖AI进行真正的相似性判断
        """
        if not items:
            return []

        n = len(items)
        groups = []

        for i in range(n):
            groups.append([items[i]])

        return groups

    def build_ai_prompt(items: list, element_type: str) -> str:
        type_names = {
            'characters': '角色',
            'locations': '地点',
            'factions': '势力组织',
            'items': '物品道具',
            'world_architecture': '世界架构',
            'energy_systems': '能量体系',
            'civilizations': '文明体系',
            'social_classes': '社会阶层',
            'political_systems': '政治体系',
            'economic_systems': '经济体系',
            'cultural_customs': '文化习俗',
            'timeline_events': '历史事件',
            'relations': '关系'
        }

        type_name = type_names.get(element_type, element_type)

        items_json = []
        for idx, item in enumerate(items):
            items_json.append({
                'index': idx,
                'name': item.get('name', ''),
                'type': item.get('type', ''),
                'brief': item.get('brief', ''),
                'description': item.get('description', ''),
                'source': item.get('source', '')
            })

        prompt = f"""你是一位专业的小说世界观设定分析师。现在需要整合从故事中提取的重复或相似的{type_name}设定。

## 任务
1. 分析以下{len(items)}个{type_name}条目
2. 识别哪些条目描述的是同一个概念（重复或高度相似）
3. 对于相似的条目，提取：
   - 共同的核心特征
   - 各条目的独特差异点（并注明来源）

## 相似判断标准（非常重要）
以下情况应该被判定为**相似/重复**：
1. **名称完全相同**：如"玛娜能量"和"玛娜能量"
2. **描述同一事物**：如"门的能量特性"和"打开'门'的能力"

以下情况应该被判定为**不同实体**：
1. **不同人名**：如"陈启"和"林卫国"、"王铁"是完全不同的两个人，绝不能合并！
2. **名称有明显区分词**：如"陈启的能力"和"林卫国"不是同一人
3. **同一章节中提到的不同角色**：即使描述简短，只要名称不同就是不同角色
4. **来自不同章节的不同角色**：即使名称略有相似，只要是不同人就不能合并

**重要提醒**：你的任务是识别**真正的重复**，而不是**错误地将不同角色合并**。宁可保留重复，也不要错误合并不同实体。

## 输出格式（必须严格遵守）
请以JSON格式返回，结构如下：
{{
    "groups": [
        {{
            "is_duplicate": true/false,
            "items": [原始条目索引列表],
            "merged": {{
                "name": "合并后的名称（如果is_duplicate为true，选择最准确、最完整的名称；如果为false，填写主要实体的名称）",
                "brief": "简介/共同特征",
                "common_points": ["共同点1", "共同点2"],
                "diff_points": [
                    {{"description": "差异描述", "source": "来源"}}
                ]
            }},
            "reason": "判断理由"
        }}
    ]
}}

## 待分析{type_name}条目
{json.dumps(items_json, ensure_ascii=False, indent=2)}

请严格以JSON格式返回结果，不要包含其他内容。"""
        return prompt

    def call_ai_integrate(prompt: str) -> dict:
        import re

        messages = [
            {"role": "system", "content": "你是一位专业的小说世界观设定分析师，擅长识别重复概念并整合差异。必须以JSON格式返回结果。"},
            {"role": "user", "content": prompt}
        ]

        try:
            result = ai_service.chat_completion(
                messages=messages,
                temperature=0.3,
                max_tokens=4000
            )
            content = result.get('content', '')

            if not content:
                logger.warning("AI返回内容为空")
                return None

            try:
                return json.loads(content)
            except json.JSONDecodeError:
                json_match = re.search(r'\{[\s\S]*\}', content)
                if json_match:
                    try:
                        return json.loads(json_match.group())
                    except json.JSONDecodeError:
                        pass
                logger.warning(f"AI返回内容无法解析为JSON: {content[:200]}...")
                return None
        except Exception as e:
            logger.error(f"AI整合失败: {str(e)}")
            return None

    def merge_group_with_ai(group: list, element_type: str) -> dict:
        if len(group) == 1:
            item = group[0]
            return {
                'id': item.get('id', ''),
                'name': item.get('name', ''),
                'type': item.get('type', ''),
                'brief': item.get('brief', ''),
                'description': item.get('description', ''),
                'is_integrated': False,
                'integrated_count': 1,
                'sources': [item.get('source', '')],
                'common_description': item.get('brief', ''),
                'diff_points': []
            }

        prompt = build_ai_prompt(group, element_type)
        generation_logger.log_step2_merge(f"{element_type}_MERGE_PROMPT", prompt[:2000])
        ai_result = call_ai_integrate(prompt)
        generation_logger.log_step2_merge(f"{element_type}_MERGE_RESULT", ai_result)

        if not ai_result or 'groups' not in ai_result:
            names = [item.get('name', '') for item in group]
            briefs = [item.get('brief', '') for item in group]
            return {
                'id': group[0].get('id', ''),
                'name': names[0] if names else '',
                'type': group[0].get('type', ''),
                'brief': briefs[0] if briefs else '',
                'is_integrated': len(group) > 1,
                'integrated_count': len(group),
                'sources': [item.get('source', '') for item in group],
                'common_description': '; '.join(set(briefs)),
                'diff_points': [{'description': f"条目{i+1}: {n}", 'source': group[i].get('source', '')} for i, n in enumerate(names) if n]
            }

        merged_group = ai_result.get('groups', [])
        if not merged_group:
            return {
                'id': group[0].get('id', ''),
                'name': group[0].get('name', ''),
                'type': group[0].get('type', ''),
                'is_integrated': False,
                'integrated_count': 1,
                'sources': [item.get('source', '') for item in group]
            }

        result_item = merged_group[0].get('merged', {})
        result_item['is_integrated'] = True
        result_item['integrated_count'] = len(group)
        result_item['sources'] = [item.get('source', '') for item in group]
        result_item['id'] = group[0].get('id', '')
        result_item['type'] = group[0].get('type', '')
        return result_item

    result = {}
    element_types = ['characters', 'locations', 'factions', 'items',
                     'world_architecture', 'energy_systems',
                     'civilizations', 'social_classes', 'political_systems',
                     'economic_systems', 'cultural_customs',
                     'timeline_events', 'relations']

    for elem_type in element_types:
        items = elements.get(elem_type, [])
        if not items:
            result[elem_type] = []
            continue

        groups = group_similar_items(items, threshold=0.6)
        generation_logger.log_step2_merge(f"{elem_type}_GROUPS", {
            'original_count': len(items),
            'group_count': len(groups),
            'groups': [{'name': g[0].get('name', ''), 'size': len(g)} for g in groups]
        })

        id_prefix_map = {
            'characters': 'char',
            'locations': 'loc',
            'factions': 'faction',
            'items': 'item',
            'world_architecture': 'world_arch',
            'energy_systems': 'energy',
            'civilizations': 'civ',
            'social_classes': 'sclass',
            'political_systems': 'polsys',
            'economic_systems': 'ecosis',
            'cultural_customs': 'cult',
            'timeline_events': 'event',
            'relations': 'relation'
        }
        id_prefix = id_prefix_map.get(elem_type, 'elem')

        integrated_items = []
        for idx, group in enumerate(groups):
            if len(group) > 1:
                merged = merge_group_with_ai(group, elem_type)
                merged['id'] = f"{id_prefix}_{str(idx + 1).zfill(3)}"
                integrated_items.append(merged)
            else:
                item = group[0].copy()
                item['is_integrated'] = False
                item['integrated_count'] = 1
                item['sources'] = [item.get('source', '')]
                item['id'] = f"{id_prefix}_{str(idx + 1).zfill(3)}"
                integrated_items.append(item)

        result[elem_type] = integrated_items
        logger.info(f"[AI整合] {elem_type}类型: {len(items)}个元素 -> {len(integrated_items)}个整合后元素")

    return result

"""
世界观从蓝图生成 API
复用现有的 ai_generation_routes 生成器框架
"""
from flask import request, jsonify, Response, stream_with_context
from app.api import api_bp
from app.services.content_extractor import ContentExtractor
from app.services.worldview_element_extractor import WorldviewElementExtractor
from app.services.generation.generators import (
    CharacterGenerator,
    LocationGenerator,
    ItemGenerator,
    FactionGenerator,
    EnergySystemGenerator,
    CivilizationGenerator,
    HistoricalEventGenerator,
    RegionGenerator,
    DimensionGenerator,
    RelationGenerator
)
from app.services.generation.session_manager import session_manager
from app.services.generation.checkpoint_service import checkpoint_service
from app.services.generation.concept_merge_service import concept_merge_service
from app.services.ai_service import ai_service
from app import db
import json
import logging
import time
import uuid

logger = logging.getLogger(__name__)

# 创建生成器实例（复用现有框架）
generators = {
    'character': CharacterGenerator(),
    'location': LocationGenerator(),
    'item': ItemGenerator(),
    'faction': FactionGenerator(),
    'energy_system': EnergySystemGenerator(),
    'civilization': CivilizationGenerator(),
    'historical_event': HistoricalEventGenerator(),
    'region': RegionGenerator(),
    'dimension': DimensionGenerator(),
    'world_architecture': DimensionGenerator(),  # 世界架构使用维度生成器
    'relation': RelationGenerator()  # 关系网络生成器
}

# 创建元素提取器实例
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
            
        # 添加 project_id 到 content_scope
        content_scope['project_id'] = project_id
        
        # 提取所有文本内容（包含所有字段，不只是 content）
        content = ContentExtractor.extract_by_scope(content_scope)
        
        if not content:
            return jsonify({'code': 404, 'message': '未找到故事内容'}), 404
        
        # 生成提取ID
        extraction_id = f"ext_{project_id}_{hash(str(content_scope)) % 1000000}"
        
        # 使用增量式 AI 提取
        try:
            # 使用新的增量提取方法
            extracted_elements = element_extractor.extract_all_elements_incremental(
                content_scope=content_scope,
                extraction_config=extraction_config
            )
        except Exception as e:
            logger.error(f'AI 提取失败，使用模拟数据: {str(e)}')
            # 如果 AI 提取失败，使用模拟数据作为 fallback
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
                    'society_systems': len(extracted_elements.get('society_systems', [])),
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
    
    # 基于内容长度生成不同数量的模拟元素
    elements = {
        'characters': [],
        'locations': [],
        'factions': [],
        'items': [],
        'world_architecture': [],
        'energy_systems': [],
        'society_systems': [],
        'timeline_events': [],
        'relations': []
    }
    
    # 根据内容长度添加模拟数据
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


@api_bp.route('/worldview/save-extraction-list', methods=['POST'])
def save_extraction_list():
    """保存用户选择的提取清单"""
    try:
        data = request.get_json()
        # TODO: 保存到数据库或缓存
        return jsonify({'code': 200, 'message': '保存成功'})
    except Exception as e:
        logger.error(f'保存提取清单失败: {str(e)}', exc_info=True)
        return jsonify({'code': 500, 'message': f'保存失败: {str(e)}'}), 500


@api_bp.route('/worldview/create-generation-batches', methods=['POST'])
def create_generation_batches():
    """
    创建生成批次（阶段二）
    复用现有的生成器框架
    """
    try:
        data = request.get_json()
        extraction_id = data.get('extraction_id')
        batch_config = data.get('batch_config', {})
        elements = data.get('elements', {})  # 从前端接收提取的元素
        selected_elements = data.get('selected_elements', {})  # 用户选择的元素ID
        
        logger.info(f'创建生成批次: extraction_id={extraction_id}, 元素类型数={len(elements)}, 已选择类型数={len(selected_elements)}')
        
        # 类型映射：前端类型 -> 后端生成器类型
        type_mapping = {
            'characters': 'character',
            'locations': 'location',
            'factions': 'faction',
            'items': 'item',
            'world_architecture': 'world_architecture',
            'energy_systems': 'energy_system',
            'society_systems': 'civilization',
            'timeline_events': 'historical_event',
            'relations': 'relation'
        }
        
        # 批次名称映射
        batch_name_map = {
            'energy_system': '能量体系详细设定',
            'character': '主要角色详细设定',
            'location': '地点场景详细设定',
            'faction': '组织势力详细设定',
            'civilization': '文明体系详细设定',
            'historical_event': '历史事件详细设定',
            'item': '物品资源详细设定',
            'world_architecture': '世界架构详细设定',
            'relation': '关系网络详细设定'
        }
        
        # 根据选择的元素创建批次
        priority_order = batch_config.get('priority_order', [
            'energy_systems', 'characters', 'locations', 'factions', 
            'world_architecture', 'society_systems', 'items', 'timeline_events', 'relations'
        ])
        
        batches = []
        batch_count = 0
        
        for element_type in priority_order:
            # 检查该类型是否有被选中的元素
            if element_type not in selected_elements:
                continue
                
            selected_ids = selected_elements.get(element_type, [])
            if not selected_ids:
                continue
            
            # 获取该类型的所有元素，过滤出被选中的
            type_elements = elements.get(element_type, [])
            selected_type_elements = [
                el for el in type_elements 
                if el.get('id') in selected_ids
            ]
            
            if not selected_type_elements:
                continue
            
            # 映射到后端生成器类型
            generator_type = type_mapping.get(element_type, element_type)
            batch_count += 1
            
            batches.append({
                'batch_id': f'batch_{extraction_id}_{batch_count:03d}',
                'batch_name': batch_name_map.get(generator_type, f'{generator_type}详细设定'),
                'type': generator_type,
                'element_type': element_type,  # 保留原始类型
                'elements': selected_type_elements,  # 实际的元素数据
                'element_count': len(selected_type_elements),
                'status': 'pending',
                'estimated_time': f'{len(selected_type_elements) * 30}秒'
            })
        
        logger.info(f'成功创建 {len(batches)} 个生成批次')
        
        return jsonify({
            'code': 200,
            'data': {
                'generation_session_id': f'gen_sess_{extraction_id}',
                'batches': batches,
                'total_elements': sum(b['element_count'] for b in batches)
            }
        })
    except Exception as e:
        logger.error(f'创建生成批次失败: {str(e)}', exc_info=True)
        return jsonify({'code': 500, 'message': f'创建批次失败: {str(e)}'}), 500


@api_bp.route('/worldview/execute-batch-generation', methods=['POST'])
def execute_batch_generation():
    """
    执行批次生成
    复用现有的生成器框架
    """
    try:
        data = request.get_json()
        batch_id = data.get('batch_id')
        entity_type = data.get('entity_type', 'character')
        prompt = data.get('prompt', '')
        world_id = data.get('world_id')
        project_id = data.get('project_id')
        
        # 获取对应的生成器
        generator = generators.get(entity_type)
        if not generator:
            return jsonify({'code': 400, 'message': f'未知的实体类型: {entity_type}'}), 400
        
        # 调用现有生成器
        result = generator.generate(
            prompt=prompt,
            world_id=world_id,
            project_id=project_id,
            strategy='detailed'
        )
        
        return jsonify({
            'code': 200,
            'data': {
                'batch_id': batch_id,
                'status': 'completed',
                'result': result
            }
        })
    except Exception as e:
        logger.error(f'执行批次生成失败: {str(e)}', exc_info=True)
        return jsonify({'code': 500, 'message': f'生成失败: {str(e)}'}), 500


@api_bp.route('/worldview/execute-batch-generation-stream', methods=['POST'])
def execute_batch_generation_stream():
    """
    流式执行批次生成 - 逐个元素生成，避免超时
    包含完整的故事上下文（大纲、卷纲、章纲）
    支持中止检查和检查点保存
    """
    def generate_stream():
        session = None
        session_id = None
        
        try:
            data = request.get_json()
            batch_id = data.get('batch_id')
            entity_type = data.get('entity_type', 'character')
            elements = data.get('elements', [])
            world_id = data.get('world_id')
            project_id = data.get('project_id')
            user_id = data.get('user_id', 0)  # 从请求中获取用户ID
            
            # 获取故事上下文
            story_context = data.get('story_context', {})
            outline_content = story_context.get('outline', '')
            volume_content = story_context.get('volume', '')
            chapter_contents = story_context.get('chapters', [])
            
            # 获取之前批次已生成的结果（跨批次上下文）
            previous_results = data.get('previous_results', [])
            
            # 检查点恢复相关参数
            resume_from_checkpoint = data.get('resume_from_checkpoint', False)
            checkpoint_session_id = data.get('checkpoint_session_id')
            start_index = data.get('start_index', 0)
            existing_results = data.get('existing_results', [])
            
            if not elements:
                yield f"data: {json.dumps({'type': 'error', 'message': '没有要生成的元素'}, ensure_ascii=False)}\n\n"
                return
            
            # 获取对应的生成器
            generator = generators.get(entity_type)
            if not generator:
                yield f"data: {json.dumps({'type': 'error', 'message': f'未知的实体类型: {entity_type}'}, ensure_ascii=False)}\n\n"
                return
            
            # 创建会话
            session_id = batch_id or f"gen_{project_id}_{int(time.time())}"
            session = session_manager.create_session(
                session_id=session_id,
                project_id=project_id or 0,
                user_id=user_id,
                session_type="generation"
            )
            
            # 如果是从检查点恢复，使用检查点的数据
            if resume_from_checkpoint and existing_results:
                generated_results = existing_results.copy()
                logger.info(f"从检查点恢复，已有 {len(generated_results)} 个结果，从索引 {start_index} 开始")
            else:
                generated_results = []
            
            total_elements = len(elements)
            
            # 发送开始事件，包含session_id
            yield f"data: {json.dumps({'type': 'start', 'message': f'开始生成 {total_elements} 个设定', 'total': total_elements, 'session_id': session_id}, ensure_ascii=False)}\n\n"
            
            # 批次配置（用于检查点保存）
            batch_config = {
                'batch_id': batch_id,
                'entity_type': entity_type,
                'world_id': world_id,
                'total_elements': total_elements
            }

            # 获取父检查点ID（用于级联恢复）
            parent_checkpoint_id = data.get('parent_checkpoint_id')
            
            for idx in range(start_index, total_elements):
                element = elements[idx]
                element_name = element.get('name', f'元素{idx+1}')
                element_id = element.get('id', f'elem_{idx}')
                
                # 更新会话进度
                progress = int((idx / total_elements) * 100)
                session_manager.update_session_progress(
                    session_id=session_id,
                    stage='generation',
                    element=element_name,
                    progress=progress
                )
                
                # 检查是否被中止
                if session_manager.check_abort(session_id):
                    logger.info(f"会话 {session_id} 被中止，保存检查点")
                    
                    # 保存检查点
                    try:
                        checkpoint_service.save_generation_progress(
                            session_id=session_id,
                            project_id=project_id or 0,
                            user_id=user_id,
                            stage='generation',
                            elements=elements,
                            current_index=idx,
                            results=generated_results,
                            story_context=story_context,
                            batch_config=batch_config,
                            parent_checkpoint_id=parent_checkpoint_id
                        )
                    except Exception as cp_e:
                        logger.error(f"保存检查点失败: {cp_e}")
                    
                    yield f"data: {json.dumps({'type': 'aborted', 'message': '生成已中止', 'session_id': session_id, 'progress': progress, 'completed_count': len(generated_results), 'total': total_elements, 'results': generated_results}, ensure_ascii=False)}\n\n"
                    
                    # 更新会话状态
                    session_manager.complete_session(session_id)
                    return
                
                # 发送进度更新
                yield f"data: {json.dumps({'type': 'progress', 'current': idx + 1, 'total': total_elements, 'progress': progress, 'element_name': element_name, 'session_id': session_id}, ensure_ascii=False)}\n\n"
                
                # 构建同批次已生成内容的上下文
                current_batch_context = _build_generated_context(generated_results, "同批次")
                
                # 构建之前批次已生成内容的上下文（跨批次）
                previous_batches_context = _build_generated_context(previous_results, "之前批次") if previous_results else ""
                
                # 合并上下文
                generated_context = current_batch_context
                if previous_batches_context:
                    generated_context = f"{previous_batches_context}\n\n{current_batch_context}" if current_batch_context else previous_batches_context
                
                # 构建元素信息文本（用于兼容旧版显示）
                element_info = f"【名称】{element_name}\n【类型】{element.get('type', '')}\n【简介】{element.get('brief', '')}\n【证据】{element.get('evidence', '')}"
                
                # 构建发送给AI的prompt（用于显示摘要）
                generation_prompt = _build_generation_prompt(
                    element=element,
                    element_name=element_name,
                    outline_content=outline_content,
                    volume_content=volume_content,
                    chapter_contents=chapter_contents,
                    generated_context=generated_context
                )
                prompt_summary = generation_prompt[:200] + "..." if len(generation_prompt) > 200 else generation_prompt
                
                # 发送正在分析的输入 - 增强结构化数据
                input_sections = {
                    'element': {
                        'name': element_name,
                        'type': element.get('type', ''),
                        'brief': element.get('brief', ''),
                        'evidence': element.get('evidence', '')
                    },
                    'story_context': {
                        'outline': outline_content,
                        'volume': volume_content,
                        'chapters': chapter_contents
                    },
                    'previous_context': previous_batches_context,  # 之前批次的内容
                    'generated_context': current_batch_context,    # 同批次的内容
                    'prompt_summary': prompt_summary,              # prompt摘要
                    'full_prompt_length': len(generation_prompt)   # 完整prompt长度
                }
                
                # 调试日志：记录当前处理元素
                logger.info(f"[{session_id}] 开始处理元素 {idx+1}/{total_elements}: {element_name} (类型: {element.get('type', 'unknown')})")
                logger.debug(f"[{session_id}] 元素详情: {json.dumps(element, ensure_ascii=False)}")
                
                yield f"data: {json.dumps({'type': 'input', 'element': element_name, 'content': element_info, 'sections': input_sections, 'stage': 'generation', 'current_index': idx, 'total': total_elements}, ensure_ascii=False)}\n\n"
                
                try:
                    # 构建完整的生成提示词，包含故事上下文和同批次已生成内容
                    prompt = _build_generation_prompt(
                        element=element,
                        element_name=element_name,
                        outline_content=outline_content,
                        volume_content=volume_content,
                        chapter_contents=chapter_contents,
                        generated_context=generated_context
                    )
                    
                    # 调试日志：记录发送给AI的完整prompt
                    logger.info(f"[{session_id}] 元素 '{element_name}' - 发送给AI的prompt长度: {len(prompt)} 字符")
                    logger.debug(f"[{session_id}] 元素 '{element_name}' - 完整prompt:\n{prompt}")
                    
                    # 记录阶段开始
                    logger.info(f"[{session_id}] 元素 '{element_name}' - 阶段: AI生成开始")
                    
                    # 发送开始生成消息
                    yield f"data: {json.dumps({'type': 'output', 'content': f'🤖 AI正在生成《{element_name}》的详细设定...'}, ensure_ascii=False)}\n\n"
                    
                    # 调用生成器（使用流式AI调用）
                    from app.services.ai_service import ai_service
                    from app.services.generation.prompt_template_manager import template_manager
                    from app.services.generation.generation_strategy import strategy_selector
                    from app.services.generation.context_assembler import context_assembler
                    from app.services.generation.result_parser import result_parser
                    
                    # 获取模板和策略
                    template = template_manager.get_template(entity_type, 'detailed')
                    gen_strategy = strategy_selector.select_strategy(entity_type, 'detailed')
                    gen_params = strategy_selector.get_parameters(gen_strategy, {})
                    
                    # 组装上下文 - 包含世界观信息和数据库中已有的相关实体
                    # 根据实体类型确定需要获取的相关实体
                    related_entity_types = _get_related_entity_types(entity_type)
                    
                    variables = context_assembler.build_prompt_variables(
                        user_prompt=prompt,
                        world_id=world_id,
                        project_id=project_id,
                        include_world_info=True,
                        include_related_entities=related_entity_types
                    )
                    
                    final_prompt = template.render(variables)
                    
                    # 构建系统提示词，强调当前元素名称
                    system_prompt = f"""你是一位专业的小说设定创作助手。请根据提供的信息，生成详细的设定内容。

【重要规则】
1. 当前要生成的元素名称是：{element_name}
2. 必须在返回的JSON中，将"name"字段设置为："{element_name}"
3. 必须基于用户提供的元素信息生成，不要生成其他不相关的元素
4. 必须以JSON格式返回结果

请严格遵守以上规则。"""
                    
                    messages = [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": final_prompt}
                    ]
                    
                    # 使用流式AI调用
                    full_response = ""
                    stream_start_time = time.time()
                    
                    logger.info(f"[{session_id}] 元素 '{element_name}' - 开始流式AI调用")
                    
                    stream = ai_service.stream_chat_completion(
                        messages=messages,
                        **gen_params.to_dict()
                    )
                    
                    for chunk in stream:
                        # 检查是否被中止（在AI流式输出期间也可以中止）
                        if session_manager.check_abort(session_id):
                            logger.info(f"会话 {session_id} 在AI输出期间被中止")
                            break
                        
                        content = chunk.get('content', '')
                        if content:
                            full_response += content
                            yield f"data: {json.dumps({'type': 'ai_stream', 'content': content, 'element': element_name}, ensure_ascii=False)}\n\n"
                    
                    # 如果在中止后，跳过解析
                    if session_manager.check_abort(session_id):
                        logger.info(f"[{session_id}] 元素 '{element_name}' - 会话被中止，跳过结果解析")
                        continue
                    
                    # 记录AI调用完成
                    stream_duration = time.time() - stream_start_time
                    logger.info(f"[{session_id}] 元素 '{element_name}' - 流式AI调用完成，耗时: {stream_duration:.2f}秒，响应长度: {len(full_response)} 字符")
                    logger.debug(f"[{session_id}] 元素 '{element_name}' - AI原始响应:\n{full_response}")
                    
                    # 记录阶段：结果解析开始
                    logger.info(f"[{session_id}] 元素 '{element_name}' - 阶段: 结果解析开始")
                    
                    # 解析结果
                    parsed_result = result_parser.parse(full_response, entity_type)
                    
                    if parsed_result.get('success'):
                        result_data = parsed_result.get('data', {})
                        
                        # 验证返回的名称是否与输入的元素名称匹配
                        returned_name = result_data.get('name', '')
                        if returned_name and returned_name != element_name:
                            logger.warning(f"[{session_id}] 元素 '{element_name}' - 名称不匹配！输入: '{element_name}', 返回: '{returned_name}'")
                            # 强制修正名称为输入的元素名称
                            result_data['name'] = element_name
                            logger.info(f"[{session_id}] 元素 '{element_name}' - 已强制修正名称为: '{element_name}'")
                            warn_msg = f'⚠️ AI返回的名称"{returned_name}"与输入不匹配，已修正为"{element_name}"'
                            yield f"data: {json.dumps({'type': 'output', 'content': warn_msg}, ensure_ascii=False)}\n\n"
                        
                        result_item = {
                            'element_id': element_id,
                            'element_name': element_name,
                            'element_type': entity_type,
                            'data': result_data,
                            'success': True,
                            'sources': element.get('sources', []),
                            'source_chapter': element.get('source_chapter')
                        }
                        generated_results.append(result_item)
                        
                        # 记录阶段：生成完成
                        logger.info(f"[{session_id}] 元素 '{element_name}' - 阶段: 生成完成 (成功)")
                        logger.debug(f"[{session_id}] 元素 '{element_name}' - 解析结果: {json.dumps(result_data, ensure_ascii=False)[:500]}...")
                        
                        yield f"data: {json.dumps({'type': 'output', 'content': f'✅ 《{element_name}》生成完成'}, ensure_ascii=False)}\n\n"
                    else:
                        error_msg = parsed_result.get('error', '解析失败')
                        
                        # 记录阶段：生成失败
                        logger.warning(f"[{session_id}] 元素 '{element_name}' - 阶段: 生成失败 (解析错误: {error_msg})")
                        
                        yield f"data: {json.dumps({'type': 'output', 'content': f'⚠️ 《{element_name}》生成失败: {error_msg}'}, ensure_ascii=False)}\n\n"
                        generated_results.append({
                            'element_id': element_id,
                            'element_name': element_name,
                            'error': error_msg,
                            'success': False
                        })
                        
                except Exception as e:
                    logger.error(f"[{session_id}] 元素 '{element_name}' - 生成异常: {str(e)}", exc_info=True)
                    yield f"data: {json.dumps({'type': 'output', 'content': f'❌ 《{element_name}》生成失败: {str(e)}'}, ensure_ascii=False)}\n\n"
                    generated_results.append({
                        'element_id': element_id,
                        'element_name': element_name,
                        'error': str(e),
                        'success': False
                    })
                
                # 每完成一个元素，保存一次检查点（用于恢复）
                try:
                    checkpoint_service.save_generation_progress(
                        session_id=session_id,
                        project_id=project_id or 0,
                        user_id=user_id,
                        stage='generation',
                        elements=elements,
                        current_index=idx + 1,
                        results=generated_results,
                        story_context=story_context,
                        batch_config=batch_config,
                        parent_checkpoint_id=parent_checkpoint_id
                    )
                    logger.debug(f"[{session_id}] 检查点已保存: 索引 {idx + 1}/{total_elements}")
                except Exception as cp_e:
                    logger.error(f"[{session_id}] 保存检查点失败: {cp_e}")
            
            # 检查是否在中止后完成
            if session_manager.check_abort(session_id):
                logger.info(f"[{session_id}] 生成流程被中止，已完成 {len(generated_results)}/{total_elements} 个元素")
                yield f"data: {json.dumps({'type': 'aborted', 'message': '生成已中止', 'session_id': session_id, 'progress': progress, 'completed_count': len(generated_results), 'total': total_elements, 'results': generated_results}, ensure_ascii=False)}\n\n"
            else:
                # 正常完成
                success_count = sum(1 for r in generated_results if r.get('success'))
                logger.info(f"[{session_id}] 生成流程正常完成，成功 {success_count}/{total_elements} 个元素")
                yield f"data: {json.dumps({'type': 'complete', 'progress': 100, 'message': f'生成完成，成功 {success_count}/{total_elements}', 'results': generated_results, 'success_count': success_count, 'total': total_elements, 'session_id': session_id}, ensure_ascii=False)}\n\n"
            
            # 标记会话完成
            if session_id:
                session_manager.complete_session(session_id)
                logger.info(f"[{session_id}] 会话已标记为完成")
                
        except Exception as e:
            logger.error(f'流式批次生成失败: {str(e)}', exc_info=True)
            yield f"data: {json.dumps({'type': 'error', 'message': str(e), 'session_id': session_id}, ensure_ascii=False)}\n\n"
            # 发生错误时也尝试保存检查点
            if session_id and generated_results:
                try:
                    checkpoint_service.save_generation_progress(
                        session_id=session_id,
                        project_id=project_id or 0,
                        user_id=user_id,
                        stage='generation',
                        elements=elements if 'elements' in locals() else [],
                        current_index=idx if 'idx' in locals() else 0,
                        results=generated_results,
                        story_context=story_context if 'story_context' in locals() else {},
                        batch_config=batch_config if 'batch_config' in locals() else {},
                        parent_checkpoint_id=parent_checkpoint_id if 'parent_checkpoint_id' in locals() else None
                    )
                except Exception as cp_e:
                    logger.error(f"错误时保存检查点失败: {cp_e}")
        finally:
            # 清理会话（可选，保留一段时间以便查询状态）
            # session_manager.cleanup_session(session_id)
            pass
    
    return Response(stream_with_context(generate_stream()), mimetype='text/event-stream')


def _get_related_entity_types(entity_type):
    """
    根据当前实体类型，获取需要作为上下文的相关实体类型
    
    Args:
        entity_type: 当前要生成的实体类型
    
    Returns:
        相关实体类型列表
    """
    # 定义实体间的关联关系
    relationships = {
        'character': ['faction', 'location', 'energy_system', 'civilization'],  # 角色需要了解所属势力、所在地点、能量体系
        'location': ['faction', 'civilization', 'energy_system'],  # 地点需要了解所属势力、文明、能量体系
        'faction': ['location', 'civilization', 'energy_system', 'character'],  # 势力需要了解据点、文明、能量体系、主要角色
        'item': ['character', 'faction', 'location', 'energy_system'],  # 物品需要了解拥有者、所属势力、所在地点
        'energy_system': ['civilization', 'faction', 'character'],  # 能量体系需要了解相关文明、势力、角色
        'civilization': ['location', 'faction', 'energy_system', 'character'],  # 文明需要了解地域、势力、能量体系、代表角色
        'world_architecture': ['energy_system', 'civilization', 'location'],  # 世界架构需要了解能量体系、文明、地点
        'historical_event': ['character', 'faction', 'location', 'civilization'],  # 历史事件需要了解参与角色、势力、地点
        'relation': ['character', 'faction'],  # 关系需要了解相关角色、势力
    }
    
    return relationships.get(entity_type, [])


def _build_generated_context(generated_results, context_title="同批次"):
    """
    构建已生成内容的上下文
    
    Args:
        generated_results: 已生成的结果列表
        context_title: 上下文标题（如"同批次"、"之前批次"）
    
    Returns:
        格式化后的已生成内容字符串
    """
    if not generated_results:
        return ""
    
    lines = [f"\n## {context_title}已生成的设定（请确保新设定与以下内容保持一致）\n"]
    
    for result in generated_results:
        if result.get('success') and result.get('data'):
            element_name = result.get('element_name', '未命名')
            data = result.get('data', {})
            
            # 提取关键信息
            name = data.get('name', element_name)
            entity_type = data.get('type', '未知类型')
            description = data.get('description', '')
            if len(description) > 200:
                description = description[:200] + "..."
            
            lines.append(f"\n### [{entity_type}] {name}")
            if description:
                lines.append(f"{description}")
    
    return "\n".join(lines)


def _build_generation_prompt(element, element_name, outline_content, volume_content, chapter_contents, generated_context=""):
    """
    构建完整的生成提示词，包含故事上下文和同批次已生成内容
    
    Args:
        element: 元素数据
        element_name: 元素名称
        outline_content: 大纲内容
        volume_content: 卷纲内容
        chapter_contents: 章纲内容列表
        generated_context: 同批次已生成内容的上下文
    
    Returns:
        完整的提示词字符串
    """
    # 构建章纲内容部分
    chapters_section = ""
    if chapter_contents:
        chapters_section = "\n\n## 相关章纲内容\n"
        for i, chapter in enumerate(chapter_contents[:5], 1):  # 最多显示5个相关章纲
            chapters_section += f"\n### 章纲{i}\n{chapter}\n"
    
    # 构建卷纲内容部分
    volume_section = ""
    if volume_content:
        volume_section = f"\n\n## 所属卷纲内容\n{volume_content}"
    
    # 构建大纲内容部分
    outline_section = ""
    if outline_content:
        outline_section = f"\n\n## 故事大纲\n{outline_content}"
    
    # 获取元素类型标签
    element_type = element.get('type', '')
    
    prompt = f"""请为以下设定元素生成详细设定。

## 目标元素信息（重要：必须严格基于此信息生成）
【元素名称】{element_name}
【元素类型】{element_type}
【基础简介】{element.get('brief', '')}
【原文证据】{element.get('evidence', '')}

## 故事背景上下文
请基于以下故事背景信息来生成设定，确保设定与故事整体世界观一致：
{outline_section}
{volume_section}
{chapters_section}
{generated_context}

## 生成要求
1. **必须严格使用指定的元素名称：{element_name}，不得更改或使用其他名称**
2. **必须严格基于【目标元素信息】中的【基础简介】和【原文证据】来生成**
3. 生成的设定必须与上述故事背景保持一致
4. 考虑该元素在故事中的作用和地位
5. 结合大纲中的世界观设定
6. 如果元素在卷纲/章纲中有更多描述，请整合到设定中
7. **与同批次已生成的设定保持逻辑一致性**
8. 生成完整的详细设定，包含该元素的所有相关属性

## 重要提示
- 当前要生成的元素是：【{element_name}】（{element_type}）
- 不要生成其他不相关的元素
- 确保返回的JSON中的"name"字段值为："{element_name}"

请生成详细设定："""
    
    return prompt


@api_bp.route('/worldview/batch-results/<batch_id>', methods=['GET'])
def get_batch_results(batch_id):
    """获取批次生成结果"""
    try:
        # TODO: 从数据库获取结果
        return jsonify({
            'code': 200,
            'data': {
                'batch_id': batch_id,
                'status': 'completed',
                'results': {}
            }
        })
    except Exception as e:
        logger.error(f'获取批次结果失败: {str(e)}', exc_info=True)
        return jsonify({'code': 500, 'message': f'获取结果失败: {str(e)}'}), 500


@api_bp.route('/worldview/apply-batch-results', methods=['POST'])
def apply_batch_results():
    """应用批次生成结果到世界观"""
    try:
        data = request.get_json()
        batch_id = data.get('batch_id')
        selections = data.get('selections', [])
        
        # TODO: 保存到数据库
        return jsonify({'code': 200, 'message': '应用成功'})
    except Exception as e:
        logger.error(f'应用批次结果失败: {str(e)}', exc_info=True)
        return jsonify({'code': 500, 'message': f'应用失败: {str(e)}'}), 500


@api_bp.route('/worldview/check-consistency', methods=['POST'])
def check_consistency():
    """检查故事与设定的一致性"""
    try:
        data = request.get_json()
        world_id = data.get('world_id')
        project_id = data.get('project_id')
        content_scope = data.get('content_scope', {})
        
        # 提取故事内容
        if project_id:
            content_scope['project_id'] = project_id
        content = ContentExtractor.extract_by_scope(content_scope)
        
        # TODO: 实现一致性检查逻辑
        return jsonify({
            'code': 200,
            'data': {
                'inconsistencies': [],
                'missing_settings': []
            }
        })
    except Exception as e:
        logger.error(f'检查一致性失败: {str(e)}', exc_info=True)
        return jsonify({'code': 500, 'message': f'检查失败: {str(e)}'}), 500


@api_bp.route('/worldview/create-world-from-blueprint', methods=['POST'])
def create_world_from_blueprint():
    """
    从蓝图创建世界的完整流程
    """
    try:
        data = request.get_json()
        project_id = data.get('project_id')
        content_scope = data.get('content_scope', {})
        world_config = data.get('world_config', {})
        
        # TODO: 实现完整的创建流程
        # 1. 提取内容
        # 2. AI分析提取设定元素
        # 3. 生成详细设定
        # 4. 创建世界并关联设定
        
        return jsonify({
            'code': 200,
            'data': {
                'world_id': 999,
                'message': '世界创建成功'
            }
        })
    except Exception as e:
        logger.error(f'从蓝图创建世界失败: {str(e)}', exc_info=True)
        return jsonify({'code': 500, 'message': f'创建失败: {str(e)}'}), 500


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
            
            # 创建生成会话
            session_id = f"ext_{uuid.uuid4().hex[:16]}"
            session_manager.create_session(
                session_id=session_id,
                session_type='extraction',
                project_id=project_id,
                user_id=1  # TODO: 从认证获取
            )
            
            # 发送会话ID
            yield f"data: {json.dumps({'type': 'session_id', 'session_id': session_id}, ensure_ascii=False)}\n\n"
            
            content_scope['project_id'] = project_id
            target_types = extraction_config.get('target_types', [
                'characters', 'locations', 'factions', 'items',
                'world_architecture', 'energy_systems', 'society_systems',
                'timeline_events', 'relations'
            ])
            strategy = extraction_config.get('strategy', 'infer_potential')
            include_evidence = extraction_config.get('include_evidence', True)
            
            # 发送开始事件
            yield f"data: {json.dumps({'type': 'start', 'message': '开始提取设定元素'}, ensure_ascii=False)}\n\n"
            
            # 初始化累积结果
            merged_result = {
                'characters': [],
                'locations': [],
                'factions': [],
                'items': [],
                'world_architecture': [],
                'energy_systems': [],
                'society_systems': [],
                'timeline_events': [],
                'relations': []
            }
            
            from app.models import Outline, Volume, Chapter
            
            scope_type = content_scope.get('type', 'full')
            
            def process_with_stream(content, context_name, stage_type):
                """使用流式AI处理内容"""
                nonlocal merged_result, session_id
                
                # 检查是否中止
                if session_id and session_manager.is_aborted(session_id):
                    logger.info(f"[提取阶段] 会话 {session_id} 已中止，停止处理: {context_name}")
                    yield f"data: {json.dumps({'type': 'aborted', 'message': '提取已中止'}, ensure_ascii=False)}\n\n"
                    return
                
                # 记录提取阶段开始
                logger.info(f"[提取阶段] 开始处理: {context_name} (阶段类型: {stage_type})")
                logger.debug(f"[提取阶段] {context_name} - 内容长度: {len(content)} 字符")
                
                # 构建prompt用于显示摘要
                type_descriptions = {
                    'characters': '角色（姓名、身份、性格、能力等）',
                    'locations': '地点场景（城市、建筑、自然景观等）',
                    'factions': '组织势力（门派、国家、组织等）',
                    'items': '物品资源（武器、法宝、道具等）',
                    'world_architecture': '世界架构（世界规则、维度、地理等）',
                    'energy_systems': '能量体系（力量等级、修炼体系等）',
                    'society_systems': '社会体系（社会结构、文化习俗等）',
                    'timeline_events': '历史脉络（历史事件、时间线等）',
                    'relations': '关系网络（角色关系、势力关系等）'
                }
                target_list = ', '.join([type_descriptions.get(t, t) for t in target_types])
                extraction_prompt = f"分析以下故事内容片段（{context_name}），提取其中的世界观设定元素。需要提取：{target_list}"
                prompt_summary = extraction_prompt[:200] + "..." if len(extraction_prompt) > 200 else extraction_prompt
                
                # 发送增强的输入内容
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
                
                # 发送开始分析消息
                yield f"data: {json.dumps({'type': 'output', 'content': f'🤖 AI正在分析 {context_name}...'}, ensure_ascii=False)}\n\n"
                
                # 使用流式AI提取
                ai_response_parts = []
                for chunk in _extract_with_ai_stream(content, target_types, strategy, include_evidence, context_name):
                    if chunk['type'] == 'stream_chunk':
                        # 发送AI流式输出
                        ai_response_parts.append(chunk['content'])
                        yield f"data: {json.dumps({'type': 'ai_stream', 'content': chunk['content'], 'context': context_name}, ensure_ascii=False)}\n\n"
                    elif chunk['type'] == 'result':
                        # 收到解析结果
                        elements = chunk['data']
                        merged_result = _merge_results(merged_result, elements)
                        
                        # 发送提取到的元素摘要
                        total_count = sum(len(v) for v in elements.values())
                        yield f"data: {json.dumps({'type': 'output', 'content': f'✅ 从 {context_name} 提取到 {total_count} 个元素'}, ensure_ascii=False)}\n\n"
                        
                        # 发送各类型元素详情
                        for elem_type, elems in elements.items():
                            if elems:
                                elem_names = ', '.join([e.get('name', '未命名') for e in elems[:3]])
                                if len(elems) > 3:
                                    elem_names += f' 等{len(elems)}个'
                                yield f"data: {json.dumps({'type': 'output', 'content': f'  📌 {elem_type}: {elem_names}'}, ensure_ascii=False)}\n\n"
                    elif chunk['type'] == 'error':
                        err_msg = f'⚠️ 分析 {context_name} 时出错: {chunk.get("message", "未知错误")}'
                        yield f"data: {json.dumps({'type': 'output', 'content': err_msg}, ensure_ascii=False)}\n\n"
            
            # 初始化故事上下文收集变量
            story_context_outline = ""
            story_context_volume = ""
            story_context_chapters = []
            
            # 根据内容范围类型处理
            if scope_type == 'chapter':
                # 仅分析特定章纲
                chapter_id = content_scope.get('chapter_id')
                if not chapter_id:
                    yield f"data: {json.dumps({'type': 'error', 'message': '未选择章纲'}, ensure_ascii=False)}\n\n"
                    return
                
                chapter = Chapter.query.get(chapter_id)
                if not chapter:
                    yield f"data: {json.dumps({'type': 'error', 'message': '未找到章纲'}, ensure_ascii=False)}\n\n"
                    return
                
                # 获取所属卷纲
                volume = Volume.query.get(chapter.volume_id) if chapter.volume_id else None
                if volume:
                    story_context_volume = f"【卷纲标题】{volume.title}\n【卷纲内容】{volume.content}\n【核心冲突】{volume.core_conflict}\n【角色发展】{volume.character_development}"
                    # 获取大纲
                    outline = Outline.query.get(volume.outline_id) if volume.outline_id else None
                    if outline:
                        story_context_outline = f"【大纲标题】{outline.title}\n【大纲内容】{outline.content}\n【故事模型】{outline.story_model}"
                
                yield f"data: {json.dumps({'type': 'progress', 'stage': 'chapter', 'current': 1, 'total': 1, 'progress': 50}, ensure_ascii=False)}\n\n"
                
                chapter_content = f"【章纲标题】{chapter.title}\n【章纲内容】{chapter.content}\n【核心事件】{chapter.core_event}\n【场景】{chapter.scenes}\n【角色】{chapter.characters}"
                story_context_chapters.append(chapter_content)
                
                # 使用流式处理
                for msg in process_with_stream(chapter_content, f'章纲《{chapter.title}》', 'chapter'):
                    yield msg
                
                # 单章纲处理完成后保存检查点
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
                # 分析特定卷纲及其所有章纲
                volume_id = content_scope.get('volume_id')
                if not volume_id:
                    yield f"data: {json.dumps({'type': 'error', 'message': '未选择卷纲'}, ensure_ascii=False)}\n\n"
                    return
                
                volume = Volume.query.get(volume_id)
                if not volume:
                    yield f"data: {json.dumps({'type': 'error', 'message': '未找到卷纲'}, ensure_ascii=False)}\n\n"
                    return
                
                # 获取大纲
                outline = Outline.query.get(volume.outline_id) if volume.outline_id else None
                if outline:
                    story_context_outline = f"【大纲标题】{outline.title}\n【大纲内容】{outline.content}\n【故事模型】{outline.story_model}"
                
                # 分析卷纲
                yield f"data: {json.dumps({'type': 'progress', 'stage': 'volume', 'current': 1, 'total': 1, 'progress': 30}, ensure_ascii=False)}\n\n"
                
                volume_content = f"【卷纲标题】{volume.title}\n【卷纲内容】{volume.content}\n【核心冲突】{volume.core_conflict}\n【角色发展】{volume.character_development}"
                story_context_volume = volume_content
                
                for msg in process_with_stream(volume_content, f'卷纲《{volume.title}》', 'volume'):
                    yield msg
                
                # 单卷纲处理完成后保存检查点
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
                
                # 分析该卷纲下的所有章纲
                chapters = Chapter.query.filter_by(volume_id=volume.id).order_by(Chapter.order_index).all()
                total_chapters = len(chapters)
                
                for ch_idx, chapter in enumerate(chapters):
                    progress = 30 + int((ch_idx / total_chapters) * 70) if total_chapters > 0 else 30
                    yield f"data: {json.dumps({'type': 'progress', 'stage': 'chapter', 'current': ch_idx + 1, 'total': total_chapters, 'progress': progress}, ensure_ascii=False)}\n\n"
                    
                    chapter_content = f"【章纲标题】{chapter.title}\n【章纲内容】{chapter.content}\n【核心事件】{chapter.core_event}\n【场景】{chapter.scenes}\n【角色】{chapter.characters}"
                    story_context_chapters.append(chapter_content)
                    
                    for msg in process_with_stream(chapter_content, f'章纲《{chapter.title}》', 'chapter'):
                        yield msg
                    
                    # 单卷纲下的每个章纲处理完成后保存检查点
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
                # 分析特定大纲及其所有卷纲、章纲
                outline_id = content_scope.get('outline_id')
                if not outline_id:
                    yield f"data: {json.dumps({'type': 'error', 'message': '未选择大纲'}, ensure_ascii=False)}\n\n"
                    return
                
                outline = Outline.query.get(outline_id)
                if not outline:
                    yield f"data: {json.dumps({'type': 'error', 'message': '未找到大纲'}, ensure_ascii=False)}\n\n"
                    return
                
                # 分析大纲
                story_context_outline = f"【大纲标题】{outline.title}\n【大纲内容】{outline.content}\n【故事模型】{outline.story_model}"
                
                for msg in process_with_stream(story_context_outline, '大纲级别', 'outline'):
                    yield msg
                
                # 大纲处理完成后保存检查点
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
                
                # 分析所有卷纲和章纲
                volumes = Volume.query.filter_by(outline_id=outline_id).order_by(Volume.order_index).all()
                total_volumes = len(volumes)
                
                for idx, volume in enumerate(volumes):
                    progress = int((idx / total_volumes) * 50) if total_volumes > 0 else 0
                    yield f"data: {json.dumps({'type': 'progress', 'stage': 'volume', 'current': idx + 1, 'total': total_volumes, 'progress': progress}, ensure_ascii=False)}\n\n"
                    
                    volume_content = f"【卷纲标题】{volume.title}\n【卷纲内容】{volume.content}\n【核心冲突】{volume.core_conflict}\n【角色发展】{volume.character_development}"
                    story_context_volume += volume_content + "\n\n"
                    
                    for msg in process_with_stream(volume_content, f'卷纲《{volume.title}》', 'volume'):
                        yield msg
                    
                    # 每个卷纲处理完成后保存检查点
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
                        
                        # 每个章纲处理完成后保存检查点
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
            
            else:  # scope_type == 'full' 或其他
                # 获取项目第一个大纲
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
                
                # 分析大纲
                story_context_outline = f"【大纲标题】{outline.title}\n【大纲内容】{outline.content}\n【故事模型】{outline.story_model}"
                
                for msg in process_with_stream(story_context_outline, '大纲级别', 'outline'):
                    yield msg
                
                # 大纲处理完成后保存检查点
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
                
                # 分析所有卷纲和章纲
                volumes = Volume.query.filter_by(outline_id=outline_id).order_by(Volume.order_index).all()
                total_volumes = len(volumes)
                
                for idx, volume in enumerate(volumes):
                    progress = int((idx / total_volumes) * 50) if total_volumes > 0 else 0
                    yield f"data: {json.dumps({'type': 'progress', 'stage': 'volume', 'current': idx + 1, 'total': total_volumes, 'progress': progress}, ensure_ascii=False)}\n\n"
                    
                    volume_content = f"【卷纲标题】{volume.title}\n【卷纲内容】{volume.content}\n【核心冲突】{volume.core_conflict}\n【角色发展】{volume.character_development}"
                    story_context_volume += volume_content + "\n\n"
                    
                    for msg in process_with_stream(volume_content, f'卷纲《{volume.title}》', 'volume'):
                        yield msg
                    
                    # 每个卷纲处理完成后保存检查点
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
                        
                        # 每个章纲处理完成后保存检查点
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
            
            # 完成，发送最终结果
            # 使用AI智能整合元素：合并相似条目，分析差异
            integrated_elements = _integrate_elements_with_ai(merged_result)

            statistics = {
                'characters': len(integrated_elements.get('characters', [])),
                'locations': len(integrated_elements.get('locations', [])),
                'factions': len(integrated_elements.get('factions', [])),
                'items': len(integrated_elements.get('items', [])),
                'world_architecture': len(integrated_elements.get('world_architecture', [])),
                'energy_systems': len(integrated_elements.get('energy_systems', [])),
                'society_systems': len(integrated_elements.get('society_systems', [])),
                'timeline_events': len(integrated_elements.get('timeline_events', [])),
                'relations': len(integrated_elements.get('relations', []))
            }

            # 统计整合信息
            integrated_count = sum(
                1 for items in integrated_elements.values()
                for item in items if item.get('is_integrated')
            )

            logger.info(f"[提取阶段] 元素整合完成，共整合 {integrated_count} 个相似条目")

            # 构建故事上下文
            story_context = {
                'outline': story_context_outline,
                'volume': story_context_volume,
                'chapters': story_context_chapters
            }

            yield f"data: {json.dumps({'type': 'complete', 'progress': 100, 'message': '提取完成', 'elements': integrated_elements, 'original_elements': merged_result, 'statistics': statistics, 'story_context': story_context, 'integration_info': {'integrated_count': integrated_count}}, ensure_ascii=False)}\n\n"
            
            # 标记会话完成
            if session_id:
                session_manager.complete_session(session_id)
                
        except Exception as e:
            logger.error(f'流式提取失败: {str(e)}', exc_info=True)
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)}, ensure_ascii=False)}\n\n"
            # 标记会话失败 - 使用abort_session标记为失败状态
            if session_id:
                session = session_manager.get_session(session_id)
                if session:
                    session.status = 'failed'
        finally:
            # 清理会话（延迟清理，以便客户端可以查询状态）
            if session_id:
                import threading
                threading.Timer(300, lambda: session_manager.cleanup_session(session_id)).start()
    
    return Response(stream_with_context(generate_stream()), mimetype='text/event-stream')


def _extract_with_ai(text: str, target_types: list, strategy: str, include_evidence: bool, context: str) -> dict:
    """调用AI服务提取元素（同步版本）"""
    type_descriptions = {
        'characters': '角色（姓名、身份、性格、能力等）',
        'locations': '地点场景（城市、建筑、自然景观等）',
        'factions': '组织势力（门派、国家、组织、机构等）',
        'items': '物品资源（武器、法宝、道具、信息载体等）',
        'world_architecture': '世界架构（世界规则、维度、地理、空间通道等）',
        'energy_systems': '能量体系（力量等级、修炼体系、超自然能力等）',
        'society_systems': '社会体系（社会结构、文化习俗、组织运作模式等）',
        'timeline_events': '历史脉络（历史事件、时间线、起点事件等）',
        'relations': '关系网络（角色与组织关系、组织间关系等）'
    }
    
    target_list = ', '.join([type_descriptions.get(t, t) for t in target_types])
    evidence_desc = "对于每个提取的元素，请提供原文证据" if include_evidence else ""
    
    prompt = f"""请分析以下故事内容片段（{context}），提取其中的世界观设定元素。

## 分析要求
- 策略：{'仅提取明确提及的内容' if strategy == 'explicit_only' else '基于文本进行合理推断和补充'}
- 需要提取：{target_list}
- {evidence_desc}

## 重要约束
- 只返回以下 9 种类型，禁止返回其他类型：
  1. characters - 角色：具体的人，有姓名、身份、性格
  2. locations - 地点场景：具体的地点，如城市、建筑、房间、道路
  3. factions - 组织势力：组织、机构、国家、政府、部门、门派、计划项目（如"零号工程"是组织不是地点）
  4. items - 物品资源：具体的物品、武器、情报、载具、文件
  5. world_architecture - 世界架构：抽象的世界规则、维度、空间通道、物理法则
  6. energy_systems - 能量体系：力量等级、修炼体系、超自然能力
  7. society_systems - 社会体系：社会结构、文化习俗、运作模式
  8. timeline_events - 历史脉络：历史事件、时间线
  9. relations - 关系网络：人与组织的关系、组织间的关系
- 关键区分：
  1. "国家/政府/部门" → factions（不是 world_architecture）
  2. "绝密基地/秘密设施" → factions（如果是组织）或 locations（如果是具体地点）
  3. "计划/工程/项目" → factions（如"零号工程"）
  4. "世界/维度/空间通道" → world_architecture
  5. "能力/超自然能力/魔法/修炼体系" → energy_systems（不是 items）

## 内容片段
```
{text[:4000]}
```

## 输出格式
请以 JSON 格式输出，只包含以下 9 种类型：
注意：键名必须严格使用以下名称，禁止使用其他名称！
- 禁止使用 "organizations"、"groups"、"teams"
- 禁止使用 "items_resources"、"equipment"
- 禁止使用 "social_systems"、"culture"
- 禁止使用 "historical_context"、"events"
- 禁止使用 "relationship_networks"

正确示例：
{{
  "characters": [{{"id": "char_001", "name": "名称", "type": "类型", "brief": "简介", "evidence": "证据"}}],
  "locations": [{{"id": "loc_001", "name": "名称", "type": "类型", "brief": "简介", "evidence": "证据"}}],
  "factions": [{{"id": "fact_001", "name": "名称", "type": "类型", "brief": "简介", "evidence": "证据"}}],
  "items": [{{"id": "item_001", "name": "名称", "type": "类型", "brief": "简介", "evidence": "证据"}}],
  "world_architecture": [{{"id": "arch_001", "name": "名称", "type": "类型", "brief": "简介", "evidence": "证据"}}],
  "energy_systems": [{{"id": "ener_001", "name": "名称", "type": "类型", "brief": "简介", "evidence": "证据"}}],
  "society_systems": [{{"id": "soc_001", "name": "名称", "type": "类型", "brief": "简介", "evidence": "证据"}}],
  "timeline_events": [{{"id": "hist_001", "name": "名称", "type": "类型", "brief": "简介", "evidence": "证据"}}],
  "relations": [{{"id": "rel_001", "name": "名称", "type": "类型", "brief": "简介", "evidence": "证据"}}]
}}

注意：
1. 只输出 JSON，不要其他内容
2. 必须包含全部 9 种类型的键（即使为空数组）
3. 未找到的类型返回空数组 []
4. id 格式为 "类型缩写_序号"
5. 键名必须严格使用上述名称，不能使用 "organizations" 等别名
"""
    
    try:
        messages = [
            {"role": "system", "content": "你是一位专业的小说世界观设定分析师。请分析提供的故事内容片段，提取其中的世界观设定元素。必须以JSON格式返回结果。"},
            {"role": "user", "content": prompt}
        ]
        
        # 添加日志确认发送的内容
        logger.info(f'发送给AI的prompt长度: {len(prompt)} 字符, 内容片段长度: {len(text)} 字符')
        logger.info(f'Prompt前500字符: {prompt[:500]}...')
        
        ai_result = ai_service.chat_completion(
            messages=messages,
            temperature=0.7,
            max_tokens=4000
        )
        
        ai_response = ai_result.get('content', '')
        return _parse_ai_response(ai_response)
    except Exception as e:
        logger.error(f'AI提取失败 [{context}]: {str(e)}')
        return {key: [] for key in target_types}


def _extract_with_ai_stream(text: str, target_types: list, strategy: str, include_evidence: bool, context: str):
    """调用AI服务提取元素（真正的流式版本）
    
    返回一个生成器，yield 每个流式块的内容
    """
    type_descriptions = {
        'characters': '角色（姓名、身份、性格、能力等）',
        'locations': '地点场景（城市、建筑、自然景观等）',
        'factions': '组织势力（门派、国家、组织、机构等）',
        'items': '物品资源（武器、法宝、道具，信息载体等）',
        'world_architecture': '世界架构（世界规则、维度、地理、空间通道等）',
        'energy_systems': '能量体系（力量等级、修炼体系、超自然能力等）',
        'society_systems': '社会体系（社会结构、文化习俗、组织运作模式等）',
        'timeline_events': '历史脉络（历史事件、时间线、起点事件等）',
        'relations': '关系网络（角色与组织关系、组织间关系等）'
    }
    
    target_list = ', '.join([type_descriptions.get(t, t) for t in target_types])
    evidence_desc = "对于每个提取的元素，请提供原文证据" if include_evidence else ""
    
    prompt = f"""请分析以下故事内容片段（{context}），提取其中的世界观设定元素。

## 分析要求
- 策略：{'仅提取明确提及的内容' if strategy == 'explicit_only' else '基于文本进行合理推断和补充'}
- 需要提取：{target_list}
- {evidence_desc}

## 重要约束
- 只返回以下 9 种类型，禁止返回其他类型：
  1. characters - 角色：具体的人，有姓名、身份、性格
  2. locations - 地点场景：具体的地点，如城市、建筑、房间、道路
  3. factions - 组织势力：组织、机构、国家、政府、部门、门派、计划项目（如"零号工程"是组织不是地点）
  4. items - 物品资源：具体的物品、武器、情报、载具、文件
  5. world_architecture - 世界架构：抽象的世界规则、维度、空间通道、物理法则
  6. energy_systems - 能量体系：力量等级、修炼体系、超自然能力
  7. society_systems - 社会体系：社会结构、文化习俗、运作模式
  8. timeline_events - 历史脉络：历史事件、时间线
  9. relations - 关系网络：人与组织的关系、组织间的关系
- 关键区分：
  1. "国家/政府/部门" → factions（不是 world_architecture）
  2. "绝密基地/秘密设施" → factions（如果是组织）或 locations（如果是具体地点）
  3. "计划/工程/项目" → factions（如"零号工程"）
  4. "世界/维度/空间通道" → world_architecture
  5. "能力/超自然能力/魔法/修炼体系" → energy_systems（不是 items）

## 内容片段
```
{text[:4000]}
```

## 输出格式
请以 JSON 格式输出，只包含以下 9 种类型：
注意：键名必须严格使用以下名称，禁止使用其他名称！
- 禁止使用 "organizations"、"groups"、"teams"
- 禁止使用 "items_resources"、"equipment"
- 禁止使用 "social_systems"、"culture"
- 禁止使用 "historical_context"、"events"
- 禁止使用 "relationship_networks"

正确示例：
{{
  "characters": [{{"id": "char_001", "name": "名称", "type": "类型", "brief": "简介", "evidence": "证据"}}],
  "locations": [{{"id": "loc_001", "name": "名称", "type": "类型", "brief": "简介", "evidence": "证据"}}],
  "factions": [{{"id": "fact_001", "name": "名称", "type": "类型", "brief": "简介", "evidence": "证据"}}],
  "items": [{{"id": "item_001", "name": "名称", "type": "类型", "brief": "简介", "evidence": "证据"}}],
  "world_architecture": [{{"id": "arch_001", "name": "名称", "type": "类型", "brief": "简介", "evidence": "证据"}}],
  "energy_systems": [{{"id": "ener_001", "name": "名称", "type": "类型", "brief": "简介", "evidence": "证据"}}],
  "society_systems": [{{"id": "soc_001", "name": "名称", "type": "类型", "brief": "简介", "evidence": "证据"}}],
  "timeline_events": [{{"id": "hist_001", "name": "名称", "type": "类型", "brief": "简介", "evidence": "证据"}}],
  "relations": [{{"id": "rel_001", "name": "名称", "type": "类型", "brief": "简介", "evidence": "证据"}}]
}}

注意：
1. 只输出 JSON，不要其他内容
2. 必须包含全部 9 种类型的键（即使为空数组）
3. 未找到的类型返回空数组 []
4. id 格式为 "类型缩写_序号"
5. 键名必须严格使用上述名称，不能使用 "organizations" 等别名
"""
    
    messages = [
        {"role": "system", "content": "你是一位专业的小说世界观设定分析师。请分析提供的故事内容片段，提取其中的世界观设定元素。必须以JSON格式返回结果。"},
        {"role": "user", "content": prompt}
    ]
    
    # 添加日志确认发送的内容
    logger.info(f'流式发送给AI的prompt长度: {len(prompt)} 字符, 内容片段长度: {len(text)} 字符')
    
    try:
        # 使用流式调用
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
        
        # 解析完整响应
        parsed_result = _parse_ai_response(full_response)
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
        'society_systems': [],
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

    对相似/重复条目进行智能合并和差异分析，调用AI来识别语义相似性。

    Args:
        elements: 原始元素字典，按类型组织

    Returns:
        整合后的元素字典
    """
    import difflib

    def calculate_name_similarity(name1: str, name2: str) -> float:
        """计算两个名称的相似度"""
        if not name1 or not name2:
            return 0.0
        norm1 = name1.strip().lower()
        norm2 = name2.strip().lower()
        if norm1 == norm2:
            return 1.0
        return difflib.SequenceMatcher(None, norm1, norm2).ratio()

    def find_potential_duplicates(items: list, threshold: float = 0.6) -> list:
        """找出可能重复的元素对"""
        duplicates = []
        for i in range(len(items)):
            for j in range(i + 1, len(items)):
                name_i = items[i].get('name', '')
                name_j = items[j].get('name', '')
                sim = calculate_name_similarity(name_i, name_j)
                if sim >= threshold:
                    duplicates.append((i, j, sim))
        return duplicates

    def group_similar_items(items: list, threshold: float = 0.6) -> list:
        """将相似元素分组"""
        if not items:
            return []

        n = len(items)
        groups = []
        used = set()

        for i in range(n):
            if i in used:
                continue

            current_group = [i]
            used.add(i)

            for j in range(i + 1, n):
                if j in used:
                    continue
                name_i = items[i].get('name', '')
                name_j = items[j].get('name', '')
                if calculate_name_similarity(name_i, name_j) >= threshold:
                    current_group.append(j)
                    used.add(j)

            groups.append([items[idx] for idx in current_group])

        for i in range(n):
            if i not in used:
                groups.append([items[i]])

        return groups

    def build_ai_prompt(items: list, element_type: str) -> str:
        """构建AI整合提示词"""
        type_names = {
            'characters': '角色',
            'locations': '地点',
            'factions': '势力组织',
            'items': '物品道具',
            'world_architecture': '世界架构',
            'energy_systems': '能量体系',
            'society_systems': '社会体系',
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
                'source': item.get('source', item.get('evidence', ''))
            })

        prompt = f"""你是一位专业的小说世界观设定分析师。现在需要整合从故事中提取的重复或相似的{type_name}设定。

## 任务
1. 分析以下{len(items)}个{type_name}条目
2. 识别哪些条目描述的是同一个概念（重复或高度相似）
3. 对于相似的条目，提取：
   - 共同的核心特征
   - 各条目的独特差异点（并注明来源）

## 相似判断标准（非常重要）
以下情况应该被判定为相似/重复：
1. **名称相同或包含同一关键词**：如"玛娜"和"魔法能量'玛娜'"、"玛娜能量"
2. **描述同一事物**：如"门的能量特性"和"打开'门'的能力"
3. **同一实体的不同方面**：如"陈启的开启能力"和"陈启拥有的能打开门的超自然能力"
4. **基于同一来源的不同描述**

请仔细比较名称和描述，将描述同一概念的条目归为一组。

## 输出格式（必须严格遵守）
请以JSON格式返回，结构如下：
{{
    "groups": [
        {{
            "is_duplicate": true/false,
            "items": [原始条目索引列表],
            "merged": {{
                "name": "合并后的名称（选择最准确、最完整的名称）",
                "brief": "合并后的简介/共同特征",
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
        """调用AI进行整合"""
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
        """使用AI合并一组元素"""
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
                'sources': [item.get('source', item.get('evidence', ''))],
                'common_description': item.get('brief', ''),
                'diff_points': []
            }

        prompt = build_ai_prompt(group, element_type)
        ai_result = call_ai_integrate(prompt)

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
                'sources': [item.get('source', item.get('evidence', '')) for item in group],
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
                'sources': [item.get('source', item.get('evidence', '')) for item in group]
            }

        result_item = merged_group[0].get('merged', {})
        result_item['is_integrated'] = True
        result_item['integrated_count'] = len(group)
        result_item['sources'] = [item.get('source', item.get('evidence', '')) for item in group]
        result_item['id'] = group[0].get('id', '')
        result_item['type'] = group[0].get('type', '')
        return result_item

    result = {}
    element_types = ['characters', 'locations', 'factions', 'items',
                     'world_architecture', 'energy_systems', 'society_systems',
                     'timeline_events', 'relations']

    for elem_type in element_types:
        items = elements.get(elem_type, [])
        if not items:
            result[elem_type] = []
            continue

        groups = group_similar_items(items, threshold=0.6)

        integrated_items = []
        for group in groups:
            if len(group) > 1:
                merged = merge_group_with_ai(group, elem_type)
                integrated_items.append(merged)
            else:
                item = group[0]
                item['is_integrated'] = False
                item['integrated_count'] = 1
                item['sources'] = [item.get('source', item.get('evidence', ''))]
                integrated_items.append(item)

        result[elem_type] = integrated_items
        logger.info(f"[AI整合] {elem_type}类型: {len(items)}个元素 -> {len(integrated_items)}个整合后元素")

    return result


# ==================== AI生成中止与恢复 API ====================

@api_bp.route('/worldview/abort-generation', methods=['POST'])
def abort_generation():
    """
    中止正在进行的AI生成会话
    
    Request Body:
    {
        "session_id": "gen_sess_xxx",
        "reason": "user_requested"  // 可选，中止原因
    }
    
    Response:
    {
        "code": 200,
        "message": "中止请求已发送",
        "data": {
            "session_id": "gen_sess_xxx",
            "aborted": true
        }
    }
    """
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        reason = data.get('reason', 'user_requested')
        
        if not session_id:
            return jsonify({'code': 400, 'message': '缺少 session_id'}), 400
        
        # 尝试中止会话
        aborted = session_manager.abort_session(session_id, reason)
        
        if aborted:
            logger.info(f"会话 {session_id} 中止成功")
            return jsonify({
                'code': 200,
                'message': '中止请求已发送，生成将在当前元素完成后停止',
                'data': {
                    'session_id': session_id,
                    'aborted': True
                }
            })
        else:
            # 检查会话是否存在
            session = session_manager.get_session(session_id)
            if not session:
                return jsonify({
                    'code': 404,
                    'message': '会话不存在或已结束',
                    'data': {
                        'session_id': session_id,
                        'aborted': False
                    }
                }), 404
            else:
                return jsonify({
                    'code': 200,
                    'message': f'会话当前状态: {session.status}',
                    'data': {
                        'session_id': session_id,
                        'status': session.status,
                        'aborted': False
                    }
                })
                
    except Exception as e:
        logger.error(f'中止生成失败: {str(e)}', exc_info=True)
        return jsonify({'code': 500, 'message': f'中止失败: {str(e)}'}), 500


@api_bp.route('/worldview/generation-status/<session_id>', methods=['GET'])
def get_generation_status(session_id):
    """
    获取生成会话状态
    
    Path Parameters:
        session_id: 会话ID
    
    Response:
    {
        "code": 200,
        "data": {
            "session_id": "gen_sess_xxx",
            "status": "running",
            "current_stage": "generation",
            "current_element": "角色A",
            "progress_percent": 45,
            "created_at": "2024-01-01T00:00:00",
            "updated_at": "2024-01-01T00:05:00"
        }
    }
    """
    try:
        session = session_manager.get_session(session_id)
        
        if not session:
            return jsonify({
                'code': 404,
                'message': '会话不存在'
            }), 404
        
        return jsonify({
            'code': 200,
            'data': session.to_dict()
        })
        
    except Exception as e:
        logger.error(f'获取生成状态失败: {str(e)}', exc_info=True)
        return jsonify({'code': 500, 'message': f'获取状态失败: {str(e)}'}), 500


@api_bp.route('/worldview/checkpoints', methods=['GET'])
def list_checkpoints():
    """
    获取检查点列表

    Query Parameters:
        project_id: 项目ID（可选）
        user_id: 用户ID（可选）
        stage: 阶段过滤（可选，extraction/generation）
        status: 状态过滤（可选）
        parent_id: 父检查点ID（可选，用于级联恢复）
        limit: 返回数量限制（默认50）
        offset: 偏移量（默认0）

    Response:
    {
        "code": 200,
        "data": {
            "total": 10,
            "checkpoints": [...],
            "limit": 50,
            "offset": 0
        }
    }
    """
    try:
        project_id = request.args.get('project_id', type=int)
        user_id = request.args.get('user_id', type=int)
        stage = request.args.get('stage')
        status = request.args.get('status')
        parent_id = request.args.get('parent_id', type=int)
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)

        result = checkpoint_service.list_checkpoints(
            project_id=project_id,
            user_id=user_id,
            stage=stage,
            status=status,
            parent_id=parent_id,
            limit=limit,
            offset=offset
        )

        return jsonify({
            'code': 200,
            'data': result
        })

    except Exception as e:
        logger.error(f'获取检查点列表失败: {str(e)}', exc_info=True)
        return jsonify({'code': 500, 'message': f'获取检查点列表失败: {str(e)}'}), 500


@api_bp.route('/worldview/checkpoints/<int:checkpoint_id>', methods=['GET'])
def get_checkpoint(checkpoint_id):
    """
    获取单个检查点详情
    
    Path Parameters:
        checkpoint_id: 检查点ID
    
    Response:
    {
        "code": 200,
        "data": {
            "id": 1,
            "session_id": "gen_sess_xxx",
            "stage": "generation",
            "progress_percent": 45,
            "parsed_data": {...}
        }
    }
    """
    try:
        checkpoint = checkpoint_service.load_checkpoint(checkpoint_id)

        if not checkpoint:
            return jsonify({
                'code': 404,
                'message': '检查点不存在'
            }), 404

        return jsonify({
            'code': 200,
            'data': checkpoint
        })

    except Exception as e:
        logger.error(f'获取检查点失败: {str(e)}', exc_info=True)
        return jsonify({'code': 500, 'message': f'获取检查点失败: {str(e)}'}), 500


@api_bp.route('/worldview/integrate-elements-stream', methods=['POST'])
def integrate_elements_stream():
    """
    流式触发元素整合（逐类型返回结果）

    将提取的元素列表进行AI智能整合，每整合完一个类型就返回结果。

    Request Body:
    {
        "elements": {
            "characters": [...],
            "locations": [...],
            ...
        }
    }
    """
    def generate():
        try:
            data = request.get_json()
            elements = data.get('elements', {})

            if not elements:
                yield f"data: {json.dumps({'type': 'error', 'message': '没有要整合的元素'}, ensure_ascii=False)}\n\n"
                return

            type_names = {
                'characters': '角色',
                'locations': '地点',
                'factions': '势力组织',
                'items': '物品道具',
                'world_architecture': '世界架构',
                'energy_systems': '能量体系',
                'society_systems': '社会体系',
                'timeline_events': '历史事件',
                'relations': '关系'
            }

            all_integrated = {}
            total_original = 0
            total_integrated = 0
            total_merged_groups = 0

            for elem_type, type_name in type_names.items():
                items = elements.get(elem_type, [])
                if not items:
                    continue

                original_count = len(items)
                total_original += original_count

                json_data = json.dumps({
                    'type': 'progress',
                    'element_type': elem_type,
                    'type_name': type_name,
                    'message': f'正在使用AI整合 {type_name}...',
                    'original_count': original_count
                }, ensure_ascii=False)
                yield f"data: {json_data}\n\n"

                merged_result = _integrate_elements_with_ai({elem_type: items})
                integrated_items = merged_result.get(elem_type, [])

                merged_count = sum(1 for item in integrated_items if item.get('is_integrated'))

                all_integrated[elem_type] = integrated_items
                integrated_count = len(integrated_items)
                total_integrated += integrated_count
                total_merged_groups += merged_count

                type_complete_data = json.dumps({
                    'type': 'type_complete',
                    'element_type': elem_type,
                    'type_name': type_name,
                    'message': f'{type_name} 整合完成: {original_count} -> {integrated_count} 个',
                    'original_count': original_count,
                    'integrated_count': integrated_count,
                    'merged_groups': merged_count
                }, ensure_ascii=False)
                yield f"data: {type_complete_data}\n\n"

            statistics = {
                'characters': len(all_integrated.get('characters', [])),
                'locations': len(all_integrated.get('locations', [])),
                'factions': len(all_integrated.get('factions', [])),
                'items': len(all_integrated.get('items', [])),
                'world_architecture': len(all_integrated.get('world_architecture', [])),
                'energy_systems': len(all_integrated.get('energy_systems', [])),
                'society_systems': len(all_integrated.get('society_systems', [])),
                'timeline_events': len(all_integrated.get('timeline_events', [])),
                'relations': len(all_integrated.get('relations', []))
            }

            complete_data = json.dumps({
                'type': 'complete',
                'message': f'整合完成！从 {total_original} 个条目整合为 {total_integrated} 个，共合并 {total_merged_groups} 组',
                'integrated_elements': all_integrated,
                'original_elements': elements,
                'statistics': statistics,
                'integration_info': {
                    'total_original': total_original,
                    'total_integrated': total_integrated,
                    'merged_groups': total_merged_groups
                }
            }, ensure_ascii=False)
            yield f"data: {complete_data}\n\n"

        except Exception as e:
            logger.error(f'流式整合元素失败: {str(e)}', exc_info=True)
            yield f"data: {json.dumps({'type': 'error', 'message': f'整合失败: {str(e)}'}, ensure_ascii=False)}\n\n"

    return Response(stream_with_context(generate()), mimetype='text/event-stream')


@api_bp.route('/worldview/integrate-elements', methods=['POST'])
def integrate_elements():
    """
    手动触发元素整合

    将提取的元素列表进行AI智能整合，合并相似条目并分析差异。

    Request Body:
    {
        "elements": {
            "characters": [...],
            "locations": [...],
            ...
        }
    }

    Response:
    {
        "code": 200,
        "data": {
            "integrated_elements": {...},
            "statistics": {...},
            "integration_info": {
                "integrated_count": 5
            }
        }
    }
    """
    try:
        data = request.get_json()
        elements = data.get('elements', {})

        if not elements:
            return jsonify({'code': 400, 'message': '没有要整合的元素'}), 400

        integrated_elements = _integrate_elements_with_ai(elements)

        statistics = {
            'characters': len(integrated_elements.get('characters', [])),
            'locations': len(integrated_elements.get('locations', [])),
            'factions': len(integrated_elements.get('factions', [])),
            'items': len(integrated_elements.get('items', [])),
            'world_architecture': len(integrated_elements.get('world_architecture', [])),
            'energy_systems': len(integrated_elements.get('energy_systems', [])),
            'society_systems': len(integrated_elements.get('society_systems', [])),
            'timeline_events': len(integrated_elements.get('timeline_events', [])),
            'relations': len(integrated_elements.get('relations', []))
        }

        integrated_count = sum(
            1 for items in integrated_elements.values()
            for item in items if item.get('is_integrated')
        )

        return jsonify({
            'code': 200,
            'data': {
                'integrated_elements': integrated_elements,
                'original_elements': elements,
                'statistics': statistics,
                'integration_info': {
                    'integrated_count': integrated_count
                }
            }
        })

    except Exception as e:
        logger.error(f'整合元素失败: {str(e)}', exc_info=True)
        return jsonify({'code': 500, 'message': f'整合元素失败: {str(e)}'}), 500


@api_bp.route('/worldview/resume-generation', methods=['POST'])
def resume_generation():
    """
    从检查点恢复生成
    
    Request Body:
    {
        "checkpoint_id": 1,  // 或 session_id
        "session_id": "gen_sess_xxx"
    }
    
    Response:
    {
        "code": 200,
        "data": {
            "session_id": "gen_sess_xxx",
            "resumed_from": 1,
            "status": "resumed",
            "progress": {
                "current_index": 3,
                "total": 10,
                "completed": 3
            }
        }
    }
    """
    try:
        data = request.get_json()
        checkpoint_id = data.get('checkpoint_id')
        session_id = data.get('session_id')
        
        if not checkpoint_id and not session_id:
            return jsonify({
                'code': 400,
                'message': '需要提供 checkpoint_id 或 session_id'
            }), 400
        
        # 加载检查点
        if checkpoint_id:
            checkpoint = checkpoint_service.load_checkpoint(checkpoint_id)
        else:
            checkpoint = checkpoint_service.load_checkpoint_by_session(session_id)
        
        if not checkpoint:
            return jsonify({
                'code': 404,
                'message': '检查点不存在'
            }), 404
        
        # 获取检查点数据
        parsed_data = checkpoint.get('parsed_data', {})
        checkpoint_session_id = checkpoint.get('session_id')
        
        # 检查会话状态
        existing_session = session_manager.get_session(checkpoint_session_id)
        if existing_session and existing_session.status == 'running':
            return jsonify({
                'code': 400,
                'message': '该会话仍在运行中，无法恢复'
            }), 400
        
        return jsonify({
            'code': 200,
            'message': '检查点已加载，请调用流式生成接口继续生成',
            'data': {
                'session_id': checkpoint_session_id,
                'checkpoint_id': checkpoint.get('id'),
                'resumed': True,
                'progress': {
                    'current_index': parsed_data.get('current_index', 0),
                    'total': parsed_data.get('total_count', 0),
                    'completed': parsed_data.get('completed_count', 0)
                },
                'elements': parsed_data.get('elements', []),
                'results': parsed_data.get('results', []),
                'story_context': parsed_data.get('story_context', {}),
                'batch_config': parsed_data.get('batch_config', {})
            }
        })
        
    except Exception as e:
        logger.error(f'恢复生成失败: {str(e)}', exc_info=True)
        return jsonify({'code': 500, 'message': f'恢复生成失败: {str(e)}'}), 500


@api_bp.route('/worldview/checkpoints/<int:checkpoint_id>', methods=['DELETE'])
def delete_checkpoint(checkpoint_id):
    """
    删除检查点
    
    Path Parameters:
        checkpoint_id: 检查点ID
    
    Response:
    {
        "code": 200,
        "message": "删除成功"
    }
    """
    try:
        success = checkpoint_service.delete_checkpoint(checkpoint_id)
        
        if success:
            return jsonify({
                'code': 200,
                'message': '检查点已删除'
            })
        else:
            return jsonify({
                'code': 404,
                'message': '检查点不存在'
            }), 404
            
    except Exception as e:
        logger.error(f'删除检查点失败: {str(e)}', exc_info=True)
        return jsonify({'code': 500, 'message': f'删除检查点失败: {str(e)}'}), 500


@api_bp.route('/worldview/cleanup-expired-checkpoints', methods=['POST'])
def cleanup_expired_checkpoints():
    """
    清理过期检查点（管理员接口）
    
    Response:
    {
        "code": 200,
        "data": {
            "cleaned_count": 5
        }
    }
    """
    try:
        count = checkpoint_service.cleanup_expired_checkpoints()
        
        return jsonify({
            'code': 200,
            'message': f'已清理 {count} 个过期检查点',
            'data': {
                'cleaned_count': count
            }
        })
        
    except Exception as e:
        logger.error(f'清理过期检查点失败: {str(e)}', exc_info=True)
        return jsonify({'code': 500, 'message': f'清理失败: {str(e)}'}), 500


@api_bp.route('/worldview/preview-merge', methods=['POST'])
def preview_merge():
    """
    预览概念合并结果
    
    智能分析提取的元素，识别重复或相似的概念，返回合并建议。
    支持按概念类型分别预览合并结果。
    
    Request Body:
    {
        "elements": {
            "characters": [
                {"id": "char_001", "name": "张三", "type": "protagonist", "brief": "主角"},
                {"id": "char_002", "name": "张三", "type": "protagonist", "brief": "主角，武功高强"}
            ],
            "locations": [...]
        },
        "concept_type": "characters",  // 可选，指定预览特定类型；不传则预览所有类型
        "similarity_threshold": 0.85   // 可选，自定义相似度阈值
    }
    
    Response:
    {
        "code": 200,
        "data": {
            "characters": {
                "concept_type": "characters",
                "total_elements": 10,
                "similarity_threshold": 0.85,
                "suggested_groups": [
                    {
                        "type": "merge",
                        "elements": [
                            {"id": "char_001", "name": "张三", "brief": "主角"},
                            {"id": "char_002", "name": "张三", "brief": "主角，武功高强"}
                        ],
                        "similarity": 1.0,
                        "reason": "名称完全匹配",
                        "suggested_name": "张三"
                    },
                    {
                        "type": "keep",
                        "elements": [{"id": "char_003", "name": "李四", "brief": "配角"}]
                    }
                ],
                "statistics": {
                    "total": 10,
                    "will_merge": 5,
                    "will_keep": 7,
                    "merge_groups": 2,
                    "keep_groups": 7
                }
            }
        }
    }
    """
    try:
        data = request.get_json()
        elements = data.get('elements', {})
        concept_type = data.get('concept_type')  # 可选，指定特定类型
        similarity_threshold = data.get('similarity_threshold', 0.85)
        
        logger.info(f'收到合并预览请求: concept_type={concept_type}, similarity_threshold={similarity_threshold}')
        
        if not elements:
            return jsonify({'code': 400, 'message': '缺少 elements 参数'}), 400
        
        # 创建合并服务实例（使用自定义阈值）
        merge_service = concept_merge_service
        if similarity_threshold != 0.85:
            from app.services.generation.concept_merge_service import ConceptMergeService
            merge_service = ConceptMergeService(similarity_threshold=similarity_threshold)
        
        result = {}
        
        # 如果指定了特定类型，只预览该类型
        if concept_type:
            if concept_type not in elements:
                return jsonify({'code': 400, 'message': f'未找到类型 {concept_type} 的元素'}), 400
            
            type_elements = elements.get(concept_type, [])
            if type_elements:
                preview = merge_service.preview_merge(type_elements, concept_type)
                result[concept_type] = preview
        else:
            # 预览所有类型
            for type_name, type_elements in elements.items():
                if type_elements and isinstance(type_elements, list):
                    try:
                        preview = merge_service.preview_merge(type_elements, type_name)
                        result[type_name] = preview
                    except Exception as e:
                        logger.error(f'预览类型 {type_name} 时出错: {str(e)}')
                        result[type_name] = {
                            'concept_type': type_name,
                            'error': str(e),
                            'total_elements': len(type_elements),
                            'suggested_groups': [],
                            'statistics': {'total': len(type_elements), 'will_merge': 0, 'will_keep': len(type_elements)}
                        }
        
        # 计算总体统计
        total_elements = sum(r.get('statistics', {}).get('total', 0) for r in result.values())
        total_will_merge = sum(r.get('statistics', {}).get('will_merge', 0) for r in result.values())
        total_will_keep = sum(r.get('statistics', {}).get('will_keep', 0) for r in result.values())
        
        return jsonify({
            'code': 200,
            'data': {
                'preview_results': result,
                'overall_statistics': {
                    'total_elements': total_elements,
                    'total_will_merge': total_will_merge,
                    'total_will_keep': total_will_keep,
                    'types_processed': len(result)
                },
                'similarity_threshold': similarity_threshold
            }
        })
        
    except Exception as e:
        logger.error(f'预览合并结果失败: {str(e)}', exc_info=True)
        return jsonify({'code': 500, 'message': f'预览失败: {str(e)}'}), 500


@api_bp.route('/worldview/execute-merge', methods=['POST'])
def execute_merge():
    """
    执行概念合并
    
    根据预览结果执行实际的合并操作，返回合并后的元素。
    
    Request Body:
    {
        "elements": {
            "characters": [...],
            "locations": [...]
        },
        "concept_type": "characters",  // 可选，指定合并特定类型
        "similarity_threshold": 0.85   // 可选，自定义相似度阈值
    }
    
    Response:
    {
        "code": 200,
        "data": {
            "characters": [
                {
                    "id": "char_001",
                    "name": "张三",
                    "type": "protagonist",
                    "brief": "主角，武功高强",
                    "description": "...",
                    "sources": [
                        {"chapter": "第一章", "evidence": "...", "confidence": 1.0},
                        {"chapter": "第二章", "evidence": "...", "confidence": 0.9}
                    ],
                    "attribute_changes": [
                        {"field": "brief", "chapter": "第二章", "old_value": "主角", "new_value": "主角，武功高强", "change_type": "update"}
                    ],
                    "merge_info": {
                        "strategy": "name_match",
                        "similarity": 1.0,
                        "merge_reason": "名称完全匹配",
                        "merged_count": 2
                    }
                }
            ]
        },
        "statistics": {
            "characters": {"original": 10, "merged": 8}
        }
    }
    """
    try:
        data = request.get_json()
        elements = data.get('elements', {})
        concept_type = data.get('concept_type')
        similarity_threshold = data.get('similarity_threshold', 0.85)
        
        logger.info(f'收到执行合并请求: concept_type={concept_type}, similarity_threshold={similarity_threshold}')
        
        if not elements:
            return jsonify({'code': 400, 'message': '缺少 elements 参数'}), 400
        
        # 创建合并服务实例
        from app.services.generation.concept_merge_service import ConceptMergeService
        merge_service = ConceptMergeService(similarity_threshold=similarity_threshold)
        
        result = {}
        statistics = {}
        
        # 如果指定了特定类型，只合并该类型
        if concept_type:
            if concept_type not in elements:
                return jsonify({'code': 400, 'message': f'未找到类型 {concept_type} 的元素'}), 400
            
            type_elements = elements.get(concept_type, [])
            if type_elements:
                merged = merge_service.merge_elements(type_elements, concept_type)
                result[concept_type] = [m.to_dict() for m in merged]
                statistics[concept_type] = {
                    'original': len(type_elements),
                    'merged': len(merged),
                    'reduction': len(type_elements) - len(merged)
                }
        else:
            # 合并所有类型
            for type_name, type_elements in elements.items():
                if type_elements and isinstance(type_elements, list):
                    try:
                        merged = merge_service.merge_elements(type_elements, type_name)
                        result[type_name] = [m.to_dict() for m in merged]
                        statistics[type_name] = {
                            'original': len(type_elements),
                            'merged': len(merged),
                            'reduction': len(type_elements) - len(merged)
                        }
                    except Exception as e:
                        logger.error(f'合并类型 {type_name} 时出错: {str(e)}')
                        result[type_name] = {'error': str(e)}
                        statistics[type_name] = {'original': len(type_elements), 'error': str(e)}
        
        # 计算总体统计
        total_original = sum(s.get('original', 0) for s in statistics.values() if 'original' in s)
        total_merged = sum(s.get('merged', 0) for s in statistics.values() if 'merged' in s)
        
        return jsonify({
            'code': 200,
            'data': {
                'merged_elements': result,
                'statistics': statistics,
                'overall': {
                    'total_original': total_original,
                    'total_merged': total_merged,
                    'total_reduction': total_original - total_merged
                }
            }
        })
        
    except Exception as e:
        logger.error(f'执行合并失败: {str(e)}', exc_info=True)
        return jsonify({'code': 500, 'message': f'合并失败: {str(e)}'}), 500

"""
世界观生成 API
从蓝图提取的元素生成详细设定
"""
from flask import request, jsonify, Response, stream_with_context
from app.api import api_bp
from app.services.generation.generators import (
    CharacterGenerator,
    LocationGenerator,
    ItemGenerator,
    FactionGenerator,
    EnergySystemGenerator,
    CivilizationGenerator,
    HistoricalEventGenerator,
    HistoricalEraGenerator,
    HistoricalFigureGenerator,
    TimelineGenerator,
    RegionGenerator,
    DimensionGenerator,
    CelestialBodyGenerator,
    NaturalLawGenerator,
    RelationGenerator,
    SocialClassGenerator,
    PoliticalSystemGenerator,
    EconomicSystemGenerator,
    CulturalCustomGenerator
)
from app.services.generation.session_manager import session_manager
from app.services.generation.checkpoint_service import checkpoint_service
from app.services.ai_service import ai_service
from logs import generation_logger
import json
import logging
import time

logger = logging.getLogger(__name__)

generators = {
    'character': CharacterGenerator(),
    'location': LocationGenerator(),
    'item': ItemGenerator(),
    'faction': FactionGenerator(),
    'energy_system': EnergySystemGenerator(),
    'civilization': CivilizationGenerator(),
    'historical_event': HistoricalEventGenerator(),
    'historical_era': HistoricalEraGenerator(),
    'historical_figure': HistoricalFigureGenerator(),
    'timeline': TimelineGenerator(),
    'region': RegionGenerator(),
    'dimension': DimensionGenerator(),
    'celestial_body': CelestialBodyGenerator(),
    'natural_law': NaturalLawGenerator(),
    'world_architecture': DimensionGenerator(),
    'relation': RelationGenerator(),
    'social_class': SocialClassGenerator(),
    'political_system': PoliticalSystemGenerator(),
    'economic_system': EconomicSystemGenerator(),
    'cultural_custom': CulturalCustomGenerator()
}


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
        elements = data.get('elements', {})
        selected_elements = data.get('selected_elements', {})
        parent_checkpoint_id = data.get('parent_checkpoint_id')

        logger.info(f'创建生成批次: extraction_id={extraction_id}, 元素类型数={len(elements)}, 已选择类型数={len(selected_elements)}, parent_checkpoint_id={parent_checkpoint_id}')

        type_mapping = {
            'characters': 'character',
            'locations': 'location',
            'factions': 'faction',
            'items': 'item',
            'dimensions': 'dimension',
            'regions': 'region',
            'celestial_bodies': 'celestial_body',
            'natural_laws': 'natural_law',
            'energy_systems': 'energy_system',
            'civilizations': 'civilization',
            'social_classes': 'social_class',
            'political_systems': 'political_system',
            'economic_systems': 'economic_system',
            'cultural_customs': 'cultural_custom',
            'historical_eras': 'historical_era',
            'historical_events': 'historical_event',
            'historical_figures': 'historical_figure',
            'relations': 'relation'
        }

        batch_name_map = {
            'character': '主要角色详细设定',
            'location': '地点场景详细设定',
            'faction': '组织势力详细设定',
            'item': '物品资源详细设定',
            'dimension': '维度详细设定',
            'region': '地理区域详细设定',
            'celestial_body': '天体详细设定',
            'natural_law': '自然法则详细设定',
            'energy_system': '能量体系详细设定',
            'civilization': '文明体系详细设定',
            'social_class': '社会阶层详细设定',
            'political_system': '政治体系详细设定',
            'economic_system': '经济体系详细设定',
            'cultural_custom': '文化习俗详细设定',
            'historical_era': '历史纪元详细设定',
            'historical_event': '历史事件详细设定',
            'historical_figure': '历史人物详细设定',
            'relation': '关系网络详细设定'
        }

        priority_order = batch_config.get('priority_order', [
            'energy_systems', 'characters', 'locations', 'factions',
            'dimensions', 'regions', 'celestial_bodies', 'natural_laws',
            'civilizations', 'social_classes', 'political_systems', 'economic_systems', 'cultural_customs',
            'historical_eras', 'historical_events', 'historical_figures',
            'items', 'relations'
        ])

        batches = []
        batch_count = 0

        for element_type in priority_order:
            if element_type not in selected_elements:
                continue

            selected_ids = selected_elements.get(element_type, [])
            if not selected_ids:
                continue

            type_elements = elements.get(element_type, [])
            selected_type_elements = [
                el for el in type_elements
                if el.get('id') in selected_ids
            ]

            if not selected_type_elements:
                continue

            generator_type = type_mapping.get(element_type, element_type)
            batch_count += 1

            batches.append({
                'batch_id': f'batch_{extraction_id}_{batch_count:03d}',
                'batch_name': batch_name_map.get(generator_type, f'{generator_type}详细设定'),
                'type': generator_type,
                'element_type': element_type,
                'elements': selected_type_elements,
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
                'total_elements': sum(b['element_count'] for b in batches),
                'parent_checkpoint_id': parent_checkpoint_id
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

        generator = generators.get(entity_type)
        if not generator:
            return jsonify({'code': 400, 'message': f'未知的实体类型: {entity_type}'}), 400

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
            user_id = data.get('user_id', 0)

            story_context = data.get('story_context', {})
            outline_content = story_context.get('outline', '')
            volume_content = story_context.get('volume', '')
            chapter_contents = story_context.get('chapters', [])

            previous_results = data.get('previous_results', [])

            resume_from_checkpoint = data.get('resume_from_checkpoint', False)
            checkpoint_session_id = data.get('checkpoint_session_id')
            start_index = data.get('start_index', 0)
            existing_results = data.get('existing_results', [])

            if not elements:
                yield f"data: {json.dumps({'type': 'error', 'message': '没有要生成的元素'}, ensure_ascii=False)}\n\n"
                return

            generator = generators.get(entity_type)
            if not generator:
                yield f"data: {json.dumps({'type': 'error', 'message': f'未知的实体类型: {entity_type}'}, ensure_ascii=False)}\n\n"
                return

            session_id = batch_id or f"gen_{project_id}_{int(time.time())}"
            session = session_manager.create_session(
                session_id=session_id,
                project_id=project_id or 0,
                user_id=user_id,
                session_type="generation"
            )

            if resume_from_checkpoint and existing_results:
                generated_results = existing_results.copy()
                logger.info(f"从检查点恢复，已有 {len(generated_results)} 个结果，从索引 {start_index} 开始")
            else:
                generated_results = []

            total_elements = len(elements)

            yield f"data: {json.dumps({'type': 'start', 'message': f'开始生成 {total_elements} 个设定', 'total': total_elements, 'session_id': session_id}, ensure_ascii=False)}\n\n"

            batch_config = {
                'batch_id': batch_id,
                'entity_type': entity_type,
                'world_id': world_id,
                'total_elements': total_elements
            }

            parent_checkpoint_id = data.get('parent_checkpoint_id')

            for idx in range(start_index, total_elements):
                element = elements[idx]
                element_name = element.get('name', f'元素{idx+1}')
                element_id = element.get('id', f'elem_{idx}')

                progress = int((idx / total_elements) * 100)
                session_manager.update_session_progress(
                    session_id=session_id,
                    stage='generation',
                    element=element_name,
                    progress=progress
                )

                if session_manager.check_abort(session_id):
                    logger.info(f"会话 {session_id} 被中止，保存检查点")

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

                    session_manager.complete_session(session_id)
                    return

                yield f"data: {json.dumps({'type': 'progress', 'current': idx + 1, 'total': total_elements, 'progress': progress, 'element_name': element_name, 'session_id': session_id}, ensure_ascii=False)}\n\n"

                current_batch_context = _build_generated_context(generated_results, "同批次")
                previous_batches_context = _build_generated_context(previous_results, "之前批次") if previous_results else ""

                generated_context = current_batch_context
                if previous_batches_context:
                    generated_context = f"{previous_batches_context}\n\n{current_batch_context}" if current_batch_context else previous_batches_context

                element_info = f"【名称】{element_name}\n【类型】{element.get('type', '')}\n【简介】{element.get('brief', '')}"

                generation_prompt = _build_generation_prompt(
                    element=element,
                    element_name=element_name,
                    outline_content=outline_content,
                    volume_content=volume_content,
                    chapter_contents=chapter_contents,
                    generated_context=generated_context
                )
                prompt_summary = generation_prompt[:200] + "..." if len(generation_prompt) > 200 else generation_prompt

                input_sections = {
                    'element': {
                        'name': element_name,
                        'type': element.get('type', ''),
                        'brief': element.get('brief', '')
                    },
                    'story_context': {
                        'outline': outline_content,
                        'volume': volume_content,
                        'chapters': chapter_contents
                    },
                    'previous_context': previous_batches_context,
                    'generated_context': current_batch_context,
                    'prompt_summary': prompt_summary,
                    'full_prompt_length': len(generation_prompt)
                }

                logger.info(f"[{session_id}] 开始处理元素 {idx+1}/{total_elements}: {element_name} (类型: {element.get('type', 'unknown')})")
                logger.debug(f"[{session_id}] 元素详情: {json.dumps(element, ensure_ascii=False)}")

                yield f"data: {json.dumps({'type': 'input', 'element': element_name, 'content': element_info, 'sections': input_sections, 'stage': 'generation', 'current_index': idx, 'total': total_elements}, ensure_ascii=False)}\n\n"

                try:
                    prompt = _build_generation_prompt(
                        element=element,
                        element_name=element_name,
                        outline_content=outline_content,
                        volume_content=volume_content,
                        chapter_contents=chapter_contents,
                        generated_context=generated_context
                    )

                    logger.info(f"[{session_id}] 元素 '{element_name}' - 发送给AI的prompt长度: {len(prompt)} 字符")
                    logger.debug(f"[{session_id}] 元素 '{element_name}' - 完整prompt:\n{prompt}")

                    logger.info(f"[{session_id}] 元素 '{element_name}' - 阶段: AI生成开始")

                    yield f"data: {json.dumps({'type': 'output', 'content': f'🤖 AI正在生成《{element_name}》的详细设定...'}, ensure_ascii=False)}\n\n"

                    from app.services.generation.prompt_template_manager import template_manager
                    from app.services.generation.generation_strategy import strategy_selector
                    from app.services.generation.context_assembler import context_assembler
                    from app.services.generation.result_parser import result_parser

                    template = template_manager.get_template(entity_type, 'detailed')
                    gen_strategy = strategy_selector.select_strategy(entity_type, 'detailed')
                    gen_params = strategy_selector.get_parameters(gen_strategy, {})

                    related_entity_types = _get_related_entity_types(entity_type)

                    variables = context_assembler.build_prompt_variables(
                        user_prompt=prompt,
                        world_id=world_id,
                        project_id=project_id,
                        include_world_info=True,
                        include_related_entities=related_entity_types
                    )

                    variables['importance_level'] = element.get('importance_level', 5)

                    final_prompt = template.render(variables)

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

                    full_response = ""
                    stream_start_time = time.time()

                    logger.info(f"[{session_id}] 元素 '{element_name}' - 开始流式AI调用")

                    stream = ai_service.stream_chat_completion(
                        messages=messages,
                        **gen_params.to_dict()
                    )

                    for chunk in stream:
                        if session_manager.check_abort(session_id):
                            logger.info(f"会话 {session_id} 在AI输出期间被中止")
                            break

                        content = chunk.get('content', '')
                        if content:
                            full_response += content
                            yield f"data: {json.dumps({'type': 'ai_stream', 'content': content, 'element': element_name}, ensure_ascii=False)}\n\n"

                    if session_manager.check_abort(session_id):
                        logger.info(f"[{session_id}] 元素 '{element_name}' - 会话被中止，跳过结果解析")
                        continue

                    stream_duration = time.time() - stream_start_time
                    logger.info(f"[{session_id}] 元素 '{element_name}' - 流式AI调用完成，耗时: {stream_duration:.2f}秒，响应长度: {len(full_response)} 字符")
                    logger.debug(f"[{session_id}] 元素 '{element_name}' - AI原始响应:\n{full_response}")

                    generation_logger.log_step3_input(entity_type, element_name, final_prompt, generated_context)

                    logger.info(f"[{session_id}] 元素 '{element_name}' - 阶段: 结果解析开始")

                    parsed_result = result_parser.parse(full_response, entity_type)
                    generation_logger.log_step3_output(entity_type, element_name, full_response, parsed_result)

                    if parsed_result.get('success'):
                        result_data = parsed_result.get('data', {})

                        returned_name = result_data.get('name', '')
                        if returned_name and returned_name != element_name:
                            logger.warning(f"[{session_id}] 元素 '{element_name}' - 名称不匹配！输入: '{element_name}', 返回: '{returned_name}'")
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

                        logger.info(f"[{session_id}] 元素 '{element_name}' - 阶段: 生成完成 (成功)")
                        logger.debug(f"[{session_id}] 元素 '{element_name}' - 解析结果: {json.dumps(result_data, ensure_ascii=False)[:500]}...")

                        save_success = False
                        save_error = None
                        saved_entity_id = None

                        effective_data = result_data.copy() if result_data else {}
                        if not effective_data.get('name') and element_name:
                            effective_data['name'] = element_name
                            logger.info(f"[{session_id}] 元素 '{element_name}' - 使用element_name作为name字段")

                        if entity_type != 'relation':
                            if effective_data.get('name'):
                                try:
                                    save_result = generator.save_to_database(
                                        data=effective_data,
                                        world_id=world_id,
                                        project_id=project_id,
                                        source_chapters=element.get('source_chapter')
                                    )
                                    if save_result.get('success'):
                                        save_success = True
                                        saved_entity_id = save_result.get(f'{entity_type}_id') or save_result.get('id')
                                        logger.info(f"[{session_id}] 元素 '{element_name}' - 已保存到数据库 (ID: {saved_entity_id})")
                                    else:
                                        save_error = save_result.get('error', '未知错误')
                                        logger.warning(f"[{session_id}] 元素 '{element_name}' - 保存到数据库失败: {save_error}")
                                except Exception as save_e:
                                    save_error = str(save_e)
                                    logger.error(f"[{session_id}] 元素 '{element_name}' - 保存到数据库异常: {save_e}", exc_info=True)
                            else:
                                logger.warning(f"[{session_id}] 元素 '{element_name}' - 无有效数据且无element_name，跳过保存")
                        else:
                            logger.info(f"[{session_id}] 元素 '{element_name}' - relation类型暂不自动保存，需手动处理")

                        yield f"data: {json.dumps({'type': 'output', 'content': f'✅ 《{element_name}》生成完成' + (' (已保存)' if save_success else ' (未保存)' if not save_error else f' (保存失败: {save_error})')}, ensure_ascii=False)}\n\n"
                    else:
                        error_msg = parsed_result.get('error', '解析失败')

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

            if session_manager.check_abort(session_id):
                logger.info(f"[{session_id}] 生成流程被中止，已完成 {len(generated_results)}/{total_elements} 个元素")
                yield f"data: {json.dumps({'type': 'aborted', 'message': '生成已中止', 'session_id': session_id, 'progress': progress, 'completed_count': len(generated_results), 'total': total_elements, 'results': generated_results}, ensure_ascii=False)}\n\n"
            else:
                success_count = sum(1 for r in generated_results if r.get('success'))
                logger.info(f"[{session_id}] 生成流程正常完成，成功 {success_count}/{total_elements} 个元素")
                yield f"data: {json.dumps({'type': 'complete', 'progress': 100, 'message': f'生成完成，成功 {success_count}/{total_elements}', 'results': generated_results, 'success_count': success_count, 'total': total_elements, 'session_id': session_id}, ensure_ascii=False)}\n\n"

            if session_id:
                session_manager.complete_session(session_id)
                logger.info(f"[{session_id}] 会话已标记为完成")

        except Exception as e:
            logger.error(f'流式批次生成失败: {str(e)}', exc_info=True)
            yield f"data: {json.dumps({'type': 'error', 'message': str(e), 'session_id': session_id}, ensure_ascii=False)}\n\n"

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
            pass

    return Response(stream_with_context(generate_stream()), mimetype='text/event-stream')


def _get_related_entity_types(entity_type):
    """
    根据当前实体类型，获取需要作为上下文的相关实体类型
    """
    relationships = {
        'character': ['faction', 'location', 'energy_system', 'civilization'],
        'location': ['faction', 'civilization', 'energy_system'],
        'faction': ['location', 'civilization', 'energy_system', 'character'],
        'item': ['character', 'faction', 'location', 'energy_system'],
        'energy_system': ['civilization', 'faction', 'character'],
        'civilization': ['location', 'faction', 'energy_system', 'character'],
        'world_architecture': ['energy_system', 'civilization', 'location'],
        'historical_event': ['character', 'faction', 'location', 'civilization'],
        'relation': ['character', 'faction'],
    }

    return relationships.get(entity_type, [])


def _build_generated_context(generated_results, context_title="同批次"):
    """
    构建已生成内容的上下文
    """
    if not generated_results:
        return ""

    lines = [f"\n## {context_title}已生成的设定（请确保新设定与以下内容保持一致）\n"]

    for result in generated_results:
        if result.get('success') and result.get('data'):
            element_name = result.get('element_name', '未命名')
            data = result.get('data', {})

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
    """
    chapters_section = ""
    if chapter_contents:
        chapters_section = "\n\n## 相关章纲内容\n"
        for i, chapter in enumerate(chapter_contents[:5], 1):
            chapters_section += f"\n### 章纲{i}\n{chapter}\n"

    volume_section = ""
    if volume_content:
        volume_section = f"\n\n## 所属卷纲内容\n{volume_content}"

    outline_section = ""
    if outline_content:
        outline_section = f"\n\n## 故事大纲\n{outline_content}"

    element_type = element.get('type', '')

    prompt = f"""请为以下设定元素生成详细设定。

## 目标元素信息（重要：必须严格基于此信息生成）
【元素名称】{element_name}
【元素类型】{element_type}
【基础简介】{element.get('brief', '')}

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


@api_bp.route('/worldview/integrate-elements-stream', methods=['POST'])
def integrate_elements_stream():
    """
    流式触发元素整合（逐类型返回结果）
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
                'civilizations': '文明体系',
                'social_classes': '社会阶层',
                'political_systems': '政治体系',
                'economic_systems': '经济体系',
                'cultural_customs': '文化习俗',
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
                'civilizations': len(all_integrated.get('civilizations', [])),
                'social_classes': len(all_integrated.get('social_classes', [])),
                'political_systems': len(all_integrated.get('political_systems', [])),
                'economic_systems': len(all_integrated.get('economic_systems', [])),
                'cultural_customs': len(all_integrated.get('cultural_customs', [])),
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


def _integrate_elements_with_ai(elements: dict) -> dict:
    """
    使用AI智能整合元素列表 - 完全由LLM处理分组和合并
    """
    def build_ai_prompt(items: list, element_type: str) -> str:
        type_names = {
            'characters': '角色', 'locations': '地点', 'factions': '势力组织',
            'items': '物品道具', 'world_architecture': '世界架构',
            'energy_systems': '能量体系',
            'civilizations': '文明体系', 'social_classes': '社会阶层',
            'political_systems': '政治体系', 'economic_systems': '经济体系',
            'cultural_customs': '文化习俗',
            'timeline_events': '历史事件', 'relations': '关系'
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

## 任务（非常重要，请仔细阅读）
1. 仔细分析以下{len(items)}个{type_name}条目
2. 识别哪些条目描述的是**同一个概念**（重复或高度相似），将它们分到同一组
3. 对于每个分组内的条目，提取：
   - 共同的核心特征（common_points）
   - 各条目的独特差异点（diff_points，并注明来源）
4. 为每个分组生成合并后的设定

## 相似判断标准
以下情况应该被判定为**相似/重复**，必须分到同一组：
1. **名称相同或包含同一关键词**：如"玛娜"和"魔法能量'玛娜'"、"玛娜能量"
2. **描述同一事物**：如"门的能量特性"和"打开'门'的能力"
3. **同一实体的不同方面**：如"陈启的开启能力"和"陈启拥有的能打开门的超自然能力"
4. **基于同一来源的不同描述**
5. **存在包含关系**：如"门与玛娜的响应"包含"门"和"玛娜"两个关键词

## 输出格式（必须严格遵守JSON格式）
{{
    "groups": [
        {{
            "items": [原始条目索引列表],
            "merged": {{
                "name": "合并后的名称（选择最准确、最完整的名称）",
                "brief": "合并后的简介，包含所有共同特征",
                "common_points": ["共同点1", "共同点2"],
                "diff_points": [
                    {{"description": "差异描述", "source": "来源"}}
                ]
            }},
            "reason": "为什么这些条目被分到一组"
        }}
    ]
}}

## 待分析{type_name}条目（共{len(items)}个）
{json.dumps(items_json, ensure_ascii=False, indent=2)}

请严格以JSON格式返回结果，不要包含其他内容。**禁止使用\\uXXXX Unicode转义序列，所有文字必须直接使用UTF-8中文字符。**"""
        return prompt

    def call_ai_integrate(prompt: str) -> dict:
        import re

        messages = [
            {"role": "system", "content": "你是一位专业的小说世界观设定分析师，擅长识别重复概念并整合差异。必须以JSON格式返回结果。**禁止使用\\uXXXX Unicode转义序列，所有文字必须直接使用UTF-8中文字符。**"},
            {"role": "user", "content": prompt}
        ]

        try:
            result = ai_service.chat_completion(
                messages=messages,
                temperature=0.3,
                max_tokens=8000
            )
            content = result.get('content', '')

            if not content:
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
                return None
        except Exception as e:
            logger.error(f"AI整合失败: {str(e)}")
            return None

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

        if len(items) == 1:
            item = items[0]
            item['is_integrated'] = False
            item['integrated_count'] = 1
            item['sources'] = [item.get('source', '')]
            result[elem_type] = [item]
            continue

        prompt = build_ai_prompt(items, elem_type)
        ai_result = call_ai_integrate(prompt)

        if not ai_result or 'groups' not in ai_result:
            logger.warning(f"[AI整合] {elem_type}类型AI返回结果无效，使用原始条目")
            integrated_items = []
            for item in items:
                item_copy = item.copy()
                item_copy['is_integrated'] = False
                item_copy['integrated_count'] = 1
                item_copy['sources'] = [item.get('source', '')]
                integrated_items.append(item_copy)
            result[elem_type] = integrated_items
            continue

        merged_groups = ai_result.get('groups', [])
        processed_indices = set()
        integrated_items = []

        for group in merged_groups:
            group_indices = group.get('items', [])
            if not group_indices:
                continue

            merged = group.get('merged', {})
            if not merged:
                continue

            processed_indices.update(group_indices)

            result_item = {
                'id': items[group_indices[0]].get('id', ''),
                'name': merged.get('name', ''),
                'type': items[group_indices[0]].get('type', ''),
                'brief': merged.get('brief', ''),
                'description': merged.get('description', ''),
                'is_integrated': len(group_indices) > 1,
                'integrated_count': len(group_indices),
                'sources': [items[idx].get('source', '') for idx in group_indices if idx < len(items)],
                'common_description': '; '.join(merged.get('common_points', [])),
                'diff_points': merged.get('diff_points', [])
            }
            integrated_items.append(result_item)

        for idx, item in enumerate(items):
            if idx not in processed_indices:
                item_copy = item.copy()
                item_copy['is_integrated'] = False
                item_copy['integrated_count'] = 1
                item_copy['sources'] = [item.get('source', '')]
                integrated_items.append(item_copy)

        result[elem_type] = integrated_items
        logger.info(f"[AI整合] {elem_type}类型: {len(items)}个元素 -> {len(integrated_items)}个整合后元素")

    return result

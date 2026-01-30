from flask import request, jsonify, current_app
from app.api import api_bp
from app.services.ai_service import ai_service
from app.config.ai_config import ai_config
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 检查默认AI服务提供商是否配置
if not ai_config.is_provider_configured():
    logger.warning(f'默认AI服务提供商 {ai_config.get_default_provider()} 未配置，可能无法正常工作')

@api_bp.route('/ai/generate-opening', methods=['POST'])
def generate_opening():
    """
    智能开篇生成
    """
    data = request.json
    prompt = data.get('prompt', '')
    genre = data.get('genre', '')
    length = data.get('length', 300)
    provider = data.get('provider', None)  # 可选的服务提供商
    temperature = data.get('temperature', 0.7)  # 温度设置
    max_tokens = data.get('max_tokens', length * 2)  # token限制设置
    count = data.get('count', 3)  # 生成多个开篇选项
    writing_style = data.get('writing_style', '')  # 写作风格
    
    if not prompt:
        return jsonify({'error': '缺少提示词'}), 400
    
    # 构建系统提示
    system_prompt = '你是一位专业的小说作家，擅长创作引人入胜的开篇。请根据提供的信息，创作多个不同风格和切入点的开篇选项。'
    
    # 构建用户提示
    user_prompt = f'请为以下故事创意创作{count}个不同风格的精彩开篇，每个控制在{length}字左右：\n\n'
    user_prompt += f'故事创意：{prompt}\n'
    if genre:
        user_prompt += f'作品类型：{genre}\n'
    if writing_style:
        user_prompt += f'写作风格：{writing_style}\n'
    user_prompt += '\n请为每个开篇提供不同的风格标签和切入点，确保每个开篇都有独特性。'
    
    messages = [
        {
            'role': 'system',
            'content': system_prompt
        },
        {
            'role': 'user',
            'content': user_prompt
        }
    ]
    
    logger.info(f'开始生成开篇，prompt: {prompt[:100]}..., genre: {genre}, length: {length}, count: {count}, provider: {provider}, temperature: {temperature}, max_tokens: {max_tokens}')
    
    try:
        # 使用统一AI服务接口
        result = ai_service.chat_completion(
            messages=messages,
            provider=provider,
            max_tokens=max_tokens * count,  # 增加token限制以容纳多个开篇
            temperature=temperature
        )
        
        opening = result['content']
        logger.info(f'开篇生成成功，长度: {len(opening)}, provider: {result.get("provider")}')
        
        # 解析多个开篇选项
        openings = []
        # 简单的解析逻辑，根据数字序号分割
        parts = opening.split('\n')
        current_opening = ''
        for part in parts:
            if part.strip().startswith(('1.', '2.', '3.', '4.', '5.')) and current_opening:
                openings.append(current_opening.strip())
                current_opening = part
            else:
                current_opening += '\n' + part
        if current_opening:
            openings.append(current_opening.strip())
        
        # 确保返回指定数量的开篇
        if len(openings) > count:
            openings = openings[:count]
        
        return jsonify({'success': True, 'openings': openings, 'provider': result.get("provider")})
    
    except ValueError as e:
        logger.error(f'AI服务错误: {str(e)}')
        if '未配置' in str(e):
            return jsonify({'error': str(e)}), 401
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        logger.error(f'生成开篇时发生错误: {str(e)}')
        return jsonify({'error': f'生成失败: {str(e)}'}), 500

@api_bp.route('/ai/continue-writing', methods=['POST'])
def continue_writing():
    """
    AI续写功能
    """
    data = request.json
    context = data.get('context', '')
    length = data.get('length', 500)
    direction = data.get('direction', '')
    provider = data.get('provider', None)  # 可选的服务提供商
    temperature = data.get('temperature', 0.7)  # 温度设置
    max_tokens = data.get('max_tokens', length * 2)  # token限制设置
    
    if not context:
        return jsonify({'error': '缺少上下文内容'}), 400
    
    messages = [
        {
            'role': 'system',
            'content': '你是一位专业的小说作家，擅长根据上下文续写内容。'
        },
        {
            'role': 'user',
            'content': f'请根据以下上下文继续创作，控制在{length}字左右：\n\n{context}'
        }
    ]
    
    logger.info(f'开始AI续写，context_length: {len(context)}, length: {length}, provider: {provider}, temperature: {temperature}, max_tokens: {max_tokens}')
    
    try:
        # 使用统一AI服务接口
        result = ai_service.chat_completion(
            messages=messages,
            provider=provider,
            max_tokens=max_tokens,
            temperature=temperature
        )
        
        continuation = result['content']
        logger.info(f'AI续写成功，长度: {len(continuation)}, provider: {result.get("provider")}')
        
        return jsonify({'success': True, 'continuation': continuation, 'provider': result.get("provider")})
        
    except ValueError as e:
        logger.error(f'AI服务错误: {str(e)}')
        if '未配置' in str(e):
            return jsonify({'error': str(e)}), 401
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        logger.error(f'AI续写时发生错误: {str(e)}')
        return jsonify({'error': f'续写失败: {str(e)}'}), 500

@api_bp.route('/ai/rewrite', methods=['POST'])
def rewrite():
    """
    AI润色功能
    """
    data = request.json
    text = data.get('text', '')
    style = data.get('style', '流畅自然')
    provider = data.get('provider', None)  # 可选的服务提供商
    temperature = data.get('temperature', 0.5)  # 温度设置
    max_tokens = data.get('max_tokens', len(text) * 2)  # token限制设置
    
    if not text:
        return jsonify({'error': '缺少需要润色的文本'}), 400
    
    messages = [
        {
            'role': 'system',
            'content': '你是一位专业的编辑，擅长润色和优化文章。'
        },
        {
            'role': 'user',
            'content': f'请按照{style}的风格润色以下文本，保持原意不变：\n\n{text}'
        }
    ]
    
    logger.info(f'开始AI润色，text_length: {len(text)}, style: {style}, provider: {provider}, temperature: {temperature}, max_tokens: {max_tokens}')
    
    try:
        # 使用统一AI服务接口
        result = ai_service.chat_completion(
            messages=messages,
            provider=provider,
            max_tokens=max_tokens,
            temperature=temperature
        )
        
        rewritten = result['content']
        logger.info(f'AI润色成功，长度: {len(rewritten)}, provider: {result.get("provider")}')
        
        return jsonify({'success': True, 'rewritten': rewritten, 'provider': result.get("provider")})
        
    except ValueError as e:
        logger.error(f'AI服务错误: {str(e)}')
        if '未配置' in str(e):
            return jsonify({'error': str(e)}), 401
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        logger.error(f'AI润色时发生错误: {str(e)}')
        return jsonify({'error': f'润色失败: {str(e)}'}), 500

@api_bp.route('/ai/generate-world', methods=['POST'])
def generate_world():
    """
    智能世界观生成
    """
    data = request.json
    prompt = data.get('prompt', '')
    elements = data.get('elements', [])
    provider = data.get('provider', None)  # 可选的服务提供商
    temperature = data.get('temperature', 0.7)  # 温度设置
    max_tokens = data.get('max_tokens', 2000)  # token限制设置
    
    if not prompt:
        return jsonify({'error': '缺少世界观创意'}), 400
    
    messages = [
        {
            'role': 'system',
            'content': '你是一位专业的小说世界观设定师，擅长构建完整、丰富的虚构世界。'
        },
        {
            'role': 'user',
            'content': f'请根据以下创意生成一个详细的小说世界观设定，包括但不限于：世界起源、地理环境、种族、文化、历史、魔法/科技体系、重要势力等。\n\n创意：{prompt}'
        }
    ]
    
    logger.info(f'开始生成世界观，prompt: {prompt[:100]}..., elements: {elements}, provider: {provider}, temperature: {temperature}, max_tokens: {max_tokens}')
    
    try:
        # 使用统一AI服务接口
        result = ai_service.chat_completion(
            messages=messages,
            provider=provider,
            max_tokens=max_tokens,
            temperature=temperature
        )
        
        world = result['content']
        logger.info(f'世界观生成成功，长度: {len(world)}, provider: {result.get("provider")}')
        
        return jsonify({'success': True, 'world': world, 'provider': result.get("provider")})
        
    except ValueError as e:
        logger.error(f'AI服务错误: {str(e)}')
        if '未配置' in str(e):
            return jsonify({'error': str(e)}), 401
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        logger.error(f'生成世界观时发生错误: {str(e)}')
        return jsonify({'error': f'生成失败: {str(e)}'}), 500

@api_bp.route('/ai/generate-character', methods=['POST'])
def generate_character():
    """
    智能角色生成
    """
    data = request.json
    prompt = data.get('prompt', '')
    provider = data.get('provider', None)  # 可选的服务提供商
    temperature = data.get('temperature', 0.7)  # 温度设置
    max_tokens = data.get('max_tokens', 1500)  # token限制设置
    
    if not prompt:
        return jsonify({'error': '缺少角色创意'}), 400
    
    messages = [
        {
            'role': 'system',
            'content': '你是一位专业的小说角色设计师，擅长创建立体、丰满的人物形象。'
        },
        {
            'role': 'user',
            'content': f'请根据以下创意生成一个详细的小说角色设定，包括但不限于：基本信息、外貌特征、性格特点、背景故事、人物弧光、动机目标、秘密与谎言等。\n\n创意：{prompt}'
        }
    ]
    
    logger.info(f'开始生成角色，prompt: {prompt[:100]}..., provider: {provider}, temperature: {temperature}, max_tokens: {max_tokens}')
    
    try:
        # 使用统一AI服务接口
        result = ai_service.chat_completion(
            messages=messages,
            provider=provider,
            max_tokens=max_tokens,
            temperature=temperature
        )
        
        character = result['content']
        logger.info(f'角色生成成功，长度: {len(character)}, provider: {result.get("provider")}')
        
        return jsonify({'success': True, 'character': character, 'provider': result.get("provider")})
        
    except ValueError as e:
        logger.error(f'AI服务错误: {str(e)}')
        if '未配置' in str(e):
            return jsonify({'error': str(e)}), 401
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        logger.error(f'生成角色时发生错误: {str(e)}')
        return jsonify({'error': f'生成失败: {str(e)}'}), 500


@api_bp.route('/ai/stream', methods=['POST'])
def stream_chat_completion():
    """
    流式聊天完成接口
    """
    data = request.json
    messages = data.get('messages', [])
    provider = data.get('provider', None)  # 可选的服务提供商
    temperature = data.get('temperature', 0.7)  # 温度设置
    max_tokens = data.get('max_tokens', 1000)  # token限制设置
    
    if not messages:
        return jsonify({'error': '缺少消息列表'}), 400
    
    logger.info(f'开始流式聊天完成，messages: {messages[:1]}..., provider: {provider}, temperature: {temperature}, max_tokens: {max_tokens}')
    
    try:
        # 使用统一AI服务接口
        stream = ai_service.stream_chat_completion(
            messages=messages,
            provider=provider,
            max_tokens=max_tokens,
            temperature=temperature
        )
        
        # 流式响应
        def generate():
            for chunk in stream:
                import json
                yield f"data: {json.dumps(chunk)}\n\n"
            yield "data: [DONE]\n\n"
        
        return current_app.response_class(generate(), mimetype='text/event-stream')
        
    except ValueError as e:
        logger.error(f'AI服务错误: {str(e)}')
        if '未配置' in str(e):
            return jsonify({'error': str(e)}), 401
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        logger.error(f'流式聊天完成错误: {str(e)}')
        return jsonify({'error': f'流式生成失败: {str(e)}'}), 500


@api_bp.route('/ai/config', methods=['GET'])
def get_ai_config():
    """
    获取AI服务配置
    """
    try:
        config = {
            'default_provider': ai_config.get_default_provider(),
            'available_providers': ai_service.get_available_providers(),
            'configured_providers': ai_service.get_configured_providers(),
            'providers': {}
        }
        
        # 获取每个提供商的配置
        for provider in ai_service.get_available_providers():
            provider_config = ai_config.get_provider_config(provider)
            # 隐藏API密钥
            safe_config = {k: v for k, v in provider_config.items() if k != 'api_key'}
            safe_config['configured'] = ai_config.is_provider_configured(provider)
            config['providers'][provider] = safe_config
        
        return jsonify({'success': True, 'config': config})
        
    except Exception as e:
        logger.error(f'获取AI配置失败: {str(e)}')
        return jsonify({'error': str(e)}), 500


@api_bp.route('/ai/config/provider', methods=['PUT'])
def set_default_provider():
    """
    设置默认AI服务提供商
    """
    try:
        data = request.json
        provider = data.get('provider')
        
        if not provider:
            return jsonify({'error': '缺少提供商名称'}), 400
        
        success = ai_config.set_default_provider(provider)
        if not success:
            return jsonify({'error': f'提供商 {provider} 不存在'}), 400
        
        return jsonify({'success': True, 'default_provider': provider})
        
    except Exception as e:
        logger.error(f'设置默认提供商失败: {str(e)}')
        return jsonify({'error': str(e)}), 500


@api_bp.route('/ai/config/provider/<provider>', methods=['PUT'])
def update_provider_config(provider):
    """
    更新AI服务提供商配置
    """
    try:
        data = request.json
        
        success = ai_config.update_provider_config(provider, data)
        if not success:
            return jsonify({'error': f'提供商 {provider} 不存在'}), 400
        
        return jsonify({'success': True, 'provider': provider})
        
    except Exception as e:
        logger.error(f'更新提供商配置失败: {str(e)}')
        return jsonify({'error': str(e)}), 500


@api_bp.route('/ai/config/provider/<provider>/test', methods=['POST'])
def test_provider_connection(provider):
    """
    测试AI服务提供商连通性
    """
    try:
        result = ai_service.test_connection(provider)
        return jsonify({'success': True, 'result': result})
        
    except ValueError as e:
        logger.error(f'测试提供商连通性失败: {str(e)}')
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f'测试提供商连通性失败: {str(e)}')
        return jsonify({'error': str(e)}), 500

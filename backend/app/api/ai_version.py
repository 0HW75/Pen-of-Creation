from app.api import api_bp
from app import db
from app.models import AIGenerationVersion
from flask import request, jsonify
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@api_bp.route('/ai-versions', methods=['POST'])
def create_ai_version():
    """
    创建AI生成版本
    """
    data = request.json
    
    project_id = data.get('project_id')
    entity_type = data.get('entity_type')
    entity_id = data.get('entity_id')
    content = data.get('content', '')
    
    if not all([project_id, entity_type, entity_id]):
        return jsonify({'error': '缺少必要参数：project_id, entity_type, entity_id'}), 400
    
    try:
        # 获取当前最大版本号
        latest_version = AIGenerationVersion.query.filter_by(
            project_id=project_id,
            entity_type=entity_type,
            entity_id=entity_id
        ).order_by(AIGenerationVersion.version_number.desc()).first()
        
        version_number = (latest_version.version_number + 1) if latest_version else 1
        version_name = data.get('version_name', f'AI生成-{version_number}')
        
        # 如果设置为当前版本，先将其他版本设为非当前
        if data.get('is_current', False):
            AIGenerationVersion.query.filter_by(
                project_id=project_id,
                entity_type=entity_type,
                entity_id=entity_id,
                is_current=True
            ).update({'is_current': False})
        
        new_version = AIGenerationVersion(
            project_id=project_id,
            entity_type=entity_type,
            entity_id=entity_id,
            version_number=version_number,
            version_name=version_name,
            content=content,
            prompt=data.get('prompt', ''),
            provider=data.get('provider', ''),
            temperature=data.get('temperature', 0.7),
            is_current=data.get('is_current', False),
            is_favorite=data.get('is_favorite', False),
            parent_version_id=data.get('parent_version_id'),
            generation_params=json.dumps(data.get('generation_params', {})),
            word_count=len(content) if content else 0
        )
        
        db.session.add(new_version)
        db.session.commit()
        
        logger.info(f'创建AI版本成功: project_id={project_id}, entity_type={entity_type}, entity_id={entity_id}, version={version_number}')
        
        return jsonify(new_version.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f'创建AI版本失败: {str(e)}')
        return jsonify({'error': f'创建失败: {str(e)}'}), 500


@api_bp.route('/ai-versions', methods=['GET'])
def get_ai_versions():
    """
    获取AI生成版本列表
    支持按 project_id, entity_type, entity_id 过滤
    """
    project_id = request.args.get('project_id', type=int)
    entity_type = request.args.get('entity_type')
    entity_id = request.args.get('entity_id', type=int)
    
    query = AIGenerationVersion.query
    
    if project_id:
        query = query.filter_by(project_id=project_id)
    if entity_type:
        query = query.filter_by(entity_type=entity_type)
    if entity_id:
        query = query.filter_by(entity_id=entity_id)
    
    versions = query.order_by(AIGenerationVersion.version_number.desc()).all()
    
    return jsonify([version.to_dict() for version in versions])


@api_bp.route('/ai-versions/<int:id>', methods=['GET'])
def get_ai_version(id):
    """
    获取单个AI生成版本详情
    """
    version = AIGenerationVersion.query.get(id)
    if not version:
        return jsonify({'error': '版本不存在'}), 404
    
    return jsonify(version.to_dict())


@api_bp.route('/ai-versions/<int:id>', methods=['PUT'])
def update_ai_version(id):
    """
    更新AI生成版本
    """
    version = AIGenerationVersion.query.get(id)
    if not version:
        return jsonify({'error': '版本不存在'}), 404
    
    data = request.json
    
    try:
        # 如果设置为当前版本，先将同实体的其他版本设为非当前
        if data.get('is_current') and not version.is_current:
            AIGenerationVersion.query.filter_by(
                project_id=version.project_id,
                entity_type=version.entity_type,
                entity_id=version.entity_id,
                is_current=True
            ).update({'is_current': False})
        
        version.version_name = data.get('version_name', version.version_name)
        version.content = data.get('content', version.content)
        version.is_current = data.get('is_current', version.is_current)
        version.is_favorite = data.get('is_favorite', version.is_favorite)
        
        if 'content' in data:
            version.word_count = len(data['content'])
        
        db.session.commit()
        
        logger.info(f'更新AI版本成功: id={id}')
        
        return jsonify(version.to_dict())
        
    except Exception as e:
        db.session.rollback()
        logger.error(f'更新AI版本失败: {str(e)}')
        return jsonify({'error': f'更新失败: {str(e)}'}), 500


@api_bp.route('/ai-versions/<int:id>', methods=['DELETE'])
def delete_ai_version(id):
    """
    删除AI生成版本
    """
    version = AIGenerationVersion.query.get(id)
    if not version:
        return jsonify({'error': '版本不存在'}), 404
    
    try:
        db.session.delete(version)
        db.session.commit()
        
        logger.info(f'删除AI版本成功: id={id}')
        
        return jsonify({'message': '删除成功'})
        
    except Exception as e:
        db.session.rollback()
        logger.error(f'删除AI版本失败: {str(e)}')
        return jsonify({'error': f'删除失败: {str(e)}'}), 500


@api_bp.route('/ai-versions/<int:id>/set-current', methods=['POST'])
def set_current_version(id):
    """
    设置指定版本为当前使用版本
    """
    version = AIGenerationVersion.query.get(id)
    if not version:
        return jsonify({'error': '版本不存在'}), 404
    
    try:
        # 将同实体的其他版本设为非当前
        AIGenerationVersion.query.filter_by(
            project_id=version.project_id,
            entity_type=version.entity_type,
            entity_id=version.entity_id,
            is_current=True
        ).update({'is_current': False})
        
        version.is_current = True
        db.session.commit()
        
        logger.info(f'设置当前版本成功: id={id}')
        
        return jsonify(version.to_dict())
        
    except Exception as e:
        db.session.rollback()
        logger.error(f'设置当前版本失败: {str(e)}')
        return jsonify({'error': f'设置失败: {str(e)}'}), 500


@api_bp.route('/ai-versions/compare', methods=['POST'])
def compare_versions():
    """
    对比两个版本的内容差异
    """
    data = request.json
    version_id_1 = data.get('version_id_1')
    version_id_2 = data.get('version_id_2')
    
    if not version_id_1 or not version_id_2:
        return jsonify({'error': '需要提供两个版本ID'}), 400
    
    version_1 = AIGenerationVersion.query.get(version_id_1)
    version_2 = AIGenerationVersion.query.get(version_id_2)
    
    if not version_1 or not version_2:
        return jsonify({'error': '版本不存在'}), 404
    
    # 简单的文本对比（返回两个版本的内容）
    # 前端可以使用diff库进行更精细的对比
    return jsonify({
        'version_1': version_1.to_dict(),
        'version_2': version_2.to_dict(),
        'diff_stats': {
            'version_1_word_count': version_1.word_count,
            'version_2_word_count': version_2.word_count,
            'word_count_diff': version_2.word_count - version_1.word_count
        }
    })


@api_bp.route('/ai-versions/<int:id>/regenerate', methods=['POST'])
def regenerate_version(id):
    """
    基于指定版本重新生成内容
    """
    from app.services.ai_service import ai_service
    
    version = AIGenerationVersion.query.get(id)
    if not version:
        return jsonify({'error': '版本不存在'}), 404
    
    data = request.json
    modification_prompt = data.get('modification_prompt', '')  # 修改提示词
    selected_text = data.get('selected_text', '')  # 选中的文本（局部重新生成）
    
    try:
        # 构建重新生成的提示词
        base_prompt = version.prompt
        if modification_prompt:
            base_prompt += f"\n\n修改要求：{modification_prompt}"
        
        if selected_text:
            # 局部重新生成
            user_prompt = f"原文内容：\n{version.content}\n\n请修改以下段落：\n{selected_text}\n\n修改要求：{modification_prompt}"
        else:
            # 整体重新生成
            user_prompt = f"请基于以下内容重新生成，{modification_prompt}：\n\n{version.content}"
        
        messages = [
            {
                'role': 'system',
                'content': '你是一位专业的小说作家，擅长根据要求修改和优化内容。'
            },
            {
                'role': 'user',
                'content': user_prompt
            }
        ]
        
        # 调用AI服务
        result = ai_service.chat_completion(
            messages=messages,
            provider=data.get('provider', version.provider),
            max_tokens=data.get('max_tokens', 2000),
            temperature=data.get('temperature', version.temperature)
        )
        
        new_content = result['content']
        
        # 创建新版本
        latest_version = AIGenerationVersion.query.filter_by(
            project_id=version.project_id,
            entity_type=version.entity_type,
            entity_id=version.entity_id
        ).order_by(AIGenerationVersion.version_number.desc()).first()
        
        version_number = (latest_version.version_number + 1) if latest_version else 1
        
        new_version = AIGenerationVersion(
            project_id=version.project_id,
            entity_type=version.entity_type,
            entity_id=version.entity_id,
            version_number=version_number,
            version_name=f'重新生成-{version_number}',
            content=new_content,
            prompt=base_prompt,
            provider=result.get('provider', version.provider),
            temperature=data.get('temperature', version.temperature),
            is_current=False,
            parent_version_id=version.id,
            generation_params=json.dumps({
                'modification_prompt': modification_prompt,
                'selected_text': selected_text,
                'is_regeneration': True
            }),
            word_count=len(new_content)
        )
        
        db.session.add(new_version)
        db.session.commit()
        
        logger.info(f'重新生成成功: parent_id={id}, new_version={version_number}')
        
        return jsonify({
            'success': True,
            'new_version': new_version.to_dict(),
            'provider': result.get('provider')
        })
        
    except Exception as e:
        db.session.rollback()
        logger.error(f'重新生成失败: {str(e)}')
        return jsonify({'error': f'重新生成失败: {str(e)}'}), 500


@api_bp.route('/ai-versions/entity/<entity_type>/<int:entity_id>/current', methods=['GET'])
def get_current_version(entity_type, entity_id):
    """
    获取指定实体的当前使用版本
    """
    version = AIGenerationVersion.query.filter_by(
        entity_type=entity_type,
        entity_id=entity_id,
        is_current=True
    ).first()
    
    if not version:
        return jsonify({'error': '未找到当前版本'}), 404
    
    return jsonify(version.to_dict())


@api_bp.route('/ai-versions/entity/<entity_type>/<int:entity_id>/apply', methods=['POST'])
def apply_version_to_entity(entity_type, entity_id):
    """
    将指定版本应用到实体（如大纲、卷纲、章纲）
    """
    data = request.json
    version_id = data.get('version_id')
    
    if not version_id:
        return jsonify({'error': '需要提供版本ID'}), 400
    
    version = AIGenerationVersion.query.get(version_id)
    if not version:
        return jsonify({'error': '版本不存在'}), 404
    
    try:
        # 根据实体类型更新对应的数据库记录
        if entity_type == 'outline':
            from app.models import Outline
            entity = Outline.query.get(entity_id)
            if entity:
                entity.content = version.content
                entity.version += 1
        elif entity_type == 'volume':
            from app.models import Volume
            entity = Volume.query.get(entity_id)
            if entity:
                entity.content = version.content
                entity.version += 1
        elif entity_type == 'chapter':
            from app.models import Chapter
            entity = Chapter.query.get(entity_id)
            if entity:
                entity.content = version.content
                entity.version += 1
        else:
            return jsonify({'error': '不支持的实体类型'}), 400
        
        if not entity:
            return jsonify({'error': '实体不存在'}), 404
        
        # 设置该版本为当前版本
        AIGenerationVersion.query.filter_by(
            project_id=version.project_id,
            entity_type=entity_type,
            entity_id=entity_id,
            is_current=True
        ).update({'is_current': False})
        
        version.is_current = True
        db.session.commit()
        
        logger.info(f'应用版本成功: version_id={version_id}, entity_type={entity_type}, entity_id={entity_id}')
        
        return jsonify({
            'success': True,
            'message': '版本已应用',
            'version': version.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        logger.error(f'应用版本失败: {str(e)}')
        return jsonify({'error': f'应用失败: {str(e)}'}), 500

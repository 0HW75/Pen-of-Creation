from app.api import api_bp
from app import db
from app.models import Chapter
from flask import request, jsonify, current_app
import json

@api_bp.route('/projects/<int:project_id>/chapters', methods=['GET'])
def get_chapters(project_id):
    chapters = Chapter.query.filter_by(project_id=project_id).order_by(Chapter.order_index).all()
    # 使用模型的to_dict()方法
    result = [chapter.to_dict() for chapter in chapters]
    return jsonify(result)

@api_bp.route('/chapters', methods=['POST'])
def create_chapter():
    data = request.json
    
    # 检查必需字段
    if not data:
        return jsonify({'error': 'No data received'}), 400
    if 'project_id' not in data:
        return jsonify({'error': 'Missing required field: project_id'}), 400
    if 'title' not in data:
        return jsonify({'error': 'Missing required field: title'}), 400
    if 'order_index' not in data:
        return jsonify({'error': 'Missing required field: order_index'}), 400
    
    new_chapter = Chapter(
        project_id=data['project_id'],
        volume_id=data.get('volume_id'),
        volume=data.get('volume', ''),
        title=data['title'],
        content=data.get('content', ''),
        outline_content=data.get('outline_content', ''),
        status=data.get('status', '未写'),
        type=data.get('type', '普通'),
        order_index=data['order_index']
    )
    # 计算字数
    new_chapter.word_count = len(new_chapter.content)
    db.session.add(new_chapter)
    db.session.commit()
    # 使用模型的to_dict()方法
    return jsonify(new_chapter.to_dict()), 201

@api_bp.route('/chapters/<int:id>', methods=['GET'])
def get_chapter(id):
    chapter = Chapter.query.get(id)
    if not chapter:
        return jsonify({'error': 'Chapter not found'}), 404
    # 使用模型的to_dict()方法
    return jsonify(chapter.to_dict())

@api_bp.route('/chapters/<int:id>', methods=['PUT'])
def update_chapter(id):
    chapter = Chapter.query.get(id)
    if not chapter:
        return jsonify({'error': 'Chapter not found'}), 404
    data = request.json
    
    current_app.logger.info(f"=== [DEBUG] chapter.py 更新章纲 {id} ===")
    current_app.logger.info(f"[DEBUG] 接收到的core_event: {data.get('core_event')}")
    
    chapter.title = data.get('title', chapter.title)
    chapter.content = data.get('content', chapter.content)
    chapter.outline_content = data.get('outline_content', chapter.outline_content)
    chapter.status = data.get('status', chapter.status)
    chapter.type = data.get('type', chapter.type)
    chapter.volume = data.get('volume', chapter.volume)
    chapter.order_index = data.get('order_index', chapter.order_index)
    
    # 添加对 core_event, scenes, characters 等字段的处理
    chapter.core_event = data.get('core_event', chapter.core_event)
    chapter.emotional_goal = data.get('emotional_goal', chapter.emotional_goal)
    chapter.word_count_estimate = data.get('word_count_estimate', chapter.word_count_estimate)
    
    # 处理数组字段
    scenes = data.get('scenes', chapter.scenes)
    if isinstance(scenes, list):
        scenes = json.dumps(scenes, ensure_ascii=False)
    chapter.scenes = scenes
    
    characters = data.get('characters', chapter.characters)
    if isinstance(characters, list):
        characters = json.dumps(characters, ensure_ascii=False)
    chapter.characters = characters
    
    keywords = data.get('keywords', chapter.keywords)
    if isinstance(keywords, list):
        keywords = json.dumps(keywords, ensure_ascii=False)
    chapter.keywords = keywords
    
    chapter.word_count = len(chapter.content) if chapter.content else 0
    
    current_app.logger.info(f"[DEBUG] 保存前 chapter.core_event: {chapter.core_event}")
    db.session.commit()
    current_app.logger.info(f"[DEBUG] 保存后 chapter.core_event: {chapter.core_event}")
    
    return jsonify(chapter.to_dict())

@api_bp.route('/chapters/<int:id>', methods=['DELETE'])
def delete_chapter(id):
    chapter = Chapter.query.get(id)
    if not chapter:
        return jsonify({'error': 'Chapter not found'}), 404
    db.session.delete(chapter)
    db.session.commit()
    return jsonify({'message': 'Chapter deleted successfully'})

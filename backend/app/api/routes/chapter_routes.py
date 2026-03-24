from app.api import api_bp
from app import db
from app.models import Chapter
from flask import request, jsonify, current_app
import json

@api_bp.route('/chapters/<int:id>', methods=['PUT'])
def update_chapter_details(id):
    chapter = Chapter.query.get(id)
    if not chapter:
        return jsonify({'error': 'Chapter not found'}), 404

    data = request.json
    current_app.logger.info(f"=== [DEBUG] 更新章纲 {id} ===")
    current_app.logger.info(f"[DEBUG] 接收到的core_event: {data.get('core_event')}")
    current_app.logger.info(f"[DEBUG] 接收到的content前50字: {data.get('content', '')[:50]}...")
    current_app.logger.info(f"[DEBUG] 接收到的scenes类型: {type(data.get('scenes'))}")

    chapter.title = data.get('title', chapter.title)

    scenes = data.get('scenes', chapter.scenes)
    if isinstance(scenes, list):
        scenes = json.dumps(scenes, ensure_ascii=False)
    chapter.scenes = scenes

    characters = data.get('characters', chapter.characters)
    if isinstance(characters, list):
        characters = json.dumps(characters, ensure_ascii=False)
    chapter.characters = characters

    chapter.core_event = data.get('core_event', chapter.core_event)
    chapter.emotional_goal = data.get('emotional_goal', chapter.emotional_goal)

    keywords = data.get('keywords', chapter.keywords)
    if isinstance(keywords, list):
        keywords = json.dumps(keywords, ensure_ascii=False)
    chapter.keywords = keywords

    chapter.word_count_estimate = data.get('word_count_estimate', chapter.word_count_estimate)

    current_app.logger.info(f"[DEBUG] 保存前 chapter.core_event: {chapter.core_event}")
    current_app.logger.info(f"[DEBUG] 即将保存的core_event: {data.get('core_event')}")
    db.session.commit()
    current_app.logger.info(f"[DEBUG] 保存后 chapter.core_event: {chapter.core_event}")
    result = chapter.to_dict()
    current_app.logger.info(f"[DEBUG] 返回的core_event: {result.get('core_event')}")
    return jsonify(result)

@api_bp.route('/chapters/<int:id>/evaluate', methods=['GET'])
def evaluate_chapter(id):
    chapter = Chapter.query.get(id)
    if not chapter:
        return jsonify({'error': 'Chapter not found'}), 404

    evaluation = {
        'chapter_id': id,
        'function_distribution': {
            'main_plot': 70,
            'character_development': 20,
            'foreshadowing': 10
        },
        'rhythm_evaluation': 'Good',
        'conflict_density': 'Moderate',
        'character_balance': 'Balanced'
    }

    return jsonify(evaluation)

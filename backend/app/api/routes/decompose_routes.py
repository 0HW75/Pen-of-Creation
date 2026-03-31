from app.api import api_bp
from app import db
from app.models import Volume, Chapter
from flask import request, jsonify, current_app
import json

@api_bp.route('/volumes/<int:id>/decompose', methods=['POST'])
def decompose_volume(id):
    volume = Volume.query.get(id)
    if not volume:
        return jsonify({'error': 'Volume not found'}), 404

    data = request.json

    if isinstance(data, list):
        created_chapters = []
        
        # 获取该卷现有的所有章节
        existing_chapters = Chapter.query.filter_by(
            project_id=volume.project_id,
            volume_id=volume.id
        ).order_by(Chapter.order_index).all()
        
        # 按 order_index 建立映射
        existing_by_index = {ch.order_index: ch for ch in existing_chapters}
        
        # 遍历传入的数据创建/更新章节
        for idx, chap_data in enumerate(data):
            order_index = chap_data.get('order_index', idx)
            
            # 尝试通过 order_index 查找现有章节
            existing_chapter = existing_by_index.get(order_index)
            
            if existing_chapter:
                # 更新现有章节
                existing_chapter.title = chap_data.get('title', existing_chapter.title)
                existing_chapter.content = chap_data.get('content', existing_chapter.content)
                existing_chapter.core_event = chap_data.get('core_event', existing_chapter.core_event)
                existing_chapter.emotional_goal = chap_data.get('emotional_goal', existing_chapter.emotional_goal)
                existing_chapter.word_count_estimate = chap_data.get('word_count_estimate', existing_chapter.word_count_estimate)
                if 'scenes' in chap_data:
                    existing_chapter.scenes = json.dumps(chap_data['scenes']) if isinstance(chap_data['scenes'], list) else chap_data['scenes']
                if 'characters' in chap_data:
                    existing_chapter.characters = json.dumps(chap_data['characters']) if isinstance(chap_data['characters'], list) else chap_data['characters']
                if 'keywords' in chap_data:
                    existing_chapter.keywords = json.dumps(chap_data['keywords']) if isinstance(chap_data['keywords'], list) else chap_data['keywords']
                existing_chapter.version += 1
                created_chapters.append(existing_chapter)
            else:
                # 创建新章节
                new_chapter = Chapter(
                    project_id=volume.project_id,
                    volume_id=volume.id,
                    title=chap_data.get('title', '未命名章'),
                    content=chap_data.get('content', ''),
                    core_event=chap_data.get('core_event', ''),
                    emotional_goal=chap_data.get('emotional_goal', ''),
                    word_count_estimate=chap_data.get('word_count_estimate', 2000),
                    order_index=order_index,
                    version=1
                )
                if 'scenes' in chap_data:
                    new_chapter.scenes = json.dumps(chap_data['scenes']) if isinstance(chap_data['scenes'], list) else chap_data['scenes']
                if 'characters' in chap_data:
                    new_chapter.characters = json.dumps(chap_data['characters']) if isinstance(chap_data['characters'], list) else chap_data['characters']
                if 'keywords' in chap_data:
                    new_chapter.keywords = json.dumps(chap_data['keywords']) if isinstance(chap_data['keywords'], list) else chap_data['keywords']
                db.session.add(new_chapter)
                created_chapters.append(new_chapter)
        
        # 删除不在新数据中的旧章节
        new_order_indices = set(chap_data.get('order_index', idx) for idx, chap_data in enumerate(data))
        for existing_ch in existing_chapters:
            if existing_ch.order_index not in new_order_indices:
                db.session.delete(existing_ch)
    else:
        existing_chapter = Chapter.query.filter_by(
            project_id=volume.project_id,
            volume_id=volume.id,
            order_index=data.get('order_index', 1)
        ).first()

        if existing_chapter:
            existing_chapter.title = data.get('title', existing_chapter.title)
            existing_chapter.content = data.get('content', existing_chapter.content)
            existing_chapter.core_event = data.get('core_event', existing_chapter.core_event)
            existing_chapter.emotional_goal = data.get('emotional_goal', existing_chapter.emotional_goal)
            existing_chapter.word_count_estimate = data.get('word_count_estimate', existing_chapter.word_count_estimate)
            if 'scenes' in data:
                existing_chapter.scenes = json.dumps(data['scenes']) if isinstance(data['scenes'], list) else data['scenes']
            if 'characters' in data:
                existing_chapter.characters = json.dumps(data['characters']) if isinstance(data['characters'], list) else data['characters']
            if 'keywords' in data:
                existing_chapter.keywords = json.dumps(data['keywords']) if isinstance(data['keywords'], list) else data['keywords']
            existing_chapter.version += 1
            created_chapters = [existing_chapter]
        else:
            new_chapter = Chapter(
                project_id=volume.project_id,
                volume_id=volume.id,
                title=data.get('title', '未命名章'),
                content=data.get('content', ''),
                core_event=data.get('core_event', ''),
                emotional_goal=data.get('emotional_goal', ''),
                word_count_estimate=data.get('word_count_estimate', 2000),
                order_index=data.get('order_index', 1),
                version=1
            )
            if 'scenes' in data:
                new_chapter.scenes = json.dumps(data['scenes']) if isinstance(data['scenes'], list) else data['scenes']
            if 'characters' in data:
                new_chapter.characters = json.dumps(data['characters']) if isinstance(data['characters'], list) else data['characters']
            if 'keywords' in data:
                new_chapter.keywords = json.dumps(data['keywords']) if isinstance(data['keywords'], list) else data['keywords']
            db.session.add(new_chapter)
            created_chapters = [new_chapter]

    db.session.commit()
    return jsonify([chapter.to_dict() for chapter in created_chapters]), 201

@api_bp.route('/volumes/<int:volume_id>/chapters', methods=['GET'])
def get_volume_chapters(volume_id):
    chapters = Chapter.query.filter_by(volume_id=volume_id).order_by(Chapter.order_index).all()
    return jsonify([chapter.to_dict() for chapter in chapters])

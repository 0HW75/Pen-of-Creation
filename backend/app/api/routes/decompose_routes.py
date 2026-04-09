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

    def save_chapter_fields(chapter, data):
        chapter.title = data.get('title', chapter.title)
        chapter.emotional_goal = data.get('emotional_goal', '')
        chapter.word_count_estimate = data.get('word_count_estimate', 2000)

        core_event = data.get('core_event', '')
        if isinstance(core_event, list):
            chapter.core_event = json.dumps(core_event, ensure_ascii=False)
        else:
            chapter.core_event = core_event or ''

        scenes = data.get('scenes', [])
        if isinstance(scenes, list):
            chapter.scenes = json.dumps(scenes, ensure_ascii=False)
        else:
            chapter.scenes = scenes or '[]'

        characters = data.get('characters', [])
        if isinstance(characters, list):
            chapter.characters = json.dumps(characters, ensure_ascii=False)
        else:
            chapter.characters = characters or '[]'

        return chapter

    if isinstance(data, list):
        created_chapters = []
        
        existing_chapters = Chapter.query.filter_by(
            project_id=volume.project_id,
            volume_id=volume.id
        ).order_by(Chapter.order_index).all()
        
        existing_by_index = {ch.order_index: ch for ch in existing_chapters}

        for idx, chap_data in enumerate(data):
            order_index = chap_data.get('order_index', idx)

            # 尝试通过 order_index 查找现有章节
            existing_chapter = existing_by_index.get(order_index)

            if existing_chapter:
                save_chapter_fields(existing_chapter, chap_data)
                existing_chapter.version += 1
                created_chapters.append(existing_chapter)
            else:
                new_chapter = Chapter(
                    project_id=volume.project_id,
                    volume_id=volume.id,
                    title=chap_data.get('title', '未命名章'),
                    emotional_goal=chap_data.get('emotional_goal', ''),
                    word_count_estimate=chap_data.get('word_count_estimate', 2000),
                    order_index=order_index,
                    version=1
                )
                save_chapter_fields(new_chapter, chap_data)
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
            save_chapter_fields(existing_chapter, data)
            existing_chapter.version += 1
            created_chapters = [existing_chapter]
        else:
            new_chapter = Chapter(
                project_id=volume.project_id,
                volume_id=volume.id,
                title=data.get('title', '未命名章'),
                emotional_goal=data.get('emotional_goal', ''),
                word_count_estimate=data.get('word_count_estimate', 2000),
                order_index=data.get('order_index', 1),
                version=1
            )
            save_chapter_fields(new_chapter, data)
            db.session.add(new_chapter)
            created_chapters = [new_chapter]

    db.session.commit()
    return jsonify([chapter.to_dict() for chapter in created_chapters]), 201

@api_bp.route('/volumes/<int:volume_id>/chapters', methods=['GET'])
def get_volume_chapters(volume_id):
    chapters = Chapter.query.filter_by(volume_id=volume_id).order_by(Chapter.order_index).all()
    return jsonify([chapter.to_dict() for chapter in chapters])

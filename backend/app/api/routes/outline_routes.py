from app.api import api_bp
from app import db
from app.models import Outline
from app.services.ai_service import ai_service
from app.config.ai_config import AIConfig
from flask import request, jsonify
import logging
import json

logger = logging.getLogger(__name__)

ai_config = AIConfig()

@api_bp.route('/outlines', methods=['POST'])
def create_outline():
    data = request.json

    new_outline = Outline(
        project_id=data['project_id'],
        title=data['title'],
        content=data.get('content', ''),
        story_model=data.get('story_model', ''),
        version=data.get('version', 1)
    )
    db.session.add(new_outline)
    db.session.commit()
    return jsonify(new_outline.to_dict()), 201

@api_bp.route('/projects/<int:id>/outline', methods=['GET'])
def get_project_outline(id):
    outlines = Outline.query.filter_by(project_id=id).order_by(Outline.version.desc()).all()
    result = [outline.to_dict() for outline in outlines]
    return jsonify(result)

@api_bp.route('/outlines/<int:id>', methods=['GET'])
def get_outline(id):
    outline = Outline.query.get(id)
    if not outline:
        return jsonify({'error': 'Outline not found'}), 404
    return jsonify(outline.to_dict())

@api_bp.route('/outlines/<int:id>', methods=['PUT'])
def update_outline(id):
    outline = Outline.query.get(id)
    if not outline:
        return jsonify({'error': 'Outline not found'}), 404

    data = request.json
    outline.title = data.get('title', outline.title)
    outline.content = data.get('content', outline.content)
    outline.story_model = data.get('story_model', outline.story_model)
    outline.version = data.get('version', outline.version)

    db.session.commit()
    return jsonify(outline.to_dict())

@api_bp.route('/outlines/<int:id>', methods=['DELETE'])
def delete_outline(id):
    outline = Outline.query.get(id)
    if not outline:
        return jsonify({'error': 'Outline not found'}), 404

    from app.models import Volume, Chapter
    volumes = Volume.query.filter_by(outline_id=id).all()
    for volume in volumes:
        chapters = Chapter.query.filter_by(volume_id=volume.id).all()
        for chapter in chapters:
            db.session.delete(chapter)
        db.session.delete(volume)

    db.session.delete(outline)
    db.session.commit()
    return jsonify({'message': 'Outline and related volumes/chapters deleted successfully'})

from app.api import api_bp
from app import db
from app.models import Volume
from flask import request, jsonify
import json

@api_bp.route('/outlines/<int:outline_id>/volumes', methods=['GET'])
def get_outline_volumes(outline_id):
    volumes = Volume.query.filter_by(outline_id=outline_id).order_by(Volume.order_index).all()
    return jsonify([volume.to_dict() for volume in volumes])

@api_bp.route('/volumes/<int:id>', methods=['GET'])
def get_volume(id):
    volume = Volume.query.get(id)
    if not volume:
        return jsonify({'error': 'Volume not found'}), 404
    return jsonify(volume.to_dict())

@api_bp.route('/volumes/<int:id>', methods=['PUT'])
def update_volume(id):
    volume = Volume.query.get(id)
    if not volume:
        return jsonify({'error': 'Volume not found'}), 404

    data = request.json
    volume.title = data.get('title', volume.title)
    volume.content = data.get('content', volume.content)
    volume.core_conflict = data.get('core_conflict', volume.core_conflict)
    volume.character_development = data.get('character_development', volume.character_development)

    key_events = data.get('key_events', volume.key_events)
    if isinstance(key_events, list):
        key_events = json.dumps(key_events, ensure_ascii=False)
    volume.key_events = key_events

    volume.chapter_count = data.get('chapter_count', volume.chapter_count)
    volume.order_index = data.get('order_index', volume.order_index)

    db.session.commit()
    return jsonify(volume.to_dict())

@api_bp.route('/volumes/<int:id>', methods=['DELETE'])
def delete_volume(id):
    volume = Volume.query.get(id)
    if not volume:
        return jsonify({'error': 'Volume not found'}), 404

    db.session.delete(volume)
    db.session.commit()
    return jsonify({'message': 'Volume deleted successfully'})

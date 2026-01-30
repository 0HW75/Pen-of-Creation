from flask import jsonify, request
from app import db
from app.models import Character, Project
from app.api import api_bp

@api_bp.route('/characters', methods=['GET'])
def get_characters():
    project_id = request.args.get('project_id')
    if project_id:
        characters = Character.query.filter_by(project_id=project_id).all()
    else:
        characters = Character.query.all()
    return jsonify([character.to_dict() for character in characters])

@api_bp.route('/characters/<int:character_id>', methods=['GET'])
def get_character(character_id):
    character = Character.query.get_or_404(character_id)
    return jsonify(character.to_dict())

@api_bp.route('/characters', methods=['POST'])
def create_character():
    data = request.get_json()
    project = Project.query.get_or_404(data['project_id'])
    new_character = Character(
        name=data['name'],
        basic_info=data.get('basic_info', ''),
        appearance=data.get('appearance', ''),
        personality=data.get('personality', ''),
        background=data.get('background', ''),
        character_arc=data.get('character_arc', ''),
        motivation=data.get('motivation', ''),
        secrets=data.get('secrets', ''),
        project_id=data['project_id']
    )
    db.session.add(new_character)
    db.session.commit()
    return jsonify(new_character.to_dict()), 201

@api_bp.route('/characters/<int:character_id>', methods=['PUT'])
def update_character(character_id):
    character = Character.query.get_or_404(character_id)
    data = request.get_json()
    character.name = data.get('name', character.name)
    character.basic_info = data.get('basic_info', character.basic_info)
    character.appearance = data.get('appearance', character.appearance)
    character.personality = data.get('personality', character.personality)
    character.background = data.get('background', character.background)
    character.character_arc = data.get('character_arc', character.character_arc)
    character.motivation = data.get('motivation', character.motivation)
    character.secrets = data.get('secrets', character.secrets)
    db.session.commit()
    return jsonify(character.to_dict())

@api_bp.route('/characters/<int:character_id>', methods=['DELETE'])
def delete_character(character_id):
    character = Character.query.get_or_404(character_id)
    db.session.delete(character)
    db.session.commit()
    return jsonify({'message': 'Character deleted successfully'}), 200
from flask import jsonify, request
from app import db
from app.models import Faction, Project
from app.api import api_bp

@api_bp.route('/factions', methods=['GET'])
def get_factions():
    project_id = request.args.get('project_id')
    if project_id:
        factions = Faction.query.filter_by(project_id=project_id).all()
    else:
        factions = Faction.query.all()
    return jsonify([faction.to_dict() for faction in factions])

@api_bp.route('/factions/<int:faction_id>', methods=['GET'])
def get_faction(faction_id):
    faction = Faction.query.get_or_404(faction_id)
    return jsonify(faction.to_dict())

@api_bp.route('/factions', methods=['POST'])
def create_faction():
    data = request.get_json()
    project = Project.query.get_or_404(data['project_id'])
    new_faction = Faction(
        name=data['name'],
        description=data.get('description', ''),
        type=data.get('type', '普通'),
        importance=data.get('importance', 0),
        project_id=data['project_id']
    )
    db.session.add(new_faction)
    db.session.commit()
    return jsonify(new_faction.to_dict()), 201

@api_bp.route('/factions/<int:faction_id>', methods=['PUT'])
def update_faction(faction_id):
    faction = Faction.query.get_or_404(faction_id)
    data = request.get_json()
    faction.name = data.get('name', faction.name)
    faction.description = data.get('description', faction.description)
    faction.type = data.get('type', faction.type)
    faction.importance = data.get('importance', faction.importance)
    db.session.commit()
    return jsonify(faction.to_dict())

@api_bp.route('/factions/<int:faction_id>', methods=['DELETE'])
def delete_faction(faction_id):
    faction = Faction.query.get_or_404(faction_id)
    db.session.delete(faction)
    db.session.commit()
    return jsonify({'message': 'Faction deleted successfully'}), 200
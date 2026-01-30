from flask import jsonify, request
from app import db
from app.models import Location, Project
from app.api import api_bp

@api_bp.route('/locations', methods=['GET'])
def get_locations():
    project_id = request.args.get('project_id')
    if project_id:
        locations = Location.query.filter_by(project_id=project_id).all()
    else:
        locations = Location.query.all()
    return jsonify([location.to_dict() for location in locations])

@api_bp.route('/locations/<int:location_id>', methods=['GET'])
def get_location(location_id):
    location = Location.query.get_or_404(location_id)
    return jsonify(location.to_dict())

@api_bp.route('/locations', methods=['POST'])
def create_location():
    data = request.get_json()
    project = Project.query.get_or_404(data['project_id'])
    new_location = Location(
        name=data['name'],
        description=data.get('description', ''),
        type=data.get('type', '普通'),
        importance=data.get('importance', 0),
        project_id=data['project_id']
    )
    db.session.add(new_location)
    db.session.commit()
    return jsonify(new_location.to_dict()), 201

@api_bp.route('/locations/<int:location_id>', methods=['PUT'])
def update_location(location_id):
    location = Location.query.get_or_404(location_id)
    data = request.get_json()
    location.name = data.get('name', location.name)
    location.description = data.get('description', location.description)
    location.type = data.get('type', location.type)
    location.importance = data.get('importance', location.importance)
    db.session.commit()
    return jsonify(location.to_dict())

@api_bp.route('/locations/<int:location_id>', methods=['DELETE'])
def delete_location(location_id):
    location = Location.query.get_or_404(location_id)
    db.session.delete(location)
    db.session.commit()
    return jsonify({'message': 'Location deleted successfully'}), 200
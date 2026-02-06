from flask import jsonify, request
from app import db
from app.models import Relationship, Project
from app.api import api_bp

@api_bp.route('/relationships', methods=['GET'])
def get_relationships():
    project_id = request.args.get('project_id')
    if project_id:
        relationships = Relationship.query.filter_by(project_id=project_id).all()
    else:
        relationships = Relationship.query.all()
    return jsonify([relationship.to_dict() for relationship in relationships])

@api_bp.route('/relationships/<int:relationship_id>', methods=['GET'])
def get_relationship(relationship_id):
    relationship = Relationship.query.get_or_404(relationship_id)
    return jsonify(relationship.to_dict())

@api_bp.route('/relationships', methods=['POST'])
def create_relationship():
    data = request.get_json()
    project = Project.query.get_or_404(data['project_id'])
    new_relationship = Relationship(
        name=data['name'],
        project_id=data['project_id'],
        source_type=data['source_type'],
        source_id=data['source_id'],
        target_type=data['target_type'],
        target_id=data['target_id'],
        relationship_type=data['relationship_type'],
        strength=data.get('strength', 5),
        description=data.get('description', '')
    )
    db.session.add(new_relationship)
    db.session.commit()
    return jsonify(new_relationship.to_dict()), 201

@api_bp.route('/relationships/<int:relationship_id>', methods=['PUT'])
def update_relationship(relationship_id):
    relationship = Relationship.query.get_or_404(relationship_id)
    data = request.get_json()
    relationship.name = data.get('name', relationship.name)
    relationship.source_type = data.get('source_type', relationship.source_type)
    relationship.source_id = data.get('source_id', relationship.source_id)
    relationship.target_type = data.get('target_type', relationship.target_type)
    relationship.target_id = data.get('target_id', relationship.target_id)
    relationship.relationship_type = data.get('relationship_type', relationship.relationship_type)
    relationship.strength = data.get('strength', relationship.strength)
    relationship.description = data.get('description', relationship.description)
    db.session.commit()
    return jsonify(relationship.to_dict())

@api_bp.route('/relationships/<int:relationship_id>', methods=['DELETE'])
def delete_relationship(relationship_id):
    relationship = Relationship.query.get_or_404(relationship_id)
    db.session.delete(relationship)
    db.session.commit()
    return jsonify({'message': 'Relationship deleted successfully'}), 200
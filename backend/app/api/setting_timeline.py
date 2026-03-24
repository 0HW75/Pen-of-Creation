from flask import jsonify, request
from app import db
from app.models import Timeline, DataAssociation, Project
from app.api import api_bp

@api_bp.route('/settings/timelines', methods=['GET'])
def get_timelines():
    project_id = request.args.get('project_id')
    if project_id:
        timelines = Timeline.query.filter_by(project_id=project_id).all()
    else:
        timelines = Timeline.query.all()
    return jsonify([timeline.to_dict() for timeline in timelines])

@api_bp.route('/settings/timelines/<int:timeline_id>', methods=['GET'])
def get_timeline(timeline_id):
    timeline = Timeline.query.get_or_404(timeline_id)
    return jsonify(timeline.to_dict())

@api_bp.route('/settings/timelines', methods=['POST'])
def create_timeline():
    data = request.get_json()
    project = Project.query.get_or_404(data['project_id'])
    new_timeline = Timeline(
        project_id=data['project_id'],
        name=data['name'],
        description=data.get('description', ''),
        timeline_type=data.get('timeline_type', '个人时间线'),
        related_id=data.get('related_id', 0),
        birth_growth=data.get('birth_growth', ''),
        key_events=data.get('key_events', ''),
        development_changes=data.get('development_changes', ''),
        important_turning_points=data.get('important_turning_points', ''),
        ending_destination=data.get('ending_destination', ''),
        establishment_development=data.get('establishment_development', ''),
        rise_fall_changes=data.get('rise_fall_changes', ''),
        major_events=data.get('major_events', ''),
        power_changes=data.get('power_changes', ''),
        ending_transformation=data.get('ending_transformation', ''),
        world_creation=data.get('world_creation', ''),
        civilization_development=data.get('civilization_development', ''),
        major_changes=data.get('major_changes', ''),
        current_era=data.get('current_era', ''),
        future_possibilities=data.get('future_possibilities', '')
    )
    db.session.add(new_timeline)
    db.session.commit()
    return jsonify(new_timeline.to_dict()), 201

@api_bp.route('/settings/timelines/<int:timeline_id>', methods=['PUT'])
def update_timeline(timeline_id):
    timeline = Timeline.query.get_or_404(timeline_id)
    data = request.get_json()
    timeline.name = data.get('name', timeline.name)
    timeline.description = data.get('description', timeline.description)
    timeline.timeline_type = data.get('timeline_type', timeline.timeline_type)
    timeline.related_id = data.get('related_id', timeline.related_id)
    timeline.birth_growth = data.get('birth_growth', timeline.birth_growth)
    timeline.key_events = data.get('key_events', timeline.key_events)
    timeline.development_changes = data.get('development_changes', timeline.development_changes)
    timeline.important_turning_points = data.get('important_turning_points', timeline.important_turning_points)
    timeline.ending_destination = data.get('ending_destination', timeline.ending_destination)
    timeline.establishment_development = data.get('establishment_development', timeline.establishment_development)
    timeline.rise_fall_changes = data.get('rise_fall_changes', timeline.rise_fall_changes)
    timeline.major_events = data.get('major_events', timeline.major_events)
    timeline.power_changes = data.get('power_changes', timeline.power_changes)
    timeline.ending_transformation = data.get('ending_transformation', timeline.ending_transformation)
    timeline.world_creation = data.get('world_creation', timeline.world_creation)
    timeline.civilization_development = data.get('civilization_development', timeline.civilization_development)
    timeline.major_changes = data.get('major_changes', timeline.major_changes)
    timeline.current_era = data.get('current_era', timeline.current_era)
    timeline.future_possibilities = data.get('future_possibilities', timeline.future_possibilities)
    db.session.commit()
    return jsonify(timeline.to_dict())

@api_bp.route('/settings/timelines/<int:timeline_id>', methods=['DELETE'])
def delete_timeline(timeline_id):
    timeline = Timeline.query.get_or_404(timeline_id)
    db.session.delete(timeline)
    db.session.commit()
    return jsonify({'message': 'Timeline deleted successfully'}), 200

@api_bp.route('/settings/associations', methods=['GET'])
def get_associations():
    project_id = request.args.get('project_id')
    if project_id:
        associations = DataAssociation.query.filter_by(project_id=project_id).all()
    else:
        associations = DataAssociation.query.all()
    return jsonify([association.to_dict() for association in associations])

@api_bp.route('/settings/associations/<int:association_id>', methods=['GET'])
def get_association(association_id):
    association = DataAssociation.query.get_or_404(association_id)
    return jsonify(association.to_dict())

@api_bp.route('/settings/associations', methods=['POST'])
def create_association():
    data = request.get_json()
    project = Project.query.get_or_404(data['project_id'])
    new_association = DataAssociation(
        project_id=data['project_id'],
        association_type=data.get('association_type', '人物关联'),
        source_type=data.get('source_type', ''),
        source_id=data.get('source_id', 0),
        target_type=data.get('target_type', ''),
        target_id=data.get('target_id', 0),
        association_details=data.get('association_details', '')
    )
    db.session.add(new_association)
    db.session.commit()
    return jsonify(new_association.to_dict()), 201

@api_bp.route('/settings/associations/<int:association_id>', methods=['PUT'])
def update_association(association_id):
    association = DataAssociation.query.get_or_404(association_id)
    data = request.get_json()
    association.association_type = data.get('association_type', association.association_type)
    association.source_type = data.get('source_type', association.source_type)
    association.source_id = data.get('source_id', association.source_id)
    association.target_type = data.get('target_type', association.target_type)
    association.target_id = data.get('target_id', association.target_id)
    association.association_details = data.get('association_details', association.association_details)
    db.session.commit()
    return jsonify(association.to_dict())

@api_bp.route('/settings/associations/<int:association_id>', methods=['DELETE'])
def delete_association(association_id):
    association = DataAssociation.query.get_or_404(association_id)
    db.session.delete(association)
    db.session.commit()
    return jsonify({'message': 'Association deleted successfully'}), 200
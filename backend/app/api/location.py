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
    project_id = data.get('project_id')
    world_id = data.get('world_id')
    if project_id:
        project = Project.query.get_or_404(project_id)
    new_location = Location(
        name=data['name'],
        project_id=project_id,
        world_id=world_id,
        location_type=data.get('location_type', '城市'),
        region=data.get('region', ''),
        geographical_location=data.get('geographical_location', ''),
        terrain=data.get('terrain', ''),
        climate=data.get('climate', ''),
        special_environment=data.get('special_environment', ''),
        controlling_faction=data.get('controlling_faction', ''),
        population_composition=data.get('population_composition', ''),
        economic_status=data.get('economic_status', ''),
        cultural_features=data.get('cultural_features', ''),
        overall_layout=data.get('overall_layout', ''),
        functional_areas=data.get('functional_areas', ''),
        key_buildings=data.get('key_buildings', ''),
        secret_areas=data.get('secret_areas', ''),
        defense_facilities=data.get('defense_facilities', ''),
        guard_force=data.get('guard_force', ''),
        defense_weaknesses=data.get('defense_weaknesses', ''),
        emergency_plans=data.get('emergency_plans', ''),
        main_resources=data.get('main_resources', ''),
        potential_dangers=data.get('potential_dangers', ''),
        access_restrictions=data.get('access_restrictions', ''),
        survival_conditions=data.get('survival_conditions', ''),
        importance=data.get('importance', 0)
    )
    db.session.add(new_location)
    db.session.commit()
    return jsonify(new_location.to_dict()), 201

@api_bp.route('/locations/<int:location_id>', methods=['PUT'])
def update_location(location_id):
    location = Location.query.get_or_404(location_id)
    data = request.get_json()
    location.name = data.get('name', location.name)
    location.location_type = data.get('location_type', location.location_type)
    location.region = data.get('region', location.region)
    location.geographical_location = data.get('geographical_location', location.geographical_location)
    location.terrain = data.get('terrain', location.terrain)
    location.climate = data.get('climate', location.climate)
    location.special_environment = data.get('special_environment', location.special_environment)
    location.controlling_faction = data.get('controlling_faction', location.controlling_faction)
    location.population_composition = data.get('population_composition', location.population_composition)
    location.economic_status = data.get('economic_status', location.economic_status)
    location.cultural_features = data.get('cultural_features', location.cultural_features)
    location.overall_layout = data.get('overall_layout', location.overall_layout)
    location.functional_areas = data.get('functional_areas', location.functional_areas)
    location.key_buildings = data.get('key_buildings', location.key_buildings)
    location.secret_areas = data.get('secret_areas', location.secret_areas)
    location.defense_facilities = data.get('defense_facilities', location.defense_facilities)
    location.guard_force = data.get('guard_force', location.guard_force)
    location.defense_weaknesses = data.get('defense_weaknesses', location.defense_weaknesses)
    location.emergency_plans = data.get('emergency_plans', location.emergency_plans)
    location.main_resources = data.get('main_resources', location.main_resources)
    location.potential_dangers = data.get('potential_dangers', location.potential_dangers)
    location.access_restrictions = data.get('access_restrictions', location.access_restrictions)
    location.survival_conditions = data.get('survival_conditions', location.survival_conditions)
    location.importance = data.get('importance', location.importance)
    db.session.commit()
    return jsonify(location.to_dict())

@api_bp.route('/locations/<int:location_id>', methods=['DELETE'])
def delete_location(location_id):
    location = Location.query.get_or_404(location_id)
    db.session.delete(location)
    db.session.commit()
    return jsonify({'message': 'Location deleted successfully'}), 200
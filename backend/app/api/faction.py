from flask import jsonify, request
from app import db
from app.models import Faction, Project
from app.api import api_bp

@api_bp.route('/factions', methods=['GET'])
def get_factions():
    project_id = request.args.get('project_id')
    world_id = request.args.get('world_id')
    query = Faction.query
    if project_id:
        query = query.filter_by(project_id=project_id)
    if world_id:
        query = query.filter_by(world_id=world_id)
    factions = query.all()
    return jsonify([faction.to_dict() for faction in factions])

@api_bp.route('/factions/<int:faction_id>', methods=['GET'])
def get_faction(faction_id):
    faction = Faction.query.get_or_404(faction_id)
    return jsonify(faction.to_dict())

@api_bp.route('/factions', methods=['POST'])
def create_faction():
    data = request.get_json()
    project_id = data.get('project_id')
    world_id = data.get('world_id')
    if project_id:
        project = Project.query.get_or_404(project_id)
    new_faction = Faction(
        name=data['name'],
        project_id=project_id,
        world_id=world_id,
        faction_type=data.get('faction_type', '国家'),
        faction_status=data.get('faction_status', '活跃'),
        logo=data.get('logo', ''),
        core_ideology=data.get('core_ideology', ''),
        sphere_of_influence=data.get('sphere_of_influence', ''),
        influence_level=data.get('influence_level', '区域'),
        establishment_time=data.get('establishment_time', ''),
        member_size=data.get('member_size', 0),
        headquarters_location=data.get('headquarters_location', ''),
        economic_strength=data.get('economic_strength', ''),
        leadership_system=data.get('leadership_system', ''),
        hierarchy=data.get('hierarchy', ''),
        department_setup=data.get('department_setup', ''),
        decision_mechanism=data.get('decision_mechanism', ''),
        leader=data.get('leader', ''),
        key_members=data.get('key_members', ''),
        talent_reserve=data.get('talent_reserve', ''),
        defectors=data.get('defectors', ''),
        recruitment_method=data.get('recruitment_method', ''),
        training_system=data.get('training_system', ''),
        disciplinary_rules=data.get('disciplinary_rules', ''),
        promotion_path=data.get('promotion_path', ''),
        special_abilities=data.get('special_abilities', ''),
        heritage_system=data.get('heritage_system', ''),
        resource_reserves=data.get('resource_reserves', ''),
        intelligence_network=data.get('intelligence_network', ''),
        short_term_goals=data.get('short_term_goals', ''),
        medium_term_plans=data.get('medium_term_plans', ''),
        long_term_vision=data.get('long_term_vision', ''),
        secret_plans=data.get('secret_plans', ''),
        ally_relationships=data.get('ally_relationships', ''),
        enemy_relationships=data.get('enemy_relationships', ''),
        subordinate_relationships=data.get('subordinate_relationships', ''),
        neutral_relationships=data.get('neutral_relationships', ''),
        importance=data.get('importance', 0)
    )
    db.session.add(new_faction)
    db.session.commit()
    return jsonify(new_faction.to_dict()), 201

@api_bp.route('/factions/<int:faction_id>', methods=['PUT'])
def update_faction(faction_id):
    faction = Faction.query.get_or_404(faction_id)
    data = request.get_json()
    faction.name = data.get('name', faction.name)
    faction.faction_type = data.get('faction_type', faction.faction_type)
    faction.faction_status = data.get('faction_status', faction.faction_status)
    faction.logo = data.get('logo', faction.logo)
    faction.core_ideology = data.get('core_ideology', faction.core_ideology)
    faction.sphere_of_influence = data.get('sphere_of_influence', faction.sphere_of_influence)
    faction.influence_level = data.get('influence_level', faction.influence_level)
    faction.establishment_time = data.get('establishment_time', faction.establishment_time)
    faction.member_size = data.get('member_size', faction.member_size)
    faction.headquarters_location = data.get('headquarters_location', faction.headquarters_location)
    faction.economic_strength = data.get('economic_strength', faction.economic_strength)
    faction.leadership_system = data.get('leadership_system', faction.leadership_system)
    faction.hierarchy = data.get('hierarchy', faction.hierarchy)
    faction.department_setup = data.get('department_setup', faction.department_setup)
    faction.decision_mechanism = data.get('decision_mechanism', faction.decision_mechanism)
    faction.leader = data.get('leader', faction.leader)
    faction.key_members = data.get('key_members', faction.key_members)
    faction.talent_reserve = data.get('talent_reserve', faction.talent_reserve)
    faction.defectors = data.get('defectors', faction.defectors)
    faction.recruitment_method = data.get('recruitment_method', faction.recruitment_method)
    faction.training_system = data.get('training_system', faction.training_system)
    faction.disciplinary_rules = data.get('disciplinary_rules', faction.disciplinary_rules)
    faction.promotion_path = data.get('promotion_path', faction.promotion_path)
    faction.special_abilities = data.get('special_abilities', faction.special_abilities)
    faction.heritage_system = data.get('heritage_system', faction.heritage_system)
    faction.resource_reserves = data.get('resource_reserves', faction.resource_reserves)
    faction.intelligence_network = data.get('intelligence_network', faction.intelligence_network)
    faction.short_term_goals = data.get('short_term_goals', faction.short_term_goals)
    faction.medium_term_plans = data.get('medium_term_plans', faction.medium_term_plans)
    faction.long_term_vision = data.get('long_term_vision', faction.long_term_vision)
    faction.secret_plans = data.get('secret_plans', faction.secret_plans)
    faction.ally_relationships = data.get('ally_relationships', faction.ally_relationships)
    faction.enemy_relationships = data.get('enemy_relationships', faction.enemy_relationships)
    faction.subordinate_relationships = data.get('subordinate_relationships', faction.subordinate_relationships)
    faction.neutral_relationships = data.get('neutral_relationships', faction.neutral_relationships)
    faction.importance = data.get('importance', faction.importance)
    db.session.commit()
    return jsonify(faction.to_dict())

@api_bp.route('/factions/<int:faction_id>', methods=['DELETE'])
def delete_faction(faction_id):
    faction = Faction.query.get_or_404(faction_id)
    db.session.delete(faction)
    db.session.commit()
    return jsonify({'message': 'Faction deleted successfully'}), 200
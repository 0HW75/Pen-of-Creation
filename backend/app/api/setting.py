from flask import jsonify, request
from app import db
from app.models import (
    WorldSetting, EnergySystem, SocietyCulture, History,
    Ability, Skill, Talent, Race, Creature, SpecialCreature,
    Timeline, DataAssociation, Project, CharacterTrait,
    CharacterAbility, CharacterRelationship, FactionStructure,
    FactionGoal, LocationStructure, SpecialLocation,
    EquipmentSystem, SpecialItem
)
from app.api import api_bp

# WorldSetting APIs
@api_bp.route('/settings/world', methods=['GET'])
def get_world_settings():
    try:
        project_id = request.args.get('project_id')
        print(f'获取世界设定，project_id: {project_id}')
        if project_id:
            settings = WorldSetting.query.filter_by(project_id=project_id).all()
        else:
            settings = WorldSetting.query.all()
        print(f'获取到世界设定数量: {len(settings)}')
        return jsonify([setting.to_dict() for setting in settings])
    except Exception as e:
        print(f'获取世界设定失败: {str(e)}')
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@api_bp.route('/settings/world/<int:setting_id>', methods=['GET'])
def get_world_setting(setting_id):
    setting = WorldSetting.query.get_or_404(setting_id)
    return jsonify(setting.to_dict())

@api_bp.route('/settings/world', methods=['POST'])
def create_world_setting():
    try:
        print('接收到创建世界设定的请求...')
        data = request.get_json()
        print(f'接收到的数据: {data}')
        project = Project.query.get_or_404(data['project_id'])
        print(f'找到项目: {project.title}')
        new_setting = WorldSetting(
            project_id=data['project_id'],
            name=data['name'],
            description=data.get('description', ''),
            world_type=data.get('world_type', '单一世界'),
            creation_origin=data.get('creation_origin', ''),
            world_essence=data.get('world_essence', ''),
            spatial_hierarchy=data.get('spatial_hierarchy', ''),
            world_map=data.get('world_map', ''),
            main_regions=data.get('main_regions', ''),
            time_system=data.get('time_system', ''),
            spatial_properties=data.get('spatial_properties', ''),
            physical_laws=data.get('physical_laws', ''),
            special_rules=data.get('special_rules', '')
        )
        db.session.add(new_setting)
        db.session.commit()
        print(f'创建世界设定成功，ID: {new_setting.id}')
        return jsonify(new_setting.to_dict()), 201
    except Exception as e:
        print(f'创建世界设定失败: {str(e)}')
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@api_bp.route('/settings/world/<int:setting_id>', methods=['PUT'])
def update_world_setting(setting_id):
    setting = WorldSetting.query.get_or_404(setting_id)
    data = request.get_json()
    setting.name = data.get('name', setting.name)
    setting.description = data.get('description', setting.description)
    setting.world_type = data.get('world_type', setting.world_type)
    setting.creation_origin = data.get('creation_origin', setting.creation_origin)
    setting.world_essence = data.get('world_essence', setting.world_essence)
    setting.spatial_hierarchy = data.get('spatial_hierarchy', setting.spatial_hierarchy)
    setting.world_map = data.get('world_map', setting.world_map)
    setting.main_regions = data.get('main_regions', setting.main_regions)
    setting.time_system = data.get('time_system', setting.time_system)
    setting.spatial_properties = data.get('spatial_properties', setting.spatial_properties)
    setting.physical_laws = data.get('physical_laws', setting.physical_laws)
    setting.special_rules = data.get('special_rules', setting.special_rules)
    db.session.commit()
    return jsonify(setting.to_dict())

@api_bp.route('/settings/world/<int:setting_id>', methods=['DELETE'])
def delete_world_setting(setting_id):
    setting = WorldSetting.query.get_or_404(setting_id)
    db.session.delete(setting)
    db.session.commit()
    return jsonify({'message': 'World setting deleted successfully'}), 200

# EnergySystem APIs
@api_bp.route('/settings/energy', methods=['GET'])
def get_energy_systems():
    project_id = request.args.get('project_id')
    if project_id:
        systems = EnergySystem.query.filter_by(project_id=project_id).all()
    else:
        systems = EnergySystem.query.all()
    return jsonify([system.to_dict() for system in systems])

@api_bp.route('/settings/energy/<int:system_id>', methods=['GET'])
def get_energy_system(system_id):
    system = EnergySystem.query.get_or_404(system_id)
    return jsonify(system.to_dict())

@api_bp.route('/settings/energy', methods=['POST'])
def create_energy_system():
    data = request.get_json()
    project = Project.query.get_or_404(data['project_id'])
    new_system = EnergySystem(
        project_id=data['project_id'],
        energy_types=data.get('energy_types', ''),
        energy_sources=data.get('energy_sources', ''),
        energy_cycle=data.get('energy_cycle', ''),
        energy_levels=data.get('energy_levels', ''),
        ability_classification=data.get('ability_classification', ''),
        usage_principles=data.get('usage_principles', ''),
        ability_limits=data.get('ability_limits', ''),
        advancement_paths=data.get('advancement_paths', ''),
        basic_laws=data.get('basic_laws', ''),
        taboos_and_costs=data.get('taboos_and_costs', ''),
        law_conflicts=data.get('law_conflicts', ''),
        world_balance=data.get('world_balance', '')
    )
    db.session.add(new_system)
    db.session.commit()
    return jsonify(new_system.to_dict()), 201

@api_bp.route('/settings/energy/<int:system_id>', methods=['PUT'])
def update_energy_system(system_id):
    system = EnergySystem.query.get_or_404(system_id)
    data = request.get_json()
    system.energy_types = data.get('energy_types', system.energy_types)
    system.energy_sources = data.get('energy_sources', system.energy_sources)
    system.energy_cycle = data.get('energy_cycle', system.energy_cycle)
    system.energy_levels = data.get('energy_levels', system.energy_levels)
    system.ability_classification = data.get('ability_classification', system.ability_classification)
    system.usage_principles = data.get('usage_principles', system.usage_principles)
    system.ability_limits = data.get('ability_limits', system.ability_limits)
    system.advancement_paths = data.get('advancement_paths', system.advancement_paths)
    system.basic_laws = data.get('basic_laws', system.basic_laws)
    system.taboos_and_costs = data.get('taboos_and_costs', system.taboos_and_costs)
    system.law_conflicts = data.get('law_conflicts', system.law_conflicts)
    system.world_balance = data.get('world_balance', system.world_balance)
    db.session.commit()
    return jsonify(system.to_dict())

@api_bp.route('/settings/energy/<int:system_id>', methods=['DELETE'])
def delete_energy_system(system_id):
    system = EnergySystem.query.get_or_404(system_id)
    db.session.delete(system)
    db.session.commit()
    return jsonify({'message': 'Energy system deleted successfully'}), 200

# SocietyCulture APIs
@api_bp.route('/settings/society', methods=['GET'])
def get_society_cultures():
    project_id = request.args.get('project_id')
    if project_id:
        cultures = SocietyCulture.query.filter_by(project_id=project_id).all()
    else:
        cultures = SocietyCulture.query.all()
    return jsonify([culture.to_dict() for culture in cultures])

@api_bp.route('/settings/society/<int:culture_id>', methods=['GET'])
def get_society_culture(culture_id):
    culture = SocietyCulture.query.get_or_404(culture_id)
    return jsonify(culture.to_dict())

@api_bp.route('/settings/society', methods=['POST'])
def create_society_culture():
    data = request.get_json()
    project = Project.query.get_or_404(data['project_id'])
    new_culture = SocietyCulture(
        project_id=data['project_id'],
        political_system=data.get('political_system', ''),
        class_hierarchy=data.get('class_hierarchy', ''),
        power_institutions=data.get('power_institutions', ''),
        legal_system=data.get('legal_system', ''),
        currency_system=data.get('currency_system', ''),
        trade_network=data.get('trade_network', ''),
        resource_distribution=data.get('resource_distribution', ''),
        economic_model=data.get('economic_model', ''),
        language_writing=data.get('language_writing', ''),
        religion=data.get('religion', ''),
        customs=data.get('customs', ''),
        art_forms=data.get('art_forms', ''),
        etiquette=data.get('etiquette', '')
    )
    db.session.add(new_culture)
    db.session.commit()
    return jsonify(new_culture.to_dict()), 201

@api_bp.route('/settings/society/<int:culture_id>', methods=['PUT'])
def update_society_culture(culture_id):
    culture = SocietyCulture.query.get_or_404(culture_id)
    data = request.get_json()
    culture.political_system = data.get('political_system', culture.political_system)
    culture.class_hierarchy = data.get('class_hierarchy', culture.class_hierarchy)
    culture.power_institutions = data.get('power_institutions', culture.power_institutions)
    culture.legal_system = data.get('legal_system', culture.legal_system)
    culture.currency_system = data.get('currency_system', culture.currency_system)
    culture.trade_network = data.get('trade_network', culture.trade_network)
    culture.resource_distribution = data.get('resource_distribution', culture.resource_distribution)
    culture.economic_model = data.get('economic_model', culture.economic_model)
    culture.language_writing = data.get('language_writing', culture.language_writing)
    culture.religion = data.get('religion', culture.religion)
    culture.customs = data.get('customs', culture.customs)
    culture.art_forms = data.get('art_forms', culture.art_forms)
    culture.etiquette = data.get('etiquette', culture.etiquette)
    db.session.commit()
    return jsonify(culture.to_dict())

@api_bp.route('/settings/society/<int:culture_id>', methods=['DELETE'])
def delete_society_culture(culture_id):
    culture = SocietyCulture.query.get_or_404(culture_id)
    db.session.delete(culture)
    db.session.commit()
    return jsonify({'message': 'Society culture deleted successfully'}), 200

# History APIs
@api_bp.route('/settings/history', methods=['GET'])
def get_histories():
    project_id = request.args.get('project_id')
    if project_id:
        histories = History.query.filter_by(project_id=project_id).all()
    else:
        histories = History.query.all()
    return jsonify([history.to_dict() for history in histories])

@api_bp.route('/settings/history/<int:history_id>', methods=['GET'])
def get_history(history_id):
    history = History.query.get_or_404(history_id)
    return jsonify(history.to_dict())

@api_bp.route('/settings/history', methods=['POST'])
def create_history():
    data = request.get_json()
    project = Project.query.get_or_404(data['project_id'])
    new_history = History(
        project_id=data['project_id'],
        era_division=data.get('era_division', ''),
        historical_events=data.get('historical_events', ''),
        civilization_development=data.get('civilization_development', ''),
        historical_gaps=data.get('historical_gaps', ''),
        wars=data.get('wars', ''),
        disasters_reconstruction=data.get('disasters_reconstruction', ''),
        major_discoveries=data.get('major_discoveries', ''),
        treaties=data.get('treaties', ''),
        important_figures=data.get('important_figures', ''),
        historical_evaluations=data.get('historical_evaluations', ''),
        influence_heritage=data.get('influence_heritage', '')
    )
    db.session.add(new_history)
    db.session.commit()
    return jsonify(new_history.to_dict()), 201

@api_bp.route('/settings/history/<int:history_id>', methods=['PUT'])
def update_history(history_id):
    history = History.query.get_or_404(history_id)
    data = request.get_json()
    history.era_division = data.get('era_division', history.era_division)
    history.historical_events = data.get('historical_events', history.historical_events)
    history.civilization_development = data.get('civilization_development', history.civilization_development)
    history.historical_gaps = data.get('historical_gaps', history.historical_gaps)
    history.wars = data.get('wars', history.wars)
    history.disasters_reconstruction = data.get('disasters_reconstruction', history.disasters_reconstruction)
    history.major_discoveries = data.get('major_discoveries', history.major_discoveries)
    history.treaties = data.get('treaties', history.treaties)
    history.important_figures = data.get('important_figures', history.important_figures)
    history.historical_evaluations = data.get('historical_evaluations', history.historical_evaluations)
    history.influence_heritage = data.get('influence_heritage', history.influence_heritage)
    db.session.commit()
    return jsonify(history.to_dict())

@api_bp.route('/settings/history/<int:history_id>', methods=['DELETE'])
def delete_history(history_id):
    history = History.query.get_or_404(history_id)
    db.session.delete(history)
    db.session.commit()
    return jsonify({'message': 'History deleted successfully'}), 200

# Ability APIs
@api_bp.route('/settings/abilities', methods=['GET'])
def get_abilities():
    project_id = request.args.get('project_id')
    if project_id:
        abilities = Ability.query.filter_by(project_id=project_id).all()
    else:
        abilities = Ability.query.all()
    return jsonify([ability.to_dict() for ability in abilities])

@api_bp.route('/settings/abilities/<int:ability_id>', methods=['GET'])
def get_ability(ability_id):
    ability = Ability.query.get_or_404(ability_id)
    return jsonify(ability.to_dict())

@api_bp.route('/settings/abilities', methods=['POST'])
def create_ability():
    data = request.get_json()
    project = Project.query.get_or_404(data['project_id'])
    new_ability = Ability(
        project_id=data['project_id'],
        name=data['name'],
        description=data.get('description', ''),
        ability_type=data.get('ability_type', ''),
        level_system=data.get('level_system', ''),
        cultivation_methods=data.get('cultivation_methods', ''),
        resource_requirements=data.get('resource_requirements', ''),
        growth_limits=data.get('growth_limits', ''),
        bottleneck_breakthrough=data.get('bottleneck_breakthrough', ''),
        career_branches=data.get('career_branches', ''),
        specialization_directions=data.get('specialization_directions', ''),
        fusion_possibilities=data.get('fusion_possibilities', ''),
        ultimate_forms=data.get('ultimate_forms', '')
    )
    db.session.add(new_ability)
    db.session.commit()
    return jsonify(new_ability.to_dict()), 201

@api_bp.route('/settings/abilities/<int:ability_id>', methods=['PUT'])
def update_ability(ability_id):
    ability = Ability.query.get_or_404(ability_id)
    data = request.get_json()
    ability.name = data.get('name', ability.name)
    ability.description = data.get('description', ability.description)
    ability.ability_type = data.get('ability_type', ability.ability_type)
    ability.level_system = data.get('level_system', ability.level_system)
    ability.cultivation_methods = data.get('cultivation_methods', ability.cultivation_methods)
    ability.resource_requirements = data.get('resource_requirements', ability.resource_requirements)
    ability.growth_limits = data.get('growth_limits', ability.growth_limits)
    ability.bottleneck_breakthrough = data.get('bottleneck_breakthrough', ability.bottleneck_breakthrough)
    ability.career_branches = data.get('career_branches', ability.career_branches)
    ability.specialization_directions = data.get('specialization_directions', ability.specialization_directions)
    ability.fusion_possibilities = data.get('fusion_possibilities', ability.fusion_possibilities)
    ability.ultimate_forms = data.get('ultimate_forms', ability.ultimate_forms)
    db.session.commit()
    return jsonify(ability.to_dict())

@api_bp.route('/settings/abilities/<int:ability_id>', methods=['DELETE'])
def delete_ability(ability_id):
    ability = Ability.query.get_or_404(ability_id)
    db.session.delete(ability)
    db.session.commit()
    return jsonify({'message': 'Ability deleted successfully'}), 200

# Skill APIs
@api_bp.route('/settings/skills', methods=['GET'])
def get_skills():
    project_id = request.args.get('project_id')
    if project_id:
        skills = Skill.query.filter_by(project_id=project_id).all()
    else:
        skills = Skill.query.all()
    return jsonify([skill.to_dict() for skill in skills])

@api_bp.route('/settings/skills/<int:skill_id>', methods=['GET'])
def get_skill(skill_id):
    skill = Skill.query.get_or_404(skill_id)
    return jsonify(skill.to_dict())

@api_bp.route('/settings/skills', methods=['POST'])
def create_skill():
    data = request.get_json()
    project = Project.query.get_or_404(data['project_id'])
    new_skill = Skill(
        project_id=data['project_id'],
        name=data['name'],
        description=data.get('description', ''),
        skill_type=data.get('skill_type', ''),
        skill_level=data.get('skill_level', '初级'),
        casting_conditions=data.get('casting_conditions', ''),
        resource_consumption=data.get('resource_consumption', ''),
        cooldown_time=data.get('cooldown_time', ''),
        effect_range=data.get('effect_range', ''),
        duration=data.get('duration', ''),
        prerequisite_skills=data.get('prerequisite_skills', ''),
        advanced_skills=data.get('advanced_skills', ''),
        combination_skills=data.get('combination_skills', ''),
        counter_relationship=data.get('counter_relationship', ''),
        skill_tree=data.get('skill_tree', '')
    )
    db.session.add(new_skill)
    db.session.commit()
    return jsonify(new_skill.to_dict()), 201

@api_bp.route('/settings/skills/<int:skill_id>', methods=['PUT'])
def update_skill(skill_id):
    skill = Skill.query.get_or_404(skill_id)
    data = request.get_json()
    skill.name = data.get('name', skill.name)
    skill.description = data.get('description', skill.description)
    skill.skill_type = data.get('skill_type', skill.skill_type)
    skill.skill_level = data.get('skill_level', skill.skill_level)
    skill.casting_conditions = data.get('casting_conditions', skill.casting_conditions)
    skill.resource_consumption = data.get('resource_consumption', skill.resource_consumption)
    skill.cooldown_time = data.get('cooldown_time', skill.cooldown_time)
    skill.effect_range = data.get('effect_range', skill.effect_range)
    skill.duration = data.get('duration', skill.duration)
    skill.prerequisite_skills = data.get('prerequisite_skills', skill.prerequisite_skills)
    skill.advanced_skills = data.get('advanced_skills', skill.advanced_skills)
    skill.combination_skills = data.get('combination_skills', skill.combination_skills)
    skill.counter_relationship = data.get('counter_relationship', skill.counter_relationship)
    skill.skill_tree = data.get('skill_tree', skill.skill_tree)
    db.session.commit()
    return jsonify(skill.to_dict())

@api_bp.route('/settings/skills/<int:skill_id>', methods=['DELETE'])
def delete_skill(skill_id):
    skill = Skill.query.get_or_404(skill_id)
    db.session.delete(skill)
    db.session.commit()
    return jsonify({'message': 'Skill deleted successfully'}), 200

# Talent APIs
@api_bp.route('/settings/talents', methods=['GET'])
def get_talents():
    project_id = request.args.get('project_id')
    if project_id:
        talents = Talent.query.filter_by(project_id=project_id).all()
    else:
        talents = Talent.query.all()
    return jsonify([talent.to_dict() for talent in talents])

@api_bp.route('/settings/talents/<int:talent_id>', methods=['GET'])
def get_talent(talent_id):
    talent = Talent.query.get_or_404(talent_id)
    return jsonify(talent.to_dict())

@api_bp.route('/settings/talents', methods=['POST'])
def create_talent():
    data = request.get_json()
    project = Project.query.get_or_404(data['project_id'])
    new_talent = Talent(
        project_id=data['project_id'],
        name=data['name'],
        description=data.get('description', ''),
        talent_type=data.get('talent_type', '先天'),
        bloodline_talent=data.get('bloodline_talent', ''),
        special_physique=data.get('special_physique', ''),
        innate_abilities=data.get('innate_abilities', ''),
        genetic_characteristics=data.get('genetic_characteristics', ''),
        awakened_abilities=data.get('awakened_abilities', ''),
        modified_enhancements=data.get('modified_enhancements', ''),
        contract_abilities=data.get('contract_abilities', ''),
        learning_abilities=data.get('learning_abilities', ''),
        awakening_conditions=data.get('awakening_conditions', ''),
        development_methods=data.get('development_methods', ''),
        ability_limits=data.get('ability_limits', ''),
        evolution_possibilities=data.get('evolution_possibilities', ''),
        cost_risks=data.get('cost_risks', '')
    )
    db.session.add(new_talent)
    db.session.commit()
    return jsonify(new_talent.to_dict()), 201

@api_bp.route('/settings/talents/<int:talent_id>', methods=['PUT'])
def update_talent(talent_id):
    talent = Talent.query.get_or_404(talent_id)
    data = request.get_json()
    talent.name = data.get('name', talent.name)
    talent.description = data.get('description', talent.description)
    talent.talent_type = data.get('talent_type', talent.talent_type)
    talent.bloodline_talent = data.get('bloodline_talent', talent.bloodline_talent)
    talent.special_physique = data.get('special_physique', talent.special_physique)
    talent.innate_abilities = data.get('innate_abilities', talent.innate_abilities)
    talent.genetic_characteristics = data.get('genetic_characteristics', talent.genetic_characteristics)
    talent.awakened_abilities = data.get('awakened_abilities', talent.awakened_abilities)
    talent.modified_enhancements = data.get('modified_enhancements', talent.modified_enhancements)
    talent.contract_abilities = data.get('contract_abilities', talent.contract_abilities)
    talent.learning_abilities = data.get('learning_abilities', talent.learning_abilities)
    talent.awakening_conditions = data.get('awakening_conditions', talent.awakening_conditions)
    talent.development_methods = data.get('development_methods', talent.development_methods)
    talent.ability_limits = data.get('ability_limits', talent.ability_limits)
    talent.evolution_possibilities = data.get('evolution_possibilities', talent.evolution_possibilities)
    talent.cost_risks = data.get('cost_risks', talent.cost_risks)
    db.session.commit()
    return jsonify(talent.to_dict())

@api_bp.route('/settings/talents/<int:talent_id>', methods=['DELETE'])
def delete_talent(talent_id):
    talent = Talent.query.get_or_404(talent_id)
    db.session.delete(talent)
    db.session.commit()
    return jsonify({'message': 'Talent deleted successfully'}), 200

# Race APIs
@api_bp.route('/settings/races', methods=['GET'])
def get_races():
    project_id = request.args.get('project_id')
    if project_id:
        races = Race.query.filter_by(project_id=project_id).all()
    else:
        races = Race.query.all()
    return jsonify([race.to_dict() for race in races])

@api_bp.route('/settings/races/<int:race_id>', methods=['GET'])
def get_race(race_id):
    race = Race.query.get_or_404(race_id)
    return jsonify(race.to_dict())

@api_bp.route('/settings/races', methods=['POST'])
def create_race():
    data = request.get_json()
    project = Project.query.get_or_404(data['project_id'])
    new_race = Race(
        project_id=data['project_id'],
        name=data['name'],
        description=data.get('description', ''),
        origin_legend=data.get('origin_legend', ''),
        distribution_area=data.get('distribution_area', ''),
        social_form=data.get('social_form', ''),
        appearance_features=data.get('appearance_features', ''),
        physiological_characteristics=data.get('physiological_characteristics', ''),
        lifespan_cycle=data.get('lifespan_cycle', ''),
        special_abilities=data.get('special_abilities', ''),
        weaknesses_limits=data.get('weaknesses_limits', ''),
        subspecies=data.get('subspecies', ''),
        hybrids=data.get('hybrids', ''),
        mutants=data.get('mutants', ''),
        legendary_species=data.get('legendary_species', '')
    )
    db.session.add(new_race)
    db.session.commit()
    return jsonify(new_race.to_dict()), 201

@api_bp.route('/settings/races/<int:race_id>', methods=['PUT'])
def update_race(race_id):
    race = Race.query.get_or_404(race_id)
    data = request.get_json()
    race.name = data.get('name', race.name)
    race.description = data.get('description', race.description)
    race.origin_legend = data.get('origin_legend', race.origin_legend)
    race.distribution_area = data.get('distribution_area', race.distribution_area)
    race.social_form = data.get('social_form', race.social_form)
    race.appearance_features = data.get('appearance_features', race.appearance_features)
    race.physiological_characteristics = data.get('physiological_characteristics', race.physiological_characteristics)
    race.lifespan_cycle = data.get('lifespan_cycle', race.lifespan_cycle)
    race.special_abilities = data.get('special_abilities', race.special_abilities)
    race.weaknesses_limits = data.get('weaknesses_limits', race.weaknesses_limits)
    race.subspecies = data.get('subspecies', race.subspecies)
    race.hybrids = data.get('hybrids', race.hybrids)
    race.mutants = data.get('mutants', race.mutants)
    race.legendary_species = data.get('legendary_species', race.legendary_species)
    db.session.commit()
    return jsonify(race.to_dict())

@api_bp.route('/settings/races/<int:race_id>', methods=['DELETE'])
def delete_race(race_id):
    race = Race.query.get_or_404(race_id)
    db.session.delete(race)
    db.session.commit()
    return jsonify({'message': 'Race deleted successfully'}), 200

# Creature APIs
@api_bp.route('/settings/creatures', methods=['GET'])
def get_creatures():
    project_id = request.args.get('project_id')
    if project_id:
        creatures = Creature.query.filter_by(project_id=project_id).all()
    else:
        creatures = Creature.query.all()
    return jsonify([creature.to_dict() for creature in creatures])

@api_bp.route('/settings/creatures/<int:creature_id>', methods=['GET'])
def get_creature(creature_id):
    creature = Creature.query.get_or_404(creature_id)
    return jsonify(creature.to_dict())

@api_bp.route('/settings/creatures', methods=['POST'])
def create_creature():
    data = request.get_json()
    project = Project.query.get_or_404(data['project_id'])
    new_creature = Creature(
        project_id=data['project_id'],
        name=data['name'],
        description=data.get('description', ''),
        creature_type=data.get('creature_type', '野兽'),
        threat_level=data.get('threat_level', '低'),
        habitat=data.get('habitat', ''),
        behavior_habits=data.get('behavior_habits', ''),
        special_abilities=data.get('special_abilities', ''),
        weaknesses_predators=data.get('weaknesses_predators', ''),
        domestication_possibility=data.get('domestication_possibility', ''),
        contract_methods=data.get('contract_methods', ''),
        use_value=data.get('use_value', ''),
        material_sources=data.get('material_sources', ''),
        legendary_stories=data.get('legendary_stories', '')
    )
    db.session.add(new_creature)
    db.session.commit()
    return jsonify(new_creature.to_dict()), 201

@api_bp.route('/settings/creatures/<int:creature_id>', methods=['PUT'])
def update_creature(creature_id):
    creature = Creature.query.get_or_404(creature_id)
    data = request.get_json()
    creature.name = data.get('name', creature.name)
    creature.description = data.get('description', creature.description)
    creature.creature_type = data.get('creature_type', creature.creature_type)
    creature.threat_level = data.get('threat_level', creature.threat_level)
    creature.habitat = data.get('habitat', creature.habitat)
    creature.behavior_habits = data.get('behavior_habits', creature.behavior_habits)
    creature.special_abilities = data.get('special_abilities', creature.special_abilities)
    creature.weaknesses_predators = data.get('weaknesses_predators', creature.weaknesses_predators)
    creature.domestication_possibility = data.get('domestication_possibility', creature.domestication_possibility)
    creature.contract_methods = data.get('contract_methods', creature.contract_methods)
    creature.use_value = data.get('use_value', creature.use_value)
    creature.material_sources = data.get('material_sources', creature.material_sources)
    creature.legendary_stories = data.get('legendary_stories', creature.legendary_stories)
    db.session.commit()
    return jsonify(creature.to_dict())

@api_bp.route('/settings/creatures/<int:creature_id>', methods=['DELETE'])
def delete_creature(creature_id):
    creature = Creature.query.get_or_404(creature_id)
    db.session.delete(creature)
    db.session.commit()
    return jsonify({'message': 'Creature deleted successfully'}), 200

# SpecialCreature APIs
@api_bp.route('/settings/special-creatures', methods=['GET'])
def get_special_creatures():
    project_id = request.args.get('project_id')
    if project_id:
        creatures = SpecialCreature.query.filter_by(project_id=project_id).all()
    else:
        creatures = SpecialCreature.query.all()
    return jsonify([creature.to_dict() for creature in creatures])

@api_bp.route('/settings/special-creatures/<int:creature_id>', methods=['GET'])
def get_special_creature(creature_id):
    creature = SpecialCreature.query.get_or_404(creature_id)
    return jsonify(creature.to_dict())

@api_bp.route('/settings/special-creatures', methods=['POST'])
def create_special_creature():
    data = request.get_json()
    project = Project.query.get_or_404(data['project_id'])
    new_creature = SpecialCreature(
        project_id=data['project_id'],
        name=data['name'],
        description=data.get('description', ''),
        creature_type=data.get('creature_type', '异界生物'),
        spatial_properties=data.get('spatial_properties', ''),
        entry_conditions=data.get('entry_conditions', ''),
        internal_laws=data.get('internal_laws', ''),
        existence_limits=data.get('existence_limits', ''),
        summoning_type=data.get('summoning_type', ''),
        summoning_contract=data.get('summoning_contract', ''),
        ability_characteristics=data.get('ability_characteristics', ''),
        control_difficulty=data.get('control_difficulty', '低'),
        concept_type=data.get('concept_type', '精神空间')
    )
    db.session.add(new_creature)
    db.session.commit()
    return jsonify(new_creature.to_dict()), 201

@api_bp.route('/settings/special-creatures/<int:creature_id>', methods=['PUT'])
def update_special_creature(creature_id):
    creature = SpecialCreature.query.get_or_404(creature_id)
    data = request.get_json()
    creature.name = data.get('name', creature.name)
    creature.description = data.get('description', creature.description)
    creature.creature_type = data.get('creature_type', creature.creature_type)
    creature.spatial_properties = data.get('spatial_properties', creature.spatial_properties)
    creature.entry_conditions = data.get('entry_conditions', creature.entry_conditions)
    creature.internal_laws = data.get('internal_laws', creature.internal_laws)
    creature.existence_limits = data.get('existence_limits', creature.existence_limits)
    creature.summoning_type = data.get('summoning_type', creature.summoning_type)
    creature.summoning_contract = data.get('summoning_contract', creature.summoning_contract)
    creature.ability_characteristics = data.get('ability_characteristics', creature.ability_characteristics)
    creature.control_difficulty = data.get('control_difficulty', creature.control_difficulty)
    creature.concept_type = data.get('concept_type', creature.concept_type)
    db.session.commit()
    return jsonify(creature.to_dict())

@api_bp.route('/settings/special-creatures/<int:creature_id>', methods=['DELETE'])
def delete_special_creature(creature_id):
    creature = SpecialCreature.query.get_or_404(creature_id)
    db.session.delete(creature)
    db.session.commit()
    return jsonify({'message': 'Special creature deleted successfully'}), 200

# Timeline APIs
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

# DataAssociation APIs
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

# CharacterTrait APIs
@api_bp.route('/settings/character-trait', methods=['GET'])
def get_character_traits():
    project_id = request.args.get('project_id')
    if project_id:
        traits = CharacterTrait.query.filter_by(project_id=project_id).all()
    else:
        traits = CharacterTrait.query.all()
    return jsonify([trait.to_dict() for trait in traits])

@api_bp.route('/settings/character-trait/<int:trait_id>', methods=['GET'])
def get_character_trait(trait_id):
    trait = CharacterTrait.query.get_or_404(trait_id)
    return jsonify(trait.to_dict())

@api_bp.route('/settings/character-trait', methods=['POST'])
def create_character_trait():
    print('接收到POST请求')
    data = request.get_json()
    print('接收到的数据:', data)
    if not data:
        print('没有接收到数据')
        return jsonify({'error': 'No data received'}), 400
    if 'project_id' not in data:
        print('缺少project_id')
        return jsonify({'error': 'Missing project_id'}), 400
    if 'name' not in data:
        print('缺少name')
        return jsonify({'error': 'Missing name'}), 400
    try:
        project = Project.query.get_or_404(data['project_id'])
        print(f'找到项目: {project.title}')
        new_trait = CharacterTrait(
            project_id=data['project_id'],
            name=data['name'],
            description=data.get('description', '')
        )
        db.session.add(new_trait)
        db.session.commit()
        print(f'创建成功，ID: {new_trait.id}')
        return jsonify(new_trait.to_dict()), 201
    except Exception as e:
        print(f'创建失败: {str(e)}')
        return jsonify({'error': str(e)}), 500

@api_bp.route('/settings/character-trait/<int:trait_id>', methods=['PUT'])
def update_character_trait(trait_id):
    trait = CharacterTrait.query.get_or_404(trait_id)
    data = request.get_json()
    trait.name = data.get('name', trait.name)
    trait.description = data.get('description', trait.description)
    db.session.commit()
    return jsonify(trait.to_dict())

@api_bp.route('/settings/character-trait/<int:trait_id>', methods=['DELETE'])
def delete_character_trait(trait_id):
    trait = CharacterTrait.query.get_or_404(trait_id)
    db.session.delete(trait)
    db.session.commit()
    return jsonify({'message': 'Character trait deleted successfully'}), 200

# CharacterAbility APIs
@api_bp.route('/settings/character-ability', methods=['GET'])
def get_character_abilities():
    project_id = request.args.get('project_id')
    if project_id:
        abilities = CharacterAbility.query.filter_by(project_id=project_id).all()
    else:
        abilities = CharacterAbility.query.all()
    return jsonify([ability.to_dict() for ability in abilities])

@api_bp.route('/settings/character-ability/<int:ability_id>', methods=['GET'])
def get_character_ability(ability_id):
    ability = CharacterAbility.query.get_or_404(ability_id)
    return jsonify(ability.to_dict())

@api_bp.route('/settings/character-ability', methods=['POST'])
def create_character_ability():
    print('接收到POST请求')
    data = request.get_json()
    print('接收到的数据:', data)
    if not data:
        print('没有接收到数据')
        return jsonify({'error': 'No data received'}), 400
    if 'project_id' not in data:
        print('缺少project_id')
        return jsonify({'error': 'Missing project_id'}), 400
    if 'name' not in data:
        print('缺少name')
        return jsonify({'error': 'Missing name'}), 400
    try:
        project = Project.query.get_or_404(data['project_id'])
        print(f'找到项目: {project.title}')
        new_ability = CharacterAbility(
            project_id=data['project_id'],
            name=data['name'],
            description=data.get('description', '')
        )
        db.session.add(new_ability)
        db.session.commit()
        print(f'创建成功，ID: {new_ability.id}')
        return jsonify(new_ability.to_dict()), 201
    except Exception as e:
        print(f'创建失败: {str(e)}')
        return jsonify({'error': str(e)}), 500

@api_bp.route('/settings/character-ability/<int:ability_id>', methods=['PUT'])
def update_character_ability(ability_id):
    ability = CharacterAbility.query.get_or_404(ability_id)
    data = request.get_json()
    ability.name = data.get('name', ability.name)
    ability.description = data.get('description', ability.description)
    db.session.commit()
    return jsonify(ability.to_dict())

@api_bp.route('/settings/character-ability/<int:ability_id>', methods=['DELETE'])
def delete_character_ability(ability_id):
    ability = CharacterAbility.query.get_or_404(ability_id)
    db.session.delete(ability)
    db.session.commit()
    return jsonify({'message': 'Character ability deleted successfully'}), 200

# CharacterRelationship APIs
@api_bp.route('/settings/character-relationship', methods=['GET'])
def get_character_relationships():
    project_id = request.args.get('project_id')
    if project_id:
        relationships = CharacterRelationship.query.filter_by(project_id=project_id).all()
    else:
        relationships = CharacterRelationship.query.all()
    return jsonify([relationship.to_dict() for relationship in relationships])

@api_bp.route('/settings/character-relationship/<int:relationship_id>', methods=['GET'])
def get_character_relationship(relationship_id):
    relationship = CharacterRelationship.query.get_or_404(relationship_id)
    return jsonify(relationship.to_dict())

@api_bp.route('/settings/character-relationship', methods=['POST'])
def create_character_relationship():
    print('接收到POST请求')
    data = request.get_json()
    print('接收到的数据:', data)
    if not data:
        print('没有接收到数据')
        return jsonify({'error': 'No data received'}), 400
    if 'project_id' not in data:
        print('缺少project_id')
        return jsonify({'error': 'Missing project_id'}), 400
    if 'name' not in data:
        print('缺少name')
        return jsonify({'error': 'Missing name'}), 400
    try:
        project = Project.query.get_or_404(data['project_id'])
        print(f'找到项目: {project.title}')
        new_relationship = CharacterRelationship(
            project_id=data['project_id'],
            name=data['name'],
            description=data.get('description', '')
        )
        db.session.add(new_relationship)
        db.session.commit()
        print(f'创建成功，ID: {new_relationship.id}')
        return jsonify(new_relationship.to_dict()), 201
    except Exception as e:
        print(f'创建失败: {str(e)}')
        return jsonify({'error': str(e)}), 500

@api_bp.route('/settings/character-relationship/<int:relationship_id>', methods=['PUT'])
def update_character_relationship(relationship_id):
    relationship = CharacterRelationship.query.get_or_404(relationship_id)
    data = request.get_json()
    relationship.name = data.get('name', relationship.name)
    relationship.description = data.get('description', relationship.description)
    db.session.commit()
    return jsonify(relationship.to_dict())

@api_bp.route('/settings/character-relationship/<int:relationship_id>', methods=['DELETE'])
def delete_character_relationship(relationship_id):
    relationship = CharacterRelationship.query.get_or_404(relationship_id)
    db.session.delete(relationship)
    db.session.commit()
    return jsonify({'message': 'Character relationship deleted successfully'}), 200

# FactionStructure APIs
@api_bp.route('/settings/faction-structure', methods=['GET'])
def get_faction_structures():
    project_id = request.args.get('project_id')
    if project_id:
        structures = FactionStructure.query.filter_by(project_id=project_id).all()
    else:
        structures = FactionStructure.query.all()
    return jsonify([structure.to_dict() for structure in structures])

@api_bp.route('/settings/faction-structure/<int:structure_id>', methods=['GET'])
def get_faction_structure(structure_id):
    structure = FactionStructure.query.get_or_404(structure_id)
    return jsonify(structure.to_dict())

@api_bp.route('/settings/faction-structure', methods=['POST'])
def create_faction_structure():
    print('接收到POST请求')
    data = request.get_json()
    print('接收到的数据:', data)
    if not data:
        print('没有接收到数据')
        return jsonify({'error': 'No data received'}), 400
    if 'project_id' not in data:
        print('缺少project_id')
        return jsonify({'error': 'Missing project_id'}), 400
    if 'name' not in data:
        print('缺少name')
        return jsonify({'error': 'Missing name'}), 400
    try:
        project = Project.query.get_or_404(data['project_id'])
        print(f'找到项目: {project.title}')
        new_structure = FactionStructure(
            project_id=data['project_id'],
            name=data['name'],
            description=data.get('description', '')
        )
        db.session.add(new_structure)
        db.session.commit()
        print(f'创建成功，ID: {new_structure.id}')
        return jsonify(new_structure.to_dict()), 201
    except Exception as e:
        print(f'创建失败: {str(e)}')
        return jsonify({'error': str(e)}), 500

@api_bp.route('/settings/faction-structure/<int:structure_id>', methods=['PUT'])
def update_faction_structure(structure_id):
    structure = FactionStructure.query.get_or_404(structure_id)
    data = request.get_json()
    structure.name = data.get('name', structure.name)
    structure.description = data.get('description', structure.description)
    db.session.commit()
    return jsonify(structure.to_dict())

@api_bp.route('/settings/faction-structure/<int:structure_id>', methods=['DELETE'])
def delete_faction_structure(structure_id):
    structure = FactionStructure.query.get_or_404(structure_id)
    db.session.delete(structure)
    db.session.commit()
    return jsonify({'message': 'Faction structure deleted successfully'}), 200

# FactionGoal APIs
@api_bp.route('/settings/faction-goal', methods=['GET'])
def get_faction_goals():
    project_id = request.args.get('project_id')
    if project_id:
        goals = FactionGoal.query.filter_by(project_id=project_id).all()
    else:
        goals = FactionGoal.query.all()
    return jsonify([goal.to_dict() for goal in goals])

@api_bp.route('/settings/faction-goal/<int:goal_id>', methods=['GET'])
def get_faction_goal(goal_id):
    goal = FactionGoal.query.get_or_404(goal_id)
    return jsonify(goal.to_dict())

@api_bp.route('/settings/faction-goal', methods=['POST'])
def create_faction_goal():
    print('接收到POST请求')
    data = request.get_json()
    print('接收到的数据:', data)
    if not data:
        print('没有接收到数据')
        return jsonify({'error': 'No data received'}), 400
    if 'project_id' not in data:
        print('缺少project_id')
        return jsonify({'error': 'Missing project_id'}), 400
    if 'name' not in data:
        print('缺少name')
        return jsonify({'error': 'Missing name'}), 400
    try:
        project = Project.query.get_or_404(data['project_id'])
        print(f'找到项目: {project.title}')
        new_goal = FactionGoal(
            project_id=data['project_id'],
            name=data['name'],
            description=data.get('description', '')
        )
        db.session.add(new_goal)
        db.session.commit()
        print(f'创建成功，ID: {new_goal.id}')
        return jsonify(new_goal.to_dict()), 201
    except Exception as e:
        print(f'创建失败: {str(e)}')
        return jsonify({'error': str(e)}), 500

@api_bp.route('/settings/faction-goal/<int:goal_id>', methods=['PUT'])
def update_faction_goal(goal_id):
    goal = FactionGoal.query.get_or_404(goal_id)
    data = request.get_json()
    goal.name = data.get('name', goal.name)
    goal.description = data.get('description', goal.description)
    db.session.commit()
    return jsonify(goal.to_dict())

@api_bp.route('/settings/faction-goal/<int:goal_id>', methods=['DELETE'])
def delete_faction_goal(goal_id):
    goal = FactionGoal.query.get_or_404(goal_id)
    db.session.delete(goal)
    db.session.commit()
    return jsonify({'message': 'Faction goal deleted successfully'}), 200

# LocationStructure APIs
@api_bp.route('/settings/location-structure', methods=['GET'])
def get_location_structures():
    project_id = request.args.get('project_id')
    if project_id:
        structures = LocationStructure.query.filter_by(project_id=project_id).all()
    else:
        structures = LocationStructure.query.all()
    return jsonify([structure.to_dict() for structure in structures])

@api_bp.route('/settings/location-structure/<int:structure_id>', methods=['GET'])
def get_location_structure(structure_id):
    structure = LocationStructure.query.get_or_404(structure_id)
    return jsonify(structure.to_dict())

@api_bp.route('/settings/location-structure', methods=['POST'])
def create_location_structure():
    print('接收到POST请求')
    data = request.get_json()
    print('接收到的数据:', data)
    if not data:
        print('没有接收到数据')
        return jsonify({'error': 'No data received'}), 400
    if 'project_id' not in data:
        print('缺少project_id')
        return jsonify({'error': 'Missing project_id'}), 400
    if 'name' not in data:
        print('缺少name')
        return jsonify({'error': 'Missing name'}), 400
    try:
        project = Project.query.get_or_404(data['project_id'])
        print(f'找到项目: {project.title}')
        new_structure = LocationStructure(
            project_id=data['project_id'],
            name=data['name'],
            description=data.get('description', '')
        )
        db.session.add(new_structure)
        db.session.commit()
        print(f'创建成功，ID: {new_structure.id}')
        return jsonify(new_structure.to_dict()), 201
    except Exception as e:
        print(f'创建失败: {str(e)}')
        return jsonify({'error': str(e)}), 500

@api_bp.route('/settings/location-structure/<int:structure_id>', methods=['PUT'])
def update_location_structure(structure_id):
    structure = LocationStructure.query.get_or_404(structure_id)
    data = request.get_json()
    structure.name = data.get('name', structure.name)
    structure.description = data.get('description', structure.description)
    db.session.commit()
    return jsonify(structure.to_dict())

@api_bp.route('/settings/location-structure/<int:structure_id>', methods=['DELETE'])
def delete_location_structure(structure_id):
    structure = LocationStructure.query.get_or_404(structure_id)
    db.session.delete(structure)
    db.session.commit()
    return jsonify({'message': 'Location structure deleted successfully'}), 200

# SpecialLocation APIs
@api_bp.route('/settings/special-location', methods=['GET'])
def get_special_locations():
    project_id = request.args.get('project_id')
    if project_id:
        locations = SpecialLocation.query.filter_by(project_id=project_id).all()
    else:
        locations = SpecialLocation.query.all()
    return jsonify([location.to_dict() for location in locations])

@api_bp.route('/settings/special-location/<int:location_id>', methods=['GET'])
def get_special_location(location_id):
    location = SpecialLocation.query.get_or_404(location_id)
    return jsonify(location.to_dict())

@api_bp.route('/settings/special-location', methods=['POST'])
def create_special_location():
    print('接收到POST请求')
    data = request.get_json()
    print('接收到的数据:', data)
    if not data:
        print('没有接收到数据')
        return jsonify({'error': 'No data received'}), 400
    if 'project_id' not in data:
        print('缺少project_id')
        return jsonify({'error': 'Missing project_id'}), 400
    if 'name' not in data:
        print('缺少name')
        return jsonify({'error': 'Missing name'}), 400
    try:
        project = Project.query.get_or_404(data['project_id'])
        print(f'找到项目: {project.title}')
        new_location = SpecialLocation(
            project_id=data['project_id'],
            name=data['name'],
            description=data.get('description', '')
        )
        db.session.add(new_location)
        db.session.commit()
        print(f'创建成功，ID: {new_location.id}')
        return jsonify(new_location.to_dict()), 201
    except Exception as e:
        print(f'创建失败: {str(e)}')
        return jsonify({'error': str(e)}), 500

@api_bp.route('/settings/special-location/<int:location_id>', methods=['PUT'])
def update_special_location(location_id):
    location = SpecialLocation.query.get_or_404(location_id)
    data = request.get_json()
    location.name = data.get('name', location.name)
    location.description = data.get('description', location.description)
    db.session.commit()
    return jsonify(location.to_dict())

@api_bp.route('/settings/special-location/<int:location_id>', methods=['DELETE'])
def delete_special_location(location_id):
    location = SpecialLocation.query.get_or_404(location_id)
    db.session.delete(location)
    db.session.commit()
    return jsonify({'message': 'Special location deleted successfully'}), 200

# EquipmentSystem APIs
@api_bp.route('/settings/equipment-system', methods=['GET'])
def get_equipment_systems():
    project_id = request.args.get('project_id')
    if project_id:
        systems = EquipmentSystem.query.filter_by(project_id=project_id).all()
    else:
        systems = EquipmentSystem.query.all()
    return jsonify([system.to_dict() for system in systems])

@api_bp.route('/settings/equipment-system/<int:system_id>', methods=['GET'])
def get_equipment_system(system_id):
    system = EquipmentSystem.query.get_or_404(system_id)
    return jsonify(system.to_dict())

@api_bp.route('/settings/equipment-system', methods=['POST'])
def create_equipment_system():
    print('接收到POST请求')
    data = request.get_json()
    print('接收到的数据:', data)
    if not data:
        print('没有接收到数据')
        return jsonify({'error': 'No data received'}), 400
    if 'project_id' not in data:
        print('缺少project_id')
        return jsonify({'error': 'Missing project_id'}), 400
    if 'name' not in data:
        print('缺少name')
        return jsonify({'error': 'Missing name'}), 400
    try:
        project = Project.query.get_or_404(data['project_id'])
        print(f'找到项目: {project.title}')
        new_system = EquipmentSystem(
            project_id=data['project_id'],
            name=data['name'],
            description=data.get('description', '')
        )
        db.session.add(new_system)
        db.session.commit()
        print(f'创建成功，ID: {new_system.id}')
        return jsonify(new_system.to_dict()), 201
    except Exception as e:
        print(f'创建失败: {str(e)}')
        return jsonify({'error': str(e)}), 500

@api_bp.route('/settings/equipment-system/<int:system_id>', methods=['PUT'])
def update_equipment_system(system_id):
    system = EquipmentSystem.query.get_or_404(system_id)
    data = request.get_json()
    system.name = data.get('name', system.name)
    system.description = data.get('description', system.description)
    db.session.commit()
    return jsonify(system.to_dict())

@api_bp.route('/settings/equipment-system/<int:system_id>', methods=['DELETE'])
def delete_equipment_system(system_id):
    system = EquipmentSystem.query.get_or_404(system_id)
    db.session.delete(system)
    db.session.commit()
    return jsonify({'message': 'Equipment system deleted successfully'}), 200

# SpecialItem APIs
@api_bp.route('/settings/special-item', methods=['GET'])
def get_special_items():
    project_id = request.args.get('project_id')
    if project_id:
        items = SpecialItem.query.filter_by(project_id=project_id).all()
    else:
        items = SpecialItem.query.all()
    return jsonify([item.to_dict() for item in items])

@api_bp.route('/settings/special-item/<int:item_id>', methods=['GET'])
def get_special_item(item_id):
    item = SpecialItem.query.get_or_404(item_id)
    return jsonify(item.to_dict())

@api_bp.route('/settings/special-item', methods=['POST'])
def create_special_item():
    print('接收到POST请求')
    data = request.get_json()
    print('接收到的数据:', data)
    if not data:
        print('没有接收到数据')
        return jsonify({'error': 'No data received'}), 400
    if 'project_id' not in data:
        print('缺少project_id')
        return jsonify({'error': 'Missing project_id'}), 400
    if 'name' not in data:
        print('缺少name')
        return jsonify({'error': 'Missing name'}), 400
    try:
        project = Project.query.get_or_404(data['project_id'])
        print(f'找到项目: {project.title}')
        new_item = SpecialItem(
            project_id=data['project_id'],
            name=data['name'],
            description=data.get('description', '')
        )
        db.session.add(new_item)
        db.session.commit()
        print(f'创建成功，ID: {new_item.id}')
        return jsonify(new_item.to_dict()), 201
    except Exception as e:
        print(f'创建失败: {str(e)}')
        return jsonify({'error': str(e)}), 500

@api_bp.route('/settings/special-item/<int:item_id>', methods=['PUT'])
def update_special_item(item_id):
    item = SpecialItem.query.get_or_404(item_id)
    data = request.get_json()
    item.name = data.get('name', item.name)
    item.description = data.get('description', item.description)
    db.session.commit()
    return jsonify(item.to_dict())

@api_bp.route('/settings/special-item/<int:item_id>', methods=['DELETE'])
def delete_special_item(item_id):
    item = SpecialItem.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.commit()
    return jsonify({'message': 'Special item deleted successfully'}), 200

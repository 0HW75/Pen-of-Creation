from flask import jsonify, request
from app import db
from app.models import Ability, Skill, Talent, Race, Creature, SpecialCreature, Project
from app.api import api_bp

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
from app import db
from datetime import datetime

class World(db.Model):
    __tablename__ = 'worlds'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=True)
    name = db.Column(db.String(255), nullable=False)
    core_concept = db.Column(db.Text, default='')
    world_type = db.Column(db.String(100), default='单一世界')
    description = db.Column(db.Text, default='')
    creation_origin = db.Column(db.Text, default='')
    world_essence = db.Column(db.Text, default='')
    status = db.Column(db.String(50), default='active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'name': self.name,
            'core_concept': self.core_concept,
            'core_rules': self.core_concept,  # 同时返回core_rules以便前端使用
            'world_type': self.world_type,
            'description': self.description,
            'creation_origin': self.creation_origin,
            'world_essence': self.world_essence,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False)
    pen_name = db.Column(db.String(255), nullable=False)
    genre = db.Column(db.String(100), nullable=False)
    target_audience = db.Column(db.String(100), nullable=False)
    core_theme = db.Column(db.Text, nullable=False)
    synopsis = db.Column(db.Text, nullable=False)
    writing_style = db.Column(db.String(100), default='')
    reference_works = db.Column(db.Text, default='')
    daily_word_goal = db.Column(db.Integer, default=0)
    total_word_goal = db.Column(db.Integer, default=0)
    estimated_completion_date = db.Column(db.Date)
    word_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'pen_name': self.pen_name,
            'genre': self.genre,
            'target_audience': self.target_audience,
            'core_theme': self.core_theme,
            'synopsis': self.synopsis,
            'writing_style': self.writing_style,
            'reference_works': self.reference_works,
            'daily_word_goal': self.daily_word_goal,
            'total_word_goal': self.total_word_goal,
            'estimated_completion_date': self.estimated_completion_date.isoformat() if self.estimated_completion_date else None,
            'word_count': self.word_count,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Outline(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, default='')
    story_model = db.Column(db.String(100), default='')
    version = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'title': self.title,
            'content': self.content,
            'story_model': self.story_model,
            'version': self.version,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Volume(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    outline_id = db.Column(db.Integer, db.ForeignKey('outline.id'), nullable=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, default='')
    core_conflict = db.Column(db.Text, default='')
    order_index = db.Column(db.Integer, nullable=False)
    version = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'outline_id': self.outline_id,
            'title': self.title,
            'content': self.content,
            'core_conflict': self.core_conflict,
            'order_index': self.order_index,
            'version': self.version,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Chapter(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    volume_id = db.Column(db.Integer, db.ForeignKey('volume.id'), nullable=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, default='')
    scenes = db.Column(db.Text, default='[]')
    characters = db.Column(db.Text, default='[]')
    core_event = db.Column(db.Text, default='')
    emotional_goal = db.Column(db.Text, default='')
    keywords = db.Column(db.Text, default='[]')
    word_count_estimate = db.Column(db.Integer, default=0)
    status = db.Column(db.String(50), default='未写')
    type = db.Column(db.String(50), default='普通')
    word_count = db.Column(db.Integer, default=0)
    order_index = db.Column(db.Integer, nullable=False)
    version = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'volume_id': self.volume_id,
            'title': self.title,
            'content': self.content,
            'scenes': self.scenes,
            'characters': self.characters,
            'core_event': self.core_event,
            'emotional_goal': self.emotional_goal,
            'keywords': self.keywords,
            'word_count_estimate': self.word_count_estimate,
            'status': self.status,
            'type': self.type,
            'word_count': self.word_count,
            'order_index': self.order_index,
            'version': self.version,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Character(db.Model):
    __tablename__ = 'character'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=True)
    world_id = db.Column(db.Integer, db.ForeignKey('worlds.id'), nullable=True)
    name = db.Column(db.String(255), nullable=False)
    alternative_names = db.Column(db.Text, default='')  # JSON格式存储别名
    description = db.Column(db.Text, default='')
    character_type = db.Column(db.String(50), default='配角')
    role_type = db.Column(db.String(50), default='配角')  # 主角/配角/反派/龙套
    status = db.Column(db.String(50), default='存活')
    importance_level = db.Column(db.Integer, default=5)  # 1-10重要程度
    race = db.Column(db.String(100), default='')
    gender = db.Column(db.String(50), default='')
    age = db.Column(db.Integer, default=0)
    birth_date = db.Column(db.String(100), default='')
    death_date = db.Column(db.String(100), default='')
    appearance = db.Column(db.Text, default='')
    appearance_age = db.Column(db.Integer, default=0)  # 外貌年龄
    distinguishing_features = db.Column(db.Text, default='')  # 显著特征
    personality = db.Column(db.Text, default='')
    background = db.Column(db.Text, default='')
    character_arc = db.Column(db.Text, default='')
    motivation = db.Column(db.Text, default='')
    secrets = db.Column(db.Text, default='')
    birthplace = db.Column(db.String(255), default='')
    nationality = db.Column(db.String(255), default='')
    occupation = db.Column(db.String(255), default='')
    faction = db.Column(db.String(255), default='')
    current_location = db.Column(db.String(255), default='')
    core_traits = db.Column(db.Text, default='')
    psychological_fear = db.Column(db.Text, default='')
    values = db.Column(db.Text, default='')
    growth_experience = db.Column(db.Text, default='')
    important_turning_points = db.Column(db.Text, default='')
    psychological_trauma = db.Column(db.Text, default='')
    physical_abilities = db.Column(db.Text, default='')
    intelligence_perception = db.Column(db.Text, default='')
    special_talents = db.Column(db.Text, default='')
    current_level = db.Column(db.String(50), default='')
    special_abilities = db.Column(db.Text, default='')
    ability_levels = db.Column(db.Text, default='')
    ability_limits = db.Column(db.Text, default='')
    growth_path = db.Column(db.Text, default='')
    common_equipment = db.Column(db.Text, default='')
    special_items = db.Column(db.Text, default='')
    personal_items = db.Column(db.Text, default='')
    key_items = db.Column(db.Text, default='')
    family_members = db.Column(db.Text, default='')
    family_background = db.Column(db.Text, default='')
    close_friends = db.Column(db.Text, default='')
    mentor_student = db.Column(db.Text, default='')
    colleagues = db.Column(db.Text, default='')
    grudges = db.Column(db.Text, default='')
    love_relationships = db.Column(db.Text, default='')
    complex_emotions = db.Column(db.Text, default='')
    unrequited_love = db.Column(db.Text, default='')
    emotional_changes = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'world_id': self.world_id,
            'name': self.name,
            'alternative_names': self.alternative_names,
            'description': self.description,
            'character_type': self.character_type,
            'role_type': self.role_type,
            'status': self.status,
            'importance_level': self.importance_level,
            'race': self.race,
            'gender': self.gender,
            'age': self.age,
            'birth_date': self.birth_date,
            'death_date': self.death_date,
            'appearance': self.appearance,
            'appearance_age': self.appearance_age,
            'distinguishing_features': self.distinguishing_features,
            'personality': self.personality,
            'background': self.background,
            'character_arc': self.character_arc,
            'motivation': self.motivation,
            'secrets': self.secrets,
            'birthplace': self.birthplace,
            'nationality': self.nationality,
            'occupation': self.occupation,
            'faction': self.faction,
            'current_location': self.current_location,
            'core_traits': self.core_traits,
            'psychological_fear': self.psychological_fear,
            'values': self.values,
            'growth_experience': self.growth_experience,
            'important_turning_points': self.important_turning_points,
            'psychological_trauma': self.psychological_trauma,
            'physical_abilities': self.physical_abilities,
            'intelligence_perception': self.intelligence_perception,
            'special_talents': self.special_talents,
            'current_level': self.current_level,
            'special_abilities': self.special_abilities,
            'ability_levels': self.ability_levels,
            'ability_limits': self.ability_limits,
            'growth_path': self.growth_path,
            'common_equipment': self.common_equipment,
            'special_items': self.special_items,
            'personal_items': self.personal_items,
            'key_items': self.key_items,
            'family_members': self.family_members,
            'family_background': self.family_background,
            'close_friends': self.close_friends,
            'mentor_student': self.mentor_student,
            'colleagues': self.colleagues,
            'grudges': self.grudges,
            'love_relationships': self.love_relationships,
            'complex_emotions': self.complex_emotions,
            'unrequited_love': self.unrequited_love,
            'emotional_changes': self.emotional_changes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class CharacterBackground(db.Model):
    __tablename__ = 'character_backgrounds'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    character_id = db.Column(db.Integer, db.ForeignKey('character.id'), nullable=False)
    period_name = db.Column(db.String(100), default='')  # 童年/少年/成年
    start_age = db.Column(db.Integer, default=0)
    end_age = db.Column(db.Integer, default=0)
    key_events = db.Column(db.Text, default='')  # JSON格式
    influential_people = db.Column(db.Text, default='')
    traumas = db.Column(db.Text, default='')
    turning_points = db.Column(db.Text, default='')
    core_memory = db.Column(db.Text, default='')
    description = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'character_id': self.character_id,
            'period_name': self.period_name,
            'start_age': self.start_age,
            'end_age': self.end_age,
            'key_events': self.key_events,
            'influential_people': self.influential_people,
            'traumas': self.traumas,
            'turning_points': self.turning_points,
            'core_memory': self.core_memory,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class CharacterAbilityDetail(db.Model):
    __tablename__ = 'character_ability_details'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    character_id = db.Column(db.Integer, db.ForeignKey('character.id'), nullable=False)
    ability_type = db.Column(db.String(50), default='')  # 天赋/学习/觉醒/装备
    ability_name = db.Column(db.String(255), default='')
    proficiency_level = db.Column(db.String(50), default='入门')  # 入门/熟练/精通/大师
    acquired_age = db.Column(db.Integer, default=0)
    acquired_method = db.Column(db.Text, default='')
    usage_restrictions = db.Column(db.Text, default='')
    is_signature = db.Column(db.Boolean, default=False)
    description = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'character_id': self.character_id,
            'ability_type': self.ability_type,
            'ability_name': self.ability_name,
            'proficiency_level': self.proficiency_level,
            'acquired_age': self.acquired_age,
            'acquired_method': self.acquired_method,
            'usage_restrictions': self.usage_restrictions,
            'is_signature': self.is_signature,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Location(db.Model):
    __tablename__ = 'location'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=True)
    world_id = db.Column(db.Integer, db.ForeignKey('worlds.id'), nullable=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default='')
    location_type = db.Column(db.String(100), default='城市')
    region = db.Column(db.String(255), default='')
    geographical_location = db.Column(db.Text, default='')
    terrain = db.Column(db.Text, default='')
    climate = db.Column(db.Text, default='')
    special_environment = db.Column(db.Text, default='')
    controlling_faction = db.Column(db.String(255), default='')
    population_composition = db.Column(db.Text, default='')
    economic_status = db.Column(db.Text, default='')
    cultural_features = db.Column(db.Text, default='')
    overall_layout = db.Column(db.Text, default='')
    functional_areas = db.Column(db.Text, default='')
    key_buildings = db.Column(db.Text, default='')
    secret_areas = db.Column(db.Text, default='')
    defense_facilities = db.Column(db.Text, default='')
    guard_force = db.Column(db.Text, default='')
    defense_weaknesses = db.Column(db.Text, default='')
    emergency_plans = db.Column(db.Text, default='')
    main_resources = db.Column(db.Text, default='')
    potential_dangers = db.Column(db.Text, default='')
    access_restrictions = db.Column(db.Text, default='')
    survival_conditions = db.Column(db.Text, default='')
    importance = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'world_id': self.world_id,
            'name': self.name,
            'description': self.description,
            'location_type': self.location_type,
            'region': self.region,
            'geographical_location': self.geographical_location,
            'terrain': self.terrain,
            'climate': self.climate,
            'special_environment': self.special_environment,
            'controlling_faction': self.controlling_faction,
            'population_composition': self.population_composition,
            'economic_status': self.economic_status,
            'cultural_features': self.cultural_features,
            'overall_layout': self.overall_layout,
            'functional_areas': self.functional_areas,
            'key_buildings': self.key_buildings,
            'secret_areas': self.secret_areas,
            'defense_facilities': self.defense_facilities,
            'guard_force': self.guard_force,
            'defense_weaknesses': self.defense_weaknesses,
            'emergency_plans': self.emergency_plans,
            'main_resources': self.main_resources,
            'potential_dangers': self.potential_dangers,
            'access_restrictions': self.access_restrictions,
            'survival_conditions': self.survival_conditions,
            'importance': self.importance,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Item(db.Model):
    __tablename__ = 'item'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    world_id = db.Column(db.Integer, db.ForeignKey('worlds.id'), nullable=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default='')
    item_type = db.Column(db.String(100), default='普通')
    rarity_level = db.Column(db.String(50), default='普通')
    physical_properties = db.Column(db.Text, default='')
    special_effects = db.Column(db.Text, default='')
    usage_requirements = db.Column(db.Text, default='')
    durability = db.Column(db.Integer, default=100)
    creator = db.Column(db.String(255), default='')
    source = db.Column(db.Text, default='')
    historical_heritage = db.Column(db.Text, default='')
    current_owner = db.Column(db.String(255), default='')
    acquisition_method = db.Column(db.Text, default='')
    importance = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'world_id': self.world_id,
            'name': self.name,
            'description': self.description,
            'item_type': self.item_type,
            'rarity_level': self.rarity_level,
            'physical_properties': self.physical_properties,
            'special_effects': self.special_effects,
            'usage_requirements': self.usage_requirements,
            'durability': self.durability,
            'creator': self.creator,
            'source': self.source,
            'historical_heritage': self.historical_heritage,
            'current_owner': self.current_owner,
            'acquisition_method': self.acquisition_method,
            'importance': self.importance,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Faction(db.Model):
    __tablename__ = 'faction'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    world_id = db.Column(db.Integer, db.ForeignKey('worlds.id'), nullable=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default='')
    faction_type = db.Column(db.String(100), default='国家')
    faction_status = db.Column(db.String(50), default='活跃')
    logo = db.Column(db.Text, default='')
    core_ideology = db.Column(db.Text, default='')
    sphere_of_influence = db.Column(db.Text, default='')
    influence_level = db.Column(db.String(50), default='区域')
    establishment_time = db.Column(db.String(255), default='')
    member_size = db.Column(db.Integer, default=0)
    headquarters_location = db.Column(db.String(255), default='')
    economic_strength = db.Column(db.Text, default='')
    leadership_system = db.Column(db.Text, default='')
    hierarchy = db.Column(db.Text, default='')
    department_setup = db.Column(db.Text, default='')
    decision_mechanism = db.Column(db.Text, default='')
    leader = db.Column(db.String(255), default='')
    key_members = db.Column(db.Text, default='')
    talent_reserve = db.Column(db.Text, default='')
    defectors = db.Column(db.Text, default='')
    recruitment_method = db.Column(db.Text, default='')
    training_system = db.Column(db.Text, default='')
    disciplinary_rules = db.Column(db.Text, default='')
    promotion_path = db.Column(db.Text, default='')
    special_abilities = db.Column(db.Text, default='')
    heritage_system = db.Column(db.Text, default='')
    resource_reserves = db.Column(db.Text, default='')
    intelligence_network = db.Column(db.Text, default='')
    short_term_goals = db.Column(db.Text, default='')
    medium_term_plans = db.Column(db.Text, default='')
    long_term_vision = db.Column(db.Text, default='')
    secret_plans = db.Column(db.Text, default='')
    ally_relationships = db.Column(db.Text, default='')
    enemy_relationships = db.Column(db.Text, default='')
    subordinate_relationships = db.Column(db.Text, default='')
    neutral_relationships = db.Column(db.Text, default='')
    importance = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'world_id': self.world_id,
            'name': self.name,
            'description': self.description,
            'faction_type': self.faction_type,
            'faction_status': self.faction_status,
            'logo': self.logo,
            'core_ideology': self.core_ideology,
            'sphere_of_influence': self.sphere_of_influence,
            'influence_level': self.influence_level,
            'establishment_time': self.establishment_time,
            'member_size': self.member_size,
            'headquarters_location': self.headquarters_location,
            'economic_strength': self.economic_strength,
            'leadership_system': self.leadership_system,
            'hierarchy': self.hierarchy,
            'department_setup': self.department_setup,
            'decision_mechanism': self.decision_mechanism,
            'leader': self.leader,
            'key_members': self.key_members,
            'talent_reserve': self.talent_reserve,
            'defectors': self.defectors,
            'recruitment_method': self.recruitment_method,
            'training_system': self.training_system,
            'disciplinary_rules': self.disciplinary_rules,
            'promotion_path': self.promotion_path,
            'special_abilities': self.special_abilities,
            'heritage_system': self.heritage_system,
            'resource_reserves': self.resource_reserves,
            'intelligence_network': self.intelligence_network,
            'short_term_goals': self.short_term_goals,
            'medium_term_plans': self.medium_term_plans,
            'long_term_vision': self.long_term_vision,
            'secret_plans': self.secret_plans,
            'ally_relationships': self.ally_relationships,
            'enemy_relationships': self.enemy_relationships,
            'subordinate_relationships': self.subordinate_relationships,
            'neutral_relationships': self.neutral_relationships,
            'importance': self.importance,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Relationship(db.Model):
    __tablename__ = 'relationship'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    world_id = db.Column(db.Integer, db.ForeignKey('worlds.id'), nullable=True)
    name = db.Column(db.String(255), nullable=False)
    source_type = db.Column(db.String(50), nullable=False)
    source_id = db.Column(db.Integer, nullable=False)
    target_type = db.Column(db.String(50), nullable=False)
    target_id = db.Column(db.Integer, nullable=False)
    relationship_type = db.Column(db.String(100), nullable=False)
    strength = db.Column(db.Integer, default=5)
    description = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'world_id': self.world_id,
            'name': self.name,
            'source_type': self.source_type,
            'source_id': self.source_id,
            'target_type': self.target_type,
            'target_id': self.target_id,
            'relationship_type': self.relationship_type,
            'strength': self.strength,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Version(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    version_name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default='')
    tags = db.Column(db.Text, default='')
    content_hash = db.Column(db.String(255), default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'version_name': self.version_name,
            'description': self.description,
            'tags': self.tags,
            'content_hash': self.content_hash,
            'created_at': self.created_at.isoformat()
        }

class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    chapter_id = db.Column(db.Integer, db.ForeignKey('chapter.id'), nullable=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, default='')
    type = db.Column(db.String(50), default='普通')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'chapter_id': self.chapter_id,
            'title': self.title,
            'content': self.content,
            'type': self.type,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class NavigationFlow(db.Model):
    __tablename__ = 'navigation_flows'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, nullable=False)
    current_stage = db.Column(db.String(50), default='project_creation')
    overall_progress = db.Column(db.Float, default=0)
    stage_progress = db.Column(db.Text, default='[]')
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'current_stage': self.current_stage,
            'overall_progress': self.overall_progress,
            'stage_progress': self.stage_progress,
            'last_updated': self.last_updated.isoformat()
        }
    
    def save(self):
        db.session.add(self)
        db.session.commit()


class Task(db.Model):
    __tablename__ = 'tasks'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    type = db.Column(db.String(50), default='chapter')
    priority = db.Column(db.Integer, default=3)
    status = db.Column(db.String(50), default='pending')
    due_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'title': self.title,
            'description': self.description,
            'type': self.type,
            'priority': self.priority,
            'status': self.status,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'created_at': self.created_at.isoformat(),
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }
    
    def save(self):
        db.session.add(self)
        db.session.commit()


class Inspiration(db.Model):
    __tablename__ = 'inspirations'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, nullable=False)
    type = db.Column(db.String(50), default='plot')
    content = db.Column(db.Text, nullable=False)
    context = db.Column(db.Text)
    rating = db.Column(db.Integer, default=0)
    status = db.Column(db.String(50), default='未使用')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    used_at = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'type': self.type,
            'content': self.content,
            'context': self.context,
            'rating': self.rating,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'used_at': self.used_at.isoformat() if self.used_at else None
        }
    
    def save(self):
        db.session.add(self)
        db.session.commit()


class EmotionBoard(db.Model):
    __tablename__ = 'emotion_boards'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    image_url = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text, default='')
    tags = db.Column(db.Text, default='')
    order_index = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'image_url': self.image_url,
            'description': self.description,
            'tags': self.tags,
            'order_index': self.order_index,
            'created_at': self.created_at.isoformat()
        }

class StoryModel(db.Model):
    __tablename__ = 'story_models'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    key = db.Column(db.String(100), nullable=False, unique=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default='')
    is_default = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'key': self.key,
            'name': self.name,
            'description': self.description,
            'is_default': self.is_default,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class WorldSetting(db.Model):
    __tablename__ = 'world_setting'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default='')
    world_type = db.Column(db.String(100), default='单一世界')
    creation_origin = db.Column(db.Text, default='')
    world_essence = db.Column(db.Text, default='')
    spatial_hierarchy = db.Column(db.Text, default='')
    world_map = db.Column(db.Text, default='')
    main_regions = db.Column(db.Text, default='')
    time_system = db.Column(db.Text, default='')
    spatial_properties = db.Column(db.Text, default='')
    physical_laws = db.Column(db.Text, default='')
    special_rules = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'name': self.name,
            'description': self.description,
            'world_type': self.world_type,
            'creation_origin': self.creation_origin,
            'world_essence': self.world_essence,
            'spatial_hierarchy': self.spatial_hierarchy,
            'world_map': self.world_map,
            'main_regions': self.main_regions,
            'time_system': self.time_system,
            'spatial_properties': self.spatial_properties,
            'physical_laws': self.physical_laws,
            'special_rules': self.special_rules,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class SocietyCulture(db.Model):
    __tablename__ = 'society_culture'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    political_system = db.Column(db.Text, default='')
    class_hierarchy = db.Column(db.Text, default='')
    power_institutions = db.Column(db.Text, default='')
    legal_system = db.Column(db.Text, default='')
    currency_system = db.Column(db.Text, default='')
    trade_network = db.Column(db.Text, default='')
    resource_distribution = db.Column(db.Text, default='')
    economic_model = db.Column(db.Text, default='')
    language_writing = db.Column(db.Text, default='')
    religion = db.Column(db.Text, default='')
    customs = db.Column(db.Text, default='')
    art_forms = db.Column(db.Text, default='')
    etiquette = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'political_system': self.political_system,
            'class_hierarchy': self.class_hierarchy,
            'power_institutions': self.power_institutions,
            'legal_system': self.legal_system,
            'currency_system': self.currency_system,
            'trade_network': self.trade_network,
            'resource_distribution': self.resource_distribution,
            'economic_model': self.economic_model,
            'language_writing': self.language_writing,
            'religion': self.religion,
            'customs': self.customs,
            'art_forms': self.art_forms,
            'etiquette': self.etiquette,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class History(db.Model):
    __tablename__ = 'history'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    era_division = db.Column(db.Text, default='')
    historical_events = db.Column(db.Text, default='')
    civilization_development = db.Column(db.Text, default='')
    historical_gaps = db.Column(db.Text, default='')
    wars = db.Column(db.Text, default='')
    disasters_reconstruction = db.Column(db.Text, default='')
    major_discoveries = db.Column(db.Text, default='')
    treaties = db.Column(db.Text, default='')
    important_figures = db.Column(db.Text, default='')
    historical_evaluations = db.Column(db.Text, default='')
    influence_heritage = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'era_division': self.era_division,
            'historical_events': self.historical_events,
            'civilization_development': self.civilization_development,
            'historical_gaps': self.historical_gaps,
            'wars': self.wars,
            'disasters_reconstruction': self.disasters_reconstruction,
            'major_discoveries': self.major_discoveries,
            'treaties': self.treaties,
            'important_figures': self.important_figures,
            'historical_evaluations': self.historical_evaluations,
            'influence_heritage': self.influence_heritage,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Ability(db.Model):
    __tablename__ = 'ability'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    world_id = db.Column(db.Integer, db.ForeignKey('worlds.id'), nullable=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default='')
    ability_type = db.Column(db.String(100), default='')
    level_system = db.Column(db.Text, default='')
    cultivation_methods = db.Column(db.Text, default='')
    resource_requirements = db.Column(db.Text, default='')
    growth_limits = db.Column(db.Text, default='')
    bottleneck_breakthrough = db.Column(db.Text, default='')
    career_branches = db.Column(db.Text, default='')
    specialization_directions = db.Column(db.Text, default='')
    fusion_possibilities = db.Column(db.Text, default='')
    ultimate_forms = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'world_id': self.world_id,
            'name': self.name,
            'description': self.description,
            'ability_type': self.ability_type,
            'level_system': self.level_system,
            'cultivation_methods': self.cultivation_methods,
            'resource_requirements': self.resource_requirements,
            'growth_limits': self.growth_limits,
            'bottleneck_breakthrough': self.bottleneck_breakthrough,
            'career_branches': self.career_branches,
            'specialization_directions': self.specialization_directions,
            'fusion_possibilities': self.fusion_possibilities,
            'ultimate_forms': self.ultimate_forms,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Skill(db.Model):
    __tablename__ = 'skill'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    world_id = db.Column(db.Integer, db.ForeignKey('worlds.id'), nullable=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default='')
    skill_type = db.Column(db.String(100), default='')
    skill_level = db.Column(db.String(50), default='初级')
    casting_conditions = db.Column(db.Text, default='')
    resource_consumption = db.Column(db.Text, default='')
    cooldown_time = db.Column(db.String(50), default='')
    effect_range = db.Column(db.Text, default='')
    duration = db.Column(db.String(50), default='')
    prerequisite_skills = db.Column(db.Text, default='')
    advanced_skills = db.Column(db.Text, default='')
    combination_skills = db.Column(db.Text, default='')
    counter_relationship = db.Column(db.Text, default='')
    skill_tree = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'world_id': self.world_id,
            'name': self.name,
            'description': self.description,
            'skill_type': self.skill_type,
            'skill_level': self.skill_level,
            'casting_conditions': self.casting_conditions,
            'resource_consumption': self.resource_consumption,
            'cooldown_time': self.cooldown_time,
            'effect_range': self.effect_range,
            'duration': self.duration,
            'prerequisite_skills': self.prerequisite_skills,
            'advanced_skills': self.advanced_skills,
            'combination_skills': self.combination_skills,
            'counter_relationship': self.counter_relationship,
            'skill_tree': self.skill_tree,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Talent(db.Model):
    __tablename__ = 'talent'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    world_id = db.Column(db.Integer, db.ForeignKey('worlds.id'), nullable=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default='')
    talent_type = db.Column(db.String(100), default='先天')
    bloodline_talent = db.Column(db.Text, default='')
    special_physique = db.Column(db.Text, default='')
    innate_abilities = db.Column(db.Text, default='')
    genetic_characteristics = db.Column(db.Text, default='')
    awakened_abilities = db.Column(db.Text, default='')
    modified_enhancements = db.Column(db.Text, default='')
    contract_abilities = db.Column(db.Text, default='')
    learning_abilities = db.Column(db.Text, default='')
    awakening_conditions = db.Column(db.Text, default='')
    development_methods = db.Column(db.Text, default='')
    ability_limits = db.Column(db.Text, default='')
    evolution_possibilities = db.Column(db.Text, default='')
    cost_risks = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'world_id': self.world_id,
            'name': self.name,
            'description': self.description,
            'talent_type': self.talent_type,
            'bloodline_talent': self.bloodline_talent,
            'special_physique': self.special_physique,
            'innate_abilities': self.innate_abilities,
            'genetic_characteristics': self.genetic_characteristics,
            'awakened_abilities': self.awakened_abilities,
            'modified_enhancements': self.modified_enhancements,
            'contract_abilities': self.contract_abilities,
            'learning_abilities': self.learning_abilities,
            'awakening_conditions': self.awakening_conditions,
            'development_methods': self.development_methods,
            'ability_limits': self.ability_limits,
            'evolution_possibilities': self.evolution_possibilities,
            'cost_risks': self.cost_risks,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Race(db.Model):
    __tablename__ = 'race'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    world_id = db.Column(db.Integer, db.ForeignKey('worlds.id'), nullable=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default='')
    origin_legend = db.Column(db.Text, default='')
    distribution_area = db.Column(db.Text, default='')
    social_form = db.Column(db.Text, default='')
    appearance_features = db.Column(db.Text, default='')
    physiological_characteristics = db.Column(db.Text, default='')
    lifespan_cycle = db.Column(db.Text, default='')
    special_abilities = db.Column(db.Text, default='')
    weaknesses_limits = db.Column(db.Text, default='')
    subspecies = db.Column(db.Text, default='')
    hybrids = db.Column(db.Text, default='')
    mutants = db.Column(db.Text, default='')
    legendary_species = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'world_id': self.world_id,
            'name': self.name,
            'description': self.description,
            'origin_legend': self.origin_legend,
            'distribution_area': self.distribution_area,
            'social_form': self.social_form,
            'appearance_features': self.appearance_features,
            'physiological_characteristics': self.physiological_characteristics,
            'lifespan_cycle': self.lifespan_cycle,
            'special_abilities': self.special_abilities,
            'weaknesses_limits': self.weaknesses_limits,
            'subspecies': self.subspecies,
            'hybrids': self.hybrids,
            'mutants': self.mutants,
            'legendary_species': self.legendary_species,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Creature(db.Model):
    __tablename__ = 'creature'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    world_id = db.Column(db.Integer, db.ForeignKey('worlds.id'), nullable=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default='')
    creature_type = db.Column(db.String(100), default='野兽')
    threat_level = db.Column(db.String(50), default='低')
    habitat = db.Column(db.Text, default='')
    behavior_habits = db.Column(db.Text, default='')
    special_abilities = db.Column(db.Text, default='')
    weaknesses_predators = db.Column(db.Text, default='')
    domestication_possibility = db.Column(db.Text, default='')
    contract_methods = db.Column(db.Text, default='')
    use_value = db.Column(db.Text, default='')
    material_sources = db.Column(db.Text, default='')
    legendary_stories = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'world_id': self.world_id,
            'name': self.name,
            'description': self.description,
            'creature_type': self.creature_type,
            'threat_level': self.threat_level,
            'habitat': self.habitat,
            'behavior_habits': self.behavior_habits,
            'special_abilities': self.special_abilities,
            'weaknesses_predators': self.weaknesses_predators,
            'domestication_possibility': self.domestication_possibility,
            'contract_methods': self.contract_methods,
            'use_value': self.use_value,
            'material_sources': self.material_sources,
            'legendary_stories': self.legendary_stories,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class SpecialCreature(db.Model):
    __tablename__ = 'special_creature'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    world_id = db.Column(db.Integer, db.ForeignKey('worlds.id'), nullable=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default='')
    creature_type = db.Column(db.String(100), default='异界生物')
    spatial_properties = db.Column(db.Text, default='')
    entry_conditions = db.Column(db.Text, default='')
    internal_laws = db.Column(db.Text, default='')
    existence_limits = db.Column(db.Text, default='')
    summoning_type = db.Column(db.Text, default='')
    summoning_contract = db.Column(db.Text, default='')
    ability_characteristics = db.Column(db.Text, default='')
    control_difficulty = db.Column(db.String(50), default='低')
    concept_type = db.Column(db.String(100), default='精神空间')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'world_id': self.world_id,
            'name': self.name,
            'description': self.description,
            'creature_type': self.creature_type,
            'spatial_properties': self.spatial_properties,
            'entry_conditions': self.entry_conditions,
            'internal_laws': self.internal_laws,
            'existence_limits': self.existence_limits,
            'summoning_type': self.summoning_type,
            'summoning_contract': self.summoning_contract,
            'ability_characteristics': self.ability_characteristics,
            'control_difficulty': self.control_difficulty,
            'concept_type': self.concept_type,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Timeline(db.Model):
    __tablename__ = 'timeline'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    world_id = db.Column(db.Integer, db.ForeignKey('worlds.id'), nullable=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default='')
    timeline_type = db.Column(db.String(100), default='个人时间线')
    related_id = db.Column(db.Integer, default=0)
    birth_growth = db.Column(db.Text, default='')
    key_events = db.Column(db.Text, default='')
    development_changes = db.Column(db.Text, default='')
    important_turning_points = db.Column(db.Text, default='')
    ending_destination = db.Column(db.Text, default='')
    establishment_development = db.Column(db.Text, default='')
    rise_fall_changes = db.Column(db.Text, default='')
    major_events = db.Column(db.Text, default='')
    power_changes = db.Column(db.Text, default='')
    ending_transformation = db.Column(db.Text, default='')
    world_creation = db.Column(db.Text, default='')
    civilization_development = db.Column(db.Text, default='')
    major_changes = db.Column(db.Text, default='')
    current_era = db.Column(db.Text, default='')
    future_possibilities = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'world_id': self.world_id,
            'name': self.name,
            'description': self.description,
            'timeline_type': self.timeline_type,
            'related_id': self.related_id,
            'birth_growth': self.birth_growth,
            'key_events': self.key_events,
            'development_changes': self.development_changes,
            'important_turning_points': self.important_turning_points,
            'ending_destination': self.ending_destination,
            'establishment_development': self.establishment_development,
            'rise_fall_changes': self.rise_fall_changes,
            'major_events': self.major_events,
            'power_changes': self.power_changes,
            'ending_transformation': self.ending_transformation,
            'world_creation': self.world_creation,
            'civilization_development': self.civilization_development,
            'major_changes': self.major_changes,
            'current_era': self.current_era,
            'future_possibilities': self.future_possibilities,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class DataAssociation(db.Model):
    __tablename__ = 'data_association'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    association_type = db.Column(db.String(100), default='人物关联')
    source_type = db.Column(db.String(50), default='')
    source_id = db.Column(db.Integer, default=0)
    target_type = db.Column(db.String(50), default='')
    target_id = db.Column(db.Integer, default=0)
    association_details = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'association_type': self.association_type,
            'source_type': self.source_type,
            'source_id': self.source_id,
            'target_type': self.target_type,
            'target_id': self.target_id,
            'association_details': self.association_details,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class CharacterTrait(db.Model):
    __tablename__ = 'character_trait'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


# ==================== 任务2：能量与社会体系数据库 ====================

class EnergySystem(db.Model):
    """能量体系表 - 存储世界的能量类型和体系"""
    __tablename__ = 'energy_systems'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    world_id = db.Column(db.Integer, db.ForeignKey('worlds.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    energy_type = db.Column(db.String(100), default='魔法')  # 魔法/斗气/灵气/科技/混合
    description = db.Column(db.Text, default='')
    source = db.Column(db.Text, default='')  # 能量来源
    acquisition_method = db.Column(db.Text, default='')  # 获取方式
    storage_method = db.Column(db.Text, default='')  # 储存方式
    usage_limitations = db.Column(db.Text, default='')  # 使用限制
    common_applications = db.Column(db.Text, default='')  # 常见应用
    rarity = db.Column(db.String(50), default='常见')  # 稀有度
    stability = db.Column(db.String(50), default='稳定')  # 稳定性
    interaction_with_other_energies = db.Column(db.Text, default='')  # 与其他能量交互
    cultivation_method = db.Column(db.Text, default='')  # 修炼方法
    typical_manifestations = db.Column(db.Text, default='')  # 典型表现形式
    status = db.Column(db.String(50), default='active')
    order_index = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'world_id': self.world_id,
            'name': self.name,
            'energy_type': self.energy_type,
            'description': self.description,
            'source': self.source,
            'acquisition_method': self.acquisition_method,
            'storage_method': self.storage_method,
            'usage_limitations': self.usage_limitations,
            'common_applications': self.common_applications,
            'rarity': self.rarity,
            'stability': self.stability,
            'interaction_with_other_energies': self.interaction_with_other_energies,
            'cultivation_method': self.cultivation_method,
            'typical_manifestations': self.typical_manifestations,
            'status': self.status,
            'order_index': self.order_index,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class PowerLevel(db.Model):
    """力量等级表 - 存储修炼等级体系"""
    __tablename__ = 'power_levels'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    world_id = db.Column(db.Integer, db.ForeignKey('worlds.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    level = db.Column(db.Integer, nullable=False)  # 等级数值
    level_name = db.Column(db.String(255), nullable=False)  # 等级名称
    description = db.Column(db.Text, default='')
    requirements = db.Column(db.Text, default='')  # 晋升要求
    characteristics = db.Column(db.Text, default='')  # 等级特征
    abilities = db.Column(db.Text, default='')  # 获得能力
    lifespan_extension = db.Column(db.String(100), default='')  # 寿命延长
    typical_combat_power = db.Column(db.Text, default='')  # 典型战斗力
    rarity = db.Column(db.String(50), default='常见')  # 稀有度
    social_status = db.Column(db.String(100), default='')  # 社会地位
    energy_system_id = db.Column(db.Integer, default=None)  # 关联能量体系
    status = db.Column(db.String(50), default='active')
    order_index = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'world_id': self.world_id,
            'name': self.name,
            'level': self.level,
            'level_name': self.level_name,
            'description': self.description,
            'requirements': self.requirements,
            'characteristics': self.characteristics,
            'abilities': self.abilities,
            'lifespan_extension': self.lifespan_extension,
            'typical_combat_power': self.typical_combat_power,
            'rarity': self.rarity,
            'social_status': self.social_status,
            'energy_system_id': self.energy_system_id,
            'status': self.status,
            'order_index': self.order_index,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class CommonSkill(db.Model):
    """通用技能表 - 存储世界通用技能"""
    __tablename__ = 'common_skills'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    world_id = db.Column(db.Integer, db.ForeignKey('worlds.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    skill_type = db.Column(db.String(100), default='战斗')  # 战斗/生活/辅助/特殊
    description = db.Column(db.Text, default='')
    difficulty = db.Column(db.String(50), default='普通')  # 简单/普通/困难/极难
    requirements = db.Column(db.Text, default='')  # 学习要求
    learning_time = db.Column(db.String(100), default='')  # 学习时间
    commonality = db.Column(db.String(50), default='常见')  # 普及程度
    power_level_required = db.Column(db.Integer, default=0)  # 所需等级
    energy_consumption = db.Column(db.String(100), default='')  # 能量消耗
    effects = db.Column(db.Text, default='')  # 技能效果
    limitations = db.Column(db.Text, default='')  # 使用限制
    typical_users = db.Column(db.Text, default='')  # 典型使用者
    energy_system_id = db.Column(db.Integer, default=None)  # 关联能量体系
    status = db.Column(db.String(50), default='active')
    order_index = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'world_id': self.world_id,
            'name': self.name,
            'skill_type': self.skill_type,
            'description': self.description,
            'difficulty': self.difficulty,
            'requirements': self.requirements,
            'learning_time': self.learning_time,
            'commonality': self.commonality,
            'power_level_required': self.power_level_required,
            'energy_consumption': self.energy_consumption,
            'effects': self.effects,
            'limitations': self.limitations,
            'typical_users': self.typical_users,
            'energy_system_id': self.energy_system_id,
            'status': self.status,
            'order_index': self.order_index,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class Civilization(db.Model):
    """文明/文化表 - 存储世界文明类型"""
    __tablename__ = 'civilizations'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    world_id = db.Column(db.Integer, db.ForeignKey('worlds.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    civilization_type = db.Column(db.String(100), default='魔法文明')  # 魔法/科技/修真/混合等
    description = db.Column(db.Text, default='')
    development_level = db.Column(db.String(100), default='中世纪')  # 发展阶段
    population_scale = db.Column(db.String(100), default='')  # 人口规模
    territory_size = db.Column(db.String(100), default='')  # 领土范围
    political_system = db.Column(db.Text, default='')  # 政治体制
    economic_system = db.Column(db.Text, default='')  # 经济体制
    technological_level = db.Column(db.String(100), default='')  # 科技水平
    magical_level = db.Column(db.String(100), default='')  # 魔法水平
    cultural_characteristics = db.Column(db.Text, default='')  # 文化特征
    religious_beliefs = db.Column(db.Text, default='')  # 宗教信仰
    taboos = db.Column(db.Text, default='')  # 禁忌
    values = db.Column(db.Text, default='')  # 价值观
    historical_origin = db.Column(db.Text, default='')  # 历史起源
    status = db.Column(db.String(50), default='active')
    order_index = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'world_id': self.world_id,
            'name': self.name,
            'civilization_type': self.civilization_type,
            'description': self.description,
            'development_level': self.development_level,
            'population_scale': self.population_scale,
            'territory_size': self.territory_size,
            'political_system': self.political_system,
            'economic_system': self.economic_system,
            'technological_level': self.technological_level,
            'magical_level': self.magical_level,
            'cultural_characteristics': self.cultural_characteristics,
            'religious_beliefs': self.religious_beliefs,
            'taboos': self.taboos,
            'values': self.values,
            'historical_origin': self.historical_origin,
            'status': self.status,
            'order_index': self.order_index,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class CivilizationRegion(db.Model):
    """文明区域关联表 - 多对多关联"""
    __tablename__ = 'civilization_regions'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    civilization_id = db.Column(db.Integer, db.ForeignKey('civilizations.id'), nullable=False)
    region_id = db.Column(db.Integer, db.ForeignKey('regions.id'), nullable=False)
    relationship_type = db.Column(db.String(100), default='统治')  # 统治/影响/贸易/敌对
    influence_level = db.Column(db.Integer, default=5)  # 影响力等级1-10
    description = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'civilization_id': self.civilization_id,
            'region_id': self.region_id,
            'relationship_type': self.relationship_type,
            'influence_level': self.influence_level,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class SocialClass(db.Model):
    """社会阶级表 - 存储社会阶层结构"""
    __tablename__ = 'social_classes'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    world_id = db.Column(db.Integer, db.ForeignKey('worlds.id'), nullable=False)
    civilization_id = db.Column(db.Integer, db.ForeignKey('civilizations.id'), nullable=True)
    name = db.Column(db.String(255), nullable=False)
    class_level = db.Column(db.Integer, default=1)  # 阶级层级
    description = db.Column(db.Text, default='')
    typical_occupations = db.Column(db.Text, default='')  # 典型职业
    privileges = db.Column(db.Text, default='')  # 特权
    obligations = db.Column(db.Text, default='')  # 义务
    living_standards = db.Column(db.Text, default='')  # 生活水平
    education_access = db.Column(db.String(100), default='')  # 教育机会
    social_mobility = db.Column(db.String(100), default='')  # 社会流动性
    percentage_of_population = db.Column(db.String(50), default='')  # 人口比例
    typical_power_level = db.Column(db.Integer, default=0)  # 典型力量等级
    status = db.Column(db.String(50), default='active')
    order_index = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'world_id': self.world_id,
            'civilization_id': self.civilization_id,
            'name': self.name,
            'class_level': self.class_level,
            'description': self.description,
            'typical_occupations': self.typical_occupations,
            'privileges': self.privileges,
            'obligations': self.obligations,
            'living_standards': self.living_standards,
            'education_access': self.education_access,
            'social_mobility': self.social_mobility,
            'percentage_of_population': self.percentage_of_population,
            'typical_power_level': self.typical_power_level,
            'status': self.status,
            'order_index': self.order_index,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class CulturalCustom(db.Model):
    """文化习俗表 - 存储文化传统和习俗"""
    __tablename__ = 'cultural_customs'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    world_id = db.Column(db.Integer, db.ForeignKey('worlds.id'), nullable=False)
    civilization_id = db.Column(db.Integer, db.ForeignKey('civilizations.id'), nullable=True)
    name = db.Column(db.String(255), nullable=False)
    custom_type = db.Column(db.String(100), default='节日')  # 节日/仪式/礼仪/禁忌/传统
    description = db.Column(db.Text, default='')
    origin = db.Column(db.Text, default='')  # 起源
    significance = db.Column(db.Text, default='')  # 意义
    participants = db.Column(db.Text, default='')  # 参与者
    time_period = db.Column(db.String(100), default='')  # 时间周期
    location = db.Column(db.Text, default='')  # 地点
    procedures = db.Column(db.Text, default='')  # 流程
    related_beliefs = db.Column(db.Text, default='')  # 相关信仰
    variations = db.Column(db.Text, default='')  # 变体形式
    importance_level = db.Column(db.Integer, default=5)  # 重要性1-10
    status = db.Column(db.String(50), default='active')
    order_index = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'world_id': self.world_id,
            'civilization_id': self.civilization_id,
            'name': self.name,
            'custom_type': self.custom_type,
            'description': self.description,
            'origin': self.origin,
            'significance': self.significance,
            'participants': self.participants,
            'time_period': self.time_period,
            'location': self.location,
            'procedures': self.procedures,
            'related_beliefs': self.related_beliefs,
            'variations': self.variations,
            'importance_level': self.importance_level,
            'status': self.status,
            'order_index': self.order_index,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


# ==================== 第二阶段：世界观设定模块扩展 ====================

class Dimension(db.Model):
    """维度/位面表 - 存储世界的不同维度或位面信息"""
    __tablename__ = 'dimensions'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    world_id = db.Column(db.Integer, db.ForeignKey('worlds.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    dimension_type = db.Column(db.String(100), default='主世界')  # 主世界/位面/维度/异空间
    description = db.Column(db.Text, default='')
    entry_conditions = db.Column(db.Text, default='')  # 进入条件
    physical_properties = db.Column(db.Text, default='')  # 物理特性
    time_flow = db.Column(db.String(100), default='1:1')  # 时间流速
    spatial_hierarchy = db.Column(db.Integer, default=1)  # 空间层级
    special_rules = db.Column(db.Text, default='')  # 特殊规则
    magic_concentration = db.Column(db.String(50), default='中等')  # 魔法浓度
    element_activity = db.Column(db.Text, default='')  # 元素活跃度
    gravity = db.Column(db.String(50), default='1.0G')  # 重力
    status = db.Column(db.String(50), default='active')
    order_index = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'world_id': self.world_id,
            'name': self.name,
            'dimension_type': self.dimension_type,
            'description': self.description,
            'entry_conditions': self.entry_conditions,
            'physical_properties': self.physical_properties,
            'time_flow': self.time_flow,
            'spatial_hierarchy': self.spatial_hierarchy,
            'special_rules': self.special_rules,
            'magic_concentration': self.magic_concentration,
            'element_activity': self.element_activity,
            'gravity': self.gravity,
            'status': self.status,
            'order_index': self.order_index,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class Region(db.Model):
    """地理区域表 - 支持自关联树状结构"""
    __tablename__ = 'regions'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    world_id = db.Column(db.Integer, db.ForeignKey('worlds.id'), nullable=False)
    parent_region_id = db.Column(db.Integer, db.ForeignKey('regions.id'), nullable=True)
    name = db.Column(db.String(255), nullable=False)
    region_type = db.Column(db.String(100), default='大陆')  # 大陆/国家/省份/城市/区域
    description = db.Column(db.Text, default='')
    geographical_coordinates = db.Column(db.Text, default='')  # JSON格式存储坐标
    climate = db.Column(db.String(100), default='温带')
    terrain = db.Column(db.Text, default='')  # 地形特征
    area_size = db.Column(db.String(100), default='')  # 面积
    population = db.Column(db.Integer, default=0)
    resources = db.Column(db.Text, default='')  # 资源分布
    strategic_importance = db.Column(db.Integer, default=5)  # 战略重要性1-10
    controlling_faction_id = db.Column(db.Integer, default=None)  # 控制势力
    danger_level = db.Column(db.String(50), default='安全')  # 安全/低危/中危/高危/禁地
    status = db.Column(db.String(50), default='active')
    order_index = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 自关联关系
    parent = db.relationship('Region', remote_side=[id], backref='children')
    
    def to_dict(self):
        return {
            'id': self.id,
            'world_id': self.world_id,
            'parent_region_id': self.parent_region_id,
            'name': self.name,
            'region_type': self.region_type,
            'description': self.description,
            'geographical_coordinates': self.geographical_coordinates,
            'climate': self.climate,
            'terrain': self.terrain,
            'area_size': self.area_size,
            'population': self.population,
            'resources': self.resources,
            'strategic_importance': self.strategic_importance,
            'controlling_faction_id': self.controlling_faction_id,
            'danger_level': self.danger_level,
            'status': self.status,
            'order_index': self.order_index,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class CelestialBody(db.Model):
    """天体表 - 存储星球、卫星、恒星等天体信息"""
    __tablename__ = 'celestial_bodies'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    world_id = db.Column(db.Integer, db.ForeignKey('worlds.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    body_type = db.Column(db.String(100), default='行星')  # 恒星/行星/卫星/彗星/星云
    description = db.Column(db.Text, default='')
    size = db.Column(db.String(100), default='')  # 大小
    mass = db.Column(db.String(100), default='')  # 质量
    orbit_period = db.Column(db.String(100), default='')  # 公转周期
    rotation_period = db.Column(db.String(100), default='')  # 自转周期
    distance_from_star = db.Column(db.String(100), default='')  # 距恒星距离
    surface_temperature = db.Column(db.String(100), default='')  # 表面温度
    atmosphere = db.Column(db.Text, default='')  # 大气成分
    satellites = db.Column(db.Text, default='')  # 卫星列表JSON
    magical_properties = db.Column(db.Text, default='')  # 魔法属性
    cultural_significance = db.Column(db.Text, default='')  # 文化意义
    status = db.Column(db.String(50), default='active')
    order_index = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'world_id': self.world_id,
            'name': self.name,
            'body_type': self.body_type,
            'description': self.description,
            'size': self.size,
            'mass': self.mass,
            'orbit_period': self.orbit_period,
            'rotation_period': self.rotation_period,
            'distance_from_star': self.distance_from_star,
            'surface_temperature': self.surface_temperature,
            'atmosphere': self.atmosphere,
            'satellites': self.satellites,
            'magical_properties': self.magical_properties,
            'cultural_significance': self.cultural_significance,
            'status': self.status,
            'order_index': self.order_index,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class NaturalLaw(db.Model):
    """自然法则表 - 存储世界的物理法则、魔法规则等"""
    __tablename__ = 'natural_laws'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    world_id = db.Column(db.Integer, db.ForeignKey('worlds.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    law_type = db.Column(db.String(100), default='物理法则')  # 物理法则/魔法规则/时间法则/空间法则
    description = db.Column(db.Text, default='')
    basic_principles = db.Column(db.Text, default='')  # 基本原理
    exceptions = db.Column(db.Text, default='')  # 例外情况
    limitations = db.Column(db.Text, default='')  # 限制条件
    interactions = db.Column(db.Text, default='')  # 与其他法则的交互
    common_applications = db.Column(db.Text, default='')  # 常见应用
    taboos = db.Column(db.Text, default='')  # 禁忌
    consequences = db.Column(db.Text, default='')  # 违反后果
    importance_level = db.Column(db.Integer, default=5)  # 重要性1-10
    status = db.Column(db.String(50), default='active')
    order_index = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'world_id': self.world_id,
            'name': self.name,
            'law_type': self.law_type,
            'description': self.description,
            'basic_principles': self.basic_principles,
            'exceptions': self.exceptions,
            'limitations': self.limitations,
            'interactions': self.interactions,
            'common_applications': self.common_applications,
            'taboos': self.taboos,
            'consequences': self.consequences,
            'importance_level': self.importance_level,
            'status': self.status,
            'order_index': self.order_index,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class CharacterAbility(db.Model):
    __tablename__ = 'character_ability'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class CharacterRelationship(db.Model):
    __tablename__ = 'character_relationship'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class FactionStructure(db.Model):
    __tablename__ = 'faction_structure'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class FactionGoal(db.Model):
    __tablename__ = 'faction_goal'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class LocationStructure(db.Model):
    __tablename__ = 'location_structure'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class SpecialLocation(db.Model):
    __tablename__ = 'special_location'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class EquipmentSystem(db.Model):
    __tablename__ = 'equipment_system'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class SpecialItem(db.Model):
    __tablename__ = 'special_item'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


# ==================== 任务3：扩展世界观体系表 ====================

class EnergyForm(db.Model):
    """能量形态表 - 具体能量形态（一个体系可有多种形态）"""
    __tablename__ = 'energy_forms'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    world_id = db.Column(db.Integer, db.ForeignKey('worlds.id'), nullable=False)
    energy_system_id = db.Column(db.Integer, db.ForeignKey('energy_systems.id'), nullable=True)
    name = db.Column(db.String(255), nullable=False)
    form_type = db.Column(db.String(100), default='元素')  # 元素/生命/概念/复合
    description = db.Column(db.Text, default='')
    basic_properties = db.Column(db.Text, default='')  # 基本属性
    interaction_rules = db.Column(db.Text, default='')  # 相互作用规则
    purification_method = db.Column(db.Text, default='')  # 提纯方法
    corruption_effects = db.Column(db.Text, default='')  # 污染/腐化效果
    visual_manifestation = db.Column(db.Text, default='')  # 视觉表现
    sensory_perception = db.Column(db.Text, default='')  # 感官感知
    status = db.Column(db.String(50), default='active')
    order_index = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'world_id': self.world_id,
            'energy_system_id': self.energy_system_id,
            'name': self.name,
            'form_type': self.form_type,
            'description': self.description,
            'basic_properties': self.basic_properties,
            'interaction_rules': self.interaction_rules,
            'purification_method': self.purification_method,
            'corruption_effects': self.corruption_effects,
            'visual_manifestation': self.visual_manifestation,
            'sensory_perception': self.sensory_perception,
            'status': self.status,
            'order_index': self.order_index,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class PowerCost(db.Model):
    """力量代价表 - 使用力量的代价系统"""
    __tablename__ = 'power_costs'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    world_id = db.Column(db.Integer, db.ForeignKey('worlds.id'), nullable=False)
    cost_type = db.Column(db.String(100), default='寿命')  # 寿命/记忆/情感/理智/随机
    description = db.Column(db.Text, default='')
    trigger_conditions = db.Column(db.Text, default='')  # 触发条件
    payment_mechanism = db.Column(db.Text, default='')  # 支付机制
    severity_level = db.Column(db.Integer, default=5)  # 严重程度1-10
    reversible = db.Column(db.Boolean, default=False)  # 是否可逆
    mitigation_methods = db.Column(db.Text, default='')  # 缓解方法
    accumulation_effect = db.Column(db.Text, default='')  # 累积效应
    status = db.Column(db.String(50), default='active')
    order_index = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'world_id': self.world_id,
            'cost_type': self.cost_type,
            'description': self.description,
            'trigger_conditions': self.trigger_conditions,
            'payment_mechanism': self.payment_mechanism,
            'severity_level': self.severity_level,
            'reversible': self.reversible,
            'mitigation_methods': self.mitigation_methods,
            'accumulation_effect': self.accumulation_effect,
            'status': self.status,
            'order_index': self.order_index,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class EconomicSystem(db.Model):
    """经济体系表 - 文明的经济运行方式"""
    __tablename__ = 'economic_systems'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    world_id = db.Column(db.Integer, db.ForeignKey('worlds.id'), nullable=False)
    civilization_id = db.Column(db.Integer, db.ForeignKey('civilizations.id'), nullable=True)
    name = db.Column(db.String(255), nullable=False)
    economic_model = db.Column(db.String(100), default='市场经济')  # 物物交换/市场经济/计划经济/混合
    description = db.Column(db.Text, default='')
    currency_name = db.Column(db.String(255), default='')  # 货币名称
    currency_material = db.Column(db.Text, default='')  # 货币材质
    denomination_system = db.Column(db.Text, default='')  # 面额体系
    exchange_rates = db.Column(db.Text, default='')  # 汇率体系JSON
    major_industries = db.Column(db.Text, default='')  # 主要产业JSON
    trade_routes = db.Column(db.Text, default='')  # 主要商路
    trade_partners = db.Column(db.Text, default='')  # 贸易伙伴
    resource_dependencies = db.Column(db.Text, default='')  # 资源依赖
    wealth_distribution = db.Column(db.Text, default='')  # 财富分布
    taxation_system = db.Column(db.Text, default='')  # 税收系统
    banking_system = db.Column(db.Text, default='')  # 银行系统
    economic_challenges = db.Column(db.Text, default='')  # 经济挑战
    status = db.Column(db.String(50), default='active')
    order_index = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'world_id': self.world_id,
            'civilization_id': self.civilization_id,
            'name': self.name,
            'economic_model': self.economic_model,
            'description': self.description,
            'currency_name': self.currency_name,
            'currency_material': self.currency_material,
            'denomination_system': self.denomination_system,
            'exchange_rates': self.exchange_rates,
            'major_industries': self.major_industries,
            'trade_routes': self.trade_routes,
            'trade_partners': self.trade_partners,
            'resource_dependencies': self.resource_dependencies,
            'wealth_distribution': self.wealth_distribution,
            'taxation_system': self.taxation_system,
            'banking_system': self.banking_system,
            'economic_challenges': self.economic_challenges,
            'status': self.status,
            'order_index': self.order_index,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class PoliticalSystem(db.Model):
    """政治体系表 - 文明的政治结构"""
    __tablename__ = 'political_systems'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    world_id = db.Column(db.Integer, db.ForeignKey('worlds.id'), nullable=False)
    civilization_id = db.Column(db.Integer, db.ForeignKey('civilizations.id'), nullable=True)
    name = db.Column(db.String(255), nullable=False)
    government_type = db.Column(db.String(100), default='君主制')  # 君主制/共和制/神权制/寡头制
    description = db.Column(db.Text, default='')
    power_structure = db.Column(db.Text, default='')  # 权力结构描述
    succession_system = db.Column(db.Text, default='')  # 继承制度
    decision_process = db.Column(db.Text, default='')  # 决策流程
    administrative_divisions = db.Column(db.Text, default='')  # 行政区划
    legal_system = db.Column(db.Text, default='')  # 法律体系
    military_organization = db.Column(db.Text, default='')  # 军事组织
    diplomatic_style = db.Column(db.Text, default='')  # 外交风格
    internal_conflicts = db.Column(db.Text, default='')  # 内部矛盾
    external_threats = db.Column(db.Text, default='')  # 外部威胁
    political_stability = db.Column(db.String(50), default='稳定')  # 政治稳定性
    status = db.Column(db.String(50), default='active')
    order_index = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'world_id': self.world_id,
            'civilization_id': self.civilization_id,
            'name': self.name,
            'government_type': self.government_type,
            'description': self.description,
            'power_structure': self.power_structure,
            'succession_system': self.succession_system,
            'decision_process': self.decision_process,
            'administrative_divisions': self.administrative_divisions,
            'legal_system': self.legal_system,
            'military_organization': self.military_organization,
            'diplomatic_style': self.diplomatic_style,
            'internal_conflicts': self.internal_conflicts,
            'external_threats': self.external_threats,
            'political_stability': self.political_stability,
            'status': self.status,
            'order_index': self.order_index,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


# ==================== 任务4：历史脉络模块 ====================

class HistoricalEra(db.Model):
    """历史纪元表 - 划分大的历史时期"""
    __tablename__ = 'historical_eras'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    world_id = db.Column(db.Integer, db.ForeignKey('worlds.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    start_year = db.Column(db.String(100), default='')  # 开始年份，可自定义纪年
    end_year = db.Column(db.String(100), default='')  # 结束年份
    duration_description = db.Column(db.Text, default='')  # 持续时间描述
    main_characteristics = db.Column(db.Text, default='')  # 时代特征
    key_technologies = db.Column(db.Text, default='')  # 关键技术
    dominant_civilizations = db.Column(db.Text, default='')  # 主导文明
    ending_cause = db.Column(db.Text, default='')  # 结束原因
    legacy_impact = db.Column(db.Text, default='')  # 遗留影响
    description = db.Column(db.Text, default='')
    order_index = db.Column(db.Integer, default=0)
    status = db.Column(db.String(50), default='active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'world_id': self.world_id,
            'name': self.name,
            'start_year': self.start_year,
            'end_year': self.end_year,
            'duration_description': self.duration_description,
            'main_characteristics': self.main_characteristics,
            'key_technologies': self.key_technologies,
            'dominant_civilizations': self.dominant_civilizations,
            'ending_cause': self.ending_cause,
            'legacy_impact': self.legacy_impact,
            'description': self.description,
            'order_index': self.order_index,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class HistoricalEvent(db.Model):
    """历史事件表 - 具体的历史事件"""
    __tablename__ = 'historical_events'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    world_id = db.Column(db.Integer, db.ForeignKey('worlds.id'), nullable=False)
    era_id = db.Column(db.Integer, db.ForeignKey('historical_eras.id'), nullable=True)
    name = db.Column(db.String(255), nullable=False)
    event_type = db.Column(db.String(100), default='战争')  # 战争/灾难/发现/发明/条约/革命
    description = db.Column(db.Text, default='')
    start_year = db.Column(db.String(100), default='')  # 开始年份
    end_year = db.Column(db.String(100), default='')  # 结束年份
    location_ids = db.Column(db.Text, default='')  # 发生地点ID列表JSON
    primary_causes = db.Column(db.Text, default='')  # 主要原因
    key_participants = db.Column(db.Text, default='')  # 主要参与者
    event_sequence = db.Column(db.Text, default='')  # 事件过程
    immediate_outcomes = db.Column(db.Text, default='')  # 直接结果
    long_term_consequences = db.Column(db.Text, default='')  # 长期影响
    historical_significance = db.Column(db.Text, default='')  # 历史意义
    conflicting_accounts = db.Column(db.Text, default='')  # 矛盾记载
    importance_level = db.Column(db.Integer, default=5)  # 重要性1-10
    status = db.Column(db.String(50), default='active')
    order_index = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'world_id': self.world_id,
            'era_id': self.era_id,
            'name': self.name,
            'event_type': self.event_type,
            'description': self.description,
            'start_year': self.start_year,
            'end_year': self.end_year,
            'location_ids': self.location_ids,
            'primary_causes': self.primary_causes,
            'key_participants': self.key_participants,
            'event_sequence': self.event_sequence,
            'immediate_outcomes': self.immediate_outcomes,
            'long_term_consequences': self.long_term_consequences,
            'historical_significance': self.historical_significance,
            'conflicting_accounts': self.conflicting_accounts,
            'importance_level': self.importance_level,
            'status': self.status,
            'order_index': self.order_index,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class HistoricalFigure(db.Model):
    """历史人物表 - 历史上有记载的人物"""
    __tablename__ = 'historical_figures'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    world_id = db.Column(db.Integer, db.ForeignKey('worlds.id'), nullable=False)
    civilization_id = db.Column(db.Integer, db.ForeignKey('civilizations.id'), nullable=True)
    character_id = db.Column(db.Integer, db.ForeignKey('character.id'), nullable=True)  # 关联角色
    name = db.Column(db.String(255), nullable=False)
    birth_year = db.Column(db.String(100), default='')  # 出生年份
    death_year = db.Column(db.String(100), default='')  # 死亡年份
    birth_place_id = db.Column(db.Integer, default=None)  # 出生地
    death_place_id = db.Column(db.Integer, default=None)  # 死亡地
    primary_role = db.Column(db.String(100), default='')  # 主要身份：统治者/将军/学者/艺术家
    social_class = db.Column(db.String(100), default='')  # 社会阶级
    key_achievements = db.Column(db.Text, default='')  # 主要成就
    controversies = db.Column(db.Text, default='')  # 争议
    historical_legacy = db.Column(db.Text, default='')  # 历史遗产
    description = db.Column(db.Text, default='')
    importance_level = db.Column(db.Integer, default=5)  # 重要性1-10
    status = db.Column(db.String(50), default='active')
    order_index = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'world_id': self.world_id,
            'civilization_id': self.civilization_id,
            'character_id': self.character_id,
            'name': self.name,
            'birth_year': self.birth_year,
            'death_year': self.death_year,
            'birth_place_id': self.birth_place_id,
            'death_place_id': self.death_place_id,
            'primary_role': self.primary_role,
            'social_class': self.social_class,
            'key_achievements': self.key_achievements,
            'controversies': self.controversies,
            'historical_legacy': self.historical_legacy,
            'description': self.description,
            'importance_level': self.importance_level,
            'status': self.status,
            'order_index': self.order_index,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class EventParticipant(db.Model):
    """事件-人物关联表 - 多对多，记录人物在事件中的角色"""
    __tablename__ = 'event_participants'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column(db.Integer, db.ForeignKey('historical_events.id'), nullable=False)
    figure_id = db.Column(db.Integer, db.ForeignKey('historical_figures.id'), nullable=False)
    role_type = db.Column(db.String(100), default='参与者')  # 领导者/参与者/反对者/受害者/旁观者
    contribution_level = db.Column(db.Integer, default=5)  # 贡献程度1-10
    motivation = db.Column(db.Text, default='')  # 动机
    outcome_for_participant = db.Column(db.Text, default='')  # 对参与者的结果
    description = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'event_id': self.event_id,
            'figure_id': self.figure_id,
            'role_type': self.role_type,
            'contribution_level': self.contribution_level,
            'motivation': self.motivation,
            'outcome_for_participant': self.outcome_for_participant,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


# ==================== 任务5：标签与关系系统 ====================

class Tag(db.Model):
    """标签表 - 用于分类和检索"""
    __tablename__ = 'tags'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    world_id = db.Column(db.Integer, db.ForeignKey('worlds.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    tag_type = db.Column(db.String(100), default='通用')  # 通用/角色/地点/物品/事件
    description = db.Column(db.Text, default='')
    color = db.Column(db.String(50), default='#1890ff')  # 标签颜色
    usage_count = db.Column(db.Integer, default=0)  # 使用次数
    status = db.Column(db.String(50), default='active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'world_id': self.world_id,
            'name': self.name,
            'tag_type': self.tag_type,
            'description': self.description,
            'color': self.color,
            'usage_count': self.usage_count,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class EntityTag(db.Model):
    """实体标签关联表 - 多对多关联"""
    __tablename__ = 'entity_tags'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    tag_id = db.Column(db.Integer, db.ForeignKey('tags.id'), nullable=False)
    entity_type = db.Column(db.String(50), nullable=False)  # character/location/item/event等
    entity_id = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'tag_id': self.tag_id,
            'entity_type': self.entity_type,
            'entity_id': self.entity_id,
            'created_at': self.created_at.isoformat()
        }


class EntityRelation(db.Model):
    """实体关系表 - 通用关系网络"""
    __tablename__ = 'entity_relations'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    world_id = db.Column(db.Integer, db.ForeignKey('worlds.id'), nullable=False)
    source_type = db.Column(db.String(50), nullable=False)  # character/location/item等
    source_id = db.Column(db.Integer, nullable=False)
    target_type = db.Column(db.String(50), nullable=False)
    target_id = db.Column(db.Integer, nullable=False)
    relation_type = db.Column(db.String(100), nullable=False)  # 关系类型：友谊/敌对/师徒等
    strength = db.Column(db.Integer, default=5)  # 关系强度1-10
    description = db.Column(db.Text, default='')
    is_bidirectional = db.Column(db.Boolean, default=True)  # 是否双向关系
    status = db.Column(db.String(50), default='active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'world_id': self.world_id,
            'source_type': self.source_type,
            'source_id': self.source_id,
            'target_type': self.target_type,
            'target_id': self.target_id,
            'relation_type': self.relation_type,
            'strength': self.strength,
            'description': self.description,
            'is_bidirectional': self.is_bidirectional,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
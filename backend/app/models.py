from app import db
from datetime import datetime

class World(db.Model):
    __tablename__ = 'worlds'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
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
            'name': self.name,
            'core_concept': self.core_concept,
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
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
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
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
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
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
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

class EnergySystem(db.Model):
    __tablename__ = 'energy_system'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    energy_types = db.Column(db.Text, default='')
    energy_sources = db.Column(db.Text, default='')
    energy_cycle = db.Column(db.Text, default='')
    energy_levels = db.Column(db.Text, default='')
    ability_classification = db.Column(db.Text, default='')
    usage_principles = db.Column(db.Text, default='')
    ability_limits = db.Column(db.Text, default='')
    advancement_paths = db.Column(db.Text, default='')
    basic_laws = db.Column(db.Text, default='')
    taboos_and_costs = db.Column(db.Text, default='')
    law_conflicts = db.Column(db.Text, default='')
    world_balance = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'energy_types': self.energy_types,
            'energy_sources': self.energy_sources,
            'energy_cycle': self.energy_cycle,
            'energy_levels': self.energy_levels,
            'ability_classification': self.ability_classification,
            'usage_principles': self.usage_principles,
            'ability_limits': self.ability_limits,
            'advancement_paths': self.advancement_paths,
            'basic_laws': self.basic_laws,
            'taboos_and_costs': self.taboos_and_costs,
            'law_conflicts': self.law_conflicts,
            'world_balance': self.world_balance,
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
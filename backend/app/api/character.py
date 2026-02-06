from flask import jsonify, request
from app import db
from app.models import Character, Project, CharacterBackground, CharacterAbilityDetail
from app.api import api_bp

@api_bp.route('/characters', methods=['GET'])
def get_characters():
    project_id = request.args.get('project_id')
    world_id = request.args.get('world_id')
    query = Character.query
    
    if project_id:
        query = query.filter_by(project_id=project_id)
    if world_id:
        query = query.filter_by(world_id=world_id)
    
    characters = query.all()
    return jsonify([character.to_dict() for character in characters])

@api_bp.route('/characters/<int:character_id>', methods=['GET'])
def get_character(character_id):
    character = Character.query.get_or_404(character_id)
    result = character.to_dict()
    
    # 获取角色的背景故事
    backgrounds = CharacterBackground.query.filter_by(character_id=character_id).all()
    result['backgrounds'] = [bg.to_dict() for bg in backgrounds]
    
    # 获取角色的能力详情
    abilities = CharacterAbilityDetail.query.filter_by(character_id=character_id).all()
    result['abilities'] = [ability.to_dict() for ability in abilities]
    
    return jsonify(result)

@api_bp.route('/characters', methods=['POST'])
def create_character():
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
        new_character = Character(
            name=data['name'],
            world_id=data.get('world_id'),
            alternative_names=data.get('alternative_names', ''),
            character_type=data.get('character_type', '配角'),
            role_type=data.get('role_type', '配角'),
            status=data.get('status', '存活'),
            importance_level=data.get('importance_level', 5),
            race=data.get('race', ''),
            gender=data.get('gender', ''),
            age=data.get('age', 0),
            birth_date=data.get('birth_date', ''),
            death_date=data.get('death_date', ''),
            appearance=data.get('appearance', ''),
            appearance_age=data.get('appearance_age', 0),
            distinguishing_features=data.get('distinguishing_features', ''),
            personality=data.get('personality', ''),
            background=data.get('background', ''),
            character_arc=data.get('character_arc', ''),
            motivation=data.get('motivation', ''),
            secrets=data.get('secrets', ''),
            birthplace=data.get('birthplace', ''),
            nationality=data.get('nationality', ''),
            occupation=data.get('occupation', ''),
            faction=data.get('faction', ''),
            current_location=data.get('current_location', ''),
            core_traits=data.get('core_traits', ''),
            psychological_fear=data.get('psychological_fear', ''),
            values=data.get('values', ''),
            growth_experience=data.get('growth_experience', ''),
            important_turning_points=data.get('important_turning_points', ''),
            psychological_trauma=data.get('psychological_trauma', ''),
            physical_abilities=data.get('physical_abilities', ''),
            intelligence_perception=data.get('intelligence_perception', ''),
            special_talents=data.get('special_talents', ''),
            current_level=data.get('current_level', ''),
            special_abilities=data.get('special_abilities', ''),
            ability_levels=data.get('ability_levels', ''),
            ability_limits=data.get('ability_limits', ''),
            growth_path=data.get('growth_path', ''),
            common_equipment=data.get('common_equipment', ''),
            special_items=data.get('special_items', ''),
            personal_items=data.get('personal_items', ''),
            key_items=data.get('key_items', ''),
            family_members=data.get('family_members', ''),
            family_background=data.get('family_background', ''),
            close_friends=data.get('close_friends', ''),
            mentor_student=data.get('mentor_student', ''),
            colleagues=data.get('colleagues', ''),
            grudges=data.get('grudges', ''),
            love_relationships=data.get('love_relationships', ''),
            complex_emotions=data.get('complex_emotions', ''),
            unrequited_love=data.get('unrequited_love', ''),
            emotional_changes=data.get('emotional_changes', ''),
            project_id=data['project_id']
        )
        db.session.add(new_character)
        db.session.commit()
        
        # 创建背景故事
        if 'backgrounds' in data and data['backgrounds']:
            for bg_data in data['backgrounds']:
                background = CharacterBackground(
                    character_id=new_character.id,
                    period_name=bg_data.get('period_name', ''),
                    start_age=bg_data.get('start_age', 0),
                    end_age=bg_data.get('end_age', 0),
                    key_events=bg_data.get('key_events', ''),
                    influential_people=bg_data.get('influential_people', ''),
                    traumas=bg_data.get('traumas', ''),
                    turning_points=bg_data.get('turning_points', ''),
                    core_memory=bg_data.get('core_memory', ''),
                    description=bg_data.get('description', '')
                )
                db.session.add(background)
        
        # 创建能力详情
        if 'abilities' in data and data['abilities']:
            for ability_data in data['abilities']:
                ability = CharacterAbilityDetail(
                    character_id=new_character.id,
                    ability_type=ability_data.get('ability_type', ''),
                    ability_name=ability_data.get('ability_name', ''),
                    proficiency_level=ability_data.get('proficiency_level', '入门'),
                    acquired_age=ability_data.get('acquired_age', 0),
                    acquired_method=ability_data.get('acquired_method', ''),
                    usage_restrictions=ability_data.get('usage_restrictions', ''),
                    is_signature=ability_data.get('is_signature', False),
                    description=ability_data.get('description', '')
                )
                db.session.add(ability)
        
        db.session.commit()
        print(f'创建成功，ID: {new_character.id}')
        return jsonify(new_character.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        print(f'创建失败: {str(e)}')
        return jsonify({'error': str(e)}), 500

@api_bp.route('/characters/<int:character_id>', methods=['PUT'])
def update_character(character_id):
    character = Character.query.get_or_404(character_id)
    data = request.get_json()
    
    # 更新基本字段
    character.name = data.get('name', character.name)
    character.world_id = data.get('world_id', character.world_id)
    character.alternative_names = data.get('alternative_names', character.alternative_names)
    character.character_type = data.get('character_type', character.character_type)
    character.role_type = data.get('role_type', character.role_type)
    character.status = data.get('status', character.status)
    character.importance_level = data.get('importance_level', character.importance_level)
    character.race = data.get('race', character.race)
    character.gender = data.get('gender', character.gender)
    character.age = data.get('age', character.age)
    character.birth_date = data.get('birth_date', character.birth_date)
    character.death_date = data.get('death_date', character.death_date)
    character.appearance = data.get('appearance', character.appearance)
    character.appearance_age = data.get('appearance_age', character.appearance_age)
    character.distinguishing_features = data.get('distinguishing_features', character.distinguishing_features)
    character.personality = data.get('personality', character.personality)
    character.background = data.get('background', character.background)
    character.character_arc = data.get('character_arc', character.character_arc)
    character.motivation = data.get('motivation', character.motivation)
    character.secrets = data.get('secrets', character.secrets)
    character.birthplace = data.get('birthplace', character.birthplace)
    character.nationality = data.get('nationality', character.nationality)
    character.occupation = data.get('occupation', character.occupation)
    character.faction = data.get('faction', character.faction)
    character.current_location = data.get('current_location', character.current_location)
    character.core_traits = data.get('core_traits', character.core_traits)
    character.psychological_fear = data.get('psychological_fear', character.psychological_fear)
    character.values = data.get('values', character.values)
    character.growth_experience = data.get('growth_experience', character.growth_experience)
    character.important_turning_points = data.get('important_turning_points', character.important_turning_points)
    character.psychological_trauma = data.get('psychological_trauma', character.psychological_trauma)
    character.physical_abilities = data.get('physical_abilities', character.physical_abilities)
    character.intelligence_perception = data.get('intelligence_perception', character.intelligence_perception)
    character.special_talents = data.get('special_talents', character.special_talents)
    character.current_level = data.get('current_level', character.current_level)
    character.special_abilities = data.get('special_abilities', character.special_abilities)
    character.ability_levels = data.get('ability_levels', character.ability_levels)
    character.ability_limits = data.get('ability_limits', character.ability_limits)
    character.growth_path = data.get('growth_path', character.growth_path)
    character.common_equipment = data.get('common_equipment', character.common_equipment)
    character.special_items = data.get('special_items', character.special_items)
    character.personal_items = data.get('personal_items', character.personal_items)
    character.key_items = data.get('key_items', character.key_items)
    character.family_members = data.get('family_members', character.family_members)
    character.family_background = data.get('family_background', character.family_background)
    character.close_friends = data.get('close_friends', character.close_friends)
    character.mentor_student = data.get('mentor_student', character.mentor_student)
    character.colleagues = data.get('colleagues', character.colleagues)
    character.grudges = data.get('grudges', character.grudges)
    character.love_relationships = data.get('love_relationships', character.love_relationships)
    character.complex_emotions = data.get('complex_emotions', character.complex_emotions)
    character.unrequited_love = data.get('unrequited_love', character.unrequited_love)
    character.emotional_changes = data.get('emotional_changes', character.emotional_changes)
    
    # 更新背景故事
    if 'backgrounds' in data:
        # 删除旧的背景故事
        CharacterBackground.query.filter_by(character_id=character_id).delete()
        # 创建新的背景故事
        for bg_data in data['backgrounds']:
            background = CharacterBackground(
                character_id=character_id,
                period_name=bg_data.get('period_name', ''),
                start_age=bg_data.get('start_age', 0),
                end_age=bg_data.get('end_age', 0),
                key_events=bg_data.get('key_events', ''),
                influential_people=bg_data.get('influential_people', ''),
                traumas=bg_data.get('traumas', ''),
                turning_points=bg_data.get('turning_points', ''),
                core_memory=bg_data.get('core_memory', ''),
                description=bg_data.get('description', '')
            )
            db.session.add(background)
    
    # 更新能力详情
    if 'abilities' in data:
        # 删除旧的能力详情
        CharacterAbilityDetail.query.filter_by(character_id=character_id).delete()
        # 创建新的能力详情
        for ability_data in data['abilities']:
            ability = CharacterAbilityDetail(
                character_id=character_id,
                ability_type=ability_data.get('ability_type', ''),
                ability_name=ability_data.get('ability_name', ''),
                proficiency_level=ability_data.get('proficiency_level', '入门'),
                acquired_age=ability_data.get('acquired_age', 0),
                acquired_method=ability_data.get('acquired_method', ''),
                usage_restrictions=ability_data.get('usage_restrictions', ''),
                is_signature=ability_data.get('is_signature', False),
                description=ability_data.get('description', '')
            )
            db.session.add(ability)
    
    db.session.commit()
    return jsonify(character.to_dict())

@api_bp.route('/characters/<int:character_id>', methods=['DELETE'])
def delete_character(character_id):
    character = Character.query.get_or_404(character_id)
    
    # 删除相关的背景故事和能力详情
    CharacterBackground.query.filter_by(character_id=character_id).delete()
    CharacterAbilityDetail.query.filter_by(character_id=character_id).delete()
    
    db.session.delete(character)
    db.session.commit()
    return jsonify({'message': 'Character deleted successfully'}), 200

# 角色背景故事API
@api_bp.route('/characters/<int:character_id>/backgrounds', methods=['GET'])
def get_character_backgrounds(character_id):
    backgrounds = CharacterBackground.query.filter_by(character_id=character_id).all()
    return jsonify([bg.to_dict() for bg in backgrounds])

@api_bp.route('/characters/<int:character_id>/backgrounds', methods=['POST'])
def add_character_background(character_id):
    data = request.get_json()
    background = CharacterBackground(
        character_id=character_id,
        period_name=data.get('period_name', ''),
        start_age=data.get('start_age', 0),
        end_age=data.get('end_age', 0),
        key_events=data.get('key_events', ''),
        influential_people=data.get('influential_people', ''),
        traumas=data.get('traumas', ''),
        turning_points=data.get('turning_points', ''),
        core_memory=data.get('core_memory', ''),
        description=data.get('description', '')
    )
    db.session.add(background)
    db.session.commit()
    return jsonify(background.to_dict()), 201

# 角色能力详情API
@api_bp.route('/characters/<int:character_id>/abilities', methods=['GET'])
def get_character_abilities(character_id):
    abilities = CharacterAbilityDetail.query.filter_by(character_id=character_id).all()
    return jsonify([ability.to_dict() for ability in abilities])

@api_bp.route('/characters/<int:character_id>/abilities', methods=['POST'])
def add_character_ability(character_id):
    data = request.get_json()
    ability = CharacterAbilityDetail(
        character_id=character_id,
        ability_type=data.get('ability_type', ''),
        ability_name=data.get('ability_name', ''),
        proficiency_level=data.get('proficiency_level', '入门'),
        acquired_age=data.get('acquired_age', 0),
        acquired_method=data.get('acquired_method', ''),
        usage_restrictions=data.get('usage_restrictions', ''),
        is_signature=data.get('is_signature', False),
        description=data.get('description', '')
    )
    db.session.add(ability)
    db.session.commit()
    return jsonify(ability.to_dict()), 201

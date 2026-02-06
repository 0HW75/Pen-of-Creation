from flask import jsonify, request
from app import db
from app.models import Character, Project
from app.api import api_bp

@api_bp.route('/characters', methods=['GET'])
def get_characters():
    project_id = request.args.get('project_id')
    if project_id:
        characters = Character.query.filter_by(project_id=project_id).all()
    else:
        characters = Character.query.all()
    return jsonify([character.to_dict() for character in characters])

@api_bp.route('/characters/<int:character_id>', methods=['GET'])
def get_character(character_id):
    character = Character.query.get_or_404(character_id)
    return jsonify(character.to_dict())

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
            character_type=data.get('character_type', '配角'),
            status=data.get('status', '存活'),
            race=data.get('race', ''),
            gender=data.get('gender', ''),
            age=data.get('age', 0),
            appearance=data.get('appearance', ''),
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
        print(f'创建成功，ID: {new_character.id}')
        return jsonify(new_character.to_dict()), 201
    except Exception as e:
        print(f'创建失败: {str(e)}')
        return jsonify({'error': str(e)}), 500

@api_bp.route('/characters/<int:character_id>', methods=['PUT'])
def update_character(character_id):
    character = Character.query.get_or_404(character_id)
    data = request.get_json()
    character.name = data.get('name', character.name)
    character.character_type = data.get('character_type', character.character_type)
    character.status = data.get('status', character.status)
    character.race = data.get('race', character.race)
    character.gender = data.get('gender', character.gender)
    character.age = data.get('age', character.age)
    character.appearance = data.get('appearance', character.appearance)
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
    db.session.commit()
    return jsonify(character.to_dict())

@api_bp.route('/characters/<int:character_id>', methods=['DELETE'])
def delete_character(character_id):
    character = Character.query.get_or_404(character_id)
    db.session.delete(character)
    db.session.commit()
    return jsonify({'message': 'Character deleted successfully'}), 200
from flask import jsonify, request
from app import db
from app.models import CharacterTrait, CharacterAbility, CharacterRelationship, Project
from app.api import api_bp

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
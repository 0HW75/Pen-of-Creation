from flask import jsonify, request
from app import db
from app.models import FactionStructure, FactionGoal, Project
from app.api import api_bp

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
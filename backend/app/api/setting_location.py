from flask import jsonify, request
from app import db
from app.models import LocationStructure, SpecialLocation, Project
from app.api import api_bp

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
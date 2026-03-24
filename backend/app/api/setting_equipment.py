from flask import jsonify, request
from app import db
from app.models import EquipmentSystem, SpecialItem, Project
from app.api import api_bp

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
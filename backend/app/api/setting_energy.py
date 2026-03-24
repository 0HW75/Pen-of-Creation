from flask import jsonify, request
from app import db
from app.models import EnergySystem, World
from app.api import api_bp

@api_bp.route('/settings/energy', methods=['GET'])
def get_energy_systems():
    world_id = request.args.get('world_id')
    if world_id:
        systems = EnergySystem.query.filter_by(world_id=world_id).all()
    else:
        systems = EnergySystem.query.all()
    return jsonify([system.to_dict() for system in systems])

@api_bp.route('/settings/energy/<int:system_id>', methods=['GET'])
def get_energy_system(system_id):
    system = EnergySystem.query.get_or_404(system_id)
    return jsonify(system.to_dict())

@api_bp.route('/settings/energy', methods=['POST'])
def create_energy_system():
    try:
        data = request.get_json()
        print(f'[create_energy_system] 接收到的数据: {data}')

        if not data or 'world_id' not in data:
            return jsonify({'error': 'Missing world_id'}), 400

        world = World.query.get(data['world_id'])
        if not world:
            print(f'[create_energy_system] 世界不存在: {data["world_id"]}')
            return jsonify({'error': f'World {data["world_id"]} not found'}), 404

        new_system = EnergySystem(
            world_id=data['world_id'],
            name=data.get('name', ''),
            energy_type=data.get('energy_type', '魔法'),
            description=data.get('description', ''),
            source=data.get('source', ''),
            acquisition_method=data.get('acquisition_method', ''),
            storage_method=data.get('storage_method', ''),
            usage_limitations=data.get('usage_limitations', ''),
            common_applications=data.get('common_applications', ''),
            rarity=data.get('rarity', '常见'),
            stability=data.get('stability', '稳定'),
            interaction_with_other_energies=data.get('interaction_with_other_energies', ''),
            cultivation_method=data.get('cultivation_method', ''),
            typical_manifestations=data.get('typical_manifestations', '')
        )
        db.session.add(new_system)
        db.session.commit()
        print(f'[create_energy_system] 能量体系创建成功: {new_system.id}')
        return jsonify(new_system.to_dict()), 201
    except Exception as e:
        print(f'[create_energy_system] 错误: {str(e)}')
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@api_bp.route('/settings/energy/<int:system_id>', methods=['PUT'])
def update_energy_system(system_id):
    system = EnergySystem.query.get_or_404(system_id)
    data = request.get_json()
    system.name = data.get('name', system.name)
    system.energy_type = data.get('energy_type', system.energy_type)
    system.description = data.get('description', system.description)
    system.source = data.get('source', system.source)
    system.acquisition_method = data.get('acquisition_method', system.acquisition_method)
    system.storage_method = data.get('storage_method', system.storage_method)
    system.usage_limitations = data.get('usage_limitations', system.usage_limitations)
    system.common_applications = data.get('common_applications', system.common_applications)
    system.rarity = data.get('rarity', system.rarity)
    system.stability = data.get('stability', system.stability)
    system.interaction_with_other_energies = data.get('interaction_with_other_energies', system.interaction_with_other_energies)
    system.cultivation_method = data.get('cultivation_method', system.cultivation_method)
    system.typical_manifestations = data.get('typical_manifestations', system.typical_manifestations)
    db.session.commit()
    return jsonify(system.to_dict())

@api_bp.route('/settings/energy/<int:system_id>', methods=['DELETE'])
def delete_energy_system(system_id):
    system = EnergySystem.query.get_or_404(system_id)
    db.session.delete(system)
    db.session.commit()
    return jsonify({'message': 'Energy system deleted successfully'}), 200
from flask import jsonify, request
from app import db
from app.models import WorldSetting, Project, World
from app.api import api_bp

@api_bp.route('/settings/world', methods=['GET'])
def get_world_settings():
    try:
        project_id = request.args.get('project_id')
        print(f'获取世界设定，project_id: {project_id}')
        if project_id:
            settings = WorldSetting.query.filter_by(project_id=project_id).all()
        else:
            settings = WorldSetting.query.all()
        print(f'获取到世界设定数量: {len(settings)}')
        return jsonify([setting.to_dict() for setting in settings])
    except Exception as e:
        print(f'获取世界设定失败: {str(e)}')
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@api_bp.route('/settings/world/<int:setting_id>', methods=['GET'])
def get_world_setting(setting_id):
    setting = WorldSetting.query.get_or_404(setting_id)
    return jsonify(setting.to_dict())

@api_bp.route('/settings/world', methods=['POST'])
def create_world_setting():
    try:
        print('接收到创建世界设定的请求...')
        data = request.get_json()
        print(f'接收到的数据: {data}')
        project = Project.query.get_or_404(data['project_id'])
        print(f'找到项目: {project.title}')
        new_setting = WorldSetting(
            project_id=data['project_id'],
            name=data['name'],
            description=data.get('description', ''),
            world_type=data.get('world_type', '单一世界'),
            creation_origin=data.get('creation_origin', ''),
            world_essence=data.get('world_essence', ''),
            spatial_hierarchy=data.get('spatial_hierarchy', ''),
            world_map=data.get('world_map', ''),
            main_regions=data.get('main_regions', ''),
            time_system=data.get('time_system', ''),
            spatial_properties=data.get('spatial_properties', ''),
            physical_laws=data.get('physical_laws', ''),
            special_rules=data.get('special_rules', '')
        )
        db.session.add(new_setting)
        db.session.commit()
        print(f'创建世界设定成功，ID: {new_setting.id}')
        return jsonify(new_setting.to_dict()), 201
    except Exception as e:
        print(f'创建世界设定失败: {str(e)}')
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@api_bp.route('/settings/world/<int:setting_id>', methods=['PUT'])
def update_world_setting(setting_id):
    setting = WorldSetting.query.get_or_404(setting_id)
    data = request.get_json()
    setting.name = data.get('name', setting.name)
    setting.description = data.get('description', setting.description)
    setting.world_type = data.get('world_type', setting.world_type)
    setting.creation_origin = data.get('creation_origin', setting.creation_origin)
    setting.world_essence = data.get('world_essence', setting.world_essence)
    setting.spatial_hierarchy = data.get('spatial_hierarchy', setting.spatial_hierarchy)
    setting.world_map = data.get('world_map', setting.world_map)
    setting.main_regions = data.get('main_regions', setting.main_regions)
    setting.time_system = data.get('time_system', setting.time_system)
    setting.spatial_properties = data.get('spatial_properties', setting.spatial_properties)
    setting.physical_laws = data.get('physical_laws', setting.physical_laws)
    setting.special_rules = data.get('special_rules', setting.special_rules)
    db.session.commit()
    return jsonify(setting.to_dict())

@api_bp.route('/settings/world/<int:setting_id>', methods=['DELETE'])
def delete_world_setting(setting_id):
    setting = WorldSetting.query.get_or_404(setting_id)
    db.session.delete(setting)
    db.session.commit()
    return jsonify({'message': 'World setting deleted successfully'}), 200
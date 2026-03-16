from flask import jsonify, request
from app import db
from app.models import Item, Project
from app.api import api_bp
from app.services.chapter_appearance_service import chapter_appearance_service

@api_bp.route('/items', methods=['GET'])
def get_items():
    project_id = request.args.get('project_id')
    world_id = request.args.get('world_id')
    query = Item.query
    if project_id:
        query = query.filter_by(project_id=project_id)
    if world_id:
        query = query.filter_by(world_id=world_id)
    items = query.all()
    return jsonify([item.to_dict() for item in items])

@api_bp.route('/items/<int:item_id>', methods=['GET'])
def get_item(item_id):
    item = Item.query.get_or_404(item_id)
    return jsonify(item.to_dict())

@api_bp.route('/items', methods=['POST'])
def create_item():
    try:
        data = request.get_json()
        print(f'[create_item] 接收到的数据: {data}')
        
        if not data or 'project_id' not in data:
            return jsonify({'error': 'Missing project_id'}), 400
            
        project = Project.query.get(data['project_id'])
        if not project:
            print(f'[create_item] 项目不存在: {data["project_id"]}')
            return jsonify({'error': f'Project {data["project_id"]} not found'}), 404
            
        new_item = Item(
            name=data['name'],
            item_type=data.get('item_type', '普通'),
            rarity_level=data.get('rarity_level', '普通'),
            physical_properties=data.get('physical_properties', ''),
            special_effects=data.get('special_effects', ''),
            usage_requirements=data.get('usage_requirements', ''),
            durability=data.get('durability', 100),
            creator=data.get('creator', ''),
            source=data.get('source', ''),
            historical_heritage=data.get('historical_heritage', ''),
            current_owner=data.get('current_owner', ''),
            acquisition_method=data.get('acquisition_method', ''),
            importance=data.get('importance', 0),
            project_id=data['project_id'],
            world_id=data.get('world_id')
        )
        db.session.add(new_item)
        db.session.commit()
        
        if 'source_chapters' in data and data['source_chapters'] and data.get('project_id'):
            chapter_appearance_service.create_appearances_from_source(
                project_id=data['project_id'],
                entity_type='item',
                entity_id=new_item.id,
                source_chapters=data['source_chapters'],
                appearance_type='首次出现'
            )
        
        print(f'[create_item] 物品创建成功: {new_item.id}')
        return jsonify(new_item.to_dict()), 201
    except Exception as e:
        print(f'[create_item] 错误: {str(e)}')
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@api_bp.route('/items/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    item = Item.query.get_or_404(item_id)
    data = request.get_json()
    item.name = data.get('name', item.name)
    item.item_type = data.get('item_type', item.item_type)
    item.rarity_level = data.get('rarity_level', item.rarity_level)
    item.physical_properties = data.get('physical_properties', item.physical_properties)
    item.special_effects = data.get('special_effects', item.special_effects)
    item.usage_requirements = data.get('usage_requirements', item.usage_requirements)
    item.durability = data.get('durability', item.durability)
    item.creator = data.get('creator', item.creator)
    item.source = data.get('source', item.source)
    item.historical_heritage = data.get('historical_heritage', item.historical_heritage)
    item.current_owner = data.get('current_owner', item.current_owner)
    item.acquisition_method = data.get('acquisition_method', item.acquisition_method)
    item.importance = data.get('importance', item.importance)
    if 'world_id' in data:
        item.world_id = data['world_id']
    db.session.commit()
    return jsonify(item.to_dict())

@api_bp.route('/items/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    item = Item.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.commit()
    return jsonify({'message': 'Item deleted successfully'}), 200
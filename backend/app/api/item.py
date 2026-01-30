from flask import jsonify, request
from app import db
from app.models import Item, Project
from app.api import api_bp

@api_bp.route('/items', methods=['GET'])
def get_items():
    project_id = request.args.get('project_id')
    if project_id:
        items = Item.query.filter_by(project_id=project_id).all()
    else:
        items = Item.query.all()
    return jsonify([item.to_dict() for item in items])

@api_bp.route('/items/<int:item_id>', methods=['GET'])
def get_item(item_id):
    item = Item.query.get_or_404(item_id)
    return jsonify(item.to_dict())

@api_bp.route('/items', methods=['POST'])
def create_item():
    data = request.get_json()
    project = Project.query.get_or_404(data['project_id'])
    new_item = Item(
        name=data['name'],
        description=data.get('description', ''),
        type=data.get('type', '普通'),
        importance=data.get('importance', 0),
        project_id=data['project_id']
    )
    db.session.add(new_item)
    db.session.commit()
    return jsonify(new_item.to_dict()), 201

@api_bp.route('/items/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    item = Item.query.get_or_404(item_id)
    data = request.get_json()
    item.name = data.get('name', item.name)
    item.description = data.get('description', item.description)
    item.type = data.get('type', item.type)
    item.importance = data.get('importance', item.importance)
    db.session.commit()
    return jsonify(item.to_dict())

@api_bp.route('/items/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    item = Item.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.commit()
    return jsonify({'message': 'Item deleted successfully'}), 200
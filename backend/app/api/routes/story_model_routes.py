from app.api import api_bp
from app import db
from app.models import StoryModel

@api_bp.route('/story-models', methods=['GET'])
def get_story_models():
    models = StoryModel.query.all()
    return jsonify([model.to_dict() for model in models])

@api_bp.route('/story-models/<int:id>', methods=['GET'])
def get_story_model(id):
    model = StoryModel.query.get(id)
    if not model:
        return jsonify({'error': 'Story model not found'}), 404
    return jsonify(model.to_dict())

@api_bp.route('/story-models', methods=['POST'])
def create_story_model():
    data = request.json

    existing = StoryModel.query.filter_by(key=data['key']).first()
    if existing:
        return jsonify({'error': 'Story model with this key already exists'}), 400

    new_model = StoryModel(
        key=data['key'],
        name=data['name'],
        description=data.get('description', ''),
        is_default=data.get('is_default', False)
    )
    db.session.add(new_model)
    db.session.commit()
    return jsonify(new_model.to_dict()), 201

@api_bp.route('/story-models/<int:id>', methods=['PUT'])
def update_story_model(id):
    model = StoryModel.query.get(id)
    if not model:
        return jsonify({'error': 'Story model not found'}), 404

    data = request.json
    if 'key' in data and data['key'] != model.key:
        existing = StoryModel.query.filter_by(key=data['key']).first()
        if existing:
            return jsonify({'error': 'Story model with this key already exists'}), 400

    model.key = data.get('key', model.key)
    model.name = data.get('name', model.name)
    model.description = data.get('description', model.description)
    model.is_default = data.get('is_default', model.is_default)

    db.session.commit()
    return jsonify(model.to_dict())

@api_bp.route('/story-models/<int:id>', methods=['DELETE'])
def delete_story_model(id):
    model = StoryModel.query.get(id)
    if not model:
        return jsonify({'error': 'Story model not found'}), 404

    if model.is_default:
        return jsonify({'error': 'Cannot delete default story model'}), 400

    db.session.delete(model)
    db.session.commit()
    return jsonify({'message': 'Story model deleted successfully'})

@api_bp.route('/story-models/init', methods=['POST'])
def init_default_story_models():
    default_models = [
        {'key': 'hero_journey', 'name': '英雄之旅', 'description': '约瑟夫·坎贝尔的英雄之旅模板，包含启程、启蒙、回归三个阶段', 'is_default': True},
        {'key': 'three_act', 'name': '三幕结构', 'description': '传统戏剧结构，包含开端、发展、高潮和结局', 'is_default': True},
        {'key': 'save_the_cat', 'name': '救猫咪', 'description': '布莱克·斯奈德的编剧模板，强调故事节拍和情感共鸣', 'is_default': True},
        {'key': 'freytags_pyramid', 'name': '弗莱塔格金字塔', 'description': '古斯塔夫·弗莱塔格的五幕结构： exposition、rising action、climax、falling action、resolution', 'is_default': True},
        {'key': 'campbell', 'name': '坎贝尔神话', 'description': '基于约瑟夫·坎贝尔的神话学研究，探索普遍的神话原型', 'is_default': True}
    ]

    created_models = []
    for model_data in default_models:
        existing = StoryModel.query.filter_by(key=model_data['key']).first()
        if not existing:
            new_model = StoryModel(**model_data)
            db.session.add(new_model)
            created_models.append(new_model)

    db.session.commit()
    return jsonify([model.to_dict() for model in created_models]), 201

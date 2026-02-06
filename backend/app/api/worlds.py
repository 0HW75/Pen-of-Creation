from flask import Blueprint, request, jsonify
from app import db
from app.models import World
from datetime import datetime

worlds_bp = Blueprint('worlds', __name__)

@worlds_bp.route('/worlds', methods=['GET'])
def get_worlds():
    """获取世界列表"""
    try:
        worlds = World.query.all()
        return jsonify({
            'code': 200,
            'data': [world.to_dict() for world in worlds],
            'message': '获取世界列表成功'
        })
    except Exception as e:
        return jsonify({
            'code': 500,
            'message': f'获取世界列表失败: {str(e)}'
        }), 500

@worlds_bp.route('/worlds', methods=['POST'])
def create_world():
    """创建新世界"""
    try:
        data = request.get_json()
        
        if not data or not data.get('name'):
            return jsonify({
                'code': 400,
                'message': '世界名称不能为空'
            }), 400
        
        world = World(
            name=data.get('name'),
            core_concept=data.get('core_concept', ''),
            world_type=data.get('world_type', '单一世界'),
            description=data.get('description', ''),
            creation_origin=data.get('creation_origin', ''),
            world_essence=data.get('world_essence', ''),
            status=data.get('status', 'active')
        )
        
        db.session.add(world)
        db.session.commit()
        
        return jsonify({
            'code': 200,
            'data': world.to_dict(),
            'message': '创建世界成功'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'code': 500,
            'message': f'创建世界失败: {str(e)}'
        }), 500

@worlds_bp.route('/worlds/<int:world_id>', methods=['GET'])
def get_world(world_id):
    """获取单个世界详情"""
    try:
        world = World.query.get(world_id)
        if not world:
            return jsonify({
                'code': 404,
                'message': '世界不存在'
            }), 404
        
        return jsonify({
            'code': 200,
            'data': world.to_dict(),
            'message': '获取世界详情成功'
        })
    except Exception as e:
        return jsonify({
            'code': 500,
            'message': f'获取世界详情失败: {str(e)}'
        }), 500

@worlds_bp.route('/worlds/<int:world_id>', methods=['PUT'])
def update_world(world_id):
    """更新世界信息"""
    try:
        world = World.query.get(world_id)
        if not world:
            return jsonify({
                'code': 404,
                'message': '世界不存在'
            }), 404
        
        data = request.get_json()
        
        world.name = data.get('name', world.name)
        world.core_concept = data.get('core_concept', world.core_concept)
        world.world_type = data.get('world_type', world.world_type)
        world.description = data.get('description', world.description)
        world.creation_origin = data.get('creation_origin', world.creation_origin)
        world.world_essence = data.get('world_essence', world.world_essence)
        world.status = data.get('status', world.status)
        world.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'code': 200,
            'data': world.to_dict(),
            'message': '更新世界成功'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'code': 500,
            'message': f'更新世界失败: {str(e)}'
        }), 500

@worlds_bp.route('/worlds/<int:world_id>', methods=['DELETE'])
def delete_world(world_id):
    """删除世界"""
    try:
        world = World.query.get(world_id)
        if not world:
            return jsonify({
                'code': 404,
                'message': '世界不存在'
            }), 404
        
        db.session.delete(world)
        db.session.commit()
        
        return jsonify({
            'code': 200,
            'message': '删除世界成功'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'code': 500,
            'message': f'删除世界失败: {str(e)}'
        }), 500

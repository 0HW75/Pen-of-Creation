from flask import Blueprint, request, jsonify
from app import db
from app.models import World, Character, Location, Faction, HistoricalEvent, Item
from datetime import datetime, timedelta

worlds_bp = Blueprint('worlds', __name__)

@worlds_bp.route('', methods=['GET'])
@worlds_bp.route('/', methods=['GET'])
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

@worlds_bp.route('', methods=['POST'])
@worlds_bp.route('/', methods=['POST'])
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
            project_id=data.get('project_id'),
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

@worlds_bp.route('/<int:world_id>', methods=['GET'])
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

@worlds_bp.route('/<int:world_id>', methods=['PUT'])
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
        # 支持core_concept和core_rules两个字段名
        if 'core_concept' in data:
            world.core_concept = data.get('core_concept', world.core_concept)
        if 'core_rules' in data:
            world.core_concept = data.get('core_rules', world.core_concept)
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

@worlds_bp.route('/<int:world_id>', methods=['DELETE'])
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


@worlds_bp.route('/<int:world_id>/stats', methods=['GET'])
def get_world_stats(world_id):
    """获取世界统计信息"""
    try:
        world = World.query.get(world_id)
        if not world:
            return jsonify({
                'code': 404,
                'message': '世界不存在'
            }), 404
        
        # 计算本周开始时间（周一）
        today = datetime.utcnow()
        week_start = today - timedelta(days=today.weekday())
        week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
        
        # 统计各类数据总数
        character_count = Character.query.filter_by(world_id=world_id).count()
        location_count = Location.query.filter_by(world_id=world_id).count()
        faction_count = Faction.query.filter_by(world_id=world_id).count()
        event_count = HistoricalEvent.query.filter_by(world_id=world_id).count()
        item_count = Item.query.filter_by(world_id=world_id).count()
        
        # 统计本周新增数量
        character_weekly = Character.query.filter(
            Character.world_id == world_id,
            Character.created_at >= week_start
        ).count()
        
        location_weekly = Location.query.filter(
            Location.world_id == world_id,
            Location.created_at >= week_start
        ).count()
        
        faction_weekly = Faction.query.filter(
            Faction.world_id == world_id,
            Faction.created_at >= week_start
        ).count()
        
        event_weekly = HistoricalEvent.query.filter(
            HistoricalEvent.world_id == world_id,
            HistoricalEvent.created_at >= week_start
        ).count()
        
        item_weekly = Item.query.filter(
            Item.world_id == world_id,
            Item.created_at >= week_start
        ).count()
        
        return jsonify({
            'code': 200,
            'data': {
                'character_count': character_count,
                'location_count': location_count,
                'faction_count': faction_count,
                'event_count': event_count,
                'item_count': item_count,
                'weekly_new': {
                    'characters': character_weekly,
                    'locations': location_weekly,
                    'factions': faction_weekly,
                    'events': event_weekly,
                    'items': item_weekly
                }
            },
            'message': '获取世界统计信息成功'
        })
    except Exception as e:
        return jsonify({
            'code': 500,
            'message': f'获取世界统计信息失败: {str(e)}'
        }), 500


@worlds_bp.route('/<int:world_id>/activities', methods=['GET'])
def get_world_activities(world_id):
    """获取世界最近活动"""
    try:
        world = World.query.get(world_id)
        if not world:
            return jsonify({
                'code': 404,
                'message': '世界不存在'
            }), 404
        
        # 获取最近创建的角色
        characters = Character.query.filter_by(world_id=world_id).order_by(Character.created_at.desc()).limit(5).all()
        # 获取最近创建的地点
        locations = Location.query.filter_by(world_id=world_id).order_by(Location.created_at.desc()).limit(5).all()
        # 获取最近创建的势力
        factions = Faction.query.filter_by(world_id=world_id).order_by(Faction.created_at.desc()).limit(5).all()
        # 获取最近创建的物品
        items = Item.query.filter_by(world_id=world_id).order_by(Item.created_at.desc()).limit(5).all()
        # 获取最近创建的事件
        events = HistoricalEvent.query.filter_by(world_id=world_id).order_by(HistoricalEvent.created_at.desc()).limit(5).all()
        
        # 合并所有活动并按时间排序
        activities = []
        
        for char in characters:
            activities.append({
                'id': f'char_{char.id}',
                'type': 'character',
                'action': 'create',
                'name': char.name,
                'created_at': char.created_at.isoformat()
            })
        
        for loc in locations:
            activities.append({
                'id': f'loc_{loc.id}',
                'type': 'location',
                'action': 'create',
                'name': loc.name,
                'created_at': loc.created_at.isoformat()
            })
        
        for faction in factions:
            activities.append({
                'id': f'faction_{faction.id}',
                'type': 'faction',
                'action': 'create',
                'name': faction.name,
                'created_at': faction.created_at.isoformat()
            })
        
        for item in items:
            activities.append({
                'id': f'item_{item.id}',
                'type': 'item',
                'action': 'create',
                'name': item.name,
                'created_at': item.created_at.isoformat()
            })
        
        for event in events:
            activities.append({
                'id': f'event_{event.id}',
                'type': 'event',
                'action': 'create',
                'name': event.name,
                'created_at': event.created_at.isoformat()
            })
        
        # 按时间排序并取前10条
        activities.sort(key=lambda x: x['created_at'], reverse=True)
        activities = activities[:10]
        
        return jsonify({
            'code': 200,
            'data': activities,
            'message': '获取最近活动成功'
        })
    except Exception as e:
        return jsonify({
            'code': 500,
            'message': f'获取最近活动失败: {str(e)}'
        }), 500

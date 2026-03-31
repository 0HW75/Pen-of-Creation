from flask import Blueprint, jsonify
from app import db
from datetime import datetime, timezone, timedelta
from app.models import (
    World, Character, Location, Faction, HistoricalEvent, Item
)
from datetime import datetime, timedelta

world_stats_bp = Blueprint('world_stats', __name__)

@world_stats_bp.route('/<int:world_id>/stats', methods=['GET'])
def get_world_stats(world_id):
    """获取世界统计信息"""
    try:
        world = World.query.get(world_id)
        if not world:
            return jsonify({
                'code': 404,
                'message': '世界不存在'
            }), 404

        today = datetime.now(timezone(timedelta(hours=8)))
        week_start = today - timedelta(days=today.weekday())
        week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)

        character_count = Character.query.filter_by(world_id=world_id).count()
        location_count = Location.query.filter_by(world_id=world_id).count()
        faction_count = Faction.query.filter_by(world_id=world_id).count()
        event_count = HistoricalEvent.query.filter_by(world_id=world_id).count()
        item_count = Item.query.filter_by(world_id=world_id).count()

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


@world_stats_bp.route('/<int:world_id>/activities', methods=['GET'])
def get_world_activities(world_id):
    """获取世界最近活动"""
    try:
        world = World.query.get(world_id)
        if not world:
            return jsonify({
                'code': 404,
                'message': '世界不存在'
            }), 404

        characters = Character.query.filter_by(world_id=world_id).order_by(Character.created_at.desc()).limit(5).all()
        locations = Location.query.filter_by(world_id=world_id).order_by(Location.created_at.desc()).limit(5).all()
        factions = Faction.query.filter_by(world_id=world_id).order_by(Faction.created_at.desc()).limit(5).all()
        items = Item.query.filter_by(world_id=world_id).order_by(Item.created_at.desc()).limit(5).all()
        events = HistoricalEvent.query.filter_by(world_id=world_id).order_by(HistoricalEvent.created_at.desc()).limit(5).all()

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

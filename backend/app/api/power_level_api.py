"""力量等级模块API"""
from flask import Blueprint, request, jsonify
from app.models import PowerLevel, World, db

power_level_bp = Blueprint('power_level', __name__, url_prefix='/power-level')


def success_response(data=None, message='操作成功', code=200):
    return jsonify({
        'code': code,
        'data': data,
        'message': message
    })


def error_response(message='操作失败', code=400):
    return jsonify({
        'code': code,
        'message': message
    }), code


@power_level_bp.route('/power-levels', methods=['GET'])
def get_power_levels():
    try:
        world_id = request.args.get('world_id', type=int)
        energy_system_id = request.args.get('energy_system_id', type=int)

        if not world_id:
            return error_response('缺少world_id参数', 400)

        query = PowerLevel.query.filter_by(world_id=world_id)

        if energy_system_id:
            query = query.filter_by(energy_system_id=energy_system_id)

        levels = query.order_by(PowerLevel.level).all()
        return success_response([l.to_dict() for l in levels], '获取力量等级列表成功')
    except Exception as e:
        return error_response(f'获取力量等级列表失败: {str(e)}', 500)


@power_level_bp.route('/power-levels', methods=['POST'])
def create_power_level():
    try:
        data = request.get_json()
        if not data or 'name' not in data or 'world_id' not in data:
            return error_response('缺少必要参数', 400)

        world = World.query.get(data['world_id'])
        if not world:
            return error_response('世界不存在', 404)

        level = PowerLevel(
            world_id=data['world_id'],
            name=data['name'],
            level=data.get('level', 1),
            level_name=data.get('level_name', data['name']),
            description=data.get('description', ''),
            requirements=data.get('requirements', ''),
            characteristics=data.get('characteristics', ''),
            abilities=data.get('abilities', ''),
            lifespan_extension=data.get('lifespan_extension', ''),
            typical_combat_power=data.get('typical_combat_power', ''),
            rarity=data.get('rarity', '常见'),
            social_status=data.get('social_status', ''),
            energy_system_id=data.get('energy_system_id'),
            order_index=data.get('order_index', 0)
        )

        db.session.add(level)
        db.session.commit()

        return success_response(level.to_dict(), '力量等级创建成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'创建力量等级失败: {str(e)}', 500)


@power_level_bp.route('/power-levels/<int:level_id>', methods=['GET'])
def get_power_level(level_id):
    try:
        level = PowerLevel.query.get(level_id)
        if not level:
            return error_response('力量等级不存在', 404)
        return success_response(level.to_dict(), '获取力量等级详情成功')
    except Exception as e:
        return error_response(f'获取力量等级详情失败: {str(e)}', 500)


@power_level_bp.route('/power-levels/<int:level_id>', methods=['PUT'])
def update_power_level(level_id):
    try:
        level = PowerLevel.query.get(level_id)
        if not level:
            return error_response('力量等级不存在', 404)

        data = request.get_json()
        if not data:
            return error_response('缺少请求数据', 400)

        for field in ['name', 'level', 'level_name', 'description', 'requirements',
                      'characteristics', 'abilities', 'lifespan_extension',
                      'typical_combat_power', 'rarity', 'social_status',
                      'energy_system_id', 'status', 'order_index']:
            if field in data:
                setattr(level, field, data[field])

        db.session.commit()
        return success_response(level.to_dict(), '力量等级更新成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'更新力量等级失败: {str(e)}', 500)


@power_level_bp.route('/power-levels/<int:level_id>', methods=['DELETE'])
def delete_power_level(level_id):
    try:
        level = PowerLevel.query.get(level_id)
        if not level:
            return error_response('力量等级不存在', 404)

        db.session.delete(level)
        db.session.commit()
        return success_response(None, '力量等级删除成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'删除力量等级失败: {str(e)}', 500)

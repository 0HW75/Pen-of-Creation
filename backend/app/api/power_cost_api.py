"""力量代价模块API"""
from flask import Blueprint, request, jsonify
from app.models import PowerCost, World, db

power_cost_bp = Blueprint('power_cost', __name__, url_prefix='/power-cost')


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


@power_cost_bp.route('/power-costs', methods=['GET'])
def get_power_costs():
    try:
        world_id = request.args.get('world_id', type=int)
        if not world_id:
            return error_response('缺少world_id参数', 400)

        costs = PowerCost.query.filter_by(world_id=world_id).order_by(PowerCost.order_index).all()
        return success_response([c.to_dict() for c in costs], '获取力量代价列表成功')
    except Exception as e:
        return error_response(f'获取力量代价列表失败: {str(e)}', 500)


@power_cost_bp.route('/power-costs', methods=['POST'])
def create_power_cost():
    try:
        data = request.get_json()
        if not data or 'cost_type' not in data or 'world_id' not in data:
            return error_response('缺少必要参数', 400)

        world = World.query.get(data['world_id'])
        if not world:
            return error_response('世界不存在', 404)

        cost = PowerCost(
            world_id=data['world_id'],
            cost_type=data['cost_type'],
            description=data.get('description', ''),
            trigger_conditions=data.get('trigger_conditions', ''),
            payment_mechanism=data.get('payment_mechanism', ''),
            severity_level=data.get('severity_level', 5),
            reversible=data.get('reversible', False),
            mitigation_methods=data.get('mitigation_methods', ''),
            accumulation_effect=data.get('accumulation_effect', ''),
            order_index=data.get('order_index', 0)
        )

        db.session.add(cost)
        db.session.commit()

        return success_response(cost.to_dict(), '力量代价创建成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'创建力量代价失败: {str(e)}', 500)


@power_cost_bp.route('/power-costs/<int:cost_id>', methods=['GET'])
def get_power_cost(cost_id):
    try:
        cost = PowerCost.query.get(cost_id)
        if not cost:
            return error_response('力量代价不存在', 404)
        return success_response(cost.to_dict(), '获取力量代价详情成功')
    except Exception as e:
        return error_response(f'获取力量代价详情失败: {str(e)}', 500)


@power_cost_bp.route('/power-costs/<int:cost_id>', methods=['PUT'])
def update_power_cost(cost_id):
    try:
        cost = PowerCost.query.get(cost_id)
        if not cost:
            return error_response('力量代价不存在', 404)

        data = request.get_json()
        if not data:
            return error_response('缺少请求数据', 400)

        for field in ['cost_type', 'description', 'trigger_conditions',
                      'payment_mechanism', 'severity_level', 'reversible',
                      'mitigation_methods', 'accumulation_effect', 'status', 'order_index']:
            if field in data:
                setattr(cost, field, data[field])

        db.session.commit()
        return success_response(cost.to_dict(), '力量代价更新成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'更新力量代价失败: {str(e)}', 500)


@power_cost_bp.route('/power-costs/<int:cost_id>', methods=['DELETE'])
def delete_power_cost(cost_id):
    try:
        cost = PowerCost.query.get(cost_id)
        if not cost:
            return error_response('力量代价不存在', 404)

        db.session.delete(cost)
        db.session.commit()
        return success_response(None, '力量代价删除成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'删除力量代价失败: {str(e)}', 500)

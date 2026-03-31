"""文化体系模块API"""
from flask import Blueprint, request, jsonify
from app.models import CulturalCustom, EconomicSystem, PoliticalSystem, World, db

cultural_bp = Blueprint('cultural', __name__)


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


@cultural_bp.route('/cultural-customs', methods=['GET'])
def get_cultural_customs():
    try:
        world_id = request.args.get('world_id', type=int)
        civilization_id = request.args.get('civilization_id', type=int)
        custom_type = request.args.get('custom_type')

        if not world_id:
            return error_response('缺少world_id参数', 400)

        query = CulturalCustom.query.filter_by(world_id=world_id)

        if civilization_id:
            query = query.filter_by(civilization_id=civilization_id)
        if custom_type:
            query = query.filter_by(custom_type=custom_type)

        customs = query.order_by(CulturalCustom.importance_level.desc()).all()
        return success_response([c.to_dict() for c in customs], '获取文化习俗列表成功')
    except Exception as e:
        return error_response(f'获取文化习俗列表失败: {str(e)}', 500)


@cultural_bp.route('/cultural-customs', methods=['POST'])
def create_cultural_custom():
    try:
        data = request.get_json()
        if not data or 'name' not in data or 'world_id' not in data:
            return error_response('缺少必要参数', 400)

        world = World.query.get(data['world_id'])
        if not world:
            return error_response('世界不存在', 404)

        custom = CulturalCustom(
            world_id=data['world_id'],
            civilization_id=data.get('civilization_id'),
            name=data['name'],
            custom_type=data.get('custom_type', '节日'),
            description=data.get('description', ''),
            origin=data.get('origin', ''),
            significance=data.get('significance', ''),
            participants=data.get('participants', ''),
            time_period=data.get('time_period', ''),
            location=data.get('location', ''),
            procedures=data.get('procedures', ''),
            related_beliefs=data.get('related_beliefs', ''),
            variations=data.get('variations', ''),
            importance_level=data.get('importance_level', 5),
            order_index=data.get('order_index', 0)
        )

        db.session.add(custom)
        db.session.commit()

        return success_response(custom.to_dict(), '文化习俗创建成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'创建文化习俗失败: {str(e)}', 500)


@cultural_bp.route('/cultural-customs/<int:custom_id>', methods=['GET'])
def get_cultural_custom(custom_id):
    try:
        custom = CulturalCustom.query.get(custom_id)
        if not custom:
            return error_response('文化习俗不存在', 404)
        return success_response(custom.to_dict(), '获取文化习俗详情成功')
    except Exception as e:
        return error_response(f'获取文化习俗详情失败: {str(e)}', 500)


@cultural_bp.route('/cultural-customs/<int:custom_id>', methods=['PUT'])
def update_cultural_custom(custom_id):
    try:
        custom = CulturalCustom.query.get(custom_id)
        if not custom:
            return error_response('文化习俗不存在', 404)

        data = request.get_json()
        if not data:
            return error_response('缺少请求数据', 400)

        for field in ['name', 'custom_type', 'description', 'origin', 'significance',
                      'participants', 'time_period', 'location', 'procedures',
                      'related_beliefs', 'variations', 'importance_level',
                      'civilization_id', 'status', 'order_index']:
            if field in data:
                setattr(custom, field, data[field])

        db.session.commit()
        return success_response(custom.to_dict(), '文化习俗更新成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'更新文化习俗失败: {str(e)}', 500)


@cultural_bp.route('/cultural-customs/<int:custom_id>', methods=['DELETE'])
def delete_cultural_custom(custom_id):
    try:
        custom = CulturalCustom.query.get(custom_id)
        if not custom:
            return error_response('文化习俗不存在', 404)

        db.session.delete(custom)
        db.session.commit()
        return success_response(None, '文化习俗删除成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'删除文化习俗失败: {str(e)}', 500)


@cultural_bp.route('/economic-systems', methods=['GET'])
def get_economic_systems():
    try:
        world_id = request.args.get('world_id', type=int)
        civilization_id = request.args.get('civilization_id', type=int)

        if not world_id:
            return error_response('缺少world_id参数', 400)

        query = EconomicSystem.query.filter_by(world_id=world_id)

        if civilization_id:
            query = query.filter_by(civilization_id=civilization_id)

        systems = query.order_by(EconomicSystem.order_index).all()
        return success_response([s.to_dict() for s in systems], '获取经济体系列表成功')
    except Exception as e:
        return error_response(f'获取经济体系列表失败: {str(e)}', 500)


@cultural_bp.route('/economic-systems', methods=['POST'])
def create_economic_system():
    try:
        data = request.get_json()
        if not data or 'name' not in data or 'world_id' not in data:
            return error_response('缺少必要参数', 400)

        world = World.query.get(data['world_id'])
        if not world:
            return error_response('世界不存在', 404)

        system = EconomicSystem(
            world_id=data['world_id'],
            civilization_id=data.get('civilization_id'),
            name=data['name'],
            economic_model=data.get('economic_model', '市场经济'),
            description=data.get('description', ''),
            currency_name=data.get('currency_name', ''),
            currency_material=data.get('currency_material', ''),
            denomination_system=data.get('denomination_system', ''),
            exchange_rates=data.get('exchange_rates', ''),
            major_industries=data.get('major_industries', ''),
            trade_routes=data.get('trade_routes', ''),
            trade_partners=data.get('trade_partners', ''),
            resource_dependencies=data.get('resource_dependencies', ''),
            wealth_distribution=data.get('wealth_distribution', ''),
            taxation_system=data.get('taxation_system', ''),
            banking_system=data.get('banking_system', ''),
            economic_challenges=data.get('economic_challenges', ''),
            order_index=data.get('order_index', 0)
        )

        db.session.add(system)
        db.session.commit()

        return success_response(system.to_dict(), '经济体系创建成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'创建经济体系失败: {str(e)}', 500)


@cultural_bp.route('/economic-systems/<int:system_id>', methods=['GET'])
def get_economic_system(system_id):
    try:
        system = EconomicSystem.query.get(system_id)
        if not system:
            return error_response('经济体系不存在', 404)
        return success_response(system.to_dict(), '获取经济体系详情成功')
    except Exception as e:
        return error_response(f'获取经济体系详情失败: {str(e)}', 500)


@cultural_bp.route('/economic-systems/<int:system_id>', methods=['PUT'])
def update_economic_system(system_id):
    try:
        system = EconomicSystem.query.get(system_id)
        if not system:
            return error_response('经济体系不存在', 404)

        data = request.get_json()
        if not data:
            return error_response('缺少请求数据', 400)

        for field in ['name', 'economic_model', 'description', 'currency_name',
                      'currency_material', 'denomination_system', 'exchange_rates',
                      'major_industries', 'trade_routes', 'trade_partners',
                      'resource_dependencies', 'wealth_distribution', 'taxation_system',
                      'banking_system', 'economic_challenges', 'civilization_id',
                      'status', 'order_index']:
            if field in data:
                setattr(system, field, data[field])

        db.session.commit()
        return success_response(system.to_dict(), '经济体系更新成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'更新经济体系失败: {str(e)}', 500)


@cultural_bp.route('/economic-systems/<int:system_id>', methods=['DELETE'])
def delete_economic_system(system_id):
    try:
        system = EconomicSystem.query.get(system_id)
        if not system:
            return error_response('经济体系不存在', 404)

        db.session.delete(system)
        db.session.commit()
        return success_response(None, '经济体系删除成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'删除经济体系失败: {str(e)}', 500)


@cultural_bp.route('/political-systems', methods=['GET'])
def get_political_systems():
    try:
        world_id = request.args.get('world_id', type=int)
        civilization_id = request.args.get('civilization_id', type=int)

        if not world_id:
            return error_response('缺少world_id参数', 400)

        query = PoliticalSystem.query.filter_by(world_id=world_id)

        if civilization_id:
            query = query.filter_by(civilization_id=civilization_id)

        systems = query.order_by(PoliticalSystem.order_index).all()
        return success_response([s.to_dict() for s in systems], '获取政治体系列表成功')
    except Exception as e:
        return error_response(f'获取政治体系列表失败: {str(e)}', 500)


@cultural_bp.route('/political-systems', methods=['POST'])
def create_political_system():
    try:
        data = request.get_json()
        if not data or 'name' not in data or 'world_id' not in data:
            return error_response('缺少必要参数', 400)

        world = World.query.get(data['world_id'])
        if not world:
            return error_response('世界不存在', 404)

        system = PoliticalSystem(
            world_id=data['world_id'],
            civilization_id=data.get('civilization_id'),
            name=data['name'],
            government_type=data.get('government_type', '君主制'),
            description=data.get('description', ''),
            power_structure=data.get('power_structure', ''),
            succession_system=data.get('succession_system', ''),
            decision_process=data.get('decision_process', ''),
            administrative_divisions=data.get('administrative_divisions', ''),
            legal_system=data.get('legal_system', ''),
            military_organization=data.get('military_organization', ''),
            diplomatic_style=data.get('diplomatic_style', ''),
            internal_conflicts=data.get('internal_conflicts', ''),
            external_threats=data.get('external_threats', ''),
            political_stability=data.get('political_stability', '稳定'),
            order_index=data.get('order_index', 0)
        )

        db.session.add(system)
        db.session.commit()

        return success_response(system.to_dict(), '政治体系创建成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'创建政治体系失败: {str(e)}', 500)


@cultural_bp.route('/political-systems/<int:system_id>', methods=['GET'])
def get_political_system(system_id):
    try:
        system = PoliticalSystem.query.get(system_id)
        if not system:
            return error_response('政治体系不存在', 404)
        return success_response(system.to_dict(), '获取政治体系详情成功')
    except Exception as e:
        return error_response(f'获取政治体系详情失败: {str(e)}', 500)


@cultural_bp.route('/political-systems/<int:system_id>', methods=['PUT'])
def update_political_system(system_id):
    try:
        system = PoliticalSystem.query.get(system_id)
        if not system:
            return error_response('政治体系不存在', 404)

        data = request.get_json()
        if not data:
            return error_response('缺少请求数据', 400)

        for field in ['name', 'government_type', 'description', 'power_structure',
                      'succession_system', 'decision_process', 'administrative_divisions',
                      'legal_system', 'military_organization', 'diplomatic_style',
                      'internal_conflicts', 'external_threats', 'political_stability',
                      'civilization_id', 'status', 'order_index']:
            if field in data:
                setattr(system, field, data[field])

        db.session.commit()
        return success_response(system.to_dict(), '政治体系更新成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'更新政治体系失败: {str(e)}', 500)


@cultural_bp.route('/political-systems/<int:system_id>', methods=['DELETE'])
def delete_political_system(system_id):
    try:
        system = PoliticalSystem.query.get(system_id)
        if not system:
            return error_response('政治体系不存在', 404)

        db.session.delete(system)
        db.session.commit()
        return success_response(None, '政治体系删除成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'删除政治体系失败: {str(e)}', 500)

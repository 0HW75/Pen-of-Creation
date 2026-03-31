"""文明社会模块API"""
from flask import Blueprint, request, jsonify
from app.models import Civilization, CivilizationRegion, SocialClass, World, db

civilization_bp = Blueprint('civilization', __name__)


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


@civilization_bp.route('/civilizations', methods=['GET'])
def get_civilizations():
    try:
        world_id = request.args.get('world_id', type=int)
        if not world_id:
            return error_response('缺少world_id参数', 400)

        civilizations = Civilization.query.filter_by(world_id=world_id).order_by(Civilization.order_index).all()
        return success_response([c.to_dict() for c in civilizations], '获取文明列表成功')
    except Exception as e:
        return error_response(f'获取文明列表失败: {str(e)}', 500)


@civilization_bp.route('/civilizations', methods=['POST'])
def create_civilization():
    try:
        data = request.get_json()
        if not data or 'name' not in data or 'world_id' not in data:
            return error_response('缺少必要参数', 400)

        world = World.query.get(data['world_id'])
        if not world:
            return error_response('世界不存在', 404)

        civilization = Civilization(
            world_id=data['world_id'],
            name=data['name'],
            civilization_type=data.get('civilization_type', '魔法文明'),
            description=data.get('description', ''),
            development_level=data.get('development_level', '中世纪'),
            population_scale=data.get('population_scale', ''),
            territory_size=data.get('territory_size', ''),
            political_system=data.get('political_system', ''),
            economic_system=data.get('economic_system', ''),
            technological_level=data.get('technological_level', ''),
            magical_level=data.get('magical_level', ''),
            cultural_characteristics=data.get('cultural_characteristics', ''),
            religious_beliefs=data.get('religious_beliefs', ''),
            taboos=data.get('taboos', ''),
            values=data.get('values', ''),
            historical_origin=data.get('historical_origin', ''),
            importance_level=data.get('importance_level', 5),
            order_index=data.get('order_index', 0)
        )

        db.session.add(civilization)
        db.session.commit()

        return success_response(civilization.to_dict(), '文明创建成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'创建文明失败: {str(e)}', 500)


@civilization_bp.route('/civilizations/<int:civilization_id>', methods=['GET'])
def get_civilization(civilization_id):
    try:
        civilization = Civilization.query.get(civilization_id)
        if not civilization:
            return error_response('文明不存在', 404)
        return success_response(civilization.to_dict(), '获取文明详情成功')
    except Exception as e:
        return error_response(f'获取文明详情失败: {str(e)}', 500)


@civilization_bp.route('/civilizations/<int:civilization_id>', methods=['PUT'])
def update_civilization(civilization_id):
    try:
        civilization = Civilization.query.get(civilization_id)
        if not civilization:
            return error_response('文明不存在', 404)

        data = request.get_json()
        if not data:
            return error_response('缺少请求数据', 400)

        for field in ['name', 'civilization_type', 'description', 'development_level',
                      'population_scale', 'territory_size', 'political_system',
                      'economic_system', 'technological_level', 'magical_level',
                      'cultural_characteristics', 'religious_beliefs', 'taboos',
                      'values', 'historical_origin', 'status', 'order_index']:
            if field in data:
                setattr(civilization, field, data[field])

        db.session.commit()
        return success_response(civilization.to_dict(), '文明更新成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'更新文明失败: {str(e)}', 500)


@civilization_bp.route('/civilizations/<int:civilization_id>', methods=['DELETE'])
def delete_civilization(civilization_id):
    try:
        civilization = Civilization.query.get(civilization_id)
        if not civilization:
            return error_response('文明不存在', 404)

        db.session.delete(civilization)
        db.session.commit()
        return success_response(None, '文明删除成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'删除文明失败: {str(e)}', 500)


@civilization_bp.route('/civilization-regions', methods=['GET'])
def get_civilization_regions():
    try:
        civilization_id = request.args.get('civilization_id', type=int)
        region_id = request.args.get('region_id', type=int)

        query = CivilizationRegion.query

        if civilization_id:
            query = query.filter_by(civilization_id=civilization_id)
        if region_id:
            query = query.filter_by(region_id=region_id)

        relations = query.all()
        return success_response([r.to_dict() for r in relations], '获取文明区域关联列表成功')
    except Exception as e:
        return error_response(f'获取文明区域关联列表失败: {str(e)}', 500)


@civilization_bp.route('/civilization-regions', methods=['POST'])
def create_civilization_region():
    try:
        data = request.get_json()
        if not data or 'civilization_id' not in data or 'region_id' not in data:
            return error_response('缺少必要参数', 400)

        relation = CivilizationRegion(
            civilization_id=data['civilization_id'],
            region_id=data['region_id'],
            relationship_type=data.get('relationship_type', '统治'),
            influence_level=data.get('influence_level', 5),
            description=data.get('description', '')
        )

        db.session.add(relation)
        db.session.commit()

        return success_response(relation.to_dict(), '文明区域关联创建成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'创建文明区域关联失败: {str(e)}', 500)


@civilization_bp.route('/civilization-regions/<int:relation_id>', methods=['DELETE'])
def delete_civilization_region(relation_id):
    try:
        relation = CivilizationRegion.query.get(relation_id)
        if not relation:
            return error_response('关联不存在', 404)

        db.session.delete(relation)
        db.session.commit()
        return success_response(None, '文明区域关联删除成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'删除文明区域关联失败: {str(e)}', 500)


@civilization_bp.route('/social-classes', methods=['GET'])
def get_social_classes():
    try:
        world_id = request.args.get('world_id', type=int)
        civilization_id = request.args.get('civilization_id', type=int)

        if not world_id:
            return error_response('缺少world_id参数', 400)

        query = SocialClass.query.filter_by(world_id=world_id)

        if civilization_id:
            query = query.filter_by(civilization_id=civilization_id)

        classes = query.order_by(SocialClass.class_level).all()
        return success_response([c.to_dict() for c in classes], '获取社会阶级列表成功')
    except Exception as e:
        return error_response(f'获取社会阶级列表失败: {str(e)}', 500)


@civilization_bp.route('/social-classes', methods=['POST'])
def create_social_class():
    try:
        data = request.get_json()
        if not data or 'name' not in data or 'world_id' not in data:
            return error_response('缺少必要参数', 400)

        world = World.query.get(data['world_id'])
        if not world:
            return error_response('世界不存在', 404)

        social_class = SocialClass(
            world_id=data['world_id'],
            civilization_id=data.get('civilization_id'),
            name=data['name'],
            class_level=data.get('class_level', 1),
            description=data.get('description', ''),
            typical_occupations=data.get('typical_occupations', ''),
            privileges=data.get('privileges', ''),
            obligations=data.get('obligations', ''),
            living_standards=data.get('living_standards', ''),
            education_access=data.get('education_access', ''),
            social_mobility=data.get('social_mobility', ''),
            percentage_of_population=data.get('percentage_of_population', ''),
            typical_power_level=data.get('typical_power_level', 0),
            order_index=data.get('order_index', 0)
        )

        db.session.add(social_class)
        db.session.commit()

        return success_response(social_class.to_dict(), '社会阶级创建成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'创建社会阶级失败: {str(e)}', 500)


@civilization_bp.route('/social-classes/<int:class_id>', methods=['GET'])
def get_social_class(class_id):
    try:
        social_class = SocialClass.query.get(class_id)
        if not social_class:
            return error_response('社会阶级不存在', 404)
        return success_response(social_class.to_dict(), '获取社会阶级详情成功')
    except Exception as e:
        return error_response(f'获取社会阶级详情失败: {str(e)}', 500)


@civilization_bp.route('/social-classes/<int:class_id>', methods=['PUT'])
def update_social_class(class_id):
    try:
        social_class = SocialClass.query.get(class_id)
        if not social_class:
            return error_response('社会阶级不存在', 404)

        data = request.get_json()
        if not data:
            return error_response('缺少请求数据', 400)

        for field in ['name', 'class_level', 'description', 'typical_occupations',
                      'privileges', 'obligations', 'living_standards',
                      'education_access', 'social_mobility', 'percentage_of_population',
                      'typical_power_level', 'civilization_id', 'status', 'order_index']:
            if field in data:
                setattr(social_class, field, data[field])

        db.session.commit()
        return success_response(social_class.to_dict(), '社会阶级更新成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'更新社会阶级失败: {str(e)}', 500)


@civilization_bp.route('/social-classes/<int:class_id>', methods=['DELETE'])
def delete_social_class(class_id):
    try:
        social_class = SocialClass.query.get(class_id)
        if not social_class:
            return error_response('社会阶级不存在', 404)

        db.session.delete(social_class)
        db.session.commit()
        return success_response(None, '社会阶级删除成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'删除社会阶级失败: {str(e)}', 500)

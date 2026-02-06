"""
世界观设定模块API
包含维度、地理区域、天体、自然法则的管理
"""
from flask import Blueprint, request, jsonify
from app.models import (
    Dimension, Region, CelestialBody, NaturalLaw,
    World, db
)

world_setting_bp = Blueprint('world_setting', __name__, url_prefix='/world-setting')


def success_response(data=None, message='操作成功', code=200):
    """成功响应"""
    return jsonify({
        'code': code,
        'data': data,
        'message': message
    })


def error_response(message='操作失败', code=400):
    """错误响应"""
    return jsonify({
        'code': code,
        'message': message
    }), code


# ==================== 维度/位面管理 ====================

@world_setting_bp.route('/dimensions', methods=['GET'])
def get_dimensions():
    """获取维度列表"""
    try:
        world_id = request.args.get('world_id', type=int)
        if not world_id:
            return error_response('缺少world_id参数', 400)
        
        dimensions = Dimension.query.filter_by(world_id=world_id).order_by(Dimension.order_index).all()
        return success_response([d.to_dict() for d in dimensions], '获取维度列表成功')
    except Exception as e:
        return error_response(f'获取维度列表失败: {str(e)}', 500)


@world_setting_bp.route('/dimensions', methods=['POST'])
def create_dimension():
    """创建维度"""
    try:
        data = request.get_json()
        if not data or 'name' not in data or 'world_id' not in data:
            return error_response('缺少必要参数', 400)
        
        # 检查世界是否存在
        world = World.query.get(data['world_id'])
        if not world:
            return error_response('世界不存在', 404)
        
        dimension = Dimension(
            world_id=data['world_id'],
            name=data['name'],
            dimension_type=data.get('dimension_type', '主世界'),
            description=data.get('description', ''),
            entry_conditions=data.get('entry_conditions', ''),
            physical_properties=data.get('physical_properties', ''),
            time_flow=data.get('time_flow', '1:1'),
            spatial_hierarchy=data.get('spatial_hierarchy', 1),
            special_rules=data.get('special_rules', ''),
            magic_concentration=data.get('magic_concentration', '中等'),
            element_activity=data.get('element_activity', ''),
            gravity=data.get('gravity', '1.0G'),
            order_index=data.get('order_index', 0)
        )
        
        db.session.add(dimension)
        db.session.commit()
        
        return success_response(dimension.to_dict(), '维度创建成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'创建维度失败: {str(e)}', 500)


@world_setting_bp.route('/dimensions/<int:dimension_id>', methods=['GET'])
def get_dimension(dimension_id):
    """获取维度详情"""
    try:
        dimension = Dimension.query.get(dimension_id)
        if not dimension:
            return error_response('维度不存在', 404)
        return success_response(dimension.to_dict(), '获取维度详情成功')
    except Exception as e:
        return error_response(f'获取维度详情失败: {str(e)}', 500)


@world_setting_bp.route('/dimensions/<int:dimension_id>', methods=['PUT'])
def update_dimension(dimension_id):
    """更新维度"""
    try:
        dimension = Dimension.query.get(dimension_id)
        if not dimension:
            return error_response('维度不存在', 404)
        
        data = request.get_json()
        if not data:
            return error_response('缺少请求数据', 400)
        
        # 更新字段
        for field in ['name', 'dimension_type', 'description', 'entry_conditions',
                      'physical_properties', 'time_flow', 'spatial_hierarchy',
                      'special_rules', 'magic_concentration', 'element_activity',
                      'gravity', 'status', 'order_index']:
            if field in data:
                setattr(dimension, field, data[field])
        
        db.session.commit()
        return success_response(dimension.to_dict(), '维度更新成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'更新维度失败: {str(e)}', 500)


@world_setting_bp.route('/dimensions/<int:dimension_id>', methods=['DELETE'])
def delete_dimension(dimension_id):
    """删除维度"""
    try:
        dimension = Dimension.query.get(dimension_id)
        if not dimension:
            return error_response('维度不存在', 404)
        
        db.session.delete(dimension)
        db.session.commit()
        return success_response(None, '维度删除成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'删除维度失败: {str(e)}', 500)


# ==================== 地理区域管理 ====================

@world_setting_bp.route('/regions', methods=['GET'])
def get_regions():
    """获取地理区域列表"""
    try:
        world_id = request.args.get('world_id', type=int)
        parent_id = request.args.get('parent_id', type=int)
        
        if not world_id:
            return error_response('缺少world_id参数', 400)
        
        query = Region.query.filter_by(world_id=world_id)
        
        if parent_id is not None:
            query = query.filter_by(parent_region_id=parent_id)
        
        regions = query.order_by(Region.order_index).all()
        return success_response([r.to_dict() for r in regions], '获取地理区域列表成功')
    except Exception as e:
        return error_response(f'获取地理区域列表失败: {str(e)}', 500)


@world_setting_bp.route('/regions/tree', methods=['GET'])
def get_region_tree():
    """获取地理区域树形结构"""
    try:
        world_id = request.args.get('world_id', type=int)
        if not world_id:
            return error_response('缺少world_id参数', 400)
        
        def build_tree(parent_id=None):
            regions = Region.query.filter_by(
                world_id=world_id,
                parent_region_id=parent_id
            ).order_by(Region.order_index).all()
            
            result = []
            for region in regions:
                node = region.to_dict()
                node['children'] = build_tree(region.id)
                result.append(node)
            return result
        
        return success_response(build_tree(), '获取地理区域树成功')
    except Exception as e:
        return error_response(f'获取地理区域树失败: {str(e)}', 500)


@world_setting_bp.route('/regions', methods=['POST'])
def create_region():
    """创建地理区域"""
    try:
        data = request.get_json()
        if not data or 'name' not in data or 'world_id' not in data:
            return error_response('缺少必要参数', 400)
        
        # 检查世界是否存在
        world = World.query.get(data['world_id'])
        if not world:
            return error_response('世界不存在', 404)
        
        region = Region(
            world_id=data['world_id'],
            parent_region_id=data.get('parent_region_id'),
            name=data['name'],
            region_type=data.get('region_type', '大陆'),
            description=data.get('description', ''),
            geographical_coordinates=data.get('geographical_coordinates', ''),
            climate=data.get('climate', '温带'),
            terrain=data.get('terrain', ''),
            area_size=data.get('area_size', ''),
            population=data.get('population', 0),
            resources=data.get('resources', ''),
            strategic_importance=data.get('strategic_importance', 5),
            controlling_faction_id=data.get('controlling_faction_id'),
            danger_level=data.get('danger_level', '安全'),
            order_index=data.get('order_index', 0)
        )
        
        db.session.add(region)
        db.session.commit()
        
        return success_response(region.to_dict(), '地理区域创建成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'创建地理区域失败: {str(e)}', 500)


@world_setting_bp.route('/regions/<int:region_id>', methods=['GET'])
def get_region(region_id):
    """获取地理区域详情"""
    try:
        region = Region.query.get(region_id)
        if not region:
            return error_response('地理区域不存在', 404)
        return success_response(region.to_dict(), '获取地理区域详情成功')
    except Exception as e:
        return error_response(f'获取地理区域详情失败: {str(e)}', 500)


@world_setting_bp.route('/regions/<int:region_id>', methods=['PUT'])
def update_region(region_id):
    """更新地理区域"""
    try:
        region = Region.query.get(region_id)
        if not region:
            return error_response('地理区域不存在', 404)
        
        data = request.get_json()
        if not data:
            return error_response('缺少请求数据', 400)
        
        # 更新字段
        for field in ['name', 'region_type', 'description', 'geographical_coordinates',
                      'climate', 'terrain', 'area_size', 'population', 'resources',
                      'strategic_importance', 'controlling_faction_id', 'danger_level',
                      'parent_region_id', 'status', 'order_index']:
            if field in data:
                setattr(region, field, data[field])
        
        db.session.commit()
        return success_response(region.to_dict(), '地理区域更新成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'更新地理区域失败: {str(e)}', 500)


@world_setting_bp.route('/regions/<int:region_id>', methods=['DELETE'])
def delete_region(region_id):
    """删除地理区域"""
    try:
        region = Region.query.get(region_id)
        if not region:
            return error_response('地理区域不存在', 404)
        
        # 检查是否有子区域
        children = Region.query.filter_by(parent_region_id=region_id).first()
        if children:
            return error_response('该区域包含子区域，无法删除', 400)
        
        db.session.delete(region)
        db.session.commit()
        return success_response(None, '地理区域删除成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'删除地理区域失败: {str(e)}', 500)


# ==================== 天体管理 ====================

@world_setting_bp.route('/celestial-bodies', methods=['GET'])
def get_celestial_bodies():
    """获取天体列表"""
    try:
        world_id = request.args.get('world_id', type=int)
        if not world_id:
            return error_response('缺少world_id参数', 400)
        
        bodies = CelestialBody.query.filter_by(world_id=world_id).order_by(CelestialBody.order_index).all()
        return success_response([b.to_dict() for b in bodies], '获取天体列表成功')
    except Exception as e:
        return error_response(f'获取天体列表失败: {str(e)}', 500)


@world_setting_bp.route('/celestial-bodies', methods=['POST'])
def create_celestial_body():
    """创建天体"""
    try:
        data = request.get_json()
        if not data or 'name' not in data or 'world_id' not in data:
            return error_response('缺少必要参数', 400)
        
        # 检查世界是否存在
        world = World.query.get(data['world_id'])
        if not world:
            return error_response('世界不存在', 404)
        
        body = CelestialBody(
            world_id=data['world_id'],
            name=data['name'],
            body_type=data.get('body_type', '行星'),
            description=data.get('description', ''),
            size=data.get('size', ''),
            mass=data.get('mass', ''),
            orbit_period=data.get('orbit_period', ''),
            rotation_period=data.get('rotation_period', ''),
            distance_from_star=data.get('distance_from_star', ''),
            surface_temperature=data.get('surface_temperature', ''),
            atmosphere=data.get('atmosphere', ''),
            satellites=data.get('satellites', ''),
            magical_properties=data.get('magical_properties', ''),
            cultural_significance=data.get('cultural_significance', ''),
            order_index=data.get('order_index', 0)
        )
        
        db.session.add(body)
        db.session.commit()
        
        return success_response(body.to_dict(), '天体创建成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'创建天体失败: {str(e)}', 500)


@world_setting_bp.route('/celestial-bodies/<int:body_id>', methods=['GET'])
def get_celestial_body(body_id):
    """获取天体详情"""
    try:
        body = CelestialBody.query.get(body_id)
        if not body:
            return error_response('天体不存在', 404)
        return success_response(body.to_dict(), '获取天体详情成功')
    except Exception as e:
        return error_response(f'获取天体详情失败: {str(e)}', 500)


@world_setting_bp.route('/celestial-bodies/<int:body_id>', methods=['PUT'])
def update_celestial_body(body_id):
    """更新天体"""
    try:
        body = CelestialBody.query.get(body_id)
        if not body:
            return error_response('天体不存在', 404)
        
        data = request.get_json()
        if not data:
            return error_response('缺少请求数据', 400)
        
        # 更新字段
        for field in ['name', 'body_type', 'description', 'size', 'mass',
                      'orbit_period', 'rotation_period', 'distance_from_star',
                      'surface_temperature', 'atmosphere', 'satellites',
                      'magical_properties', 'cultural_significance', 'status', 'order_index']:
            if field in data:
                setattr(body, field, data[field])
        
        db.session.commit()
        return success_response(body.to_dict(), '天体更新成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'更新天体失败: {str(e)}', 500)


@world_setting_bp.route('/celestial-bodies/<int:body_id>', methods=['DELETE'])
def delete_celestial_body(body_id):
    """删除天体"""
    try:
        body = CelestialBody.query.get(body_id)
        if not body:
            return error_response('天体不存在', 404)
        
        db.session.delete(body)
        db.session.commit()
        return success_response(None, '天体删除成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'删除天体失败: {str(e)}', 500)


# ==================== 自然法则管理 ====================

@world_setting_bp.route('/natural-laws', methods=['GET'])
def get_natural_laws():
    """获取自然法则列表"""
    try:
        world_id = request.args.get('world_id', type=int)
        law_type = request.args.get('law_type')
        
        if not world_id:
            return error_response('缺少world_id参数', 400)
        
        query = NaturalLaw.query.filter_by(world_id=world_id)
        
        if law_type:
            query = query.filter_by(law_type=law_type)
        
        laws = query.order_by(NaturalLaw.importance_level.desc(), NaturalLaw.order_index).all()
        return success_response([l.to_dict() for l in laws], '获取自然法则列表成功')
    except Exception as e:
        return error_response(f'获取自然法则列表失败: {str(e)}', 500)


@world_setting_bp.route('/natural-laws', methods=['POST'])
def create_natural_law():
    """创建自然法则"""
    try:
        data = request.get_json()
        if not data or 'name' not in data or 'world_id' not in data:
            return error_response('缺少必要参数', 400)
        
        # 检查世界是否存在
        world = World.query.get(data['world_id'])
        if not world:
            return error_response('世界不存在', 404)
        
        law = NaturalLaw(
            world_id=data['world_id'],
            name=data['name'],
            law_type=data.get('law_type', '物理法则'),
            description=data.get('description', ''),
            basic_principles=data.get('basic_principles', ''),
            exceptions=data.get('exceptions', ''),
            limitations=data.get('limitations', ''),
            interactions=data.get('interactions', ''),
            common_applications=data.get('common_applications', ''),
            taboos=data.get('taboos', ''),
            consequences=data.get('consequences', ''),
            importance_level=data.get('importance_level', 5),
            order_index=data.get('order_index', 0)
        )
        
        db.session.add(law)
        db.session.commit()
        
        return success_response(law.to_dict(), '自然法则创建成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'创建自然法则失败: {str(e)}', 500)


@world_setting_bp.route('/natural-laws/<int:law_id>', methods=['GET'])
def get_natural_law(law_id):
    """获取自然法则详情"""
    try:
        law = NaturalLaw.query.get(law_id)
        if not law:
            return error_response('自然法则不存在', 404)
        return success_response(law.to_dict(), '获取自然法则详情成功')
    except Exception as e:
        return error_response(f'获取自然法则详情失败: {str(e)}', 500)


@world_setting_bp.route('/natural-laws/<int:law_id>', methods=['PUT'])
def update_natural_law(law_id):
    """更新自然法则"""
    try:
        law = NaturalLaw.query.get(law_id)
        if not law:
            return error_response('自然法则不存在', 404)
        
        data = request.get_json()
        if not data:
            return error_response('缺少请求数据', 400)
        
        # 更新字段
        for field in ['name', 'law_type', 'description', 'basic_principles',
                      'exceptions', 'limitations', 'interactions',
                      'common_applications', 'taboos', 'consequences',
                      'importance_level', 'status', 'order_index']:
            if field in data:
                setattr(law, field, data[field])
        
        db.session.commit()
        return success_response(law.to_dict(), '自然法则更新成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'更新自然法则失败: {str(e)}', 500)


@world_setting_bp.route('/natural-laws/<int:law_id>', methods=['DELETE'])
def delete_natural_law(law_id):
    """删除自然法则"""
    try:
        law = NaturalLaw.query.get(law_id)
        if not law:
            return error_response('自然法则不存在', 404)
        
        db.session.delete(law)
        db.session.commit()
        return success_response(None, '自然法则删除成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'删除自然法则失败: {str(e)}', 500)

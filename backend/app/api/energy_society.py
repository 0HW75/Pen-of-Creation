"""
能量与社会体系模块API
包含能量体系、力量等级、通用技能、文明、社会阶级、文化习俗的管理
以及能量形态、力量代价、经济体系、政治体系的管理
"""
from flask import Blueprint, request, jsonify
from app.models import (
    EnergySystem, PowerLevel, CommonSkill,
    Civilization, CivilizationRegion, SocialClass, CulturalCustom,
    EnergyForm, PowerCost, EconomicSystem, PoliticalSystem,
    World, db
)

energy_society_bp = Blueprint('energy_society', __name__, url_prefix='/energy-society')


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


# ==================== 能量体系管理 ====================

@energy_society_bp.route('/energy-systems', methods=['GET'])
def get_energy_systems():
    """获取能量体系列表"""
    try:
        world_id = request.args.get('world_id', type=int)
        if not world_id:
            return error_response('缺少world_id参数', 400)
        
        systems = EnergySystem.query.filter_by(world_id=world_id).order_by(EnergySystem.order_index).all()
        return success_response([s.to_dict() for s in systems], '获取能量体系列表成功')
    except Exception as e:
        return error_response(f'获取能量体系列表失败: {str(e)}', 500)


@energy_society_bp.route('/energy-systems', methods=['POST'])
def create_energy_system():
    """创建能量体系"""
    try:
        data = request.get_json()
        if not data or 'name' not in data or 'world_id' not in data:
            return error_response('缺少必要参数', 400)
        
        world = World.query.get(data['world_id'])
        if not world:
            return error_response('世界不存在', 404)
        
        system = EnergySystem(
            world_id=data['world_id'],
            name=data['name'],
            energy_type=data.get('energy_type', '魔法'),
            description=data.get('description', ''),
            source=data.get('source', ''),
            acquisition_method=data.get('acquisition_method', ''),
            storage_method=data.get('storage_method', ''),
            usage_limitations=data.get('usage_limitations', ''),
            common_applications=data.get('common_applications', ''),
            rarity=data.get('rarity', '常见'),
            stability=data.get('stability', '稳定'),
            interaction_with_other_energies=data.get('interaction_with_other_energies', ''),
            cultivation_method=data.get('cultivation_method', ''),
            typical_manifestations=data.get('typical_manifestations', ''),
            order_index=data.get('order_index', 0)
        )
        
        db.session.add(system)
        db.session.commit()
        
        return success_response(system.to_dict(), '能量体系创建成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'创建能量体系失败: {str(e)}', 500)


@energy_society_bp.route('/energy-systems/<int:system_id>', methods=['GET'])
def get_energy_system(system_id):
    """获取能量体系详情"""
    try:
        system = EnergySystem.query.get(system_id)
        if not system:
            return error_response('能量体系不存在', 404)
        return success_response(system.to_dict(), '获取能量体系详情成功')
    except Exception as e:
        return error_response(f'获取能量体系详情失败: {str(e)}', 500)


@energy_society_bp.route('/energy-systems/<int:system_id>', methods=['PUT'])
def update_energy_system(system_id):
    """更新能量体系"""
    try:
        system = EnergySystem.query.get(system_id)
        if not system:
            return error_response('能量体系不存在', 404)
        
        data = request.get_json()
        if not data:
            return error_response('缺少请求数据', 400)
        
        for field in ['name', 'energy_type', 'description', 'source', 'acquisition_method',
                      'storage_method', 'usage_limitations', 'common_applications',
                      'rarity', 'stability', 'interaction_with_other_energies',
                      'cultivation_method', 'typical_manifestations', 'status', 'order_index']:
            if field in data:
                setattr(system, field, data[field])
        
        db.session.commit()
        return success_response(system.to_dict(), '能量体系更新成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'更新能量体系失败: {str(e)}', 500)


@energy_society_bp.route('/energy-systems/<int:system_id>', methods=['DELETE'])
def delete_energy_system(system_id):
    """删除能量体系"""
    try:
        system = EnergySystem.query.get(system_id)
        if not system:
            return error_response('能量体系不存在', 404)
        
        db.session.delete(system)
        db.session.commit()
        return success_response(None, '能量体系删除成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'删除能量体系失败: {str(e)}', 500)


# ==================== 力量等级管理 ====================

@energy_society_bp.route('/power-levels', methods=['GET'])
def get_power_levels():
    """获取力量等级列表"""
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


@energy_society_bp.route('/power-levels', methods=['POST'])
def create_power_level():
    """创建力量等级"""
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


@energy_society_bp.route('/power-levels/<int:level_id>', methods=['GET'])
def get_power_level(level_id):
    """获取力量等级详情"""
    try:
        level = PowerLevel.query.get(level_id)
        if not level:
            return error_response('力量等级不存在', 404)
        return success_response(level.to_dict(), '获取力量等级详情成功')
    except Exception as e:
        return error_response(f'获取力量等级详情失败: {str(e)}', 500)


@energy_society_bp.route('/power-levels/<int:level_id>', methods=['PUT'])
def update_power_level(level_id):
    """更新力量等级"""
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


@energy_society_bp.route('/power-levels/<int:level_id>', methods=['DELETE'])
def delete_power_level(level_id):
    """删除力量等级"""
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


# ==================== 通用技能管理 ====================

@energy_society_bp.route('/common-skills', methods=['GET'])
def get_common_skills():
    """获取通用技能列表"""
    try:
        world_id = request.args.get('world_id', type=int)
        skill_type = request.args.get('skill_type')
        
        if not world_id:
            return error_response('缺少world_id参数', 400)
        
        query = CommonSkill.query.filter_by(world_id=world_id)
        
        if skill_type:
            query = query.filter_by(skill_type=skill_type)
        
        skills = query.order_by(CommonSkill.order_index).all()
        return success_response([s.to_dict() for s in skills], '获取通用技能列表成功')
    except Exception as e:
        return error_response(f'获取通用技能列表失败: {str(e)}', 500)


@energy_society_bp.route('/common-skills', methods=['POST'])
def create_common_skill():
    """创建通用技能"""
    try:
        data = request.get_json()
        if not data or 'name' not in data or 'world_id' not in data:
            return error_response('缺少必要参数', 400)
        
        world = World.query.get(data['world_id'])
        if not world:
            return error_response('世界不存在', 404)
        
        skill = CommonSkill(
            world_id=data['world_id'],
            name=data['name'],
            skill_type=data.get('skill_type', '战斗'),
            description=data.get('description', ''),
            difficulty=data.get('difficulty', '普通'),
            requirements=data.get('requirements', ''),
            learning_time=data.get('learning_time', ''),
            commonality=data.get('commonality', '常见'),
            power_level_required=data.get('power_level_required', 0),
            energy_consumption=data.get('energy_consumption', ''),
            effects=data.get('effects', ''),
            limitations=data.get('limitations', ''),
            typical_users=data.get('typical_users', ''),
            energy_system_id=data.get('energy_system_id'),
            order_index=data.get('order_index', 0)
        )
        
        db.session.add(skill)
        db.session.commit()
        
        return success_response(skill.to_dict(), '通用技能创建成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'创建通用技能失败: {str(e)}', 500)


@energy_society_bp.route('/common-skills/<int:skill_id>', methods=['GET'])
def get_common_skill(skill_id):
    """获取通用技能详情"""
    try:
        skill = CommonSkill.query.get(skill_id)
        if not skill:
            return error_response('通用技能不存在', 404)
        return success_response(skill.to_dict(), '获取通用技能详情成功')
    except Exception as e:
        return error_response(f'获取通用技能详情失败: {str(e)}', 500)


@energy_society_bp.route('/common-skills/<int:skill_id>', methods=['PUT'])
def update_common_skill(skill_id):
    """更新通用技能"""
    try:
        skill = CommonSkill.query.get(skill_id)
        if not skill:
            return error_response('通用技能不存在', 404)
        
        data = request.get_json()
        if not data:
            return error_response('缺少请求数据', 400)
        
        for field in ['name', 'skill_type', 'description', 'difficulty', 'requirements',
                      'learning_time', 'commonality', 'power_level_required',
                      'energy_consumption', 'effects', 'limitations', 'typical_users',
                      'energy_system_id', 'status', 'order_index']:
            if field in data:
                setattr(skill, field, data[field])
        
        db.session.commit()
        return success_response(skill.to_dict(), '通用技能更新成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'更新通用技能失败: {str(e)}', 500)


@energy_society_bp.route('/common-skills/<int:skill_id>', methods=['DELETE'])
def delete_common_skill(skill_id):
    """删除通用技能"""
    try:
        skill = CommonSkill.query.get(skill_id)
        if not skill:
            return error_response('通用技能不存在', 404)
        
        db.session.delete(skill)
        db.session.commit()
        return success_response(None, '通用技能删除成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'删除通用技能失败: {str(e)}', 500)


# ==================== 文明管理 ====================

@energy_society_bp.route('/civilizations', methods=['GET'])
def get_civilizations():
    """获取文明列表"""
    try:
        world_id = request.args.get('world_id', type=int)
        if not world_id:
            return error_response('缺少world_id参数', 400)
        
        civilizations = Civilization.query.filter_by(world_id=world_id).order_by(Civilization.order_index).all()
        return success_response([c.to_dict() for c in civilizations], '获取文明列表成功')
    except Exception as e:
        return error_response(f'获取文明列表失败: {str(e)}', 500)


@energy_society_bp.route('/civilizations', methods=['POST'])
def create_civilization():
    """创建文明"""
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
            order_index=data.get('order_index', 0)
        )
        
        db.session.add(civilization)
        db.session.commit()
        
        return success_response(civilization.to_dict(), '文明创建成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'创建文明失败: {str(e)}', 500)


@energy_society_bp.route('/civilizations/<int:civilization_id>', methods=['GET'])
def get_civilization(civilization_id):
    """获取文明详情"""
    try:
        civilization = Civilization.query.get(civilization_id)
        if not civilization:
            return error_response('文明不存在', 404)
        return success_response(civilization.to_dict(), '获取文明详情成功')
    except Exception as e:
        return error_response(f'获取文明详情失败: {str(e)}', 500)


@energy_society_bp.route('/civilizations/<int:civilization_id>', methods=['PUT'])
def update_civilization(civilization_id):
    """更新文明"""
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


@energy_society_bp.route('/civilizations/<int:civilization_id>', methods=['DELETE'])
def delete_civilization(civilization_id):
    """删除文明"""
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


# ==================== 文明区域关联管理 ====================

@energy_society_bp.route('/civilization-regions', methods=['GET'])
def get_civilization_regions():
    """获取文明区域关联列表"""
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


@energy_society_bp.route('/civilization-regions', methods=['POST'])
def create_civilization_region():
    """创建文明区域关联"""
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


@energy_society_bp.route('/civilization-regions/<int:relation_id>', methods=['DELETE'])
def delete_civilization_region(relation_id):
    """删除文明区域关联"""
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


# ==================== 社会阶级管理 ====================

@energy_society_bp.route('/social-classes', methods=['GET'])
def get_social_classes():
    """获取社会阶级列表"""
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


@energy_society_bp.route('/social-classes', methods=['POST'])
def create_social_class():
    """创建社会阶级"""
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


@energy_society_bp.route('/social-classes/<int:class_id>', methods=['GET'])
def get_social_class(class_id):
    """获取社会阶级详情"""
    try:
        social_class = SocialClass.query.get(class_id)
        if not social_class:
            return error_response('社会阶级不存在', 404)
        return success_response(social_class.to_dict(), '获取社会阶级详情成功')
    except Exception as e:
        return error_response(f'获取社会阶级详情失败: {str(e)}', 500)


@energy_society_bp.route('/social-classes/<int:class_id>', methods=['PUT'])
def update_social_class(class_id):
    """更新社会阶级"""
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


@energy_society_bp.route('/social-classes/<int:class_id>', methods=['DELETE'])
def delete_social_class(class_id):
    """删除社会阶级"""
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


# ==================== 文化习俗管理 ====================

@energy_society_bp.route('/cultural-customs', methods=['GET'])
def get_cultural_customs():
    """获取文化习俗列表"""
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


@energy_society_bp.route('/cultural-customs', methods=['POST'])
def create_cultural_custom():
    """创建文化习俗"""
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


@energy_society_bp.route('/cultural-customs/<int:custom_id>', methods=['GET'])
def get_cultural_custom(custom_id):
    """获取文化习俗详情"""
    try:
        custom = CulturalCustom.query.get(custom_id)
        if not custom:
            return error_response('文化习俗不存在', 404)
        return success_response(custom.to_dict(), '获取文化习俗详情成功')
    except Exception as e:
        return error_response(f'获取文化习俗详情失败: {str(e)}', 500)


@energy_society_bp.route('/cultural-customs/<int:custom_id>', methods=['PUT'])
def update_cultural_custom(custom_id):
    """更新文化习俗"""
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


@energy_society_bp.route('/cultural-customs/<int:custom_id>', methods=['DELETE'])
def delete_cultural_custom(custom_id):
    """删除文化习俗"""
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


# ==================== 能量形态管理 ====================

@energy_society_bp.route('/energy-forms', methods=['GET'])
def get_energy_forms():
    """获取能量形态列表"""
    try:
        world_id = request.args.get('world_id', type=int)
        energy_system_id = request.args.get('energy_system_id', type=int)
        
        if not world_id:
            return error_response('缺少world_id参数', 400)
        
        query = EnergyForm.query.filter_by(world_id=world_id)
        
        if energy_system_id:
            query = query.filter_by(energy_system_id=energy_system_id)
        
        forms = query.order_by(EnergyForm.order_index).all()
        return success_response([f.to_dict() for f in forms], '获取能量形态列表成功')
    except Exception as e:
        return error_response(f'获取能量形态列表失败: {str(e)}', 500)


@energy_society_bp.route('/energy-forms', methods=['POST'])
def create_energy_form():
    """创建能量形态"""
    try:
        data = request.get_json()
        if not data or 'name' not in data or 'world_id' not in data:
            return error_response('缺少必要参数', 400)
        
        world = World.query.get(data['world_id'])
        if not world:
            return error_response('世界不存在', 404)
        
        form = EnergyForm(
            world_id=data['world_id'],
            energy_system_id=data.get('energy_system_id'),
            name=data['name'],
            form_type=data.get('form_type', '元素'),
            description=data.get('description', ''),
            basic_properties=data.get('basic_properties', ''),
            interaction_rules=data.get('interaction_rules', ''),
            purification_method=data.get('purification_method', ''),
            corruption_effects=data.get('corruption_effects', ''),
            visual_manifestation=data.get('visual_manifestation', ''),
            sensory_perception=data.get('sensory_perception', ''),
            order_index=data.get('order_index', 0)
        )
        
        db.session.add(form)
        db.session.commit()
        
        return success_response(form.to_dict(), '能量形态创建成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'创建能量形态失败: {str(e)}', 500)


@energy_society_bp.route('/energy-forms/<int:form_id>', methods=['GET'])
def get_energy_form(form_id):
    """获取能量形态详情"""
    try:
        form = EnergyForm.query.get(form_id)
        if not form:
            return error_response('能量形态不存在', 404)
        return success_response(form.to_dict(), '获取能量形态详情成功')
    except Exception as e:
        return error_response(f'获取能量形态详情失败: {str(e)}', 500)


@energy_society_bp.route('/energy-forms/<int:form_id>', methods=['PUT'])
def update_energy_form(form_id):
    """更新能量形态"""
    try:
        form = EnergyForm.query.get(form_id)
        if not form:
            return error_response('能量形态不存在', 404)
        
        data = request.get_json()
        if not data:
            return error_response('缺少请求数据', 400)
        
        for field in ['name', 'form_type', 'description', 'basic_properties',
                      'interaction_rules', 'purification_method', 'corruption_effects',
                      'visual_manifestation', 'sensory_perception', 'energy_system_id',
                      'status', 'order_index']:
            if field in data:
                setattr(form, field, data[field])
        
        db.session.commit()
        return success_response(form.to_dict(), '能量形态更新成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'更新能量形态失败: {str(e)}', 500)


@energy_society_bp.route('/energy-forms/<int:form_id>', methods=['DELETE'])
def delete_energy_form(form_id):
    """删除能量形态"""
    try:
        form = EnergyForm.query.get(form_id)
        if not form:
            return error_response('能量形态不存在', 404)
        
        db.session.delete(form)
        db.session.commit()
        return success_response(None, '能量形态删除成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'删除能量形态失败: {str(e)}', 500)


# ==================== 力量代价管理 ====================

@energy_society_bp.route('/power-costs', methods=['GET'])
def get_power_costs():
    """获取力量代价列表"""
    try:
        world_id = request.args.get('world_id', type=int)
        if not world_id:
            return error_response('缺少world_id参数', 400)
        
        costs = PowerCost.query.filter_by(world_id=world_id).order_by(PowerCost.order_index).all()
        return success_response([c.to_dict() for c in costs], '获取力量代价列表成功')
    except Exception as e:
        return error_response(f'获取力量代价列表失败: {str(e)}', 500)


@energy_society_bp.route('/power-costs', methods=['POST'])
def create_power_cost():
    """创建力量代价"""
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


@energy_society_bp.route('/power-costs/<int:cost_id>', methods=['GET'])
def get_power_cost(cost_id):
    """获取力量代价详情"""
    try:
        cost = PowerCost.query.get(cost_id)
        if not cost:
            return error_response('力量代价不存在', 404)
        return success_response(cost.to_dict(), '获取力量代价详情成功')
    except Exception as e:
        return error_response(f'获取力量代价详情失败: {str(e)}', 500)


@energy_society_bp.route('/power-costs/<int:cost_id>', methods=['PUT'])
def update_power_cost(cost_id):
    """更新力量代价"""
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


@energy_society_bp.route('/power-costs/<int:cost_id>', methods=['DELETE'])
def delete_power_cost(cost_id):
    """删除力量代价"""
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


# ==================== 经济体系管理 ====================

@energy_society_bp.route('/economic-systems', methods=['GET'])
def get_economic_systems():
    """获取经济体系列表"""
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


@energy_society_bp.route('/economic-systems', methods=['POST'])
def create_economic_system():
    """创建经济体系"""
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


@energy_society_bp.route('/economic-systems/<int:system_id>', methods=['GET'])
def get_economic_system(system_id):
    """获取经济体系详情"""
    try:
        system = EconomicSystem.query.get(system_id)
        if not system:
            return error_response('经济体系不存在', 404)
        return success_response(system.to_dict(), '获取经济体系详情成功')
    except Exception as e:
        return error_response(f'获取经济体系详情失败: {str(e)}', 500)


@energy_society_bp.route('/economic-systems/<int:system_id>', methods=['PUT'])
def update_economic_system(system_id):
    """更新经济体系"""
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


@energy_society_bp.route('/economic-systems/<int:system_id>', methods=['DELETE'])
def delete_economic_system(system_id):
    """删除经济体系"""
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


# ==================== 政治体系管理 ====================

@energy_society_bp.route('/political-systems', methods=['GET'])
def get_political_systems():
    """获取政治体系列表"""
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


@energy_society_bp.route('/political-systems', methods=['POST'])
def create_political_system():
    """创建政治体系"""
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


@energy_society_bp.route('/political-systems/<int:system_id>', methods=['GET'])
def get_political_system(system_id):
    """获取政治体系详情"""
    try:
        system = PoliticalSystem.query.get(system_id)
        if not system:
            return error_response('政治体系不存在', 404)
        return success_response(system.to_dict(), '获取政治体系详情成功')
    except Exception as e:
        return error_response(f'获取政治体系详情失败: {str(e)}', 500)


@energy_society_bp.route('/political-systems/<int:system_id>', methods=['PUT'])
def update_political_system(system_id):
    """更新政治体系"""
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


@energy_society_bp.route('/political-systems/<int:system_id>', methods=['DELETE'])
def delete_political_system(system_id):
    """删除政治体系"""
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

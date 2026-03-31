"""能量系统模块API"""
from flask import Blueprint, request, jsonify
from app.models import EnergySystem, EnergyForm, CommonSkill, World, db

energy_system_bp = Blueprint('energy_system', __name__, url_prefix='/energy-system')


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


@energy_system_bp.route('/energy-systems', methods=['GET'])
def get_energy_systems():
    try:
        world_id = request.args.get('world_id', type=int)
        if not world_id:
            return error_response('缺少world_id参数', 400)

        systems = EnergySystem.query.filter_by(world_id=world_id).order_by(EnergySystem.order_index).all()
        return success_response([s.to_dict() for s in systems], '获取能量体系列表成功')
    except Exception as e:
        return error_response(f'获取能量体系列表失败: {str(e)}', 500)


@energy_system_bp.route('/energy-systems', methods=['POST'])
def create_energy_system():
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


@energy_system_bp.route('/energy-systems/<int:system_id>', methods=['GET'])
def get_energy_system(system_id):
    try:
        system = EnergySystem.query.get(system_id)
        if not system:
            return error_response('能量体系不存在', 404)
        return success_response(system.to_dict(), '获取能量体系详情成功')
    except Exception as e:
        return error_response(f'获取能量体系详情失败: {str(e)}', 500)


@energy_system_bp.route('/energy-systems/<int:system_id>', methods=['PUT'])
def update_energy_system(system_id):
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


@energy_system_bp.route('/energy-systems/<int:system_id>', methods=['DELETE'])
def delete_energy_system(system_id):
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


@energy_system_bp.route('/energy-forms', methods=['GET'])
def get_energy_forms():
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


@energy_system_bp.route('/energy-forms', methods=['POST'])
def create_energy_form():
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


@energy_system_bp.route('/energy-forms/<int:form_id>', methods=['GET'])
def get_energy_form(form_id):
    try:
        form = EnergyForm.query.get(form_id)
        if not form:
            return error_response('能量形态不存在', 404)
        return success_response(form.to_dict(), '获取能量形态详情成功')
    except Exception as e:
        return error_response(f'获取能量形态详情失败: {str(e)}', 500)


@energy_system_bp.route('/energy-forms/<int:form_id>', methods=['PUT'])
def update_energy_form(form_id):
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


@energy_system_bp.route('/energy-forms/<int:form_id>', methods=['DELETE'])
def delete_energy_form(form_id):
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


@energy_system_bp.route('/common-skills', methods=['GET'])
def get_common_skills():
    try:
        world_id = request.args.get('world_id', type=int)
        if not world_id:
            return error_response('缺少world_id参数', 400)
        
        skills = CommonSkill.query.filter_by(world_id=world_id).order_by(CommonSkill.order_index).all()
        return success_response([s.to_dict() for s in skills], '获取通用技能列表成功')
    except Exception as e:
        return error_response(f'获取通用技能列表失败: {str(e)}', 500)


@energy_system_bp.route('/common-skills', methods=['POST'])
def create_common_skill():
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
            order_index=data.get('order_index', 0)
        )
        db.session.add(skill)
        db.session.commit()
        return success_response(skill.to_dict(), '通用技能创建成功', 201)
    except Exception as e:
        db.session.rollback()
        return error_response(f'创建通用技能失败: {str(e)}', 500)


@energy_system_bp.route('/common-skills/<int:skill_id>', methods=['GET'])
def get_common_skill(skill_id):
    try:
        skill = CommonSkill.query.get(skill_id)
        if not skill:
            return error_response('通用技能不存在', 404)
        return success_response(skill.to_dict(), '获取通用技能成功')
    except Exception as e:
        return error_response(f'获取通用技能失败: {str(e)}', 500)


@energy_system_bp.route('/common-skills/<int:skill_id>', methods=['PUT'])
def update_common_skill(skill_id):
    try:
        skill = CommonSkill.query.get(skill_id)
        if not skill:
            return error_response('通用技能不存在', 404)
        
        data = request.get_json()
        skill.name = data.get('name', skill.name)
        skill.skill_type = data.get('skill_type', skill.skill_type)
        skill.description = data.get('description', skill.description)
        skill.difficulty = data.get('difficulty', skill.difficulty)
        skill.requirements = data.get('requirements', skill.requirements)
        skill.learning_time = data.get('learning_time', skill.learning_time)
        skill.commonality = data.get('commonality', skill.commonality)
        skill.power_level_required = data.get('power_level_required', skill.power_level_required)
        skill.energy_consumption = data.get('energy_consumption', skill.energy_consumption)
        skill.effects = data.get('effects', skill.effects)
        skill.limitations = data.get('limitations', skill.limitations)
        skill.order_index = data.get('order_index', skill.order_index)
        
        db.session.commit()
        return success_response(skill.to_dict(), '通用技能更新成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'更新通用技能失败: {str(e)}', 500)


@energy_system_bp.route('/common-skills/<int:skill_id>', methods=['DELETE'])
def delete_common_skill(skill_id):
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

from flask import Blueprint, request, jsonify
from app import db
from datetime import datetime
from app.models import (
    World, Character, Location, Faction, HistoricalEvent, Item,
    Dimension, Region, CelestialBody, NaturalLaw, EnergySystem,
    Ability, Skill, Talent, Race, Creature, SpecialCreature,
    Civilization, SocialClass, CulturalCustom, EconomicSystem, PoliticalSystem,
    EnergyForm, PowerLevel, PowerCost, CommonSkill, CivilizationRegion,
    HistoricalEra, HistoricalFigure, EventParticipant,
    Timeline, DataAssociation, Tag, EntityTag, EntityRelation,
    CharacterTrait, CharacterAbility, CharacterRelationship,
    FactionStructure, FactionGoal, LocationStructure, SpecialLocation,
    EquipmentSystem, SpecialItem,
)

def now_utc_plus_8():
    """获取UTC+8时间"""
    return datetime.utcnow()

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
        if 'core_concept' in data:
            world.core_concept = data.get('core_concept', world.core_concept)
        if 'core_rules' in data:
            world.core_concept = data.get('core_rules', world.core_concept)
        world.world_type = data.get('world_type', world.world_type)
        world.description = data.get('description', world.description)
        world.creation_origin = data.get('creation_origin', world.creation_origin)
        world.world_essence = data.get('world_essence', world.world_essence)
        world.status = data.get('status', world.status)
        world.updated_at = now_utc_plus_8()

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
    """删除世界及其所有关联数据"""
    try:
        world = World.query.get(world_id)
        if not world:
            return jsonify({
                'code': 404,
                'message': '世界不存在'
            }), 404

        Dimension.query.filter_by(world_id=world_id).delete()
        Region.query.filter_by(world_id=world_id).delete()
        CelestialBody.query.filter_by(world_id=world_id).delete()
        NaturalLaw.query.filter_by(world_id=world_id).delete()

        EnergySystem.query.filter_by(world_id=world_id).delete()
        EnergyForm.query.filter_by(world_id=world_id).delete()
        PowerLevel.query.filter_by(world_id=world_id).delete()
        PowerCost.query.filter_by(world_id=world_id).delete()
        CommonSkill.query.filter_by(world_id=world_id).delete()
        Ability.query.filter_by(world_id=world_id).delete()
        Skill.query.filter_by(world_id=world_id).delete()
        Talent.query.filter_by(world_id=world_id).delete()
        Race.query.filter_by(world_id=world_id).delete()
        Creature.query.filter_by(world_id=world_id).delete()

        Civilization.query.filter_by(world_id=world_id).delete()
        SocialClass.query.filter_by(world_id=world_id).delete()
        CulturalCustom.query.filter_by(world_id=world_id).delete()
        EconomicSystem.query.filter_by(world_id=world_id).delete()
        PoliticalSystem.query.filter_by(world_id=world_id).delete()

        Character.query.filter_by(world_id=world_id).delete()

        Location.query.filter_by(world_id=world_id).delete()

        Faction.query.filter_by(world_id=world_id).delete()

        HistoricalEvent.query.filter_by(world_id=world_id).delete()
        HistoricalEra.query.filter_by(world_id=world_id).delete()
        HistoricalFigure.query.filter_by(world_id=world_id).delete()
        EventParticipant.query.filter(
            EventParticipant.event_id.in_(
                db.session.query(HistoricalEvent.id).filter_by(world_id=world_id)
            )
        ).delete(synchronize_session=False)

        Timeline.query.filter_by(world_id=world_id).delete()
        DataAssociation.query.filter_by(project_id=world.project_id).delete()

        Tag.query.filter_by(world_id=world_id).delete()
        EntityTag.query.filter(
            EntityTag.tag_id.in_(
                db.session.query(Tag.id).filter_by(world_id=world_id)
            )
        ).delete(synchronize_session=False)

        EntityRelation.query.filter_by(world_id=world_id).delete()

        SpecialCreature.query.filter_by(world_id=world_id).delete()

        CharacterTrait.query.filter_by(project_id=world.project_id).delete()
        CharacterAbility.query.filter_by(project_id=world.project_id).delete()
        CharacterRelationship.query.filter_by(project_id=world.project_id).delete()

        FactionStructure.query.filter_by(project_id=world.project_id).delete()
        FactionGoal.query.filter_by(project_id=world.project_id).delete()

        LocationStructure.query.filter_by(project_id=world.project_id).delete()
        SpecialLocation.query.filter_by(project_id=world.project_id).delete()

        EquipmentSystem.query.filter_by(project_id=world.project_id).delete()
        SpecialItem.query.filter_by(project_id=world.project_id).delete()

        CivilizationRegion.query.filter(
            CivilizationRegion.civilization_id.in_(
                db.session.query(Civilization.id).filter_by(world_id=world_id)
            )
        ).delete(synchronize_session=False)

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

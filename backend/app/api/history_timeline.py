"""
历史脉络模块API
包含历史纪元、历史事件、历史人物、事件-人物关联的管理
"""
from flask import Blueprint, request, jsonify
from app.models import (
    HistoricalEra, HistoricalEvent, HistoricalFigure, EventParticipant,
    World, db
)

history_timeline_bp = Blueprint('history_timeline', __name__, url_prefix='/history-timeline')


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


# ==================== 历史纪元管理 ====================

@history_timeline_bp.route('/eras', methods=['GET'])
def get_historical_eras():
    """获取历史纪元列表"""
    try:
        world_id = request.args.get('world_id', type=int)
        if not world_id:
            return error_response('缺少world_id参数', 400)
        
        eras = HistoricalEra.query.filter_by(world_id=world_id).order_by(HistoricalEra.order_index).all()
        return success_response([e.to_dict() for e in eras], '获取历史纪元列表成功')
    except Exception as e:
        return error_response(f'获取历史纪元列表失败: {str(e)}', 500)


@history_timeline_bp.route('/eras', methods=['POST'])
def create_historical_era():
    """创建历史纪元"""
    try:
        data = request.get_json()
        if not data or 'name' not in data or 'world_id' not in data:
            return error_response('缺少必要参数', 400)
        
        world = World.query.get(data['world_id'])
        if not world:
            return error_response('世界不存在', 404)
        
        era = HistoricalEra(
            world_id=data['world_id'],
            name=data['name'],
            start_year=data.get('start_year', ''),
            end_year=data.get('end_year', ''),
            duration_description=data.get('duration_description', ''),
            main_characteristics=data.get('main_characteristics', ''),
            key_technologies=data.get('key_technologies', ''),
            dominant_civilizations=data.get('dominant_civilizations', ''),
            ending_cause=data.get('ending_cause', ''),
            legacy_impact=data.get('legacy_impact', ''),
            description=data.get('description', ''),
            order_index=data.get('order_index', 0)
        )
        
        db.session.add(era)
        db.session.commit()
        
        return success_response(era.to_dict(), '历史纪元创建成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'创建历史纪元失败: {str(e)}', 500)


@history_timeline_bp.route('/eras/<int:era_id>', methods=['GET'])
def get_historical_era(era_id):
    """获取历史纪元详情"""
    try:
        era = HistoricalEra.query.get(era_id)
        if not era:
            return error_response('历史纪元不存在', 404)
        return success_response(era.to_dict(), '获取历史纪元详情成功')
    except Exception as e:
        return error_response(f'获取历史纪元详情失败: {str(e)}', 500)


@history_timeline_bp.route('/eras/<int:era_id>', methods=['PUT'])
def update_historical_era(era_id):
    """更新历史纪元"""
    try:
        era = HistoricalEra.query.get(era_id)
        if not era:
            return error_response('历史纪元不存在', 404)
        
        data = request.get_json()
        if not data:
            return error_response('缺少请求数据', 400)
        
        for field in ['name', 'start_year', 'end_year', 'duration_description',
                      'main_characteristics', 'key_technologies', 'dominant_civilizations',
                      'ending_cause', 'legacy_impact', 'description', 'status', 'order_index']:
            if field in data:
                setattr(era, field, data[field])
        
        db.session.commit()
        return success_response(era.to_dict(), '历史纪元更新成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'更新历史纪元失败: {str(e)}', 500)


@history_timeline_bp.route('/eras/<int:era_id>', methods=['DELETE'])
def delete_historical_era(era_id):
    """删除历史纪元"""
    try:
        era = HistoricalEra.query.get(era_id)
        if not era:
            return error_response('历史纪元不存在', 404)
        
        db.session.delete(era)
        db.session.commit()
        return success_response(None, '历史纪元删除成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'删除历史纪元失败: {str(e)}', 500)


# ==================== 历史事件管理 ====================

@history_timeline_bp.route('/events', methods=['GET'])
def get_historical_events():
    """获取历史事件列表"""
    try:
        world_id = request.args.get('world_id', type=int)
        era_id = request.args.get('era_id', type=int)
        event_type = request.args.get('event_type')
        
        if not world_id:
            return error_response('缺少world_id参数', 400)
        
        query = HistoricalEvent.query.filter_by(world_id=world_id)
        
        if era_id:
            query = query.filter_by(era_id=era_id)
        if event_type:
            query = query.filter_by(event_type=event_type)
        
        events = query.order_by(HistoricalEvent.order_index).all()
        return success_response([e.to_dict() for e in events], '获取历史事件列表成功')
    except Exception as e:
        return error_response(f'获取历史事件列表失败: {str(e)}', 500)


@history_timeline_bp.route('/events', methods=['POST'])
def create_historical_event():
    """创建历史事件"""
    try:
        data = request.get_json()
        if not data or 'name' not in data or 'world_id' not in data:
            return error_response('缺少必要参数', 400)
        
        world = World.query.get(data['world_id'])
        if not world:
            return error_response('世界不存在', 404)
        
        event = HistoricalEvent(
            world_id=data['world_id'],
            era_id=data.get('era_id'),
            name=data['name'],
            event_type=data.get('event_type', '战争'),
            description=data.get('description', ''),
            start_year=data.get('start_year', ''),
            end_year=data.get('end_year', ''),
            location_ids=data.get('location_ids', ''),
            primary_causes=data.get('primary_causes', ''),
            key_participants=data.get('key_participants', ''),
            event_sequence=data.get('event_sequence', ''),
            immediate_outcomes=data.get('immediate_outcomes', ''),
            long_term_consequences=data.get('long_term_consequences', ''),
            historical_significance=data.get('historical_significance', ''),
            conflicting_accounts=data.get('conflicting_accounts', ''),
            importance_level=data.get('importance_level', 5),
            order_index=data.get('order_index', 0)
        )
        
        db.session.add(event)
        db.session.commit()
        
        return success_response(event.to_dict(), '历史事件创建成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'创建历史事件失败: {str(e)}', 500)


@history_timeline_bp.route('/events/<int:event_id>', methods=['GET'])
def get_historical_event(event_id):
    """获取历史事件详情"""
    try:
        event = HistoricalEvent.query.get(event_id)
        if not event:
            return error_response('历史事件不存在', 404)
        return success_response(event.to_dict(), '获取历史事件详情成功')
    except Exception as e:
        return error_response(f'获取历史事件详情失败: {str(e)}', 500)


@history_timeline_bp.route('/events/<int:event_id>', methods=['PUT'])
def update_historical_event(event_id):
    """更新历史事件"""
    try:
        event = HistoricalEvent.query.get(event_id)
        if not event:
            return error_response('历史事件不存在', 404)
        
        data = request.get_json()
        if not data:
            return error_response('缺少请求数据', 400)
        
        for field in ['name', 'event_type', 'description', 'start_year', 'end_year',
                      'location_ids', 'primary_causes', 'key_participants', 'event_sequence',
                      'immediate_outcomes', 'long_term_consequences', 'historical_significance',
                      'conflicting_accounts', 'importance_level', 'era_id', 'status', 'order_index']:
            if field in data:
                setattr(event, field, data[field])
        
        db.session.commit()
        return success_response(event.to_dict(), '历史事件更新成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'更新历史事件失败: {str(e)}', 500)


@history_timeline_bp.route('/events/<int:event_id>', methods=['DELETE'])
def delete_historical_event(event_id):
    """删除历史事件"""
    try:
        event = HistoricalEvent.query.get(event_id)
        if not event:
            return error_response('历史事件不存在', 404)
        
        db.session.delete(event)
        db.session.commit()
        return success_response(None, '历史事件删除成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'删除历史事件失败: {str(e)}', 500)


# ==================== 历史人物管理 ====================

@history_timeline_bp.route('/figures', methods=['GET'])
def get_historical_figures():
    """获取历史人物列表"""
    try:
        world_id = request.args.get('world_id', type=int)
        civilization_id = request.args.get('civilization_id', type=int)
        primary_role = request.args.get('primary_role')
        
        if not world_id:
            return error_response('缺少world_id参数', 400)
        
        query = HistoricalFigure.query.filter_by(world_id=world_id)
        
        if civilization_id:
            query = query.filter_by(civilization_id=civilization_id)
        if primary_role:
            query = query.filter_by(primary_role=primary_role)
        
        figures = query.order_by(HistoricalFigure.importance_level.desc()).all()
        return success_response([f.to_dict() for f in figures], '获取历史人物列表成功')
    except Exception as e:
        return error_response(f'获取历史人物列表失败: {str(e)}', 500)


@history_timeline_bp.route('/figures', methods=['POST'])
def create_historical_figure():
    """创建历史人物"""
    try:
        data = request.get_json()
        if not data or 'name' not in data or 'world_id' not in data:
            return error_response('缺少必要参数', 400)
        
        world = World.query.get(data['world_id'])
        if not world:
            return error_response('世界不存在', 404)
        
        figure = HistoricalFigure(
            world_id=data['world_id'],
            civilization_id=data.get('civilization_id'),
            character_id=data.get('character_id'),
            name=data['name'],
            birth_year=data.get('birth_year', ''),
            death_year=data.get('death_year', ''),
            birth_place_id=data.get('birth_place_id'),
            death_place_id=data.get('death_place_id'),
            primary_role=data.get('primary_role', ''),
            social_class=data.get('social_class', ''),
            key_achievements=data.get('key_achievements', ''),
            controversies=data.get('controversies', ''),
            historical_legacy=data.get('historical_legacy', ''),
            description=data.get('description', ''),
            importance_level=data.get('importance_level', 5),
            order_index=data.get('order_index', 0)
        )
        
        db.session.add(figure)
        db.session.commit()
        
        return success_response(figure.to_dict(), '历史人物创建成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'创建历史人物失败: {str(e)}', 500)


@history_timeline_bp.route('/figures/<int:figure_id>', methods=['GET'])
def get_historical_figure(figure_id):
    """获取历史人物详情"""
    try:
        figure = HistoricalFigure.query.get(figure_id)
        if not figure:
            return error_response('历史人物不存在', 404)
        return success_response(figure.to_dict(), '获取历史人物详情成功')
    except Exception as e:
        return error_response(f'获取历史人物详情失败: {str(e)}', 500)


@history_timeline_bp.route('/figures/<int:figure_id>', methods=['PUT'])
def update_historical_figure(figure_id):
    """更新历史人物"""
    try:
        figure = HistoricalFigure.query.get(figure_id)
        if not figure:
            return error_response('历史人物不存在', 404)
        
        data = request.get_json()
        if not data:
            return error_response('缺少请求数据', 400)
        
        for field in ['name', 'birth_year', 'death_year', 'birth_place_id', 'death_place_id',
                      'primary_role', 'social_class', 'key_achievements', 'controversies',
                      'historical_legacy', 'description', 'importance_level',
                      'civilization_id', 'character_id', 'status', 'order_index']:
            if field in data:
                setattr(figure, field, data[field])
        
        db.session.commit()
        return success_response(figure.to_dict(), '历史人物更新成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'更新历史人物失败: {str(e)}', 500)


@history_timeline_bp.route('/figures/<int:figure_id>', methods=['DELETE'])
def delete_historical_figure(figure_id):
    """删除历史人物"""
    try:
        figure = HistoricalFigure.query.get(figure_id)
        if not figure:
            return error_response('历史人物不存在', 404)
        
        db.session.delete(figure)
        db.session.commit()
        return success_response(None, '历史人物删除成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'删除历史人物失败: {str(e)}', 500)


# ==================== 事件-人物关联管理 ====================

@history_timeline_bp.route('/event-participants', methods=['GET'])
def get_event_participants():
    """获取事件参与者列表"""
    try:
        event_id = request.args.get('event_id', type=int)
        figure_id = request.args.get('figure_id', type=int)
        
        query = EventParticipant.query
        
        if event_id:
            query = query.filter_by(event_id=event_id)
        if figure_id:
            query = query.filter_by(figure_id=figure_id)
        
        participants = query.all()
        return success_response([p.to_dict() for p in participants], '获取事件参与者列表成功')
    except Exception as e:
        return error_response(f'获取事件参与者列表失败: {str(e)}', 500)


@history_timeline_bp.route('/event-participants', methods=['POST'])
def create_event_participant():
    """创建事件参与者关联"""
    try:
        data = request.get_json()
        if not data or 'event_id' not in data or 'figure_id' not in data:
            return error_response('缺少必要参数', 400)
        
        participant = EventParticipant(
            event_id=data['event_id'],
            figure_id=data['figure_id'],
            role_type=data.get('role_type', '参与者'),
            contribution_level=data.get('contribution_level', 5),
            motivation=data.get('motivation', ''),
            outcome_for_participant=data.get('outcome_for_participant', ''),
            description=data.get('description', '')
        )
        
        db.session.add(participant)
        db.session.commit()
        
        return success_response(participant.to_dict(), '事件参与者关联创建成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'创建事件参与者关联失败: {str(e)}', 500)


@history_timeline_bp.route('/event-participants/<int:participant_id>', methods=['PUT'])
def update_event_participant(participant_id):
    """更新事件参与者关联"""
    try:
        participant = EventParticipant.query.get(participant_id)
        if not participant:
            return error_response('关联不存在', 404)
        
        data = request.get_json()
        if not data:
            return error_response('缺少请求数据', 400)
        
        for field in ['role_type', 'contribution_level', 'motivation', 'outcome_for_participant', 'description']:
            if field in data:
                setattr(participant, field, data[field])
        
        db.session.commit()
        return success_response(participant.to_dict(), '事件参与者关联更新成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'更新事件参与者关联失败: {str(e)}', 500)


@history_timeline_bp.route('/event-participants/<int:participant_id>', methods=['DELETE'])
def delete_event_participant(participant_id):
    """删除事件参与者关联"""
    try:
        participant = EventParticipant.query.get(participant_id)
        if not participant:
            return error_response('关联不存在', 404)
        
        db.session.delete(participant)
        db.session.commit()
        return success_response(None, '事件参与者关联删除成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'删除事件参与者关联失败: {str(e)}', 500)

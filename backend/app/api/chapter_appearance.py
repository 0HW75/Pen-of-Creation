"""
实体章节出现索引API
管理世界观实体在章节中的出现记录
"""
from flask import Blueprint, request, jsonify
from app.models import (
    EntityChapterAppearance, Chapter, World, Character, Location, Item, Faction,
    Civilization, HistoricalEvent, HistoricalFigure, Dimension, Region,
    EnergySystem, PowerLevel, CommonSkill, db
)
from sqlalchemy import or_

chapter_appearance_bp = Blueprint('chapter_appearance', __name__, url_prefix='/chapter-appearances')


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


ENTITY_MODEL_MAP = {
    'character': {'model': Character, 'name': '角色'},
    'location': {'model': Location, 'name': '地点'},
    'item': {'model': Item, 'name': '物品'},
    'faction': {'model': Faction, 'name': '势力'},
    'civilization': {'model': Civilization, 'name': '文明'},
    'historical_event': {'model': HistoricalEvent, 'name': '历史事件'},
    'historical_figure': {'model': HistoricalFigure, 'name': '历史人物'},
    'dimension': {'model': Dimension, 'name': '维度'},
    'region': {'model': Region, 'name': '区域'},
    'energy_system': {'model': EnergySystem, 'name': '能量体系'},
    'power_level': {'model': PowerLevel, 'name': '力量等级'},
    'common_skill': {'model': CommonSkill, 'name': '通用技能'},
}

APPEARANCE_TYPES = [
    {'value': '首次出现', 'label': '首次出现', 'color': '#52c41a'},
    {'value': '重要事件', 'label': '重要事件', 'color': '#f5222d'},
    {'value': '提及', 'label': '提及', 'color': '#1890ff'},
    {'value': '回忆', 'label': '回忆', 'color': '#722ed1'},
    {'value': '客串', 'label': '客串', 'color': '#faad14'},
    {'value': '死亡', 'label': '死亡', 'color': '#8c8c8c'},
]


@chapter_appearance_bp.route('/appearance-types', methods=['GET'])
def get_appearance_types():
    """获取出现类型列表"""
    return success_response(APPEARANCE_TYPES, '获取出现类型成功')


@chapter_appearance_bp.route('/entity-types', methods=['GET'])
def get_entity_types():
    """获取支持的实体类型列表"""
    types = [{'value': k, 'label': v['name']} for k, v in ENTITY_MODEL_MAP.items()]
    return success_response(types, '获取实体类型成功')


@chapter_appearance_bp.route('/', methods=['GET'])
def get_appearances():
    """获取章节出现记录列表"""
    try:
        project_id = request.args.get('project_id', type=int)
        chapter_id = request.args.get('chapter_id', type=int)
        entity_type = request.args.get('entity_type')
        entity_id = request.args.get('entity_id', type=int)
        appearance_type = request.args.get('appearance_type')
        
        query = EntityChapterAppearance.query
        
        if project_id:
            query = query.filter_by(project_id=project_id)
        if chapter_id:
            query = query.filter_by(chapter_id=chapter_id)
        if entity_type:
            query = query.filter_by(entity_type=entity_type)
        if entity_id:
            query = query.filter_by(entity_id=entity_id)
        if appearance_type:
            query = query.filter_by(appearance_type=appearance_type)
        
        appearances = query.order_by(EntityChapterAppearance.created_at.desc()).all()
        
        result = []
        for app in appearances:
            app_dict = app.to_dict()
            chapter = Chapter.query.get(app.chapter_id)
            app_dict['chapter_title'] = chapter.title if chapter else '未知章节'
            app_dict['chapter_order'] = chapter.order_index if chapter else 0
            
            entity_config = ENTITY_MODEL_MAP.get(app.entity_type)
            if entity_config:
                entity = entity_config['model'].query.get(app.entity_id)
                app_dict['entity_name'] = entity.name if entity else '已删除'
                app_dict['entity_type_name'] = entity_config['name']
            else:
                app_dict['entity_name'] = '未知'
                app_dict['entity_type_name'] = app.entity_type
            
            result.append(app_dict)
        
        return success_response(result, '获取章节出现记录成功')
    except Exception as e:
        return error_response(f'获取章节出现记录失败: {str(e)}', 500)


@chapter_appearance_bp.route('/entity/<entity_type>/<int:entity_id>', methods=['GET'])
def get_entity_appearances(entity_type, entity_id):
    """获取实体在所有章节的出现记录"""
    try:
        appearances = EntityChapterAppearance.query.filter_by(
            entity_type=entity_type,
            entity_id=entity_id
        ).order_by(EntityChapterAppearance.created_at).all()
        
        result = []
        for app in appearances:
            app_dict = app.to_dict()
            chapter = Chapter.query.get(app.chapter_id)
            if chapter:
                app_dict['chapter_title'] = chapter.title
                app_dict['chapter_order'] = chapter.order_index
                app_dict['volume'] = chapter.volume
                app_dict['volume_id'] = chapter.volume_id
            else:
                app_dict['chapter_title'] = '未知章节'
                app_dict['chapter_order'] = 0
                app_dict['volume'] = ''
                app_dict['volume_id'] = None
            
            appearance_type_info = next(
                (t for t in APPEARANCE_TYPES if t['value'] == app.appearance_type),
                {'value': app.appearance_type, 'label': app.appearance_type, 'color': '#999'}
            )
            app_dict['appearance_type_info'] = appearance_type_info
            
            result.append(app_dict)
        
        result.sort(key=lambda x: x.get('chapter_order', 0))
        
        return success_response(result, '获取实体章节出现记录成功')
    except Exception as e:
        return error_response(f'获取实体章节出现记录失败: {str(e)}', 500)


@chapter_appearance_bp.route('/chapter/<int:chapter_id>', methods=['GET'])
def get_chapter_entities(chapter_id):
    """获取章节中出现的所有实体"""
    try:
        appearances = EntityChapterAppearance.query.filter_by(chapter_id=chapter_id).all()
        
        result = []
        for app in appearances:
            app_dict = app.to_dict()
            entity_config = ENTITY_MODEL_MAP.get(app.entity_type)
            if entity_config:
                entity = entity_config['model'].query.get(app.entity_id)
                if entity:
                    app_dict['entity_name'] = entity.name
                    app_dict['entity_type_name'] = entity_config['name']
                    app_dict['entity_description'] = getattr(entity, 'description', '')[:100] if hasattr(entity, 'description') else ''
                    result.append(app_dict)
        
        return success_response(result, '获取章节实体成功')
    except Exception as e:
        return error_response(f'获取章节实体失败: {str(e)}', 500)


@chapter_appearance_bp.route('/', methods=['POST'])
def create_appearance():
    """创建章节出现记录"""
    try:
        data = request.get_json()
        if not data or 'chapter_id' not in data or 'entity_type' not in data or 'entity_id' not in data:
            return error_response('缺少必要参数', 400)
        
        chapter = Chapter.query.get(data['chapter_id'])
        if not chapter:
            return error_response('章节不存在', 404)
        
        entity_config = ENTITY_MODEL_MAP.get(data['entity_type'])
        if not entity_config:
            return error_response('不支持的实体类型', 400)
        
        entity = entity_config['model'].query.get(data['entity_id'])
        if not entity:
            return error_response('实体不存在', 404)
        
        existing = EntityChapterAppearance.query.filter_by(
            chapter_id=data['chapter_id'],
            entity_type=data['entity_type'],
            entity_id=data['entity_id']
        ).first()
        
        if existing:
            for field in ['appearance_type', 'description']:
                if field in data:
                    setattr(existing, field, data[field])
            db.session.commit()
            return success_response(existing.to_dict(), '更新章节出现记录成功')
        
        appearance = EntityChapterAppearance(
            project_id=chapter.project_id,
            chapter_id=data['chapter_id'],
            entity_type=data['entity_type'],
            entity_id=data['entity_id'],
            appearance_type=data.get('appearance_type', '提及'),
            description=data.get('description', '')
        )
        
        db.session.add(appearance)
        db.session.commit()
        
        return success_response(appearance.to_dict(), '创建章节出现记录成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'创建章节出现记录失败: {str(e)}', 500)


@chapter_appearance_bp.route('/batch', methods=['POST'])
def batch_create_appearances():
    """批量创建章节出现记录"""
    try:
        data = request.get_json()
        if not data or 'chapter_id' not in data or 'entities' not in data:
            return error_response('缺少必要参数', 400)
        
        chapter = Chapter.query.get(data['chapter_id'])
        if not chapter:
            return error_response('章节不存在', 404)
        
        created = []
        for entity_data in data['entities']:
            if 'entity_type' not in entity_data or 'entity_id' not in entity_data:
                continue
            
            existing = EntityChapterAppearance.query.filter_by(
                chapter_id=data['chapter_id'],
                entity_type=entity_data['entity_type'],
                entity_id=entity_data['entity_id']
            ).first()
            
            if existing:
                for field in ['appearance_type', 'description']:
                    if field in entity_data:
                        setattr(existing, field, entity_data[field])
                created.append(existing.to_dict())
            else:
                appearance = EntityChapterAppearance(
                    project_id=chapter.project_id,
                    chapter_id=data['chapter_id'],
                    entity_type=entity_data['entity_type'],
                    entity_id=entity_data['entity_id'],
                    appearance_type=entity_data.get('appearance_type', '提及'),
                    description=entity_data.get('description', '')
                )
                db.session.add(appearance)
                created.append(appearance.to_dict())
        
        db.session.commit()
        return success_response(created, '批量创建章节出现记录成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'批量创建章节出现记录失败: {str(e)}', 500)


@chapter_appearance_bp.route('/<int:appearance_id>', methods=['PUT'])
def update_appearance(appearance_id):
    """更新章节出现记录"""
    try:
        appearance = EntityChapterAppearance.query.get(appearance_id)
        if not appearance:
            return error_response('记录不存在', 404)
        
        data = request.get_json()
        if not data:
            return error_response('缺少请求数据', 400)
        
        for field in ['appearance_type', 'description']:
            if field in data:
                setattr(appearance, field, data[field])
        
        db.session.commit()
        return success_response(appearance.to_dict(), '更新章节出现记录成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'更新章节出现记录失败: {str(e)}', 500)


@chapter_appearance_bp.route('/<int:appearance_id>', methods=['DELETE'])
def delete_appearance(appearance_id):
    """删除章节出现记录"""
    try:
        appearance = EntityChapterAppearance.query.get(appearance_id)
        if not appearance:
            return error_response('记录不存在', 404)
        
        db.session.delete(appearance)
        db.session.commit()
        return success_response(None, '删除章节出现记录成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'删除章节出现记录失败: {str(e)}', 500)


@chapter_appearance_bp.route('/entity/<entity_type>/<int:entity_id>', methods=['DELETE'])
def delete_entity_appearances(entity_type, entity_id):
    """删除实体的所有章节出现记录"""
    try:
        EntityChapterAppearance.query.filter_by(
            entity_type=entity_type,
            entity_id=entity_id
        ).delete()
        db.session.commit()
        return success_response(None, '删除实体章节出现记录成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'删除实体章节出现记录失败: {str(e)}', 500)


@chapter_appearance_bp.route('/chapter/<int:chapter_id>', methods=['DELETE'])
def delete_chapter_appearances(chapter_id):
    """删除章节的所有实体出现记录"""
    try:
        EntityChapterAppearance.query.filter_by(chapter_id=chapter_id).delete()
        db.session.commit()
        return success_response(None, '删除章节实体出现记录成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'删除章节实体出现记录失败: {str(e)}', 500)


@chapter_appearance_bp.route('/search-entities', methods=['GET'])
def search_entities():
    """搜索实体（用于添加章节出现记录时选择实体）"""
    try:
        project_id = request.args.get('project_id', type=int)
        entity_type = request.args.get('entity_type')
        keyword = request.args.get('keyword', '')
        
        if not project_id or not entity_type:
            return error_response('缺少必要参数', 400)
        
        entity_config = ENTITY_MODEL_MAP.get(entity_type)
        if not entity_config:
            return error_response('不支持的实体类型', 400)
        
        model = entity_config['model']
        query = model.query
        
        if hasattr(model, 'project_id'):
            query = query.filter_by(project_id=project_id)
        elif hasattr(model, 'world_id'):
            from app.models import World
            world_ids = [w.id for w in World.query.filter_by(project_id=project_id).all()]
            query = query.filter(model.world_id.in_(world_ids))
        
        if keyword:
            query = query.filter(model.name.ilike(f'%{keyword}%'))
        
        entities = query.limit(20).all()
        
        result = [{
            'id': e.id,
            'name': e.name,
            'description': getattr(e, 'description', '')[:100] if hasattr(e, 'description') else ''
        } for e in entities]
        
        return success_response(result, '搜索实体成功')
    except Exception as e:
        return error_response(f'搜索实体失败: {str(e)}', 500)


@chapter_appearance_bp.route('/stats/<int:project_id>', methods=['GET'])
def get_appearance_stats(project_id):
    """获取项目的章节出现统计"""
    try:
        total_appearances = EntityChapterAppearance.query.filter_by(project_id=project_id).count()
        
        entity_type_stats = {}
        for entity_type, config in ENTITY_MODEL_MAP.items():
            count = EntityChapterAppearance.query.filter_by(
                project_id=project_id,
                entity_type=entity_type
            ).count()
            if count > 0:
                entity_type_stats[entity_type] = {
                    'name': config['name'],
                    'count': count
                }
        
        appearance_type_stats = {}
        appearances = EntityChapterAppearance.query.filter_by(project_id=project_id).all()
        for app in appearances:
            appearance_type_stats[app.appearance_type] = appearance_type_stats.get(app.appearance_type, 0) + 1
        
        chapters = Chapter.query.filter_by(project_id=project_id).all()
        chapter_stats = []
        for chapter in chapters:
            count = EntityChapterAppearance.query.filter_by(
                project_id=project_id,
                chapter_id=chapter.id
            ).count()
            if count > 0:
                chapter_stats.append({
                    'chapter_id': chapter.id,
                    'chapter_title': chapter.title,
                    'chapter_order': chapter.order_index,
                    'entity_count': count
                })
        
        chapter_stats.sort(key=lambda x: x['chapter_order'])
        
        return success_response({
            'total_appearances': total_appearances,
            'entity_type_stats': entity_type_stats,
            'appearance_type_stats': appearance_type_stats,
            'chapter_stats': chapter_stats
        }, '获取章节出现统计成功')
    except Exception as e:
        return error_response(f'获取章节出现统计失败: {str(e)}', 500)

"""
标签与关系网络模块API
包含标签管理、实体标签关联、实体关系网络的管理
"""
from flask import Blueprint, request, jsonify
from app.models import (
    Tag, EntityTag, EntityRelation,
    World, db
)

tags_relations_bp = Blueprint('tags_relations', __name__, url_prefix='/tags-relations')


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


# ==================== 标签管理 ====================

@tags_relations_bp.route('/tags', methods=['GET'])
def get_tags():
    """获取标签列表"""
    try:
        world_id = request.args.get('world_id', type=int)
        tag_type = request.args.get('tag_type')
        
        if not world_id:
            return error_response('缺少world_id参数', 400)
        
        query = Tag.query.filter_by(world_id=world_id)
        
        if tag_type:
            query = query.filter_by(tag_type=tag_type)
        
        tags = query.order_by(Tag.usage_count.desc()).all()
        return success_response([t.to_dict() for t in tags], '获取标签列表成功')
    except Exception as e:
        return error_response(f'获取标签列表失败: {str(e)}', 500)


@tags_relations_bp.route('/tags', methods=['POST'])
def create_tag():
    """创建标签"""
    try:
        data = request.get_json()
        if not data or 'name' not in data or 'world_id' not in data:
            return error_response('缺少必要参数', 400)
        
        world = World.query.get(data['world_id'])
        if not world:
            return error_response('世界不存在', 404)
        
        # 检查标签是否已存在
        existing_tag = Tag.query.filter_by(world_id=data['world_id'], name=data['name']).first()
        if existing_tag:
            return error_response('标签已存在', 400)
        
        tag = Tag(
            world_id=data['world_id'],
            name=data['name'],
            tag_type=data.get('tag_type', '通用'),
            description=data.get('description', ''),
            color=data.get('color', '#1890ff'),
            usage_count=0
        )
        
        db.session.add(tag)
        db.session.commit()
        
        return success_response(tag.to_dict(), '标签创建成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'创建标签失败: {str(e)}', 500)


@tags_relations_bp.route('/tags/<int:tag_id>', methods=['GET'])
def get_tag(tag_id):
    """获取标签详情"""
    try:
        tag = Tag.query.get(tag_id)
        if not tag:
            return error_response('标签不存在', 404)
        return success_response(tag.to_dict(), '获取标签详情成功')
    except Exception as e:
        return error_response(f'获取标签详情失败: {str(e)}', 500)


@tags_relations_bp.route('/tags/<int:tag_id>', methods=['PUT'])
def update_tag(tag_id):
    """更新标签"""
    try:
        tag = Tag.query.get(tag_id)
        if not tag:
            return error_response('标签不存在', 404)
        
        data = request.get_json()
        if not data:
            return error_response('缺少请求数据', 400)
        
        for field in ['name', 'tag_type', 'description', 'color', 'status']:
            if field in data:
                setattr(tag, field, data[field])
        
        db.session.commit()
        return success_response(tag.to_dict(), '标签更新成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'更新标签失败: {str(e)}', 500)


@tags_relations_bp.route('/tags/<int:tag_id>', methods=['DELETE'])
def delete_tag(tag_id):
    """删除标签"""
    try:
        tag = Tag.query.get(tag_id)
        if not tag:
            return error_response('标签不存在', 404)
        
        # 删除关联的实体标签
        EntityTag.query.filter_by(tag_id=tag_id).delete()
        
        db.session.delete(tag)
        db.session.commit()
        return success_response(None, '标签删除成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'删除标签失败: {str(e)}', 500)


# ==================== 实体标签关联管理 ====================

@tags_relations_bp.route('/entity-tags', methods=['GET'])
def get_entity_tags():
    """获取实体标签关联列表"""
    try:
        tag_id = request.args.get('tag_id', type=int)
        entity_type = request.args.get('entity_type')
        entity_id = request.args.get('entity_id', type=int)
        
        query = EntityTag.query
        
        if tag_id:
            query = query.filter_by(tag_id=tag_id)
        if entity_type:
            query = query.filter_by(entity_type=entity_type)
        if entity_id:
            query = query.filter_by(entity_id=entity_id)
        
        entity_tags = query.all()
        return success_response([et.to_dict() for et in entity_tags], '获取实体标签关联列表成功')
    except Exception as e:
        return error_response(f'获取实体标签关联列表失败: {str(e)}', 500)


@tags_relations_bp.route('/entity-tags', methods=['POST'])
def create_entity_tag():
    """创建实体标签关联"""
    try:
        data = request.get_json()
        if not data or 'tag_id' not in data or 'entity_type' not in data or 'entity_id' not in data:
            return error_response('缺少必要参数', 400)
        
        # 检查关联是否已存在
        existing = EntityTag.query.filter_by(
            tag_id=data['tag_id'],
            entity_type=data['entity_type'],
            entity_id=data['entity_id']
        ).first()
        
        if existing:
            return error_response('关联已存在', 400)
        
        entity_tag = EntityTag(
            tag_id=data['tag_id'],
            entity_type=data['entity_type'],
            entity_id=data['entity_id']
        )
        
        # 更新标签使用次数
        tag = Tag.query.get(data['tag_id'])
        if tag:
            tag.usage_count += 1
        
        db.session.add(entity_tag)
        db.session.commit()
        
        return success_response(entity_tag.to_dict(), '实体标签关联创建成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'创建实体标签关联失败: {str(e)}', 500)


@tags_relations_bp.route('/entity-tags/<int:entity_tag_id>', methods=['DELETE'])
def delete_entity_tag(entity_tag_id):
    """删除实体标签关联"""
    try:
        entity_tag = EntityTag.query.get(entity_tag_id)
        if not entity_tag:
            return error_response('关联不存在', 404)
        
        # 更新标签使用次数
        tag = Tag.query.get(entity_tag.tag_id)
        if tag and tag.usage_count > 0:
            tag.usage_count -= 1
        
        db.session.delete(entity_tag)
        db.session.commit()
        return success_response(None, '实体标签关联删除成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'删除实体标签关联失败: {str(e)}', 500)


@tags_relations_bp.route('/entities/<entity_type>/<int:entity_id>/tags', methods=['GET'])
def get_entity_tags_by_entity(entity_type, entity_id):
    """获取实体的所有标签"""
    try:
        entity_tags = EntityTag.query.filter_by(entity_type=entity_type, entity_id=entity_id).all()
        tag_ids = [et.tag_id for et in entity_tags]
        tags = Tag.query.filter(Tag.id.in_(tag_ids)).all()
        return success_response([t.to_dict() for t in tags], '获取实体标签成功')
    except Exception as e:
        return error_response(f'获取实体标签失败: {str(e)}', 500)


# ==================== 实体关系网络管理 ====================

@tags_relations_bp.route('/relations', methods=['GET'])
def get_entity_relations():
    """获取实体关系列表"""
    try:
        world_id = request.args.get('world_id', type=int)
        source_type = request.args.get('source_type')
        source_id = request.args.get('source_id', type=int)
        target_type = request.args.get('target_type')
        target_id = request.args.get('target_id', type=int)
        relation_type = request.args.get('relation_type')
        
        if not world_id:
            return error_response('缺少world_id参数', 400)
        
        query = EntityRelation.query.filter_by(world_id=world_id)
        
        if source_type:
            query = query.filter_by(source_type=source_type)
        if source_id:
            query = query.filter_by(source_id=source_id)
        if target_type:
            query = query.filter_by(target_type=target_type)
        if target_id:
            query = query.filter_by(target_id=target_id)
        if relation_type:
            query = query.filter_by(relation_type=relation_type)
        
        relations = query.all()
        return success_response([r.to_dict() for r in relations], '获取实体关系列表成功')
    except Exception as e:
        return error_response(f'获取实体关系列表失败: {str(e)}', 500)


@tags_relations_bp.route('/relations', methods=['POST'])
def create_entity_relation():
    """创建实体关系"""
    try:
        data = request.get_json()
        if not data or 'world_id' not in data or 'source_type' not in data or 'source_id' not in data or \
           'target_type' not in data or 'target_id' not in data or 'relation_type' not in data:
            return error_response('缺少必要参数', 400)
        
        world = World.query.get(data['world_id'])
        if not world:
            return error_response('世界不存在', 404)
        
        # 检查关系是否已存在
        existing = EntityRelation.query.filter_by(
            world_id=data['world_id'],
            source_type=data['source_type'],
            source_id=data['source_id'],
            target_type=data['target_type'],
            target_id=data['target_id'],
            relation_type=data['relation_type']
        ).first()
        
        if existing:
            return error_response('关系已存在', 400)
        
        relation = EntityRelation(
            world_id=data['world_id'],
            source_type=data['source_type'],
            source_id=data['source_id'],
            target_type=data['target_type'],
            target_id=data['target_id'],
            relation_type=data['relation_type'],
            strength=data.get('strength', 5),
            description=data.get('description', ''),
            is_bidirectional=data.get('is_bidirectional', True)
        )
        
        db.session.add(relation)
        db.session.commit()
        
        return success_response(relation.to_dict(), '实体关系创建成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'创建实体关系失败: {str(e)}', 500)


@tags_relations_bp.route('/relations/<int:relation_id>', methods=['GET'])
def get_entity_relation(relation_id):
    """获取实体关系详情"""
    try:
        relation = EntityRelation.query.get(relation_id)
        if not relation:
            return error_response('关系不存在', 404)
        return success_response(relation.to_dict(), '获取实体关系详情成功')
    except Exception as e:
        return error_response(f'获取实体关系详情失败: {str(e)}', 500)


@tags_relations_bp.route('/relations/<int:relation_id>', methods=['PUT'])
def update_entity_relation(relation_id):
    """更新实体关系"""
    try:
        relation = EntityRelation.query.get(relation_id)
        if not relation:
            return error_response('关系不存在', 404)
        
        data = request.get_json()
        if not data:
            return error_response('缺少请求数据', 400)
        
        for field in ['relation_type', 'strength', 'description', 'is_bidirectional', 'status']:
            if field in data:
                setattr(relation, field, data[field])
        
        db.session.commit()
        return success_response(relation.to_dict(), '实体关系更新成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'更新实体关系失败: {str(e)}', 500)


@tags_relations_bp.route('/relations/<int:relation_id>', methods=['DELETE'])
def delete_entity_relation(relation_id):
    """删除实体关系"""
    try:
        relation = EntityRelation.query.get(relation_id)
        if not relation:
            return error_response('关系不存在', 404)
        
        db.session.delete(relation)
        db.session.commit()
        return success_response(None, '实体关系删除成功')
    except Exception as e:
        db.session.rollback()
        return error_response(f'删除实体关系失败: {str(e)}', 500)


@tags_relations_bp.route('/entities/<entity_type>/<int:entity_id>/relations', methods=['GET'])
def get_entity_relations_by_entity(entity_type, entity_id):
    """获取实体的所有关系"""
    try:
        # 获取作为源或目标的关系
        relations = EntityRelation.query.filter(
            ((EntityRelation.source_type == entity_type) & (EntityRelation.source_id == entity_id)) |
            ((EntityRelation.target_type == entity_type) & (EntityRelation.target_id == entity_id))
        ).all()
        return success_response([r.to_dict() for r in relations], '获取实体关系成功')
    except Exception as e:
        return error_response(f'获取实体关系失败: {str(e)}', 500)


# ==================== 关系网络分析 ====================

@tags_relations_bp.route('/network/<int:world_id>', methods=['GET'])
def get_relation_network(world_id):
    """获取世界的关系网络数据（用于可视化）"""
    try:
        world = World.query.get(world_id)
        if not world:
            return error_response('世界不存在', 404)
        
        # 获取所有关系
        relations = EntityRelation.query.filter_by(world_id=world_id, status='active').all()
        
        # 构建节点和边
        nodes = {}
        edges = []
        
        for relation in relations:
            # 添加源节点
            source_key = f"{relation.source_type}_{relation.source_id}"
            if source_key not in nodes:
                nodes[source_key] = {
                    'id': source_key,
                    'type': relation.source_type,
                    'entity_id': relation.source_id
                }
            
            # 添加目标节点
            target_key = f"{relation.target_type}_{relation.target_id}"
            if target_key not in nodes:
                nodes[target_key] = {
                    'id': target_key,
                    'type': relation.target_type,
                    'entity_id': relation.target_id
                }
            
            # 添加边
            edges.append({
                'source': source_key,
                'target': target_key,
                'relation_type': relation.relation_type,
                'strength': relation.strength,
                'description': relation.description
            })
        
        return success_response({
            'nodes': list(nodes.values()),
            'edges': edges
        }, '获取关系网络成功')
    except Exception as e:
        return error_response(f'获取关系网络失败: {str(e)}', 500)

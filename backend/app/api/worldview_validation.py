"""
世界观验证与恢复 API
会话中止、恢复和检查点管理
"""
from flask import request, jsonify
from app.api import api_bp
from app.services.generation.session_manager import session_manager
from app.services.generation.checkpoint_service import checkpoint_service
import logging

logger = logging.getLogger(__name__)


@api_bp.route('/worldview/abort-generation', methods=['POST'])
def abort_generation():
    """
    中止正在进行的AI生成会话

    Request Body:
    {
        "session_id": "gen_sess_xxx",
        "reason": "user_requested"
    }
    """
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        reason = data.get('reason', 'user_requested')

        if not session_id:
            return jsonify({'code': 400, 'message': '缺少 session_id'}), 400

        aborted = session_manager.abort_session(session_id, reason)

        if aborted:
            logger.info(f"会话 {session_id} 中止成功")
            return jsonify({
                'code': 200,
                'message': '中止请求已发送，生成将在当前元素完成后停止',
                'data': {
                    'session_id': session_id,
                    'aborted': True
                }
            })
        else:
            session = session_manager.get_session(session_id)
            if not session:
                return jsonify({
                    'code': 404,
                    'message': '会话不存在或已结束',
                    'data': {
                        'session_id': session_id,
                        'aborted': False
                    }
                }), 404
            else:
                return jsonify({
                    'code': 200,
                    'message': f'会话当前状态: {session.status}',
                    'data': {
                        'session_id': session_id,
                        'status': session.status,
                        'aborted': False
                    }
                })

    except Exception as e:
        logger.error(f'中止生成失败: {str(e)}', exc_info=True)
        return jsonify({'code': 500, 'message': f'中止失败: {str(e)}'}), 500


@api_bp.route('/worldview/generation-status/<session_id>', methods=['GET'])
def get_generation_status(session_id):
    """
    获取生成会话状态

    Path Parameters:
        session_id: 会话ID
    """
    try:
        session = session_manager.get_session(session_id)

        if not session:
            return jsonify({
                'code': 404,
                'message': '会话不存在'
            }), 404

        return jsonify({
            'code': 200,
            'data': session.to_dict()
        })

    except Exception as e:
        logger.error(f'获取生成状态失败: {str(e)}', exc_info=True)
        return jsonify({'code': 500, 'message': f'获取状态失败: {str(e)}'}), 500


@api_bp.route('/worldview/checkpoints', methods=['GET'])
def list_checkpoints():
    """
    获取检查点列表

    Query Parameters:
        project_id: 项目ID（可选）
        user_id: 用户ID（可选）
        stage: 阶段过滤（可选，extraction/generation）
        status: 状态过滤（可选）
        parent_id: 父检查点ID（可选，用于级联恢复）
        limit: 返回数量限制（默认50）
        offset: 偏移量（默认0）
    """
    try:
        project_id = request.args.get('project_id', type=int)
        user_id = request.args.get('user_id', type=int)
        stage = request.args.get('stage')
        status = request.args.get('status')
        parent_id = request.args.get('parent_id', type=int)
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)

        result = checkpoint_service.list_checkpoints(
            project_id=project_id,
            user_id=user_id,
            stage=stage,
            status=status,
            parent_id=parent_id,
            limit=limit,
            offset=offset
        )

        return jsonify({
            'code': 200,
            'data': result
        })

    except Exception as e:
        logger.error(f'获取检查点列表失败: {str(e)}', exc_info=True)
        return jsonify({'code': 500, 'message': f'获取检查点列表失败: {str(e)}'}), 500


@api_bp.route('/worldview/checkpoints/<int:checkpoint_id>', methods=['GET'])
def get_checkpoint(checkpoint_id):
    """
    获取单个检查点详情

    Path Parameters:
        checkpoint_id: 检查点ID
    """
    try:
        checkpoint = checkpoint_service.load_checkpoint(checkpoint_id)

        if not checkpoint:
            return jsonify({
                'code': 404,
                'message': '检查点不存在'
            }), 404

        logger.info(f"[DEBUG] get_checkpoint 返回: keys={list(checkpoint.keys())}")
        if 'parsed_data' in checkpoint:
            parsed = checkpoint['parsed_data']
            logger.info(f"[DEBUG] parsed_data keys: {list(parsed.keys()) if parsed else 'None'}")
            if parsed and 'elements' in parsed:
                logger.info(f"[DEBUG] parsed_data.elements 类型: {type(parsed.get('elements'))}")
            if parsed and 'integrated_elements' in parsed:
                logger.info(f"[DEBUG] parsed_data.integrated_elements 类型: {type(parsed.get('integrated_elements'))}")

        return jsonify({
            'code': 200,
            'data': checkpoint
        })

    except Exception as e:
        logger.error(f'获取检查点失败: {str(e)}', exc_info=True)
        return jsonify({'code': 500, 'message': f'获取检查点失败: {str(e)}'}), 500


@api_bp.route('/worldview/resume-generation', methods=['POST'])
def resume_generation():
    """
    从检查点恢复生成

    Request Body:
    {
        "checkpoint_id": 1,
        "session_id": "gen_sess_xxx"
    }
    """
    try:
        data = request.get_json()
        checkpoint_id = data.get('checkpoint_id')
        session_id = data.get('session_id')

        if not checkpoint_id and not session_id:
            return jsonify({
                'code': 400,
                'message': '需要提供 checkpoint_id 或 session_id'
            }), 400

        if checkpoint_id:
            checkpoint = checkpoint_service.load_checkpoint(checkpoint_id)
        else:
            checkpoint = checkpoint_service.load_checkpoint_by_session(session_id)

        if not checkpoint:
            return jsonify({
                'code': 404,
                'message': '检查点不存在'
            }), 404

        parsed_data = checkpoint.get('parsed_data', {})
        checkpoint_session_id = checkpoint.get('session_id')

        existing_session = session_manager.get_session(checkpoint_session_id)
        if existing_session and existing_session.status == 'running':
            return jsonify({
                'code': 400,
                'message': '该会话仍在运行中，无法恢复'
            }), 400

        return jsonify({
            'code': 200,
            'message': '检查点已加载，请调用流式生成接口继续生成',
            'data': {
                'session_id': checkpoint_session_id,
                'checkpoint_id': checkpoint.get('id'),
                'resumed': True,
                'progress': {
                    'current_index': parsed_data.get('current_index', 0),
                    'total': parsed_data.get('total_count', 0),
                    'completed': parsed_data.get('completed_count', 0)
                },
                'elements': parsed_data.get('elements', []),
                'results': parsed_data.get('results', []),
                'story_context': parsed_data.get('story_context', {}),
                'batch_config': parsed_data.get('batch_config', {})
            }
        })

    except Exception as e:
        logger.error(f'恢复生成失败: {str(e)}', exc_info=True)
        return jsonify({'code': 500, 'message': f'恢复生成失败: {str(e)}'}), 500


@api_bp.route('/worldview/checkpoints/<int:checkpoint_id>', methods=['DELETE'])
def delete_checkpoint(checkpoint_id):
    """
    删除检查点

    Path Parameters:
        checkpoint_id: 检查点ID
    """
    try:
        success = checkpoint_service.delete_checkpoint(checkpoint_id)

        if success:
            return jsonify({
                'code': 200,
                'message': '检查点已删除'
            })
        else:
            return jsonify({
                'code': 404,
                'message': '检查点不存在'
            }), 404

    except Exception as e:
        logger.error(f'删除检查点失败: {str(e)}', exc_info=True)
        return jsonify({'code': 500, 'message': f'删除检查点失败: {str(e)}'}), 500


@api_bp.route('/worldview/cleanup-expired-checkpoints', methods=['POST'])
def cleanup_expired_checkpoints():
    """
    清理过期检查点（管理员接口）

    Response:
    {
        "code": 200,
        "data": {
            "cleaned_count": 5
        }
    }
    """
    try:
        count = checkpoint_service.cleanup_expired_checkpoints()

        return jsonify({
            'code': 200,
            'message': f'已清理 {count} 个过期检查点',
            'data': {
                'cleaned_count': count
            }
        })

    except Exception as e:
        logger.error(f'清理过期检查点失败: {str(e)}', exc_info=True)
        return jsonify({'code': 500, 'message': f'清理失败: {str(e)}'}), 500


@api_bp.route('/worldview/snapshot/<int:chapter_id>', methods=['GET'])
def get_chapter_snapshot(chapter_id):
    """
    获取章节快照

    URL参数:
        chapter_id: 章纲ID

    Response:
    {
        "code": 200,
        "data": {
            "id": 1,
            "chapter_id": 123,
            "chapter_title": "第三章",
            "snapshot_type": "chapter",
            "elements_data": {...},
            "new_elements": {...},
            "changed_elements": {...},
            "element_count": 150
        }
    }
    """
    try:
        from app.services.generation.chapter_snapshot_service import chapter_snapshot_service

        snapshot = chapter_snapshot_service.get_snapshot(chapter_id)

        if not snapshot:
            return jsonify({
                'code': 404,
                'message': '章节快照不存在'
            }), 404

        return jsonify({
            'code': 200,
            'message': '获取成功',
            'data': snapshot
        })

    except Exception as e:
        logger.error(f'获取章节快照失败: {str(e)}', exc_info=True)
        return jsonify({'code': 500, 'message': f'获取失败: {str(e)}'}), 500


@api_bp.route('/worldview/chapter-index/<int:chapter_id>', methods=['GET'])
def get_chapter_index(chapter_id):
    """
    获取章节索引用途：AI生成指定章节内容时获取上下文

    URL参数:
        chapter_id: 章纲ID

    Response:
    {
        "code": 200,
        "data": {
            "chapter_id": 123,
            "chapter_title": "第五章",
            "elements_by_type": {
                "characters": [...],
                "locations": [...],
                ...
            },
            "total_count": 150,
            "snapshot_id": 5
        }
    }
    """
    try:
        from app.services.generation.chapter_snapshot_service import chapter_snapshot_service

        index_data = chapter_snapshot_service.get_chapter_index(chapter_id)

        if not index_data:
            return jsonify({
                'code': 404,
                'message': '章节索引不存在'
            }), 404

        return jsonify({
            'code': 200,
            'message': '获取成功',
            'data': index_data
        })

    except Exception as e:
        logger.error(f'获取章节索引失败: {str(e)}', exc_info=True)
        return jsonify({'code': 500, 'message': f'获取失败: {str(e)}'}), 500


@api_bp.route('/worldview/element-history/<element_name>', methods=['GET'])
def get_element_history(element_name):
    """
    获取元素的历史变更记录

    URL参数:
        element_name: 元素名称

    Query参数:
        project_id: 项目ID（必填）

    Response:
    {
        "code": 200,
        "data": {
            "element_name": "张三",
            "element_type": "character",
            "first_appearance": "第一章",
            "changes": [
                {"chapter": "第一章", "status": "学徒", "change_type": "add"},
                {"chapter": "第三章", "status": "炼气期", "change_type": "update", "field": "level"}
            ]
        }
    }
    """
    try:
        project_id = request.args.get('project_id', type=int)

        if not project_id:
            return jsonify({'code': 400, 'message': '缺少 project_id 参数'}), 400

        from app.services.generation.chapter_snapshot_service import chapter_snapshot_service

        history = chapter_snapshot_service.get_element_history(project_id, element_name)

        return jsonify({
            'code': 200,
            'message': '获取成功',
            'data': history
        })

    except Exception as e:
        logger.error(f'获取元素历史失败: {str(e)}', exc_info=True)
        return jsonify({'code': 500, 'message': f'获取失败: {str(e)}'}), 500


@api_bp.route('/worldview/snapshots', methods=['GET'])
def get_project_snapshots():
    """
    获取项目的所有快照列表

    Query参数:
        project_id: 项目ID（必填）

    Response:
    {
        "code": 200,
        "data": [
            {"id": 1, "chapter_title": "大纲", "snapshot_type": "outline", ...},
            {"id": 2, "chapter_title": "第一卷", "snapshot_type": "volume", ...},
            ...
        ]
    }
    """
    try:
        project_id = request.args.get('project_id', type=int)

        if not project_id:
            return jsonify({'code': 400, 'message': '缺少 project_id 参数'}), 400

        from app.services.generation.chapter_snapshot_service import chapter_snapshot_service

        snapshots = chapter_snapshot_service.get_project_snapshots(project_id)

        return jsonify({
            'code': 200,
            'message': '获取成功',
            'data': snapshots
        })

    except Exception as e:
        logger.error(f'获取快照列表失败: {str(e)}', exc_info=True)
        return jsonify({'code': 500, 'message': f'获取失败: {str(e)}'}), 500


@api_bp.route('/worldview/snapshots/<int:snapshot_id>', methods=['DELETE'])
def delete_snapshot(snapshot_id):
    """
    删除快照

    URL参数:
        snapshot_id: 快照ID

    Response:
    {
        "code": 200,
        "message": '删除成功'
    }
    """
    try:
        from app.services.generation.chapter_snapshot_service import chapter_snapshot_service

        success = chapter_snapshot_service.delete_snapshot(snapshot_id)

        if success:
            return jsonify({
                'code': 200,
                'message': '删除成功'
            })
        else:
            return jsonify({
                'code': 404,
                'message': '快照不存在'
            }), 404

    except Exception as e:
        logger.error(f'删除快照失败: {str(e)}', exc_info=True)
        return jsonify({'code': 500, 'message': f'删除失败: {str(e)}'}), 500

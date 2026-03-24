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

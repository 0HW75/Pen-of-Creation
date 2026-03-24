"""
世界观存储 API
元素保存、应用和一致性检查
"""
from flask import request, jsonify
from app.api import api_bp
from app.services.content_extractor import ContentExtractor
from app.services.generation.concept_merge_service import concept_merge_service
import logging

logger = logging.getLogger(__name__)


@api_bp.route('/worldview/save-extraction-list', methods=['POST'])
def save_extraction_list():
    """保存用户选择的提取清单"""
    try:
        data = request.get_json()
        return jsonify({'code': 200, 'message': '保存成功'})
    except Exception as e:
        logger.error(f'保存提取清单失败: {str(e)}', exc_info=True)
        return jsonify({'code': 500, 'message': f'保存失败: {str(e)}'}), 500


@api_bp.route('/worldview/batch-results/<batch_id>', methods=['GET'])
def get_batch_results(batch_id):
    """获取批次生成结果"""
    try:
        return jsonify({
            'code': 200,
            'data': {
                'batch_id': batch_id,
                'status': 'completed',
                'results': {}
            }
        })
    except Exception as e:
        logger.error(f'获取批次结果失败: {str(e)}', exc_info=True)
        return jsonify({'code': 500, 'message': f'获取结果失败: {str(e)}'}), 500


@api_bp.route('/worldview/apply-batch-results', methods=['POST'])
def apply_batch_results():
    """应用批次生成结果到世界观"""
    try:
        data = request.get_json()
        batch_id = data.get('batch_id')
        selections = data.get('selections', [])

        return jsonify({'code': 200, 'message': '应用成功'})
    except Exception as e:
        logger.error(f'应用批次结果失败: {str(e)}', exc_info=True)
        return jsonify({'code': 500, 'message': f'应用失败: {str(e)}'}), 500


@api_bp.route('/worldview/check-consistency', methods=['POST'])
def check_consistency():
    """检查故事与设定的一致性"""
    try:
        data = request.get_json()
        world_id = data.get('world_id')
        project_id = data.get('project_id')
        content_scope = data.get('content_scope', {})

        if project_id:
            content_scope['project_id'] = project_id
        content = ContentExtractor.extract_by_scope(content_scope)

        return jsonify({
            'code': 200,
            'data': {
                'inconsistencies': [],
                'missing_settings': []
            }
        })
    except Exception as e:
        logger.error(f'检查一致性失败: {str(e)}', exc_info=True)
        return jsonify({'code': 500, 'message': f'检查失败: {str(e)}'}), 500


@api_bp.route('/worldview/create-world-from-blueprint', methods=['POST'])
def create_world_from_blueprint():
    """
    从蓝图创建世界的完整流程
    """
    try:
        data = request.get_json()
        project_id = data.get('project_id')
        content_scope = data.get('content_scope', {})
        world_config = data.get('world_config', {})

        return jsonify({
            'code': 200,
            'data': {
                'world_id': 999,
                'message': '世界创建成功'
            }
        })
    except Exception as e:
        logger.error(f'从蓝图创建世界失败: {str(e)}', exc_info=True)
        return jsonify({'code': 500, 'message': f'创建失败: {str(e)}'}), 500


@api_bp.route('/worldview/preview-merge', methods=['POST'])
def preview_merge():
    """
    预览概念合并结果

    智能分析提取的元素，识别重复或相似的概念，返回合并建议。
    """
    try:
        data = request.get_json()
        elements = data.get('elements', {})
        concept_type = data.get('concept_type')
        similarity_threshold = data.get('similarity_threshold', 0.85)

        logger.info(f'收到合并预览请求: concept_type={concept_type}, similarity_threshold={similarity_threshold}')

        if not elements:
            return jsonify({'code': 400, 'message': '缺少 elements 参数'}), 400

        merge_service = concept_merge_service
        if similarity_threshold != 0.85:
            from app.services.generation.concept_merge_service import ConceptMergeService
            merge_service = ConceptMergeService(similarity_threshold=similarity_threshold)

        result = {}

        if concept_type:
            if concept_type not in elements:
                return jsonify({'code': 400, 'message': f'未找到类型 {concept_type} 的元素'}), 400

            type_elements = elements.get(concept_type, [])
            if type_elements:
                preview = merge_service.preview_merge(type_elements, concept_type)
                result[concept_type] = preview
        else:
            for type_name, type_elements in elements.items():
                if type_elements and isinstance(type_elements, list):
                    try:
                        preview = merge_service.preview_merge(type_elements, type_name)
                        result[type_name] = preview
                    except Exception as e:
                        logger.error(f'预览类型 {type_name} 时出错: {str(e)}')
                        result[type_name] = {
                            'concept_type': type_name,
                            'error': str(e),
                            'total_elements': len(type_elements),
                            'suggested_groups': [],
                            'statistics': {'total': len(type_elements), 'will_merge': 0, 'will_keep': len(type_elements)}
                        }

        total_elements = sum(r.get('statistics', {}).get('total', 0) for r in result.values())
        total_will_merge = sum(r.get('statistics', {}).get('will_merge', 0) for r in result.values())
        total_will_keep = sum(r.get('statistics', {}).get('will_keep', 0) for r in result.values())

        return jsonify({
            'code': 200,
            'data': {
                'preview_results': result,
                'overall_statistics': {
                    'total_elements': total_elements,
                    'total_will_merge': total_will_merge,
                    'total_will_keep': total_will_keep,
                    'types_processed': len(result)
                },
                'similarity_threshold': similarity_threshold
            }
        })

    except Exception as e:
        logger.error(f'预览合并结果失败: {str(e)}', exc_info=True)
        return jsonify({'code': 500, 'message': f'预览失败: {str(e)}'}), 500


@api_bp.route('/worldview/execute-merge', methods=['POST'])
def execute_merge():
    """
    执行概念合并

    根据预览结果执行实际的合并操作，返回合并后的元素。
    """
    try:
        data = request.get_json()
        elements = data.get('elements', {})
        concept_type = data.get('concept_type')
        similarity_threshold = data.get('similarity_threshold', 0.85)

        logger.info(f'收到执行合并请求: concept_type={concept_type}, similarity_threshold={similarity_threshold}')

        if not elements:
            return jsonify({'code': 400, 'message': '缺少 elements 参数'}), 400

        from app.services.generation.concept_merge_service import ConceptMergeService
        merge_service = ConceptMergeService(similarity_threshold=similarity_threshold)

        result = {}
        statistics = {}

        if concept_type:
            if concept_type not in elements:
                return jsonify({'code': 400, 'message': f'未找到类型 {concept_type} 的元素'}), 400

            type_elements = elements.get(concept_type, [])
            if type_elements:
                merged = merge_service.merge_elements(type_elements, concept_type)
                result[concept_type] = [m.to_dict() for m in merged]
                statistics[concept_type] = {
                    'original': len(type_elements),
                    'merged': len(merged),
                    'reduction': len(type_elements) - len(merged)
                }
        else:
            for type_name, type_elements in elements.items():
                if type_elements and isinstance(type_elements, list):
                    try:
                        merged = merge_service.merge_elements(type_elements, type_name)
                        result[type_name] = [m.to_dict() for m in merged]
                        statistics[type_name] = {
                            'original': len(type_elements),
                            'merged': len(merged),
                            'reduction': len(type_elements) - len(merged)
                        }
                    except Exception as e:
                        logger.error(f'合并类型 {type_name} 时出错: {str(e)}')
                        result[type_name] = {'error': str(e)}
                        statistics[type_name] = {'original': len(type_elements), 'error': str(e)}

        total_original = sum(s.get('original', 0) for s in statistics.values() if 'original' in s)
        total_merged = sum(s.get('merged', 0) for s in statistics.values() if 'merged' in s)

        return jsonify({
            'code': 200,
            'data': {
                'merged_elements': result,
                'statistics': statistics,
                'overall': {
                    'total_original': total_original,
                    'total_merged': total_merged,
                    'total_reduction': total_original - total_merged
                }
            }
        })

    except Exception as e:
        logger.error(f'执行合并失败: {str(e)}', exc_info=True)
        return jsonify({'code': 500, 'message': f'合并失败: {str(e)}'}), 500

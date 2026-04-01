"""
AI生成设定路由
"""
from flask import Blueprint, request, jsonify
import logging

from app.services.generation.generators import (
    CharacterGenerator,
    LocationGenerator,
    ItemGenerator,
    FactionGenerator,
    EnergySystemGenerator,
    CivilizationGenerator,
    HistoricalEventGenerator,
    RegionGenerator,
    DimensionGenerator
)

logger = logging.getLogger(__name__)

ai_generation_bp = Blueprint('ai_generation_main', __name__)

generators = {
    'character': CharacterGenerator(),
    'location': LocationGenerator(),
    'item': ItemGenerator(),
    'faction': FactionGenerator(),
    'energy_system': EnergySystemGenerator(),
    'civilization': CivilizationGenerator(),
    'historical_event': HistoricalEventGenerator(),
    'region': RegionGenerator(),
    'dimension': DimensionGenerator()
}


@ai_generation_bp.route('/generate-setting', methods=['POST'])
def generate_setting():
    """
    生成设定
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({'success': False, 'error': '请求体不能为空'}), 400

        entity_type = data.get('entity_type')
        prompt = data.get('prompt')

        if not entity_type:
            return jsonify({'success': False, 'error': '缺少 entity_type 参数'}), 400

        if not prompt:
            return jsonify({'success': False, 'error': '缺少 prompt 参数'}), 400

        if entity_type not in generators:
            return jsonify({
                'success': False,
                'error': f'不支持的实体类型: {entity_type}',
                'supported_types': list(generators.keys())
            }), 400

        generator = generators[entity_type]

        result = generator.generate(
            prompt=prompt,
            world_id=data.get('world_id'),
            project_id=data.get('project_id'),
            strategy=data.get('strategy', 'detailed'),
            style=data.get('style', ''),
            custom_parameters=data.get('parameters'),
            include_related_entities=data.get('include_related_entities')
        )

        return jsonify(result)

    except Exception as e:
        logger.error(f"生成设定失败: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@ai_generation_bp.route('/generate-setting/batch', methods=['POST'])
def generate_setting_batch():
    """
    批量生成设定
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({'success': False, 'error': '请求体不能为空'}), 400

        entity_type = data.get('entity_type')
        prompts = data.get('prompts')

        if not entity_type:
            return jsonify({'success': False, 'error': '缺少 entity_type 参数'}), 400

        if not prompts or not isinstance(prompts, list):
            return jsonify({'success': False, 'error': '缺少 prompts 参数或格式错误'}), 400

        if entity_type not in generators:
            return jsonify({
                'success': False,
                'error': f'不支持的实体类型: {entity_type}',
                'supported_types': list(generators.keys())
            }), 400

        generator = generators[entity_type]

        results = generator.generate_batch(
            prompts=prompts,
            world_id=data.get('world_id'),
            project_id=data.get('project_id'),
            strategy=data.get('strategy', 'detailed'),
            style=data.get('style', ''),
            custom_parameters=data.get('parameters')
        )

        return jsonify({
            'success': True,
            'results': results,
            'total': len(results),
            'successful': sum(1 for r in results if r.get('success')),
            'failed': sum(1 for r in results if not r.get('success'))
        })

    except Exception as e:
        logger.error(f"批量生成设定失败: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

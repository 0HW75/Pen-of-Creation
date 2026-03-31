"""
AI生成工具路由
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
from app.services.generation.generation_strategy import strategy_selector

logger = logging.getLogger(__name__)

ai_generation_bp = Blueprint('ai_generation', __name__)

# This blueprint is used for main AI generation routes
ai_generation_utils_bp = Blueprint('ai_generation_utils', __name__)

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


@ai_generation_utils_bp.route('/generate-setting/save', methods=['POST'])
def save_generated_setting():
    """
    保存生成的设定到数据库
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({'success': False, 'error': '请求体不能为空'}), 400

        entity_type = data.get('entity_type')
        entity_data = data.get('data')

        if not entity_type:
            return jsonify({'success': False, 'error': '缺少 entity_type 参数'}), 400

        if not entity_data:
            return jsonify({'success': False, 'error': '缺少 data 参数'}), 400

        if entity_type not in generators:
            return jsonify({
                'success': False,
                'error': f'不支持的实体类型: {entity_type}'
            }), 400

        generator = generators[entity_type]
        result = generator.save_to_database(
            data=entity_data,
            world_id=data.get('world_id'),
            project_id=data.get('project_id'),
            source_chapters=data.get('source_chapters')
        )

        return jsonify(result)

    except Exception as e:
        logger.error(f"保存设定失败: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@ai_generation_utils_bp.route('/generation-strategies', methods=['GET'])
def get_generation_strategies():
    """获取所有可用的生成策略"""
    try:
        strategies = strategy_selector.list_available_strategies()
        return jsonify({
            'success': True,
            'strategies': strategies
        })
    except Exception as e:
        logger.error(f"获取生成策略失败: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@ai_generation_utils_bp.route('/supported-entity-types', methods=['GET'])
def get_supported_entity_types():
    """获取支持的实体类型列表"""
    try:
        entity_types = []

        for entity_type, generator in generators.items():
            entity_types.append({
                'type': entity_type,
                'supported_fields': generator.get_supported_fields(),
                'required_fields': generator.get_required_fields()
            })

        return jsonify({
            'success': True,
            'entity_types': entity_types
        })
    except Exception as e:
        logger.error(f"获取实体类型失败: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@ai_generation_utils_bp.route('/preview-prompt', methods=['POST'])
def preview_prompt():
    """
    预览生成的提示词
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({'success': False, 'error': '请求体不能为空'}), 400

        entity_type = data.get('entity_type')
        prompt = data.get('prompt', '')

        if not entity_type:
            return jsonify({'success': False, 'error': '缺少 entity_type 参数'}), 400

        from app.services.generation import PromptTemplateManager, ContextAssembler

        template_manager = PromptTemplateManager()
        context_assembler = ContextAssembler()

        template = template_manager.get_template(
            entity_type,
            data.get('strategy', 'detailed')
        )

        if not template:
            return jsonify({
                'success': False,
                'error': f'未找到 {entity_type} 类型的模板'
            }), 400

        variables = context_assembler.build_prompt_variables(
            user_prompt=prompt,
            style=data.get('style', ''),
            world_id=data.get('world_id'),
            project_id=data.get('project_id'),
            include_world_info=True,
            include_related_entities=data.get('include_related_entities')
        )

        final_prompt = template.render(variables)

        return jsonify({
            'success': True,
            'prompt': final_prompt,
            'variables': variables,
            'template_name': template.template_name,
            'strategy': template.strategy
        })

    except Exception as e:
        logger.error(f"预览提示词失败: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

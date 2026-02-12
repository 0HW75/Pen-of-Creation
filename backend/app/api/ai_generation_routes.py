"""
AI设定生成API路由
"""
from flask import Blueprint, request, jsonify
from typing import Dict, Any
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

# 创建蓝图
ai_generation_bp = Blueprint('ai_generation', __name__)

# 创建生成器实例
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
    
    请求体：
    {
        "entity_type": "character",  // 实体类型
        "prompt": "一个来自魔法学院的年轻天才",  // 生成提示
        "world_id": 1,  // 世界观ID（可选）
        "project_id": 1,  // 项目ID（可选）
        "strategy": "detailed",  // 生成策略：simple/detailed/batch/creative/conservative
        "style": "东方玄幻风格",  // 风格要求（可选）
        "parameters": {  // 自定义生成参数（可选）
            "temperature": 0.7,
            "max_tokens": 2000
        },
        "include_related_entities": ["faction", "location"]  // 需要包含的相关实体（可选）
    }
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
        
        # 检查是否支持该实体类型
        if entity_type not in generators:
            return jsonify({
                'success': False,
                'error': f'不支持的实体类型: {entity_type}',
                'supported_types': list(generators.keys())
            }), 400
        
        # 获取生成器
        generator = generators[entity_type]
        
        # 执行生成
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
    
    请求体：
    {
        "entity_type": "character",
        "prompts": ["提示1", "提示2", "提示3"],
        "world_id": 1,
        "project_id": 1,
        "strategy": "detailed"
    }
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
        
        # 检查是否支持该实体类型
        if entity_type not in generators:
            return jsonify({
                'success': False,
                'error': f'不支持的实体类型: {entity_type}',
                'supported_types': list(generators.keys())
            }), 400
        
        # 获取生成器
        generator = generators[entity_type]
        
        # 执行批量生成
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


@ai_generation_bp.route('/generate-setting/save', methods=['POST'])
def save_generated_setting():
    """
    保存生成的设定到数据库
    
    请求体：
    {
        "entity_type": "character",
        "data": {生成的数据},
        "world_id": 1,
        "project_id": 1
    }
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
        
        # 检查是否支持该实体类型
        if entity_type not in generators:
            return jsonify({
                'success': False,
                'error': f'不支持的实体类型: {entity_type}'
            }), 400
        
        # 获取生成器并保存
        generator = generators[entity_type]
        result = generator.save_to_database(
            data=entity_data,
            world_id=data.get('world_id'),
            project_id=data.get('project_id')
        )
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"保存设定失败: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@ai_generation_bp.route('/generation-strategies', methods=['GET'])
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


@ai_generation_bp.route('/supported-entity-types', methods=['GET'])
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


@ai_generation_bp.route('/preview-prompt', methods=['POST'])
def preview_prompt():
    """
    预览生成的提示词
    
    请求体：
    {
        "entity_type": "character",
        "prompt": "用户提示",
        "world_id": 1,
        "strategy": "detailed",
        "style": "风格要求"
    }
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
        
        # 创建实例
        template_manager = PromptTemplateManager()
        context_assembler = ContextAssembler()
        
        # 获取模板
        template = template_manager.get_template(
            entity_type, 
            data.get('strategy', 'detailed')
        )
        
        if not template:
            return jsonify({
                'success': False,
                'error': f'未找到 {entity_type} 类型的模板'
            }), 400
        
        # 组装变量
        variables = context_assembler.build_prompt_variables(
            user_prompt=prompt,
            style=data.get('style', ''),
            world_id=data.get('world_id'),
            project_id=data.get('project_id'),
            include_world_info=True,
            include_related_entities=data.get('include_related_entities')
        )
        
        # 渲染提示词
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

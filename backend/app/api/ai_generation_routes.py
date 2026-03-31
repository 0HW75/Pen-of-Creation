"""
AI设定生成API路由模块
此文件作为路由汇总，导入所有路由子模块
"""
from flask import Blueprint

ai_generation_bp = Blueprint('ai_generation', __name__, url_prefix='/ai-generation')

from app.api.routes.generation_setting_routes import ai_generation_bp as ai_generation_main_bp
from app.api.routes.generation_utils_routes import (
    ai_generation_utils_bp,
    save_generated_setting,
    get_generation_strategies,
    get_supported_entity_types,
    preview_prompt
)

ai_generation_bp.register_blueprint(ai_generation_main_bp)
ai_generation_bp.register_blueprint(ai_generation_utils_bp)

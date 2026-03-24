"""
AI设定生成API路由模块
此文件作为路由汇总，导入所有路由子模块
"""
from app.api.routes.generation_setting_routes import ai_generation_bp
from app.api.routes.generation_utils_routes import (
    save_generated_setting,
    get_generation_strategies,
    get_supported_entity_types,
    preview_prompt
)

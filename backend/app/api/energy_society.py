"""社会体系路由模块

本模块作为路由聚合器，注册所有社会体系相关的蓝图。
实际的API实现已拆分到以下模块：
- power_level_api: 力量等级 (/society/power-levels)
- civilization_api: 文明、文明区域、社会阶级 (/society/civilizations)
- cultural_api: 文化习俗、经济体系、政治体系 (/society/cultural-customs)
- power_cost_api: 力量代价 (/society/power-costs)
"""
from flask import Blueprint

society_bp = Blueprint('society', __name__, url_prefix='/society')

from app.api.power_level_api import power_level_bp
from app.api.civilization_api import civilization_bp
from app.api.cultural_api import cultural_bp
from app.api.power_cost_api import power_cost_bp

society_bp.register_blueprint(power_level_bp)
society_bp.register_blueprint(civilization_bp)
society_bp.register_blueprint(cultural_bp)
society_bp.register_blueprint(power_cost_bp)

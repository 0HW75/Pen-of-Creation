"""能量与社会体系路由模块

本模块作为路由聚合器，注册所有能量与社会体系相关的蓝图。
实际的API实现已拆分到以下模块：
- energy_system_api: 能量体系和能量形态
- power_level_api: 力量等级
- civilization_api: 文明、文明区域、社会阶级
- cultural_api: 文化习俗、经济体系、政治体系
- power_cost_api: 力量代价
"""
from flask import Blueprint

energy_society_bp = Blueprint('energy_society', __name__)

from app.api.energy_system_api import energy_system_bp
from app.api.power_level_api import power_level_bp
from app.api.civilization_api import civilization_bp
from app.api.cultural_api import cultural_bp
from app.api.power_cost_api import power_cost_bp

energy_society_bp.register_blueprint(energy_system_bp)
energy_society_bp.register_blueprint(power_level_bp)
energy_society_bp.register_blueprint(civilization_bp)
energy_society_bp.register_blueprint(cultural_bp)
energy_society_bp.register_blueprint(power_cost_bp)

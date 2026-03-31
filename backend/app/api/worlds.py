"""
世界API路由模块
此文件作为路由汇总，导入所有路由子模块
"""
from flask import Blueprint

worlds_bp = Blueprint('worlds', __name__, url_prefix='/worlds')

from app.api.routes.world_routes import worlds_bp as worlds_main_bp
from app.api.routes.world_stats_routes import world_stats_bp

worlds_bp.register_blueprint(worlds_main_bp)
worlds_bp.register_blueprint(world_stats_bp)

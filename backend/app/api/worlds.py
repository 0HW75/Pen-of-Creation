"""
世界API路由模块
此文件作为路由汇总，导入所有路由子模块
"""
from app.api.routes.world_routes import worlds_bp
from app.api.routes.world_stats_routes import get_world_stats, get_world_activities

from flask import Blueprint

api_bp = Blueprint('api', __name__)

from app.api import project, chapter, character, location, item, faction, relationship, export, ai, analysis, navigation, blueprint, setting, worlds, world_setting, energy_society, history_timeline, tags_relations, ai_generation_routes
from app.api.navigation import navigation_bp
from app.api.worlds import worlds_bp
from app.api.world_setting import world_setting_bp
from app.api.energy_society import energy_society_bp
from app.api.history_timeline import history_timeline_bp
from app.api.tags_relations import tags_relations_bp
from app.api.ai_generation_routes import ai_generation_bp

# 注册导航蓝图
api_bp.register_blueprint(navigation_bp, url_prefix='/navigation')

# 注册世界蓝图
api_bp.register_blueprint(worlds_bp, url_prefix='/worlds')

# 注册世界观设定蓝图
api_bp.register_blueprint(world_setting_bp)

# 注册能量与社会体系蓝图
api_bp.register_blueprint(energy_society_bp)

# 注册历史脉络蓝图
api_bp.register_blueprint(history_timeline_bp)

# 注册标签与关系网络蓝图
api_bp.register_blueprint(tags_relations_bp)

# 注册AI设定生成蓝图
api_bp.register_blueprint(ai_generation_bp)

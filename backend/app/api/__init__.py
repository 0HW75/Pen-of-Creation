from flask import Blueprint

api_bp = Blueprint('api', __name__)

from app.api import project, chapter, character, location, item, faction, relationship, export, ai, analysis, navigation, blueprint, setting, worlds, world_setting, energy_society, history_timeline, tags_relations, ai_version, ai_generation_routes, chapter_appearance
from app.api.navigation import navigation_bp
from app.api.worlds import worlds_bp
from app.api.world_setting import world_setting_bp
from app.api.energy_society import society_bp
from app.api.energy_system_api import energy_system_bp
from app.api.power_level_api import power_level_bp
from app.api.civilization_api import civilization_bp
from app.api.cultural_api import cultural_bp
from app.api.power_cost_api import power_cost_bp
from app.api.history_timeline import history_timeline_bp
from app.api.tags_relations import tags_relations_bp
from app.api.ai_generation_routes import ai_generation_bp
from app.api.chapter_appearance import chapter_appearance_bp

api_bp.register_blueprint(navigation_bp, url_prefix='/navigation')
api_bp.register_blueprint(worlds_bp, url_prefix='/worlds')
api_bp.register_blueprint(world_setting_bp)
api_bp.register_blueprint(society_bp)
api_bp.register_blueprint(energy_system_bp)
api_bp.register_blueprint(history_timeline_bp)
api_bp.register_blueprint(tags_relations_bp)
api_bp.register_blueprint(ai_generation_bp)
api_bp.register_blueprint(chapter_appearance_bp)

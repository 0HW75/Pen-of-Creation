from flask import Blueprint

api_bp = Blueprint('api', __name__)

from app.api import project, chapter, character, location, item, faction, relationship, export, ai, analysis, navigation, blueprint, setting, worlds
from app.api.navigation import navigation_bp
from app.api.worlds import worlds_bp

# 注册导航蓝图
api_bp.register_blueprint(navigation_bp, url_prefix='/navigation')

# 注册世界蓝图
api_bp.register_blueprint(worlds_bp, url_prefix='/worlds')

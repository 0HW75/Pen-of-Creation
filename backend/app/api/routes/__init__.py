from .outline_routes import *
from .ai_outline_routes import *
from .volume_routes import *
from .decompose_routes import *
from .chapter_routes import *
from .story_model_routes import *
from .world_routes import worlds_bp
from .world_stats_routes import get_world_stats, get_world_activities
from .generation_setting_routes import ai_generation_bp
from .generation_utils_routes import (
    save_generated_setting,
    get_generation_strategies,
    get_supported_entity_types,
    preview_prompt
)

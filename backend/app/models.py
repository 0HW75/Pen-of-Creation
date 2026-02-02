from app import db
from datetime import datetime

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False)
    pen_name = db.Column(db.String(255), nullable=False)
    genre = db.Column(db.String(100), nullable=False)
    target_audience = db.Column(db.String(100), nullable=False)
    core_theme = db.Column(db.Text, nullable=False)
    synopsis = db.Column(db.Text, nullable=False)
    writing_style = db.Column(db.String(100), default='')
    reference_works = db.Column(db.Text, default='')
    daily_word_goal = db.Column(db.Integer, default=0)
    total_word_goal = db.Column(db.Integer, default=0)
    estimated_completion_date = db.Column(db.Date)
    word_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'pen_name': self.pen_name,
            'genre': self.genre,
            'target_audience': self.target_audience,
            'core_theme': self.core_theme,
            'synopsis': self.synopsis,
            'writing_style': self.writing_style,
            'reference_works': self.reference_works,
            'daily_word_goal': self.daily_word_goal,
            'total_word_goal': self.total_word_goal,
            'estimated_completion_date': self.estimated_completion_date.isoformat() if self.estimated_completion_date else None,
            'word_count': self.word_count,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Outline(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, default='')
    story_model = db.Column(db.String(100), default='')
    version = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'title': self.title,
            'content': self.content,
            'story_model': self.story_model,
            'version': self.version,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Volume(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    outline_id = db.Column(db.Integer, db.ForeignKey('outline.id'), nullable=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, default='')
    core_conflict = db.Column(db.Text, default='')
    order_index = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'outline_id': self.outline_id,
            'title': self.title,
            'content': self.content,
            'core_conflict': self.core_conflict,
            'order_index': self.order_index,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Chapter(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    volume_id = db.Column(db.Integer, db.ForeignKey('volume.id'), nullable=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, default='')
    scenes = db.Column(db.Text, default='[]')
    characters = db.Column(db.Text, default='[]')
    core_event = db.Column(db.Text, default='')
    emotional_goal = db.Column(db.Text, default='')
    keywords = db.Column(db.Text, default='[]')
    word_count_estimate = db.Column(db.Integer, default=0)
    status = db.Column(db.String(50), default='未写')
    type = db.Column(db.String(50), default='普通')
    word_count = db.Column(db.Integer, default=0)
    order_index = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'volume_id': self.volume_id,
            'title': self.title,
            'content': self.content,
            'scenes': self.scenes,
            'characters': self.characters,
            'core_event': self.core_event,
            'emotional_goal': self.emotional_goal,
            'keywords': self.keywords,
            'word_count_estimate': self.word_count_estimate,
            'status': self.status,
            'type': self.type,
            'word_count': self.word_count,
            'order_index': self.order_index,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Character(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    basic_info = db.Column(db.Text, default='')
    appearance = db.Column(db.Text, default='')
    personality = db.Column(db.Text, default='')
    background = db.Column(db.Text, default='')
    character_arc = db.Column(db.Text, default='')
    motivation = db.Column(db.Text, default='')
    secrets = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'name': self.name,
            'basic_info': self.basic_info,
            'appearance': self.appearance,
            'personality': self.personality,
            'background': self.background,
            'character_arc': self.character_arc,
            'motivation': self.motivation,
            'secrets': self.secrets,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Location(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default='')
    type = db.Column(db.String(100), default='普通')
    importance = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'name': self.name,
            'description': self.description,
            'type': self.type,
            'importance': self.importance,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default='')
    type = db.Column(db.String(100), default='普通')
    importance = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'name': self.name,
            'description': self.description,
            'type': self.type,
            'importance': self.importance,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Faction(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default='')
    type = db.Column(db.String(100), default='普通')
    importance = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'name': self.name,
            'description': self.description,
            'type': self.type,
            'importance': self.importance,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Relationship(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    source_type = db.Column(db.String(50), nullable=False)
    source_id = db.Column(db.Integer, nullable=False)
    target_type = db.Column(db.String(50), nullable=False)
    target_id = db.Column(db.Integer, nullable=False)
    relationship_type = db.Column(db.String(100), nullable=False)
    strength = db.Column(db.Integer, default=5)
    description = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'source_type': self.source_type,
            'source_id': self.source_id,
            'target_type': self.target_type,
            'target_id': self.target_id,
            'relationship_type': self.relationship_type,
            'strength': self.strength,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Version(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    version_name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default='')
    tags = db.Column(db.Text, default='')
    content_hash = db.Column(db.String(255), default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'version_name': self.version_name,
            'description': self.description,
            'tags': self.tags,
            'content_hash': self.content_hash,
            'created_at': self.created_at.isoformat()
        }

class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    chapter_id = db.Column(db.Integer, db.ForeignKey('chapter.id'), nullable=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, default='')
    type = db.Column(db.String(50), default='普通')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'chapter_id': self.chapter_id,
            'title': self.title,
            'content': self.content,
            'type': self.type,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class NavigationFlow(db.Model):
    __tablename__ = 'navigation_flows'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, nullable=False)
    current_stage = db.Column(db.String(50), default='project_creation')
    overall_progress = db.Column(db.Float, default=0)
    stage_progress = db.Column(db.Text, default='[]')
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'current_stage': self.current_stage,
            'overall_progress': self.overall_progress,
            'stage_progress': self.stage_progress,
            'last_updated': self.last_updated.isoformat()
        }
    
    def save(self):
        db.session.add(self)
        db.session.commit()


class Task(db.Model):
    __tablename__ = 'tasks'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    type = db.Column(db.String(50), default='chapter')
    priority = db.Column(db.Integer, default=3)
    status = db.Column(db.String(50), default='pending')
    due_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'title': self.title,
            'description': self.description,
            'type': self.type,
            'priority': self.priority,
            'status': self.status,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'created_at': self.created_at.isoformat(),
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }
    
    def save(self):
        db.session.add(self)
        db.session.commit()


class Inspiration(db.Model):
    __tablename__ = 'inspirations'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, nullable=False)
    type = db.Column(db.String(50), default='plot')
    content = db.Column(db.Text, nullable=False)
    context = db.Column(db.Text)
    rating = db.Column(db.Integer, default=0)
    status = db.Column(db.String(50), default='未使用')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    used_at = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'type': self.type,
            'content': self.content,
            'context': self.context,
            'rating': self.rating,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'used_at': self.used_at.isoformat() if self.used_at else None
        }
    
    def save(self):
        db.session.add(self)
        db.session.commit()


class EmotionBoard(db.Model):
    __tablename__ = 'emotion_boards'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    image_url = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text, default='')
    tags = db.Column(db.Text, default='')
    order_index = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'image_url': self.image_url,
            'description': self.description,
            'tags': self.tags,
            'order_index': self.order_index,
            'created_at': self.created_at.isoformat()
        }

class StoryModel(db.Model):
    __tablename__ = 'story_models'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    key = db.Column(db.String(100), nullable=False, unique=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default='')
    is_default = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'key': self.key,
            'name': self.name,
            'description': self.description,
            'is_default': self.is_default,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
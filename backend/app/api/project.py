from app.api import api_bp
from app import db
from app.models import Project, EmotionBoard
from flask import request, jsonify
from datetime import datetime
import os
from werkzeug.utils import secure_filename

@api_bp.route('/projects', methods=['GET'])
def get_projects():
    projects = Project.query.all()
    result = [project.to_dict() for project in projects]
    return jsonify(result)

@api_bp.route('/projects', methods=['POST'])
def create_project():
    data = request.json
    
    # 处理日期字段
    estimated_completion_date = None
    if data.get('estimated_completion_date'):
        estimated_completion_date = datetime.fromisoformat(data['estimated_completion_date']).date()
    
    new_project = Project(
        title=data['title'],
        pen_name=data['pen_name'],
        genre=data['genre'],
        target_audience=data['target_audience'],
        core_theme=data['core_theme'],
        synopsis=data['synopsis'],
        writing_style=data.get('writing_style', ''),
        reference_works=data.get('reference_works', ''),
        daily_word_goal=data.get('daily_word_goal', 0),
        total_word_goal=data.get('total_word_goal', 0),
        estimated_completion_date=estimated_completion_date
    )
    db.session.add(new_project)
    db.session.commit()
    return jsonify(new_project.to_dict()), 201

@api_bp.route('/projects/<int:id>', methods=['GET'])
def get_project(id):
    project = Project.query.get(id)
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    return jsonify(project.to_dict())

@api_bp.route('/projects/<int:id>', methods=['PUT'])
def update_project(id):
    project = Project.query.get(id)
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    data = request.json
    
    # 处理日期字段
    if data.get('estimated_completion_date'):
        project.estimated_completion_date = datetime.fromisoformat(data['estimated_completion_date']).date()
    
    project.title = data.get('title', project.title)
    project.pen_name = data.get('pen_name', project.pen_name)
    project.genre = data.get('genre', project.genre)
    project.target_audience = data.get('target_audience', project.target_audience)
    project.core_theme = data.get('core_theme', project.core_theme)
    project.synopsis = data.get('synopsis', project.synopsis)
    project.writing_style = data.get('writing_style', project.writing_style)
    project.reference_works = data.get('reference_works', project.reference_works)
    project.daily_word_goal = data.get('daily_word_goal', project.daily_word_goal)
    project.total_word_goal = data.get('total_word_goal', project.total_word_goal)
    project.word_count = data.get('word_count', project.word_count)
    db.session.commit()
    return jsonify(project.to_dict())

@api_bp.route('/projects/<int:id>', methods=['DELETE'])
def delete_project(id):
    project = Project.query.get(id)
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    db.session.delete(project)
    db.session.commit()
    return jsonify({'message': 'Project deleted successfully'})

# 情绪板相关接口
@api_bp.route('/projects/<int:id>/emotion_board', methods=['GET'])
def get_emotion_board(id):
    emotion_boards = EmotionBoard.query.filter_by(project_id=id).order_by(EmotionBoard.order_index).all()
    result = [board.to_dict() for board in emotion_boards]
    return jsonify(result)

@api_bp.route('/projects/<int:id>/emotion_board', methods=['POST'])
def add_emotion_board_image(id):
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # 确保上传目录存在
    upload_folder = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'uploads', 'emotion_board')
    os.makedirs(upload_folder, exist_ok=True)
    
    # 保存文件
    filename = secure_filename(file.filename)
    filepath = os.path.join(upload_folder, filename)
    file.save(filepath)
    
    # 获取当前最大排序索引
    max_index = db.session.query(db.func.max(EmotionBoard.order_index)).filter_by(project_id=id).scalar() or -1
    
    # 创建情绪板记录
    new_board = EmotionBoard(
        project_id=id,
        image_url=f'/uploads/emotion_board/{filename}',
        description=request.form.get('description', ''),
        tags=request.form.get('tags', ''),
        order_index=max_index + 1
    )
    db.session.add(new_board)
    db.session.commit()
    
    return jsonify(new_board.to_dict()), 201

@api_bp.route('/projects/<int:id>/emotion_board/<int:board_id>', methods=['PUT'])
def update_emotion_board_image(id, board_id):
    board = EmotionBoard.query.filter_by(id=board_id, project_id=id).first()
    if not board:
        return jsonify({'error': 'Emotion board image not found'}), 404
    
    data = request.json
    board.description = data.get('description', board.description)
    board.tags = data.get('tags', board.tags)
    board.order_index = data.get('order_index', board.order_index)
    db.session.commit()
    
    return jsonify(board.to_dict())

@api_bp.route('/projects/<int:id>/emotion_board/<int:board_id>', methods=['DELETE'])
def delete_emotion_board_image(id, board_id):
    board = EmotionBoard.query.filter_by(id=board_id, project_id=id).first()
    if not board:
        return jsonify({'error': 'Emotion board image not found'}), 404
    
    # 删除文件
    if board.image_url:
        filepath = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'uploads', 'emotion_board', os.path.basename(board.image_url))
        if os.path.exists(filepath):
            os.remove(filepath)
    
    db.session.delete(board)
    db.session.commit()
    return jsonify({'message': 'Emotion board image deleted successfully'})

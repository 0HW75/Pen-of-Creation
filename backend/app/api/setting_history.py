from flask import jsonify, request
from app import db
from app.models import History, Project
from app.api import api_bp

@api_bp.route('/settings/history', methods=['GET'])
def get_histories():
    project_id = request.args.get('project_id')
    if project_id:
        histories = History.query.filter_by(project_id=project_id).all()
    else:
        histories = History.query.all()
    return jsonify([history.to_dict() for history in histories])

@api_bp.route('/settings/history/<int:history_id>', methods=['GET'])
def get_history(history_id):
    history = History.query.get_or_404(history_id)
    return jsonify(history.to_dict())

@api_bp.route('/settings/history', methods=['POST'])
def create_history():
    data = request.get_json()
    project = Project.query.get_or_404(data['project_id'])
    new_history = History(
        project_id=data['project_id'],
        era_division=data.get('era_division', ''),
        historical_events=data.get('historical_events', ''),
        civilization_development=data.get('civilization_development', ''),
        historical_gaps=data.get('historical_gaps', ''),
        wars=data.get('wars', ''),
        disasters_reconstruction=data.get('disasters_reconstruction', ''),
        major_discoveries=data.get('major_discoveries', ''),
        treaties=data.get('treaties', ''),
        important_figures=data.get('important_figures', ''),
        historical_evaluations=data.get('historical_evaluations', ''),
        influence_heritage=data.get('influence_heritage', '')
    )
    db.session.add(new_history)
    db.session.commit()
    return jsonify(new_history.to_dict()), 201

@api_bp.route('/settings/history/<int:history_id>', methods=['PUT'])
def update_history(history_id):
    history = History.query.get_or_404(history_id)
    data = request.get_json()
    history.era_division = data.get('era_division', history.era_division)
    history.historical_events = data.get('historical_events', history.historical_events)
    history.civilization_development = data.get('civilization_development', history.civilization_development)
    history.historical_gaps = data.get('historical_gaps', history.historical_gaps)
    history.wars = data.get('wars', history.wars)
    history.disasters_reconstruction = data.get('disasters_reconstruction', history.disasters_reconstruction)
    history.major_discoveries = data.get('major_discoveries', history.major_discoveries)
    history.treaties = data.get('treaties', history.treaties)
    history.important_figures = data.get('important_figures', history.important_figures)
    history.historical_evaluations = data.get('historical_evaluations', history.historical_evaluations)
    history.influence_heritage = data.get('influence_heritage', history.influence_heritage)
    db.session.commit()
    return jsonify(history.to_dict())

@api_bp.route('/settings/history/<int:history_id>', methods=['DELETE'])
def delete_history(history_id):
    history = History.query.get_or_404(history_id)
    db.session.delete(history)
    db.session.commit()
    return jsonify({'message': 'History deleted successfully'}), 200
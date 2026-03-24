from flask import jsonify, request
from app import db
from app.models import SocietyCulture, Project
from app.api import api_bp

@api_bp.route('/settings/society', methods=['GET'])
def get_society_cultures():
    project_id = request.args.get('project_id')
    if project_id:
        cultures = SocietyCulture.query.filter_by(project_id=project_id).all()
    else:
        cultures = SocietyCulture.query.all()
    return jsonify([culture.to_dict() for culture in cultures])

@api_bp.route('/settings/society/<int:culture_id>', methods=['GET'])
def get_society_culture(culture_id):
    culture = SocietyCulture.query.get_or_404(culture_id)
    return jsonify(culture.to_dict())

@api_bp.route('/settings/society', methods=['POST'])
def create_society_culture():
    data = request.get_json()
    project = Project.query.get_or_404(data['project_id'])
    new_culture = SocietyCulture(
        project_id=data['project_id'],
        political_system=data.get('political_system', ''),
        class_hierarchy=data.get('class_hierarchy', ''),
        power_institutions=data.get('power_institutions', ''),
        legal_system=data.get('legal_system', ''),
        currency_system=data.get('currency_system', ''),
        trade_network=data.get('trade_network', ''),
        resource_distribution=data.get('resource_distribution', ''),
        economic_model=data.get('economic_model', ''),
        language_writing=data.get('language_writing', ''),
        religion=data.get('religion', ''),
        customs=data.get('customs', ''),
        art_forms=data.get('art_forms', ''),
        etiquette=data.get('etiquette', '')
    )
    db.session.add(new_culture)
    db.session.commit()
    return jsonify(new_culture.to_dict()), 201

@api_bp.route('/settings/society/<int:culture_id>', methods=['PUT'])
def update_society_culture(culture_id):
    culture = SocietyCulture.query.get_or_404(culture_id)
    data = request.get_json()
    culture.political_system = data.get('political_system', culture.political_system)
    culture.class_hierarchy = data.get('class_hierarchy', culture.class_hierarchy)
    culture.power_institutions = data.get('power_institutions', culture.power_institutions)
    culture.legal_system = data.get('legal_system', culture.legal_system)
    culture.currency_system = data.get('currency_system', culture.currency_system)
    culture.trade_network = data.get('trade_network', culture.trade_network)
    culture.resource_distribution = data.get('resource_distribution', culture.resource_distribution)
    culture.economic_model = data.get('economic_model', culture.economic_model)
    culture.language_writing = data.get('language_writing', culture.language_writing)
    culture.religion = data.get('religion', culture.religion)
    culture.customs = data.get('customs', culture.customs)
    culture.art_forms = data.get('art_forms', culture.art_forms)
    culture.etiquette = data.get('etiquette', culture.etiquette)
    db.session.commit()
    return jsonify(culture.to_dict())

@api_bp.route('/settings/society/<int:culture_id>', methods=['DELETE'])
def delete_society_culture(culture_id):
    culture = SocietyCulture.query.get_or_404(culture_id)
    db.session.delete(culture)
    db.session.commit()
    return jsonify({'message': 'Society culture deleted successfully'}), 200
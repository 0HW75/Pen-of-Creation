from app.api import api_bp
from app import db
from app.models import Outline, Volume, Chapter, Project
from flask import request, jsonify
import json

# 大纲相关接口
@api_bp.route('/outlines', methods=['POST'])
def create_outline():
    data = request.json
    
    new_outline = Outline(
        project_id=data['project_id'],
        title=data['title'],
        content=data.get('content', ''),
        story_model=data.get('story_model', ''),
        version=data.get('version', 1)
    )
    db.session.add(new_outline)
    db.session.commit()
    return jsonify(new_outline.to_dict()), 201

@api_bp.route('/projects/<int:id>/outline', methods=['GET'])
def get_project_outline(id):
    outlines = Outline.query.filter_by(project_id=id).order_by(Outline.version.desc()).all()
    result = [outline.to_dict() for outline in outlines]
    return jsonify(result)

@api_bp.route('/outlines/<int:id>', methods=['GET'])
def get_outline(id):
    outline = Outline.query.get(id)
    if not outline:
        return jsonify({'error': 'Outline not found'}), 404
    return jsonify(outline.to_dict())

@api_bp.route('/outlines/<int:id>', methods=['PUT'])
def update_outline(id):
    outline = Outline.query.get(id)
    if not outline:
        return jsonify({'error': 'Outline not found'}), 404
    
    data = request.json
    outline.title = data.get('title', outline.title)
    outline.content = data.get('content', outline.content)
    outline.story_model = data.get('story_model', outline.story_model)
    outline.version = data.get('version', outline.version)
    
    db.session.commit()
    return jsonify(outline.to_dict())

@api_bp.route('/outlines/<int:id>', methods=['DELETE'])
def delete_outline(id):
    outline = Outline.query.get(id)
    if not outline:
        return jsonify({'error': 'Outline not found'}), 404
    
    db.session.delete(outline)
    db.session.commit()
    return jsonify({'message': 'Outline deleted successfully'})

from app.services.ai_service import ai_service

# AI生成大纲
@api_bp.route('/ai/generate_outline', methods=['POST'])
def generate_outline():
    data = request.json
    project_id = data.get('project_id')
    story_model = data.get('story_model', 'hero_journey')
    params = data.get('params', {})
    project_info = data.get('project_info', {})
    
    # 获取项目信息
    outline_title = project_info.get('title', 'Generated Outline')
    genre = project_info.get('genre', '未知类型')
    core_theme = project_info.get('core_theme', '默认主题')
    target_audience = project_info.get('target_audience', '所有读者')
    synopsis = project_info.get('synopsis', '')
    writing_style = project_info.get('writing_style', '')
    reference_works = project_info.get('reference_works', '')
    
    # 构建AI提示词
    system_prompt = f"你是一个专业的故事大纲生成专家，擅长根据项目信息创建详细、有深度的故事大纲。"
    user_prompt = f"请为以下小说项目生成一个详细的故事大纲：\n\n"
    user_prompt += f"项目标题：{outline_title}\n"
    user_prompt += f"小说类型：{genre}\n"
    user_prompt += f"核心主题：{core_theme}\n"
    user_prompt += f"一句话梗概：{synopsis}\n"
    user_prompt += f"创作风格：{writing_style}\n"
    user_prompt += f"参考作品：{reference_works}\n"
    user_prompt += f"目标读者：{target_audience}\n"
    user_prompt += f"故事模型：{story_model}\n\n"
    user_prompt += f"请按照以下固定格式生成大纲：\n"
    user_prompt += f"1. 主线剧情：详细描述故事的主要情节发展\n"
    user_prompt += f"2. 次要情节：列出2-3个重要的次要情节\n"
    user_prompt += f"3. 关键事件：列出5-7个推动故事发展的关键事件\n"
    user_prompt += f"4. 角色弧线：描述主要角色的成长和转变\n"
    user_prompt += f"5. 主题：深入探讨故事的核心主题\n\n"
    user_prompt += f"请确保大纲内容丰富、结构合理，符合所选的故事模型和小说类型。"
    
    # 调用AI服务生成大纲
    try:
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        # 调用AI服务
        ai_response = ai_service.chat_completion(
            messages,
            max_tokens=2000,
            temperature=0.7
        )
        
        # 解析AI生成的大纲内容
        ai_content = ai_response['content']
        
        # 构建大纲结构
        outline_content = {
            'main_plot': '主线剧情',
            'sub_plots': ['次要情节1', '次要情节2'],
            'key_events': ['关键事件1', '关键事件2', '关键事件3', '关键事件4', '关键事件5'],
            'character_arcs': ['角色弧线1', '角色弧线2'],
            'theme': core_theme,
            'target_audience': target_audience,
            'genre': genre,
            'ai_generated_content': ai_content
        }
        
        # 尝试从AI生成的内容中提取结构化信息
        lines = ai_content.split('\n')
        current_section = None
        
        for line in lines:
            line = line.strip()
            if line.startswith('1. 主线剧情：'):
                current_section = 'main_plot'
                outline_content['main_plot'] = line.replace('1. 主线剧情：', '').strip()
            elif line.startswith('2. 次要情节：'):
                current_section = 'sub_plots'
                outline_content['sub_plots'] = []
            elif line.startswith('3. 关键事件：'):
                current_section = 'key_events'
                outline_content['key_events'] = []
            elif line.startswith('4. 角色弧线：'):
                current_section = 'character_arcs'
                outline_content['character_arcs'] = []
            elif line.startswith('5. 主题：'):
                current_section = 'theme'
                outline_content['theme'] = line.replace('5. 主题：', '').strip()
            elif current_section == 'sub_plots' and line and not line.startswith('3. '):
                outline_content['sub_plots'].append(line)
            elif current_section == 'key_events' and line and not line.startswith('4. '):
                outline_content['key_events'].append(line)
            elif current_section == 'character_arcs' and line and not line.startswith('5. '):
                outline_content['character_arcs'].append(line)
        
        # 创建大纲
        new_outline = Outline(
            project_id=project_id,
            title=f'{outline_title} - 大纲',
            content=json.dumps(outline_content, ensure_ascii=False),
            story_model=story_model
        )
        db.session.add(new_outline)
        db.session.commit()
        
        return jsonify(new_outline.to_dict()), 201
        
    except Exception as e:
        # 如果AI服务调用失败，返回基于项目信息的模拟数据
        import traceback
        traceback.print_exc()
        print(f"AI服务调用失败: {e}")
        
        # 固定但合理的大纲格式
        fallback_outline = {
            'title': f'{outline_title} - 大纲',
            'content': json.dumps({
                'main_plot': f'{genre}类型故事的主线剧情，围绕{core_theme}展开',
                'sub_plots': [
                    f'{genre}类型的次要情节1',
                    f'{genre}类型的次要情节2'
                ],
                'key_events': [
                    '故事开端：介绍主要角色和世界观',
                    '冲突引入：主角面临挑战',
                    '情节发展：主角克服困难',
                    '高潮：主角面临最终挑战',
                    '结局：故事收尾'
                ],
                'character_arcs': [
                    '主角的成长历程',
                    '反派的动机和转变'
                ],
                'theme': core_theme,
                'target_audience': target_audience,
                'genre': genre,
                'note': 'AI服务不可用，返回默认大纲'
            }, ensure_ascii=False),
            'story_model': story_model
        }
        
        new_outline = Outline(
            project_id=project_id,
            title=fallback_outline['title'],
            content=fallback_outline['content'],
            story_model=fallback_outline['story_model']
        )
        db.session.add(new_outline)
        db.session.commit()
        
        return jsonify(new_outline.to_dict()), 201

# 分解大纲为卷纲
@api_bp.route('/outlines/<int:id>/decompose', methods=['POST'])
def decompose_outline(id):
    outline = Outline.query.get(id)
    if not outline:
        return jsonify({'error': 'Outline not found'}), 404
    
    # 这里应该根据大纲内容分解为卷纲
    # 暂时返回模拟数据
    mock_volumes = [
        {
            'title': 'Volume 1',
            'content': 'Introduction and setup',
            'core_conflict': 'Initial conflict',
            'order_index': 1
        },
        {
            'title': 'Volume 2',
            'content': 'Rising action',
            'core_conflict': 'Main conflict development',
            'order_index': 2
        },
        {
            'title': 'Volume 3',
            'content': 'Climax and resolution',
            'core_conflict': 'Final conflict',
            'order_index': 3
        }
    ]
    
    created_volumes = []
    for vol_data in mock_volumes:
        new_volume = Volume(
            project_id=outline.project_id,
            outline_id=outline.id,
            title=vol_data['title'],
            content=vol_data['content'],
            core_conflict=vol_data['core_conflict'],
            order_index=vol_data['order_index']
        )
        db.session.add(new_volume)
        created_volumes.append(new_volume)
    
    db.session.commit()
    return jsonify([volume.to_dict() for volume in created_volumes]), 201

# 卷纲相关接口
@api_bp.route('/volumes/<int:id>', methods=['GET'])
def get_volume(id):
    volume = Volume.query.get(id)
    if not volume:
        return jsonify({'error': 'Volume not found'}), 404
    return jsonify(volume.to_dict())

@api_bp.route('/volumes/<int:id>', methods=['PUT'])
def update_volume(id):
    volume = Volume.query.get(id)
    if not volume:
        return jsonify({'error': 'Volume not found'}), 404
    
    data = request.json
    volume.title = data.get('title', volume.title)
    volume.content = data.get('content', volume.content)
    volume.core_conflict = data.get('core_conflict', volume.core_conflict)
    volume.order_index = data.get('order_index', volume.order_index)
    
    db.session.commit()
    return jsonify(volume.to_dict())

@api_bp.route('/volumes/<int:id>', methods=['DELETE'])
def delete_volume(id):
    volume = Volume.query.get(id)
    if not volume:
        return jsonify({'error': 'Volume not found'}), 404
    
    db.session.delete(volume)
    db.session.commit()
    return jsonify({'message': 'Volume deleted successfully'})

# 分解卷纲为章纲
@api_bp.route('/volumes/<int:id>/decompose', methods=['POST'])
def decompose_volume(id):
    volume = Volume.query.get(id)
    if not volume:
        return jsonify({'error': 'Volume not found'}), 404
    
    # 这里应该根据卷纲内容分解为章纲
    # 暂时返回模拟数据
    mock_chapters = [
        {
            'title': 'Chapter 1',
            'scenes': json.dumps(['Scene 1', 'Scene 2']),
            'characters': json.dumps(['Character 1', 'Character 2']),
            'core_event': 'Introduction of main character',
            'emotional_goal': 'Establish empathy',
            'keywords': json.dumps(['introduction', 'setup']),
            'word_count_estimate': 2000,
            'order_index': 1
        },
        {
            'title': 'Chapter 2',
            'scenes': json.dumps(['Scene 1', 'Scene 2']),
            'characters': json.dumps(['Character 1', 'Character 3']),
            'core_event': 'Introduction of conflict',
            'emotional_goal': 'Create tension',
            'keywords': json.dumps(['conflict', 'tension']),
            'word_count_estimate': 2500,
            'order_index': 2
        }
    ]
    
    created_chapters = []
    for chap_data in mock_chapters:
        new_chapter = Chapter(
            project_id=volume.project_id,
            volume_id=volume.id,
            title=chap_data['title'],
            scenes=chap_data['scenes'],
            characters=chap_data['characters'],
            core_event=chap_data['core_event'],
            emotional_goal=chap_data['emotional_goal'],
            keywords=chap_data['keywords'],
            word_count_estimate=chap_data['word_count_estimate'],
            order_index=chap_data['order_index']
        )
        db.session.add(new_chapter)
        created_chapters.append(new_chapter)
    
    db.session.commit()
    return jsonify([chapter.to_dict() for chapter in created_chapters]), 201

# 章纲相关接口
@api_bp.route('/chapters/<int:id>', methods=['PUT'])
def update_chapter_details(id):
    chapter = Chapter.query.get(id)
    if not chapter:
        return jsonify({'error': 'Chapter not found'}), 404
    
    data = request.json
    chapter.title = data.get('title', chapter.title)
    chapter.scenes = data.get('scenes', chapter.scenes)
    chapter.characters = data.get('characters', chapter.characters)
    chapter.core_event = data.get('core_event', chapter.core_event)
    chapter.emotional_goal = data.get('emotional_goal', chapter.emotional_goal)
    chapter.keywords = data.get('keywords', chapter.keywords)
    chapter.word_count_estimate = data.get('word_count_estimate', chapter.word_count_estimate)
    
    db.session.commit()
    return jsonify(chapter.to_dict())

# 章纲评估
@api_bp.route('/chapters/<int:id>/evaluate', methods=['GET'])
def evaluate_chapter(id):
    chapter = Chapter.query.get(id)
    if not chapter:
        return jsonify({'error': 'Chapter not found'}), 404
    
    # 这里应该实现章纲评估逻辑
    # 暂时返回模拟数据
    evaluation = {
        'chapter_id': id,
        'function_distribution': {
            'main_plot': 70,
            'character_development': 20,
            'foreshadowing': 10
        },
        'rhythm_evaluation': 'Good',
        'conflict_density': 'Moderate',
        'character_balance': 'Balanced'
    }
    
    return jsonify(evaluation)

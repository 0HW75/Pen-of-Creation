from app.api import api_bp
from app import db
from app.models import Outline, Volume, Chapter, Project, StoryModel
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
    system_prompt = data.get('system_prompt', '')
    selected_architect = data.get('selected_architect', None)
    outline_structure_prompt = data.get('outline_structure_prompt', '')
    
    # 如果提供了selected_architect，使用它的prompt作为系统提示词
    if selected_architect and selected_architect.get('prompt'):
        system_prompt = selected_architect.get('prompt')
    
    # 如果提供了outline_structure_prompt，添加到系统提示词中
    if outline_structure_prompt:
        system_prompt += '\n\n' + outline_structure_prompt
    
    # 获取项目信息
    outline_title = project_info.get('title', 'Generated Outline')
    genre = project_info.get('genre', '未知类型')
    core_theme = project_info.get('core_theme', '默认主题')
    target_audience = project_info.get('target_audience', '所有读者')
    synopsis = project_info.get('synopsis', '')
    writing_style = project_info.get('writing_style', '')
    reference_works = project_info.get('reference_works', '')
    
    # 构建AI提示词
    if not system_prompt:
        # 默认系统提示词
        system_prompt = f"你是一个专业的故事大纲生成专家，擅长根据项目信息创建详细、有深度的故事大纲。你的输出必须严格遵循指定的格式，确保结构清晰、内容完整，并且格式一致性高。"
        system_prompt += f"\n\n请按照以下固定格式生成大纲：\n"
        system_prompt += f"1. 使用Markdown格式输出\n"
        system_prompt += f"2. 标题层级必须清晰：# 一级标题，## 二级标题，### 三级标题\n"
        system_prompt += f"3. 必须包含以下章节，且章节顺序不可更改：\n"
        system_prompt += f"   - ## 1. 主线剧情\n"
        system_prompt += f"   - ## 2. 次要情节\n"
        system_prompt += f"   - ## 3. 关键事件\n"
        system_prompt += f"   - ## 4. 角色弧线\n"
        system_prompt += f"   - ## 5. 主题\n"
        system_prompt += f"\n"
        system_prompt += f"内容要求：\n"
        system_prompt += f"1. 主线剧情：详细描述故事的主要情节发展，包含起承转合\n"
        system_prompt += f"2. 次要情节：列出2-3个重要的次要情节，每个次要情节要有标题和简短描述\n"
        system_prompt += f"3. 关键事件：列出5-7个推动故事发展的关键事件，按时间顺序排列\n"
        system_prompt += f"4. 角色弧线：描述主要角色的成长和转变，至少包含主角的完整弧线\n"
        system_prompt += f"5. 主题：深入探讨故事的核心主题，分析其在故事中的体现方式\n"
    user_prompt = f"请为以下小说项目生成一个详细的故事大纲：\n\n"
    user_prompt += f"项目标题：{outline_title}\n"
    user_prompt += f"小说类型：{genre}\n"
    user_prompt += f"核心主题：{core_theme}\n"
    user_prompt += f"一句话梗概：{synopsis}\n"
    user_prompt += f"创作风格：{writing_style}\n"
    user_prompt += f"参考作品：{reference_works}\n"
    user_prompt += f"目标读者：{target_audience}\n"
    user_prompt += f"故事模型：{story_model}\n\n"
    user_prompt += f"## 格式要求（必须严格遵循）：\n"
    user_prompt += f"1. 使用Markdown格式输出\n"
    user_prompt += f"2. 标题层级必须清晰：# 一级标题，## 二级标题，### 三级标题\n"
    user_prompt += f"3. 必须包含以下章节，且章节顺序不可更改：\n"
    user_prompt += f"   - ## 1. 主线剧情\n"
    user_prompt += f"   - ## 2. 次要情节\n"
    user_prompt += f"   - ## 3. 关键事件\n"
    user_prompt += f"   - ## 4. 角色弧线\n"
    user_prompt += f"   - ## 5. 主题\n"
    user_prompt += f"\n"
    user_prompt += f"## 内容要求：\n"
    user_prompt += f"1. 主线剧情：详细描述故事的主要情节发展，包含起承转合\n"
    user_prompt += f"2. 次要情节：列出2-3个重要的次要情节，每个次要情节要有标题和简短描述\n"
    user_prompt += f"3. 关键事件：列出5-7个推动故事发展的关键事件，按时间顺序排列\n"
    user_prompt += f"4. 角色弧线：描述主要角色的成长和转变，至少包含主角的完整弧线\n"
    user_prompt += f"5. 主题：深入探讨故事的核心主题，分析其在故事中的体现方式\n"
    user_prompt += f"\n"
    user_prompt += f"## 输出示例结构：\n"
    user_prompt += f"```markdown\n"
    user_prompt += f"# {outline_title} 故事大纲\n\n"
    user_prompt += f"## 1. 主线剧情\n"
    user_prompt += f"[详细描述主线剧情]\n\n"
    user_prompt += f"## 2. 次要情节\n"
    user_prompt += f"### A. [次要情节1标题]\n"
    user_prompt += f"[描述]\n"
    user_prompt += f"### B. [次要情节2标题]\n"
    user_prompt += f"[描述]\n\n"
    user_prompt += f"## 3. 关键事件\n"
    user_prompt += f"1. [关键事件1]\n"
    user_prompt += f"2. [关键事件2]\n"
    user_prompt += f"3. [关键事件3]\n"
    user_prompt += f"4. [关键事件4]\n"
    user_prompt += f"5. [关键事件5]\n\n"
    user_prompt += f"## 4. 角色弧线\n"
    user_prompt += f"### [主角名称]\n"
    user_prompt += f"- 起点：[初始状态]\n"
    user_prompt += f"- 转变点：[关键转变]\n"
    user_prompt += f"- 终点：[最终状态]\n\n"
    user_prompt += f"## 5. 主题\n"
    user_prompt += f"[深入分析主题]\n"
    user_prompt += f"```\n"
    user_prompt += f"\n"
    user_prompt += f"请严格按照上述格式生成大纲，确保结构完整、内容丰富，符合所选的故事模型和小说类型。"
    
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

# 故事模型相关接口
@api_bp.route('/story-models', methods=['GET'])
def get_story_models():
    models = StoryModel.query.all()
    return jsonify([model.to_dict() for model in models])

@api_bp.route('/story-models/<int:id>', methods=['GET'])
def get_story_model(id):
    model = StoryModel.query.get(id)
    if not model:
        return jsonify({'error': 'Story model not found'}), 404
    return jsonify(model.to_dict())

@api_bp.route('/story-models', methods=['POST'])
def create_story_model():
    data = request.json
    
    # 检查key是否已存在
    existing = StoryModel.query.filter_by(key=data['key']).first()
    if existing:
        return jsonify({'error': 'Story model with this key already exists'}), 400
    
    new_model = StoryModel(
        key=data['key'],
        name=data['name'],
        description=data.get('description', ''),
        is_default=data.get('is_default', False)
    )
    db.session.add(new_model)
    db.session.commit()
    return jsonify(new_model.to_dict()), 201

@api_bp.route('/story-models/<int:id>', methods=['PUT'])
def update_story_model(id):
    model = StoryModel.query.get(id)
    if not model:
        return jsonify({'error': 'Story model not found'}), 404
    
    data = request.json
    # 检查key是否与其他模型冲突
    if 'key' in data and data['key'] != model.key:
        existing = StoryModel.query.filter_by(key=data['key']).first()
        if existing:
            return jsonify({'error': 'Story model with this key already exists'}), 400
    
    model.key = data.get('key', model.key)
    model.name = data.get('name', model.name)
    model.description = data.get('description', model.description)
    model.is_default = data.get('is_default', model.is_default)
    
    db.session.commit()
    return jsonify(model.to_dict())

@api_bp.route('/story-models/<int:id>', methods=['DELETE'])
def delete_story_model(id):
    model = StoryModel.query.get(id)
    if not model:
        return jsonify({'error': 'Story model not found'}), 404
    
    # 不允许删除默认模型
    if model.is_default:
        return jsonify({'error': 'Cannot delete default story model'}), 400
    
    db.session.delete(model)
    db.session.commit()
    return jsonify({'message': 'Story model deleted successfully'})

# 初始化默认故事模型
@api_bp.route('/story-models/init', methods=['POST'])
def init_default_story_models():
    default_models = [
        {'key': 'hero_journey', 'name': '英雄之旅', 'description': '约瑟夫·坎贝尔的英雄之旅模板，包含启程、启蒙、回归三个阶段', 'is_default': True},
        {'key': 'three_act', 'name': '三幕结构', 'description': '传统戏剧结构，包含开端、发展、高潮和结局', 'is_default': True},
        {'key': 'save_the_cat', 'name': '救猫咪', 'description': '布莱克·斯奈德的编剧模板，强调故事节拍和情感共鸣', 'is_default': True},
        {'key': 'freytags_pyramid', 'name': '弗莱塔格金字塔', 'description': '古斯塔夫·弗莱塔格的五幕结构： exposition、rising action、climax、falling action、resolution', 'is_default': True},
        {'key': 'campbell', 'name': '坎贝尔神话', 'description': '基于约瑟夫·坎贝尔的神话学研究，探索普遍的神话原型', 'is_default': True}
    ]
    
    created_models = []
    for model_data in default_models:
        existing = StoryModel.query.filter_by(key=model_data['key']).first()
        if not existing:
            new_model = StoryModel(**model_data)
            db.session.add(new_model)
            created_models.append(new_model)
    
    db.session.commit()
    return jsonify([model.to_dict() for model in created_models]), 201

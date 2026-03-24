from app.api import api_bp
from app import db
from app.models import Outline, Volume
from app.services.ai_service import ai_service
from app.config.ai_config import AIConfig
from flask import request, jsonify
import logging
import json

logger = logging.getLogger(__name__)

ai_config = AIConfig()

@api_bp.route('/ai/generate_outline', methods=['POST'])
def generate_outline():
    data = request.json
    project_id = data.get('project_id')
    story_model = data.get('story_model', 'hero_journey')
    project_info = data.get('project_info', {})
    system_prompt = data.get('system_prompt', '')
    selected_architect = data.get('selected_architect', None)
    outline_structure_prompt = data.get('outline_structure_prompt', '')

    if selected_architect and selected_architect.get('prompt'):
        system_prompt = selected_architect.get('prompt')

    if outline_structure_prompt:
        system_prompt += '\n\n' + outline_structure_prompt

    outline_title = project_info.get('title', 'Generated Outline')
    genre = project_info.get('genre', '未知类型')
    core_theme = project_info.get('core_theme', '默认主题')
    target_audience = project_info.get('target_audience', '所有读者')
    synopsis = project_info.get('synopsis', '')
    writing_style = project_info.get('writing_style', '')
    reference_works = project_info.get('reference_works', '')

    if not system_prompt:
        system_prompt = "你是一个专业的故事大纲生成专家，擅长根据项目信息创建详细、有深度的故事大纲。你的输出必须严格遵循指定的格式，确保结构清晰、内容完整，并且格式一致性高。"
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

    try:
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        provider_config = ai_config.get_provider_config(ai_config.default_provider)
        max_tokens = provider_config.get('max_tokens', 8000)

        ai_response = ai_service.chat_completion(
            messages,
            max_tokens=max_tokens,
            temperature=0.7
        )

        ai_content = ai_response['content']

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
        import traceback
        traceback.print_exc()
        print(f"AI服务调用失败: {e}")

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

@api_bp.route('/outlines/<int:id>/decompose', methods=['POST'])
def decompose_outline(id):
    outline = Outline.query.get(id)
    if not outline:
        return jsonify({'error': 'Outline not found'}), 404

    data = request.json

    if isinstance(data, list):
        created_volumes = []
        for vol_data in data:
            existing_volume = Volume.query.filter_by(
                project_id=outline.project_id,
                outline_id=outline.id,
                order_index=vol_data.get('order_index')
            ).first()

            if existing_volume:
                existing_volume.title = vol_data.get('title', existing_volume.title)
                existing_volume.content = vol_data.get('content', existing_volume.content)
                existing_volume.core_conflict = vol_data.get('core_conflict', existing_volume.core_conflict)
                existing_volume.version += 1
                created_volumes.append(existing_volume)
            else:
                new_volume = Volume(
                    project_id=outline.project_id,
                    outline_id=outline.id,
                    title=vol_data.get('title', '未命名卷'),
                    content=vol_data.get('content', ''),
                    core_conflict=vol_data.get('core_conflict', ''),
                    character_development=vol_data.get('character_development', ''),
                    key_events=json.dumps(vol_data.get('key_events', [])) if vol_data.get('key_events') else '[]',
                    chapter_count=vol_data.get('chapter_count', 0),
                    order_index=vol_data.get('order_index', len(created_volumes) + 1),
                    version=1
                )
                db.session.add(new_volume)
                created_volumes.append(new_volume)
    else:
        existing_volume = Volume.query.filter_by(
            project_id=outline.project_id,
            outline_id=outline.id,
            order_index=data.get('order_index', 1)
        ).first()

        if existing_volume:
            existing_volume.title = data.get('title', existing_volume.title)
            existing_volume.content = data.get('content', existing_volume.content)
            existing_volume.core_conflict = data.get('core_conflict', existing_volume.core_conflict)
            existing_volume.version += 1
            created_volumes = [existing_volume]
        else:
            new_volume = Volume(
                project_id=outline.project_id,
                outline_id=outline.id,
                title=data.get('title', '未命名卷'),
                content=data.get('content', ''),
                core_conflict=data.get('core_conflict', ''),
                character_development=data.get('character_development', ''),
                key_events=json.dumps(data.get('key_events', [])) if data.get('key_events') else '[]',
                chapter_count=data.get('chapter_count', 0),
                order_index=data.get('order_index', 1),
                version=1
            )
            db.session.add(new_volume)
            created_volumes = [new_volume]

    db.session.commit()
    return jsonify([volume.to_dict() for volume in created_volumes]), 201

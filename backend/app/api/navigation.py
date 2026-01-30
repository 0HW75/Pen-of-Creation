from flask import Blueprint, jsonify, request
from app.models import NavigationFlow, Task, Inspiration
from datetime import datetime
import json

navigation_bp = Blueprint('navigation', __name__)

@navigation_bp.route('/flow', methods=['GET'])
def get_navigation_flow():
    """获取创作流程图数据"""
    try:
        # 尝试从数据库获取
        flow = NavigationFlow.query.first()
        
        # 检查是否有项目存在
        from app.models import Project
        projects = Project.query.all()
        has_project = len(projects) > 0
        
        # 定义默认阶段
        default_stages = [
            {
                'id': 'project_creation',
                'name': '项目创建',
                'description': '确定作品基本信息和方向',
                'progress': 0,
                'status': 'pending'
            },
            {
                'id': 'setting_building',
                'name': '设定构建',
                'description': '创建世界观、角色、地点等设定',
                'progress': 0,
                'status': 'pending'
            },
            {
                'id': 'outline_planning',
                'name': '大纲规划',
                'description': '制定故事大纲和章节结构',
                'progress': 0,
                'status': 'pending'
            },
            {
                'id': 'chapter_creation',
                'name': '章节创作',
                'description': '撰写具体章节内容',
                'progress': 0,
                'status': 'pending'
            },
            {
                'id': 'revision',
                'name': '修改完善',
                'description': '检查和修改作品内容',
                'progress': 0,
                'status': 'pending'
            },
            {
                'id': 'export',
                'name': '作品导出',
                'description': '导出成品作品',
                'progress': 0,
                'status': 'pending'
            }
        ]
        
        # 根据项目状态更新阶段
        if has_project:
            # 项目创建阶段已完成
            default_stages[0]['progress'] = 100
            default_stages[0]['status'] = 'completed'
            # 进入设定构建阶段
            default_stages[1]['status'] = 'in_progress'
            # 更新整体进度
            overall_progress = 16.67  # 6个阶段，每个阶段约16.67%
            current_stage = 'setting_building'
        else:
            # 没有项目，保持默认状态
            overall_progress = 0
            current_stage = 'project_creation'
        
        if flow:
            # 更新现有流程数据
            flow.current_stage = current_stage
            flow.overall_progress = overall_progress
            flow.stage_progress = json.dumps(default_stages)
            flow.last_updated = datetime.now()
            flow.save()
        else:
            # 创建新的流程数据
            new_flow = NavigationFlow(
                project_id=1,
                current_stage=current_stage,
                overall_progress=overall_progress,
                stage_progress=json.dumps(default_stages),
                last_updated=datetime.now()
            )
            new_flow.save()
        
        return jsonify({
            'currentStage': current_stage,
            'overallProgress': overall_progress,
            'stages': default_stages
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@navigation_bp.route('/tasks', methods=['GET'])
def get_tasks():
    """获取今日任务"""
    try:
        tasks = Task.query.filter_by(project_id=1).all()
        
        if tasks:
            return jsonify([
                {
                    'id': task.id,
                    'title': task.title,
                    'description': task.description,
                    'type': task.type,
                    'priority': task.priority,
                    'status': task.status,
                    'due_date': task.due_date.strftime('%Y-%m-%d') if task.due_date else None
                }
                for task in tasks
            ])
        else:
            # 返回默认任务
            default_tasks = [
                {
                    'id': 1,
                    'title': '创建项目基本信息',
                    'description': '填写作品标题、类型、简介等基本信息',
                    'type': 'project',
                    'priority': 5,
                    'status': 'pending',
                    'due_date': datetime.now().strftime('%Y-%m-%d')
                },
                {
                    'id': 2,
                    'title': '构建世界观设定',
                    'description': '创建作品的世界观背景、规则和设定',
                    'type': 'setting',
                    'priority': 4,
                    'status': 'pending',
                    'due_date': datetime.now().strftime('%Y-%m-%d')
                },
                {
                    'id': 3,
                    'title': '设计主要角色',
                    'description': '创建至少3个主要角色，包括性格、背景和目标',
                    'type': 'character',
                    'priority': 4,
                    'status': 'pending',
                    'due_date': datetime.now().strftime('%Y-%m-%d')
                }
            ]
            
            # 创建默认任务
            for task_data in default_tasks:
                new_task = Task(
                    project_id=1,
                    title=task_data['title'],
                    description=task_data['description'],
                    type=task_data['type'],
                    priority=task_data['priority'],
                    status=task_data['status'],
                    due_date=datetime.strptime(task_data['due_date'], '%Y-%m-%d'),
                    created_at=datetime.now()
                )
                new_task.save()
            
            return jsonify(default_tasks)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@navigation_bp.route('/tasks', methods=['POST'])
def create_task():
    """创建新任务"""
    try:
        data = request.json
        
        new_task = Task(
            project_id=data.get('project_id', 1),
            title=data['title'],
            description=data['description'],
            type=data['type'],
            priority=data['priority'],
            status=data.get('status', 'pending'),
            due_date=datetime.strptime(data['due_date'], '%Y-%m-%d') if data.get('due_date') else datetime.now(),
            created_at=datetime.now()
        )
        new_task.save()
        
        return jsonify({
            'id': new_task.id,
            'title': new_task.title,
            'description': new_task.description,
            'type': new_task.type,
            'priority': new_task.priority,
            'status': new_task.status,
            'due_date': new_task.due_date.strftime('%Y-%m-%d') if new_task.due_date else None
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@navigation_bp.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """更新任务状态"""
    try:
        data = request.json
        task = Task.query.get(task_id)
        
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        if 'status' in data:
            task.status = data['status']
            if data['status'] == 'completed':
                task.completed_at = datetime.now()
        
        if 'priority' in data:
            task.priority = data['priority']
        
        if 'title' in data:
            task.title = data['title']
        
        if 'description' in data:
            task.description = data['description']
        
        task.save()
        
        return jsonify({
            'id': task.id,
            'title': task.title,
            'description': task.description,
            'type': task.type,
            'priority': task.priority,
            'status': task.status,
            'due_date': task.due_date.strftime('%Y-%m-%d') if task.due_date else None
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@navigation_bp.route('/inspiration', methods=['POST'])
def generate_inspiration():
    """生成灵感"""
    try:
        data = request.json
        inspiration_type = data.get('type', 'plot')
        
        # 灵感模板
        inspiration_templates = {
            'plot': [
                '主角在一次偶然的机会中发现了一个神秘的物品，这个物品似乎与他的身世有关联。',
                '在一个平凡的日子里，主角突然获得了一种特殊的能力，这种能力改变了他的生活。',
                '主角遇到了一个来自未来的人，这个人警告他即将发生的灾难。'
            ],
            'conflict': [
                '主角的好友突然背叛了他，加入了敌对势力，原因是为了保护自己的家人。',
                '主角必须在个人利益和集体利益之间做出选择，这个选择将影响很多人的命运。',
                '主角发现自己的信仰与现实产生了冲突，他必须重新审视自己的价值观。'
            ],
            'dialogue': [
                '"你以为你了解我？你根本不知道我经历了什么！"她的声音颤抖着，眼中闪烁着泪光。',
                '"我一直都在你身边，只是你从来没有注意到。"他轻声说道，眼神中充满了无奈。',
                '"这是最后一次机会，错过了就再也没有了。"老人的声音中充满了沧桑和急切。'
            ],
            'scene': [
                '深夜的古城墙下，月光洒在青石板路上，远处传来悠扬的笛声，仿佛在诉说着古老的故事。',
                '清晨的森林中，阳光透过树叶的缝隙洒在地上，形成斑驳的光影，鸟儿在枝头欢快地歌唱。',
                '冬日的雪地里，一个孤独的身影在缓慢前行，留下一串串深深的脚印，远处的村庄飘起了炊烟。'
            ],
            'character': [
                '主角在经历了一系列挫折后，逐渐从一个天真的少年成长为一个有责任感的领袖。',
                '反派角色并非天生邪恶，而是因为悲惨的童年经历才走上了不归路。',
                '配角在关键时刻做出了牺牲，他的行为改变了主角的命运轨迹。'
            ]
        }
        
        templates = inspiration_templates.get(inspiration_type, inspiration_templates['plot'])
        import random
        random_content = random.choice(templates)
        
        # 创建灵感记录
        new_inspiration = Inspiration(
            project_id=1,
            type=inspiration_type,
            content=random_content,
            context='AI生成',
            rating=0,
            status='未使用',
            created_at=datetime.now()
        )
        new_inspiration.save()
        
        return jsonify({
            'id': new_inspiration.id,
            'type': new_inspiration.type,
            'content': new_inspiration.content,
            'description': 'AI生成的灵感建议',
            'rating': new_inspiration.rating,
            'status': new_inspiration.status,
            'created_at': new_inspiration.created_at.isoformat()
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@navigation_bp.route('/inspiration', methods=['GET'])
def get_inspiration_list():
    """获取灵感列表"""
    try:
        inspirations = Inspiration.query.filter_by(project_id=1).all()
        
        if inspirations:
            return jsonify([
                {
                    'id': insp.id,
                    'type': insp.type,
                    'content': insp.content,
                    'description': 'AI生成的灵感建议',
                    'rating': insp.rating,
                    'status': insp.status,
                    'created_at': insp.created_at.isoformat()
                }
                for insp in inspirations
            ])
        else:
            # 返回默认灵感
            default_inspirations = [
                {
                    'id': 1,
                    'type': 'plot',
                    'content': '主角在一次偶然的机会中发现了一个神秘的物品，这个物品似乎与他的身世有关联。',
                    'description': '情节转折建议：通过神秘物品引出主角的身世之谜，推动故事发展。',
                    'rating': 4,
                    'status': '未使用',
                    'created_at': datetime.now().isoformat()
                },
                {
                    'id': 2,
                    'type': 'conflict',
                    'content': '主角的好友突然背叛了他，加入了敌对势力，原因是为了保护自己的家人。',
                    'description': '冲突点子：朋友变敌人的经典冲突，增加故事的戏剧性和情感深度。',
                    'rating': 5,
                    'status': '未使用',
                    'created_at': datetime.now().isoformat()
                },
                {
                    'id': 3,
                    'type': 'dialogue',
                    'content': '"你以为你了解我？你根本不知道我经历了什么！"她的声音颤抖着，眼中闪烁着泪光。',
                    'description': '对话开场：充满情感张力的对话，瞬间抓住读者的注意力。',
                    'rating': 4,
                    'status': '未使用',
                    'created_at': datetime.now().isoformat()
                },
                {
                    'id': 4,
                    'type': 'scene',
                    'content': '深夜的古城墙下，月光洒在青石板路上，远处传来悠扬的笛声，仿佛在诉说着古老的故事。',
                    'description': '场景灵感：营造氛围感的场景描写，为故事增添诗意和画面感。',
                    'rating': 5,
                    'status': '未使用',
                    'created_at': datetime.now().isoformat()
                },
                {
                    'id': 5,
                    'type': 'character',
                    'content': '主角在经历了一系列挫折后，逐渐从一个天真的少年成长为一个有责任感的领袖。',
                    'description': '角色发展：主角的成长弧线，展现人物的变化和成熟过程。',
                    'rating': 4,
                    'status': '未使用',
                    'created_at': datetime.now().isoformat()
                }
            ]
            
            # 创建默认灵感
            for insp_data in default_inspirations:
                new_inspiration = Inspiration(
                    project_id=1,
                    type=insp_data['type'],
                    content=insp_data['content'],
                    context='AI生成',
                    rating=insp_data['rating'],
                    status=insp_data['status'],
                    created_at=datetime.now()
                )
                new_inspiration.save()
            
            return jsonify(default_inspirations)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
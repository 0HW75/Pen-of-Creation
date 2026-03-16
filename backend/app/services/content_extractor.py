"""
内容提取服务 - 从故事蓝图提取所有文本内容用于AI分析
"""
from typing import List, Dict, Any, Optional
from app.models import Project, Outline, Volume, Chapter


class ContentExtractor:
    """从故事蓝图提取所有文本内容"""
    
    @staticmethod
    def extract_all_text(data: Any) -> str:
        """
        递归提取对象中所有字符串值
        
        Args:
            data: 任意数据（对象、数组、字符串等）
            
        Returns:
            拼接后的文本字符串
        """
        if not data:
            return ""
            
        if isinstance(data, str):
            return data + "\n"
            
        if isinstance(data, (int, float, bool)):
            return str(data) + "\n"
            
        if isinstance(data, list):
            result = ""
            for item in data:
                result += ContentExtractor.extract_all_text(item)
            return result
            
        if isinstance(data, dict):
            result = ""
            # 排除一些不需要的元数据字段
            exclude_fields = {'id', 'created_at', 'updated_at', 'version', 'order_index', 
                            'project_id', 'outline_id', 'volume_id', 'chapter_count',
                            'world_id', 'status'}
            
            for key, value in data.items():
                if key in exclude_fields:
                    continue
                # 为字段名添加标签，帮助AI理解上下文
                if isinstance(value, str) and len(value) > 0:
                    result += f"【{key}】{value}\n"
                else:
                    result += ContentExtractor.extract_all_text(value)
            return result
            
        return ""
    
    @staticmethod
    def extract_from_project(project_id: int) -> str:
        """
        从整个项目提取所有文本内容
        
        Args:
            project_id: 项目ID
            
        Returns:
            项目所有文本内容
        """
        project = Project.query.get(project_id)
        if not project:
            return ""
            
        result = ""
        
        # 提取项目所有字段
        result += f"【项目名称】{project.title}\n"
        if project.pen_name:
            result += f"【笔名】{project.pen_name}\n"
        if project.genre:
            result += f"【类型】{project.genre}\n"
        if project.target_audience:
            result += f"【目标读者】{project.target_audience}\n"
        if project.core_theme:
            result += f"【核心主题】{project.core_theme}\n"
        if project.synopsis:
            result += f"【故事梗概】{project.synopsis}\n"
        if project.writing_style:
            result += f"【写作风格】{project.writing_style}\n"
        if project.reference_works:
            result += f"【参考作品】{project.reference_works}\n"
        
        # 提取所有大纲
        outlines = Outline.query.filter_by(project_id=project_id).all()
        for outline in outlines:
            result += ContentExtractor.extract_from_outline(outline.id)
            
        return result
    
    @staticmethod
    def extract_from_outline(outline_id: int) -> str:
        """
        从大纲提取所有文本内容（包括卷纲和章纲）
        
        Args:
            outline_id: 大纲ID
            
        Returns:
            大纲所有文本内容
        """
        outline = Outline.query.get(outline_id)
        if not outline:
            return ""
            
        result = ""
        
        # 提取大纲基本信息
        result += f"\n=== 大纲：{outline.title} ===\n"
        if outline.content:
            result += f"【大纲内容】{outline.content}\n"
        if outline.story_model:
            result += f"【故事模型】{outline.story_model}\n"
            
        # 提取所有卷纲
        volumes = Volume.query.filter_by(outline_id=outline_id).order_by(Volume.order_index).all()
        for volume in volumes:
            result += ContentExtractor.extract_from_volume(volume.id)
            
        return result
    
    @staticmethod
    def extract_from_volume(volume_id: int) -> str:
        """
        从卷纲提取所有文本内容（包括章纲）
        
        Args:
            volume_id: 卷纲ID
            
        Returns:
            卷纲所有文本内容
        """
        volume = Volume.query.get(volume_id)
        if not volume:
            return ""
            
        result = ""
        
        # 提取卷纲基本信息
        result += f"\n--- 卷纲：{volume.title} ---\n"
        if volume.content:
            result += f"【卷纲内容】{volume.content}\n"
        if volume.core_conflict:
            result += f"【核心冲突】{volume.core_conflict}\n"
        if volume.character_development:
            result += f"【角色发展】{volume.character_development}\n"
        if volume.key_events:
            result += f"【关键事件】{volume.key_events}\n"
            
        # 提取所有章纲
        chapters = Chapter.query.filter_by(volume_id=volume_id).order_by(Chapter.order_index).all()
        for chapter in chapters:
            result += ContentExtractor.extract_from_chapter(chapter.id)
            
        return result
    
    @staticmethod
    def extract_from_chapter(chapter_id: int) -> str:
        """
        从章纲提取所有文本内容
        
        Args:
            chapter_id: 章纲ID
            
        Returns:
            章纲所有文本内容
        """
        chapter = Chapter.query.get(chapter_id)
        if not chapter:
            return ""
            
        result = ""
        
        # 提取章纲基本信息（使用实际字段名）
        result += f"\n· 章纲：{chapter.title}\n"
        if chapter.content:
            result += f"  【内容】{chapter.content}\n"
        if chapter.core_event:
            result += f"  【核心事件】{chapter.core_event}\n"
        if chapter.scenes:
            result += f"  【场景】{chapter.scenes}\n"
        if chapter.characters:
            result += f"  【角色】{chapter.characters}\n"
        if chapter.emotional_goal:
            result += f"  【情感目标】{chapter.emotional_goal}\n"
        if chapter.keywords:
            result += f"  【关键词】{chapter.keywords}\n"
        if chapter.word_count_estimate:
            result += f"  【预计字数】{chapter.word_count_estimate}\n"
        if chapter.status:
            result += f"  【状态】{chapter.status}\n"
        if chapter.type:
            result += f"  【类型】{chapter.type}\n"
        if chapter.word_count:
            result += f"  【字数】{chapter.word_count}\n"
            
        return result
    
    @staticmethod
    def extract_by_scope(content_scope: Dict[str, Any]) -> str:
        """
        根据内容范围提取文本
        
        Args:
            content_scope: 内容范围配置
                {
                    'type': 'full'|'outline'|'volume'|'chapter',
                    'outline_id': int,
                    'volume_id': int,
                    'chapter_id': int
                }
                
        Returns:
            提取的文本内容
        """
        scope_type = content_scope.get('type', 'full')
        
        if scope_type == 'full':
            # 整个故事蓝图
            project_id = content_scope.get('project_id')
            if project_id:
                return ContentExtractor.extract_from_project(project_id)
                
        elif scope_type == 'outline':
            # 特定大纲
            outline_id = content_scope.get('outline_id')
            if outline_id:
                return ContentExtractor.extract_from_outline(outline_id)
                
        elif scope_type == 'volume':
            # 特定卷纲
            volume_id = content_scope.get('volume_id')
            if volume_id:
                return ContentExtractor.extract_from_volume(volume_id)
                
        elif scope_type == 'chapter':
            # 特定章纲
            chapter_id = content_scope.get('chapter_id')
            if chapter_id:
                return ContentExtractor.extract_from_chapter(chapter_id)
                
        return ""

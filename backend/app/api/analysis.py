from flask import request, jsonify
from app.api import api_bp
from app import db
from app.models import Project, Chapter, Character, Relationship
import logging
import json
from datetime import datetime

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@api_bp.route('/analysis/project/<int:project_id>/relationship', methods=['GET'])
def get_relationship_data(project_id):
    """
    获取项目的关系图谱数据
    """
    try:
        # 获取项目的所有角色
        characters = Character.query.filter_by(project_id=project_id).all()
        # 获取项目的所有关系
        relationships = Relationship.query.filter_by(project_id=project_id).all()
        
        # 构建节点数据
        nodes = []
        node_map = {}
        
        for char in characters:
            node_id = f"character_{char.id}"
            node_map[node_id] = True
            nodes.append({
                'id': node_id,
                'name': char.name,
                'type': 'character',
                'symbolSize': 50,
                'itemStyle': {
                    'color': f'hsl({hash(char.name) % 360}, 70%, 60%)'
                }
            })
        
        # 构建边数据
        links = []
        for rel in relationships:
            source_id = f"{rel.source_type}_{rel.source_id}"
            target_id = f"{rel.target_type}_{rel.target_id}"
            
            # 只添加已存在的节点之间的关系
            if source_id in node_map and target_id in node_map:
                links.append({
                    'source': source_id,
                    'target': target_id,
                    'label': {
                        'show': True,
                        'formatter': rel.relationship_type
                    },
                    'lineStyle': {
                        'width': rel.strength,
                        'curveness': 0.3
                    }
                })
        
        data = {
            'nodes': nodes,
            'links': links
        }
        
        logger.info(f'获取关系图谱数据成功，项目ID: {project_id}, 节点数: {len(nodes)}, 边数: {len(links)}')
        return jsonify({'success': True, 'data': data})
        
    except Exception as e:
        logger.error(f'获取关系图谱数据失败: {str(e)}')
        return jsonify({'error': str(e)}), 500

@api_bp.route('/analysis/project/<int:project_id>/emotion', methods=['GET'])
def get_emotion_data(project_id):
    """
    获取项目的情绪曲线数据
    """
    try:
        # 获取项目的所有章节
        chapters = Chapter.query.filter_by(project_id=project_id).order_by(Chapter.order_index).all()
        
        # 构建情绪数据（这里使用模拟数据，实际项目中可以通过AI分析获取）
        emotion_data = []
        for chapter in chapters:
            # 基于章节内容长度和ID生成模拟情绪值
            content_length = len(chapter.content)
            emotion_value = (content_length % 100 - 50) * 0.8 + (chapter.id % 10 - 5)
            emotion_value = max(-50, min(50, emotion_value))
            
            emotion_data.append({
                'chapter_id': chapter.id,
                'chapter_title': chapter.title,
                'emotion_value': emotion_value,
                'word_count': chapter.word_count
            })
        
        logger.info(f'获取情绪曲线数据成功，项目ID: {project_id}, 章节数: {len(emotion_data)}')
        return jsonify({'success': True, 'data': emotion_data})
        
    except Exception as e:
        logger.error(f'获取情绪曲线数据失败: {str(e)}')
        return jsonify({'error': str(e)}), 500

@api_bp.route('/analysis/project/<int:project_id>/rhythm', methods=['GET'])
def get_rhythm_data(project_id):
    """
    获取项目的节奏分析数据
    """
    try:
        # 获取项目的所有章节
        chapters = Chapter.query.filter_by(project_id=project_id).order_by(Chapter.order_index).all()
        
        # 构建节奏数据（这里使用模拟数据，实际项目中可以通过文本分析获取）
        rhythm_data = []
        for chapter in chapters:
            # 生成模拟的动作、对话、描写比例
            total = 100
            action = (hash(chapter.title) % 40) + 20
            dialogue = (hash(chapter.content) % 30) + 10
            description = total - action - dialogue
            
            rhythm_data.append({
                'chapter_id': chapter.id,
                'chapter_title': chapter.title,
                'action': action,
                'dialogue': dialogue,
                'description': description,
                'word_count': chapter.word_count
            })
        
        logger.info(f'获取节奏分析数据成功，项目ID: {project_id}, 章节数: {len(rhythm_data)}')
        return jsonify({'success': True, 'data': rhythm_data})
        
    except Exception as e:
        logger.error(f'获取节奏分析数据失败: {str(e)}')
        return jsonify({'error': str(e)}), 500

@api_bp.route('/analysis/project/<int:project_id>/health', methods=['GET'])
def get_health_data(project_id):
    """
    获取项目的健康度分析数据
    """
    try:
        # 获取项目信息
        project = Project.query.get(project_id)
        if not project:
            return jsonify({'error': '项目不存在'}), 404
        
        # 获取项目的所有章节
        chapters = Chapter.query.filter_by(project_id=project_id).all()
        # 获取项目的所有角色
        characters = Character.query.filter_by(project_id=project_id).all()
        
        # 计算统计数据
        total_chapters = len(chapters)
        total_words = sum(chapter.word_count for chapter in chapters)
        total_characters = len(characters)
        avg_words_per_chapter = total_words // total_chapters if total_chapters > 0 else 0
        
        # 计算章节长度分布
        short_chapters = sum(1 for chapter in chapters if chapter.word_count < 1000)
        medium_chapters = sum(1 for chapter in chapters if 1000 <= chapter.word_count < 3000)
        long_chapters = sum(1 for chapter in chapters if chapter.word_count >= 3000)
        
        # 计算健康度指标
        chapter_health = min(100, max(0, (total_chapters / 20) * 100))
        word_health = min(100, max(0, (total_words / 100000) * 100))
        
        if avg_words_per_chapter < 500:
            length_health = 0
        elif avg_words_per_chapter > 5000:
            length_health = 100
        else:
            length_health = ((avg_words_per_chapter - 500) / 4500) * 100
        
        overall_health = (chapter_health + word_health + length_health) // 3
        
        health_data = {
            'project_id': project_id,
            'project_title': project.title,
            'overall_health': overall_health,
            'metrics': {
                'chapter_health': chapter_health,
                'word_health': word_health,
                'length_health': length_health
            },
            'stats': {
                'total_chapters': total_chapters,
                'total_words': total_words,
                'total_characters': total_characters,
                'avg_words_per_chapter': avg_words_per_chapter,
                'short_chapters': short_chapters,
                'medium_chapters': medium_chapters,
                'long_chapters': long_chapters
            }
        }
        
        logger.info(f'获取健康度分析数据成功，项目ID: {project_id}, 整体健康度: {overall_health}%')
        return jsonify({'success': True, 'data': health_data})
        
    except Exception as e:
        logger.error(f'获取健康度分析数据失败: {str(e)}')
        return jsonify({'error': str(e)}), 500

@api_bp.route('/analysis/project/<int:project_id>/stats', methods=['GET'])
def get_project_stats(project_id):
    """
    获取项目的统计分析数据
    """
    try:
        # 获取项目信息
        project = Project.query.get(project_id)
        if not project:
            return jsonify({'error': '项目不存在'}), 404
        
        # 获取项目的所有章节
        chapters = Chapter.query.filter_by(project_id=project_id).all()
        # 获取项目的所有角色
        characters = Character.query.filter_by(project_id=project_id).all()
        
        # 计算统计数据
        total_chapters = len(chapters)
        total_words = sum(chapter.word_count for chapter in chapters)
        total_characters = len(characters)
        avg_words_per_chapter = total_words // total_chapters if total_chapters > 0 else 0
        
        # 计算章节长度分布
        short_chapters = sum(1 for chapter in chapters if chapter.word_count < 1000)
        medium_chapters = sum(1 for chapter in chapters if 1000 <= chapter.word_count < 3000)
        long_chapters = sum(1 for chapter in chapters if chapter.word_count >= 3000)
        
        # 获取章节字数排行榜
        chapter_ranking = sorted(
            [(chapter.id, chapter.title, chapter.word_count, chapter.status) for chapter in chapters],
            key=lambda x: x[2],
            reverse=True
        )[:10]
        
        stats_data = {
            'project_id': project_id,
            'project_title': project.title,
            'basic_stats': {
                'total_chapters': total_chapters,
                'total_words': total_words,
                'total_characters': total_characters,
                'avg_words_per_chapter': avg_words_per_chapter
            },
            'chapter_length_distribution': {
                'short_chapters': short_chapters,
                'medium_chapters': medium_chapters,
                'long_chapters': long_chapters
            },
            'chapter_ranking': [
                {
                    'chapter_id': item[0],
                    'title': item[1],
                    'word_count': item[2],
                    'status': item[3]
                }
                for item in chapter_ranking
            ]
        }
        
        logger.info(f'获取统计分析数据成功，项目ID: {project_id}')
        return jsonify({'success': True, 'data': stats_data})
        
    except Exception as e:
        logger.error(f'获取统计分析数据失败: {str(e)}')
        return jsonify({'error': str(e)}), 500

@api_bp.route('/analysis/project/<int:project_id>/report', methods=['GET'])
def generate_project_report(project_id):
    """
    生成项目分析报告
    """
    try:
        # 获取项目信息
        project = Project.query.get(project_id)
        if not project:
            return jsonify({'error': '项目不存在'}), 404
        
        # 获取健康度数据
        health_response = get_health_data(project_id)
        health_data = health_response.json['data']
        
        # 获取统计数据
        stats_response = get_project_stats(project_id)
        stats_data = stats_response.json['data']
        
        # 生成报告内容
        report_content = f"# 作品分析报告\n\n"
        report_content += f"## 基本信息\n"
        report_content += f"- 项目ID: {project_id}\n"
        report_content += f"- 项目标题: {project.title}\n"
        report_content += f"- 分析时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        
        report_content += f"## 统计概览\n"
        report_content += f"- 总章节数: {stats_data['basic_stats']['total_chapters']}\n"
        report_content += f"- 总字数: {stats_data['basic_stats']['total_words']}\n"
        report_content += f"- 总角色数: {stats_data['basic_stats']['total_characters']}\n"
        report_content += f"- 平均每章字数: {stats_data['basic_stats']['avg_words_per_chapter']}\n\n"
        
        report_content += f"## 健康度分析\n"
        report_content += f"- 整体健康度: {health_data['overall_health']}%\n"
        report_content += f"- 章节数量健康度: {health_data['metrics']['chapter_health']:.1f}%\n"
        report_content += f"- 总字数健康度: {health_data['metrics']['word_health']:.1f}%\n"
        report_content += f"- 章节平均长度健康度: {health_data['metrics']['length_health']:.1f}%\n\n"
        
        report_content += f"## 章节长度分布\n"
        report_content += f"- 短章节 (< 1000字): {health_data['stats']['short_chapters']}\n"
        report_content += f"- 中等章节 (1000-3000字): {health_data['stats']['medium_chapters']}\n"
        report_content += f"- 长章节 (> 3000字): {health_data['stats']['long_chapters']}\n\n"
        
        report_content += f"## 章节字数排行榜\n"
        for i, chapter in enumerate(stats_data['chapter_ranking'], 1):
            report_content += f"{i}. {chapter['title']}: {chapter['word_count']}字 ({chapter['status']})\n"
        report_content += "\n"
        
        report_content += f"## 建议\n"
        if health_data['metrics']['chapter_health'] < 60:
            report_content += "- 建议增加章节数量，使故事结构更完整\n"
        else:
            report_content += "- 章节数量合理\n"
        
        if health_data['metrics']['word_health'] < 60:
            report_content += "- 建议增加总字数，使故事内容更丰富\n"
        else:
            report_content += "- 总字数合理\n"
        
        if health_data['metrics']['length_health'] < 60:
            report_content += "- 建议调整章节长度，使节奏更均衡\n"
        else:
            report_content += "- 章节长度合理\n"
        report_content += "\n"
        
        report_content += f"## 总结\n"
        if health_data['overall_health'] >= 80:
            report_content += "作品整体状态良好，建议继续保持创作节奏。\n"
        elif health_data['overall_health'] >= 60:
            report_content += "作品状态一般，建议根据上述建议进行优化。\n"
        else:
            report_content += "作品状态需要改进，建议重点关注健康度较低的指标。\n"
        
        report_data = {
            'project_id': project_id,
            'project_title': project.title,
            'report_content': report_content,
            'generated_at': datetime.now().isoformat()
        }
        
        logger.info(f'生成项目分析报告成功，项目ID: {project_id}')
        return jsonify({'success': True, 'data': report_data})
        
    except Exception as e:
        logger.error(f'生成项目分析报告失败: {str(e)}')
        return jsonify({'error': str(e)}), 500

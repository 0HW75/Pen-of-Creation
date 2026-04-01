import React from 'react';
import ReactMarkdown from 'react-markdown';
import './OutlineContentRenderer.css';

/**
 * 安全地解析 JSON 字符串
 * @param {string} str - 可能为 JSON 的字符串
 * @returns {Object|null} 解析后的对象或 null
 */
const safeJsonParse = (str) => {
  if (!str || typeof str !== 'string') return null;
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
};

/**
 * 将章纲数据转换为 Markdown 格式
 * @param {Object} chapter - 章纲数据对象
 * @returns {string} Markdown 字符串
 */
const convertChapterToMarkdown = (chapter) => {
  if (!chapter || typeof chapter !== 'object') return '';

  let markdown = '';

  // 处理标题
  if (chapter.title) {
    markdown += `# ${chapter.title}\n\n`;
  }

  // 处理核心事件
  if (chapter.core_event) {
    markdown += `## 核心事件\n\n${chapter.core_event}\n\n`;
  }

  // 处理内容（章纲的outline_content字段）
  if (chapter.outline_content) {
    markdown += `## 内容概要\n\n${chapter.outline_content}\n\n`;
  }

  // 处理场景
  if (chapter.scenes) {
    let scenesList = chapter.scenes;
    if (typeof scenesList === 'string') {
      try {
        scenesList = JSON.parse(scenesList);
      } catch (e) {
        scenesList = scenesList ? [scenesList] : [];
      }
    }
    if (Array.isArray(scenesList) && scenesList.length > 0) {
      markdown += `## 场景\n\n`;
      scenesList.forEach((scene, index) => {
        if (scene) markdown += `${index + 1}. ${scene}\n`;
      });
      markdown += `\n`;
    }
  }

  // 处理角色
  if (chapter.characters) {
    let charList = chapter.characters;
    if (typeof charList === 'string') {
      try {
        charList = JSON.parse(charList);
      } catch (e) {
        charList = charList ? [charList] : [];
      }
    }
    if (Array.isArray(charList) && charList.length > 0) {
      markdown += `## 出场角色\n\n`;
      charList.forEach((char, index) => {
        if (char) markdown += `- ${char}\n`;
      });
      markdown += `\n`;
    }
  }

  // 处理情感目标
  if (chapter.emotional_goal) {
    markdown += `## 情感目标\n\n${chapter.emotional_goal}\n\n`;
  }

  // 处理关键词
  if (chapter.keywords) {
    let kwList = chapter.keywords;
    if (typeof kwList === 'string') {
      try {
        kwList = JSON.parse(kwList);
      } catch (e) {
        kwList = kwList ? [kwList] : [];
      }
    }
    if (Array.isArray(kwList) && kwList.length > 0) {
      markdown += `## 关键词\n\n`;
      kwList.forEach((kw, index) => {
        if (kw) markdown += `- ${kw}\n`;
      });
      markdown += `\n`;
    }
  }

  // 处理预估字数
  if (chapter.word_count_estimate !== undefined && chapter.word_count_estimate !== null) {
    markdown += `## 预估字数\n\n${chapter.word_count_estimate} 字\n\n`;
  }

  // 处理状态
  if (chapter.status) {
    markdown += `## 状态\n\n${chapter.status}\n\n`;
  }

  return markdown || '暂无内容';
};

/**
 * 将嵌套 JSON 转换为 Markdown 格式（用于大纲/卷纲）
 * @param {Object} json - 嵌套的 JSON 对象
 * @returns {string} Markdown 字符串
 */
const convertNestedJsonToMarkdown = (json) => {
  if (!json || typeof json !== 'object') return String(json);

  let markdown = '';

  // 处理标题
  if (json.title) {
    markdown += `# ${json.title}\n\n`;
  }

  // 处理核心冲突
  if (json.core_conflict) {
    markdown += `## 核心冲突\n\n${json.core_conflict}\n\n`;
  }

  // 处理内容/主线剧情
  if (json.content) {
    markdown += `## 内容概要\n\n${json.content}\n\n`;
  }
  if (json.main_plot) {
    markdown += `## 主线剧情\n\n${json.main_plot}\n\n`;
  }

  // 处理主题
  if (json.theme) {
    markdown += `## 主题\n\n${json.theme}\n\n`;
  }

  // 处理次要情节
  if (json.sub_plots && Array.isArray(json.sub_plots) && json.sub_plots.length > 0) {
    markdown += `## 次要情节\n\n`;
    json.sub_plots.forEach((plot, index) => {
      markdown += `${index + 1}. ${plot}\n`;
    });
    markdown += `\n`;
  }

  // 处理关键事件
  if (json.key_events && Array.isArray(json.key_events) && json.key_events.length > 0) {
    markdown += `## 关键事件\n\n`;
    json.key_events.forEach((event, index) => {
      markdown += `${index + 1}. ${event}\n`;
    });
    markdown += `\n`;
  }

  // 处理角色弧线
  if (json.character_arcs && Array.isArray(json.character_arcs) && json.character_arcs.length > 0) {
    markdown += `## 角色弧线\n\n`;
    json.character_arcs.forEach((arc, index) => {
      markdown += `${index + 1}. ${arc}\n`;
    });
    markdown += `\n`;
  }

  // 处理角色发展
  if (json.character_development) {
    markdown += `## 角色发展\n\n${json.character_development}\n\n`;
  }

  // 处理章节数量
  if (json.chapter_count !== undefined) {
    markdown += `## 章节数量\n\n${json.chapter_count} 章\n\n`;
  }

  // 如果没有生成任何内容，返回原始 JSON 的字符串表示
  if (!markdown) {
    markdown = '```json\n' + JSON.stringify(json, null, 2) + '\n```';
  }

  return markdown;
};

/**
 * 解析大纲内容为结构化数据
 * @param {string} content - JSON格式的大纲内容
 * @returns {Object} 解析后的结构化数据
 */
export const parseOutlineToStructured = (content) => {
  if (!content) return null;

  try {
    const parsed = JSON.parse(content);
    
    // 处理 ai_generated_content - 它可能是 Markdown 或嵌套 JSON
    let aiContent = parsed.ai_generated_content;
    if (aiContent && typeof aiContent === 'string') {
      // 尝试解析是否为嵌套 JSON
      const nestedJson = safeJsonParse(aiContent);
      if (nestedJson) {
        // 如果是嵌套 JSON，转换为格式化的 Markdown
        aiContent = convertNestedJsonToMarkdown(nestedJson);
      }
    }

    return {
      type: 'structured',
      title: parsed.title,
      aiContent: aiContent
    };
  } catch (e) {
    // 不是JSON，作为纯文本返回
    return {
      type: 'markdown',
      content: content
    };
  }
};

/**
 * 大纲内容渲染组件
 * 支持大纲、卷纲、章纲的内容显示
 * 
 * @param {Object} props
 * @param {string} props.content - 内容字符串（大纲/卷纲的JSON或章纲的content字段）
 * @param {string} props.title - 标题（可选）
 * @param {Object} props.chapterData - 章纲完整数据对象（可选，用于显示章纲的所有字段）
 * @param {string} props.className - 额外的CSS类名
 */
const OutlineContentRenderer = ({ content, title, chapterData, className = '' }) => {
  // 如果有章纲数据，优先使用章纲数据
  if (chapterData && typeof chapterData === 'object') {
    const markdown = convertChapterToMarkdown(chapterData);
    
    return (
      <div className={`outline-content-renderer ${className}`}>
        <div className="outline-ai-card">
          <div className="outline-card-header ai-header">
            <span className="ai-icon">🤖</span>
            <h2 className="outline-card-title">{chapterData.title || title || '章纲详情'}</h2>
          </div>
          <div className="outline-card-body">
            <div className="ai-content-scrollable">
              <ReactMarkdown>{markdown}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 没有内容时显示空状态
  if (!content) {
    return <p className="empty-content">暂无内容</p>;
  }

  const data = parseOutlineToStructured(content);

  if (!data) {
    return <p className="empty-content">内容解析失败</p>;
  }

  // 获取要显示的内容
  let displayContent;
  if (data.type === 'markdown') {
    // 纯文本内容
    displayContent = data.content;
  } else {
    // 结构化内容，优先使用 ai_generated_content
    displayContent = data.aiContent || content;
  }

  // 如果内容是JSON字符串，尝试解析并转换为Markdown
  const nestedData = safeJsonParse(displayContent);
  if (nestedData) {
    displayContent = convertNestedJsonToMarkdown(nestedData);
  }

  // 使用传入的title或从数据中解析的title
  const displayTitle = title || data.title;

  return (
    <div className={`outline-content-renderer ${className}`}>
      <div className="outline-ai-card">
        {displayTitle && (
          <div className="outline-card-header ai-header">
            <span className="ai-icon">🤖</span>
            <h2 className="outline-card-title">{displayTitle}</h2>
          </div>
        )}
        <div className="outline-card-body">
          <div className="ai-content-scrollable">
            <ReactMarkdown>{displayContent}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutlineContentRenderer;

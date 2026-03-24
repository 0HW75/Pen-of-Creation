import { useState, useCallback, useRef } from 'react';
import { aiVersionAPI } from '../services/api';

export const useBlueprintChat = (projectId, selectedOutline) => {
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef(null);

  const extractModifiedContent = (content, type) => {
    console.log('=== 开始提取AI返回内容 ===');
    console.log('原始内容长度:', content.length);
    console.log('原始内容:', content);
    console.log('类型:', type);
    
    try {
      const cleanedContent = content
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();
      
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('JSON解析成功:', parsed);
        console.log('core_event字段:', parsed.core_event);
        console.log('scenes字段:', parsed.scenes);
        
        const validFields = ['title', 'content', 'core_event', 'core_conflict', 'scenes', 'characters', 
          'key_events', 'character_development', 'chapter_count', 'emotional_goal', 'keywords', 'word_count_estimate'];
        const hasValidFields = Object.keys(parsed).some(key => validFields.includes(key));
        
        if (hasValidFields) {
          console.log('JSON格式有效，直接返回解析结果');
          console.log('返回的core_event:', parsed.core_event);
          return parsed;
        } else {
          console.log('JSON解析成功但字段不完整，继续尝试其他方法');
        }
      }
    } catch (e) {
      console.log('JSON解析失败:', e.message);
    }
    
    console.log('使用备用提取方案');
    const result = {};
    
    let cleanContent = content
      .replace(/\*\*\*/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/---/g, '')
      .replace(/#+\s/g, '')
      .replace(/修改说明[：:][\s\S]*$/i, '')
      .replace(/预期效果[：:][\s\S]*$/i, '')
      .replace(/对修改需求的理解[：:][\s\S]*?\n\n/i, '')
      .replace(/具体的修改建议[：:][\s\S]*?\n\n/i, '')
      .trim();
    
    console.log('清理后的内容前1000字:', cleanContent.substring(0, 1000));
    
    const separator = '[：:\s]*[:：]?\s*';
    
    const titleMatch = cleanContent.match(new RegExp(`标题${separator}([^\n]+)`, 'i'));
    if (titleMatch) {
      result.title = titleMatch[1].trim();
      console.log('提取到标题:', result.title);
    }
    
    const contentPatterns = [
      new RegExp(`主要内容${separator}([\\s\\S]*?)(?=\\n\\n|场景${separator}|出场角色${separator}|情感目标${separator}|关键词${separator}|核心事件${separator}|核心冲突${separator}|标题${separator}|修改后的|$)`, 'i'),
      new RegExp(`修改后的[完整]?内容${separator}([\\s\\S]*?)(?=\\n\\n|修改说明|预期效果|【项目|$)`, 'i'),
    ];
    
    for (const pattern of contentPatterns) {
      const match = cleanContent.match(pattern);
      if (match && match[1].trim()) {
        result.content = match[1].trim();
        console.log('提取到主要内容:', result.content.substring(0, 100) + '...');
        break;
      }
    }
    
    if (type === 'volume') {
      const coreConflictMatch = cleanContent.match(new RegExp(`核心冲突${separator}([^\n]+)`, 'i'));
      if (coreConflictMatch) {
        result.core_conflict = coreConflictMatch[1].trim();
        console.log('提取到核心冲突:', result.core_conflict);
      }
      
      const keyEventsMatch = cleanContent.match(new RegExp(`关键事件${separator}([\\s\\S]*?)(?=\\n\\n|角色发展${separator}|章节数量${separator}|$)`, 'i'));
      if (keyEventsMatch) {
        const eventsText = keyEventsMatch[1].trim();
        result.key_events = eventsText.split('\n')
          .map(line => line.replace(/^[-\d.\s*]+/, '').trim())
          .filter(line => line.length > 0);
        console.log('提取到关键事件:', result.key_events);
      }
      
      const charDevMatch = cleanContent.match(new RegExp(`角色发展${separator}([^\n]+)`, 'i'));
      if (charDevMatch) {
        result.character_development = charDevMatch[1].trim();
        console.log('提取到角色发展:', result.character_development);
      }
      
      const chapterCountMatch = cleanContent.match(new RegExp(`章节数量${separator}(\d+)`, 'i'));
      if (chapterCountMatch) {
        result.chapter_count = parseInt(chapterCountMatch[1]);
        console.log('提取到章节数量:', result.chapter_count);
      }
    }
    
    if (type === 'chapter') {
      const coreEventMatch = cleanContent.match(new RegExp(`核心事件${separator}([^\n]+)`, 'i'));
      if (coreEventMatch) {
        result.core_event = coreEventMatch[1].trim();
        console.log('提取到核心事件:', result.core_event);
      }
      
      const scenesMatch = cleanContent.match(new RegExp(`场景${separator}([\\s\\S]*?)(?=\\n\\n|出场角色${separator}|$)`, 'i'));
      if (scenesMatch) {
        const scenesText = scenesMatch[1].trim();
        result.scenes = scenesText.split('\n')
          .map(line => line.replace(/^[-\d.\s*]+/, '').trim())
          .filter(line => line.length > 0);
        console.log('提取到场景:', result.scenes);
      }
      
      const charactersMatch = cleanContent.match(new RegExp(`出场角色${separator}([\\s\\S]*?)(?=\\n\\n|情感目标${separator}|$)`, 'i'));
      if (charactersMatch) {
        const charsText = charactersMatch[1].trim();
        result.characters = charsText.split('\n')
          .map(line => line.replace(/^[-\d.\s*]+/, '').trim())
          .filter(line => line.length > 0);
        console.log('提取到出场角色:', result.characters);
      }
      
      const emotionalMatch = cleanContent.match(new RegExp(`情感目标${separator}([^\n]+)`, 'i'));
      if (emotionalMatch) {
        result.emotional_goal = emotionalMatch[1].trim();
        console.log('提取到情感目标:', result.emotional_goal);
      }
      
      const keywordsMatch = cleanContent.match(new RegExp(`关键词${separator}([\\s\\S]*?)(?=\\n\\n|预估字数${separator}|$)`, 'i'));
      if (keywordsMatch) {
        const keywordsText = keywordsMatch[1].trim();
        result.keywords = keywordsText.split('\n')
          .map(line => line.replace(/^[-\d.\s*]+/, '').trim())
          .filter(line => line.length > 0);
        console.log('提取到关键词:', result.keywords);
      }
      
      const wordCountMatch = cleanContent.match(new RegExp(`预估字数${separator}(\d+)`, 'i'));
      if (wordCountMatch) {
        result.word_count_estimate = parseInt(wordCountMatch[1]);
        console.log('提取到预估字数:', result.word_count_estimate);
      }
    }
    
    console.log('=== 提取完成 ===');
    console.log('提取结果:', result);
    
    return result;
  };

  const handleSendMessage = useCallback(async ({ message, targetType, targetData, context, history, isBatchMode }) => {
    if (!message.trim() || !targetData) return;

    setIsLoading(true);

    try {
      let systemContent;
      let userContent;
      
      if (isBatchMode && Array.isArray(targetData)) {
        const firstItem = targetData[0];
        const itemType = firstItem?.type || 'chapter';
        
        let jsonFieldsDescription = '';
        if (itemType === 'outline') {
          jsonFieldsDescription = `{
  "title": "修改后的标题",
  "content": "修改后的主要内容"
}`;
        } else if (itemType === 'volume') {
          jsonFieldsDescription = `{
  "title": "修改后的标题",
  "core_conflict": "修改后的核心冲突",
  "content": "修改后的主要内容",
  "key_events": ["事件1", "事件2"],
  "character_development": "修改后的角色发展",
  "chapter_count": 10
}`;
        } else {
          jsonFieldsDescription = `{
  "title": "修改后的标题",
  "core_event": "修改后的核心事件",
  "content": "修改后的主要内容",
  "scenes": ["场景1", "场景2"],
  "characters": ["角色1", "角色2"],
  "emotional_goal": "修改后的情感目标",
  "keywords": ["关键词1", "关键词2"],
  "word_count_estimate": 3500
}`;
        }

        systemContent = `你是一位专业的小说大纲修改专家。用户选择了多个项目（大纲、卷纲或章纲），并提出批量修改需求。

你的任务是：
1. 分析用户提出的批量修改需求
2. 为每个选中的项目提供修改后的完整内容
3. 确保修改在各个项目之间保持一致性

重要规则：
1. 必须在回复中包含所有字段，即使某些字段没有修改也要列出原值
2. 必须返回标准的JSON格式，不要包含任何Markdown代码块标记（如 \`\`\`json）
3. 只返回纯JSON文本，格式如下：

${jsonFieldsDescription}

4. 数组字段使用标准的JSON数组格式
5. 不要添加任何JSON之外的说明文字

请用中文回复，保持专业、友好的语气。`;

        userContent = `请帮我批量修改以下 ${targetData.length} 个项目：

${context}

用户的批量修改需求：
${message}

请直接返回修改后的完整内容，使用标准JSON格式，包含所有字段。只返回JSON，不要添加任何说明文字。`;
      } else if (targetType === 'strategy') {
        systemContent = `你是一位专业的小说策略规划专家。用户需要生成一份全局修改策略文档。

你的任务是：
1. 分析用户的修改需求
2. 生成一份详细、可执行的全局策略
3. 确保策略涵盖所有需要修改的项目

重要规则：
1. 必须返回纯文本格式，不要返回JSON格式
2. 策略要具体、清晰、可执行
3. 包含具体的修改规则和示例

请用中文回复，保持专业、友好的语气。`;

        userContent = `${message}

请直接返回纯文本格式的策略文档，不要返回JSON格式。`;
      } else {
        const targetTypeText = targetType === 'outline' ? '大纲' :
                              targetType === 'volume' ? '卷纲' : '章纲';

        let jsonFieldsDescription = '';
        if (targetType === 'outline') {
          jsonFieldsDescription = `{
  "title": "修改后的标题",
  "content": "修改后的主要内容"
}`;
        } else if (targetType === 'volume') {
          jsonFieldsDescription = `{
  "title": "修改后的标题",
  "core_conflict": "修改后的核心冲突",
  "content": "修改后的主要内容",
  "key_events": ["事件1", "事件2"],
  "character_development": "修改后的角色发展",
  "chapter_count": 10
}`;
        } else if (targetType === 'chapter') {
          jsonFieldsDescription = `{
  "title": "修改后的标题",
  "core_event": "修改后的核心事件",
  "content": "修改后的主要内容",
  "scenes": ["场景1", "场景2"],
  "characters": ["角色1", "角色2"],
  "emotional_goal": "修改后的情感目标",
  "keywords": ["关键词1", "关键词2"],
  "word_count_estimate": 3500
}`;
        }

        systemContent = `你是一位专业的小说大纲修改专家。用户会选择大纲、卷纲或章纲，并提出修改需求。

你的任务是：
1. 分析用户提出的修改需求
2. 基于原有内容给出修改建议
3. 提供修改后的完整内容（必须包含所有字段，不能省略任何字段）
4. 说明修改的理由和预期效果

重要规则：
1. 必须在回复中包含所有字段，即使某些字段没有修改也要列出原值
2. 必须返回标准的JSON格式，不要包含任何Markdown代码块标记（如 \`\`\`json）
3. 只返回纯JSON文本，格式如下：

${jsonFieldsDescription}

4. 数组字段使用标准的JSON数组格式
5. 不要添加任何JSON之外的说明文字

请用中文回复，保持专业、友好的语气。`;

        userContent = `请帮我修改以下${targetTypeText}：

${context}

用户的修改需求：
${message}

请直接返回修改后的完整内容，使用标准JSON格式，包含所有字段。只返回JSON，不要添加任何说明文字。`;
      }

      const messages = [
        { role: 'system', content: systemContent },
        { role: 'user', content: userContent }
      ];

      abortControllerRef.current = new AbortController();
      
      const response = await fetch('http://localhost:5000/api/ai/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: messages,
          max_tokens: 4000,
          temperature: 0.7
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error('AI API调用失败');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data === '[DONE]') break;
            try {
              const eventData = JSON.parse(data);
              const content = eventData.content || '';
              if (content) {
                fullContent += content;
              }
            } catch (error) {
              console.error('解析流式数据失败:', error);
            }
          }
        }
      }

      return fullContent;
    } catch (error) {
      console.error('AI修改助手调用失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleApplyAIChanges = useCallback(async ({ type, data, modifiedContent, isBatchMode, setOutlines, setSelectedOutline, setVolumes, setSelectedVolume, setChapters, setSelectedChapter }) => {
    try {
      if (isBatchMode && Array.isArray(data)) {
        const results = [];
        const errors = [];
        
        let batchChanges = [];
        try {
          const jsonMatch = modifiedContent.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            batchChanges = JSON.parse(jsonMatch[0]);
          } else {
            const lines = modifiedContent.split('\n');
            let currentItem = null;
            
            for (const line of lines) {
              const match = line.match(/【项目\s*(\d+)】/);
              if (match) {
                if (currentItem) batchChanges.push(currentItem);
                currentItem = { index: parseInt(match[1]) - 1, content: '' };
              } else if (currentItem) {
                currentItem.content += line + '\n';
              }
            }
            if (currentItem) batchChanges.push(currentItem);
          }
        } catch (e) {
          console.log('解析批量修改内容失败:', e);
        }
        
        for (let i = 0; i < data.length; i++) {
          const item = data[i];
          const changeContent = batchChanges.find(c => c.index === i)?.content || 
                               batchChanges.find(c => c.id === item.data.id)?.content ||
                               modifiedContent;
          
          try {
            const success = await applySingleChange(item.type, item.data, changeContent, setOutlines, setSelectedOutline, setVolumes, setSelectedVolume, setChapters, setSelectedChapter);
            results.push(success);
            
            if (i < data.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 300));
            }
          } catch (error) {
            console.error(`保存项目 ${i + 1} 失败:`, error);
            errors.push({ index: i, error: error.message });
            results.push(false);
          }
        }
        
        if (errors.length > 0) {
          console.error('批量保存部分失败:', errors);
        }
        
        return { success: results.every(r => r), results, errors };
      }
      
      const success = await applySingleChange(type, data, modifiedContent, setOutlines, setSelectedOutline, setVolumes, setSelectedVolume, setChapters, setSelectedChapter);
      return { success, results: [success], errors: [] };
    } catch (error) {
      console.error('采纳AI修改失败:', error);
      throw error;
    }
  }, []);

  const applySingleChange = async (type, data, modifiedContent, setOutlines, setSelectedOutline, setVolumes, setSelectedVolume, setChapters, setSelectedChapter) => {
    console.log('=== 开始应用单个修改 ===');
    console.log('类型:', type);
    console.log('数据ID:', data.id);
    console.log('数据标题:', data.title);
    console.log('AI返回内容长度:', modifiedContent.length);
    console.log('AI返回内容前500字:', modifiedContent.substring(0, 500));
    
    let response;
    let updatedData;
    let extractedContent = extractModifiedContent(modifiedContent, type);
    console.log('提取后的内容:', extractedContent);
    
    const hasExtractedContent = Object.keys(extractedContent).length > 0;
    if (!hasExtractedContent) {
      console.error('警告：未能从AI回复中提取到任何字段！');
      extractedContent = { content: modifiedContent };
    }
    
    const mergeField = (newValue, oldValue, fieldName) => {
      if (newValue !== undefined && newValue !== null && newValue !== '' && 
          !(Array.isArray(newValue) && newValue.length === 0)) {
        console.log(`字段 ${fieldName}: 使用新值`, 
          typeof newValue === 'string' ? newValue.substring(0, 50) + '...' : newValue);
        return newValue;
      }
      console.log(`字段 ${fieldName}: 保持原值`, 
        typeof oldValue === 'string' ? oldValue.substring(0, 50) + '...' : oldValue);
      return oldValue;
    };

    switch (type) {
      case 'outline':
        updatedData = {
          ...data,
          title: mergeField(extractedContent.title, data.title, 'title'),
          content: mergeField(extractedContent.content, data.content, 'content')
        };
        console.log('更新大纲数据:', updatedData);
        response = await blueprintApi.updateOutline(data.id, updatedData);
        if (response.data) {
          setOutlines(prev => prev.map(o => o.id === data.id ? response.data : o));
          setSelectedOutline(response.data);
        }
        break;

      case 'volume':
        updatedData = {
          ...data,
          title: mergeField(extractedContent.title, data.title, 'title'),
          core_conflict: mergeField(extractedContent.core_conflict, data.core_conflict, 'core_conflict'),
          content: mergeField(extractedContent.content, data.content, 'content'),
          key_events: mergeField(extractedContent.key_events, data.key_events, 'key_events'),
          character_development: mergeField(extractedContent.character_development, data.character_development, 'character_development'),
          chapter_count: mergeField(extractedContent.chapter_count, data.chapter_count, 'chapter_count')
        };
        console.log('更新卷纲数据:', updatedData);
        response = await fetch(`http://localhost:5000/api/volumes/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData)
        });
        if (response.ok) {
          const result = await response.json();
          setVolumes(prev => prev.map(v => v.id === data.id ? result : v));
          setSelectedVolume(result);
        }
        break;

      case 'chapter':
        console.log('章纲 - extractedContent:', extractedContent);
        console.log('章纲 - extractedContent.core_event:', extractedContent?.core_event);
        console.log('章纲 - extractedContent.scenes:', extractedContent?.scenes);
        updatedData = {
          ...data,
          title: mergeField(extractedContent.title, data.title, 'title'),
          core_event: mergeField(extractedContent.core_event, data.core_event, 'core_event'),
          content: mergeField(extractedContent.content, data.content, 'content'),
          scenes: mergeField(extractedContent.scenes, data.scenes, 'scenes'),
          characters: mergeField(extractedContent.characters, data.characters, 'characters'),
          emotional_goal: mergeField(extractedContent.emotional_goal, data.emotional_goal, 'emotional_goal'),
          keywords: mergeField(extractedContent.keywords, data.keywords, 'keywords'),
          word_count_estimate: mergeField(extractedContent.word_count_estimate, data.word_count_estimate, 'word_count_estimate')
        };
        console.log('更新章纲数据:', updatedData);
        console.log('更新章纲 - core_event:', updatedData.core_event);
        console.log('发送给后端的数据:', JSON.stringify(updatedData, null, 2));
        response = await fetch(`http://localhost:5000/api/chapters/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData)
        });
        if (response.ok) {
          const result = await response.json();
          console.log('章纲更新成功，后端返回:', result);
          setChapters(prev => prev.map(c => c.id === data.id ? result : c));
          setSelectedChapter(result);
        } else {
          const errorText = await response.text();
          console.error('章纲更新失败:', response.status, errorText);
          throw new Error(`章纲更新失败: ${response.status}`);
        }
        break;

      default:
        throw new Error('未知的目标类型');
    }

    return true;
  };

  return {
    isLoading,
    setIsLoading,
    handleSendMessage,
    handleApplyAIChanges,
    extractModifiedContent,
  };
};
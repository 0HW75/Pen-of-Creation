// AI流式处理工具函数

export const handleAiStreamResponse = async (response, onChunk, onComplete) => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let partialResult = '';
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        onComplete(partialResult);
        break;
      }
      
      // 解析SSE数据
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.substring(6);
          if (data === '[DONE]') {
            onComplete(partialResult);
            break;
          }
          try {
            const chunkData = JSON.parse(data);
            if (chunkData.content) {
              partialResult += chunkData.content;
              onChunk(partialResult);
            }
          } catch (error) {
            console.error('解析流式响应失败:', error);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
};

// 构建AI消息
export const buildAiMessages = (systemContent, userContent) => {
  return [
    { role: 'system', content: systemContent },
    { role: 'user', content: userContent }
  ];
};

// 构建项目信息提示词
export const buildProjectPrompt = (projectInfo, additionalInfo = '') => {
  let prompt = `请为以下小说项目生成详细内容：\n\n`;
  prompt += `项目标题：${projectInfo?.title || '未知标题'}\n`;
  prompt += `小说类型：${projectInfo?.genre || '未知类型'}\n`;
  prompt += `核心主题：${projectInfo?.core_theme || '默认主题'}\n`;
  prompt += `一句话梗概：${projectInfo?.synopsis || ''}\n`;
  prompt += `创作风格：${projectInfo?.writing_style || ''}\n`;
  prompt += `参考作品：${projectInfo?.reference_works || ''}\n`;
  prompt += `目标读者：${projectInfo?.target_audience || '所有读者'}\n\n`;
  
  if (additionalInfo) {
    prompt += additionalInfo;
  }
  
  return prompt;
};

// 构建大纲分解提示词
export const buildOutlineDecomposePrompt = (outlineContent) => {
  let prompt = `请分析以下故事大纲，并将其分解为合理的卷纲结构：\n\n`;
  prompt += `# 故事大纲\n${outlineContent}\n\n`;
  prompt += `# 分解要求\n`;
  prompt += `1. 分析大纲内容，根据故事的起承转合和情节发展，将其分解为3-5个卷\n`;
  prompt += `2. 每个卷需要包含：\n`;
  prompt += `   - 卷号和标题\n`;
  prompt += `   - 核心冲突\n`;
  prompt += `   - 主要内容概述（3-5句话）\n`;
  prompt += `   - 关键事件（2-3个）\n`;
  prompt += `   - 角色发展\n`;
  prompt += `   - 章节数量：根据卷的内容复杂度，合理分配章节数量（建议每卷5-8章）\n`;
  prompt += `3. 确保卷与卷之间的过渡自然，情节连贯\n`;
  prompt += `4. 每个卷的内容长度要相对均衡\n`;
  prompt += `5. 输出格式要求：\n`;
  prompt += `   - 使用JSON格式输出\n`;
  prompt += `   - 包含一个"volumes"数组，每个元素代表一个卷\n`;
  prompt += `   - 每个卷对象包含：id、title、core_conflict、content、key_events、character_development、chapter_count、order_index\n`;
  prompt += `6. 请确保输出的JSON格式正确，不要包含任何额外的文字\n`;
  
  return prompt;
};

// 构建卷纲分解提示词
export const buildVolumeDecomposePrompt = (volumeContent, batchInfo, existingChapters = []) => {
  let prompt = `请分析以下卷纲，并将其分解为详细的章纲结构：\n\n`;
  prompt += `${volumeContent}\n\n`;
  
  if (existingChapters.length > 0) {
    prompt += `# 已生成章节\n`;
    prompt += `以下是已生成的章节信息，请确保新生成的章节与这些章节保持连贯：\n`;
    existingChapters.forEach(chapter => {
      prompt += `第${chapter.order_index}章: ${chapter.title}\n`;
      prompt += `核心事件: ${chapter.core_event}\n\n`;
    });
  }
  
  prompt += `# 分解要求\n`;
  prompt += `1. 分析卷纲内容，根据情节发展，生成第${batchInfo.startChapter}-${batchInfo.endChapter}章的章纲\n`;
  prompt += `2. 每个章需要包含：\n`;
  prompt += `   - 章号和标题\n`;
  prompt += `   - 核心事件\n`;
  prompt += `   - 情绪目标\n`;
  prompt += `   - 字数估计\n`;
  prompt += `   - 主要内容概述（2-3句话）\n`;
  prompt += `3. 确保章与章之间的过渡自然，情节连贯\n`;
  prompt += `4. 每个章的内容长度要相对均衡\n`;
  prompt += `5. 输出格式要求：\n`;
  prompt += `   - 使用JSON格式输出\n`;
  prompt += `   - 包含一个"chapters"数组，每个元素代表一个章\n`;
  prompt += `   - 每个章对象包含：id、title、core_event、emotional_goal、word_count_estimate、content、order_index\n`;
  prompt += `6. 请确保输出的JSON格式正确，不要包含任何额外的文字\n`;
  
  return prompt;
};
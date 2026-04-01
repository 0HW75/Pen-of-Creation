import { useState, useEffect, useCallback, useRef } from 'react';
import { blueprintApi, projectApi, aiVersionAPI, chapterApi } from '../services/api';
import { useBlueprintBasicState } from './useBlueprintBasicState';
import { useBlueprintAI } from './useBlueprintAI';
import { useBlueprintArchitects } from './useBlueprintArchitects';
import { useBlueprintOutlines } from './useBlueprintOutlines';
import { useBlueprintModals } from './useBlueprintModals';
import { useBlueprintChat } from './useBlueprintChat';

export const useBlueprintManagement = (projectId) => {
  const {
    activeView, setActiveView,
    outlines, setOutlines,
    volumes, setVolumes,
    chapters, setChapters,
    selectedOutline, setSelectedOutline,
    selectedVolume, setSelectedVolume,
    selectedChapter, setSelectedChapter,
    projectInfo, setProjectInfo,
    isLoading, setIsLoading,
    error, setError,
    isProjectIdValid,
    loadProjectInfo,
    loadProjectOutline,
    loadVolumes,
    loadChapters,
  } = useBlueprintBasicState(projectId);

  const {
    worldviewArchitects,
    setWorldviewArchitects,
    isArchitectManagerOpen,
    setIsArchitectManagerOpen,
    selectedArchitect,
    setSelectedArchitect,
    editingArchitect,
    setEditingArchitect,
    architectEditFormData,
    setArchitectEditFormData,
    worldviewStructurePrompt,
    setWorldviewStructurePrompt,
    isWorldviewStructureConfigOpen,
    setIsWorldviewStructureConfigOpen,
    loadWorldviewArchitects,
    handleOpenArchitectManager,
    handleCloseArchitectManager,
    handleSelectArchitect,
    handleEditArchitect,
    handleSaveEditArchitect,
    handleCancelEditArchitect,
    handleAddArchitect,
    handleDeleteArchitect,
    handleOpenWorldviewStructureConfig,
    handleSaveWorldviewStructureConfig,
    handleCloseWorldviewStructureConfig,
  } = useBlueprintArchitects();

  const {
    isOutlineEditModalOpen,
    setIsOutlineEditModalOpen,
    outlineEditFormData,
    setOutlineEditFormData,
    isVolumeEditModalOpen,
    setIsVolumeEditModalOpen,
    volumeEditFormData,
    setVolumeEditFormData,
    handleOutlineSelect,
    handleVolumeSelect,
    handleChapterSelect,
    handleDeleteOutline,
    handleDeleteVolume,
    handleDeleteChapter,
    handleOpenOutlineEditModal,
    handleSaveOutlineEdit,
    handleOpenVolumeEditModal,
    handleSaveVolumeEdit,
    handleCloseVolumeEditModal,
  } = useBlueprintOutlines(
    outlines, volumes, chapters,
    selectedOutline, selectedVolume, selectedChapter,
    setOutlines, setVolumes, setChapters,
    setSelectedOutline, setSelectedVolume, setSelectedChapter,
    setActiveView, loadProjectOutline
  );

  const {
    isEditModalOpen,
    setIsEditModalOpen,
    editFormData,
    setEditFormData,
    isAIChatOpen,
    setIsAIChatOpen,
    chatMessages,
    setChatMessages,
    chatInput,
    setChatInput,
    isSystemPromptOpen,
    setIsSystemPromptOpen,
    systemPrompt,
    setSystemPrompt,
    handleOpenEditModal,
    handleCloseEditModal,
    handleFormChange,
    handleOpenAIChat,
    handleCloseAIChat,
    handleOpenSystemPrompt,
    handleCloseSystemPrompt,
    handleSaveSystemPrompt,
  } = useBlueprintModals(projectInfo);

  const abortControllerRef = useRef(null);

  const callAIAPI = useCallback(async (messages, maxTokens, temperature, onProgress = null, responseFormat = null) => {
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    try {
      const bodyData = {
        messages: messages,
        max_tokens: maxTokens,
        temperature: temperature
      };
      
      if (responseFormat) {
        bodyData.response_format = responseFormat;
      }
      
      const response = await fetch('http://localhost:5000/api/ai/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData),
        signal: signal
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI API错误: ${errorText}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      
      while (true) {
        if (signal.aborted) {
          reader.cancel();
          throw new Error('生成已取消');
        }
        
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
                if (onProgress) {
                  onProgress(content);
                }
              }
            } catch (error) {
              console.error('解析流式数据失败:', error);
            }
          }
        }
      }
      
      return fullContent;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('生成已取消');
      }
      throw error;
    }
  }, []);

  const {
    isStreaming,
    setIsStreaming,
    streamingOutput,
    setStreamingOutput,
    safeJSONParse,
  } = useBlueprintAI(projectId, selectedOutline, selectedArchitect, worldviewStructurePrompt, callAIAPI);

  const {
    isLoading: chatLoading,
    setIsLoading: setChatLoading,
    handleSendMessage,
    handleApplyAIChanges,
  } = useBlueprintChat(projectId, selectedOutline);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      setIsStreaming(false);
      console.log('生成已停止');
    }
  }, [setIsLoading, setIsStreaming]);

  const generateOutline = useCallback(async (outlineConfig) => {
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingOutput('');
    try {
      if (!projectInfo) {
        await loadProjectInfo();
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 300000);
      
      let systemContent = '';
      
      if (selectedArchitect && selectedArchitect.prompt) {
        systemContent += selectedArchitect.prompt;
      }
      
      const configSystemPrompt = outlineConfig?.systemPrompt || systemPrompt;
      if (configSystemPrompt) {
        if (systemContent) systemContent += '\n\n';
        systemContent += '【通用规则】\n' + configSystemPrompt;
      }
      
      const configStructurePrompt = outlineConfig?.worldviewStructurePrompt || worldviewStructurePrompt;
      if (configStructurePrompt) {
        if (systemContent) systemContent += '\n\n';
        systemContent += '【结构要求】\n' + configStructurePrompt;
      }
      
      if (!systemContent) {
        systemContent = '你是一位专业的小说大纲生成专家，擅长创建详细、有深度的故事大纲。';
      }
      
      const defaultUserTemplate = `请为以下小说项目生成一个详细的故事大纲：\n\n项目标题：{{title}}\n小说类型：{{genre}}\n核心主题：{{core_theme}}\n一句话梗概：{{synopsis}}\n创作风格：{{writing_style}}\n参考作品：{{reference_works}}\n目标读者：{{target_audience}}\n\n请使用Markdown格式输出，确保结构清晰、内容完整。`;
      
      const userPromptTemplate = outlineConfig?.userPromptTemplate || defaultUserTemplate;
      
      let userPrompt = userPromptTemplate
        .replace(/\{\{worldview\}\}/g, projectInfo?.synopsis || '暂无世界观描述')
        .replace(/\{\{storySetting\}\}/g, projectInfo?.core_theme || '暂无故事设定')
        .replace(/\{\{title\}\}/g, projectInfo?.title || '未知标题')
        .replace(/\{\{genre\}\}/g, projectInfo?.genre || '未知类型')
        .replace(/\{\{core_theme\}\}/g, projectInfo?.core_theme || '默认主题')
        .replace(/\{\{synopsis\}\}/g, projectInfo?.synopsis || '')
        .replace(/\{\{writing_style\}\}/g, projectInfo?.writing_style || '')
        .replace(/\{\{reference_works\}\}/g, projectInfo?.reference_works || '')
        .replace(/\{\{target_audience\}\}/g, projectInfo?.target_audience || '所有读者');
      
      const messages = [
        { role: 'system', content: systemContent },
        { role: 'user', content: userPrompt }
      ];
      
      const response = await fetch('http://localhost:5000/api/ai/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: messages,
          max_tokens: 3000
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error('生成大纲失败');
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data === '[DONE]') {
              break;
            }
            try {
              const eventData = JSON.parse(data);
              const content = eventData.content || '';
              if (content) {
                fullContent += content;
                setStreamingOutput(fullContent);
                
                if (fullContent.length % 1000 === 0) {
                  clearTimeout(timeoutId);
                  setTimeout(() => {
                    controller.abort();
                  }, 300000);
                }
              }
            } catch (error) {
              console.error('解析流式数据失败:', error);
            }
          }
        }
      }
      
      if (fullContent) {
        try {
          const newOutline = {
            id: Date.now(),
            title: `${projectInfo?.title || '未知标题'} - 大纲`,
            content: JSON.stringify({
              ai_generated_content: fullContent,
              main_plot: '主线剧情',
              sub_plots: ['次要情节1', '次要情节2'],
              key_events: ['关键事件1', '关键事件2', '关键事件3', '关键事件4', '关键事件5'],
              character_arcs: ['角色弧线1'],
              theme: projectInfo?.core_theme || '默认主题',
              target_audience: projectInfo?.target_audience || '所有读者',
              genre: projectInfo?.genre || '未知类型'
            }),
            version: 1
          };
          
          const saveResponse = await fetch('http://localhost:5000/api/outlines', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              project_id: projectId,
              title: newOutline.title,
              content: newOutline.content,
              version: newOutline.version
            })
          });
            
          if (saveResponse.ok) {
            const savedOutline = await saveResponse.json();
            setOutlines(prev => [...prev, savedOutline]);
            setSelectedOutline(savedOutline);
            setVolumes([]);
            setSelectedVolume(null);
            setChapters([]);
            setSelectedChapter(null);
            setError(null);
            
            try {
              await aiVersionAPI.createVersion({
                project_id: projectId,
                entity_type: 'outline',
                entity_id: savedOutline.id,
                version_name: `AI生成-大纲-${savedOutline.title}`,
                content: savedOutline.content,
                prompt: messages,
                provider: 'ai',
                is_current: true
              });
            } catch (versionError) {
              console.error('保存大纲版本失败:', versionError);
            }
          } else {
            throw new Error('保存大纲失败');
          }
        } catch (error) {
          console.error('处理大纲失败:', error);
          setError('生成大纲失败: 保存失败');
        }
      }
    } catch (err) {
      setError('生成大纲失败');
      console.error('生成大纲失败:', err);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [projectId, projectInfo, systemPrompt, selectedArchitect, worldviewStructurePrompt, loadProjectInfo, setOutlines, setSelectedOutline, setVolumes, setSelectedVolume, setChapters, setSelectedChapter, setError, setIsLoading, setIsStreaming, setStreamingOutput]);

  const generateVolumeOutline = useCallback(async (outlineContent, config, onProgress = null) => {
    const systemContent = `你是一位专业的中文小说架构师。
【重要规则】
1. 必须使用中文输出所有内容
2. 必须输出合法的JSON格式
3. 不要输出任何解释性文字，只输出JSON`;
    
    const userPrompt = `请根据以下故事大纲，规划分卷结构：

# 故事大纲
${outlineContent}

# 输出要求
1. 必须使用中文输出所有内容
2. 必须输出合法的JSON格式，不要包含markdown代码块标记
3. 使用英文双引号

# JSON格式示例
{
  "volumes": [
    {"order_index": 1, "title": "第一卷标题", "brief": "一句话概述"},
    {"order_index": 2, "title": "第二卷标题", "brief": "一句话概述"}
  ]
}

# 内容要求
- 将故事分解为${config.minVolumes || 3}-${config.maxVolumes || 5}个卷
- 每个卷只包含：order_index（数字）、title（卷标题）、brief（一句话概述，30字以内）

请直接输出JSON，不要包含任何其他文字！`;

    const messages = [
      { role: 'system', content: systemContent },
      { role: 'user', content: userPrompt }
    ];
    
    const content = await callAIAPI(messages, 2000, 0.7, onProgress, { type: 'json_object' });
    const parsed = safeJSONParse(content);
    if (!parsed) throw new Error('无法解析卷纲规划');
    
    return parsed.volumes || [];
  }, [callAIAPI, safeJSONParse]);

  const generateDetailedVolume = useCallback(async (outlineContent, volumeOutline, previousVolumes, config, onProgress = null) => {
    let systemContent = config.systemPrompt || `你是一位专业的中文小说编辑，擅长在有限篇幅内精炼卷纲内容。
【重要规则】
1. 必须使用中文输出所有内容
2. 必须输出合法的JSON格式
3. 不要输出任何解释性文字，只输出JSON`;
    
    if (config.useArchitectPrompt !== false && selectedArchitect && selectedArchitect.prompt) {
      if (config.combinePrompts) {
        systemContent = selectedArchitect.prompt + '\n\n【通用规则】\n' + systemContent;
      } else {
        systemContent = selectedArchitect.prompt;
      }
    }
    
    let previousVolumesInfo = '';
    if (previousVolumes && previousVolumes.length > 0) {
      previousVolumesInfo = '\n\n# 前文卷纲\n' + previousVolumes.map((v, i) => 
        `第${i + 1}卷《${v.title}》：${(v.content || v.brief || '').substring(0, 100)}...`
      ).join('\n');
    }
    
    const defaultUserPrompt = `请根据以下信息，生成当前卷纲：

# 故事大纲
{{outlineContent}}

# 当前卷规划
卷号：第{{volumeIndex}}卷
标题：{{volumeTitle}}
概述：{{volumeBrief}}
{{previousVolumesInfo}}

# 输出要求
1. 必须使用中文输出所有内容
2. 必须输出合法的JSON格式，不要包含markdown代码块标记
3. 使用英文双引号，不要用中文引号
4. 字符串中的换行用\\n表示

# JSON格式示例
{
  "id": 1,
  "title": "卷标题",
  "core_conflict": "核心冲突描述（2-3句话）",
  "content": "主要内容概述（5-8句话）",
  "key_events": ["事件1描述", "事件2描述", "事件3描述"],
  "character_development": "角色发展描述（2-3句话）",
  "chapter_count": 6,
  "order_index": 1
}

# 内容要求
- 核心冲突：2-3句话概括
- 主要内容概述：5-8句话
- 关键事件：3-5个，每个用1-2句话描述
- 角色发展：2-3句话
- 章节数量：{{minChapters}}-{{maxChapters}}章

请直接输出JSON，不要包含任何其他文字！`;

    let userPrompt = config.userPromptTemplate || defaultUserPrompt;
    
    userPrompt = userPrompt
      .replace(/\{\{outlineContent\}\}/g, outlineContent)
      .replace(/\{\{volumeIndex\}\}/g, volumeOutline.order_index)
      .replace(/\{\{volumeTitle\}\}/g, volumeOutline.title)
      .replace(/\{\{volumeBrief\}\}/g, volumeOutline.brief || '')
      .replace(/\{\{previousVolumesInfo\}\}/g, previousVolumesInfo)
      .replace(/\{\{minVolumes\}\}/g, config.minVolumes || 3)
      .replace(/\{\{maxVolumes\}\}/g, config.maxVolumes || 5)
      .replace(/\{\{minChapters\}\}/g, config.minChapters || 5)
      .replace(/\{\{maxChapters\}\}/g, config.maxChapters || 8);

    const messages = [
      { role: 'system', content: systemContent },
      { role: 'user', content: userPrompt }
    ];
    
    const content = await callAIAPI(messages, config.maxTokens || 4000, config.temperature || 0.7, onProgress, { type: 'json_object' });
    const parsed = safeJSONParse(content);
    if (!parsed) throw new Error(`第${volumeOutline.order_index}卷细化失败：无法解析JSON`);
    
    return parsed;
  }, [callAIAPI, selectedArchitect, safeJSONParse]);

  const decomposeOutlineToVolumes = useCallback(async (volumeConfig = null) => {
    if (selectedOutline) {
      setIsLoading(true);
      setIsStreaming(true);
      setStreamingOutput('');
      
      try {
        let outlineContent = '';
        try {
          const parsedContent = JSON.parse(selectedOutline.content);
          if (parsedContent.ai_generated_content) {
            outlineContent = parsedContent.ai_generated_content;
          } else {
            outlineContent = JSON.stringify(parsedContent, null, 2);
          }
        } catch (error) {
          outlineContent = selectedOutline.content;
        }
        
        const defaultConfig = {
          minVolumes: 3,
          maxVolumes: 5,
          minChapters: 5,
          maxChapters: 8,
          maxTokens: 8000,
          temperature: 0.7,
          incrementalMode: true
        };
        const config = { ...defaultConfig, ...volumeConfig };
        const useIncrementalMode = config.incrementalMode !== false;
        
        let allVolumes = [];
        
        if (useIncrementalMode) {
          setStreamingOutput('【第一步】正在规划分卷结构...\n\n');
          
          const volumeOutlines = await generateVolumeOutline(
            outlineContent, 
            config, 
            (content) => {
              setStreamingOutput(prev => prev + content);
            }
          );
          console.log('卷纲规划:', volumeOutlines);
          
          setStreamingOutput(prev => prev + `✓ 规划完成，共${volumeOutlines.length}卷\n\n`);
          
          const detailedVolumes = [];
          for (let i = 0; i < volumeOutlines.length; i++) {
            const volOutline = volumeOutlines[i];
            setStreamingOutput(prev => prev + `【第二步-${i + 1}/${volumeOutlines.length}】正在生成第${volOutline.order_index}卷《${volOutline.title}》...\n\n`);
            
            try {
              const detailedVolume = await generateDetailedVolume(
                outlineContent,
                volOutline,
                detailedVolumes,
                config,
                (content) => {
                  setStreamingOutput(prev => prev + content);
                }
              );
              
              let chapterCount = detailedVolume.chapter_count;
              const minChapters = config.minChapters || 5;
              const maxChapters = config.maxChapters || 8;
              
              if (!chapterCount || chapterCount < minChapters || chapterCount > maxChapters) {
                console.warn(`第${volOutline.order_index}卷的章节数量(${chapterCount})不在配置范围(${minChapters}-${maxChapters})内，已自动修正为${minChapters}`);
                chapterCount = minChapters;
              }
              
              const volumeData = {
                id: detailedVolume.id || Date.now() + i,
                title: detailedVolume.title || volOutline.title,
                core_conflict: detailedVolume.core_conflict || '',
                content: detailedVolume.content || detailedVolume.brief || '',
                key_events: detailedVolume.key_events || [],
                character_development: detailedVolume.character_development || '',
                chapter_count: chapterCount,
                order_index: detailedVolume.order_index || volOutline.order_index || i + 1
              };
              
              detailedVolumes.push(volumeData);
              setStreamingOutput(prev => prev + `✓ 第${volumeData.order_index}卷《${volumeData.title}》生成完成\n\n`);
            } catch (error) {
              console.error(`第${volOutline.order_index}卷生成失败:`, error);
              setStreamingOutput(prev => prev + `✗ 第${volOutline.order_index}卷生成失败: ${error.message}\n\n`);
              detailedVolumes.push({
                id: Date.now() + i,
                title: volOutline.title,
                core_conflict: volOutline.brief || '',
                content: volOutline.brief || '',
                key_events: [],
                character_development: '',
                chapter_count: config.minChapters || 5,
                order_index: volOutline.order_index || i + 1
              });
            }
          }
          
          allVolumes = detailedVolumes;
          setStreamingOutput(prev => prev + '【完成】所有卷纲生成完毕！\n');
          
        } else {
          let systemContent = config.systemPrompt || `你是一位专业的小说编辑和大纲架构师，擅长将长篇故事大纲分解为合理的卷纲结构。`;
          
          if (config.useArchitectPrompt !== false && selectedArchitect && selectedArchitect.prompt) {
            if (config.combinePrompts) {
              systemContent = selectedArchitect.prompt + '\n\n【通用规则】\n' + systemContent;
            } else {
              systemContent = selectedArchitect.prompt;
            }
          }
          
          let userPrompt = config.userPromptTemplate || `请分析以下故事大纲，并将其分解为合理的卷纲结构：\n\n# 故事大纲\n{{outlineContent}}\n\n# 分解要求\n1. 分析大纲内容，根据故事的起承转合和情节发展，将其分解为{{minVolumes}}-{{maxVolumes}}个卷\n2. 每个卷需要包含：\n   - 卷号和标题\n   - 核心冲突\n   - 主要内容概述（3-5句话）\n   - 关键事件（2-3个）\n   - 角色发展\n   - 章节数量：根据卷的内容复杂度，合理分配章节数量（建议每卷{{minChapters}}-{{maxChapters}}章）\n3. 确保卷与卷之间的过渡自然，情节连贯\n4. 每个卷的内容长度要相对均衡\n5. 输出格式要求：\n   - 使用JSON格式输出\n   - 包含一个"volumes"数组，每个元素代表一个卷\n   - 每个卷对象包含：id、title、core_conflict、content、key_events、character_development、chapter_count、order_index\n6. 请确保输出的JSON格式正确，不要包含任何额外的文字`;
          
          userPrompt = userPrompt
            .replace(/\{\{outlineContent\}\}/g, outlineContent)
            .replace(/\{\{minVolumes\}\}/g, config.minVolumes || 3)
            .replace(/\{\{maxVolumes\}\}/g, config.maxVolumes || 5)
            .replace(/\{\{minChapters\}\}/g, config.minChapters || 5)
            .replace(/\{\{maxChapters\}\}/g, config.maxChapters || 8);
          
          const messages = [
            { role: 'system', content: systemContent },
            { role: 'user', content: userPrompt }
          ];
          
          const content = await callAIAPI(messages, config.maxTokens || 8000, config.temperature || 0.7, null, { type: 'json_object' });
          const parsedData = safeJSONParse(content);
          if (!parsedData) throw new Error('无法从AI输出中提取JSON');
          
          if (parsedData.volumes && Array.isArray(parsedData.volumes)) {
            const minChapters = config.minChapters || 5;
            const maxChapters = config.maxChapters || 8;
            
            allVolumes = parsedData.volumes.map((volume, index) => {
              let chapterCount = volume.chapter_count;
              if (!chapterCount || chapterCount < minChapters || chapterCount > maxChapters) {
                console.warn(`第${index + 1}卷的章节数量(${chapterCount})不在配置范围(${minChapters}-${maxChapters})内，已自动修正为${minChapters}`);
                chapterCount = minChapters;
              }
              
              return {
                id: volume.id || Date.now() + index,
                title: volume.title,
                core_conflict: volume.core_conflict,
                content: volume.content,
                key_events: volume.key_events,
                character_development: volume.character_development,
                chapter_count: chapterCount,
                order_index: volume.order_index || index + 1
              };
            });
          } else {
            throw new Error('AI输出格式错误，缺少volumes数组');
          }
        }
        
        setVolumes(allVolumes);
        setActiveView('volume');
        setError(null);
        
        let savedVolumes = [];
        try {
          for (const volume of allVolumes) {
            const saveResponse = await fetch('http://localhost:5000/api/outlines/' + selectedOutline.id + '/decompose', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(volume)
            });
            
            if (saveResponse.ok) {
              const savedVolume = await saveResponse.json();
              savedVolumes.push(savedVolume);
            } else {
              console.error('保存卷纲失败:', await saveResponse.text());
            }
          }
          console.log('卷纲保存成功');
          
          try {
            for (const savedVolume of savedVolumes) {
              await aiVersionAPI.createVersion({
                project_id: projectId,
                entity_type: 'volume',
                entity_id: savedVolume.id,
                version_name: `AI生成-卷纲-${savedVolume.title}`,
                content: JSON.stringify(savedVolume),
                prompt: messages,
                provider: 'ai',
                is_current: true
              });
            }
          } catch (versionError) {
            console.error('保存卷纲版本失败:', versionError);
          }
        } catch (error) {
          console.error('保存卷纲到后端失败:', error);
        }
        
      } catch (err) {
        setError(`分解卷纲失败: ${err.message}`);
        console.error('分解卷纲失败:', err);
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
      }
    }
  }, [selectedOutline, selectedArchitect, projectId, callAIAPI, generateVolumeOutline, generateDetailedVolume, setVolumes, setActiveView, setError, setIsLoading, setIsStreaming, setStreamingOutput]);

  const generateChapterOutline = useCallback(async (volumeContent, totalChapters, config, onProgress = null) => {
    const systemContent = `你是一位专业的小说章节规划师。请根据卷纲规划章节，只输出章节标题和一句话概述。`;
    
    const userPrompt = `请根据以下卷纲，规划章节结构：

# 卷纲内容
${volumeContent}

# 要求
1. 将卷纲分解为${totalChapters}个章节
2. 每个章节只包含：
   - 章节号
   - 章节标题
   - 一句话概述（30字以内）
3. 输出格式：JSON格式，包含chapters数组
4. 每个章节对象包含：order_index、title、brief

请直接输出合法的JSON，不要包含其他文字或markdown代码块标记！`;

    const messages = [
      { role: 'system', content: systemContent },
      { role: 'user', content: userPrompt }
    ];
    
    const content = await callAIAPI(messages, 2000, 0.7, onProgress, { type: 'json_object' });
    const parsed = safeJSONParse(content);
    if (!parsed) throw new Error('无法解析章纲规划');
    
    return parsed.chapters || [];
  }, [callAIAPI, safeJSONParse]);

  const generateDetailedChapter = useCallback(async (volumeContent, chapterOutline, previousChapters, config, onProgress = null) => {
    let systemContent = config.systemPrompt || `你是一位专业的小说章节规划师，擅长在有限篇幅内精炼章节内容。严格控制章纲内容长度，总字数不超过500字。`;
    
    if (config.useArchitectPrompt !== false && selectedArchitect && selectedArchitect.prompt) {
      if (config.combinePrompts) {
        systemContent = selectedArchitect.prompt + '\n\n【通用规则】\n' + systemContent;
      } else {
        systemContent = selectedArchitect.prompt;
      }
    }
    
    let previousChaptersInfo = '';
    if (previousChapters && previousChapters.length > 0) {
      previousChaptersInfo = '\n\n# 前文章节（按时间顺序排列，从远到近）\n';
      previousChaptersInfo += '【说明】\n';
      previousChaptersInfo += '- 往前倒推4章：显示概要\n';
      previousChaptersInfo += '- 往前倒推3章、2章、1章：显示详细信息\n\n';
      
      const sortedChapters = [...previousChapters].reverse();
      const totalPrevChapters = sortedChapters.length;
      
      sortedChapters.forEach((c, i) => {
        const distanceFromCurrent = totalPrevChapters - i;
        
        if (distanceFromCurrent === 4) {
          previousChaptersInfo += `\n## 【往前倒推4章】第${c.order_index}章《${c.title}》\n`;
          previousChaptersInfo += `**显示级别**：概要\n\n`;
          previousChaptersInfo += `${c.outline_content || c.brief || '暂无内容'}\n`;
        } else if (distanceFromCurrent >= 1 && distanceFromCurrent <= 3) {
          const levelNames = {1: '1章（最近）', 2: '2章', 3: '3章'};
          previousChaptersInfo += `\n## 【往前倒推${levelNames[distanceFromCurrent]}】第${c.order_index}章《${c.title}》\n`;
          previousChaptersInfo += `**显示级别**：详细信息\n\n`;
          previousChaptersInfo += `- 内容概要：${c.outline_content || c.brief || '无'}\n`;

          if (c.scenes && c.scenes.length > 0) {
            const scenesList = Array.isArray(c.scenes) ? c.scenes : (typeof c.scenes === 'string' ? JSON.parse(c.scenes) : []);
            previousChaptersInfo += `- 场景：${scenesList.join('、')}\n`;
          }
          
          if (c.characters && c.characters.length > 0) {
            const charsList = Array.isArray(c.characters) ? c.characters : (typeof c.characters === 'string' ? JSON.parse(c.characters) : []);
            previousChaptersInfo += `- 出场角色：${charsList.join('、')}\n`;
          }
          
          if (c.emotional_goal) {
            previousChaptersInfo += `- 情感目标：${c.emotional_goal}\n`;
          }
          
          if (c.keywords && c.keywords.length > 0) {
            const kwList = Array.isArray(c.keywords) ? c.keywords : (typeof c.keywords === 'string' ? JSON.parse(c.keywords) : []);
            previousChaptersInfo += `- 关键词：${kwList.join('、')}\n`;
          }
          
          previousChaptersInfo += `- 预估字数：${c.word_count_estimate || '无'}字\n`;
        }
      });
    }
    
    const defaultUserPrompt = `请根据以下信息，生成当前章纲：

# 卷纲内容
{{volumeContent}}

# 当前章节规划
章节号：第{{chapterIndex}}章
标题：{{chapterTitle}}
概述：{{chapterBrief}}
{{previousChaptersInfo}}

# 要求
1. 生成当前章节的详细内容，包括：
   - 核心事件（数组形式，2-3条，每条一句话）
   - 主要内容概述（简洁扼要，总字数不超过200字）
   - 出场人物（只列出重点人物：主角和主要配角，不要列出无名成员）
   - 场景设置（数组形式，每条一句话，不要太详细）
   - 情感目标（1句话描述本章要传达的情感）
   - 关键词（3-5个关键词）
   - 预估字数：{{minWords}}-{{maxWords}}字
2. 确保与卷纲和前文章节连贯
3. **重要格式要求**：
   - 必须输出合法的JSON格式
   - 使用英文双引号，不要用中文引号
   - 不要使用三引号
   - 字符串中的换行用\n表示
   - characters、scenes、keywords 是字符串数组
   - core_event 是字符串数组
   - **严格控制内容长度，总字数不超过500字，避免输出过长**
4. 输出字段：id、title、core_event（数组）、content、scenes（数组）、characters（数组）、emotional_goal、keywords（数组）、word_count_estimate、order_index

请直接输出合法的JSON，不要包含其他文字或markdown代码块标记！`;

    let userPrompt = config.userPromptTemplate || defaultUserPrompt;
    
    userPrompt = userPrompt
      .replace(/\{\{volumeContent\}\}/g, volumeContent)
      .replace(/\{\{chapterIndex\}\}/g, chapterOutline.order_index)
      .replace(/\{\{chapterTitle\}\}/g, chapterOutline.title)
      .replace(/\{\{chapterBrief\}\}/g, chapterOutline.brief || '')
      .replace(/\{\{previousChaptersInfo\}\}/g, previousChaptersInfo)
      .replace(/\{\{minChapters\}\}/g, config.minChapters || 5)
      .replace(/\{\{maxChapters\}\}/g, config.maxChapters || 10)
      .replace(/\{\{minWords\}\}/g, config.minWords || 2000)
      .replace(/\{\{maxWords\}\}/g, config.maxWords || 5000);

    const messages = [
      { role: 'system', content: systemContent },
      { role: 'user', content: userPrompt }
    ];
    
    const content = await callAIAPI(messages, config.maxTokens || 4000, config.temperature || 0.7, onProgress, { type: 'json_object' });
    const parsed = safeJSONParse(content);
    if (!parsed) throw new Error(`第${chapterOutline.order_index}章细化失败：无法解析JSON`);
    
    return parsed;
  }, [callAIAPI, selectedArchitect, safeJSONParse]);

  const decomposeVolumeToChapters = useCallback(async (chapterConfig = null) => {
    if (selectedVolume) {
      setIsLoading(true);
      setIsStreaming(true);
      setStreamingOutput('');
      
      try {
        let volumeContent = '';
        volumeContent += `# 卷纲信息\n`;
        volumeContent += `卷号: 第${selectedVolume.order_index}卷\n`;
        volumeContent += `标题: ${selectedVolume.title}\n`;
        volumeContent += `核心冲突: ${selectedVolume.core_conflict}\n`;
        if (selectedVolume.content) {
          volumeContent += `内容: ${selectedVolume.content}\n`;
        }
        if (selectedVolume.key_events) {
          volumeContent += `关键事件: ${selectedVolume.key_events.join(', ')}\n`;
        }
        if (selectedVolume.character_development) {
          volumeContent += `角色发展: ${selectedVolume.character_development}\n`;
        }
        
        const config = chapterConfig || {};
        const useIncrementalMode = config.incrementalMode !== false;
        const totalChapters = selectedVolume.chapter_count || config.minChapters || 6;
        
        let allChapters = [];
        
        // 获取项目中所有现有章节数量，用于计算全局 order_index
        let existingChapterCount = 0;
        try {
          const allChaptersRes = await chapterApi.getChapters(projectId);
          if (allChaptersRes.data && Array.isArray(allChaptersRes.data)) {
            existingChapterCount = allChaptersRes.data.length;
          }
        } catch (e) {
          console.warn('获取现有章节数失败，将从0开始:', e);
        }
        
        if (useIncrementalMode) {
          setStreamingOutput('【第一步】正在规划章节结构...\n\n');
          
          const chapterOutlines = await generateChapterOutline(
            volumeContent, 
            totalChapters, 
            config, 
            (content) => {
              setStreamingOutput(prev => prev + content);
            }
          );
          console.log('章纲规划:', chapterOutlines);
          
          setStreamingOutput(prev => prev + `✓ 规划完成，共${chapterOutlines.length}章\n\n`);
          
          const detailedChapters = [];
          for (let i = 0; i < chapterOutlines.length; i++) {
            const chOutline = chapterOutlines[i];
            setStreamingOutput(prev => prev + `【第二步-${i + 1}/${chapterOutlines.length}】正在生成第${chOutline.order_index}章《${chOutline.title}》...\n\n`);
            
            try {
              const detailedChapter = await generateDetailedChapter(
                volumeContent,
                chOutline,
                detailedChapters,
                config,
                (content) => {
                  setStreamingOutput(prev => prev + content);
                }
              );
              
              const chapterData = {
                id: detailedChapter.id || Date.now() + i,
                title: detailedChapter.title || chOutline.title,
                core_event: detailedChapter.core_event || '',
                content: detailedChapter.content || '',
                scenes: detailedChapter.scenes || [],
                characters: detailedChapter.characters || [],
                emotional_goal: detailedChapter.emotional_goal || '',
                keywords: detailedChapter.keywords || [],
                word_count_estimate: detailedChapter.word_count_estimate || config.minWords || 2000,
                order_index: existingChapterCount + i
              };
              
              detailedChapters.push(chapterData);
              setStreamingOutput(prev => prev + `✓ 第${chapterData.order_index + 1}章《${chapterData.title}》生成完成\n\n`);
            } catch (error) {
              console.error(`第${chOutline.order_index}章生成失败:`, error);
              setStreamingOutput(prev => prev + `✗ 第${chOutline.order_index}章生成失败: ${error.message}\n\n`);
              detailedChapters.push({
                id: Date.now() + i,
                title: chOutline.title,
                core_event: chOutline.brief || '',
                content: chOutline.brief || '',
                scenes: [],
                characters: [],
                emotional_goal: '',
                keywords: [],
                word_count_estimate: config.minWords || 2000,
                order_index: existingChapterCount + i
              });
            }
          }
          
          allChapters = detailedChapters;
          setStreamingOutput(prev => prev + '【完成】所有章纲生成完毕！\n');
          
        } else {
          let systemContent = config.systemPrompt || `你是一位专业的小说编辑和大纲架构师，擅长将卷纲分解为详细的章纲结构。`;
          
          if (config.useArchitectPrompt !== false && selectedArchitect && selectedArchitect.prompt) {
            if (config.combinePrompts) {
              systemContent = selectedArchitect.prompt + '\n\n【通用规则】\n' + systemContent;
            } else {
              systemContent = selectedArchitect.prompt;
            }
          }
          
          const batchSize = 8;
          let currentBatch = 1;
          
          if (chapters.length > 0) {
            allChapters = chapters;
            currentBatch = Math.ceil((chapters.length + 1) / batchSize);
          }
          
          const totalBatches = Math.ceil(totalChapters / batchSize);
          let messages = [];

          while (currentBatch <= totalBatches) {
            const existingChapters = allChapters.length;
            const startChapter = existingChapters + 1;
            const endChapter = Math.min(existingChapters + batchSize, totalChapters);
            
            if (startChapter > totalChapters) break;
            
            setStreamingOutput(prev => prev + `\n=== 正在生成第${startChapter}-${endChapter}章 ===\n`);
            
            let userPrompt = `请分析以下卷纲，并将其分解为详细的章纲结构：\n\n`;
            userPrompt += `${volumeContent}\n\n`;
            
            if (allChapters.length > 0) {
              userPrompt += `# 已生成章节\n`;
              allChapters.forEach(chapter => {
                userPrompt += `第${chapter.order_index}章: ${chapter.title}\n`;
                userPrompt += `核心事件: ${chapter.core_event}\n\n`;
              });
            }
            
            userPrompt += `# 分解要求\n`;
            userPrompt += `1. 分析卷纲内容，生成第${startChapter}-${endChapter}章的章纲\n`;
            userPrompt += `2. 每个章需要包含：id、title、core_event、content、scenes、characters、emotional_goal、keywords、word_count_estimate、order_index\n`;
            userPrompt += `3. 输出JSON格式，包含chapters数组\n`;
            userPrompt += `4. 使用英文双引号，不要用中文引号\n`;

            messages = [
              { role: 'system', content: systemContent },
              { role: 'user', content: userPrompt }
            ];
            
            const content = await callAIAPI(messages, config.maxTokens || 3000, config.temperature || 0.7, null, { type: 'json_object' });
            
            const parsedData = safeJSONParse(content);
            if (parsedData && parsedData.chapters && Array.isArray(parsedData.chapters)) {
              const batchChapters = parsedData.chapters.map((chapter, index) => ({
                id: chapter.id || Date.now() + (currentBatch - 1) * batchSize + index,
                title: chapter.title,
                core_event: chapter.core_event,
                outline_content: chapter.content,
                scenes: chapter.scenes || [],
                characters: chapter.characters || [],
                emotional_goal: chapter.emotional_goal || '',
                keywords: chapter.keywords || [],
                word_count_estimate: chapter.word_count_estimate || 2000,
                order_index: existingChapterCount + allChapters.length + index
              }));

              allChapters = [...allChapters, ...batchChapters];
            }
            
            currentBatch++;
          }
        }
        
        let savedChapters = [];
        if (allChapters.length > 0) {
          try {
            for (const chapter of allChapters) {
              const saveResponse = await fetch('http://localhost:5000/api/volumes/' + selectedVolume.id + '/decompose', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  title: chapter.title,
                  core_event: chapter.core_event,
                  outline_content: chapter.outline_content,
                  scenes: chapter.scenes,
                  characters: chapter.characters,
                  emotional_goal: chapter.emotional_goal,
                  keywords: chapter.keywords,
                  word_count_estimate: chapter.word_count_estimate,
                  order_index: chapter.order_index
                })
              });

              if (saveResponse.ok) {
                const savedChapter = await saveResponse.json();
                savedChapters.push(savedChapter);
              } else {
                console.error('保存章纲失败:', await saveResponse.text());
              }
            }
            console.log('章纲保存成功');

            try {
              for (const savedChapter of savedChapters) {
                await aiVersionAPI.createVersion({
                  project_id: projectId,
                  entity_type: 'chapter',
                  entity_id: savedChapter.id,
                  version_name: `AI生成-章纲-${savedChapter.title}`,
                  content: JSON.stringify(savedChapter),
                  prompt: messages,
                  provider: 'ai',
                  is_current: true
                });
              }
            } catch (versionError) {
              console.error('保存章纲版本失败:', versionError);
            }
          } catch (error) {
            console.error('保存章纲到后端失败:', error);
          }

          setChapters(allChapters);
          setActiveView('chapter');
          setError(null);
        }
      } catch (err) {
        setError(`分解章纲失败: ${err.message}`);
        console.error('分解章纲失败:', err);
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
      }
    }
  }, [selectedVolume, chapters, selectedArchitect, callAIAPI, generateChapterOutline, generateDetailedChapter, setChapters, setActiveView, setError, setIsLoading, setIsStreaming, setStreamingOutput]);

  const handleViewChange = useCallback((view) => {
    setActiveView(view);
    if (view === 'volume' && selectedOutline && volumes.length === 0) {
      loadVolumes();
    } else if (view === 'chapter' && selectedVolume && chapters.length === 0) {
      loadChapters();
    }
  }, [selectedOutline, selectedVolume, volumes.length, chapters.length, loadVolumes, loadChapters, setActiveView]);

  const handleSaveProjectInfo = useCallback(async () => {
    if (!projectId) return;
    
    try {
      await projectApi.updateProject(projectId, editFormData);
      await loadProjectInfo();
      setIsEditModalOpen(false);
      console.log('项目信息保存成功');
    } catch (error) {
      console.error('保存项目信息失败:', error);
    }
  }, [projectId, editFormData, loadProjectInfo, setIsEditModalOpen]);

  const handleCreateVersion = useCallback(async ({ type, data, description }) => {
    try {
      let content;
      switch (type) {
        case 'outline':
          content = JSON.stringify({
            title: data.title,
            content: data.content
          });
          break;
        case 'volume':
          content = JSON.stringify({
            title: data.title,
            order_index: data.order_index,
            core_conflict: data.core_conflict,
            content: data.content,
            key_events: data.key_events,
            character_development: data.character_development,
            chapter_count: data.chapter_count
          });
          break;
        case 'chapter':
          content = JSON.stringify({
            title: data.title,
            order_index: data.order_index,
            core_event: data.core_event,
            content: data.content,
            scenes: data.scenes,
            characters: data.characters,
            emotional_goal: data.emotional_goal,
            keywords: data.keywords,
            word_count_estimate: data.word_count_estimate
          });
          break;
        default:
          content = JSON.stringify(data);
      }

      const response = await fetch('http://localhost:5000/api/ai-versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          entity_type: type,
          entity_id: data.id,
          content: content,
          version_name: description || `${type === 'outline' ? '大纲' : type === 'volume' ? '卷纲' : '章纲'}修改前快照`,
          prompt: '',
          provider: '',
          is_current: false
        })
      });

      if (!response.ok) {
        throw new Error('创建版本失败');
      }

      const result = await response.json();
      console.log('版本快照创建成功:', result);
      return true;
    } catch (error) {
      console.error('创建版本快照失败:', error);
      throw error;
    }
  }, [projectId]);

  useEffect(() => {
    const savedPrompt = localStorage.getItem('outlineSystemPrompt');
    if (savedPrompt) {
      setSystemPrompt(savedPrompt);
    }
  }, []);

  return {
    activeView,
    outlines,
    volumes,
    chapters,
    selectedOutline,
    selectedVolume,
    selectedChapter,
    projectInfo,
    isEditModalOpen,
    editFormData,
    isAIChatOpen,
    chatMessages,
    chatInput,
    isSystemPromptOpen,
    systemPrompt,
    isLoading,
    error,
    isOutlineEditModalOpen,
    outlineEditFormData,
    isVolumeEditModalOpen,
    volumeEditFormData,
    worldviewArchitects,
    isArchitectManagerOpen,
    selectedArchitect,
    editingArchitect,
    architectEditFormData,
    worldviewStructurePrompt,
    isWorldviewStructureConfigOpen,
    streamingOutput,
    isStreaming,
    isProjectIdValid,
    setActiveView,
    setOutlines,
    setVolumes,
    setChapters,
    setSelectedOutline,
    setSelectedVolume,
    setSelectedChapter,
    setProjectInfo,
    setIsEditModalOpen,
    setEditFormData,
    setIsAIChatOpen,
    setChatMessages,
    setChatInput,
    setIsSystemPromptOpen,
    setSystemPrompt,
    setIsLoading,
    setError,
    setIsOutlineEditModalOpen,
    setOutlineEditFormData,
    setIsVolumeEditModalOpen,
    setVolumeEditFormData,
    setWorldviewArchitects,
    setIsArchitectManagerOpen,
    setSelectedArchitect,
    setEditingArchitect,
    setArchitectEditFormData,
    setWorldviewStructurePrompt,
    setIsWorldviewStructureConfigOpen,
    setStreamingOutput,
    setIsStreaming,
    loadProjectInfo,
    loadProjectOutline,
    loadVolumes,
    loadChapters,
    generateOutline,
    decomposeOutlineToVolumes,
    decomposeVolumeToChapters,
    handleViewChange,
    handleOutlineSelect,
    handleVolumeSelect,
    handleChapterSelect,
    handleDeleteOutline,
    handleDeleteVolume,
    handleDeleteChapter,
    handleOpenEditModal,
    handleCloseEditModal,
    handleFormChange,
    handleSaveProjectInfo,
    handleOpenAIChat,
    handleCloseAIChat,
    handleSendMessage,
    handleOpenSystemPrompt,
    handleCloseSystemPrompt,
    handleSaveSystemPrompt,
    handleOpenOutlineEditModal,
    handleSaveOutlineEdit,
    handleOpenVolumeEditModal,
    handleSaveVolumeEdit,
    handleCloseVolumeEditModal,
    loadWorldviewArchitects,
    handleOpenArchitectManager,
    handleCloseArchitectManager,
    handleSelectArchitect,
    handleEditArchitect,
    handleSaveEditArchitect,
    handleCancelEditArchitect,
    handleAddArchitect,
    handleDeleteArchitect,
    handleOpenWorldviewStructureConfig,
    handleSaveWorldviewStructureConfig,
    handleCloseWorldviewStructureConfig,
    handleApplyAIChanges,
    handleCreateVersion,
    stopGeneration
  };
};
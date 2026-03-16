import { useState, useEffect, useCallback, useRef } from 'react';
import { blueprintApi, projectApi, aiVersionAPI } from '../services/api';
import { 
  handleAiStreamResponse, 
  buildAiMessages, 
  buildProjectPrompt,
  buildOutlineDecomposePrompt,
  buildVolumeDecomposePrompt
} from '../utils/aiStreamHandler';

export const useBlueprintManagement = (projectId) => {
  const [activeView, setActiveView] = useState('outline'); // outline, volume, chapter
  const [outlines, setOutlines] = useState([]);
  const [volumes, setVolumes] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedOutline, setSelectedOutline] = useState(null);
  const [selectedVolume, setSelectedVolume] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [projectInfo, setProjectInfo] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isSystemPromptOpen, setIsSystemPromptOpen] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOutlineEditModalOpen, setIsOutlineEditModalOpen] = useState(false);
  const [outlineEditFormData, setOutlineEditFormData] = useState({});
  const [isVolumeEditModalOpen, setIsVolumeEditModalOpen] = useState(false);
  const [volumeEditFormData, setVolumeEditFormData] = useState({});

  const [worldviewArchitects, setWorldviewArchitects] = useState([]);
  const [isArchitectManagerOpen, setIsArchitectManagerOpen] = useState(false);
  const [selectedArchitect, setSelectedArchitect] = useState(null);
  const [editingArchitect, setEditingArchitect] = useState(null);
  const [architectEditFormData, setArchitectEditFormData] = useState({
    name: '',
    description: '',
    prompt: ''
  });
  const [worldviewStructurePrompt, setWorldviewStructurePrompt] = useState('');
  const [isWorldviewStructureConfigOpen, setIsWorldviewStructureConfigOpen] = useState(false);
  const [streamingOutput, setStreamingOutput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  
  // 跟踪之前的projectId，避免重复渲染
  const prevProjectIdRef = useRef(projectId);
  
  // 计算projectId是否有效
  const isProjectIdValid = projectId !== null && projectId !== undefined && projectId !== '';

  // 加载项目信息
  const loadProjectInfo = useCallback(async () => {
    if (!isProjectIdValid) return;
    
    try {
      const response = await projectApi.getProject(projectId);
      setProjectInfo(response.data);
    } catch (error) {
      console.error('加载项目信息失败:', error);
      // 检查是否是404错误
      if (error.response && error.response.status === 404) {
        // 项目不存在，通知父组件清除选中的项目ID
        window.dispatchEvent(new CustomEvent('selectProject', { detail: { projectId: null } }));
        // 导航到项目管理页面
        window.dispatchEvent(new CustomEvent('navigateTo', { detail: { key: 'project' } }));
      }
    }
  }, [projectId, isProjectIdValid]);

  // 加载项目大纲
  const loadProjectOutline = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await blueprintApi.getProjectOutline(projectId);
      setOutlines(response.data);
      if (response.data.length > 0) {
        setSelectedOutline(response.data[0]);
      }
      setError(null);
    } catch (err) {
      setError('加载大纲失败');
      console.error('加载大纲失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // 加载项目大纲和信息
  useEffect(() => {
    if (projectId !== null && projectId !== undefined && projectId !== '') {
      loadProjectOutline();
      loadProjectInfo();
    }
  }, [projectId, loadProjectOutline, loadProjectInfo]);

  // 加载卷纲
  const loadVolumes = useCallback(async () => {
    if (selectedOutline) {
      setIsLoading(true);
      try {
        const response = await blueprintApi.getOutlineVolumes(selectedOutline.id);
        setVolumes(response.data || []);
        setError(null);
      } catch (err) {
        setError('加载卷纲失败');
        console.error('加载卷纲失败:', err);
      } finally {
        setIsLoading(false);
      }
    }
  }, [selectedOutline]);

  // 加载章纲
  const loadChapters = useCallback(async () => {
    if (selectedVolume) {
      setIsLoading(true);
      try {
        const response = await blueprintApi.getVolumeChapters(selectedVolume.id);
        setChapters(response.data || []);
        setError(null);
      } catch (err) {
        setError('加载章纲失败');
        console.error('加载章纲失败:', err);
      } finally {
        setIsLoading(false);
      }
    }
  }, [selectedVolume]);

  // 当选中大纲变化时，加载卷纲
  useEffect(() => {
    if (selectedOutline) {
      loadVolumes();
    } else {
      setVolumes([]);
    }
  }, [selectedOutline, loadVolumes]);

  // 当选中卷纲变化时，加载章纲
  useEffect(() => {
    if (selectedVolume) {
      loadChapters();
    } else {
      setChapters([]);
    }
  }, [selectedVolume, loadChapters]);

  // 生成大纲
  const generateOutline = useCallback(async (outlineConfig) => {
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingOutput('');
    try {
      // 检查是否有项目信息
      if (!projectInfo) {
        await loadProjectInfo();
      }
      
      // 创建一个AbortController来处理超时
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 300000); // 5分钟超时
      
      // 构建AI消息 - 合并架构师prompt、系统提示词和结构提示词
      let systemContent = '';
      
      // 1. 架构师prompt（核心风格定义）
      if (selectedArchitect && selectedArchitect.prompt) {
        systemContent += selectedArchitect.prompt;
      }
      
      // 2. 系统提示词（通用规则）- 优先使用配置中的系统提示词
      const configSystemPrompt = outlineConfig?.systemPrompt || systemPrompt;
      if (configSystemPrompt) {
        if (systemContent) systemContent += '\n\n';
        systemContent += '【通用规则】\n' + configSystemPrompt;
      }
      
      // 3. 结构提示词（格式要求）- 优先使用配置中的结构提示词
      const configStructurePrompt = outlineConfig?.worldviewStructurePrompt || worldviewStructurePrompt;
      if (configStructurePrompt) {
        if (systemContent) systemContent += '\n\n';
        systemContent += '【结构要求】\n' + configStructurePrompt;
      }
      
      // 如果没有设置任何提示词，使用默认提示词
      if (!systemContent) {
        systemContent = '你是一位专业的小说大纲生成专家，擅长创建详细、有深度的故事大纲。';
      }
      
      // 构建用户提示 - 使用配置中的模板或默认模板
      const defaultUserTemplate = `请为以下小说项目生成一个详细的故事大纲：\n\n项目标题：{{title}}\n小说类型：{{genre}}\n核心主题：{{core_theme}}\n一句话梗概：{{synopsis}}\n创作风格：{{writing_style}}\n参考作品：{{reference_works}}\n目标读者：{{target_audience}}\n\n请使用Markdown格式输出，确保结构清晰、内容完整。`;
      
      const userPromptTemplate = outlineConfig?.userPromptTemplate || defaultUserTemplate;
      
      // 替换模板变量 - 使用项目实际存在的字段
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
      
      // 使用ReadableStream API处理流式响应
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
                
                // 动态调整超时时间，每接收1000个字符增加1分钟
                if (fullContent.length % 1000 === 0) {
                  clearTimeout(timeoutId);
                  setTimeout(() => {
                    controller.abort();
                  }, 300000); // 重置为5分钟
                }
              }
            } catch (error) {
              console.error('解析流式数据失败:', error);
            }
          }
        }
      }
      
      // 流式输出完成后，创建大纲对象并保存
      if (fullContent) {
        try {
          // 创建大纲对象
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
          
          // 保存大纲到后端
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
            // 清空之前的卷纲和章纲，避免旧数据残留
            setVolumes([]);
            setSelectedVolume(null);
            setChapters([]);
            setSelectedChapter(null);
            setError(null);
            
            // 保存AI生成版本
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
  }, [projectId, projectInfo, systemPrompt, selectedArchitect, worldviewStructurePrompt, loadProjectInfo]);

  // 健壮的JSON解析函数
  const safeJSONParse = (content, defaultValue = null) => {
    if (!content) return defaultValue;
    
    // 预处理：移除markdown代码块标记
    let cleaned = content.trim();
    cleaned = cleaned.replace(/^```json\s*/i, '');
    cleaned = cleaned.replace(/^```\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/i, '');
    cleaned = cleaned.trim();
    
    try {
      // 尝试直接解析
      return JSON.parse(cleaned);
    } catch (e) {
      console.error('JSON解析失败，尝试修复...', e.message);
      
      // 尝试提取JSON部分
      const jsonMatch = cleaned.match(/\{[\s\S]*/);
      if (jsonMatch) {
        let fixed = jsonMatch[0];
        
        // 1. 修复中文引号 -> 英文引号
        fixed = fixed.replace(/[""]/g, '"');
        fixed = fixed.replace(/['']/g, "'");
        
        // 2. 修复尾随逗号
        fixed = fixed.replace(/,\s*([}\]])/g, '$1');
        
        // 3. 移除控制字符并转义
        fixed = fixed.replace(/[\x00-\x1F\x7F]/g, (char) => {
          if (char === '\n') return '\\n';
          if (char === '\r') return '\\r';
          if (char === '\t') return '\\t';
          return '';
        });
        
        // 4. 尝试修复截断的JSON
        // 计算未闭合的括号数量
        let openBraces = 0;
        let openBrackets = 0;
        let inString = false;
        let escapeNext = false;
        
        for (let i = 0; i < fixed.length; i++) {
          const char = fixed[i];
          if (escapeNext) {
            escapeNext = false;
            continue;
          }
          if (char === '\\') {
            escapeNext = true;
            continue;
          }
          if (char === '"' && !escapeNext) {
            inString = !inString;
            continue;
          }
          if (!inString) {
            if (char === '{') openBraces++;
            else if (char === '}') openBraces--;
            else if (char === '[') openBrackets++;
            else if (char === ']') openBrackets--;
          }
        }
        
        // 如果字符串未闭合，添加闭合引号
        if (inString) {
          fixed += '"';
        }
        
        // 如果有未闭合的数组或对象，尝试闭合它们
        // 先移除最后一个不完整的值
        if (openBraces > 0 || openBrackets > 0) {
          // 找到最后一个完整的键值对
          const lastCompleteMatch = fixed.match(/.*[}\]"0-9]\s*(,|\s*$)/);
          if (lastCompleteMatch) {
            fixed = lastCompleteMatch[0].replace(/,\s*$/, '');
          }
          
          // 重新计算需要闭合的括号
          openBraces = 0;
          openBrackets = 0;
          inString = false;
          escapeNext = false;
          
          for (let i = 0; i < fixed.length; i++) {
            const char = fixed[i];
            if (escapeNext) {
              escapeNext = false;
              continue;
            }
            if (char === '\\') {
              escapeNext = true;
              continue;
            }
            if (char === '"' && !escapeNext) {
              inString = !inString;
              continue;
            }
            if (!inString) {
              if (char === '{') openBraces++;
              else if (char === '}') openBraces--;
              else if (char === '[') openBrackets++;
              else if (char === ']') openBrackets--;
            }
          }
          
          // 闭合未闭合的括号
          while (openBrackets > 0) {
            fixed += ']';
            openBrackets--;
          }
          while (openBraces > 0) {
            fixed += '}';
            openBraces--;
          }
        }
        
        console.log('尝试解析修复后的JSON...');
        
        try {
          return JSON.parse(fixed);
        } catch (e2) {
          console.error('JSON修复后仍无法解析:', e2.message);
          console.error('修复后的内容前500字符:', fixed.substring(0, 500));
          
          // 最后尝试：提取已有字段
          try {
            const result = {};
            // 提取id
            const idMatch = fixed.match(/"id"\s*:\s*(\d+)/);
            if (idMatch) result.id = parseInt(idMatch[1]);
            
            // 提取title
            const titleMatch = fixed.match(/"title"\s*:\s*"([^"]*)"/);
            if (titleMatch) result.title = titleMatch[1];
            
            // 提取core_conflict
            const conflictMatch = fixed.match(/"core_conflict"\s*:\s*"([^"]*)"/);
            if (conflictMatch) result.core_conflict = conflictMatch[1];
            
            // 提取content
            const contentMatch = fixed.match(/"content"\s*:\s*"([\s\S]*?)"(?:\s*[,}]|$)/);
            if (contentMatch) result.content = contentMatch[1].replace(/\\n/g, '\n');
            
            // 提取order_index
            const orderMatch = fixed.match(/"order_index"\s*:\s*(\d+)/);
            if (orderMatch) result.order_index = parseInt(orderMatch[1]);
            
            // 提取chapter_count
            const chapterMatch = fixed.match(/"chapter_count"\s*:\s*(\d+)/);
            if (chapterMatch) result.chapter_count = parseInt(chapterMatch[1]);
            
            // 提取key_events数组
            const eventsMatch = fixed.match(/"key_events"\s*:\s*\[([\s\S]*?)\]/);
            if (eventsMatch) {
              try {
                result.key_events = JSON.parse('[' + eventsMatch[1] + ']');
              } catch {
                result.key_events = [];
              }
            } else {
              result.key_events = [];
            }
            
            // 提取character_development
            const charDevMatch = fixed.match(/"character_development"\s*:\s*"([^"]*)"/);
            if (charDevMatch) result.character_development = charDevMatch[1];
            
            if (Object.keys(result).length > 0) {
              console.log('成功提取部分字段:', result);
              return result;
            }
          } catch (e3) {
            console.error('字段提取失败:', e3);
          }
        }
      }
    }
    return defaultValue;
  };

  // 用于取消AI请求的控制器
  const abortControllerRef = useRef(null);

  // 调用AI API的辅助函数
  const callAIAPI = useCallback(async (messages, maxTokens, temperature, onProgress = null) => {
    // 创建新的AbortController
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    try {
      const response = await fetch('http://localhost:5000/api/ai/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: messages,
          max_tokens: maxTokens,
          temperature: temperature
        }),
        signal: signal
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI API错误: ${errorText}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      
      // 处理流式响应
      while (true) {
        // 检查是否被取消
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
                } else {
                  setStreamingOutput(prev => prev + content);
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

  // 停止生成
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      setIsStreaming(false);
      console.log('生成已停止');
    }
  }, []);

  // 第一步：生成卷纲粗纲（分卷规划）
  const generateVolumeOutline = useCallback(async (outlineContent, config) => {
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
    
    const content = await callAIAPI(messages, 2000, 0.7);
    
    // 解析JSON
    const parsed = safeJSONParse(content);
    if (!parsed) throw new Error('无法解析卷纲规划');
    
    return parsed.volumes || [];
  }, [callAIAPI]);

  // 第二步：逐卷细化生成
  const generateDetailedVolume = useCallback(async (outlineContent, volumeOutline, previousVolumes, config) => {
    let systemContent = config.systemPrompt || `你是一位专业的中文小说编辑，擅长在有限篇幅内精炼卷纲内容。
【重要规则】
1. 必须使用中文输出所有内容
2. 必须输出合法的JSON格式
3. 不要输出任何解释性文字，只输出JSON`;
    
    // 根据配置决定是否使用架构师prompt
    if (config.useArchitectPrompt !== false && selectedArchitect && selectedArchitect.prompt) {
      if (config.combinePrompts) {
        systemContent = selectedArchitect.prompt + '\n\n【通用规则】\n' + systemContent;
      } else {
        systemContent = selectedArchitect.prompt;
      }
    }
    
    // 构建前文卷纲信息（精简版，只保留标题和核心内容前100字）
    let previousVolumesInfo = '';
    if (previousVolumes && previousVolumes.length > 0) {
      previousVolumesInfo = '\n\n# 前文卷纲\n' + previousVolumes.map((v, i) => 
        `第${i + 1}卷《${v.title}》：${(v.content || v.brief || '').substring(0, 100)}...`
      ).join('\n');
    }
    
    // 使用配置的用户提示词模板或默认模板
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
    
    // 替换模板变量
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
    
    const content = await callAIAPI(messages, config.maxTokens || 4000, config.temperature || 0.7);
    
    // 解析JSON
    const parsed = safeJSONParse(content);
    if (!parsed) throw new Error(`第${volumeOutline.order_index}卷细化失败：无法解析JSON`);
    
    return parsed;
  }, [callAIAPI, selectedArchitect]);

  // 分解大纲为卷纲（逐卷生成模式）
  const decomposeOutlineToVolumes = useCallback(async (volumeConfig = null) => {
    if (selectedOutline) {
      setIsLoading(true);
      setIsStreaming(true);
      setStreamingOutput('');
      
      try {
        // 解析大纲内容
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
        
        // 合并传入的配置和默认配置
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
        const useIncrementalMode = config.incrementalMode !== false; // 默认启用逐卷生成
        
        let allVolumes = [];
        
        if (useIncrementalMode) {
          // ===== 逐卷生成模式 =====
          setStreamingOutput('【第一步】正在规划分卷结构...\n\n');
          
          // 第一步：生成卷纲粗纲
          const volumeOutlines = await generateVolumeOutline(outlineContent, config);
          console.log('卷纲规划:', volumeOutlines);
          
          setStreamingOutput(prev => prev + `✓ 规划完成，共${volumeOutlines.length}卷\n\n`);
          
          // 第二步：逐卷细化
          const detailedVolumes = [];
          for (let i = 0; i < volumeOutlines.length; i++) {
            const volOutline = volumeOutlines[i];
            setStreamingOutput(prev => prev + `【第二步-${i + 1}/${volumeOutlines.length}】正在生成第${volOutline.order_index}卷《${volOutline.title}》...\n\n`);
            
            try {
              const detailedVolume = await generateDetailedVolume(
                outlineContent,
                volOutline,
                detailedVolumes,
                config
              );
              
              // 确保有必要的字段，并验证 chapter_count 在配置范围内
              let chapterCount = detailedVolume.chapter_count;
              const minChapters = config.minChapters || 5;
              const maxChapters = config.maxChapters || 8;
              
              // 验证 chapter_count 是否在配置范围内
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
              // 使用粗纲作为备选
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
          // ===== 传统模式（一次性生成） =====
          // 构建AI提示词
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
          
          const content = await callAIAPI(messages, config.maxTokens || 8000, config.temperature || 0.7);
          
          // 解析JSON
          const parsedData = safeJSONParse(content);
          if (!parsedData) throw new Error('无法从AI输出中提取JSON');
          
          if (parsedData.volumes && Array.isArray(parsedData.volumes)) {
            const minChapters = config.minChapters || 5;
            const maxChapters = config.maxChapters || 8;
            
            allVolumes = parsedData.volumes.map((volume, index) => {
              // 验证 chapter_count 是否在配置范围内
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
        
        // 保存卷纲数据
        setVolumes(allVolumes);
        setActiveView('volume');
        setError(null);
        
        // 将卷纲数据保存到后端
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
          
          // 保存AI生成版本（为每个卷纲创建版本）
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
  }, [selectedOutline, selectedArchitect, projectId, callAIAPI, generateVolumeOutline, generateDetailedVolume]);

  // 分解卷纲为章纲
  // 第一步：生成章纲粗纲（分章规划）
  const generateChapterOutline = useCallback(async (volumeContent, totalChapters, config) => {
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
    
    const content = await callAIAPI(messages, 2000, 0.7);
    
    // 解析JSON
    const parsed = safeJSONParse(content);
    if (!parsed) throw new Error('无法解析章纲规划');
    
    return parsed.chapters || [];
  }, [callAIAPI]);

  // 第二步：逐章细化生成
  const generateDetailedChapter = useCallback(async (volumeContent, chapterOutline, previousChapters, config) => {
    let systemContent = config.systemPrompt || `你是一位专业的小说章节规划师，擅长细化章节内容。`;
    
    // 根据配置决定是否使用架构师prompt
    if (config.useArchitectPrompt !== false && selectedArchitect && selectedArchitect.prompt) {
      if (config.combinePrompts) {
        systemContent = selectedArchitect.prompt + '\n\n【通用规则】\n' + systemContent;
      } else {
        systemContent = selectedArchitect.prompt;
      }
    }
    
    // 构建前文章节信息
    // 策略：往前倒推1-3章显示详细信息，往前倒推4章显示概要，更早的不显示
    // 注意：previousChapters数组是按生成顺序排列的，最后一个是最近生成的（往前倒推1章）
    let previousChaptersInfo = '';
    if (previousChapters && previousChapters.length > 0) {
      previousChaptersInfo = '\n\n# 前文章节（按时间顺序排列，从远到近）\n';
      previousChaptersInfo += '【说明】\n';
      previousChaptersInfo += '- 往前倒推4章：显示概要\n';
      previousChaptersInfo += '- 往前倒推3章、2章、1章：显示详细信息\n\n';
      
      // 反转数组，按时间顺序排列（从远到近）
      const sortedChapters = [...previousChapters].reverse();
      const totalPrevChapters = sortedChapters.length;
      
      sortedChapters.forEach((c, i) => {
        // i=0是最远的章节，i=totalPrevChapters-1是最近的章节（往前倒推1章）
        const distanceFromCurrent = totalPrevChapters - i; // 往前倒推N章
        
        if (distanceFromCurrent === 4) {
          // 往前倒推4章：显示概要
          previousChaptersInfo += `\n## 【往前倒推4章】第${c.order_index}章《${c.title}》\n`;
          previousChaptersInfo += `**显示级别**：概要\n\n`;
          previousChaptersInfo += `${c.content || c.brief || '暂无内容'}\n`;
        } else if (distanceFromCurrent >= 1 && distanceFromCurrent <= 3) {
          // 往前倒推1-3章：显示详细信息
          const levelNames = {1: '1章（最近）', 2: '2章', 3: '3章'};
          previousChaptersInfo += `\n## 【往前倒推${levelNames[distanceFromCurrent]}】第${c.order_index}章《${c.title}》\n`;
          previousChaptersInfo += `**显示级别**：详细信息\n\n`;
          previousChaptersInfo += `- 核心事件：${c.core_event || '无'}\n`;
          previousChaptersInfo += `- 内容概要：${c.content || c.brief || '无'}\n`;
          
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
        // 往前倒推5章及更早的章节不显示
      });
    }
    
    // 使用配置的用户提示词模板或默认模板
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
   - 核心事件（2-3句话概括，不超过100字）
   - 主要内容概述（5-8句话，每句话不超过50字，总字数不超过400字）
   - 出场人物（主要角色列表，每个角色名称不超过20字）
   - 场景设置（主要场景描述，不超过100字）
   - 情感目标（1-2句话描述本章要传达的情感）
   - 关键词（3-5个关键词）
   - 预估字数：{{minWords}}-{{maxWords}}字
2. 确保与卷纲和前文章节连贯
3. **重要格式要求**：
   - 必须输出合法的JSON格式
   - 使用英文双引号，不要用中文引号
   - 不要使用三引号
   - 字符串中的换行用\\n表示
   - characters、scenes、keywords 是字符串数组
   - **严格控制内容长度，避免输出过长导致JSON截断**
4. 输出字段：id、title、core_event、content、scenes（数组）、characters（数组）、emotional_goal、keywords（数组）、word_count_estimate、order_index

请直接输出合法的JSON，不要包含其他文字或markdown代码块标记！`;

    let userPrompt = config.userPromptTemplate || defaultUserPrompt;
    
    // 替换模板变量
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
    
    const content = await callAIAPI(messages, config.maxTokens || 4000, config.temperature || 0.7);
    
    // 解析JSON
    const parsed = safeJSONParse(content);
    if (!parsed) throw new Error(`第${chapterOutline.order_index}章细化失败：无法解析JSON`);
    
    return parsed;
  }, [callAIAPI, selectedArchitect]);

  const decomposeVolumeToChapters = useCallback(async (chapterConfig = null) => {
    if (selectedVolume) {
      setIsLoading(true);
      setIsStreaming(true);
      setStreamingOutput('');
      
      try {
        // 构建卷纲内容
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
        
        if (useIncrementalMode) {
          // ===== 逐章生成模式 =====
          setStreamingOutput('【第一步】正在规划章节结构...\n\n');
          
          // 第一步：生成章纲粗纲
          const chapterOutlines = await generateChapterOutline(volumeContent, totalChapters, config);
          console.log('章纲规划:', chapterOutlines);
          
          setStreamingOutput(prev => prev + `✓ 规划完成，共${chapterOutlines.length}章\n\n`);
          
          // 第二步：逐章细化
          const detailedChapters = [];
          for (let i = 0; i < chapterOutlines.length; i++) {
            const chOutline = chapterOutlines[i];
            setStreamingOutput(prev => prev + `【第二步-${i + 1}/${chapterOutlines.length}】正在生成第${chOutline.order_index}章《${chOutline.title}》...\n\n`);
            
            try {
              const detailedChapter = await generateDetailedChapter(
                volumeContent,
                chOutline,
                detailedChapters,
                config
              );
              
              // 确保有必要的字段
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
                order_index: detailedChapter.order_index || chOutline.order_index || i + 1
              };
              
              detailedChapters.push(chapterData);
              setStreamingOutput(prev => prev + `✓ 第${chapterData.order_index}章《${chapterData.title}》生成完成\n\n`);
            } catch (error) {
              console.error(`第${chOutline.order_index}章生成失败:`, error);
              setStreamingOutput(prev => prev + `✗ 第${chOutline.order_index}章生成失败: ${error.message}\n\n`);
              // 使用粗纲作为备选
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
                order_index: chOutline.order_index || i + 1
              });
            }
          }
          
          allChapters = detailedChapters;
          setStreamingOutput(prev => prev + '【完成】所有章纲生成完毕！\n');
          
        } else {
          // ===== 传统批量生成模式 =====
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
            
            const messages = [
              { role: 'system', content: systemContent },
              { role: 'user', content: userPrompt }
            ];
            
            const content = await callAIAPI(messages, config.maxTokens || 3000, config.temperature || 0.7);
            
            const parsedData = safeJSONParse(content);
            if (parsedData && parsedData.chapters && Array.isArray(parsedData.chapters)) {
              const batchChapters = parsedData.chapters.map((chapter, index) => ({
                id: chapter.id || Date.now() + (currentBatch - 1) * batchSize + index,
                title: chapter.title,
                core_event: chapter.core_event,
                content: chapter.content,
                scenes: chapter.scenes || [],
                characters: chapter.characters || [],
                emotional_goal: chapter.emotional_goal || '',
                keywords: chapter.keywords || [],
                word_count_estimate: chapter.word_count_estimate || 2000,
                order_index: chapter.order_index || startChapter + index
              }));

              allChapters = [...allChapters, ...batchChapters];
            }
            
            currentBatch++;
          }
        }
        
        // 保存章纲数据到后端
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
                  content: chapter.content,
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

            // 保存AI生成版本（为每个章纲创建版本）
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
  }, [selectedVolume, chapters, selectedArchitect, callAIAPI, generateChapterOutline, generateDetailedChapter]);

  // 切换视图
  const handleViewChange = useCallback((view) => {
    setActiveView(view);
    // 不要在切换视图时重新加载数据，保留当前的数据状态
    // 只有当没有数据时才加载
    if (view === 'volume' && selectedOutline && volumes.length === 0) {
      loadVolumes();
    } else if (view === 'chapter' && selectedVolume && chapters.length === 0) {
      loadChapters();
    }
  }, [selectedOutline, selectedVolume, volumes.length, chapters.length, loadVolumes, loadChapters]);

  // 选择大纲
  const handleOutlineSelect = useCallback((outline) => {
    setSelectedOutline(outline);
    setSelectedVolume(null);
    setSelectedChapter(null);
    setVolumes([]);
    setChapters([]);
    setActiveView('outline');
    setError(null);  // 清除之前的错误
  }, []);

  // 选择卷纲
  const handleVolumeSelect = useCallback((volume) => {
    setSelectedVolume(volume);
    setSelectedChapter(null);
    setChapters([]);
    setActiveView('volume');
    setError(null);  // 清除之前的错误
  }, []);

  // 选择章纲
  const handleChapterSelect = useCallback((chapter) => {
    setSelectedChapter(chapter);
    setActiveView('chapter');
    setError(null);  // 清除之前的错误
  }, []);

  // 删除大纲的异步函数
  const handleDeleteOutline = useCallback(async (outlineId) => {
    try {
      await blueprintApi.deleteOutline(outlineId);
      // 重新加载大纲列表
      loadProjectOutline();
      // 清除选中的大纲及相关数据
      if (selectedOutline && selectedOutline.id === outlineId) {
        setSelectedOutline(null);
        setVolumes([]);
        setSelectedVolume(null);
        setChapters([]);
        setSelectedChapter(null);
      }
      console.log('大纲删除成功');
    } catch (error) {
      console.error('删除大纲失败:', error);
    }
  }, [selectedOutline, loadProjectOutline]);

  // 删除卷纲
  const handleDeleteVolume = useCallback(async (volumeId) => {
    try {
      await blueprintApi.deleteVolume(volumeId);
      // 重新加载卷纲列表
      if (selectedOutline) {
        const response = await blueprintApi.getOutlineVolumes(selectedOutline.id);
        setVolumes(response.data || []);
      }
      // 清除选中的卷纲及相关数据
      if (selectedVolume && selectedVolume.id === volumeId) {
        setSelectedVolume(null);
        setChapters([]);
        setSelectedChapter(null);
      }
      console.log('卷纲删除成功');
    } catch (error) {
      console.error('删除卷纲失败:', error);
    }
  }, [selectedOutline, selectedVolume]);

  // 删除章纲
  const handleDeleteChapter = useCallback(async (chapterId) => {
    try {
      await blueprintApi.deleteChapter(chapterId);
      // 重新加载章纲列表
      if (selectedVolume) {
        const response = await blueprintApi.getVolumeChapters(selectedVolume.id);
        setChapters(response.data || []);
      }
      // 清除选中的章纲
      if (selectedChapter && selectedChapter.id === chapterId) {
        setSelectedChapter(null);
      }
      console.log('章纲删除成功');
    } catch (error) {
      console.error('删除章纲失败:', error);
    }
  }, [selectedVolume, selectedChapter]);

  // 打开编辑项目信息模态框
  const handleOpenEditModal = useCallback(() => {
    if (projectInfo) {
      setEditFormData({ ...projectInfo });
      setIsEditModalOpen(true);
    }
  }, [projectInfo]);

  // 关闭编辑项目信息模态框
  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
  }, []);

  // 处理表单输入变化
  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // 保存项目信息
  const handleSaveProjectInfo = useCallback(async () => {
    if (!projectId) return;
    
    try {
      await projectApi.updateProject(projectId, editFormData);
      // 重新加载项目信息
      await loadProjectInfo();
      setIsEditModalOpen(false);
      console.log('项目信息保存成功');
    } catch (error) {
      console.error('保存项目信息失败:', error);
    }
  }, [projectId, editFormData, loadProjectInfo]);

  // 打开AI对话窗口
  const handleOpenAIChat = useCallback(() => {
    if (!selectedOutline) {
      console.log('请先选择一个大纲');
      return;
    }
    // 初始化对话消息
    setChatMessages([
      {
        role: 'assistant',
        content: `您好！我是您的大纲修改助手。我可以帮助您修改当前大纲《${selectedOutline.title}》。请告诉我您希望如何修改大纲，例如：更改主线剧情、添加新的次要情节、调整关键事件顺序等。`
      }
    ]);
    setIsAIChatOpen(true);
  }, [selectedOutline]);

  // 关闭AI对话窗口
  const handleCloseAIChat = useCallback(() => {
    setIsAIChatOpen(false);
  }, []);

  // 发送消息 - AI修改助手
  const handleSendMessage = useCallback(async ({ message, targetType, targetData, context, history, isBatchMode }) => {
    if (!message.trim() || !targetData) return;

    setIsLoading(true);

    try {
      // 构建系统提示词
      let systemContent;
      let userContent;
      
      if (isBatchMode && Array.isArray(targetData)) {
        // 批量模式 - 也使用JSON格式
        const firstItem = targetData[0];
        const itemType = firstItem?.type || 'chapter';
        
        // 根据类型构建JSON字段说明
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
        // 策略模式 - 返回文本格式，不要JSON
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
        // 单条模式
        const targetTypeText = targetType === 'outline' ? '大纲' :
                              targetType === 'volume' ? '卷纲' : '章纲';

        // 根据类型构建JSON字段说明
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

      // 构建消息数组
      const messages = [
        { role: 'system', content: systemContent },
        { role: 'user', content: userContent }
      ];

      // 调用AI API
      const response = await fetch('http://localhost:5000/api/ai/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: messages,
          max_tokens: 4000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error('AI API调用失败');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      // 处理流式响应
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

  // 采纳AI修改建议并保存
  const handleApplyAIChanges = useCallback(async ({ type, data, modifiedContent, isBatchMode }) => {
    try {
      // 批量模式
      if (isBatchMode && Array.isArray(data)) {
        const results = [];
        const errors = [];
        
        // 解析AI返回的批量修改内容
        let batchChanges = [];
        try {
          // 尝试解析JSON数组格式
          const jsonMatch = modifiedContent.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            batchChanges = JSON.parse(jsonMatch[0]);
          } else {
            // 如果不是JSON数组，尝试按项目分割
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
        
        // 逐个应用修改
        for (let i = 0; i < data.length; i++) {
          const item = data[i];
          // 查找对应的修改内容
          const changeContent = batchChanges.find(c => c.index === i)?.content || 
                               batchChanges.find(c => c.id === item.data.id)?.content ||
                               modifiedContent;
          
          try {
            const success = await applySingleChange(item.type, item.data, changeContent);
            results.push(success);
            
            // 添加延迟，避免请求过快
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
      
      // 单条模式
      const success = await applySingleChange(type, data, modifiedContent);
      return { success, results: [success], errors: [] };
    } catch (error) {
      console.error('采纳AI修改失败:', error);
      throw error;
    }
  }, []);

  // 应用单个修改
  const applySingleChange = async (type, data, modifiedContent) => {
    console.log('=== 开始应用单个修改 ===');
    console.log('类型:', type);
    console.log('数据ID:', data.id);
    console.log('数据标题:', data.title);
    console.log('AI返回内容长度:', modifiedContent.length);
    console.log('AI返回内容前500字:', modifiedContent.substring(0, 500));
    
    let response;
    let updatedData;

    // 从AI回复中提取修改后的内容
    let extractedContent = extractModifiedContent(modifiedContent, type);
    console.log('提取后的内容:', extractedContent);
    
    // 检查是否提取到任何内容
    const hasExtractedContent = Object.keys(extractedContent).length > 0;
    if (!hasExtractedContent) {
      console.error('警告：未能从AI回复中提取到任何字段！');
      // 尝试直接使用AI返回的内容作为content字段
      extractedContent = { content: modifiedContent };
    }
    
    // 智能合并策略：只更新提取到的字段，未提取的保持原值
    const mergeField = (newValue, oldValue, fieldName) => {
      // 如果新值存在且不为空，使用新值
      if (newValue !== undefined && newValue !== null && newValue !== '' && 
          !(Array.isArray(newValue) && newValue.length === 0)) {
        console.log(`字段 ${fieldName}: 使用新值`, 
          typeof newValue === 'string' ? newValue.substring(0, 50) + '...' : newValue);
        return newValue;
      }
      // 否则保持原值
      console.log(`字段 ${fieldName}: 保持原值`, 
        typeof oldValue === 'string' ? oldValue.substring(0, 50) + '...' : oldValue);
      return oldValue;
    };

    switch (type) {
      case 'outline':
        // 更新大纲
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
        // 更新卷纲
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
        // 更新章纲
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

  // 从AI回复中提取修改后的内容
  const extractModifiedContent = (content, type) => {
    console.log('=== 开始提取AI返回内容 ===');
    console.log('原始内容长度:', content.length);
    console.log('原始内容:', content);
    console.log('类型:', type);
    
    // 首先尝试提取JSON格式（优先）
    try {
      // 去除可能的Markdown代码块标记
      const cleanedContent = content
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();
      
      // 尝试找到JSON对象
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('JSON解析成功:', parsed);
        console.log('core_event字段:', parsed.core_event);
        console.log('scenes字段:', parsed.scenes);
        
        // 验证解析结果是否包含必要字段
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
    
    // JSON解析失败，使用备用方案
    console.log('使用备用提取方案');
    const result = {};
    
    // 清理AI返回的内容（去除星号、说明文字等）
    let cleanContent = content
      .replace(/\*\*\*/g, '')  // 去除 ***
      .replace(/\*\*/g, '')    // 去除 **
      .replace(/\*/g, '')      // 去除 *
      .replace(/---/g, '')     // 去除 ---
      .replace(/#+\s/g, '')    // 去除 Markdown 标题
      .replace(/修改说明[：:][\s\S]*$/i, '')  // 去除修改说明及之后的内容
      .replace(/预期效果[：:][\s\S]*$/i, '')  // 去除预期效果及之后的内容
      .replace(/对修改需求的理解[：:][\s\S]*?\n\n/i, '')  // 去除需求理解部分
      .replace(/具体的修改建议[：:][\s\S]*?\n\n/i, '')  // 去除修改建议部分
      .trim();
    
    console.log('清理后的内容前1000字:', cleanContent.substring(0, 1000));
    
    // 提取各个字段 - 使用更灵活的分隔符匹配
    // 分隔符可以是：中文冒号、英文冒号、空格+冒号、或者直接换行
    const separator = '[：:\s]*[:：]?\s*';
    
    // 1. 提取标题
    const titleMatch = cleanContent.match(new RegExp(`标题${separator}([^\n]+)`, 'i'));
    if (titleMatch) {
      result.title = titleMatch[1].trim();
      console.log('提取到标题:', result.title);
    }
    
    // 2. 提取主要内容（支持多行）
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
    
    // 3. 针对不同类型的字段提取
    if (type === 'volume') {
      // 提取核心冲突
      const coreConflictMatch = cleanContent.match(new RegExp(`核心冲突${separator}([^\n]+)`, 'i'));
      if (coreConflictMatch) {
        result.core_conflict = coreConflictMatch[1].trim();
        console.log('提取到核心冲突:', result.core_conflict);
      }
      
      // 提取关键事件（列表）
      const keyEventsMatch = cleanContent.match(new RegExp(`关键事件${separator}([\\s\\S]*?)(?=\\n\\n|角色发展${separator}|章节数量${separator}|$)`, 'i'));
      if (keyEventsMatch) {
        const eventsText = keyEventsMatch[1].trim();
        // 解析列表项（支持 - 或 数字. 格式）
        result.key_events = eventsText.split('\n')
          .map(line => line.replace(/^[-\d.\s*]+/, '').trim())
          .filter(line => line.length > 0);
        console.log('提取到关键事件:', result.key_events);
      }
      
      // 提取角色发展
      const charDevMatch = cleanContent.match(new RegExp(`角色发展${separator}([^\n]+)`, 'i'));
      if (charDevMatch) {
        result.character_development = charDevMatch[1].trim();
        console.log('提取到角色发展:', result.character_development);
      }
      
      // 提取章节数量
      const chapterCountMatch = cleanContent.match(new RegExp(`章节数量${separator}(\d+)`, 'i'));
      if (chapterCountMatch) {
        result.chapter_count = parseInt(chapterCountMatch[1]);
        console.log('提取到章节数量:', result.chapter_count);
      }
    }
    
    if (type === 'chapter') {
      // 提取核心事件
      const coreEventMatch = cleanContent.match(new RegExp(`核心事件${separator}([^\n]+)`, 'i'));
      if (coreEventMatch) {
        result.core_event = coreEventMatch[1].trim();
        console.log('提取到核心事件:', result.core_event);
      }
      
      // 提取场景（列表）
      const scenesMatch = cleanContent.match(new RegExp(`场景${separator}([\\s\\S]*?)(?=\\n\\n|出场角色${separator}|$)`, 'i'));
      if (scenesMatch) {
        const scenesText = scenesMatch[1].trim();
        result.scenes = scenesText.split('\n')
          .map(line => line.replace(/^[-\d.\s*]+/, '').trim())
          .filter(line => line.length > 0);
        console.log('提取到场景:', result.scenes);
      }
      
      // 提取出场角色（列表）
      const charactersMatch = cleanContent.match(new RegExp(`出场角色${separator}([\\s\\S]*?)(?=\\n\\n|情感目标${separator}|$)`, 'i'));
      if (charactersMatch) {
        const charsText = charactersMatch[1].trim();
        result.characters = charsText.split('\n')
          .map(line => line.replace(/^[-\d.\s*]+/, '').trim())
          .filter(line => line.length > 0);
        console.log('提取到出场角色:', result.characters);
      }
      
      // 提取情感目标
      const emotionalMatch = cleanContent.match(new RegExp(`情感目标${separator}([^\n]+)`, 'i'));
      if (emotionalMatch) {
        result.emotional_goal = emotionalMatch[1].trim();
        console.log('提取到情感目标:', result.emotional_goal);
      }
      
      // 提取关键词（列表）
      const keywordsMatch = cleanContent.match(new RegExp(`关键词${separator}([\\s\\S]*?)(?=\\n\\n|预估字数${separator}|$)`, 'i'));
      if (keywordsMatch) {
        const keywordsText = keywordsMatch[1].trim();
        result.keywords = keywordsText.split('\n')
          .map(line => line.replace(/^[-\d.\s*]+/, '').trim())
          .filter(line => line.length > 0);
        console.log('提取到关键词:', result.keywords);
      }
      
      // 提取预估字数
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

  // 创建版本快照
  const handleCreateVersion = useCallback(async ({ type, data, description }) => {
    try {
      // 获取当前内容的快照
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

      // 调用后端API创建版本
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

  // 打开系统提示词配置窗口
  const handleOpenSystemPrompt = useCallback(() => {
    // 加载默认系统提示词
    setSystemPrompt(`你是一个专业的故事大纲生成专家，擅长根据项目信息创建详细、有深度的故事大纲。你的输出必须严格遵循指定的格式，确保结构清晰、内容完整，并且格式一致性高。\n\n请按照以下固定格式生成大纲：\n1. 使用Markdown格式输出\n2. 标题层级必须清晰：# 一级标题，## 二级标题，### 三级标题\n3. 必须包含以下章节，且章节顺序不可更改：\n   - ## 1. 主线剧情\n   - ## 2. 次要情节\n   - ## 3. 关键事件\n   - ## 4. 角色弧线\n   - ## 5. 主题\n\n内容要求：\n1. 主线剧情：详细描述故事的主要情节发展，包含起承转合\n2. 次要情节：列出2-3个重要的次要情节，每个次要情节要有标题和简短描述\n3. 关键事件：列出5-7个推动故事发展的关键事件，按时间顺序排列\n4. 角色弧线：描述主要角色的成长和转变，至少包含主角的完整弧线\n5. 主题：深入探讨故事的核心主题，分析其在故事中的体现方式\n\n请确保大纲内容丰富、结构合理，符合所选的故事模型和小说类型。`);
    setIsSystemPromptOpen(true);
  }, []);

  // 关闭系统提示词配置窗口
  const handleCloseSystemPrompt = useCallback(() => {
    setIsSystemPromptOpen(false);
  }, []);

  // 保存系统提示词
  const handleSaveSystemPrompt = useCallback(() => {
    // 保存系统提示词到localStorage，实现持久化
    localStorage.setItem('outlineSystemPrompt', systemPrompt);
    console.log('保存系统提示词:', systemPrompt);
    setIsSystemPromptOpen(false);
  }, [systemPrompt]);

  // 打开大纲编辑模态框
  const handleOpenOutlineEditModal = useCallback(() => {
    if (selectedOutline) {
      setOutlineEditFormData({ ...selectedOutline });
      setIsOutlineEditModalOpen(true);
    }
  }, [selectedOutline]);

  // 保存大纲修改
  const handleSaveOutlineEdit = useCallback(async () => {
    if (!selectedOutline) return;
    
    try {
      const response = await blueprintApi.updateOutline(selectedOutline.id, outlineEditFormData);
      // 更新本地大纲数据
      setOutlines(prev => prev.map(outline => 
        outline.id === selectedOutline.id ? response.data : outline
      ));
      // 更新选中的大纲
      setSelectedOutline(response.data);
      // 关闭模态框
      setIsOutlineEditModalOpen(false);
      console.log('大纲保存成功');
    } catch (error) {
      console.error('保存大纲失败:', error);
    }
  }, [selectedOutline, outlineEditFormData]);

  // 打开卷纲编辑模态框
  const handleOpenVolumeEditModal = useCallback((volume) => {
    setSelectedVolume(volume);
    setVolumeEditFormData({ ...volume });
    setIsVolumeEditModalOpen(true);
  }, []);

  // 保存卷纲修改
  const handleSaveVolumeEdit = useCallback(async () => {
    if (!selectedVolume) return;
    
    try {
      // 更新本地卷纲数据
      const updatedVolumes = volumes.map(volume => 
        volume.id === selectedVolume.id ? volumeEditFormData : volume
      );
      setVolumes(updatedVolumes);
      
      // 关闭模态框
      setIsVolumeEditModalOpen(false);
      console.log('卷纲保存成功');
      
      // 这里可以添加保存到后端的逻辑
      // 暂时只更新本地状态
    } catch (error) {
      console.error('保存卷纲失败:', error);
    }
  }, [selectedVolume, volumes, volumeEditFormData]);

  // 关闭卷纲编辑模态框
  const handleCloseVolumeEditModal = useCallback(() => {
    setIsVolumeEditModalOpen(false);
  }, []);

  // 加载故事大纲架构师
  const loadWorldviewArchitects = useCallback(() => {
    // 从localStorage加载
    const savedArchitects = localStorage.getItem('worldviewArchitects');
    let architects = [];
    
    if (savedArchitects) {
      architects = JSON.parse(savedArchitects);
      
      // 检查是否已经包含男频爽文架构师，如果没有则添加
      const hasMaleFrequencyArchitect = architects.some(architect => architect.name === '男频爽文架构师');
      if (!hasMaleFrequencyArchitect) {
        const maleFrequencyArchitect = {
          id: Date.now(),
          name: '男频爽文架构师',
          description: '专注于创作热血、逆袭、打脸、升级的男频爽文大纲',
          prompt: `你是一位顶级男频爽文架构师，精通爽文创作的核心要素，擅长构建节奏紧凑、爽点密集、升级体系清晰的故事大纲。\n\n请按照以下原则生成男频爽文大纲：\n\n1. 主角设定：\n- 平凡起点，有逆袭潜力\n- 强大的金手指/系统/奇遇\n- 坚韧不拔，杀伐果断的性格\n- 明确的成长目标和复仇动机\n\n2. 爽点设计：\n- 逆袭打脸：前期压制主角的反派必须被狠狠打脸\n- 装逼场面：主角实力展示的关键时刻\n- 资源获取：稀有资源的获取过程\n- 地位提升：从底层到上层的身份转变\n- 爽点密度：每章节至少一个爽点\n\n3. 升级体系：\n- 清晰的境界/等级划分\n- 具体的升级条件和资源需求\n- 每个大境界的突破瓶颈\n- 升级后的能力提升和地位变化\n\n4. 剧情节奏：\n- 快节奏，避免拖沓\n- 每1-2万字一个小高潮\n- 每5-10万字一个大高潮\n- 不断引入新的挑战和机遇\n\n5. 角色体系：\n- 各层级的反派，从小喽啰到最终BOSS\n- 忠心耿耿的小弟和伙伴\n- 有魅力的女性角色，合理的感情线\n- 各大势力的实力对比和关系\n\n6. 世界观：\n- 宏大、有等级体系的世界设定\n- 清晰的势力分布\n- 独特的修炼体系或科技体系\n- 隐藏的秘密和宝藏\n\n请确保大纲内容详细、逻辑清晰、爽点密集，适合作为男频爽文的创作基础。`
        };
        architects.push(maleFrequencyArchitect);
        // 保存更新后的架构师列表
        setWorldviewArchitects(architects);
        localStorage.setItem('worldviewArchitects', JSON.stringify(architects));
      } else {
        setWorldviewArchitects(architects);
      }
    } else {
      // 生成默认架构师
      const defaultArchitects = [
        {
          id: 1,
          name: '经典三幕剧架构师',
          description: '擅长构建传统三幕剧结构的故事大纲',
          prompt: `你是一个经典三幕剧架构师，擅长创作结构严谨的传统故事大纲。\n\n请按照三幕结构生成故事大纲：\n1. 第一幕：介绍人物和世界观，建立冲突\n2. 第二幕：发展冲突，主角面临挑战\n3. 第三幕：高潮和解决\n\n每个部分要有详细的情节发展和角色弧线。`
        },
        {
          id: 2,
          name: '英雄之旅架构师',
          description: '基于约瑟夫·坎贝尔的英雄之旅模式构建故事大纲',
          prompt: `你是一个英雄之旅架构师，擅长基于约瑟夫·坎贝尔的英雄之旅模式构建故事大纲。\n\n请按照英雄之旅的12个阶段生成故事大纲：\n1. 普通世界\n2. 冒险召唤\n3. 拒绝召唤\n4. 遇见导师\n5. 越过第一道门槛\n6. 考验、伙伴、敌人\n7. 接近最深的洞穴\n8. 磨难\n9. 报酬\n10. 回返\n11. 复活\n12. 携万能药回归\n\n每个阶段要有详细的情节描述和角色发展。`
        },
        {
          id: 3,
          name: '类型小说专家',
          description: '专注于特定类型的故事大纲结构',
          prompt: `你是一个类型小说专家，擅长创作符合特定类型规则的故事大纲。\n\n请根据小说类型生成专业的类型故事大纲：\n- 明确类型元素和规则\n- 包含类型特有的情节结构\n- 符合目标读者的期待\n\n确保故事充满类型特色和吸引力。`
        },
        {
          id: 4,
          name: '角色驱动型架构师',
          description: '以角色发展为核心的故事大纲构建',
          prompt: `你是一个角色驱动型架构师，擅长创造以角色发展为核心的故事大纲。\n\n请生成以角色为核心的故事大纲：\n- 详细的角色背景和动机\n- 完整的角色成长弧线\n- 角色关系的发展变化\n- 通过角色的选择推动情节\n\n让角色成为故事的灵魂。`
        },
        {
          id: 5,
          name: '男频爽文架构师',
          description: '专注于创作热血、逆袭、打脸、升级的男频爽文大纲',
          prompt: `你是一位顶级男频爽文架构师，精通爽文创作的核心要素，擅长构建节奏紧凑、爽点密集、升级体系清晰的故事大纲。\n\n请按照以下原则生成男频爽文大纲：\n\n1. 主角设定：\n- 平凡起点，有逆袭潜力\n- 强大的金手指/系统/奇遇\n- 坚韧不拔，杀伐果断的性格\n- 明确的成长目标和复仇动机\n\n2. 爽点设计：\n- 逆袭打脸：前期压制主角的反派必须被狠狠打脸\n- 装逼场面：主角实力展示的关键时刻\n- 资源获取：稀有资源的获取过程\n- 地位提升：从底层到上层的身份转变\n- 爽点密度：每章节至少一个爽点\n\n3. 升级体系：\n- 清晰的境界/等级划分\n- 具体的升级条件和资源需求\n- 每个大境界的突破瓶颈\n- 升级后的能力提升和地位变化\n\n4. 剧情节奏：\n- 快节奏，避免拖沓\n- 每1-2万字一个小高潮\n- 每5-10万字一个大高潮\n- 不断引入新的挑战和机遇\n\n5. 角色体系：\n- 各层级的反派，从小喽啰到最终BOSS\n- 忠心耿耿的小弟和伙伴\n- 有魅力的女性角色，合理的感情线\n- 各大势力的实力对比和关系\n\n6. 世界观：\n- 宏大、有等级体系的世界设定\n- 清晰的势力分布\n- 独特的修炼体系或科技体系\n- 隐藏的秘密和宝藏\n\n请确保大纲内容详细、逻辑清晰、爽点密集，适合作为男频爽文的创作基础。`
        }
      ];
      setWorldviewArchitects(defaultArchitects);
      localStorage.setItem('worldviewArchitects', JSON.stringify(defaultArchitects));
      
      // 恢复之前选中的架构师
      const savedArchitectId = localStorage.getItem('selectedArchitectId');
      if (savedArchitectId) {
        const savedArchitect = defaultArchitects.find(a => a.id === parseInt(savedArchitectId));
        if (savedArchitect) {
          setSelectedArchitect(savedArchitect);
        }
      }
    }
  }, []);

  // 打开架构师管理器
  const handleOpenArchitectManager = useCallback(() => {
    loadWorldviewArchitects();
    setIsArchitectManagerOpen(true);
  }, [loadWorldviewArchitects]);

  // 关闭架构师管理器
  const handleCloseArchitectManager = useCallback(() => {
    setIsArchitectManagerOpen(false);
    setEditingArchitect(null);
  }, []);

  // 选择架构师 - 保存到localStorage
  const handleSelectArchitect = useCallback((architect) => {
    setSelectedArchitect(architect);
    if (architect) {
      localStorage.setItem('selectedArchitectId', architect.id);
    } else {
      localStorage.removeItem('selectedArchitectId');
    }
  }, []);

  // 编辑架构师
  const handleEditArchitect = useCallback((architect) => {
    setEditingArchitect(architect);
    setArchitectEditFormData({
      name: architect.name,
      description: architect.description,
      prompt: architect.prompt
    });
  }, []);

  // 保存编辑的架构师
  const handleSaveEditArchitect = useCallback(() => {
    if (!editingArchitect) return;
    
    const updatedArchitects = worldviewArchitects.map(architect => 
      architect.id === editingArchitect.id ? {
        ...architect,
        name: architectEditFormData.name,
        description: architectEditFormData.description,
        prompt: architectEditFormData.prompt
      } : architect
    );
    
    setWorldviewArchitects(updatedArchitects);
    localStorage.setItem('worldviewArchitects', JSON.stringify(updatedArchitects));
    setEditingArchitect(null);
  }, [editingArchitect, worldviewArchitects, architectEditFormData]);

  // 取消编辑架构师
  const handleCancelEditArchitect = useCallback(() => {
    setEditingArchitect(null);
  }, []);

  // 添加新架构师
  const handleAddArchitect = useCallback(() => {
    const newArchitect = {
      id: Date.now(),
      name: '新架构师',
      description: '请编辑架构师描述',
      prompt: '请编辑提示词内容'
    };
    const updatedArchitects = [...worldviewArchitects, newArchitect];
    setWorldviewArchitects(updatedArchitects);
    localStorage.setItem('worldviewArchitects', JSON.stringify(updatedArchitects));
  }, [worldviewArchitects]);

  // 删除架构师
  const handleDeleteArchitect = useCallback((architectId) => {
    const updatedArchitects = worldviewArchitects.filter(architect => architect.id !== architectId);
    setWorldviewArchitects(updatedArchitects);
    localStorage.setItem('worldviewArchitects', JSON.stringify(updatedArchitects));
  }, [worldviewArchitects]);

  // 打开大纲结构配置
  const handleOpenWorldviewStructureConfig = useCallback(() => {
    // 直接设置新的男频爽文大纲结构提示词，覆盖旧的设置
    const maleFrequencyStructurePrompt = `你是一位精通男频爽文创作的顶级大纲架构师，擅长构建节奏紧凑、爽点密集、升级体系清晰的故事大纲。请按照以下结构为男频爽文生成详细大纲：\n\n## 1. 故事概述\n- 核心概念：明确的金手指/系统/奇遇设定\n- 世界观：宏大、有等级体系的世界设定\n- 爽文基调：热血、逆袭、打脸、升级\n- 目标读者：18-35岁男性读者\n\n## 2. 主角设定\n- 身份背景：平凡起点，有逆袭潜力\n- 金手指：详细的系统/奇遇/特殊能力设定\n- 性格特点：坚韧不拔，有底线，杀伐果断\n- 成长目标：明确的长期和短期目标\n\n## 3. 主线剧情\n- 起：平凡生活的打破，金手指觉醒\n- 承：初步成长，遭遇第一个挑战\n- 转：重大危机，突破瓶颈\n- 合：阶段性胜利，开启新的征程\n- 节奏要求：每1-2万字必须有一个爽点\n\n## 4. 升级体系\n- 等级划分：清晰的境界/等级设定\n- 升级条件：具体的升级要求和资源需求\n- 瓶颈设计：每个大境界的突破难点\n- 升级奖励：升级后的能力提升和地位变化\n\n## 5. 爽点设计\n- 逆袭打脸：具体的反派和打脸场景\n- 装逼场面：主角展示实力的关键时刻\n- 资源获取：稀有资源的获取过程\n- 地位提升：从底层到上层的身份转变\n- 爽点密度：确保每章节至少有一个爽点\n\n## 6. 角色体系\n- 反派设定：各层级的反派，从小喽啰到最终BOSS\n- 配角团队：忠心耿耿的小弟和伙伴\n- 女性角色：有魅力的女性角色，合理的感情线\n- 势力分布：各大势力的实力对比和关系\n\n## 7. 次要情节\n- 支线任务：与主线相关的支线剧情\n- 势力斗争：不同势力之间的冲突\n- 修炼秘境：特殊场景的探险情节\n- 宝物争夺：稀有资源的争夺过程\n\n## 8. 关键事件\n- 金手指觉醒：主角获得特殊能力的过程\n- 第一次打脸：主角首次展示实力\n- 重大危机：主角面临生死挑战\n- 境界突破：关键的等级提升\n- 势力崛起：主角建立自己的势力\n- 复仇情节：对仇人进行报复\n- 终极对决：与最终BOSS的战斗\n\n## 9. 风格与节奏\n- 叙述风格：简洁明快，重点突出爽点\n- 节奏把控：张弛有度，爽点密集\n- 场景转换：流畅自然，避免拖沓\n- 描写重点：战斗场景、装逼场面、升级过程\n\n## 10. 市场定位\n- 同类作品：参考当前热门男频爽文\n- 差异化：故事的独特卖点\n- 读者期待：满足男性读者的爽感需求\n- 连载规划：适合长期连载的剧情设计\n\n请确保大纲内容详细、逻辑清晰、爽点密集，适合作为男频爽文的创作基础。`;
    
    setWorldviewStructurePrompt(maleFrequencyStructurePrompt);
    // 同时保存到localStorage，确保下次打开时仍然是新的提示词
    localStorage.setItem('worldviewStructurePrompt', maleFrequencyStructurePrompt);
    setIsWorldviewStructureConfigOpen(true);
  }, []);

  // 保存大纲结构配置
  const handleSaveWorldviewStructureConfig = useCallback(() => {
    localStorage.setItem('worldviewStructurePrompt', worldviewStructurePrompt);
    setIsWorldviewStructureConfigOpen(false);
  }, [worldviewStructurePrompt]);

  // 关闭大纲结构配置
  const handleCloseWorldviewStructureConfig = useCallback(() => {
    setIsWorldviewStructureConfigOpen(false);
  }, []);

  // 组件加载时从localStorage加载系统提示词
  useEffect(() => {
    const savedPrompt = localStorage.getItem('outlineSystemPrompt');
    if (savedPrompt) {
      setSystemPrompt(savedPrompt);
    }
    
    // 加载大纲结构提示词
    const savedStructurePrompt = localStorage.getItem('worldviewStructurePrompt');
    if (savedStructurePrompt) {
      setWorldviewStructurePrompt(savedStructurePrompt);
    }
  }, []);

  return {
    // 状态
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
    
    // 状态设置函数
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
    
    // 方法
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

    // 停止生成
    stopGeneration
  };
};
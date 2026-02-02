import React, { useState, useEffect, useRef } from 'react';
import { blueprintApi, projectApi } from '../services/api';
import DataVisualization from '../components/DataVisualization';
import './BlueprintPage.css';

const BlueprintPage = ({ projectId }) => {
  console.log('BlueprintPage 接收的 projectId:', projectId);
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
  const [timestamp, setTimestamp] = useState(new Date().toLocaleTimeString());
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
  
  // 当projectId变化时更新时间戳
  useEffect(() => {
    setTimestamp(new Date().toLocaleTimeString());
  }, [projectId]);

  // 组件加载时从localStorage加载系统提示词
  useEffect(() => {
    const savedPrompt = localStorage.getItem('outlineSystemPrompt');
    if (savedPrompt) {
      setSystemPrompt(savedPrompt);
    }
  }, []);

  // 加载项目信息
  const loadProjectInfo = async () => {
    if (!isProjectIdValid) return;
    
    try {
      const response = await projectApi.getProject(projectId);
      setProjectInfo(response.data);
    } catch (error) {
      console.error('加载项目信息失败:', error);
    }
  };

  // 加载项目大纲
  useEffect(() => {
    if (projectId !== null && projectId !== undefined && projectId !== '') {
      loadProjectOutline();
      loadProjectInfo();
    }
  }, [projectId]);

  const loadProjectOutline = async () => {
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
  };

  // 加载卷纲
  const loadVolumes = async () => {
    if (selectedOutline) {
      setIsLoading(true);
      try {
        // 这里应该有一个API来获取大纲对应的卷纲
        // 暂时使用模拟数据
        setVolumes([
          {
            id: 1,
            title: '第一卷：起源',
            core_conflict: '主角发现自己的特殊能力',
            order_index: 1
          },
          {
            id: 2,
            title: '第二卷：挑战',
            core_conflict: '主角面对第一个 major 挑战',
            order_index: 2
          }
        ]);
        setError(null);
      } catch (err) {
        setError('加载卷纲失败');
        console.error('加载卷纲失败:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 加载章纲
  const loadChapters = async () => {
    if (selectedVolume) {
      setIsLoading(true);
      try {
        // 这里应该有一个API来获取卷纲对应的章纲
        // 暂时使用模拟数据
        setChapters([
          {
            id: 1,
            title: '第一章：平凡的一天',
            core_event: '主角在平凡的生活中发现异常',
            emotional_goal: '建立主角的日常和性格',
            word_count_estimate: 2000,
            order_index: 1
          },
          {
            id: 2,
            title: '第二章：觉醒',
            core_event: '主角的特殊能力首次觉醒',
            emotional_goal: '创造惊奇和紧张感',
            word_count_estimate: 2500,
            order_index: 2
          }
        ]);
        setError(null);
      } catch (err) {
        setError('加载章纲失败');
        console.error('加载章纲失败:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 生成大纲
  const generateOutline = async () => {
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
      
      // 构建AI消息
      let systemContent = systemPrompt;
      if (selectedArchitect && selectedArchitect.prompt) {
        systemContent = selectedArchitect.prompt;
      }
      if (worldviewStructurePrompt) {
        systemContent += '\n\n' + worldviewStructurePrompt;
      }
      
      // 构建用户提示
      let userPrompt = `请为以下小说项目生成一个详细的故事大纲：\n\n`;
      userPrompt += `项目标题：${projectInfo?.title || '未知标题'}\n`;
      userPrompt += `小说类型：${projectInfo?.genre || '未知类型'}\n`;
      userPrompt += `核心主题：${projectInfo?.core_theme || '默认主题'}\n`;
      userPrompt += `一句话梗概：${projectInfo?.synopsis || ''}\n`;
      userPrompt += `创作风格：${projectInfo?.writing_style || ''}\n`;
      userPrompt += `参考作品：${projectInfo?.reference_works || ''}\n`;
      userPrompt += `目标读者：${projectInfo?.target_audience || '所有读者'}\n\n`;
      userPrompt += `请使用Markdown格式输出，确保结构清晰、内容完整。`;
      
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
      const processStream = async () => {
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
              setOutlines([...outlines, savedOutline]);
              setSelectedOutline(savedOutline);
              setError(null);
            } else {
              throw new Error('保存大纲失败');
            }
          } catch (error) {
            console.error('处理大纲失败:', error);
            setError('生成大纲失败: 保存失败');
          }
        }
      };
      
      try {
        await processStream();
      } catch (err) {
        console.error('处理流式输出失败:', err);
        setError('生成大纲失败');
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
      }
    } catch (err) {
      setError('生成大纲失败');
      console.error('生成大纲失败:', err);
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  // 分解大纲为卷纲
  const decomposeOutlineToVolumes = async () => {
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
        
        // 构建AI提示词
        let systemContent = `你是一位专业的小说编辑和大纲架构师，擅长将长篇故事大纲分解为合理的卷纲结构。`;
        if (selectedArchitect && selectedArchitect.prompt) {
          systemContent = selectedArchitect.prompt;
        }
        
        // 构建用户提示
        let userPrompt = `请分析以下故事大纲，并将其分解为合理的卷纲结构：\n\n`;
        userPrompt += `# 故事大纲\n${outlineContent}\n\n`;
        userPrompt += `# 分解要求\n`;
        userPrompt += `1. 分析大纲内容，根据故事的起承转合和情节发展，将其分解为3-5个卷\n`;
        userPrompt += `2. 每个卷需要包含：\n`;
        userPrompt += `   - 卷号和标题\n`;
        userPrompt += `   - 核心冲突\n`;
        userPrompt += `   - 主要内容概述（3-5句话）\n`;
        userPrompt += `   - 关键事件（2-3个）\n`;
        userPrompt += `   - 角色发展\n`;
        userPrompt += `   - 章节数量：根据卷的内容复杂度，合理分配章节数量（建议每卷5-8章）\n`;
        userPrompt += `3. 确保卷与卷之间的过渡自然，情节连贯\n`;
        userPrompt += `4. 每个卷的内容长度要相对均衡\n`;
        userPrompt += `5. 输出格式要求：\n`;
        userPrompt += `   - 使用JSON格式输出\n`;
        userPrompt += `   - 包含一个"volumes"数组，每个元素代表一个卷\n`;
        userPrompt += `   - 每个卷对象包含：id、title、core_conflict、content、key_events、character_development、chapter_count、order_index\n`;
        userPrompt += `6. 请确保输出的JSON格式正确，不要包含任何额外的文字\n`;
        
        const messages = [
          { role: 'system', content: systemContent },
          { role: 'user', content: userPrompt }
        ];
        
        // 调用AI API
        const response = await fetch('http://localhost:5000/api/ai/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: messages,
            max_tokens: 3000
          })
        });
        
        if (!response.ok) {
          throw new Error('分解卷纲失败');
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';
        
        // 处理流式响应
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
                }
              } catch (error) {
                console.error('解析流式数据失败:', error);
              }
            }
          }
        }
        
        // 处理AI响应
        if (fullContent) {
          try {
            // 提取JSON部分
            const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const jsonContent = jsonMatch[0];
              const parsedData = JSON.parse(jsonContent);
              
              if (parsedData.volumes && Array.isArray(parsedData.volumes)) {
                // 处理卷纲数据
                const volumesData = parsedData.volumes.map((volume, index) => ({
                  id: volume.id || Date.now() + index,
                  title: volume.title,
                  core_conflict: volume.core_conflict,
                  content: volume.content,
                  key_events: volume.key_events,
                  character_development: volume.character_development,
                  chapter_count: volume.chapter_count || 6,
                  order_index: volume.order_index || index + 1
                }));
                
                // 保存卷纲数据
                setVolumes(volumesData);
                setActiveView('volume');
                setError(null);
                
                // 将卷纲数据保存到后端
                try {
                  // 为每个卷纲创建后端记录
                  for (const volume of volumesData) {
                    const saveResponse = await fetch('http://localhost:5000/api/outlines/' + selectedOutline.id + '/decompose', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(volume)
                    });
                    
                    if (!saveResponse.ok) {
                      console.error('保存卷纲失败:', await saveResponse.text());
                    }
                  }
                  console.log('卷纲保存成功');
                } catch (error) {
                  console.error('保存卷纲到后端失败:', error);
                }
              } else {
                throw new Error('AI输出格式错误，缺少volumes数组');
              }
            } else {
              throw new Error('无法从AI输出中提取JSON');
            }
          } catch (error) {
            console.error('处理卷纲数据失败:', error);
            setError('分解卷纲失败: 处理AI响应失败');
          }
        }
      } catch (err) {
        setError('分解卷纲失败');
        console.error('分解卷纲失败:', err);
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
      }
    }
  };

  // 分解卷纲为章纲
  const decomposeVolumeToChapters = async () => {
    if (selectedVolume) {
      setIsLoading(true);
      setIsStreaming(true);
      setStreamingOutput('');
      
      // 添加一个小延迟，确保isStreaming状态更新后再开始处理
      await new Promise(resolve => setTimeout(resolve, 100));
      
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
        if (selectedVolume.chapter_count) {
          volumeContent += `章节数量: ${selectedVolume.chapter_count}\n`;
        }
        
        // 构建AI提示词
        let systemContent = `你是一位专业的小说编辑和大纲架构师，擅长将卷纲分解为详细的章纲结构。`;
        if (selectedArchitect && selectedArchitect.prompt) {
          systemContent = selectedArchitect.prompt;
        }
        
        // 计算需要生成的章节数量
        const totalChapters = selectedVolume.chapter_count || 6;
        const batchSize = 8; // 每批生成8个章节
        
        // 存储所有章节数据
        let allChapters = [];
        let currentBatch = 1;
        
        // 检查是否已有部分章节数据
        if (chapters.length > 0) {
          allChapters = chapters;
          // 从已有章节的下一章开始生成
          currentBatch = Math.ceil((chapters.length + 1) / batchSize);
        }
        
        // 计算需要生成的总批次数
        const totalBatches = Math.ceil(totalChapters / batchSize);
        
        // 分批生成章纲
        while (currentBatch <= totalBatches) {
          // 计算当前批次的章节范围
          const existingChapters = allChapters.length;
          const startChapter = existingChapters + 1;
          const endChapter = Math.min(existingChapters + batchSize, totalChapters);
          
          // 如果已经生成了足够的章节，跳过当前批次
          if (startChapter > totalChapters) {
            break;
          }
          
          // 更新流式输出，显示当前进度
          setStreamingOutput(prev => prev + `\n=== 正在生成第${startChapter}-${endChapter}章 ===\n`);
          
          // 构建当前批次的用户提示
          let userPrompt = `请分析以下卷纲，并将其分解为详细的章纲结构：\n\n`;
          userPrompt += `${volumeContent}\n\n`;
          
          // 添加之前批次生成的章节信息作为上下文
          if (allChapters.length > 0) {
            userPrompt += `# 已生成章节\n`;
            userPrompt += `以下是已生成的章节信息，请确保新生成的章节与这些章节保持连贯：\n`;
            allChapters.forEach(chapter => {
              userPrompt += `第${chapter.order_index}章: ${chapter.title}\n`;
              userPrompt += `核心事件: ${chapter.core_event}\n\n`;
            });
          }
          
          userPrompt += `# 分解要求\n`;
          userPrompt += `1. 分析卷纲内容，根据情节发展，生成第${startChapter}-${endChapter}章的章纲\n`;
          userPrompt += `2. 每个章需要包含：\n`;
          userPrompt += `   - 章号和标题\n`;
          userPrompt += `   - 核心事件\n`;
          userPrompt += `   - 情绪目标\n`;
          userPrompt += `   - 字数估计\n`;
          userPrompt += `   - 主要内容概述（2-3句话）\n`;
          userPrompt += `3. 确保章与章之间的过渡自然，情节连贯\n`;
          userPrompt += `4. 每个章的内容长度要相对均衡\n`;
          userPrompt += `5. 输出格式要求：\n`;
          userPrompt += `   - 使用JSON格式输出\n`;
          userPrompt += `   - 包含一个"chapters"数组，每个元素代表一个章\n`;
          userPrompt += `   - 每个章对象包含：id、title、core_event、emotional_goal、word_count_estimate、content、order_index\n`;
          userPrompt += `6. 请确保输出的JSON格式正确，不要包含任何额外的文字\n`;
          
          const messages = [
            { role: 'system', content: systemContent },
            { role: 'user', content: userPrompt }
          ];
          
          // 调用AI API
          const response = await fetch('http://localhost:5000/api/ai/stream', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              messages: messages,
              max_tokens: 3000
            })
          });
          
          if (!response.ok) {
            throw new Error('分解章纲失败');
          }
          
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let batchContent = '';
          
          // 处理流式响应
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
                    batchContent += content;
                    setStreamingOutput(prev => prev + content);
                  }
                } catch (error) {
                  console.error('解析流式数据失败:', error);
                }
              }
            }
          }
          
          // 处理当前批次的AI响应
          if (batchContent) {
            try {
              // 提取JSON部分
              const jsonMatch = batchContent.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const jsonContent = jsonMatch[0];
                const parsedData = JSON.parse(jsonContent);
                
                if (parsedData.chapters && Array.isArray(parsedData.chapters)) {
                  // 处理当前批次的章纲数据
                  const batchChapters = parsedData.chapters.map((chapter, index) => ({
                    id: chapter.id || Date.now() + (currentBatch - 1) * batchSize + index,
                    title: chapter.title,
                    core_event: chapter.core_event,
                    emotional_goal: chapter.emotional_goal,
                    word_count_estimate: chapter.word_count_estimate || 2000,
                    content: chapter.content,
                    order_index: chapter.order_index || startChapter + index
                  }));
                  
                  // 将当前批次的章节添加到总章节列表
                  allChapters = [...allChapters, ...batchChapters];
                } else {
                  throw new Error('AI输出格式错误，缺少chapters数组');
                }
              } else {
                throw new Error('无法从AI输出中提取JSON');
              }
            } catch (error) {
              console.error('处理章纲数据失败:', error);
              setError('分解章纲失败: 处理AI响应失败');
            }
          }
          
          // 进入下一批次
          currentBatch++;
        }
        
        // 所有批次处理完成后，保存完整的章纲数据
        if (allChapters.length > 0) {
          // 将章纲数据保存到后端
          try {
            // 为每个章纲创建后端记录
            for (const chapter of allChapters) {
              const saveResponse = await fetch('http://localhost:5000/api/volumes/' + selectedVolume.id + '/decompose', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  title: chapter.title,
                  core_event: chapter.core_event,
                  emotional_goal: chapter.emotional_goal,
                  word_count_estimate: chapter.word_count_estimate,
                  order_index: chapter.order_index
                })
              });
              
              if (!saveResponse.ok) {
                console.error('保存章纲失败:', await saveResponse.text());
              }
            }
            console.log('章纲保存成功');
          } catch (error) {
            console.error('保存章纲到后端失败:', error);
          }
          
          // 保存章纲数据并切换视图
          setChapters(allChapters);
          setActiveView('chapter');
          setError(null);
        }
      } catch (err) {
        setError('分解章纲失败');
        console.error('分解章纲失败:', err);
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
      }
    }
  };

  // 切换视图
  const handleViewChange = (view) => {
    setActiveView(view);
    // 不要在切换视图时重新加载数据，保留当前的数据状态
    // 只有当没有数据时才加载
    if (view === 'volume' && selectedOutline && volumes.length === 0) {
      loadVolumes();
    } else if (view === 'chapter' && selectedVolume && chapters.length === 0) {
      loadChapters();
    }
  };

  // 选择大纲
  const handleOutlineSelect = (outline) => {
    setSelectedOutline(outline);
    setVolumes([]);
    setChapters([]);
  };

  // 选择卷纲
  const handleVolumeSelect = (volume) => {
    setSelectedVolume(volume);
    setChapters([]);
  };

  // 选择章纲
  const handleChapterSelect = (chapter) => {
    setSelectedChapter(chapter);
  };

  // 删除大纲的异步函数
  const handleDeleteOutline = async (outlineId) => {
    try {
      await blueprintApi.deleteOutline(outlineId);
      // 重新加载大纲列表
      loadProjectOutline();
      // 清除选中的大纲
      if (selectedOutline && selectedOutline.id === outlineId) {
        setSelectedOutline(null);
      }
      console.log('大纲删除成功');
    } catch (error) {
      console.error('删除大纲失败:', error);
    }
  };

  // 打开编辑项目信息模态框
  const handleOpenEditModal = () => {
    if (projectInfo) {
      setEditFormData({ ...projectInfo });
      setIsEditModalOpen(true);
    }
  };

  // 关闭编辑项目信息模态框
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  // 处理表单输入变化
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 保存项目信息
  const handleSaveProjectInfo = async () => {
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
  };

  // 打开AI对话窗口
  const handleOpenAIChat = () => {
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
  };

  // 关闭AI对话窗口
  const handleCloseAIChat = () => {
    setIsAIChatOpen(false);
  };

  // 发送消息
  const handleSendMessage = async () => {
    if (!chatInput.trim() || !selectedOutline) return;
    
    // 添加用户消息
    const newMessages = [...chatMessages, {
      role: 'user',
      content: chatInput
    }];
    setChatMessages(newMessages);
    setChatInput('');
    
    // 模拟AI回复
    try {
      // 这里应该调用AI API获取回复
      // 暂时返回模拟数据
      setTimeout(() => {
        const aiResponse = {
          role: 'assistant',
          content: `我已经理解了您的修改请求。基于您的要求，我已经修改了大纲。以下是修改后的大纲内容：\n\n- 主线剧情：根据您的要求进行了调整\n- 次要情节：添加了新的元素\n- 关键事件：重新排序以增强故事节奏\n\n您对修改后的大纲满意吗？如果需要进一步调整，请告诉我具体的修改要求。`
        };
        setChatMessages(prev => [...prev, aiResponse]);
      }, 1000);
    } catch (error) {
      console.error('获取AI回复失败:', error);
    }
  };

  // 打开系统提示词配置窗口
  const handleOpenSystemPrompt = () => {
    // 加载默认系统提示词
    setSystemPrompt(`你是一个专业的故事大纲生成专家，擅长根据项目信息创建详细、有深度的故事大纲。你的输出必须严格遵循指定的格式，确保结构清晰、内容完整，并且格式一致性高。\n\n请按照以下固定格式生成大纲：\n1. 使用Markdown格式输出\n2. 标题层级必须清晰：# 一级标题，## 二级标题，### 三级标题\n3. 必须包含以下章节，且章节顺序不可更改：\n   - ## 1. 主线剧情\n   - ## 2. 次要情节\n   - ## 3. 关键事件\n   - ## 4. 角色弧线\n   - ## 5. 主题\n\n内容要求：\n1. 主线剧情：详细描述故事的主要情节发展，包含起承转合\n2. 次要情节：列出2-3个重要的次要情节，每个次要情节要有标题和简短描述\n3. 关键事件：列出5-7个推动故事发展的关键事件，按时间顺序排列\n4. 角色弧线：描述主要角色的成长和转变，至少包含主角的完整弧线\n5. 主题：深入探讨故事的核心主题，分析其在故事中的体现方式\n\n请确保大纲内容丰富、结构合理，符合所选的故事模型和小说类型。`);
    setIsSystemPromptOpen(true);
  };

  // 关闭系统提示词配置窗口
  const handleCloseSystemPrompt = () => {
    setIsSystemPromptOpen(false);
  };

  // 保存系统提示词
  const handleSaveSystemPrompt = () => {
    // 保存系统提示词到localStorage，实现持久化
    localStorage.setItem('outlineSystemPrompt', systemPrompt);
    console.log('保存系统提示词:', systemPrompt);
    setIsSystemPromptOpen(false);
  };

  // 打开大纲编辑模态框
  const handleOpenOutlineEditModal = () => {
    if (selectedOutline) {
      setOutlineEditFormData({ ...selectedOutline });
      setIsOutlineEditModalOpen(true);
    }
  };

  // 保存大纲修改
  const handleSaveOutlineEdit = async () => {
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
  };

  // 打开卷纲编辑模态框
  const handleOpenVolumeEditModal = (volume) => {
    setSelectedVolume(volume);
    setVolumeEditFormData({ ...volume });
    setIsVolumeEditModalOpen(true);
  };

  // 保存卷纲修改
  const handleSaveVolumeEdit = async () => {
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
  };

  // 关闭卷纲编辑模态框
  const handleCloseVolumeEditModal = () => {
    setIsVolumeEditModalOpen(false);
  };







  // 加载故事大纲架构师
  const loadWorldviewArchitects = () => {
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
    }
  };

  // 打开架构师管理器
  const handleOpenArchitectManager = () => {
    loadWorldviewArchitects();
    setIsArchitectManagerOpen(true);
  };

  // 关闭架构师管理器
  const handleCloseArchitectManager = () => {
    setIsArchitectManagerOpen(false);
    setEditingArchitect(null);
  };

  // 选择架构师
  const handleSelectArchitect = (architect) => {
    setSelectedArchitect(architect);
  };

  // 编辑架构师
  const handleEditArchitect = (architect) => {
    setEditingArchitect(architect);
    setArchitectEditFormData({
      name: architect.name,
      description: architect.description,
      prompt: architect.prompt
    });
  };

  // 保存编辑的架构师
  const handleSaveEditArchitect = () => {
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
  };

  // 取消编辑架构师
  const handleCancelEditArchitect = () => {
    setEditingArchitect(null);
  };

  // 添加新架构师
  const handleAddArchitect = () => {
    const newArchitect = {
      id: Date.now(),
      name: '新架构师',
      description: '请编辑架构师描述',
      prompt: '请编辑提示词内容'
    };
    const updatedArchitects = [...worldviewArchitects, newArchitect];
    setWorldviewArchitects(updatedArchitects);
    localStorage.setItem('worldviewArchitects', JSON.stringify(updatedArchitects));
  };

  // 删除架构师
  const handleDeleteArchitect = (architectId) => {
    const updatedArchitects = worldviewArchitects.filter(architect => architect.id !== architectId);
    setWorldviewArchitects(updatedArchitects);
    localStorage.setItem('worldviewArchitects', JSON.stringify(updatedArchitects));
  };

  // 打开大纲结构配置
  const handleOpenWorldviewStructureConfig = () => {
    // 直接设置新的男频爽文大纲结构提示词，覆盖旧的设置
    const maleFrequencyStructurePrompt = `你是一位精通男频爽文创作的顶级大纲架构师，擅长构建节奏紧凑、爽点密集、升级体系清晰的故事大纲。请按照以下结构为男频爽文生成详细大纲：\n\n## 1. 故事概述\n- 核心概念：明确的金手指/系统/奇遇设定\n- 世界观：宏大、有等级体系的世界设定\n- 爽文基调：热血、逆袭、打脸、升级\n- 目标读者：18-35岁男性读者\n\n## 2. 主角设定\n- 身份背景：平凡起点，有逆袭潜力\n- 金手指：详细的系统/奇遇/特殊能力设定\n- 性格特点：坚韧不拔，有底线，杀伐果断\n- 成长目标：明确的长期和短期目标\n\n## 3. 主线剧情\n- 起：平凡生活的打破，金手指觉醒\n- 承：初步成长，遭遇第一个挑战\n- 转：重大危机，突破瓶颈\n- 合：阶段性胜利，开启新的征程\n- 节奏要求：每1-2万字必须有一个爽点\n\n## 4. 升级体系\n- 等级划分：清晰的境界/等级设定\n- 升级条件：具体的升级要求和资源需求\n- 瓶颈设计：每个大境界的突破难点\n- 升级奖励：升级后的能力提升和地位变化\n\n## 5. 爽点设计\n- 逆袭打脸：具体的反派和打脸场景\n- 装逼场面：主角展示实力的关键时刻\n- 资源获取：稀有资源的获取过程\n- 地位提升：从底层到上层的身份转变\n- 爽点密度：确保每章节至少有一个爽点\n\n## 6. 角色体系\n- 反派设定：各层级的反派，从小喽啰到最终BOSS\n- 配角团队：忠心耿耿的小弟和伙伴\n- 女性角色：有魅力的女性角色，合理的感情线\n- 势力分布：各大势力的实力对比和关系\n\n## 7. 次要情节\n- 支线任务：与主线相关的支线剧情\n- 势力斗争：不同势力之间的冲突\n- 修炼秘境：特殊场景的探险情节\n- 宝物争夺：稀有资源的争夺过程\n\n## 8. 关键事件\n- 金手指觉醒：主角获得特殊能力的过程\n- 第一次打脸：主角首次展示实力\n- 重大危机：主角面临生死挑战\n- 境界突破：关键的等级提升\n- 势力崛起：主角建立自己的势力\n- 复仇情节：对仇人进行报复\n- 终极对决：与最终BOSS的战斗\n\n## 9. 风格与节奏\n- 叙述风格：简洁明快，重点突出爽点\n- 节奏把控：张弛有度，爽点密集\n- 场景转换：流畅自然，避免拖沓\n- 描写重点：战斗场景、装逼场面、升级过程\n\n## 10. 市场定位\n- 同类作品：参考当前热门男频爽文\n- 差异化：故事的独特卖点\n- 读者期待：满足男性读者的爽感需求\n- 连载规划：适合长期连载的剧情设计\n\n请确保大纲内容详细、逻辑清晰、爽点密集，适合作为男频爽文的创作基础。`;
    
    setWorldviewStructurePrompt(maleFrequencyStructurePrompt);
    // 同时保存到localStorage，确保下次打开时仍然是新的提示词
    localStorage.setItem('worldviewStructurePrompt', maleFrequencyStructurePrompt);
    setIsWorldviewStructureConfigOpen(true);
  };

  // 保存大纲结构配置
  const handleSaveWorldviewStructureConfig = () => {
    localStorage.setItem('worldviewStructurePrompt', worldviewStructurePrompt);
    setIsWorldviewStructureConfigOpen(false);
  };

  // 关闭大纲结构配置
  const handleCloseWorldviewStructureConfig = () => {
    setIsWorldviewStructureConfigOpen(false);
  };



  return (
    <div className="blueprint-page">
      <div className="blueprint-header">
        <h1>故事蓝图</h1>
        <div className="header-actions">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <button 
              className="btn btn-primary" 
              onClick={generateOutline}
              disabled={isLoading || !isProjectIdValid}
            >
              {isLoading ? '生成中...' : '生成大纲'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => console.log('导入大纲')}
              disabled={!isProjectIdValid}
            >
              导入大纲
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => console.log('导出大纲')}
              disabled={!isProjectIdValid}
            >
              导出大纲
            </button>
          </div>
        </div>
        <div className="view-switcher">
          <button 
            className={`btn ${activeView === 'outline' ? 'active' : ''}`}
            onClick={() => handleViewChange('outline')}
            disabled={!isProjectIdValid}
          >
            大纲视图
          </button>
          <button 
            className={`btn ${activeView === 'volume' ? 'active' : ''}`}
            onClick={() => handleViewChange('volume')}
            disabled={!isProjectIdValid}
          >
            卷纲视图
          </button>
          <button 
            className={`btn ${activeView === 'chapter' ? 'active' : ''}`}
            onClick={() => handleViewChange('chapter')}
            disabled={!isProjectIdValid}
          >
            章纲视图
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* 流式输出显示区域 */}
      {isStreaming && (
        <div className="streaming-output">
          <h3>大纲生成中...</h3>
          <div className="streaming-content">
            <div className="markdown-content">
              <div style={{ 
                whiteSpace: 'pre-wrap', 
                lineHeight: '1.6',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
                fontSize: '14px'
              }}>
                {streamingOutput}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="blueprint-content">
        {!isProjectIdValid && (
          <div className="error-message">
            [蓝图页 {timestamp}] 请先选择一个项目，然后再使用故事蓝图功能
          </div>
        )}

        {isProjectIdValid && (
          <div className="sidebar">
            <h3>大纲结构</h3>
            <div className="outline-tree">
              {outlines.map(outline => (
                <div 
                  key={outline.id}
                  className={`outline-item ${selectedOutline?.id === outline.id ? 'selected' : ''}`}
                >
                  <div onClick={() => handleOutlineSelect(outline)} style={{ cursor: 'pointer' }}>
                    <h4>{outline.title}</h4>
                    <p>版本: {outline.version}</p>
                  </div>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={async (e) => {
                      e.stopPropagation(); // 阻止事件冒泡
                      try {
                        // 处理 window.confirm 返回 Promise 的情况
                        const confirmed = await window.confirm('确定要删除这个大纲吗？');
                        if (confirmed) {
                          await handleDeleteOutline(outline.id);
                        }
                      } catch (error) {
                        console.error('处理确认对话框时出错:', error);
                      }
                    }}
                    style={{ marginTop: '8px' }}
                  >
                    删除
                  </button>
                </div>
              ))}
              {outlines.length === 0 && (
                <p className="empty-message">暂无大纲，请点击生成大纲</p>
              )}
            </div>
          </div>
        )}

        <div className="main-content">
          {isProjectIdValid ? (
            <>
              {activeView === 'outline' && (
                <div className="outline-view">
                  <h2>大纲管理</h2>
                  {selectedOutline ? (
                    <div className="outline-details">
                      <h3>{selectedOutline.title}</h3>
                      <div className="outline-meta">
                        <p>版本: {selectedOutline.version}</p>
                      </div>
                      <div className="outline-content">
                        {(() => {
                          try {
                            // 尝试解析JSON字符串
                            const parsedContent = JSON.parse(selectedOutline.content);
                            // 检查是否是对象
                            if (typeof parsedContent === 'object' && parsedContent !== null) {
                              // 检查是否有ai_generated_content字段
                              if (parsedContent.ai_generated_content) {
                                // 显示Markdown内容
                                return (
                                  <div className="markdown-content">
                                    <div style={{ 
                                      whiteSpace: 'pre-wrap', 
                                      lineHeight: '1.6',
                                      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
                                      fontSize: '14px'
                                    }}>
                                      {parsedContent.ai_generated_content}
                                    </div>
                                  </div>
                                );
                              } else {
                                // 显示结构化内容
                                return (
                                  <div className="structured-content">
                                    <h4>主线剧情</h4>
                                    <p>{parsedContent.main_plot || '无'}</p>
                                    <h4>次要情节</h4>
                                    <ul>
                                      {parsedContent.sub_plots?.map((plot, index) => (
                                        <li key={index}>{plot}</li>
                                      )) || <li>无</li>}
                                    </ul>
                                    <h4>关键事件</h4>
                                    <ul>
                                      {parsedContent.key_events?.map((event, index) => (
                                        <li key={index}>{event}</li>
                                      )) || <li>无</li>}
                                    </ul>
                                    <h4>角色弧线</h4>
                                    <ul>
                                      {parsedContent.character_arcs?.map((arc, index) => (
                                        <li key={index}>{arc}</li>
                                      )) || <li>无</li>}
                                    </ul>
                                    <h4>主题</h4>
                                    <p>{parsedContent.theme || '无'}</p>
                                    <h4>目标读者</h4>
                                    <p>{parsedContent.target_audience || '无'}</p>
                                    <h4>类型</h4>
                                    <p>{parsedContent.genre || '无'}</p>
                                  </div>
                                );
                              }
                            } else {
                              // 如果不是JSON对象，直接返回原始内容
                              return <pre>{selectedOutline.content}</pre>;
                            }
                          } catch (error) {
                            // 如果解析失败，直接返回原始内容
                            return <pre>{selectedOutline.content}</pre>;
                          }
                        })()}
                      </div>
                      <div className="outline-actions">
                        <button 
                          className="btn btn-primary" 
                          onClick={decomposeOutlineToVolumes}
                        >
                          分解为卷纲
                        </button>
                        <button 
                          className="btn btn-secondary" 
                          onClick={handleOpenOutlineEditModal}
                          disabled={!selectedOutline}
                        >
                          编辑大纲
                        </button>
                        <button 
                          className="btn btn-secondary" 
                          onClick={handleOpenAIChat}
                        >
                          AI修改大纲
                        </button>
                        <button 
                          className="btn btn-danger" 
                          onClick={async () => {
                            try {
                              // 处理 window.confirm 返回 Promise 的情况
                              const confirmed = await window.confirm('确定要删除这个大纲吗？');
                              if (confirmed) {
                                await handleDeleteOutline(selectedOutline.id);
                              }
                            } catch (error) {
                              console.error('处理确认对话框时出错:', error);
                            }
                          }}
                        >
                          删除大纲
                        </button>
                      </div>
                      <div className="visualization-section">
                        <h4>故事可视化</h4>
                        <DataVisualization 
                          type="emotion_curve"
                          data={[
                            { chapter: '1', emotion: 0.2 },
                            { chapter: '2', emotion: 0.3 },
                            { chapter: '3', emotion: 0.8 },
                            { chapter: '4', emotion: 0.6 },
                            { chapter: '5', emotion: 0.9 }
                          ]}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="empty-message">请选择或生成一个大纲</p>
                  )}
                </div>
              )}

              {activeView === 'volume' && (
                <div className="volume-view">
                  <h2>卷纲管理</h2>
                  <div className="volume-cards">
                    {volumes.map(volume => (
                      <div 
                        key={volume.id}
                        className={`volume-card ${selectedVolume?.id === volume.id ? 'selected' : ''}`}
                        onClick={() => handleVolumeSelect(volume)}
                      >
                        <h3>第{volume.order_index}卷: {volume.title}</h3>
                        <div className="volume-info">
                          <p><strong>核心冲突:</strong> {volume.core_conflict}</p>
                          <p><strong>内容:</strong> {volume.content}</p>
                          <p><strong>章节数量:</strong> {volume.chapter_count}章</p>
                        </div>
                        <div className="volume-actions">
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVolumeSelect(volume);
                              decomposeVolumeToChapters();
                            }}
                          >
                            细化章纲
                          </button>
                          <button 
                            className="btn btn-sm btn-secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenVolumeEditModal(volume);
                            }}
                          >
                            编辑卷纲
                          </button>
                        </div>
                      </div>
                    ))}
                    {volumes.length === 0 && (
                      <p className="empty-message">请先选择一个大纲并分解为卷纲</p>
                    )}
                  </div>
                </div>
              )}

              {activeView === 'chapter' && (
                <div className="chapter-view">
                  <div className="chapter-view-header">
                    <h2>章纲管理</h2>
                    {selectedVolume && chapters.length > 0 && chapters.length < selectedVolume.chapter_count && (
                      <button 
                        className="btn btn-primary"
                        onClick={decomposeVolumeToChapters}
                      >
                        继续生成章节
                      </button>
                    )}
                  </div>
                  <div className="chapter-list">
                    {chapters.map(chapter => (
                      <div 
                        key={chapter.id}
                        className={`chapter-item ${selectedChapter?.id === chapter.id ? 'selected' : ''}`}
                        onClick={() => handleChapterSelect(chapter)}
                      >
                        <div className="chapter-header">
                          <h3>第{chapter.order_index}章: {chapter.title}</h3>
                          <span className="word-count">约{chapter.word_count_estimate}字</span>
                        </div>
                        <div className="chapter-details">
                          <p><strong>核心事件:</strong> {chapter.core_event}</p>
                          <p><strong>情绪目标:</strong> {chapter.emotional_goal}</p>
                        </div>
                      </div>
                    ))}
                    {chapters.length === 0 && (
                      <p className="empty-message">请先选择一个卷纲并细化为章纲</p>
                    )}
                  </div>
                  {selectedChapter && (
                    <div className="chapter-evaluation">
                      <h3>章纲评估</h3>
                      <div className="evaluation-metrics">
                        <div className="metric">
                          <span className="metric-name">功能分布</span>
                          <div className="metric-value">
                            <div className="progress-bar">
                              <div className="progress" style={{ width: '70%' }}>主线推进 70%</div>
                            </div>
                            <div className="progress-bar">
                              <div className="progress" style={{ width: '20%' }}>人物塑造 20%</div>
                            </div>
                            <div className="progress-bar">
                              <div className="progress" style={{ width: '10%' }}>伏笔设置 10%</div>
                            </div>
                          </div>
                        </div>
                        <div className="metric">
                          <span className="metric-name">节奏评估</span>
                          <span className="metric-value good">合理</span>
                        </div>
                        <div className="metric">
                          <span className="metric-name">冲突密度</span>
                          <span className="metric-value medium">适中</span>
                        </div>
                        <div className="metric">
                          <span className="metric-name">角色出场</span>
                          <span className="metric-value good">均衡</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>

        {isProjectIdValid && (
          <div className="right-sidebar">
            <div className="project-info">
              <h3>项目信息</h3>
              {projectInfo ? (
                <div className="project-info-content">
                  <p><strong>标题:</strong> {projectInfo.title}</p>
                  <p><strong>类型:</strong> {projectInfo.genre}</p>
                  <p><strong>核心主题:</strong> {projectInfo.core_theme}</p>
                  <p><strong>一句话梗概:</strong> {projectInfo.synopsis}</p>
                  <p><strong>创作风格:</strong> {projectInfo.writing_style}</p>
                  <p><strong>参考作品:</strong> {projectInfo.reference_works}</p>
                  <p><strong>目标读者:</strong> {projectInfo.target_audience}</p>
                  <p><strong>每日目标:</strong> {projectInfo.daily_word_goal} 字</p>
                  <p><strong>总目标:</strong> {projectInfo.total_word_goal} 字</p>
                  <p><strong>预计完成时间:</strong> {projectInfo.estimated_completion_date}</p>
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={handleOpenEditModal}
                    style={{ marginTop: '12px' }}
                  >
                    编辑项目信息
                  </button>
                </div>
              ) : (
                <p>加载项目信息中...</p>
              )}
            </div>
            <div className="related-settings">
              <h3>相关设定</h3>
              <p>显示与当前选中元素相关的设定</p>
            </div>
            <div className="ai-suggestions">
              <h3>智能建议</h3>
              <p>基于当前大纲的AI建议</p>
            </div>
            <div className="outline-architect">
              <h3>故事大纲架构师配置</h3>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={handleOpenArchitectManager}
                style={{ marginBottom: '12px' }}
              >
                选择故事大纲架构师
              </button>
              <p>选择不同风格的故事大纲架构师</p>
              {selectedArchitect && (
                <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                  当前架构师: {selectedArchitect.name}
                </p>
              )}
            </div>
            <div className="system-prompt">
              <h3>大纲结构系统提示词</h3>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={handleOpenWorldviewStructureConfig}
                style={{ marginBottom: '12px' }}
              >
                配置大纲结构
              </button>
              <p>定义大纲文本的构成结构</p>
            </div>
            <div className="history">
              <h3>操作历史</h3>
              <p>最近的操作记录</p>
            </div>
          </div>
        )}
      </div>

      {/* 编辑项目信息模态框 */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>编辑项目信息</h3>
            <form className="project-edit-form">
              <div className="form-group">
                <label htmlFor="title">标题:</label>
                <input 
                  type="text" 
                  id="title" 
                  name="title" 
                  value={editFormData.title || ''} 
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="genre">类型:</label>
                <input 
                  type="text" 
                  id="genre" 
                  name="genre" 
                  value={editFormData.genre || ''} 
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="core_theme">核心主题:</label>
                <textarea 
                  id="core_theme" 
                  name="core_theme" 
                  value={editFormData.core_theme || ''} 
                  onChange={handleFormChange}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label htmlFor="synopsis">一句话梗概:</label>
                <input 
                  type="text" 
                  id="synopsis" 
                  name="synopsis" 
                  value={editFormData.synopsis || ''} 
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="writing_style">创作风格:</label>
                <input 
                  type="text" 
                  id="writing_style" 
                  name="writing_style" 
                  value={editFormData.writing_style || ''} 
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="reference_works">参考作品:</label>
                <input 
                  type="text" 
                  id="reference_works" 
                  name="reference_works" 
                  value={editFormData.reference_works || ''} 
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="target_audience">目标读者:</label>
                <input 
                  type="text" 
                  id="target_audience" 
                  name="target_audience" 
                  value={editFormData.target_audience || ''} 
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="daily_word_goal">每日目标:</label>
                <input 
                  type="number" 
                  id="daily_word_goal" 
                  name="daily_word_goal" 
                  value={editFormData.daily_word_goal || ''} 
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="total_word_goal">总目标:</label>
                <input 
                  type="number" 
                  id="total_word_goal" 
                  name="total_word_goal" 
                  value={editFormData.total_word_goal || ''} 
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="estimated_completion_date">预计完成时间:</label>
                <input 
                  type="date" 
                  id="estimated_completion_date" 
                  name="estimated_completion_date" 
                  value={editFormData.estimated_completion_date || ''} 
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCloseEditModal}>
                  取消
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSaveProjectInfo}>
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI大纲修改对话窗口 */}
      {isAIChatOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '600px', maxWidth: '90%' }}>
            <div className="modal-header">
              <h3>AI大纲修改助手</h3>
              <button className="close-btn" onClick={handleCloseAIChat}>&times;</button>
            </div>
            <div className="chat-messages" style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '16px' }}>
              {chatMessages.map((message, index) => (
                <div key={index} className={`message ${message.role}`}>
                  <div className="message-content">{message.content}</div>
                </div>
              ))}
            </div>
            <div className="chat-input-area">
              <textarea 
                value={chatInput} 
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="请输入您的修改请求..."
                rows={3}
                style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  className="btn btn-primary"
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim()}
                >
                  发送
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 系统提示词配置窗口 */}
      {isSystemPromptOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '700px', maxWidth: '90%' }}>
            <div className="modal-header">
              <h3>系统提示词配置</h3>
              <button className="close-btn" onClick={handleCloseSystemPrompt}>&times;</button>
            </div>
            <div className="system-prompt-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <p>请编辑AI生成大纲功能的系统提示词：</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={handleOpenArchitectManager}
                    title="选择故事大纲架构师"
                  >
                    故事大纲架构师
                  </button>
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={handleOpenWorldviewStructureConfig}
                    title="配置大纲结构"
                  >
                    大纲结构配置
                  </button>
                </div>
              </div>
              <textarea 
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={12}
                style={{ width: '100%', padding: '8px', marginBottom: '16px', fontFamily: 'monospace', fontSize: '14px' }}
              />
              {selectedArchitect && (
                <div style={{ 
                  marginBottom: '16px', 
                  padding: '10px', 
                  backgroundColor: '#e3f2fd', 
                  border: '1px solid #bbdefb', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#1976d2'
                }}>
                  当前故事大纲架构师：{selectedArchitect.name}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button 
                  className="btn btn-secondary"
                  onClick={handleCloseSystemPrompt}
                >
                  取消
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleSaveSystemPrompt}
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 故事大纲架构师管理器模态框 */}
      {isArchitectManagerOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '800px', maxWidth: '90%' }}>
            <div className="modal-header">
              <h3>故事大纲架构师管理</h3>
              <button className="close-btn" onClick={handleCloseArchitectManager}>&times;</button>
            </div>
            <div className="architect-manager-content">
              {/* 架构师列表 */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4>故事大纲架构师</h4>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={handleAddArchitect}
                  >
                    添加架构师
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                  {worldviewArchitects.map(architect => (
                    <div key={architect.id} style={{ 
                      padding: '16px', 
                      border: '1px solid #ddd', 
                      borderRadius: '6px', 
                      backgroundColor: selectedArchitect?.id === architect.id ? '#e3f2fd' : '#f8f9fa',
                      borderColor: selectedArchitect?.id === architect.id ? '#bbdefb' : '#ddd'
                    }}>
                      {editingArchitect?.id === architect.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div>
                            <input 
                              type="text" 
                              value={architectEditFormData.name} 
                              onChange={(e) => setArchitectEditFormData(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="架构师名称"
                              style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #ddd', width: '100%', marginBottom: '8px' }}
                            />
                            <input 
                              type="text" 
                              value={architectEditFormData.description} 
                              onChange={(e) => setArchitectEditFormData(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="架构师描述"
                              style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #ddd', width: '100%', marginBottom: '8px' }}
                            />
                            <textarea 
                              value={architectEditFormData.prompt} 
                              onChange={(e) => setArchitectEditFormData(prev => ({ ...prev, prompt: e.target.value }))}
                              placeholder="提示词内容"
                              rows={4}
                              style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #ddd', width: '100%', fontFamily: 'monospace', fontSize: '12px' }}
                            />
                          </div>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button 
                              className="btn btn-sm btn-secondary"
                              onClick={handleCancelEditArchitect}
                            >
                              取消
                            </button>
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={handleSaveEditArchitect}
                            >
                              保存
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <div>
                              <h5 style={{ margin: '0 0 4px 0', color: '#333' }}>{architect.name}</h5>
                              <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>{architect.description}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                className="btn btn-sm btn-secondary"
                                onClick={() => handleEditArchitect(architect)}
                              >
                                编辑
                              </button>
                              <button 
                                className="btn btn-sm btn-primary"
                                onClick={() => handleSelectArchitect(architect)}
                              >
                                选择
                              </button>
                              <button 
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDeleteArchitect(architect.id)}
                              >
                                删除
                              </button>
                            </div>
                          </div>
                          <div style={{ 
                            fontSize: '12px', 
                            lineHeight: '1.4', 
                            color: '#555',
                            maxHeight: '80px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'pre-wrap'
                          }}>
                            {architect.prompt}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 使用说明 */}
              <div style={{ padding: '16px', backgroundColor: '#f1f3f4', borderRadius: '6px' }}>
                <h5 style={{ margin: '0 0 8px 0' }}>使用说明</h5>
                <ul style={{ margin: '0', fontSize: '13px', lineHeight: '1.5' }}>
                  <li>选择一个架构师来定义故事大纲的创作风格</li>
                  <li>每个架构师专注于不同类型的故事大纲构建</li>
                  <li>可以编辑现有架构师或创建新的架构师</li>
                  <li>架构师的提示词会影响AI生成故事大纲的风格和特点</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 大纲结构系统提示词配置模态框 */}
      {isWorldviewStructureConfigOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '700px', maxWidth: '90%' }}>
            <div className="modal-header">
              <h3>大纲结构系统提示词配置</h3>
              <button className="close-btn" onClick={handleCloseWorldviewStructureConfig}>&times;</button>
            </div>
            <div className="outline-structure-content">
              <p style={{ marginBottom: '16px' }}>请定义故事大纲文本的构成结构：</p>
              <textarea 
                value={worldviewStructurePrompt}
                onChange={(e) => setWorldviewStructurePrompt(e.target.value)}
                rows={15}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  marginBottom: '16px', 
                  fontFamily: 'monospace', 
                  fontSize: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button 
                  className="btn btn-secondary"
                  onClick={handleCloseWorldviewStructureConfig}
                >
                  取消
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleSaveWorldviewStructureConfig}
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* 大纲编辑模态框 */}
      {isOutlineEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '800px', maxWidth: '90%' }}>
            <div className="modal-header">
              <h3>编辑大纲</h3>
              <button className="close-btn" onClick={() => setIsOutlineEditModalOpen(false)}>&times;</button>
            </div>
            <div className="outline-edit-content">
              <form className="outline-edit-form">
                <div className="form-group">
                  <label htmlFor="outline-title">标题:</label>
                  <input 
                    type="text" 
                    id="outline-title" 
                    name="title" 
                    value={outlineEditFormData.title || ''} 
                    onChange={(e) => setOutlineEditFormData(prev => ({ ...prev, title: e.target.value }))}
                    style={{ width: '100%', padding: '8px' }}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="outline-content">内容:</label>
                  <textarea 
                    id="outline-content" 
                    name="content" 
                    value={outlineEditFormData.content || ''} 
                    onChange={(e) => setOutlineEditFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={15}
                    style={{ width: '100%', padding: '8px', fontFamily: 'monospace' }}
                  />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setIsOutlineEditModalOpen(false)}>
                    取消
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleSaveOutlineEdit}>
                    保存
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 卷纲编辑模态框 */}
      {isVolumeEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '800px', maxWidth: '90%' }}>
            <div className="modal-header">
              <h3>编辑卷纲</h3>
              <button className="close-btn" onClick={handleCloseVolumeEditModal}>&times;</button>
            </div>
            <div className="volume-edit-content">
              <form className="volume-edit-form">
                <div className="form-group">
                  <label htmlFor="volume-title">标题:</label>
                  <input 
                    type="text" 
                    id="volume-title" 
                    name="title" 
                    value={volumeEditFormData.title || ''} 
                    onChange={(e) => setVolumeEditFormData(prev => ({ ...prev, title: e.target.value }))}
                    style={{ width: '100%', padding: '8px' }}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="volume-core-conflict">核心冲突:</label>
                  <textarea 
                    id="volume-core-conflict" 
                    name="core_conflict" 
                    value={volumeEditFormData.core_conflict || ''} 
                    onChange={(e) => setVolumeEditFormData(prev => ({ ...prev, core_conflict: e.target.value }))}
                    rows={3}
                    style={{ width: '100%', padding: '8px' }}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="volume-content">内容:</label>
                  <textarea 
                    id="volume-content" 
                    name="content" 
                    value={volumeEditFormData.content || ''} 
                    onChange={(e) => setVolumeEditFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={5}
                    style={{ width: '100%', padding: '8px' }}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="volume-chapter-count">章节数量:</label>
                  <input 
                    type="number" 
                    id="volume-chapter-count" 
                    name="chapter_count" 
                    min="1" 
                    max="20" 
                    value={volumeEditFormData.chapter_count || 6} 
                    onChange={(e) => setVolumeEditFormData(prev => ({ ...prev, chapter_count: parseInt(e.target.value) }))}
                    style={{ width: '100%', padding: '8px' }}
                  />
                </div>
                {volumeEditFormData.key_events && (
                  <div className="form-group">
                    <label>关键事件:</label>
                    <div>
                      {volumeEditFormData.key_events.map((event, index) => (
                        <div key={index} style={{ marginBottom: '8px' }}>
                          <input 
                            type="text" 
                            value={event} 
                            onChange={(e) => {
                              const newKeyEvents = [...volumeEditFormData.key_events];
                              newKeyEvents[index] = e.target.value;
                              setVolumeEditFormData(prev => ({ ...prev, key_events: newKeyEvents }));
                            }} 
                            style={{ width: '100%', padding: '8px' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {volumeEditFormData.character_development && (
                  <div className="form-group">
                    <label htmlFor="volume-character-development">角色发展:</label>
                    <textarea 
                      id="volume-character-development" 
                      name="character_development" 
                      value={volumeEditFormData.character_development || ''} 
                      onChange={(e) => setVolumeEditFormData(prev => ({ ...prev, character_development: e.target.value }))}
                      rows={3}
                      style={{ width: '100%', padding: '8px' }}
                    />
                  </div>
                )}
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseVolumeEditModal}>
                    取消
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleSaveVolumeEdit}>
                    保存
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}




    </div>
  );
};

// 使用React.memo避免不必要的重复渲染
export default React.memo(BlueprintPage, (prevProps, nextProps) => {
  // 只有当projectId真正变化时才重新渲染
  return prevProps.projectId === nextProps.projectId;
});

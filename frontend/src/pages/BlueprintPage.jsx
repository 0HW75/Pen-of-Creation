import React, { useState, useEffect } from 'react';
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
  
  // 计算projectId是否有效
  const isProjectIdValid = projectId !== null && projectId !== undefined && projectId !== '';
  console.log('BlueprintPage - projectId有效性检查:', {
    projectId: projectId,
    type: typeof projectId,
    isProjectIdValid: isProjectIdValid
  });

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
    console.log('BlueprintPage - 检查是否加载大纲，isProjectIdValid:', isProjectIdValid);
    if (isProjectIdValid) {
      loadProjectOutline();
      loadProjectInfo();
    }
  }, [projectId, isProjectIdValid]);

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
    try {
      // 检查是否有项目信息
      if (!projectInfo) {
        await loadProjectInfo();
      }
      
      const response = await blueprintApi.generateOutline({
        project_id: projectId,
        story_model: 'hero_journey',
        params: {
          detail_level: 'medium',
          style: 'epic'
        },
        // 添加项目信息，使AI能够根据项目信息生成大纲
        project_info: projectInfo
      });
      setOutlines([...outlines, response.data]);
      setSelectedOutline(response.data);
      setError(null);
    } catch (err) {
      setError('生成大纲失败');
      console.error('生成大纲失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 分解大纲为卷纲
  const decomposeOutlineToVolumes = async () => {
    if (selectedOutline) {
      setIsLoading(true);
      try {
        const response = await blueprintApi.decomposeOutline(selectedOutline.id);
        setVolumes(response.data);
        setActiveView('volume');
        setError(null);
      } catch (err) {
        setError('分解卷纲失败');
        console.error('分解卷纲失败:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 分解卷纲为章纲
  const decomposeVolumeToChapters = async () => {
    if (selectedVolume) {
      setIsLoading(true);
      try {
        const response = await blueprintApi.decomposeVolume(selectedVolume.id);
        setChapters(response.data);
        setActiveView('chapter');
        setError(null);
      } catch (err) {
        setError('分解章纲失败');
        console.error('分解章纲失败:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 切换视图
  const handleViewChange = (view) => {
    setActiveView(view);
    if (view === 'volume' && selectedOutline) {
      loadVolumes();
    } else if (view === 'chapter' && selectedVolume) {
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
    setSystemPrompt(`你是一个专业的故事大纲生成助手，你的任务是根据用户提供的项目信息生成高质量的故事大纲。\n\n请遵循以下要求：\n1. 分析项目信息，理解故事的核心主题、类型和目标读者\n2. 根据项目信息生成符合类型特点的大纲\n3. 大纲应包含主线剧情、次要情节、关键事件、角色弧线和主题\n4. 确保大纲结构合理，节奏紧凑，冲突明确\n5. 使用专业的写作术语，保持语言流畅自然\n6. 根据用户的具体要求进行调整\n\n请生成一个完整的故事大纲，格式清晰，内容丰富。`);
    setIsSystemPromptOpen(true);
  };

  // 关闭系统提示词配置窗口
  const handleCloseSystemPrompt = () => {
    setIsSystemPromptOpen(false);
  };

  // 保存系统提示词
  const handleSaveSystemPrompt = () => {
    // 这里应该调用API保存系统提示词
    // 暂时只在控制台输出
    console.log('保存系统提示词:', systemPrompt);
    setIsSystemPromptOpen(false);
  };

  // 添加debug日志，检查projectId的类型和值
  useEffect(() => {
    console.log('BlueprintPage debug - projectId详细信息:', {
      value: projectId,
      type: typeof projectId,
      isNull: projectId === null,
      isUndefined: projectId === undefined,
      isEmptyString: projectId === '',
      isFalsy: !projectId,
      condition1: projectId === null || projectId === undefined || projectId === '',
      condition2: projectId !== null && projectId !== undefined && projectId !== ''
    });
  }, [projectId]);

  return (
    <div className="blueprint-page">
      <div className="blueprint-header">
        <h1>故事蓝图</h1>
        <div className="header-actions">
          <button 
            className="btn btn-primary" 
            onClick={generateOutline}
            disabled={isLoading || !isProjectIdValid}
          >
            {isLoading ? '生成中...' : '生成大纲'}
          </button>
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

      {!isProjectIdValid ? (
        <div className="error-message">
          请先选择一个项目，然后再使用故事蓝图功能
        </div>
      ) : null}

      <div className="blueprint-content">
        <div className="sidebar">
          <h3>大纲结构</h3>
          <div className="outline-tree">
            {isProjectIdValid ? (
              <>
                {console.log('BlueprintPage - 显示大纲列表，projectId:', projectId)}
                {outlines.map(outline => (
                  <div 
                    key={outline.id}
                    className={`outline-item ${selectedOutline?.id === outline.id ? 'selected' : ''}`}
                  >
                    <div onClick={() => handleOutlineSelect(outline)} style={{ cursor: 'pointer' }}>
                      <h4>{outline.title}</h4>
                      <p>版本: {outline.version}</p>
                      <p>模型: {outline.story_model}</p>
                    </div>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={async (e) => {
                        e.stopPropagation(); // 阻止事件冒泡
                        console.log('点击侧边栏删除按钮');
                        try {
                          // 处理 window.confirm 返回 Promise 的情况
                          const confirmed = await window.confirm('确定要删除这个大纲吗？');
                          console.log('用户确认结果:', confirmed);
                          if (confirmed) {
                            console.log('执行删除操作，大纲ID:', outline.id);
                            await handleDeleteOutline(outline.id);
                          } else {
                            console.log('用户取消删除操作');
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
              </>
            ) : (
              <>
                {console.log('BlueprintPage - 显示请选择项目提示，projectId:', projectId)}
                <p className="empty-message">请先选择一个项目</p>
              </>
            )}
          </div>
        </div>

        <div className="main-content">
          {isProjectIdValid ? (
            <>
              {console.log('BlueprintPage - 显示主内容，projectId:', projectId)}
              {activeView === 'outline' && (
                <div className="outline-view">
                  <h2>大纲管理</h2>
                  {selectedOutline ? (
                    <div className="outline-details">
                      <h3>{selectedOutline.title}</h3>
                      <div className="outline-meta">
                        <p>故事模型: {selectedOutline.story_model}</p>
                        <p>版本: {selectedOutline.version}</p>
                      </div>
                      <div className="outline-content">
                        <pre>{(() => {
                          try {
                            // 尝试解析JSON字符串
                            const parsedContent = JSON.parse(selectedOutline.content);
                            // 检查是否是对象
                            if (typeof parsedContent === 'object' && parsedContent !== null) {
                              // 格式化JSON，使其更易读
                              return JSON.stringify(parsedContent, null, 2);
                            } else {
                              // 如果不是JSON对象，直接返回原始内容
                              return selectedOutline.content;
                            }
                          } catch (error) {
                            // 如果解析失败，直接返回原始内容
                            return selectedOutline.content;
                          }
                        })()}</pre>
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
                          onClick={() => console.log('编辑大纲')}
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
                            console.log('点击删除大纲按钮');
                            try {
                              // 处理 window.confirm 返回 Promise 的情况
                              const confirmed = await window.confirm('确定要删除这个大纲吗？');
                              console.log('用户确认结果:', confirmed);
                              if (confirmed) {
                                console.log('执行删除操作，大纲ID:', selectedOutline.id);
                                await handleDeleteOutline(selectedOutline.id);
                              } else {
                                console.log('用户取消删除操作');
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
                  <h2>章纲管理</h2>
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
          ) : (
            <>
              {console.log('BlueprintPage - 显示主内容中的请选择项目提示，projectId:', projectId)}
              <div className="outline-view">
                <h2>大纲管理</h2>
                <p className="empty-message">请先选择一个项目，然后再使用故事蓝图功能</p>
              </div>
            </>
          )}
        </div>

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
          <div className="system-prompt">
            <h3>系统提示词配置</h3>
            <button 
              className="btn btn-sm btn-secondary"
              onClick={handleOpenSystemPrompt}
              style={{ marginBottom: '12px' }}
            >
              配置系统提示词
            </button>
            <p>定义AI生成大纲的系统提示词</p>
          </div>
          <div className="history">
            <h3>操作历史</h3>
            <p>最近的操作记录</p>
          </div>
        </div>
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
              <p>请编辑AI生成大纲功能的系统提示词：</p>
              <textarea 
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={10}
                style={{ width: '100%', padding: '8px', marginBottom: '16px' }}
              />
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
    </div>
  );
};

export default BlueprintPage;

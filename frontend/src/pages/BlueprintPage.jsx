import React, { useState, useEffect } from 'react';
import { useBlueprintManagement } from '../hooks/useBlueprintManagement';
import OutlineTree from '../components/OutlineTree';
import StreamingOutput from '../components/StreamingOutput';
import OutlineGenerationConfig from '../components/OutlineGenerationConfig';
import VolumeGenerationConfig from '../components/VolumeGenerationConfig';
import VolumeDetailEditor from '../components/VolumeDetailEditor';
import ChapterDetailEditor from '../components/ChapterDetailEditor';
import ChapterGenerationConfig from '../components/ChapterGenerationConfig';
import AIChat from '../components/AIChat';
import DataVisualization from '../components/DataVisualization';
import AIVersionManager from '../components/AIVersionManager';
import OutlineContentRenderer from '../components/OutlineContentRenderer';
import { HistoryOutlined, SettingOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Space, message } from 'antd';
import './BlueprintPage.css';

const BlueprintPage = ({ projectId }) => {
  const {
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
    loadProjectOutline,
    
    // 状态设置函数
    setChatInput,
    setSystemPrompt,
    setWorldviewStructurePrompt,
    setArchitectEditFormData,
    setEditFormData,
    setOutlineEditFormData,
    setVolumeEditFormData,
    setVolumes,
    setSelectedVolume,
    
    // 方法
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
  } = useBlueprintManagement(projectId);

  // AI版本管理状态
  const [isVersionManagerOpen, setIsVersionManagerOpen] = useState(false);
  const [versionEntityType, setVersionEntityType] = useState('');
  const [versionEntityId, setVersionEntityId] = useState(null);

  // 卷纲生成默认配置
  const defaultVolumeConfig = {
    minVolumes: 3,
    maxVolumes: 5,
    minChapters: 5,
    maxChapters: 8,
    maxTokens: 4000,
    temperature: 0.7,
    useArchitectPrompt: true,
    combinePrompts: true,
    incrementalMode: true
  };

  // 卷纲生成配置状态
  const [isVolumeConfigOpen, setIsVolumeConfigOpen] = useState(false);
  const [volumeConfig, setVolumeConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('volumeGenerationConfig');
      if (saved) {
        const parsed = JSON.parse(saved);
        // 合并保存的配置和默认配置，确保所有字段都存在
        return { ...defaultVolumeConfig, ...parsed };
      }
      return defaultVolumeConfig;
    } catch (e) {
      console.error('读取卷纲配置失败:', e);
      localStorage.removeItem('volumeGenerationConfig');
      return defaultVolumeConfig;
    }
  });

  // 保存卷纲配置到localStorage
  const handleSaveVolumeConfig = (config) => {
    setVolumeConfig(config);
    localStorage.setItem('volumeGenerationConfig', JSON.stringify(config));
  };

  // 章纲生成默认配置
  const defaultChapterConfig = {
    systemPrompt: '你是一位专业的小说章节规划师，擅长将卷纲分解为精彩的章节大纲。请严格控制输出内容的长度，确保JSON格式完整。',
    userPromptTemplate: `请根据以下信息，生成当前章纲：

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
   - 主要内容概述（5-8句话，每句话不超过30字，总字数不超过150字）
   - 出场人物（只列出重点人物：主角和主要配角，不要列出无名成员，每个角色名称不超过20字）
   - 场景设置（数组形式，每条一句话，不要太详细）
   - 情感目标（1句话描述本章要传达的情感）
   - 关键词（3-5个关键词）
   - 预估字数：{{minWords}}-{{maxWords}}字
2. 确保与卷纲和前文章节连贯
3. **重要格式要求**：
   - 必须输出合法的JSON格式
   - 使用英文双引号，不要用中文引号
   - 不要使用三引号
   - 字符串中的换行用\\n表示
   - characters、scenes、keywords 是字符串数组
   - core_event 是字符串数组
   - **严格控制内容长度，总字数不超过300字，避免输出过长导致JSON截断**
4. 输出字段：id、title、core_event（数组）、content、scenes（数组）、characters（数组）、emotional_goal、keywords（数组）、word_count_estimate、order_index

请直接输出合法的JSON，不要包含其他文字或markdown代码块标记！`,
    minChapters: 5,
    maxChapters: 10,
    minWords: 2000,
    maxWords: 5000,
    maxTokens: 8000,
    temperature: 0.7,
    useArchitectPrompt: true,
    combinePrompts: true,
    incrementalMode: true
  };

  // 章纲生成配置状态
  const [isChapterConfigOpen, setIsChapterConfigOpen] = useState(false);
  const [chapterConfig, setChapterConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('chapterGenerationConfig');
      if (saved) {
        const parsed = JSON.parse(saved);
        // 合并保存的配置和默认配置，确保所有字段都存在（特别是新添加的字段）
        return { ...defaultChapterConfig, ...parsed };
      }
      return defaultChapterConfig;
    } catch (e) {
      console.error('读取章纲配置失败:', e);
      localStorage.removeItem('chapterGenerationConfig');
      return defaultChapterConfig;
    }
  });

  // 保存章纲配置到localStorage
  const handleSaveChapterConfig = (config) => {
    setChapterConfig(config);
    localStorage.setItem('chapterGenerationConfig', JSON.stringify(config));
  };

  // 大纲生成配置状态
  const [isOutlineConfigOpen, setIsOutlineConfigOpen] = useState(false);
  const [outlineConfig, setOutlineConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('outlineGenerationConfig');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('读取大纲配置失败:', e);
      localStorage.removeItem('outlineGenerationConfig');
      return null;
    }
  });

  // 保存大纲配置到localStorage
  const handleSaveOutlineConfig = (config) => {
    setOutlineConfig(config);
    localStorage.setItem('outlineGenerationConfig', JSON.stringify(config));
  };

  // 卷纲编辑状态
  const [isVolumeEditMode, setIsVolumeEditMode] = useState(false);

  // 保存卷纲详情
  const handleSaveVolumeDetail = async (updatedVolume) => {
    try {
      const response = await fetch(`http://localhost:5000/api/volumes/${updatedVolume.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedVolume)
      });

      if (response.ok) {
        // 更新本地状态
        setVolumes(volumes.map(v => v.id === updatedVolume.id ? updatedVolume : v));
        setSelectedVolume(updatedVolume);
        setIsVolumeEditMode(false);
        console.log('卷纲更新成功');
      } else {
        console.error('保存卷纲失败:', await response.text());
      }
    } catch (error) {
      console.error('保存卷纲失败:', error);
    }
  };

  // 章纲编辑状态
  const [isChapterEditMode, setIsChapterEditMode] = useState(false);

  // 保存章纲详情
  const handleSaveChapterDetail = async (updatedChapter) => {
    try {
      const response = await fetch(`http://localhost:5000/api/chapters/${updatedChapter.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedChapter)
      });

      if (response.ok) {
        // 更新本地状态
        setSelectedChapter(updatedChapter);
        // 刷新章节列表
        handleVolumeSelect(selectedVolume);
        setIsChapterEditMode(false);
        message.success('章纲保存成功');
      } else {
        message.error('保存章纲失败');
      }
    } catch (error) {
      console.error('保存章纲失败:', error);
      message.error('保存章纲失败');
    }
  };

  const handleOpenVersionManager = (entityType, entity) => {
    setVersionEntityType(entityType);
    setVersionEntityId(entity?.id);
    setIsVersionManagerOpen(true);
  };

  const handleCloseVersionManager = () => {
    setIsVersionManagerOpen(false);
    setVersionEntityType('');
    setVersionEntityId(null);
  };

  const handleVersionApplied = () => {
    // 刷新数据
    loadProjectOutline();
  };

  const handleArchitectFormChange = (e) => {
    const { name, value } = e.target;
    setArchitectEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="blueprint-page">
      <div className="blueprint-header">
        <h1>故事蓝图</h1>
        <div className="header-actions">
          {/* 第一行：主要操作按钮 */}
          <div className="button-group action-group">
            <span className="group-label">主要操作</span>
            <div className="button-row">
              <button 
                className="btn btn-primary" 
                onClick={() => generateOutline(outlineConfig)}
                disabled={isLoading || !isProjectIdValid}
              >
                {isLoading ? '生成中...' : '生成大纲'}
              </button>
              {selectedOutline && (
                <button 
                  className="btn btn-primary" 
                  onClick={() => decomposeOutlineToVolumes(volumeConfig)}
                  disabled={isLoading}
                >
                  分解为卷纲
                </button>
              )}
              {selectedVolume && (
                <button 
                  className="btn btn-primary" 
                  onClick={() => decomposeVolumeToChapters(chapterConfig)}
                  disabled={isLoading}
                >
                  分解为章纲
                </button>
              )}
              {selectedOutline && (
                <button 
                  className="btn btn-secondary" 
                  onClick={handleOpenAIChat}
                >
                  AI修改助手
                </button>
              )}
            </div>
          </div>

          {/* 第三行：配置按钮 */}
          <div className="button-group config-group">
            <span className="group-label">配置</span>
            <div className="button-row">
              <Button 
                type="primary"
                icon={<SettingOutlined />}
                onClick={() => setIsOutlineConfigOpen(true)}
                className="btn-outline-config"
              >
                大纲配置
              </Button>
              {selectedOutline && (
                <Button 
                  type="primary"
                  icon={<SettingOutlined />}
                  onClick={() => setIsVolumeConfigOpen(true)}
                  className="btn-volume-config"
                >
                  卷纲配置
                </Button>
              )}
              {selectedVolume && (
                <Button 
                  type="primary"
                  icon={<SettingOutlined />}
                  onClick={() => setIsChapterConfigOpen(true)}
                  className="btn-chapter-config"
                >
                  章纲配置
                </Button>
              )}
              {(selectedOutline || selectedVolume || selectedChapter) && (
                <Button 
                  type="primary"
                  icon={<HistoryOutlined />}
                  onClick={() => {
                    if (selectedChapter) {
                      handleOpenVersionManager('chapter', selectedChapter);
                    } else if (selectedVolume) {
                      handleOpenVersionManager('volume', selectedVolume);
                    } else if (selectedOutline) {
                      handleOpenVersionManager('outline', selectedOutline);
                    }
                  }}
                  className="btn-version-manage"
                >
                  版本管理
                </Button>
              )}
            </div>
          </div>

          {/* 第四行：工具按钮 */}
          <div className="button-group tool-group">
            <span className="group-label">工具</span>
            <div className="button-row">
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
      <StreamingOutput 
        isStreaming={isStreaming}
        streamingOutput={streamingOutput}
        title="大纲生成中..."
        onStop={stopGeneration}
      />

      <div className="blueprint-content">
        {!isProjectIdValid && (
          <div className="error-message">
            [蓝图页] 请先选择一个项目，然后再使用故事蓝图功能
          </div>
        )}

        {isProjectIdValid && (
          <>
            <div className="sidebar">
              <h3>大纲结构</h3>
              <OutlineTree 
                outlines={outlines}
                volumes={volumes}
                chapters={chapters}
                selectedOutline={selectedOutline}
                selectedVolume={selectedVolume}
                selectedChapter={selectedChapter}
                onOutlineSelect={handleOutlineSelect}
                onVolumeSelect={handleVolumeSelect}
                onChapterSelect={handleChapterSelect}
                onDeleteOutline={handleDeleteOutline}
                onDeleteVolume={handleDeleteVolume}
                onDeleteChapter={handleDeleteChapter}
              />
            </div>

            <div className="main-content">
              {activeView === 'outline' && selectedOutline && (
                <div className="outline-detail">
                  <h3>{selectedOutline.title}</h3>
                  <div className="content-section">
                    <div className="content-text">
                      <OutlineContentRenderer
                        content={selectedOutline.content}
                        viewMode="card"
                      />
                    </div>
                  </div>
                  <DataVisualization
                    type="outline"
                    data={selectedOutline}
                  />
                </div>
              )}

              {activeView === 'volume' && selectedVolume && (
                <div className="volume-detail">
                  <div className="volume-header-actions">
                    <h3>{selectedVolume.title}</h3>
                    <Button 
                      type="primary" 
                      icon={<EditOutlined />}
                      onClick={() => setIsVolumeEditMode(true)}
                    >
                      编辑卷纲
                    </Button>
                  </div>
                  
                  {isVolumeEditMode ? (
                    <VolumeDetailEditor
                      volume={selectedVolume}
                      onSave={handleSaveVolumeDetail}
                      onCancel={() => setIsVolumeEditMode(false)}
                    />
                  ) : (
                    <>
                      <div className="volume-info-section">
                        <div className="info-item">
                          <h4>核心冲突</h4>
                          <p>{selectedVolume.core_conflict || '暂无'}</p>
                        </div>
                        
                        <div className="info-item">
                          <h4>主要内容</h4>
                          <div className="content-text">
                            <OutlineContentRenderer
                              content={selectedVolume.content}
                              viewMode="card"
                            />
                          </div>
                        </div>
                        
                        <div className="info-item">
                          <h4>角色发展</h4>
                          <p>{selectedVolume.character_development || '暂无'}</p>
                        </div>
                        
                        <div className="info-item">
                          <h4>关键事件</h4>
                          {selectedVolume.key_events && selectedVolume.key_events.length > 0 ? (
                            <ul>
                              {selectedVolume.key_events.map((event, index) => (
                                <li key={index}>{event}</li>
                              ))}
                            </ul>
                          ) : (
                            <p style={{ color: '#999' }}>暂无关键事件</p>
                          )}
                        </div>
                        
                        <div className="info-item">
                          <h4>章节数量</h4>
                          <p>{selectedVolume.chapter_count || 0} 章</p>
                        </div>
                      </div>
                      
                      <DataVisualization 
                        type="volume"
                        data={selectedVolume}
                      />
                    </>
                  )}
                </div>
              )}

              {activeView === 'chapter' && selectedChapter && (
                <div className="chapter-detail">
                  <div className="chapter-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3>{selectedChapter.title}</h3>
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={() => setIsChapterEditMode(true)}
                    >
                      编辑章纲
                    </Button>
                  </div>

                  {isChapterEditMode ? (
                    <ChapterDetailEditor
                      chapter={selectedChapter}
                      onSave={handleSaveChapterDetail}
                      onCancel={() => setIsChapterEditMode(false)}
                    />
                  ) : (
                    <>
                      <div className="content-section">
                        <div className="content-text">
                          <OutlineContentRenderer
                            chapterData={selectedChapter}
                          />
                        </div>
                      </div>
                      <DataVisualization
                        type="chapter"
                        data={selectedChapter}
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* 大纲生成配置 - 整合架构师管理、系统提示词、大纲结构 */}
      <OutlineGenerationConfig
        isOpen={isOutlineConfigOpen}
        onClose={() => setIsOutlineConfigOpen(false)}
        config={outlineConfig}
        onSave={handleSaveOutlineConfig}
        // 架构师管理相关
        architects={worldviewArchitects}
        selectedArchitect={selectedArchitect}
        onSelectArchitect={handleSelectArchitect}
        onOpenArchitectManager={handleOpenArchitectManager}
        // 系统提示词相关
        systemPrompt={systemPrompt}
        onSaveSystemPrompt={handleSaveSystemPrompt}
        // 大纲结构相关
        worldviewStructurePrompt={worldviewStructurePrompt}
        onSaveWorldviewPrompt={handleSaveWorldviewStructureConfig}
      />

      {/* AI聊天窗口 */}
      <AIChat
        isOpen={isAIChatOpen}
        onClose={handleCloseAIChat}
        outlines={outlines}
        volumes={volumes}
        chapters={chapters}
        selectedOutline={selectedOutline}
        selectedVolume={selectedVolume}
        selectedChapter={selectedChapter}
        onSendMessage={handleSendMessage}
        onApplyChanges={handleApplyAIChanges}
        onCreateVersion={handleCreateVersion}
        isLoading={isLoading}
        projectId={projectId}
      />

      {/* AI版本管理器 */}
      <AIVersionManager
        isOpen={isVersionManagerOpen}
        onClose={handleCloseVersionManager}
        entityType={versionEntityType}
        entityId={versionEntityId}
        projectId={projectId}
        onVersionApplied={handleVersionApplied}
      />

      {/* 卷纲生成配置 */}
      <VolumeGenerationConfig
        isOpen={isVolumeConfigOpen}
        onClose={() => setIsVolumeConfigOpen(false)}
        config={volumeConfig}
        onSave={handleSaveVolumeConfig}
      />

      {/* 章纲生成配置 */}
      <ChapterGenerationConfig
        isOpen={isChapterConfigOpen}
        onClose={() => setIsChapterConfigOpen(false)}
        config={chapterConfig}
        onSave={handleSaveChapterConfig}
      />
    </div>
  );
};

export default BlueprintPage;
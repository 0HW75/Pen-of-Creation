import React from 'react';
import { useBlueprintManagement } from '../hooks/useBlueprintManagement';
import OutlineTree from '../components/OutlineTree';
import StreamingOutput from '../components/StreamingOutput';
import ArchitectManager from '../components/ArchitectManager';
import SystemPromptConfig from '../components/SystemPromptConfig';
import WorldviewStructureConfig from '../components/WorldviewStructureConfig';
import AIChat from '../components/AIChat';
import DataVisualization from '../components/DataVisualization';
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
    
    // 状态设置函数
    setChatInput,
    setSystemPrompt,
    setWorldviewStructurePrompt,
    setArchitectEditFormData,
    setEditFormData,
    setOutlineEditFormData,
    setVolumeEditFormData,
    
    // 方法
    generateOutline,
    decomposeOutlineToVolumes,
    decomposeVolumeToChapters,
    handleViewChange,
    handleOutlineSelect,
    handleVolumeSelect,
    handleChapterSelect,
    handleDeleteOutline,
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
    handleCloseWorldviewStructureConfig
  } = useBlueprintManagement(projectId);

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <button 
              className="btn btn-primary" 
              onClick={generateOutline}
              disabled={isLoading || !isProjectIdValid}
            >
              {isLoading ? '生成中...' : '生成大纲'}
            </button>
            {selectedOutline && (
              <>
                <button 
                  className="btn btn-secondary" 
                  onClick={decomposeOutlineToVolumes}
                  disabled={isLoading}
                >
                  分解为卷纲
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={handleOpenAIChat}
                >
                  AI修改助手
                </button>
              </>
            )}
            {selectedVolume && (
              <button 
                className="btn btn-secondary" 
                onClick={decomposeVolumeToChapters}
                disabled={isLoading}
              >
                分解为章纲
              </button>
            )}
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
            <button 
              className="btn btn-secondary" 
              onClick={handleOpenSystemPrompt}
            >
              系统提示词
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={handleOpenArchitectManager}
            >
              架构师管理
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={handleOpenWorldviewStructureConfig}
            >
              大纲结构
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
      <StreamingOutput 
        isStreaming={isStreaming}
        streamingOutput={streamingOutput}
        title="大纲生成中..."
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
              />
            </div>

            <div className="main-content">
              {activeView === 'outline' && selectedOutline && (
                <div className="outline-detail">
                  <h3>{selectedOutline.title}</h3>
                  <DataVisualization 
                    type="outline"
                    data={selectedOutline}
                  />
                </div>
              )}

              {activeView === 'volume' && selectedVolume && (
                <div className="volume-detail">
                  <h3>{selectedVolume.title}</h3>
                  <DataVisualization 
                    type="volume"
                    data={selectedVolume}
                  />
                </div>
              )}

              {activeView === 'chapter' && selectedChapter && (
                <div className="chapter-detail">
                  <h3>{selectedChapter.title}</h3>
                  <DataVisualization 
                    type="chapter"
                    data={selectedChapter}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* 架构师管理器 */}
      <ArchitectManager 
        isOpen={isArchitectManagerOpen}
        onClose={handleCloseArchitectManager}
        architects={worldviewArchitects}
        selectedArchitect={selectedArchitect}
        editingArchitect={editingArchitect}
        editFormData={architectEditFormData}
        onSelectArchitect={handleSelectArchitect}
        onEditArchitect={handleEditArchitect}
        onSaveEdit={handleSaveEditArchitect}
        onCancelEdit={handleCancelEditArchitect}
        onAddArchitect={handleAddArchitect}
        onDeleteArchitect={handleDeleteArchitect}
        onFormChange={handleArchitectFormChange}
      />

      {/* 系统提示词配置 */}
      <SystemPromptConfig 
        isOpen={isSystemPromptOpen}
        onClose={handleCloseSystemPrompt}
        prompt={systemPrompt}
        onPromptChange={setSystemPrompt}
        onSave={handleSaveSystemPrompt}
      />

      {/* 世界观结构配置 */}
      <WorldviewStructureConfig 
        isOpen={isWorldviewStructureConfigOpen}
        onClose={handleCloseWorldviewStructureConfig}
        prompt={worldviewStructurePrompt}
        onPromptChange={setWorldviewStructurePrompt}
        onSave={handleSaveWorldviewStructureConfig}
      />

      {/* AI聊天窗口 */}
      <AIChat 
        isOpen={isAIChatOpen}
        onClose={handleCloseAIChat}
        messages={chatMessages}
        inputValue={chatInput}
        onInputChange={setChatInput}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default BlueprintPage;
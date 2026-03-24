import React from 'react';

const ChatInputArea = ({
  inputValue,
  onChange,
  onKeyDown,
  isLoading,
  isBatchMode,
  selectedItems,
  batchState,
  selectedTarget,
  onSend,
  onStartBatch
}) => {
  return (
    <div className="ai-chat-input-area">
      {isBatchMode && batchState.isProcessing && (
        <div className="batch-progress">
          <div className="batch-progress-header">
            <span className="batch-progress-title">批量修改进度</span>
            <span className="batch-progress-count">
              {batchState.currentIndex}/{batchState.totalCount}
            </span>
          </div>
          <div className="batch-progress-bar">
            <div
              className="batch-progress-fill"
              style={{ width: `${(batchState.currentIndex / batchState.totalCount) * 100}%` }}
            />
          </div>
        </div>
      )}

      {!selectedTarget && !isBatchMode ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-text">
            请先在左侧选择要修改的大纲、卷纲或章纲
          </div>
        </div>
      ) : isBatchMode && selectedItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">☑️</div>
          <div className="empty-state-text">
            批量模式下，请勾选左侧要修改的项目
          </div>
        </div>
      ) : isBatchMode && !batchState.isProcessing ? (
        <div className="ai-chat-input-wrapper">
          <textarea
            className="ai-chat-textarea"
            value={inputValue}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={`请输入批量修改要求，例如：\n• 将所有选中的章节主角名字改为"李明"\n• 统一调整场景描述风格\n• 批量添加情感描写...`}
            disabled={isLoading}
          />
          <button
            className="ai-chat-send-btn batch-start-btn"
            onClick={onStartBatch}
            disabled={!inputValue.trim() || isLoading}
          >
            🚀 开始批量修改 ({selectedItems.length}项)
          </button>
        </div>
      ) : isBatchMode && batchState.isProcessing ? (
        <div className="batch-processing-info">
          <div className="batch-current-item">
            正在处理：{selectedItems[batchState.currentIndex - 1]?.data.title || '...'}
          </div>
        </div>
      ) : (
        <div className="ai-chat-input-wrapper">
          <textarea
            className="ai-chat-textarea"
            value={inputValue}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="请输入您的修改要求，例如：\n• 调整主线剧情，增加更多冲突\n• 修改角色设定，让主角更有个性\n• 优化章节结构，增强节奏感..."
            disabled={isLoading}
          />
          <button
            className="ai-chat-send-btn"
            onClick={onSend}
            disabled={!inputValue.trim() || isLoading}
          >
            {isLoading ? '发送中...' : '发送'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatInputArea;

import React, { useEffect, useCallback } from 'react';
import './AIChat.css';
import { useAIChatState } from './AIChat/useAIChatState';
import { useAIChatActions } from './AIChat/useAIChatActions';
import TargetSelector from './AIChat/TargetSelector';
import ChatMessageList from './AIChat/ChatMessageList';
import ChatInputArea from './AIChat/ChatInputArea';

const AIChat = ({
  isOpen,
  onClose,
  outlines,
  volumes,
  chapters: propChapters,
  selectedOutline,
  selectedVolume,
  selectedChapter,
  onSendMessage,
  onApplyChanges,
  onCreateVersion,
  isLoading,
  projectId
}) => {
  const {
    targetType,
    setTargetType,
    selectedTarget,
    setSelectedTarget,
    messages,
    setMessages,
    inputValue,
    setInputValue,
    expandedItems,
    setExpandedItems,
    pendingChanges,
    setPendingChanges,
    isApplying,
    setIsApplying,
    showPreview,
    setShowPreview,
    allChapters,
    isLoadingChapters,
    isBatchMode,
    setIsBatchMode,
    selectedItems,
    setSelectedItems,
    batchState,
    setBatchState,
    messagesEndRef,
    getTargetData,
    safeParseArray,
    getArrayField,
    getSingleItemContent,
    getTargetContent,
    getPreviewContent,
    getLatestItemData,
  } = useAIChatState({
    projectId,
    outlines,
    volumes,
    chapters: propChapters,
    selectedOutline,
    selectedVolume,
    selectedChapter,
    onSendMessage,
    onApplyChanges,
    onCreateVersion
  });

  const {
    handleSend,
    handleApplyChanges: applyChanges,
    handleDiscardChanges,
    handleContinueEdit,
    handleKeyDown,
    handleClearBatchSelection,
    processBatchSequentially,
    togglePauseBatch,
    cancelBatch,
  } = useAIChatActions({
    messages,
    setMessages,
    inputValue,
    setInputValue,
    pendingChanges,
    setPendingChanges,
    selectedTarget,
    selectedItems,
    isBatchMode,
    batchState,
    setBatchState,
    onSendMessage,
    onApplyChanges,
    onCreateVersion,
    getTargetContent,
    getSingleItemContent,
    getLatestItemData,
    isApplying,
    setIsApplying,
    allChapters,
    propChapters,
    volumes,
    outlines
  });

  useEffect(() => {
    if (isOpen) {
      if (selectedChapter) {
        setTargetType('chapter');
        setSelectedTarget({ type: 'chapter', data: selectedChapter });
      } else if (selectedVolume) {
        setTargetType('volume');
        setSelectedTarget({ type: 'volume', data: selectedVolume });
      } else if (selectedOutline) {
        setTargetType('outline');
        setSelectedTarget({ type: 'outline', data: selectedOutline });
      }

      if (messages.length === 0) {
        setMessages([
          {
            role: 'assistant',
            content: '您好！我是您的AI大纲修改助手。\n\n📌 单条修改：直接点击左侧项目选择\n📌 批量修改：开启右上角"批量模式"，勾选多个项目一起修改',
            timestamp: new Date()
          }
        ]);
      }
    }
  }, [isOpen, selectedOutline, selectedVolume, selectedChapter]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectTarget = (type, data) => {
    if (isBatchMode) {
      const itemKey = `${type}-${data.id}`;
      const exists = selectedItems.find(item => item.key === itemKey);

      if (exists) {
        setSelectedItems(prev => prev.filter(item => item.key !== itemKey));
      } else {
        setSelectedItems(prev => [...prev, { key: itemKey, type, data }]);
      }
    } else {
      setSelectedTarget({ type, data });
      setPendingChanges(null);
      setShowPreview(true);
    }
  };

  const isItemSelected = (type, id) => {
    return selectedItems.some(item => item.type === type && item.data.id === id);
  };

  const toggleExpand = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  if (!isOpen) return null;

  return (
    <div className="ai-chat-modal-overlay" onClick={onClose}>
      <div className="ai-chat-modal" onClick={e => e.stopPropagation()}>
        <div className="ai-chat-header">
          <h3>🤖 AI大纲修改助手</h3>
          <div className="ai-chat-header-actions">
            <label className="batch-mode-toggle">
              <input
                type="checkbox"
                checked={isBatchMode}
                onChange={(e) => {
                  setIsBatchMode(e.target.checked);
                  setSelectedItems([]);
                  setSelectedTarget(null);
                }}
              />
              <span>批量模式</span>
            </label>
            <button className="ai-chat-close-btn" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="ai-chat-body">
          <TargetSelector
            targetType={targetType}
            setTargetType={setTargetType}
            isBatchMode={isBatchMode}
            selectedItems={selectedItems}
            selectedTarget={selectedTarget}
            isLoadingChapters={isLoadingChapters}
            allChapters={allChapters}
            propChapters={propChapters}
            volumes={volumes}
            outlines={outlines}
            expandedItems={expandedItems}
            isItemSelected={isItemSelected}
            onToggleExpand={toggleExpand}
            onSelectTarget={handleSelectTarget}
            onClearBatchSelection={handleClearBatchSelection}
            getPreviewContent={getPreviewContent}
            showPreview={showPreview}
            setShowPreview={setShowPreview}
          />

          <div className="ai-chat-main">
            <ChatMessageList
              messages={messages}
              messagesEndRef={messagesEndRef}
              isLoading={isLoading}
              isApplying={isApplying}
              pendingChanges={pendingChanges}
              onApplyChanges={applyChanges}
              onContinueEdit={handleContinueEdit}
              onDiscardChanges={handleDiscardChanges}
            />

            <ChatInputArea
              inputValue={inputValue}
              onChange={setInputValue}
              onKeyDown={handleKeyDown}
              isLoading={isLoading}
              isBatchMode={isBatchMode}
              selectedItems={selectedItems}
              batchState={batchState}
              selectedTarget={selectedTarget}
              onSend={handleSend}
              onStartBatch={processBatchSequentially}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;

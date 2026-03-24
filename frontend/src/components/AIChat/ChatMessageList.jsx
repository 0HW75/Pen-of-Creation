import React from 'react';

const ChatMessageList = ({
  messages,
  messagesEndRef,
  isLoading,
  isApplying,
  pendingChanges,
  onApplyChanges,
  onContinueEdit,
  onDiscardChanges
}) => {
  return (
    <div className="ai-chat-messages">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`chat-message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
        >
          <div className="message-avatar">
            {message.role === 'user' ? '👤' : '🤖'}
          </div>
          <div className="message-content-wrapper">
            <div className="message-header">
              {message.role === 'user' ? '我' : 'AI助手'}
            </div>
            <div className="message-bubble">
              {message.content}
            </div>
            {message.role === 'assistant' && message.hasActions && pendingChanges && (
              <div className="message-actions">
                <button
                  className="message-action-btn apply-btn"
                  onClick={onApplyChanges}
                  disabled={isApplying}
                >
                  {isApplying ? '保存中...' : '✅ 采纳修改'}
                </button>
                <button
                  className="message-action-btn continue-btn"
                  onClick={onContinueEdit}
                  disabled={isApplying}
                >
                  💬 继续调整
                </button>
                <button
                  className="message-action-btn discard-btn"
                  onClick={onDiscardChanges}
                  disabled={isApplying}
                >
                  ❌ 放弃
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="loading-indicator">
          <div className="loading-dots">
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </div>
          <span>AI正在思考...</span>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessageList;

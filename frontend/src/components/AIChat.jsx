import React from 'react';

const AIChat = ({ 
  isOpen, 
  onClose,
  messages,
  inputValue,
  onInputChange,
  onSendMessage
}) => {
  if (!isOpen) return null;

  return (
    <div className="ai-chat">
      <div className="ai-chat-header">
        <h3>AI大纲助手</h3>
        <button className="btn btn-close" onClick={onClose}>关闭</button>
      </div>
      
      <div className="ai-chat-messages">
        {messages.map((message, index) => (
          <div 
            key={index}
            className={`chat-message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
          >
            <div className="message-header">
              <span className="message-role">
                {message.role === 'user' ? '我' : 'AI助手'}
              </span>
            </div>
            <div className="message-content">
              {message.content}
            </div>
          </div>
        ))}
      </div>
      
      <div className="ai-chat-input">
        <input 
          type="text"
          className="form-control"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="请输入您的问题或修改要求..."
        />
        <button 
          className="btn btn-primary"
          onClick={onSendMessage}
          disabled={!inputValue.trim()}
        >
          发送
        </button>
      </div>
    </div>
  );
};

export default AIChat;
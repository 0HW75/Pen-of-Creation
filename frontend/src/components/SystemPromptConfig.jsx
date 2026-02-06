import React from 'react';

const SystemPromptConfig = ({ 
  isOpen, 
  onClose,
  prompt,
  onPromptChange,
  onSave
}) => {
  if (!isOpen) return null;

  return (
    <div className="system-prompt-config">
      <div className="system-prompt-header">
        <h3>系统提示词配置</h3>
        <button className="btn btn-close" onClick={onClose}>关闭</button>
      </div>
      
      <div className="system-prompt-content">
        <div className="form-group">
          <label>系统提示词</label>
          <textarea 
            className="form-control"
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            rows={15}
            placeholder="请输入系统提示词..."
          />
        </div>
        
        <div className="form-actions">
          <button className="btn btn-primary" onClick={onSave}>
            保存
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            取消
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemPromptConfig;
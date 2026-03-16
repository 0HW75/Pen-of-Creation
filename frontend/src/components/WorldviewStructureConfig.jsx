import React from 'react';

const WorldviewStructureConfig = ({ 
  isOpen, 
  onClose,
  prompt,
  onPromptChange,
  onSave
}) => {
  if (!isOpen) return null;

  return (
    <div className="worldview-structure-config">
      <div className="worldview-structure-header">
        <h3>世界观结构配置</h3>
        <button className="btn btn-close" onClick={onClose}>关闭</button>
      </div>
      
      <div className="worldview-structure-content">
        <div className="form-group">
          <label>世界观结构提示词</label>
          <textarea 
            className="form-control"
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            rows={20}
            placeholder="请输入世界观结构提示词..."
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

export default WorldviewStructureConfig;
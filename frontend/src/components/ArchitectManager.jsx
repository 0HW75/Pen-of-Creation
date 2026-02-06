import React from 'react';

const ArchitectManager = ({ 
  isOpen, 
  onClose,
  architects,
  selectedArchitect,
  editingArchitect,
  editFormData,
  onSelectArchitect,
  onEditArchitect,
  onSaveEdit,
  onCancelEdit,
  onAddArchitect,
  onDeleteArchitect,
  onFormChange
}) => {
  if (!isOpen) return null;

  return (
    <div className="architect-manager">
      <div className="architect-manager-header">
        <h3>故事大纲架构师</h3>
        <button className="btn btn-close" onClick={onClose}>关闭</button>
      </div>
      
      <div className="architect-manager-content">
        <div className="architects-list">
          <h4>架构师列表</h4>
          {architects.map(architect => (
            <div 
              key={architect.id}
              className={`architect-item ${selectedArchitect?.id === architect.id ? 'selected' : ''}`}
            >
              <div className="architect-info" onClick={() => onSelectArchitect(architect)}>
                <h5>{architect.name}</h5>
                <p>{architect.description}</p>
              </div>
              <div className="architect-actions">
                <button className="btn btn-sm" onClick={() => onEditArchitect(architect)}>
                  编辑
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => onDeleteArchitect(architect.id)}>
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="architect-actions">
          <button className="btn btn-primary" onClick={onAddArchitect}>
            添加新架构师
          </button>
        </div>
        
        {editingArchitect && (
          <div className="architect-edit-form">
            <h4>编辑架构师</h4>
            <form>
              <div className="form-group">
                <label>名称</label>
                <input 
                  type="text" 
                  className="form-control"
                  name="name"
                  value={editFormData.name}
                  onChange={onFormChange}
                />
              </div>
              <div className="form-group">
                <label>描述</label>
                <input 
                  type="text" 
                  className="form-control"
                  name="description"
                  value={editFormData.description}
                  onChange={onFormChange}
                />
              </div>
              <div className="form-group">
                <label>提示词</label>
                <textarea 
                  className="form-control"
                  name="prompt"
                  value={editFormData.prompt}
                  onChange={onFormChange}
                  rows={10}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-primary" onClick={onSaveEdit}>
                  保存
                </button>
                <button type="button" className="btn btn-secondary" onClick={onCancelEdit}>
                  取消
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArchitectManager;
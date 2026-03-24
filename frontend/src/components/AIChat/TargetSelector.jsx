import React from 'react';

const TargetSelector = ({
  targetType,
  setTargetType,
  isBatchMode,
  selectedItems,
  selectedTarget,
  isLoadingChapters,
  allChapters,
  propChapters,
  volumes,
  outlines,
  expandedItems,
  isItemSelected,
  onToggleExpand,
  onSelectTarget,
  onClearBatchSelection,
  getPreviewContent,
  showPreview,
  setShowPreview
}) => {

  const renderTree = () => {
    const getChaptersToUse = () => {
      return allChapters.length > 0 ? allChapters : (propChapters || []);
    };

    if (targetType === 'outline') {
      return (
        <div className="tree-list">
          {(outlines || []).map(outline => (
            <div key={outline.id} className="tree-item">
              <div
                className={`tree-item-header ${selectedTarget?.data?.id === outline.id && !isBatchMode ? 'selected' : ''} ${isItemSelected('outline', outline.id) ? 'batch-selected' : ''}`}
                onClick={() => onSelectTarget('outline', outline)}
              >
                {isBatchMode && (
                  <input
                    type="checkbox"
                    checked={isItemSelected('outline', outline.id)}
                    onChange={() => {}}
                    className="batch-checkbox"
                  />
                )}
                <span className="tree-item-icon">📋</span>
                <span className="tree-item-title">{outline.title}</span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (targetType === 'volume') {
      return (
        <div className="tree-list">
          {(outlines || []).map(outline => (
            <div key={outline.id} className="tree-item">
              <div
                className="tree-item-header"
                onClick={() => onToggleExpand(outline.id)}
              >
                <span className="tree-item-expand">▶</span>
                <span className="tree-item-icon">📋</span>
                <span className="tree-item-title">{outline.title}</span>
              </div>
              {expandedItems.has(outline.id) && (
                <div className="tree-children">
                  {(volumes || [])
                    .filter(v => v.outline_id === outline.id)
                    .map(volume => (
                      <div
                        key={volume.id}
                        className={`tree-item-header ${selectedTarget?.data?.id === volume.id && !isBatchMode ? 'selected' : ''} ${isItemSelected('volume', volume.id) ? 'batch-selected' : ''}`}
                        onClick={() => onSelectTarget('volume', volume)}
                      >
                        {isBatchMode && (
                          <input
                            type="checkbox"
                            checked={isItemSelected('volume', volume.id)}
                            onChange={() => {}}
                            className="batch-checkbox"
                          />
                        )}
                        <span className="tree-item-icon">📚</span>
                        <span className="tree-item-title">第{volume.order_index}卷 {volume.title}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (targetType === 'chapter') {
      const chaptersToUse = getChaptersToUse();

      return (
        <div className="tree-list">
          {isLoadingChapters ? (
            <div className="tree-loading">加载中...</div>
          ) : (
            (volumes || []).map(volume => (
              <div key={volume.id} className="tree-item">
                <div
                  className="tree-item-header"
                  onClick={() => onToggleExpand(volume.id)}
                >
                  <span className={`tree-item-expand ${expandedItems.has(volume.id) ? 'expanded' : ''}`}>▶</span>
                  <span className="tree-item-icon">📚</span>
                  <span className="tree-item-title">第{volume.order_index}卷 {volume.title}</span>
                </div>
                {expandedItems.has(volume.id) && (
                  <div className="tree-children">
                    {chaptersToUse
                      .filter(c => c.volume_id === volume.id)
                      .map(chapter => (
                        <div
                          key={chapter.id}
                          className={`tree-item-header ${selectedTarget?.data?.id === chapter.id && !isBatchMode ? 'selected' : ''} ${isItemSelected('chapter', chapter.id) ? 'batch-selected' : ''}`}
                          onClick={() => onSelectTarget('chapter', chapter)}
                        >
                          {isBatchMode && (
                            <input
                              type="checkbox"
                              checked={isItemSelected('chapter', chapter.id)}
                              onChange={() => {}}
                              className="batch-checkbox"
                            />
                          )}
                          <span className="tree-item-icon">📄</span>
                          <span className="tree-item-title">第{chapter.order_index}章 {chapter.title}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      );
    }
  };

  const renderPreview = () => {
    const preview = getPreviewContent();
    if (!preview) return null;

    return (
      <div className="content-preview">
        <div className="preview-header" onClick={() => setShowPreview(!showPreview)}>
          <span className="preview-icon">👁️</span>
          <span className="preview-title">内容预览</span>
          <span className={`preview-toggle ${showPreview ? 'expanded' : ''}`}>▼</span>
        </div>
        {showPreview && (
          <div className="preview-body">
            <div className="preview-title-bar">{preview.title}</div>
            {preview.fields.map((field, index) => (
              <div key={index} className="preview-field">
                <div className="preview-field-label">{field.label}</div>
                <div className="preview-field-value">
                  {field.type === 'list' ? (
                    field.value && field.value.length > 0 ? (
                      <ul>
                        {field.value.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="preview-empty">暂无</span>
                    )
                  ) : (
                    field.value || <span className="preview-empty">暂无</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="ai-chat-sidebar">
      <div className="sidebar-header">
        <h4>{isBatchMode ? '批量选择要修改的内容' : '选择要修改的内容'}</h4>

        {isBatchMode && (
          <div className="batch-stats">
            已选择 {selectedItems.length} 项
            {selectedItems.length > 0 && (
              <button className="clear-batch-btn" onClick={onClearBatchSelection}>
                清空
              </button>
            )}
          </div>
        )}

        <div className="target-type-selector">
          <button
            className={`target-type-btn ${targetType === 'outline' ? 'active' : ''}`}
            onClick={() => setTargetType('outline')}
          >
            大纲
          </button>
          <button
            className={`target-type-btn ${targetType === 'volume' ? 'active' : ''}`}
            onClick={() => setTargetType('volume')}
          >
            卷纲
          </button>
          <button
            className={`target-type-btn ${targetType === 'chapter' ? 'active' : ''}`}
            onClick={() => setTargetType('chapter')}
          >
            章纲
          </button>
        </div>
      </div>

      <div className="sidebar-content">
        {renderTree()}
      </div>

      {(selectedTarget || (isBatchMode && selectedItems.length > 0)) && renderPreview()}

      {selectedTarget && !isBatchMode && (
        <div className="selected-info">
          <div className="selected-info-label">当前选中：</div>
          <div className="selected-info-title">
            {selectedTarget.type === 'outline' ? '📋' :
              selectedTarget.type === 'volume' ? '📚' : '📄'}
            {selectedTarget.data.title}
          </div>
        </div>
      )}
    </div>
  );
};

export default TargetSelector;

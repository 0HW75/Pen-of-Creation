import React from 'react';

const OutlineTree = ({ 
  outlines, 
  volumes, 
  chapters, 
  selectedOutline, 
  selectedVolume, 
  selectedChapter,
  onOutlineSelect,
  onVolumeSelect,
  onChapterSelect,
  onDeleteOutline,
  onDeleteVolume,
  onDeleteChapter
}) => {
  return (
    <div className="outline-tree">
      {outlines.map(outline => (
        <div 
          key={outline.id}
          className={`outline-item ${selectedOutline?.id === outline.id ? 'selected' : ''}`}
        >
          <div className="outline-header" onClick={() => onOutlineSelect(outline)}>
            <h4>{outline.title}</h4>
            <div className="outline-actions">
              <button 
                className="btn btn-sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteOutline(outline.id);
                }}
              >
                删除
              </button>
            </div>
          </div>
          
          {selectedOutline?.id === outline.id && volumes.length > 0 && (
            <div className="volumes-list">
              {volumes.map(volume => (
                <div 
                  key={volume.id}
                  className={`volume-item ${selectedVolume?.id === volume.id ? 'selected' : ''}`}
                >
                  <div className="volume-header" onClick={() => onVolumeSelect(volume)}>
                    <h5>{volume.title}</h5>
                    <button 
                      className="btn btn-sm btn-danger" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteVolume(volume.id);
                      }}
                    >
                      删除
                    </button>
                  </div>
                  {selectedVolume?.id === volume.id && chapters.length > 0 && (
                    <div className="chapters-list">
                      {chapters.map(chapter => (
                        <div 
                          key={chapter.id}
                          className={`chapter-item ${selectedChapter?.id === chapter.id ? 'selected' : ''}`}
                          onClick={() => onChapterSelect(chapter)}
                        >
                          <span>第{chapter.order_index + 1}章：{chapter.title}</span>
                          <div className="chapter-actions">
                            <span className="word-count">{chapter.word_count_estimate}字</span>
                            <button 
                              className="btn btn-sm btn-danger" 
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteChapter(chapter.id);
                              }}
                            >
                              删除
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default OutlineTree;

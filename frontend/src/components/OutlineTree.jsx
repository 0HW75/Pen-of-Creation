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
  onDeleteOutline
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
              <button className="btn btn-sm" onClick={() => onDeleteOutline(outline.id)}>
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
                  onClick={() => onVolumeSelect(volume)}
                >
                  <h5>{volume.title}</h5>
                  {selectedVolume?.id === volume.id && chapters.length > 0 && (
                    <div className="chapters-list">
                      {chapters.map(chapter => (
                        <div 
                          key={chapter.id}
                          className={`chapter-item ${selectedChapter?.id === chapter.id ? 'selected' : ''}`}
                          onClick={() => onChapterSelect(chapter)}
                        >
                          <span>{chapter.title}</span>
                          <span className="word-count">{chapter.word_count_estimate}字</span>
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
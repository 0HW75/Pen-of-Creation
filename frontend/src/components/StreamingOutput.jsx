import React from 'react';

const StreamingOutput = ({ isStreaming, streamingOutput, title = '生成中...' }) => {
  if (!isStreaming) return null;

  return (
    <div className="streaming-output">
      <h3>{title}</h3>
      <div className="streaming-content">
        <div className="markdown-content">
          <div style={{ 
            whiteSpace: 'pre-wrap', 
            lineHeight: '1.6',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
            fontSize: '14px'
          }}>
            {streamingOutput}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamingOutput;
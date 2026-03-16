import React from 'react';
import { Button } from 'antd';
import { StopOutlined } from '@ant-design/icons';

const StreamingOutput = ({ isStreaming, streamingOutput, title = '生成中...', onStop }) => {
  if (!isStreaming) return null;

  return (
    <div className="streaming-output">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        {onStop && (
          <Button 
            type="primary" 
            danger 
            icon={<StopOutlined />}
            onClick={onStop}
          >
            停止生成
          </Button>
        )}
      </div>
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
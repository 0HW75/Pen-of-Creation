import React, { useEffect, useRef } from 'react';
import { Card, Typography, Progress, Space, Divider, Button, Popconfirm, Tag } from 'antd';
import { ReadOutlined, PauseCircleOutlined } from '@ant-design/icons';
import PromptStructureDisplay from './PromptStructureDisplay';

const { Text } = Typography;

const StreamPanel = ({
  showStreamPanel,
  currentBatchName,
  generating,
  currentProgress,
  currentElementIndex,
  totalElements,
  currentElement,
  inputSections,
  aiStreamContent,
  streamLog,
  sessionId,
  isAborting,
  onAbort,
  aiStreamRef,
  outputRef
}) => {
  if (!showStreamPanel) return null;

  return (
    <Card 
      style={{ marginTop: 24 }} 
      title={`生成进度 - ${currentBatchName}`}
      extra={
        generating && (
          <Popconfirm
            title="确认中止生成？"
            description="中止后可以在检查点恢复，但当前元素需要重新生成。"
            onConfirm={onAbort}
            okText="确认中止"
            cancelText="继续生成"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              size="small"
              icon={<PauseCircleOutlined />}
              loading={isAborting}
              disabled={!sessionId}
            >
              中止生成
            </Button>
          </Popconfirm>
        )
      }
    >
      <Progress percent={currentProgress} status={generating ? 'active' : 'success'} />
      <Space style={{ marginBottom: 16 }}>
        <Text type="secondary">
          进度: {currentElementIndex} / {totalElements} 个元素
        </Text>
        {currentElement && (
          <Tag color="blue">当前: {currentElement}</Tag>
        )}
      </Space>

      <Divider />

      <div style={{ display: 'flex', gap: 16, height: 500 }}>
        <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Text strong style={{ marginBottom: 8 }}>
            <ReadOutlined style={{ marginRight: 8 }} />
            提示词结构（发送给AI的上下文）
          </Text>
          <div style={{
            flex: 1,
            border: '1px solid #d9d9d9',
            borderRadius: 8,
            overflow: 'hidden',
            backgroundColor: '#fafafa'
          }}>
            <PromptStructureDisplay sections={inputSections} />
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Text strong>
            AI 实时输出
            {currentElement && <span style={{ color: '#1890ff', marginLeft: 8 }}>({currentElement})</span>}
            {generating && (
              <span style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                backgroundColor: '#52c41a',
                borderRadius: '50%',
                marginLeft: 8,
                animation: 'pulse 1s infinite'
              }} />
            )}
          </Text>
          <div
            ref={aiStreamRef}
            style={{
              flex: 1,
              marginTop: 8,
              padding: 12,
              backgroundColor: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: 6,
              overflowY: 'auto',
              fontFamily: 'monospace',
              fontSize: 12,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            {aiStreamContent || <span style={{ color: '#999' }}>等待AI响应...</span>}
          </div>
        </div>

        <div style={{ flex: 0.8, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Text strong>处理日志：</Text>
          <div
            ref={outputRef}
            style={{
              flex: 1,
              marginTop: 8,
              padding: 12,
              backgroundColor: '#f0f8ff',
              border: '1px solid #d9d9d9',
              borderRadius: 6,
              overflowY: 'auto',
              fontFamily: 'monospace',
              fontSize: 12,
            }}
          >
            {streamLog.map((log, index) => (
              <div key={index} style={{ marginBottom: 8 }}>
                {log.type === 'input' && (
                  <div style={{ color: '#1890ff' }}>
                    <strong>[输入] {log.element}</strong>
                  </div>
                )}
                {log.type === 'output' && (
                  <div style={{ color: '#52c41a' }}>
                    <strong>[结果]</strong> {log.content}
                  </div>
                )}
                {log.type === 'system' && (
                  <div style={{ color: '#666' }}>
                    <strong>[系统]</strong> {log.content}
                  </div>
                )}
                {log.type === 'error' && (
                  <div style={{ color: '#f5222d' }}>
                    <strong>[错误]</strong> {log.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </Card>
  );
};

export default StreamPanel;
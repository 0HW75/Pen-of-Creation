import React from 'react';
import { Typography, Collapse } from 'antd';
import {
  FileTextOutlined, BookOutlined, ReadOutlined, DatabaseOutlined, PaperClipOutlined
} from '@ant-design/icons';

const { Text } = Typography;
const { Panel } = Collapse;

const PromptStructureDisplay = ({ sections }) => {
  if (!sections) return <Text type="secondary">等待数据...</Text>;

  const { element, story_context, generated_context, previous_context } = sections;

  const sectionStyle = {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    border: '1px solid',
  };

  const headerStyle = {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 8,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  const contentStyle = {
    fontSize: 12,
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 8 }}>
      <div style={{ ...sectionStyle, backgroundColor: '#e6f7ff', borderColor: '#91d5ff' }}>
        <div style={{ ...headerStyle, color: '#1890ff' }}>
          <FileTextOutlined />
          目标元素信息
        </div>
        <div style={contentStyle}>
          <div><strong>名称：</strong>{element?.name || '未命名'}</div>
          <div><strong>类型：</strong>{element?.type || '未知'}</div>
          <div><strong>简介：</strong>{element?.brief || '无'}</div>
          <div><strong>证据：</strong>{element?.evidence || '无'}</div>
        </div>
      </div>

      {(story_context?.outline || story_context?.volume || (story_context?.chapters?.length > 0)) && (
        <div style={{ ...sectionStyle, backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }}>
          <div style={{ ...headerStyle, color: '#52c41a' }}>
            <BookOutlined />
            故事背景上下文
          </div>
          <Collapse ghost size="small">
            {story_context?.outline && (
              <Panel header="大纲内容" key="outline">
                <div style={{ ...contentStyle, color: '#389e0d' }}>{story_context.outline}</div>
              </Panel>
            )}
            {story_context?.volume && (
              <Panel header="卷纲内容" key="volume">
                <div style={{ ...contentStyle, color: '#389e0d' }}>{story_context.volume}</div>
              </Panel>
            )}
            {story_context?.chapters?.length > 0 && (
              <Panel header={`章纲内容 (${story_context.chapters.length}个)`} key="chapters">
                {story_context.chapters.map((chapter, idx) => (
                  <div key={idx} style={{ marginBottom: 8, padding: 8, backgroundColor: '#f0f0f0', borderRadius: 4 }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>章纲 {idx + 1}</Text>
                    <div style={{ ...contentStyle, color: '#389e0d', marginTop: 4 }}>{chapter}</div>
                  </div>
                ))}
              </Panel>
            )}
          </Collapse>
        </div>
      )}

      {previous_context && (
        <div style={{ ...sectionStyle, backgroundColor: '#e6f4ff', borderColor: '#91caff' }}>
          <div style={{ ...headerStyle, color: '#0958d9' }}>
            <BookOutlined />
            之前批次已生成内容（跨类型上下文）
          </div>
          <div style={{ ...contentStyle, color: '#0958d9' }}>{previous_context}</div>
        </div>
      )}

      {generated_context && (
        <div style={{ ...sectionStyle, backgroundColor: '#fff7e6', borderColor: '#ffd591' }}>
          <div style={{ ...headerStyle, color: '#fa8c16' }}>
            <PaperClipOutlined />
            同批次已生成内容
          </div>
          <div style={{ ...contentStyle, color: '#d46b08' }}>{generated_context}</div>
        </div>
      )}

      <div style={{ ...sectionStyle, backgroundColor: '#f9f0ff', borderColor: '#d3adf7' }}>
        <div style={{ ...headerStyle, color: '#722ed1' }}>
          <DatabaseOutlined />
          数据库已有设定（自动获取相关类型）
        </div>
        <Text type="secondary" style={{ fontSize: 12 }}>
          根据当前生成类型，系统会自动从数据库获取相关的已有设定作为上下文
        </Text>
      </div>
    </div>
  );
};

export default PromptStructureDisplay;
import React, { useState } from 'react';
import { Card, Typography, Space, Tag, Divider, Collapse, Badge, Tooltip, Button } from 'antd';
import {
  AimOutlined,
  HeartOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  PushpinOutlined,
  PushpinFilled,
  BookOutlined,
  UserOutlined,
  TagsOutlined
} from '@ant-design/icons';

const { Text, Title, Paragraph } = Typography;
const { Panel } = Collapse;

/**
 * 大纲参考面板组件
 *
 * 功能：
 * 1. 显示当前章节的章纲内容
 * 2. 显示核心事件
 * 3. 显示情绪目标
 * 4. 显示场景、角色、关键词
 * 5. 支持悬浮窗模式
 * 6. 支持固定/取消固定
 */
const OutlineReferencePanel = ({
  currentChapter,
  projectGoals = {},
  floating = false,
  onPinToggle,
  isPinned = false
}) => {
  const [visible, setVisible] = useState(true);

  if (!currentChapter) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
        <AimOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
        <Text type="secondary">请先选择一个章节</Text>
      </div>
    );
  }

  const outlineData = {
    outlineContent: currentChapter.outline_content || '',
    coreEvent: currentChapter.core_event || '',
    emotionGoal: currentChapter.emotional_goal || '',
    scenes: (() => {
      try {
        const s = currentChapter.scenes;
        if (typeof s === 'string') return JSON.parse(s);
        return Array.isArray(s) ? s : [];
      } catch { return []; }
    })(),
    characters: (() => {
      try {
        const c = currentChapter.characters;
        if (typeof c === 'string') return JSON.parse(c);
        return Array.isArray(c) ? c : [];
      } catch { return []; }
    })(),
    keywords: (() => {
      try {
        const k = currentChapter.keywords;
        if (typeof k === 'string') return JSON.parse(k);
        return Array.isArray(k) ? k : [];
      } catch { return []; }
    })()
  };

  return (
    <div style={{ height: '100%' }}>
      {floating && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          padding: '8px',
          background: '#f6ffed',
          borderRadius: '4px',
          border: '1px solid #b7eb8f'
        }}>
          <Space>
            <AimOutlined style={{ color: '#52c41a' }} />
            <Text strong style={{ fontSize: '13px' }}>大纲参考</Text>
          </Space>
          <Space>
            <Button
              type="text"
              size="small"
              icon={isPinned ? <PushpinFilled /> : <PushpinOutlined />}
              onClick={onPinToggle}
            />
            <Button
              type="text"
              size="small"
              icon={visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              onClick={() => setVisible(!visible)}
            />
          </Space>
        </div>
      )}

      {visible && (
        <div style={{
          maxHeight: floating ? '300px' : '100%',
          overflow: 'auto'
        }}>
          {outlineData.outlineContent && (
            <Card
              size="small"
              style={{
                marginBottom: '12px',
                background: '#fafafa',
                border: '1px solid #d9d9d9'
              }}
              bodyStyle={{ padding: '12px' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  <BookOutlined style={{ color: '#722ed1' }} />
                  <Text strong style={{ color: '#722ed1' }}>章纲内容</Text>
                </Space>
                <Paragraph
                  style={{ margin: 0, fontSize: '13px', whiteSpace: 'pre-wrap' }}
                  ellipsis={{ rows: 6, expandable: true, symbol: '展开' }}
                >
                  {outlineData.outlineContent}
                </Paragraph>
              </Space>
            </Card>
          )}

          {outlineData.coreEvent && (
            <Card
              size="small"
              style={{
                marginBottom: '12px',
                background: '#e6f7ff',
                border: '1px solid #91d5ff'
              }}
              bodyStyle={{ padding: '12px' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  <ThunderboltOutlined style={{ color: '#1890ff' }} />
                  <Text strong style={{ color: '#1890ff' }}>核心事件</Text>
                </Space>
                <Paragraph style={{ margin: 0, fontSize: '13px' }}>
                  {outlineData.coreEvent}
                </Paragraph>
              </Space>
            </Card>
          )}

          {outlineData.emotionGoal && (
            <Card
              size="small"
              style={{
                marginBottom: '12px',
                background: '#fff2f0',
                border: '1px solid #ffccc7'
              }}
              bodyStyle={{ padding: '12px' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  <HeartOutlined style={{ color: '#ff4d4f' }} />
                  <Text strong style={{ color: '#ff4d4f' }}>情绪目标</Text>
                </Space>
                <Paragraph style={{ margin: 0, fontSize: '13px' }}>
                  {outlineData.emotionGoal}
                </Paragraph>
              </Space>
            </Card>
          )}

          {outlineData.scenes.length > 0 && (
            <Card
              size="small"
              style={{ marginBottom: '12px' }}
              bodyStyle={{ padding: '12px' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  <TagsOutlined style={{ color: '#fa8c16' }} />
                  <Text strong style={{ color: '#fa8c16' }}>场景</Text>
                </Space>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {outlineData.scenes.map((scene, index) => (
                    <Tag key={index} color="orange">{scene}</Tag>
                  ))}
                </div>
              </Space>
            </Card>
          )}

          {outlineData.characters.length > 0 && (
            <Card
              size="small"
              style={{ marginBottom: '12px' }}
              bodyStyle={{ padding: '12px' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  <UserOutlined style={{ color: '#13c2c2' }} />
                  <Text strong style={{ color: '#13c2c2' }}>角色</Text>
                </Space>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {outlineData.characters.map((char, index) => (
                    <Tag key={index} color="cyan">{char}</Tag>
                  ))}
                </div>
              </Space>
            </Card>
          )}

          {outlineData.keywords.length > 0 && (
            <Card
              size="small"
              style={{ marginBottom: '12px' }}
              bodyStyle={{ padding: '12px' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  <TagsOutlined style={{ color: '#eb2f96' }} />
                  <Text strong style={{ color: '#eb2f96' }}>关键词</Text>
                </Space>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {outlineData.keywords.map((kw, index) => (
                    <Tag key={index} color="purple">{kw}</Tag>
                  ))}
                </div>
              </Space>
            </Card>
          )}

          {projectGoals.daily_word_goal && (
            <>
              <Divider style={{ margin: '12px 0' }} />
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>项目目标</Text>
                <Space size="small">
                  <Tag color="blue">日更{projectGoals.daily_word_goal}字</Tag>
                  <Tag color="purple">总计{projectGoals.total_word_goal}字</Tag>
                </Space>
              </Space>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default OutlineReferencePanel;

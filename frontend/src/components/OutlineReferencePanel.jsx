import React, { useState } from 'react';
import { Card, Typography, Space, Tag, Divider, Collapse, Badge, Tooltip, Button } from 'antd';
import { 
  AimOutlined, 
  HeartOutlined, 
  ThunderboltOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  PushpinOutlined,
  PushpinFilled
} from '@ant-design/icons';

const { Text, Title, Paragraph } = Typography;

/**
 * 大纲参考面板组件
 * 
 * 功能：
 * 1. 显示当前章节的核心事件
 * 2. 显示情绪目标
 * 3. 显示伏笔和照应
 * 4. 支持悬浮窗模式
 * 5. 支持固定/取消固定
 */
const OutlineReferencePanel = ({ 
  currentChapter,
  projectGoals = {},
  floating = false,
  onPinToggle,
  isPinned = false
}) => {
  const [visible, setVisible] = useState(true);
  
  // 如果没有当前章节数据
  if (!currentChapter) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
        <AimOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
        <Text type="secondary">请先选择一个章节</Text>
      </div>
    );
  }
  
  // 模拟大纲数据（实际应从后端获取）
  const outlineData = {
    coreEvent: currentChapter.core_event || '暂无核心事件',
    emotionGoal: currentChapter.emotion_goal || '暂无情绪目标',
    foreshadowing: currentChapter.foreshadowing || [],
    callbacks: currentChapter.callbacks || [],
    keyPoints: currentChapter.key_points || [],
    notes: currentChapter.notes || ''
  };
  
  return (
    <div style={{ height: '100%' }}>
      {/* 悬浮窗头部（仅在悬浮模式下显示） */}
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
          {/* 核心事件 */}
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
          
          {/* 情绪目标 */}
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
          
          {/* 关键情节点 */}
          {outlineData.keyPoints.length > 0 && (
            <Card 
              size="small" 
              style={{ marginBottom: '12px' }}
              bodyStyle={{ padding: '12px' }}
              title="关键情节点"
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {outlineData.keyPoints.map((point, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Badge count={index + 1} style={{ marginRight: '8px', backgroundColor: '#1890ff' }} />
                    <Text style={{ fontSize: '12px' }}>{point}</Text>
                  </div>
                ))}
              </Space>
            </Card>
          )}
          
          {/* 伏笔与照应 */}
          <Collapse 
            ghost 
            style={{ marginBottom: '12px' }}
            items={[
              outlineData.foreshadowing.length > 0 && {
                key: 'foreshadowing',
                label: (
                  <Space>
                    <Tag color="orange">伏笔</Tag>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {outlineData.foreshadowing.length}个
                    </Text>
                  </Space>
                ),
                children: (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {outlineData.foreshadowing.map((item, index) => (
                      <Text key={index} style={{ fontSize: '12px' }}>
                        • {item}
                      </Text>
                    ))}
                  </Space>
                )
              },
              outlineData.callbacks.length > 0 && {
                key: 'callbacks',
                label: (
                  <Space>
                    <Tag color="green">照应</Tag>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {outlineData.callbacks.length}个
                    </Text>
                  </Space>
                ),
                children: (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {outlineData.callbacks.map((item, index) => (
                      <Text key={index} style={{ fontSize: '12px' }}>
                        • {item}
                      </Text>
                    ))}
                  </Space>
                )
              }
            ].filter(Boolean)}
          />
          
          {/* 备注 */}
          {outlineData.notes && (
            <Card 
              size="small" 
              style={{ 
                background: '#f6ffed',
                border: '1px dashed #b7eb8f'
              }}
              bodyStyle={{ padding: '12px' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>备注</Text>
                <Paragraph style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                  {outlineData.notes}
                </Paragraph>
              </Space>
            </Card>
          )}
          
          {/* 项目目标提醒 */}
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

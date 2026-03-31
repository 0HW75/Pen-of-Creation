import React from 'react';
import { List, Card, Row, Col, Space, Typography, Progress, Button, Tag } from 'antd';
import {
  PlayCircleOutlined, CheckCircleOutlined, LoadingOutlined,
  ThunderboltOutlined, UserOutlined, EnvironmentOutlined, TeamOutlined,
  GlobalOutlined, BankOutlined, ShoppingOutlined, HistoryOutlined, LinkOutlined,
  CloudOutlined, RocketOutlined, ExperimentOutlined, ClockCircleOutlined,
  UsergroupAddOutlined, CalendarOutlined, CrownOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const batchTypeConfig = {
  character: { title: '主要角色', icon: <UserOutlined />, color: '#1890ff', priority: 'P0' },
  location: { title: '地点场景', icon: <EnvironmentOutlined />, color: '#52c41a', priority: 'P0' },
  faction: { title: '组织势力', icon: <TeamOutlined />, color: '#fa8c16', priority: 'P1' },
  dimension: { title: '维度/位面', icon: <GlobalOutlined />, color: '#722ed1', priority: 'P1' },
  region: { title: '地理区域', icon: <CloudOutlined />, color: '#13c2c2', priority: 'P1' },
  celestial_body: { title: '天体', icon: <RocketOutlined />, color: '#fa8c16', priority: 'P1' },
  natural_law: { title: '自然法则', icon: <ExperimentOutlined />, color: '#f5222d', priority: 'P1' },
  energy_system: { title: '能量体系', icon: <ThunderboltOutlined />, color: '#f5222d', priority: 'P0' },
  civilization: { title: '文明体系', icon: <BankOutlined />, color: '#13c2c2', priority: 'P1' },
  social_class: { title: '社会阶层', icon: <CrownOutlined />, color: '#fa541c', priority: 'P1' },
  political_system: { title: '政治体系', icon: <TeamOutlined />, color: '#722ed1', priority: 'P2' },
  economic_system: { title: '经济体系', icon: <BankOutlined />, color: '#52c41a', priority: 'P2' },
  cultural_custom: { title: '文化习俗', icon: <HistoryOutlined />, color: '#eb2f96', priority: 'P2' },
  historical_era: { title: '历史纪元', icon: <ClockCircleOutlined />, color: '#fa541c', priority: 'P2' },
  historical_event: { title: '历史事件', icon: <CalendarOutlined />, color: '#fa8c16', priority: 'P2' },
  historical_figure: { title: '历史人物', icon: <UsergroupAddOutlined />, color: '#1890ff', priority: 'P2' },
  item: { title: '物品资源', icon: <ShoppingOutlined />, color: '#eb2f96', priority: 'P2' },
  relation: { title: '关系网络', icon: <LinkOutlined />, color: '#2f54eb', priority: 'P3' },
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'completed':
      return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    case 'generating':
      return <LoadingOutlined style={{ color: '#1890ff' }} spin />;
    case 'failed':
      return <Text type="danger">失败</Text>;
    default:
      return <PlayCircleOutlined style={{ color: '#8c8c8c' }} />;
  }
};

const BatchList = ({ batches, batchStatuses, onGenerateBatch }) => {
  return (
    <List
      grid={{ gutter: 16, column: 1 }}
      dataSource={batches}
      renderItem={(batch, index) => {
        if (!batch) return null;
        const config = batchTypeConfig[batch.type] || {
          title: batch.type || '未知类型',
          icon: <PlayCircleOutlined />,
          color: '#8c8c8c',
          priority: 'P2'
        };
        const status = batchStatuses[batch.batch_id] || { status: 'pending', progress: 0 };

        return (
          <List.Item>
            <Card
              size="small"
              style={{
                borderLeft: `4px solid ${config.color}`,
                opacity: status.status === 'completed' ? 0.8 : 1
              }}
            >
              <Row justify="space-between" align="middle">
                <Col flex="auto">
                  <Space>
                    {getStatusIcon(status.status)}
                    <span style={{ color: config.color }}>{config.icon}</span>
                    <Text strong>{batch.batch_name || '未命名批次'}</Text>
                    <Tag color={config.color}>{config.priority}</Tag>
                    <Text type="secondary">
                      {batch.element_count || batch.elements?.length || 0} 个元素
                    </Text>
                    <Text type="secondary">
                      预计 {batch.estimated_time || '未知'}
                    </Text>
                  </Space>
                </Col>
                <Col>
                  <Space>
                    {status.status === 'generating' && (
                      <Progress
                        percent={status.progress}
                        size="small"
                        style={{ width: 100 }}
                      />
                    )}
                    <Button
                      type={status.status === 'completed' ? 'default' : 'primary'}
                      size="small"
                      icon={status.status === 'completed' ? <CheckCircleOutlined /> : <PlayCircleOutlined />}
                      onClick={() => onGenerateBatch(index)}
                      disabled={status.status === 'generating' || status.status === 'completed'}
                      loading={status.status === 'generating'}
                    >
                      {status.status === 'completed' ? '已完成' :
                       status.status === 'generating' ? '生成中...' : '生成'}
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>
          </List.Item>
        );
      }}
    />
  );
};

export { batchTypeConfig, getStatusIcon };
export default BatchList;
import React, { useState } from 'react';
import { Card, Checkbox, Button, Space, Typography, Row, Col, Badge, Tabs } from 'antd';
import { 
  UserOutlined, EnvironmentOutlined, TeamOutlined, ShoppingOutlined,
  GlobalOutlined, ThunderboltOutlined, BankOutlined, HistoryOutlined,
  LinkOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// 模块配置 - 与数据库 9 种类型对应
const moduleConfig = {
  characters: { title: '角色库', icon: <UserOutlined />, color: '#1890ff' },
  locations: { title: '地点场景', icon: <EnvironmentOutlined />, color: '#52c41a' },
  factions: { title: '组织势力', icon: <TeamOutlined />, color: '#fa8c16' },
  items: { title: '物品资源', icon: <ShoppingOutlined />, color: '#eb2f96' },
  world_architecture: { title: '世界架构', icon: <GlobalOutlined />, color: '#722ed1' },
  energy_systems: { title: '能量体系', icon: <ThunderboltOutlined />, color: '#f5222d' },
  society_systems: { title: '社会体系', icon: <BankOutlined />, color: '#13c2c2' },
  timeline_events: { title: '历史脉络', icon: <HistoryOutlined />, color: '#fa541c' },
  relations: { title: '关系网络', icon: <LinkOutlined />, color: '#2f54eb' },
};

const Step2ConfirmList = ({ elements, selectedElements, onComplete, onPrev, loading }) => {
  const [localSelected, setLocalSelected] = useState(selectedElements);

  const handleCheckChange = (moduleKey, elementId, checked) => {
    setLocalSelected(prev => {
      const current = prev[moduleKey] || [];
      if (checked) {
        return { ...prev, [moduleKey]: [...current, elementId] };
      } else {
        return { ...prev, [moduleKey]: current.filter(id => id !== elementId) };
      }
    });
  };

  const handleSelectAll = (moduleKey, checked) => {
    setLocalSelected(prev => {
      if (checked) {
        const allIds = elements[moduleKey]?.map(el => el.id) || [];
        return { ...prev, [moduleKey]: allIds };
      } else {
        return { ...prev, [moduleKey]: [] };
      }
    });
  };

  const handleSubmit = () => {
    onComplete(localSelected);
  };

  const getSelectedCount = (moduleKey) => {
    return localSelected[moduleKey]?.length || 0;
  };

  const getTotalCount = (moduleKey) => {
    return elements[moduleKey]?.length || 0;
  };

  // 过滤出有数据的模块
  const availableModules = Object.keys(moduleConfig).filter(
    key => elements[key] && elements[key].length > 0
  );

  return (
    <div style={{ padding: '20px 0' }}>
      <Title level={4} style={{ marginBottom: 24 }}>
        确认待生成设定清单
      </Title>
      
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        请勾选需要生成的设定条目，取消勾选不需要的条目
      </Text>

      <Tabs defaultActiveKey={availableModules[0]} type="card">
        {availableModules.map(moduleKey => {
          const config = moduleConfig[moduleKey];
          const moduleElements = elements[moduleKey] || [];
          const selectedCount = getSelectedCount(moduleKey);
          const totalCount = getTotalCount(moduleKey);

          return (
            <TabPane
              key={moduleKey}
              tab={
                <span>
                  {config.icon}
                  {config.title}
                  <Badge 
                    count={selectedCount} 
                    style={{ marginLeft: 8, backgroundColor: config.color }}
                    showZero
                  />
                </span>
              }
            >
              <Card 
                size="small" 
                title={
                  <Space>
                    <Checkbox
                      checked={selectedCount === totalCount && totalCount > 0}
                      indeterminate={selectedCount > 0 && selectedCount < totalCount}
                      onChange={(e) => handleSelectAll(moduleKey, e.target.checked)}
                    >
                      全选
                    </Checkbox>
                    <Text type="secondary">
                      已选择 {selectedCount} / {totalCount} 个
                    </Text>
                  </Space>
                }
              >
                <Row gutter={[8, 8]}>
                  {moduleElements.map(element => (
                    <Col span={24} key={element.id}>
                      <Card 
                        size="small" 
                        style={{ 
                          borderLeft: `3px solid ${config.color}`,
                          opacity: localSelected[moduleKey]?.includes(element.id) ? 1 : 0.5
                        }}
                      >
                        <Checkbox
                          checked={localSelected[moduleKey]?.includes(element.id)}
                          onChange={(e) => handleCheckChange(moduleKey, element.id, e.target.checked)}
                        >
                          <Space direction="vertical" style={{ alignItems: 'flex-start' }}>
                            <Text strong>{element.name}</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {element.brief}
                            </Text>
                            {element.evidence && (
                              <Text type="secondary" style={{ fontSize: 11 }}>
                                来源：{element.evidence.substring(0, 50)}...
                              </Text>
                            )}
                          </Space>
                        </Checkbox>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            </TabPane>
          );
        })}
      </Tabs>

      <Row justify="space-between" style={{ marginTop: 32 }}>
        <Col>
          <Button size="large" onClick={onPrev}>
            上一步
          </Button>
        </Col>
        <Col>
          <Button 
            type="primary" 
            size="large" 
            onClick={handleSubmit}
            loading={loading}
            disabled={Object.values(localSelected).flat().length === 0}
          >
            下一步：创建生成批次
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default Step2ConfirmList;

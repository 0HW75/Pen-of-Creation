import React, { useState, useEffect } from 'react';
import { Card, Checkbox, Button, Space, Typography, Row, Col, Badge, Tabs, message, Spin, Tag, Tooltip } from 'antd';
import {
  UserOutlined, EnvironmentOutlined, TeamOutlined, ShoppingOutlined,
  GlobalOutlined, ThunderboltOutlined, BankOutlined, HistoryOutlined,
  LinkOutlined, MergeCellsOutlined, ReloadOutlined, CrownOutlined,
  ApartmentOutlined, FlagOutlined, MoneyCollectOutlined, CustomerServiceOutlined
} from '@ant-design/icons';
import { worldviewGenerationApi } from '../../services/api';

const { Title, Text } = Typography;

// 模块配置 - 与后端 18 种类型对应
const moduleConfig = {
  characters: { title: '角色库', icon: <UserOutlined />, color: '#1890ff' },
  locations: { title: '地点场景', icon: <EnvironmentOutlined />, color: '#52c41a' },
  factions: { title: '组织势力', icon: <TeamOutlined />, color: '#fa8c16' },
  items: { title: '物品资源', icon: <ShoppingOutlined />, color: '#eb2f96' },
  dimensions: { title: '维度/位面', icon: <GlobalOutlined />, color: '#722ed1' },
  regions: { title: '地理区域', icon: <EnvironmentOutlined />, color: '#13c2c2' },
  celestial_bodies: { title: '天体', icon: <GlobalOutlined />, color: '#fa8c16' },
  natural_laws: { title: '自然法则', icon: <ThunderboltOutlined />, color: '#f5222d' },
  energy_systems: { title: '能量体系', icon: <ThunderboltOutlined />, color: '#f5222d' },
  civilizations: { title: '文明体系', icon: <BankOutlined />, color: '#13c2c2' },
  social_classes: { title: '社会阶层', icon: <ApartmentOutlined />, color: '#52c41a' },
  political_systems: { title: '政治体系', icon: <FlagOutlined />, color: '#fa8c16' },
  economic_systems: { title: '经济体系', icon: <MoneyCollectOutlined />, color: '#eb2f96' },
  cultural_customs: { title: '文化习俗', icon: <CustomerServiceOutlined />, color: '#722ed1' },
  historical_eras: { title: '历史纪元', icon: <HistoryOutlined />, color: '#fa541c' },
  historical_events: { title: '历史事件', icon: <HistoryOutlined />, color: '#fa541c' },
  historical_figures: { title: '历史人物', icon: <UserOutlined />, color: '#1890ff' },
  relations: { title: '关系网络', icon: <LinkOutlined />, color: '#2f54eb' },
};

const Step2ConfirmList = ({ elements, selectedElements, onComplete, onPrev, loading, onElementsUpdate }) => {
  const [localSelected, setLocalSelected] = useState(selectedElements);
  const [integrating, setIntegrating] = useState(false);
  const [integratedCount, setIntegratedCount] = useState(null);
  const [isIntegrated, setIsIntegrated] = useState(false);
  const [currentElements, setCurrentElements] = useState(elements);
  const [integrationProgress, setIntegrationProgress] = useState([]);

  useEffect(() => {
    setCurrentElements(elements);
  }, [elements]);

  const handleIntegrate = async () => {
    setIntegrating(true);
    setIntegrationProgress([]);
    setIsIntegrated(false);
    
    try {
      const response = await worldviewGenerationApi.integrateElementsStream(currentElements);
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let allIntegrated = {};
      let allSelected = {};
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'progress') {
                setIntegrationProgress(prev => [...prev, data.message]);
              } else if (data.type === 'type_complete') {
                setIntegrationProgress(prev => [...prev, data.message]);
                allIntegrated[data.element_type] = currentElements[data.element_type] || [];
                if (data.integrated_items) {
                  allIntegrated[data.element_type] = data.integrated_items;
                }
              } else if (data.type === 'complete') {
                setCurrentElements(data.integrated_elements);
                setIntegratedCount(data.integration_info.merged_groups);
                setIsIntegrated(true);
                
                if (onElementsUpdate) {
                  onElementsUpdate(data.integrated_elements);
                }
                
                const newSelected = {};
                // 初始化所有模块的选择状态
                Object.keys(moduleConfig).forEach(key => {
                  newSelected[key] = [];
                });
                // 设置有数据的元素的选择状态
                Object.keys(data.integrated_elements).forEach(key => {
                  newSelected[key] = data.integrated_elements[key].map(el => el.id);
                });
                setLocalSelected(newSelected);
                
                setIntegrationProgress(prev => [...prev, data.message]);
                message.success(data.message);
              } else if (data.type === 'error') {
                message.error(data.message);
              }
            } catch (e) {
              console.error('解析流数据失败:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('整合失败:', error);
      message.error('整合失败: ' + (error.message || '未知错误'));
    } finally {
      setIntegrating(false);
    }
  };

  const handleReIntegrate = () => {
    setIsIntegrated(false);
    setIntegratedCount(null);
    setIntegrationProgress([]);
  };

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
        const allIds = currentElements[moduleKey]?.map(el => el.id) || [];
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
    return currentElements[moduleKey]?.length || 0;
  };

  // 显示所有模块（包括空数据的）
  const availableModules = Object.keys(moduleConfig);

  return (
    <div style={{ padding: '20px 0' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            确认待生成设定清单
          </Title>
        </Col>
        <Col>
          <Space>
            {isIntegrated && (
              <Tag color="green" icon={<MergeCellsOutlined />}>
                已整合 {integratedCount} 组相似条目
              </Tag>
            )}
            <Tooltip title={isIntegrated ? "点击重新整合" : "使用AI智能合并名称相似或内容重复的条目"}>
              <Button 
                type={isIntegrated ? "default" : "primary"}
                icon={isIntegrated ? <ReloadOutlined /> : <MergeCellsOutlined />}
                onClick={isIntegrated ? handleReIntegrate : handleIntegrate}
                loading={integrating}
              >
                {integrating ? 'AI整合中...' : isIntegrated ? '重新整合' : 'AI整合相似条目'}
              </Button>
            </Tooltip>
          </Space>
        </Col>
      </Row>
      
      {integrationProgress.length > 0 && (
        <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }}>
          <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
            <ThunderboltOutlined /> 整合进度
          </Typography.Text>
          {integrationProgress.map((msg, idx) => (
            <div key={idx} style={{ fontSize: 12, color: '#52c41a' }}>
              {idx + 1}. {msg}
            </div>
          ))}
        </Card>
      )}
      
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        请勾选需要生成的设定条目，取消勾选不需要的条目。点击"AI整合相似条目"可自动合并重复内容。
      </Text>

      <Spin spinning={integrating} tip="AI正在分析并整合相似条目...">
        <Tabs defaultActiveKey={availableModules[0]} type="card" items={
          availableModules.map(moduleKey => {
            const config = moduleConfig[moduleKey];
            const moduleElements = currentElements[moduleKey] || [];
            const selectedCount = getSelectedCount(moduleKey);
            const totalCount = getTotalCount(moduleKey);

            return {
              key: moduleKey,
              label: (
                <span>
                  {config.icon}
                  {config.title}
                  <Badge
                    count={selectedCount}
                    style={{ marginLeft: 8, backgroundColor: config.color }}
                    showZero
                  />
                </span>
              ),
              children: (
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
                    {moduleElements.map((element, idx) => (
                      <Col span={24} key={`${moduleKey}-${idx}`}>
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
                              {element.is_integrated && (
                                <Tag color="blue" style={{ marginTop: 4 }}>
                                  已整合 {element.integrated_count} 个相似条目
                                </Tag>
                              )}
                            </Space>
                          </Checkbox>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Card>
              )
            };
          })
        } />
      </Spin>

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

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Space, Button, Modal, Form, Select, InputNumber, Input, message, Collapse, Tag, Divider } from 'antd';
import {
  LinkOutlined, UserOutlined, EnvironmentOutlined,
  BankOutlined, ShoppingOutlined, TeamOutlined,
  PlusOutlined, HeartOutlined, ThunderboltOutlined,
  SwapOutlined, HomeOutlined, CrownOutlined,
  NodeIndexOutlined, ArrowRightOutlined
} from '@ant-design/icons';
import {
  characterApi, locationApi, itemApi, factionApi, tagsRelationsApi
} from '../../../services/api';
import RelationNetworkGraph from './RelationNetworkGraph';
import RelationManagement from './RelationManagement';

const { Option } = Select;
const { Panel } = Collapse;

// 关系网络面板（增强版）
const RelationsPanel = ({ worldId }) => {
  const [stats, setStats] = useState({
    characterRelations: 0,
    factionRelations: 0,
    locationRelations: 0,
    itemRelations: 0,
    totalRelations: 0
  });
  const [loading, setLoading] = useState(true);
  const [quickRelationModalVisible, setQuickRelationModalVisible] = useState(false);
  const [quickRelationType, setQuickRelationType] = useState(null);
  const [customRelationModalVisible, setCustomRelationModalVisible] = useState(false);
  const [entities, setEntities] = useState({
    characters: [],
    locations: [],
    items: [],
    factions: []
  });
  const [form] = Form.useForm();
  const [customForm] = Form.useForm();
  const [sourceType, setSourceType] = useState(undefined);
  const [targetType, setTargetType] = useState(undefined);

  // 实体类型配置
  const entityTypeConfig = {
    character: { name: '角色', color: '#1890ff', icon: <UserOutlined />, entities: 'characters' },
    location: { name: '地点', color: '#52c41a', icon: <EnvironmentOutlined />, entities: 'locations' },
    item: { name: '物品', color: '#faad14', icon: <ShoppingOutlined />, entities: 'items' },
    faction: { name: '势力', color: '#722ed1', icon: <BankOutlined />, entities: 'factions' }
  };

  useEffect(() => {
    loadRelationStats();
    loadEntities();
  }, [worldId]);

  const loadRelationStats = async () => {
    setLoading(true);
    try {
      // 并行加载各类数据来计算关系统计
      const [charactersRes, factionsRes, locationsRes, itemsRes] = await Promise.all([
        characterApi.getCharacters(null, worldId).catch(() => ({ data: [] })),
        factionApi.getFactions(null, worldId).catch(() => ({ data: [] })),
        locationApi.getLocations(null, worldId).catch(() => ({ data: [] })),
        itemApi.getItems(null, worldId).catch(() => ({ data: [] }))
      ]);

      const characters = charactersRes.data || [];
      const factions = factionsRes.data || [];
      const locations = locationsRes.data || [];
      const items = itemsRes.data || [];

      // 计算关联数量（基于各实体间的引用关系）
      const characterWithFaction = characters.filter(c => c.faction).length;
      const characterWithLocation = characters.filter(c => c.current_location).length;
      const factionWithLocation = factions.filter(f => f.headquarters_location).length;
      const itemWithOwner = items.filter(i => i.current_owner).length;

      setStats({
        characterRelations: characterWithFaction + characterWithLocation,
        factionRelations: factionWithLocation,
        locationRelations: 0,
        itemRelations: itemWithOwner,
        totalRelations: characterWithFaction + characterWithLocation + factionWithLocation + itemWithOwner
      });
    } catch (error) {
      console.error('加载关系统计失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEntities = async () => {
    if (!worldId) return;
    try {
      const [charactersRes, factionsRes, locationsRes, itemsRes] = await Promise.all([
        characterApi.getCharacters(null, worldId).catch(() => ({ data: [] })),
        factionApi.getFactions(null, worldId).catch(() => ({ data: [] })),
        locationApi.getLocations(null, worldId).catch(() => ({ data: [] })),
        itemApi.getItems(null, worldId).catch(() => ({ data: [] }))
      ]);

      setEntities({
        characters: charactersRes.data || [],
        factions: factionsRes.data || [],
        locations: locationsRes.data || [],
        items: itemsRes.data || []
      });
    } catch (error) {
      console.error('加载实体数据失败:', error);
    }
  };

  const relationTypes = [
    { name: '角色-势力', count: stats.characterRelations, color: '#1890ff', icon: <UserOutlined /> },
    { name: '角色-地点', count: stats.characterRelations, color: '#52c41a', icon: <EnvironmentOutlined /> },
    { name: '势力-地点', count: stats.factionRelations, color: '#722ed1', icon: <BankOutlined /> },
    { name: '物品-持有者', count: stats.itemRelations, color: '#faad14', icon: <ShoppingOutlined /> },
  ];

  const quickRelationOptions = [
    { key: 'character-faction', name: '角色加入势力', icon: <UserOutlined />, color: '#1890ff', defaultRelation: '隶属' },
    { key: 'character-location', name: '角色移动到地点', icon: <EnvironmentOutlined />, color: '#52c41a', defaultRelation: '位于' },
    { key: 'item-character', name: '物品分配给角色', icon: <ShoppingOutlined />, color: '#faad14', defaultRelation: '拥有' },
    { key: 'faction-location', name: '势力占领地点', icon: <BankOutlined />, color: '#722ed1', defaultRelation: '占领' },
  ];

  // 打开自定义关联模态框
  const handleOpenCustomRelation = () => {
    setCustomRelationModalVisible(true);
    customForm.resetFields();
    setSourceType(undefined);
    setTargetType(undefined);
  };

  // 提交自定义关联
  const handleCustomRelationSubmit = async (values) => {
    try {
      // 处理 relation_type，如果是数组则取第一个值
      let relationType = values.relation_type;
      if (Array.isArray(relationType)) {
        relationType = relationType[0] || '';
      }

      const relationData = {
        world_id: worldId,
        source_type: values.source_type,
        source_id: values.source_id,
        target_type: values.target_type,
        target_id: values.target_id,
        relation_type: relationType,
        strength: values.strength || 5,
        description: values.description || '',
        is_bidirectional: values.is_bidirectional === true || values.is_bidirectional === 'true'
      };

      await tagsRelationsApi.createEntityRelation(relationData);
      message.success('关联创建成功');
      setCustomRelationModalVisible(false);
      loadRelationStats();
    } catch (error) {
      console.error('创建关联失败:', error);
      message.error('创建关联失败: ' + (error.response?.data?.message || error.message));
    }
  };

  // 获取实体选项
  const getEntityOptionsByType = (type) => {
    if (!type) return [];
    const config = entityTypeConfig[type];
    return entities[config?.entities] || [];
  };

  const handleQuickRelationClick = (type) => {
    setQuickRelationType(type);
    setQuickRelationModalVisible(true);
    form.resetFields();
  };

  const handleQuickRelationSubmit = async (values) => {
    try {
      let relationData = {
        world_id: worldId,
        relation_type: values.relation_type,
        strength: values.strength || 5,
        description: values.description || '',
        is_bidirectional: true
      };

      // 根据快速关联类型设置源和目标
      switch (quickRelationType?.key) {
        case 'character-faction':
          relationData.source_type = 'character';
          relationData.source_id = values.source;
          relationData.target_type = 'faction';
          relationData.target_id = values.target;
          break;
        case 'character-location':
          relationData.source_type = 'character';
          relationData.source_id = values.source;
          relationData.target_type = 'location';
          relationData.target_id = values.target;
          break;
        case 'item-character':
          relationData.source_type = 'item';
          relationData.source_id = values.source;
          relationData.target_type = 'character';
          relationData.target_id = values.target;
          break;
        case 'faction-location':
          relationData.source_type = 'faction';
          relationData.source_id = values.source;
          relationData.target_type = 'location';
          relationData.target_id = values.target;
          break;
        default:
          break;
      }

      await tagsRelationsApi.createEntityRelation(relationData);
      message.success('关系创建成功');
      setQuickRelationModalVisible(false);
      loadRelationStats();
    } catch (error) {
      console.error('创建关系失败:', error);
      message.error('创建关系失败: ' + (error.response?.data?.message || error.message));
    }
  };

  const getQuickRelationForm = () => {
    if (!quickRelationType) return null;

    switch (quickRelationType.key) {
      case 'character-faction':
        return (
          <>
            <Form.Item
              name="source"
              label="选择角色"
              rules={[{ required: true, message: '请选择角色' }]}
            >
              <Select placeholder="选择角色" showSearch optionFilterProp="children">
                {entities.characters.map(c => (
                  <Option key={c.id} value={c.id}>{c.name}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="target"
              label="选择势力"
              rules={[{ required: true, message: '请选择势力' }]}
            >
              <Select placeholder="选择势力" showSearch optionFilterProp="children">
                {entities.factions.map(f => (
                  <Option key={f.id} value={f.id}>{f.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </>
        );
      case 'character-location':
        return (
          <>
            <Form.Item
              name="source"
              label="选择角色"
              rules={[{ required: true, message: '请选择角色' }]}
            >
              <Select placeholder="选择角色" showSearch optionFilterProp="children">
                {entities.characters.map(c => (
                  <Option key={c.id} value={c.id}>{c.name}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="target"
              label="选择地点"
              rules={[{ required: true, message: '请选择地点' }]}
            >
              <Select placeholder="选择地点" showSearch optionFilterProp="children">
                {entities.locations.map(l => (
                  <Option key={l.id} value={l.id}>{l.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </>
        );
      case 'item-character':
        return (
          <>
            <Form.Item
              name="source"
              label="选择物品"
              rules={[{ required: true, message: '请选择物品' }]}
            >
              <Select placeholder="选择物品" showSearch optionFilterProp="children">
                {entities.items.map(i => (
                  <Option key={i.id} value={i.id}>{i.name}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="target"
              label="选择持有者"
              rules={[{ required: true, message: '请选择持有者' }]}
            >
              <Select placeholder="选择持有者" showSearch optionFilterProp="children">
                {entities.characters.map(c => (
                  <Option key={c.id} value={c.id}>{c.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </>
        );
      case 'faction-location':
        return (
          <>
            <Form.Item
              name="source"
              label="选择势力"
              rules={[{ required: true, message: '请选择势力' }]}
            >
              <Select placeholder="选择势力" showSearch optionFilterProp="children">
                {entities.factions.map(f => (
                  <Option key={f.id} value={f.id}>{f.name}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="target"
              label="选择地点"
              rules={[{ required: true, message: '请选择地点' }]}
            >
              <Select placeholder="选择地点" showSearch optionFilterProp="children">
                {entities.locations.map(l => (
                  <Option key={l.id} value={l.id}>{l.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relations-panel">
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card title="关系统计" loading={loading}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <div className="relation-stat-item" style={{ textAlign: 'center', padding: '20px', background: '#f6ffed', borderRadius: '8px' }}>
                  <div style={{ fontSize: '32px', color: '#52c41a', marginBottom: '8px' }}>
                    <LinkOutlined />
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>{stats.totalRelations}</div>
                  <div style={{ color: '#666' }}>总关联数</div>
                </div>
              </Col>
              {relationTypes.map((type, index) => (
                <Col xs={12} sm={6} key={index}>
                  <div className="relation-stat-item" style={{ textAlign: 'center', padding: '20px', background: `${type.color}10`, borderRadius: '8px' }}>
                    <div style={{ fontSize: '24px', color: type.color, marginBottom: '8px' }}>
                      {type.icon}
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: type.color }}>{type.count}</div>
                    <div style={{ color: '#666', fontSize: '12px' }}>{type.name}</div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        <Col lg={16}>
          <Card title="关系网络图" style={{ minHeight: '600px' }}>
            <RelationNetworkGraph worldId={worldId} height={520} />
          </Card>
        </Col>

        <Col lg={8}>
          <Card title="关联操作" style={{ minHeight: '600px' }}>
            {/* 新建关联按钮 */}
            <Button
              type="primary"
              size="large"
              icon={<NodeIndexOutlined />}
              onClick={handleOpenCustomRelation}
              style={{ width: '100%', marginBottom: 24, height: 48, fontSize: 16 }}
            >
              新建关联
            </Button>

            <Divider style={{ margin: '16px 0' }}>
              <span style={{ color: '#999', fontSize: 12 }}>快速关联模板</span>
            </Divider>

            <div className="quick-relations">
              {quickRelationOptions.map((option) => (
                <div
                  key={option.key}
                  className="quick-relation-item"
                  style={{
                    padding: '12px 16px',
                    marginBottom: '10px',
                    background: '#f5f5f5',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    border: `2px solid transparent`
                  }}
                  onClick={() => handleQuickRelationClick(option)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${option.color}10`;
                    e.currentTarget.style.borderColor = option.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f5f5f5';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <Space>
                    <span style={{ color: option.color, fontSize: '16px' }}>{option.icon}</span>
                    <span style={{ fontWeight: 500, fontSize: 13 }}>{option.name}</span>
                  </Space>
                  <PlusOutlined style={{ float: 'right', color: option.color, fontSize: 14 }} />
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24, padding: '16px', background: '#fafafa', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: 12, fontSize: 14 }}>💡 使用说明</h4>
              <p style={{ color: '#666', fontSize: '12px', lineHeight: '1.6', marginBottom: 8 }}>
                <strong>新建关联：</strong>自由创建任意两个实体之间的关联关系，支持角色-角色、势力-势力等所有组合。
              </p>
              <p style={{ color: '#666', fontSize: '12px', lineHeight: '1.6' }}>
                <strong>快速关联：</strong>使用预设模板快速创建常见关联类型。
              </p>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 关系管理表格 */}
      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <RelationManagement worldId={worldId} />
        </Col>
      </Row>

      {/* 快速关联模态框 */}
      <Modal
        title={quickRelationType?.name}
        open={quickRelationModalVisible}
        onCancel={() => setQuickRelationModalVisible(false)}
        onOk={() => form.submit()}
        okText="创建关系"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleQuickRelationSubmit}
        >
          {getQuickRelationForm()}
          <Form.Item
            name="relation_type"
            label="关系类型"
            rules={[{ required: true, message: '请输入关系类型' }]}
            initialValue={quickRelationType?.defaultRelation || '关联'}
          >
            <Input placeholder="例如：隶属、拥有、位于..." />
          </Form.Item>
          <Form.Item
            name="strength"
            label="关系强度"
            initialValue={5}
          >
            <InputNumber min={1} max={10} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="description"
            label="关系描述"
          >
            <Input.TextArea rows={3} placeholder="可选：描述关系的详细信息" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 自定义关联模态框 */}
      <Modal
        title={
          <Space>
            <NodeIndexOutlined />
            <span>新建关联</span>
          </Space>
        }
        open={customRelationModalVisible}
        onCancel={() => setCustomRelationModalVisible(false)}
        onOk={() => customForm.submit()}
        okText="创建关联"
        cancelText="取消"
        width={600}
      >
        <Form
          form={customForm}
          layout="vertical"
          onFinish={handleCustomRelationSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="source_type"
                label="源实体类型"
                rules={[{ required: true, message: '请选择源实体类型' }]}
              >
                <Select
                  placeholder="选择类型"
                  onChange={(value) => {
                    setSourceType(value);
                    customForm.setFieldsValue({ source_id: undefined });
                  }}
                >
                  {Object.entries(entityTypeConfig).map(([key, config]) => (
                    <Option key={key} value={key}>
                      <Tag color={config.color} icon={config.icon}>{config.name}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="source_id"
                label="源实体"
                rules={[{ required: true, message: '请选择源实体' }]}
              >
                <Select
                  placeholder="选择实体"
                  showSearch
                  optionFilterProp="children"
                  disabled={!sourceType}
                >
                  {getEntityOptionsByType(sourceType).map(entity => (
                    <Option key={entity.id} value={entity.id}>{entity.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <div style={{ textAlign: 'center', margin: '8px 0' }}>
            <ArrowRightOutlined style={{ fontSize: 24, color: '#999' }} />
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="target_type"
                label="目标实体类型"
                rules={[{ required: true, message: '请选择目标实体类型' }]}
              >
                <Select
                  placeholder="选择类型"
                  onChange={(value) => {
                    setTargetType(value);
                    customForm.setFieldsValue({ target_id: undefined });
                  }}
                >
                  {Object.entries(entityTypeConfig).map(([key, config]) => (
                    <Option key={key} value={key}>
                      <Tag color={config.color} icon={config.icon}>{config.name}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="target_id"
                label="目标实体"
                rules={[{ required: true, message: '请选择目标实体' }]}
              >
                <Select
                  placeholder="选择实体"
                  showSearch
                  optionFilterProp="children"
                  disabled={!targetType}
                >
                  {getEntityOptionsByType(targetType).map(entity => (
                    <Option key={entity.id} value={entity.id}>{entity.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '16px 0' }} />

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="relation_type"
                label="关联类型"
                rules={[{ required: true, message: '请输入关联类型' }]}
              >
                <Select
                  placeholder="选择或输入关联类型"
                  allowClear
                  mode="tags"
                  maxTagCount={1}
                >
                  <Option value="友谊">友谊</Option>
                  <Option value="敌对">敌对</Option>
                  <Option value="师徒">师徒</Option>
                  <Option value="亲属">亲属</Option>
                  <Option value="隶属">隶属</Option>
                  <Option value="拥有">拥有</Option>
                  <Option value="位于">位于</Option>
                  <Option value="同盟">同盟</Option>
                  <Option value="竞争">竞争</Option>
                  <Option value="合作">合作</Option>
                  <Option value="暗恋">暗恋</Option>
                  <Option value="仇恨">仇恨</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="strength"
                label="关联强度"
                initialValue={5}
              >
                <InputNumber min={1} max={10} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="关联描述"
          >
            <Input.TextArea rows={3} placeholder="描述这个关联的详细信息..." />
          </Form.Item>

          <Form.Item
            name="is_bidirectional"
            label="关联方向"
            initialValue="true"
          >
            <Select>
              <Option value="true">双向关联（A ↔ B）</Option>
              <Option value="false">单向关联（A → B）</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RelationsPanel;

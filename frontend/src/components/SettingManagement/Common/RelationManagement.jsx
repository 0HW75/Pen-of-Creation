import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Space, Tag, Modal, Form, Select, InputNumber,
  Input, Popconfirm, message, Row, Col, Tooltip, Badge
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  UserOutlined, EnvironmentOutlined, BankOutlined, ShoppingOutlined,
  ReloadOutlined, FilterOutlined
} from '@ant-design/icons';
import { tagsRelationsApi, characterApi, locationApi, itemApi, factionApi } from '../../../services/api';

const { Option } = Select;

// 实体类型配置
const ENTITY_TYPE_CONFIG = {
  character: { name: '角色', color: '#1890ff', icon: <UserOutlined /> },
  location: { name: '地点', color: '#52c41a', icon: <EnvironmentOutlined /> },
  item: { name: '物品', color: '#faad14', icon: <ShoppingOutlined /> },
  faction: { name: '势力', color: '#722ed1', icon: <BankOutlined /> }
};

const RelationManagement = ({ worldId }) => {
  const [relations, setRelations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRelation, setEditingRelation] = useState(null);
  const [entities, setEntities] = useState({
    characters: [],
    locations: [],
    items: [],
    factions: []
  });
  const [filters, setFilters] = useState({
    sourceType: undefined,
    targetType: undefined,
    relationType: undefined
  });
  const [form] = Form.useForm();
  const [sourceType, setSourceType] = useState(undefined);
  const [targetType, setTargetType] = useState(undefined);

  // 加载关系列表
  const loadRelations = useCallback(async () => {
    if (!worldId) return;
    
    setLoading(true);
    try {
      const params = { world_id: worldId };
      if (filters.sourceType) params.source_type = filters.sourceType;
      if (filters.targetType) params.target_type = filters.targetType;
      if (filters.relationType) params.relation_type = filters.relationType;
      
      const response = await tagsRelationsApi.getEntityRelations(
        params.world_id,
        params.source_type,
        null,
        params.target_type,
        null,
        params.relation_type
      );
      
      if (response.data?.code === 200) {
        // 为关系数据添加实体名称
        const relationsWithNames = await Promise.all(
          response.data.data.map(async (relation) => {
            const sourceName = await getEntityName(relation.source_type, relation.source_id);
            const targetName = await getEntityName(relation.target_type, relation.target_id);
            return {
              ...relation,
              source_name: sourceName,
              target_name: targetName
            };
          })
        );
        setRelations(relationsWithNames);
      }
    } catch (error) {
      console.error('加载关系列表失败:', error);
      message.error('加载关系列表失败');
    } finally {
      setLoading(false);
    }
  }, [worldId, filters]);

  // 获取实体名称
  const getEntityName = async (type, id) => {
    try {
      let response;
      switch (type) {
        case 'character':
          response = await characterApi.getCharacter(id);
          break;
        case 'location':
          response = await locationApi.getLocation(id);
          break;
        case 'item':
          response = await itemApi.getItem(id);
          break;
        case 'faction':
          response = await factionApi.getFaction(id);
          break;
        default:
          return '未知';
      }
      // 后端直接返回实体数据，不是嵌套的 { data: ... } 格式
      return response.data?.name || response.data?.data?.name || '未知';
    } catch (error) {
      console.error(`获取实体名称失败: ${type} ${id}`, error);
      return '未知';
    }
  };

  // 加载实体列表
  const loadEntities = useCallback(async () => {
    if (!worldId) return;
    try {
      const [charactersRes, locationsRes, itemsRes, factionsRes] = await Promise.all([
        characterApi.getCharacters(null, worldId).catch(() => ({ data: { data: [] } })),
        locationApi.getLocations(null, worldId).catch(() => ({ data: { data: [] } })),
        itemApi.getItems(null, worldId).catch(() => ({ data: { data: [] } })),
        factionApi.getFactions(null, worldId).catch(() => ({ data: { data: [] } }))
      ]);

      setEntities({
        characters: charactersRes.data?.data || [],
        locations: locationsRes.data?.data || [],
        items: itemsRes.data?.data || [],
        factions: factionsRes.data?.data || []
      });
    } catch (error) {
      console.error('加载实体数据失败:', error);
    }
  }, [worldId]);

  useEffect(() => {
    loadRelations();
    loadEntities();
  }, [loadRelations, loadEntities]);

  // 表格列定义
  const columns = [
    {
      title: '源实体',
      key: 'source',
      render: (_, record) => {
        const config = ENTITY_TYPE_CONFIG[record.source_type];
        return (
          <Space>
            <Tag color={config?.color} icon={config?.icon}>
              {config?.name}
            </Tag>
            <span>{record.source_name}</span>
          </Space>
        );
      }
    },
    {
      title: '关系类型',
      dataIndex: 'relation_type',
      key: 'relation_type',
      render: (text, record) => (
        <Badge
          count={text}
          style={{
            backgroundColor: getStrengthColor(record.strength),
            fontSize: '12px',
            padding: '0 8px'
          }}
        />
      )
    },
    {
      title: '目标实体',
      key: 'target',
      render: (_, record) => {
        const config = ENTITY_TYPE_CONFIG[record.target_type];
        return (
          <Space>
            <Tag color={config?.color} icon={config?.icon}>
              {config?.name}
            </Tag>
            <span>{record.target_name}</span>
          </Space>
        );
      }
    },
    {
      title: '强度',
      dataIndex: 'strength',
      key: 'strength',
      width: 80,
      render: (strength) => (
        <Tag color={getStrengthColor(strength)}>{strength}/10</Tag>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确认删除"
            description="确定要删除这个关系吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="删除"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 获取强度对应的颜色
  const getStrengthColor = (strength) => {
    if (strength >= 8) return '#f5222d';
    if (strength >= 6) return '#fa8c16';
    if (strength >= 4) return '#1890ff';
    return '#52c41a';
  };

  // 处理创建
  const handleCreate = () => {
    setEditingRelation(null);
    form.resetFields();
    setSourceType(undefined);
    setTargetType(undefined);
    setModalVisible(true);
  };

  // 处理编辑
  const handleEdit = (record) => {
    setEditingRelation(record);
    form.setFieldsValue({
      source_type: record.source_type,
      source_id: record.source_id,
      target_type: record.target_type,
      target_id: record.target_id,
      relation_type: record.relation_type,
      strength: record.strength,
      description: record.description,
      is_bidirectional: record.is_bidirectional
    });
    setSourceType(record.source_type);
    setTargetType(record.target_type);
    setModalVisible(true);
  };

  // 处理删除
  const handleDelete = async (id) => {
    try {
      await tagsRelationsApi.deleteEntityRelation(id);
      message.success('关系删除成功');
      loadRelations();
    } catch (error) {
      console.error('删除关系失败:', error);
      message.error('删除关系失败');
    }
  };

  // 处理提交
  const handleSubmit = async (values) => {
    try {
      const data = {
        world_id: worldId,
        ...values
      };

      if (editingRelation) {
        await tagsRelationsApi.updateEntityRelation(editingRelation.id, data);
        message.success('关系更新成功');
      } else {
        await tagsRelationsApi.createEntityRelation(data);
        message.success('关系创建成功');
      }

      setModalVisible(false);
      loadRelations();
    } catch (error) {
      console.error('保存关系失败:', error);
      message.error('保存关系失败: ' + (error.response?.data?.message || error.message));
    }
  };

  // 获取实体选项
  const getEntityOptions = (type) => {
    switch (type) {
      case 'character':
        return entities.characters;
      case 'location':
        return entities.locations;
      case 'item':
        return entities.items;
      case 'faction':
        return entities.factions;
      default:
        return [];
    }
  };

  // 处理筛选变化
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // 重置筛选
  const handleResetFilters = () => {
    setFilters({
      sourceType: undefined,
      targetType: undefined,
      relationType: undefined
    });
  };

  return (
    <div className="relation-management">
      <Card
        title="实体关系管理"
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadRelations}
              loading={loading}
            >
              刷新
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              创建关系
            </Button>
          </Space>
        }
      >
        {/* 筛选栏 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Select
              placeholder="源实体类型"
              allowClear
              style={{ width: '100%' }}
              value={filters.sourceType}
              onChange={(value) => handleFilterChange('sourceType', value)}
            >
              {Object.entries(ENTITY_TYPE_CONFIG).map(([key, config]) => (
                <Option key={key} value={key}>
                  <Tag color={config.color} icon={config.icon}>{config.name}</Tag>
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Select
              placeholder="目标实体类型"
              allowClear
              style={{ width: '100%' }}
              value={filters.targetType}
              onChange={(value) => handleFilterChange('targetType', value)}
            >
              {Object.entries(ENTITY_TYPE_CONFIG).map(([key, config]) => (
                <Option key={key} value={key}>
                  <Tag color={config.color} icon={config.icon}>{config.name}</Tag>
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Input
              placeholder="关系类型"
              value={filters.relationType}
              onChange={(e) => handleFilterChange('relationType', e.target.value)}
              allowClear
            />
          </Col>
          <Col span={6}>
            <Button icon={<FilterOutlined />} onClick={handleResetFilters}>
              重置筛选
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={relations}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条关系`
          }}
        />
      </Card>

      {/* 创建/编辑模态框 */}
      <Modal
        title={editingRelation ? '编辑关系' : '创建关系'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText={editingRelation ? '更新' : '创建'}
        cancelText="取消"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
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
                    form.setFieldsValue({ source_id: undefined });
                  }}
                >
                  {Object.entries(ENTITY_TYPE_CONFIG).map(([key, config]) => (
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
                  {getEntityOptions(sourceType).map(entity => (
                    <Option key={entity.id} value={entity.id}>{entity.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

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
                    form.setFieldsValue({ target_id: undefined });
                  }}
                >
                  {Object.entries(ENTITY_TYPE_CONFIG).map(([key, config]) => (
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
                  {getEntityOptions(targetType).map(entity => (
                    <Option key={entity.id} value={entity.id}>{entity.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="relation_type"
                label="关系类型"
                rules={[{ required: true, message: '请输入关系类型' }]}
              >
                <Input placeholder="例如：友谊、敌对、师徒..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="strength"
                label="关系强度"
                initialValue={5}
              >
                <InputNumber min={1} max={10} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="关系描述"
          >
            <Input.TextArea rows={3} placeholder="描述这个关系的详细信息..." />
          </Form.Item>

          <Form.Item
            name="is_bidirectional"
            valuePropName="checked"
            initialValue={true}
          >
            <Select placeholder="是否双向关系">
              <Option value={true}>双向关系</Option>
              <Option value={false}>单向关系</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RelationManagement;

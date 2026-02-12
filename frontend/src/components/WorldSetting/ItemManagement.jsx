import React, { useState, useEffect } from 'react';
import {
  Card, Button, Table, Modal, Form, Input, Select,
  message, Space, Tag, Empty, Tabs, Row, Col, Statistic, Descriptions, InputNumber
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  ToolOutlined, ShoppingOutlined, StarOutlined,
  SafetyOutlined, ThunderboltOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import { itemApi } from '../../services/api';

const { TextArea } = Input;

// 通用物品管理组件
const GeneralItemManagement = ({ worldId, projectId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [form] = Form.useForm();

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await itemApi.getItems(projectId, worldId);
      const data = response.data || [];
      setItems(data);
    } catch (error) {
      message.error('获取物品列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (worldId) fetchItems();
  }, [worldId, projectId]);

  const handleSubmit = async (values) => {
    try {
      // 字段映射转换 - 完整数据库字段
      const data = {
        name: values.name,
        world_id: worldId,
        project_id: projectId,
        item_type: values.item_type,
        rarity_level: values.rarity_level,
        physical_properties: values.physical_properties,
        special_effects: values.special_effects,
        usage_requirements: values.usage_requirements,
        durability: values.durability,
        creator: values.creator,
        source: values.source,
        historical_heritage: values.historical_heritage,
        current_owner: values.current_owner,
        acquisition_method: values.acquisition_method,
        importance: values.importance || 5,
        description: values.description,
      };
      if (editingItem) {
        await itemApi.updateItem(editingItem.id, data);
        message.success('物品更新成功');
      } else {
        await itemApi.createItem(data);
        message.success('物品创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchItems();
    } catch (error) {
      message.error(editingItem ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await itemApi.deleteItem(id);
      message.success('删除成功');
      fetchItems();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const showDetail = (record) => {
    setSelectedItem(record);
    setDetailVisible(true);
  };

  const columns = [
    {
      title: '物品名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <ToolOutlined style={{ color: record.rarity_level === '传说' || record.rarity_level === '神话' ? '#faad14' : '#1890ff' }} />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'item_type',
      key: 'item_type',
      render: (type) => {
        const colorMap = {
          '武器': 'red',
          '防具': 'blue',
          '饰品': 'purple',
          '消耗品': 'green',
          '材料': 'orange',
          '书籍': 'cyan',
          '任务物品': 'magenta',
          '特殊': 'gold',
        };
        return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
      },
    },
    {
      title: '稀有度',
      dataIndex: 'rarity_level',
      key: 'rarity_level',
      render: (rarity) => {
        const colorMap = {
          '普通': 'default',
          '优秀': 'green',
          '稀有': 'blue',
          '史诗': 'purple',
          '传说': 'gold',
          '神话': 'red',
        };
        return <Tag color={colorMap[rarity] || 'default'}>{rarity}</Tag>;
      },
    },
    {
      title: '重要性',
      dataIndex: 'importance',
      key: 'importance',
      render: (importance) => (
        <Tag color={importance >= 8 ? 'red' : importance >= 5 ? 'orange' : 'default'}>
          {importance}/10
        </Tag>
      ),
    },
    {
      title: '当前持有者',
      dataIndex: 'current_owner',
      key: 'current_owner',
      render: (owner) => owner || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<InfoCircleOutlined />}
            onClick={() => showDetail(record)}
          >
            详情
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingItem(record);
              // 反向字段映射
              form.setFieldsValue({
                name: record.name,
                item_type: record.item_type,
                rarity_level: record.rarity_level,
                physical_properties: record.physical_properties,
                special_effects: record.special_effects,
                usage_requirements: record.usage_requirements,
                durability: record.durability,
                creator: record.creator,
                source: record.source,
                historical_heritage: record.historical_heritage,
                current_owner: record.current_owner,
                acquisition_method: record.acquisition_method,
                importance: record.importance || 5,
                description: record.description,
              });
              setModalVisible(true);
            }}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 表单标签页配置
  const formTabItems = [
    {
      key: 'basic',
      label: '基本信息',
      children: (
        <>
          <Form.Item
            name="name"
            label="物品名称"
            rules={[{ required: true, message: '请输入物品名称' }]}
          >
            <Input placeholder="例如：霜之哀伤、埃提耶什" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="item_type"
                label="物品类型"
                rules={[{ required: true }]}
                initialValue="武器"
              >
                <Select>
                  <Select.Option value="武器">武器</Select.Option>
                  <Select.Option value="防具">防具</Select.Option>
                  <Select.Option value="饰品">饰品</Select.Option>
                  <Select.Option value="消耗品">消耗品</Select.Option>
                  <Select.Option value="材料">材料</Select.Option>
                  <Select.Option value="书籍">书籍</Select.Option>
                  <Select.Option value="任务物品">任务物品</Select.Option>
                  <Select.Option value="特殊">特殊</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="rarity_level"
                label="稀有度"
                initialValue="普通"
              >
                <Select>
                  <Select.Option value="普通">普通</Select.Option>
                  <Select.Option value="优秀">优秀</Select.Option>
                  <Select.Option value="稀有">稀有</Select.Option>
                  <Select.Option value="史诗">史诗</Select.Option>
                  <Select.Option value="传说">传说</Select.Option>
                  <Select.Option value="神话">神话</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="物品描述">
            <TextArea rows={3} placeholder="描述这个物品的外观和功能..." />
          </Form.Item>
        </>
      ),
    },
    {
      key: 'properties',
      label: '属性效果',
      children: (
        <>
          <Form.Item name="physical_properties" label="物理属性">
            <TextArea rows={3} placeholder="物品的材质、尺寸、重量、外观等物理特性描述" />
          </Form.Item>
          <Form.Item name="special_effects" label="特殊效果">
            <TextArea rows={3} placeholder="该物品的特殊能力、魔法效果或属性加成" />
          </Form.Item>
          <Form.Item name="usage_requirements" label="使用条件">
            <TextArea rows={2} placeholder="使用此物品需要的等级、技能、职业或其他条件" />
          </Form.Item>
          <Form.Item name="durability" label="耐久度">
            <Input placeholder="例如：100/100，或描述性文字如'坚不可摧'" />
          </Form.Item>
        </>
      ),
    },
    {
      key: 'origin',
      label: '来源历史',
      children: (
        <>
          <Form.Item name="creator" label="制造者">
            <Input placeholder="制造此物品的人或组织" />
          </Form.Item>
          <Form.Item name="source" label="物品来源">
            <Input placeholder="例如：任务奖励、BOSS掉落、商店购买、制造获得" />
          </Form.Item>
          <Form.Item name="historical_heritage" label="历史传承">
            <TextArea rows={4} placeholder="物品的历史背景、流传经历、著名持有者等" />
          </Form.Item>
        </>
      ),
    },
    {
      key: 'ownership',
      label: '归属信息',
      children: (
        <>
          <Form.Item name="current_owner" label="当前持有者">
            <Input placeholder="物品当前持有者姓名" />
          </Form.Item>
          <Form.Item name="acquisition_method" label="获取方式">
            <Input placeholder="主角或当前持有者如何获得此物品" />
          </Form.Item>
          <Form.Item
            name="importance"
            label="重要性评级"
            initialValue={5}
          >
            <InputNumber min={1} max={10} style={{ width: '100%' }} placeholder="1-10，数值越高越重要" />
          </Form.Item>
        </>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={
          <Space>
            <ToolOutlined />
            <span>通用物品</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingItem(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            新建物品
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={items}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Card>

      {/* 创建/编辑模态框 */}
      <Modal
        title={editingItem ? '编辑物品' : '新建物品'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={800}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Tabs items={formTabItems} />
        </Form>
      </Modal>

      {/* 详情抽屉 */}
      <Modal
        title="物品详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {selectedItem && (
          <Tabs
            items={[
              {
                key: 'basic',
                label: '基本信息',
                children: (
                  <Descriptions column={2} bordered size="small">
                    <Descriptions.Item label="名称" span={2}>
                      <strong style={{ fontSize: 16 }}>{selectedItem.name}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="类型">
                      <Tag color="blue">{selectedItem.item_type}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="稀有度">
                      <Tag color={
                        selectedItem.rarity_level === '神话' ? 'red' :
                        selectedItem.rarity_level === '传说' ? 'gold' :
                        selectedItem.rarity_level === '史诗' ? 'purple' :
                        selectedItem.rarity_level === '稀有' ? 'blue' :
                        selectedItem.rarity_level === '优秀' ? 'green' : 'default'
                      }>{selectedItem.rarity_level}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="重要性">
                      <Tag color={selectedItem.importance >= 8 ? 'red' : selectedItem.importance >= 5 ? 'orange' : 'default'}>
                        {selectedItem.importance || 5}/10
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="耐久度">
                      {selectedItem.durability || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="描述" span={2}>
                      {selectedItem.description || '-'}
                    </Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: 'properties',
                label: '属性效果',
                children: (
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="物理属性">
                      {selectedItem.physical_properties || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="特殊效果">
                      {selectedItem.special_effects || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="使用条件">
                      {selectedItem.usage_requirements || '-'}
                    </Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: 'origin',
                label: '来源历史',
                children: (
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="制造者">
                      {selectedItem.creator || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="物品来源">
                      {selectedItem.source || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="历史传承">
                      {selectedItem.historical_heritage || '-'}
                    </Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: 'ownership',
                label: '归属信息',
                children: (
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="当前持有者">
                      {selectedItem.current_owner || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="获取方式">
                      {selectedItem.acquisition_method || '-'}
                    </Descriptions.Item>
                  </Descriptions>
                ),
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
};

// 物品资源管理主组件
const ItemManagement = ({ worldId, projectId }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [stats, setStats] = useState({
    total: 0,
    weapons: 0,
    armors: 0,
    consumables: 0,
  });

  useEffect(() => {
    if (worldId) {
      itemApi.getItems(projectId, worldId).then((response) => {
        const data = response.data || [];
        setStats({
          total: data.length,
          weapons: data.filter(i => i.item_type === '武器').length,
          armors: data.filter(i => i.item_type === '防具').length,
          consumables: data.filter(i => i.item_type === '消耗品').length,
        });
      });
    }
  }, [worldId, projectId]);

  const tabItems = [
    {
      key: 'general',
      label: '通用物品',
      children: <GeneralItemManagement worldId={worldId} projectId={projectId} />,
    },
    {
      key: 'equipment',
      label: '装备系统',
      children: <Empty description="装备系统功能开发中..." />,
    },
    {
      key: 'special',
      label: '特殊物品',
      children: <Empty description="特殊物品功能开发中..." />,
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="物品总数"
              value={stats.total}
              prefix={<ShoppingOutlined />}
              styles={{ content: { color: '#1890ff' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="武器"
              value={stats.weapons}
              prefix={<ThunderboltOutlined />}
              styles={{ content: { color: '#ff4d4f' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="防具"
              value={stats.armors}
              prefix={<SafetyOutlined />}
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="消耗品"
              value={stats.consumables}
              prefix={<StarOutlined />}
              styles={{ content: { color: '#faad14' } }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </div>
  );
};

export default ItemManagement;

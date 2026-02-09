import React, { useState, useEffect } from 'react';
import {
  Card, Button, Table, Modal, Form, Input, Select,
  message, Space, Tag, Empty, Tabs, Row, Col, Statistic, Descriptions
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
      const data = { ...values, world_id: worldId, project_id: projectId };
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
          <ToolOutlined style={{ color: record.rarity === '传说' ? '#faad14' : '#1890ff' }} />
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
      dataIndex: 'rarity',
      key: 'rarity',
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
      title: '持有者',
      dataIndex: 'owner',
      key: 'owner',
      render: (owner) => owner || '-',
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      render: (source) => source || '-',
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
              form.setFieldsValue(record);
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
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
                name="rarity"
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="owner" label="当前持有者">
                <Input placeholder="物品当前持有者" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="source" label="物品来源">
                <Input placeholder="例如：任务奖励、BOSS掉落" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="物品描述">
            <TextArea rows={3} placeholder="描述这个物品的外观和功能..." />
          </Form.Item>
          <Form.Item name="effects" label="物品效果">
            <TextArea rows={2} placeholder="该物品的特殊效果或属性加成" />
          </Form.Item>
          <Form.Item name="history" label="历史背景">
            <TextArea rows={2} placeholder="物品的来历和历史" />
          </Form.Item>
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
        width={600}
      >
        {selectedItem && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="名称" span={2}>
              {selectedItem.name}
            </Descriptions.Item>
            <Descriptions.Item label="类型">
              <Tag color="blue">{selectedItem.item_type}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="稀有度">
              <Tag color="gold">{selectedItem.rarity}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="持有者">
              {selectedItem.owner || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="来源">
              {selectedItem.source || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="描述" span={2}>
              {selectedItem.description || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="效果" span={2}>
              {selectedItem.effects || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="历史背景" span={2}>
              {selectedItem.history || '-'}
            </Descriptions.Item>
          </Descriptions>
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
              styles={{ content: { color: '#1890ff'  } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="武器"
              value={stats.weapons}
              prefix={<ThunderboltOutlined />}
              styles={{ content: { color: '#ff4d4f'  } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="防具"
              value={stats.armors}
              prefix={<SafetyOutlined />}
              styles={{ content: { color: '#52c41a'  } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="消耗品"
              value={stats.consumables}
              prefix={<StarOutlined />}
              styles={{ content: { color: '#faad14'  } }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </div>
  );
};

export default ItemManagement;

import React, { useState, useEffect } from 'react';
import {
  Card, Button, Table, Modal, Form, Input, Select, Tree,
  message, Space, Tag, Empty, Tabs, Row, Col, Statistic, Divider, Descriptions
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  EnvironmentOutlined, HomeOutlined, StarOutlined,
  ApartmentOutlined, GlobalOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import { locationApi } from '../../services/api';

const { TextArea } = Input;

// 地点档案管理组件
const LocationArchiveManagement = ({ worldId, projectId }) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [form] = Form.useForm();

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const response = await locationApi.getLocations(projectId);
      const data = response.data || [];
      setLocations(data);
    } catch (error) {
      message.error('获取地点列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (worldId) fetchLocations();
  }, [worldId]);

  const handleSubmit = async (values) => {
    try {
      const data = { ...values, world_id: worldId, project_id: projectId };
      if (editingLocation) {
        await locationApi.updateLocation(editingLocation.id, data);
        message.success('地点更新成功');
      } else {
        await locationApi.createLocation(data);
        message.success('地点创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchLocations();
    } catch (error) {
      message.error(editingLocation ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await locationApi.deleteLocation(id);
      message.success('删除成功');
      fetchLocations();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const showDetail = (record) => {
    setSelectedLocation(record);
    setDetailVisible(true);
  };

  const columns = [
    {
      title: '地点名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <EnvironmentOutlined style={{ color: '#52c41a' }} />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'location_type',
      key: 'location_type',
      render: (type) => {
        const colorMap = {
          '城市': 'blue',
          '村庄': 'green',
          '要塞': 'red',
          '遗迹': 'purple',
          '森林': 'cyan',
          '山脉': 'orange',
          '水域': 'geekblue',
          '地下城': 'magenta',
          '特殊': 'gold',
        };
        return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
      },
    },
    {
      title: '控制势力',
      dataIndex: 'controlling_faction',
      key: 'controlling_faction',
      render: (faction) => faction || '-',
    },
    {
      title: '人口',
      dataIndex: 'population',
      key: 'population',
      render: (pop) => pop || '-',
    },
    {
      title: '气候',
      dataIndex: 'climate',
      key: 'climate',
      render: (climate) => climate || '-',
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
              setEditingLocation(record);
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
            <EnvironmentOutlined />
            <span>地点档案</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingLocation(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            新建地点
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={locations}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Card>

      {/* 创建/编辑模态框 */}
      <Modal
        title={editingLocation ? '编辑地点' : '新建地点'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="地点名称"
            rules={[{ required: true, message: '请输入地点名称' }]}
          >
            <Input placeholder="例如：暴风城、艾尔文森林" />
          </Form.Item>
          <Form.Item
            name="location_type"
            label="地点类型"
            rules={[{ required: true }]}
            initialValue="城市"
          >
            <Select>
              <Select.Option value="城市">城市</Select.Option>
              <Select.Option value="村庄">村庄</Select.Option>
              <Select.Option value="要塞">要塞</Select.Option>
              <Select.Option value="遗迹">遗迹</Select.Option>
              <Select.Option value="森林">森林</Select.Option>
              <Select.Option value="山脉">山脉</Select.Option>
              <Select.Option value="水域">水域</Select.Option>
              <Select.Option value="地下城">地下城</Select.Option>
              <Select.Option value="特殊">特殊</Select.Option>
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="controlling_faction" label="控制势力">
                <Input placeholder="例如：暴风王国" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="population" label="人口规模">
                <Input placeholder="例如：20万" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="climate" label="气候类型">
                <Input placeholder="例如：温带海洋性" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="terrain" label="地形特征">
                <Input placeholder="例如：平原、丘陵" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="地点描述">
            <TextArea rows={3} placeholder="描述这个地点的基本情况..." />
          </Form.Item>
          <Form.Item name="geography" label="地理特征">
            <TextArea rows={2} placeholder="详细的地形、地貌描述" />
          </Form.Item>
          <Form.Item name="resources" label="资源特产">
            <TextArea rows={2} placeholder="该地点的特产和资源" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情抽屉 */}
      <Modal
        title="地点详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {selectedLocation && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="名称" span={2}>
              {selectedLocation.name}
            </Descriptions.Item>
            <Descriptions.Item label="类型">
              <Tag color="blue">{selectedLocation.location_type}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="控制势力">
              {selectedLocation.controlling_faction || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="人口">
              {selectedLocation.population || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="气候">
              {selectedLocation.climate || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="地形" span={2}>
              {selectedLocation.terrain || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="描述" span={2}>
              {selectedLocation.description || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="地理特征" span={2}>
              {selectedLocation.geography || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="资源特产" span={2}>
              {selectedLocation.resources || '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

// 地点场景管理主组件
const LocationManagement = ({ worldId }) => {
  const [activeTab, setActiveTab] = useState('archive');
  const [stats, setStats] = useState({
    total: 0,
    cities: 0,
    villages: 0,
    special: 0,
  });

  useEffect(() => {
    if (worldId) {
      locationApi.getLocations(null).then((response) => {
        const data = response.data || [];
        setStats({
          total: data.length,
          cities: data.filter(l => l.location_type === '城市').length,
          villages: data.filter(l => l.location_type === '村庄').length,
          special: data.filter(l => ['遗迹', '地下城', '特殊'].includes(l.location_type)).length,
        });
      });
    }
  }, [worldId]);

  const tabItems = [
    {
      key: 'archive',
      label: '地点档案',
      children: <LocationArchiveManagement worldId={worldId} />,
    },
    {
      key: 'structure',
      label: '内部结构',
      children: <Empty description="内部结构功能开发中..." />,
    },
    {
      key: 'special',
      label: '特殊地点',
      children: <Empty description="特殊地点功能开发中..." />,
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="地点总数"
              value={stats.total}
              prefix={<EnvironmentOutlined />}
              styles={{ content: { color: '#1890ff'  } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="城市"
              value={stats.cities}
              prefix={<HomeOutlined />}
              styles={{ content: { color: '#52c41a'  } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="村庄"
              value={stats.villages}
              prefix={<ApartmentOutlined />}
              styles={{ content: { color: '#faad14'  } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="特殊地点"
              value={stats.special}
              prefix={<StarOutlined />}
              styles={{ content: { color: '#722ed1'  } }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </div>
  );
};

export default LocationManagement;

import React, { useState, useEffect } from 'react';
import {
  Card, Button, Table, Modal, Form, Input, Select, InputNumber,
  message, Space, Tag, Empty, Tabs, Row, Col, Statistic, Descriptions
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  EnvironmentOutlined, HomeOutlined, StarOutlined,
  ApartmentOutlined, GlobalOutlined, InfoCircleOutlined,
  SafetyOutlined, WarningOutlined, TeamOutlined
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
      const response = await locationApi.getLocations(projectId, worldId);
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
  }, [worldId, projectId]);

  const handleSubmit = async (values) => {
    try {
      // 字段映射转换 - 使用数据库字段名
      const data = {
        name: values.name,
        world_id: worldId,
        project_id: projectId,
        location_type: values.location_type,
        region: values.region,
        geographical_location: values.geographical_location,
        terrain: values.terrain,
        climate: values.climate,
        special_environment: values.special_environment,
        controlling_faction: values.controlling_faction,
        population_composition: values.population_composition,
        economic_status: values.economic_status,
        cultural_features: values.cultural_features,
        overall_layout: values.overall_layout,
        functional_areas: values.functional_areas,
        key_buildings: values.key_buildings,
        secret_areas: values.secret_areas,
        defense_facilities: values.defense_facilities,
        guard_force: values.guard_force,
        defense_weaknesses: values.defense_weaknesses,
        emergency_plans: values.emergency_plans,
        main_resources: values.main_resources,
        potential_dangers: values.potential_dangers,
        access_restrictions: values.access_restrictions,
        survival_conditions: values.survival_conditions,
        importance: values.importance || 5,
        description: values.description,
      };
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
      render: (text) => (
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
      title: '所属区域',
      dataIndex: 'region',
      key: 'region',
      ellipsis: true,
    },
    {
      title: '控制势力',
      dataIndex: 'controlling_faction',
      key: 'controlling_faction',
      ellipsis: true,
    },
    {
      title: '重要度',
      dataIndex: 'importance',
      key: 'importance',
      width: 80,
      render: (level) => {
        const colors = ['green', 'green', 'cyan', 'cyan', 'blue', 'blue', 'purple', 'purple', 'orange', 'red'];
        return <Tag color={colors[(level || 5) - 1]}>{level || 5}/10</Tag>;
      },
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
              form.setFieldsValue({
                name: record.name,
                location_type: record.location_type,
                region: record.region,
                geographical_location: record.geographical_location,
                terrain: record.terrain,
                climate: record.climate,
                special_environment: record.special_environment,
                controlling_faction: record.controlling_faction,
                population_composition: record.population_composition,
                economic_status: record.economic_status,
                cultural_features: record.cultural_features,
                overall_layout: record.overall_layout,
                functional_areas: record.functional_areas,
                key_buildings: record.key_buildings,
                secret_areas: record.secret_areas,
                defense_facilities: record.defense_facilities,
                guard_force: record.guard_force,
                defense_weaknesses: record.defense_weaknesses,
                emergency_plans: record.emergency_plans,
                main_resources: record.main_resources,
                potential_dangers: record.potential_dangers,
                access_restrictions: record.access_restrictions,
                survival_conditions: record.survival_conditions,
                importance: record.importance,
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
        width={900}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Tabs
            items={[
              {
                key: 'basic',
                label: '基本信息',
                children: (
                  <>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="name"
                          label="地点名称"
                          rules={[{ required: true, message: '请输入地点名称' }]}
                        >
                          <Input placeholder="例如：暴风城、艾尔文森林" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="region" label="所属区域">
                          <Input placeholder="例如：东部王国" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          name="location_type"
                          label="地点类型"
                          rules={[{ required: true }]}
                        >
                          <Select placeholder="选择类型">
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
                      </Col>
                      <Col span={8}>
                        <Form.Item name="importance" label="重要程度 (1-10)">
                          <InputNumber min={1} max={10} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="controlling_faction" label="控制势力">
                          <Input placeholder="例如：暴风王国" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item name="description" label="地点描述">
                      <TextArea rows={3} placeholder="描述这个地点的基本情况..." />
                    </Form.Item>
                  </>
                )
              },
              {
                key: 'environment',
                label: '地理环境',
                children: (
                  <>
                    <Form.Item name="geographical_location" label="地理位置">
                      <TextArea rows={2} placeholder="详细描述这个地点的地理位置" />
                    </Form.Item>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="terrain" label="地形">
                          <Input placeholder="例如：平原、丘陵、山地" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="climate" label="气候">
                          <Input placeholder="例如：温带海洋性气候" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item name="special_environment" label="特殊环境">
                      <TextArea rows={2} placeholder="描述这个地点的特殊环境特征" />
                    </Form.Item>
                    <Form.Item name="main_resources" label="主要资源">
                      <TextArea rows={2} placeholder="描述这个地点的主要资源和特产" />
                    </Form.Item>
                  </>
                )
              },
              {
                key: 'society',
                label: '社会状况',
                children: (
                  <>
                    <Form.Item name="population_composition" label="人口构成">
                      <TextArea rows={2} placeholder="描述居民种族、职业分布等" />
                    </Form.Item>
                    <Form.Item name="economic_status" label="经济状况">
                      <TextArea rows={2} placeholder="描述经济水平、主要产业等" />
                    </Form.Item>
                    <Form.Item name="cultural_features" label="文化特色">
                      <TextArea rows={2} placeholder="描述当地的文化传统和特色" />
                    </Form.Item>
                  </>
                )
              },
              {
                key: 'layout',
                label: '布局建筑',
                children: (
                  <>
                    <Form.Item name="overall_layout" label="整体布局">
                      <TextArea rows={3} placeholder="描述地点的整体布局和规划" />
                    </Form.Item>
                    <Form.Item name="functional_areas" label="功能区域">
                      <TextArea rows={2} placeholder="描述各个功能区域的分布" />
                    </Form.Item>
                    <Form.Item name="key_buildings" label="重要建筑">
                      <TextArea rows={2} placeholder="列举重要的建筑物和地标" />
                    </Form.Item>
                    <Form.Item name="secret_areas" label="秘密区域">
                      <TextArea rows={2} placeholder="描述隐藏或秘密的区域" />
                    </Form.Item>
                  </>
                )
              },
              {
                key: 'defense',
                label: '防御安全',
                children: (
                  <>
                    <Form.Item name="defense_facilities" label="防御设施">
                      <TextArea rows={2} placeholder="描述城墙、哨塔等防御设施" />
                    </Form.Item>
                    <Form.Item name="guard_force" label="守卫力量">
                      <TextArea rows={2} placeholder="描述守卫部队和安保力量" />
                    </Form.Item>
                    <Form.Item name="defense_weaknesses" label="防御弱点">
                      <TextArea rows={2} placeholder="描述防御体系的薄弱环节" />
                    </Form.Item>
                    <Form.Item name="emergency_plans" label="应急预案">
                      <TextArea rows={2} placeholder="描述紧急情况下的应对措施" />
                    </Form.Item>
                  </>
                )
              },
              {
                key: 'dangers',
                label: '危险与限制',
                children: (
                  <>
                    <Form.Item name="potential_dangers" label="潜在危险">
                      <TextArea rows={3} placeholder="描述可能存在的危险和威胁" />
                    </Form.Item>
                    <Form.Item name="access_restrictions" label="进入限制">
                      <TextArea rows={2} placeholder="描述进入该地点的限制条件" />
                    </Form.Item>
                    <Form.Item name="survival_conditions" label="生存条件">
                      <TextArea rows={2} placeholder="描述在该地点生存所需的条件" />
                    </Form.Item>
                  </>
                )
              }
            ]}
          />
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
        width={700}
      >
        {selectedLocation && (
          <Tabs
            items={[
              {
                key: 'basic',
                label: '基本信息',
                children: (
                  <Descriptions column={2} bordered size="small">
                    <Descriptions.Item label="名称" span={2}>{selectedLocation.name}</Descriptions.Item>
                    <Descriptions.Item label="类型">
                      <Tag color="blue">{selectedLocation.location_type}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="重要度">
                      <Tag color="purple">{selectedLocation.importance || 5}/10</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="所属区域" span={2}>{selectedLocation.region || '-'}</Descriptions.Item>
                    <Descriptions.Item label="控制势力" span={2}>{selectedLocation.controlling_faction || '-'}</Descriptions.Item>
                    <Descriptions.Item label="描述" span={2}>{selectedLocation.description || '-'}</Descriptions.Item>
                  </Descriptions>
                )
              },
              {
                key: 'environment',
                label: '地理环境',
                children: (
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="地理位置">{selectedLocation.geographical_location || '-'}</Descriptions.Item>
                    <Descriptions.Item label="地形">{selectedLocation.terrain || '-'}</Descriptions.Item>
                    <Descriptions.Item label="气候">{selectedLocation.climate || '-'}</Descriptions.Item>
                    <Descriptions.Item label="特殊环境">{selectedLocation.special_environment || '-'}</Descriptions.Item>
                    <Descriptions.Item label="主要资源">{selectedLocation.main_resources || '-'}</Descriptions.Item>
                  </Descriptions>
                )
              },
              {
                key: 'society',
                label: '社会状况',
                children: (
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="人口构成">{selectedLocation.population_composition || '-'}</Descriptions.Item>
                    <Descriptions.Item label="经济状况">{selectedLocation.economic_status || '-'}</Descriptions.Item>
                    <Descriptions.Item label="文化特色">{selectedLocation.cultural_features || '-'}</Descriptions.Item>
                  </Descriptions>
                )
              },
              {
                key: 'defense',
                label: '防御安全',
                children: (
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="防御设施">{selectedLocation.defense_facilities || '-'}</Descriptions.Item>
                    <Descriptions.Item label="守卫力量">{selectedLocation.guard_force || '-'}</Descriptions.Item>
                    <Descriptions.Item label="防御弱点">{selectedLocation.defense_weaknesses || '-'}</Descriptions.Item>
                    <Descriptions.Item label="应急预案">{selectedLocation.emergency_plans || '-'}</Descriptions.Item>
                  </Descriptions>
                )
              }
            ]}
          />
        )}
      </Modal>
    </div>
  );
};

// 地点场景管理主组件
const LocationManagement = ({ worldId, projectId }) => {
  const [activeTab, setActiveTab] = useState('archive');
  const [stats, setStats] = useState({
    total: 0,
    cities: 0,
    villages: 0,
    special: 0,
  });

  useEffect(() => {
    if (worldId) {
      locationApi.getLocations(projectId, worldId).then((response) => {
        const data = response.data || [];
        setStats({
          total: data.length,
          cities: data.filter(l => l.location_type === '城市').length,
          villages: data.filter(l => l.location_type === '村庄').length,
          special: data.filter(l => ['遗迹', '地下城', '特殊'].includes(l.location_type)).length,
        });
      });
    }
  }, [worldId, projectId]);

  const tabItems = [
    {
      key: 'archive',
      label: '地点档案',
      children: <LocationArchiveManagement worldId={worldId} projectId={projectId} />,
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
              styles={{ content: { color: '#1890ff' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="城市"
              value={stats.cities}
              prefix={<HomeOutlined />}
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="村庄"
              value={stats.villages}
              prefix={<ApartmentOutlined />}
              styles={{ content: { color: '#faad14' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="特殊地点"
              value={stats.special}
              prefix={<StarOutlined />}
              styles={{ content: { color: '#722ed1' } }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </div>
  );
};

export default LocationManagement;

import React, { useState, useEffect } from 'react';
import {
  Layout, Menu, Card, Button, Table, Modal, Form, Input, Select,
  message, Popconfirm, Space, Typography, Tabs, Row, Col, Tag,
  Empty, Breadcrumb, Tooltip, Badge
} from 'antd';
import axios from 'axios';

const { TextArea } = Input;
const { TabPane } = Tabs;
const { Content, Sider } = Layout;
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  GlobalOutlined, UserOutlined, EnvironmentOutlined,
  ToolOutlined, TeamOutlined, DatabaseOutlined,
  SettingOutlined, HomeOutlined, ArrowLeftOutlined,
  BookOutlined, FireOutlined, StarOutlined,
  ApartmentOutlined, ClockCircleOutlined, ShoppingOutlined,
  ExperimentOutlined, BugOutlined, NodeIndexOutlined,
  EyeOutlined, SaveOutlined
} from '@ant-design/icons';
import {
  characterApi, locationApi, itemApi, factionApi,
  relationshipApi, settingApi, aiApi, worldApi,
  worldSettingApi, energySocietyApi
} from '../services/api';
import LocationManagement from '../components/WorldSetting/LocationManagement';
import FactionManagement from '../components/WorldSetting/FactionManagement';
import ItemManagement from '../components/WorldSetting/ItemManagement';
import TimelineManagement from '../components/WorldSetting/TimelineManagement';
import EnergySystem from '../components/WorldSetting/EnergySystem';
import SocietySystem from '../components/WorldSetting/SocietySystem';

const { Title, Text } = Typography;

// 世界管理组件
const WorldManagementPanel = ({ onSelectWorld }) => {
  const [worlds, setWorlds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentWorld, setCurrentWorld] = useState(null);
  const [form] = Form.useForm();

  const fetchWorlds = async () => {
    setLoading(true);
    try {
      const response = await worldApi.getWorlds();
      if (response.data.code === 200) {
        setWorlds(response.data.data);
      }
    } catch (error) {
      message.error('获取世界列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorlds();
  }, []);

  const handleCreate = async (values) => {
    try {
      if (isEditing && currentWorld) {
        await worldApi.updateWorld(currentWorld.id, values);
        message.success('世界更新成功');
      } else {
        await worldApi.createWorld(values);
        message.success('世界创建成功');
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchWorlds();
    } catch (error) {
      message.error(isEditing ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await worldApi.deleteWorld(id);
      message.success('删除成功');
      fetchWorlds();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const showModal = (world = null) => {
    if (world) {
      setCurrentWorld(world);
      setIsEditing(true);
      form.setFieldsValue(world);
    } else {
      setCurrentWorld(null);
      setIsEditing(false);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: '世界名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <GlobalOutlined style={{ color: '#1890ff' }} />
          <a onClick={() => onSelectWorld(record)}>{text}</a>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'world_type',
      key: 'world_type',
      render: (type) => {
        const typeMap = {
          'fantasy': '奇幻',
          'scifi': '科幻',
          'modern': '现代',
          'historical': '历史',
          'other': '其他'
        };
        return <Tag color="blue">{typeMap[type] || type}</Tag>;
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onSelectWorld(record)}
          >
            进入
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          />
          <Popconfirm
            title="确定要删除这个世界吗？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button size="small" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={
          <Space>
            <GlobalOutlined />
            <span>世界观管理</span>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
            创建新世界
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={worlds}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={isEditing ? '编辑世界' : '创建世界'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Form.Item
            name="name"
            label="世界名称"
            rules={[{ required: true, message: '请输入世界名称' }]}
          >
            <Input placeholder="例如：艾泽拉斯、中土世界" />
          </Form.Item>
          <Form.Item
            name="world_type"
            label="世界类型"
            rules={[{ required: true, message: '请选择世界类型' }]}
          >
            <Select placeholder="选择世界类型">
              <Select.Option value="fantasy">奇幻</Select.Option>
              <Select.Option value="scifi">科幻</Select.Option>
              <Select.Option value="modern">现代</Select.Option>
              <Select.Option value="historical">历史</Select.Option>
              <Select.Option value="other">其他</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="世界描述"
          >
            <TextArea rows={4} placeholder="描述这个世界的核心设定..." />
          </Form.Item>
          <Form.Item
            name="core_rules"
            label="核心规则"
          >
            <TextArea rows={3} placeholder="描述世界的核心规则，如魔法体系、物理法则等" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// 世界详情组件
const WorldDetailPanel = ({ world, onBack, onEditWorld }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isSettingModalVisible, setIsSettingModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [settingForm] = Form.useForm();

  if (!world) return <Empty description="请选择或创建一个世界" />;

  const breadcrumbItems = [
    {
      title: <a onClick={onBack}><ArrowLeftOutlined /> 返回世界列表</a>,
    },
    {
      title: world.name,
    },
  ];

  const handleEditWorld = () => {
    editForm.setFieldsValue({
      name: world.name,
      world_type: world.world_type,
      description: world.description,
      core_rules: world.core_rules,
    });
    setIsEditModalVisible(true);
  };

  const handleEditSubmit = async (values) => {
    try {
      await worldApi.updateWorld(world.id, values);
      message.success('世界更新成功');
      setIsEditModalVisible(false);
      if (onEditWorld) onEditWorld();
    } catch (error) {
      message.error('更新世界失败');
    }
  };

  const handleAddSetting = () => {
    settingForm.resetFields();
    setIsSettingModalVisible(true);
  };

  const handleSettingSubmit = async (values) => {
    try {
      const { setting_type, ...data } = values;
      data.world_id = world.id;

      switch (setting_type) {
        case 'dimension':
          await worldSettingApi.createDimension(data);
          break;
        case 'region':
          await worldSettingApi.createRegion(data);
          break;
        case 'celestial_body':
          await worldSettingApi.createCelestialBody(data);
          break;
        case 'natural_law':
          await worldSettingApi.createNaturalLaw(data);
          break;
        case 'energy_system':
          await energySocietyApi.createEnergySystem(data);
          break;
        case 'power_level':
          await energySocietyApi.createPowerLevel(data);
          break;
        case 'civilization':
          await energySocietyApi.createCivilization(data);
          break;
        default:
          message.error('未知的设定类型');
          return;
      }

      message.success('设定添加成功');
      setIsSettingModalVisible(false);
      settingForm.resetFields();

      // 刷新对应标签页的数据
      const tabMap = {
        'dimension': 'worlds',
        'region': 'worlds',
        'celestial_body': 'worlds',
        'natural_law': 'worlds',
        'energy_system': 'energy',
        'power_level': 'energy',
        'civilization': 'society',
      };
      const targetTab = tabMap[setting_type];
      if (targetTab && activeTab !== targetTab) {
        setActiveTab(targetTab);
      }
    } catch (error) {
      message.error('添加设定失败: ' + (error.response?.data?.message || error.message));
    }
  };

  // 根据设定类型获取对应的表单字段
  const getSettingTypeFields = (type) => {
    switch (type) {
      case 'dimension':
        return (
          <>
            <Form.Item name="dimension_type" label="维度类型" rules={[{ required: true }]} initialValue="主维度">
              <Select>
                <Select.Option value="主维度">主维度</Select.Option>
                <Select.Option value="平行维度">平行维度</Select.Option>
                <Select.Option value="子维度">子维度</Select.Option>
                <Select.Option value="口袋维度">口袋维度</Select.Option>
                <Select.Option value="虚空">虚空</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="access_method" label="访问方式">
              <TextArea rows={2} placeholder="如何进入这个维度？" />
            </Form.Item>
            <Form.Item name="time_flow_ratio" label="时间流速比例" initialValue={1.0}>
              <Input type="number" step={0.1} placeholder="相对于主维度的时间流速" />
            </Form.Item>
            <Form.Item name="physical_properties" label="物理特性">
              <TextArea rows={2} placeholder="该维度的物理法则特点" />
            </Form.Item>
          </>
        );
      case 'region':
        return (
          <>
            <Form.Item name="region_type" label="区域类型" rules={[{ required: true }]} initialValue="城市">
              <Select>
                <Select.Option value="大陆">大陆</Select.Option>
                <Select.Option value="国家">国家</Select.Option>
                <Select.Option value="城市">城市</Select.Option>
                <Select.Option value="村庄">村庄</Select.Option>
                <Select.Option value="森林">森林</Select.Option>
                <Select.Option value="山脉">山脉</Select.Option>
                <Select.Option value="水域">水域</Select.Option>
                <Select.Option value="地下城">地下城</Select.Option>
                <Select.Option value="特殊">特殊</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="geography" label="地理特征">
              <TextArea rows={2} placeholder="地形、气候、资源等" />
            </Form.Item>
            <Form.Item name="climate" label="气候类型">
              <Input placeholder="例如：温带季风气候" />
            </Form.Item>
          </>
        );
      case 'celestial_body':
        return (
          <>
            <Form.Item name="body_type" label="天体类型" rules={[{ required: true }]} initialValue="行星">
              <Select>
                <Select.Option value="恒星">恒星</Select.Option>
                <Select.Option value="行星">行星</Select.Option>
                <Select.Option value="卫星">卫星</Select.Option>
                <Select.Option value="小行星">小行星</Select.Option>
                <Select.Option value="彗星">彗星</Select.Option>
                <Select.Option value="星云">星云</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="properties" label="天体属性">
              <TextArea rows={2} placeholder="大小、质量、轨道周期等" />
            </Form.Item>
            <Form.Item name="influence" label="对世界的影响">
              <TextArea rows={2} placeholder="例如：魔力潮汐、季节变化" />
            </Form.Item>
          </>
        );
      case 'natural_law':
        return (
          <>
            <Form.Item name="law_type" label="法则类型" rules={[{ required: true }]} initialValue="物理法则">
              <Select>
                <Select.Option value="物理法则">物理法则</Select.Option>
                <Select.Option value="魔法法则">魔法法则</Select.Option>
                <Select.Option value="生命法则">生命法则</Select.Option>
                <Select.Option value="时间法则">时间法则</Select.Option>
                <Select.Option value="空间法则">空间法则</Select.Option>
                <Select.Option value="因果法则">因果法则</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="scope" label="作用范围">
              <Input placeholder="例如：全宇宙、主物质界" />
            </Form.Item>
            <Form.Item name="exceptions" label="例外情况">
              <TextArea rows={2} placeholder="该法则的例外或限制" />
            </Form.Item>
          </>
        );
      case 'energy_system':
        return (
          <>
            <Form.Item name="system_type" label="体系类型" rules={[{ required: true }]} initialValue="魔法">
              <Select>
                <Select.Option value="魔法">魔法</Select.Option>
                <Select.Option value="斗气">斗气</Select.Option>
                <Select.Option value="真气">真气</Select.Option>
                <Select.Option value="灵力">灵力</Select.Option>
                <Select.Option value="科技">科技</Select.Option>
                <Select.Option value="其他">其他</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="core_principles" label="核心原理">
              <TextArea rows={3} placeholder="描述这个能量体系的核心原理" />
            </Form.Item>
            <Form.Item name="usage_restrictions" label="使用限制">
              <TextArea rows={2} placeholder="使用该体系的限制条件" />
            </Form.Item>
          </>
        );
      case 'power_level':
        return (
          <>
            <Form.Item name="level_number" label="等级序号" rules={[{ required: true }]}>
              <Input type="number" placeholder="例如：1, 2, 3..." />
            </Form.Item>
            <Form.Item name="requirements" label="晋升条件">
              <TextArea rows={3} placeholder="达到该等级需要满足的条件" />
            </Form.Item>
            <Form.Item name="abilities" label="获得能力">
              <TextArea rows={3} placeholder="该等级获得的能力" />
            </Form.Item>
          </>
        );
      case 'civilization':
        return (
          <>
            <Form.Item name="civilization_type" label="文明类型" rules={[{ required: true }]} initialValue="农耕文明">
              <Select>
                <Select.Option value="原始文明">原始文明</Select.Option>
                <Select.Option value="农耕文明">农耕文明</Select.Option>
                <Select.Option value="商业文明">商业文明</Select.Option>
                <Select.Option value="工业文明">工业文明</Select.Option>
                <Select.Option value="魔法文明">魔法文明</Select.Option>
                <Select.Option value="科技文明">科技文明</Select.Option>
                <Select.Option value="混合文明">混合文明</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="tech_level" label="技术水平" initialValue="中世纪">
              <Select>
                <Select.Option value="原始时代">原始时代</Select.Option>
                <Select.Option value="古代">古代</Select.Option>
                <Select.Option value="中世纪">中世纪</Select.Option>
                <Select.Option value="文艺复兴">文艺复兴</Select.Option>
                <Select.Option value="工业时代">工业时代</Select.Option>
                <Select.Option value="现代">现代</Select.Option>
                <Select.Option value="未来">未来</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="population_scale" label="人口规模">
              <Input placeholder="例如：百万级、千万级" />
            </Form.Item>
          </>
        );
      default:
        return null;
    }
  };

  const tabItems = [
    {
      key: 'overview',
      label: '概览',
      children: (
        <Row gutter={16}>
          <Col span={16}>
            <Card title="世界描述" size="small" style={{ marginBottom: 16 }}>
              <Text>{world.description || '暂无描述'}</Text>
            </Card>
            <Card title="核心规则" size="small">
              <Text>{world.core_rules || '暂无核心规则设定'}</Text>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="统计信息" size="small">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <UserOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                  <div style={{ marginTop: 8 }}>角色</div>
                  <div style={{ fontSize: 20, fontWeight: 'bold' }}>0</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <EnvironmentOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                  <div style={{ marginTop: 8 }}>地点</div>
                  <div style={{ fontSize: 20, fontWeight: 'bold' }}>0</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <TeamOutlined style={{ fontSize: 24, color: '#faad14' }} />
                  <div style={{ marginTop: 8 }}>势力</div>
                  <div style={{ fontSize: 20, fontWeight: 'bold' }}>0</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <ToolOutlined style={{ fontSize: 24, color: '#722ed1' }} />
                  <div style={{ marginTop: 8 }}>物品</div>
                  <div style={{ fontSize: 20, fontWeight: 'bold' }}>0</div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'characters',
      label: '角色库',
      children: <CharacterManagementPanel worldId={world.id} />,
    },
    {
      key: 'locations',
      label: '地点场景',
      children: <LocationManagement worldId={world.id} />,
    },
    {
      key: 'factions',
      label: '组织势力',
      children: <FactionManagement worldId={world.id} />,
    },
    {
      key: 'items',
      label: '物品资源',
      children: <ItemManagement worldId={world.id} />,
    },
    {
      key: 'timeline',
      label: '时间线',
      children: <TimelineManagement worldId={world.id} />,
    },
    {
      key: 'energy',
      label: '能量体系',
      children: <EnergySystem worldId={world.id} />,
    },
    {
      key: 'society',
      label: '社会体系',
      children: <SocietySystem worldId={world.id} />,
    },
  ];

  return (
    <div>
      <Breadcrumb style={{ marginBottom: 16 }} items={breadcrumbItems} />

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <Title level={3} style={{ marginBottom: 8 }}>
              <GlobalOutlined style={{ color: '#1890ff', marginRight: 8 }} />
              {world.name}
            </Title>
            <Space>
              <Tag color="blue">
                {{
                  'fantasy': '奇幻',
                  'scifi': '科幻',
                  'modern': '现代',
                  'historical': '历史',
                  'other': '其他'
                }[world.world_type] || world.world_type}
              </Tag>
              <Text type="secondary">创建于 {new Date(world.created_at).toLocaleDateString()}</Text>
            </Space>
          </div>
          <Space>
            <Button icon={<EditOutlined />} onClick={handleEditWorld}>编辑世界</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddSetting}>添加设定</Button>
          </Space>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>

      {/* 编辑世界模态框 */}
      <Modal
        title="编辑世界"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        onOk={() => editForm.submit()}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item name="name" label="世界名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="world_type" label="世界类型" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="fantasy">奇幻</Select.Option>
              <Select.Option value="scifi">科幻</Select.Option>
              <Select.Option value="modern">现代</Select.Option>
              <Select.Option value="historical">历史</Select.Option>
              <Select.Option value="other">其他</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="世界描述">
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item name="core_rules" label="核心规则">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 添加设定模态框 */}
      <Modal
        title="添加设定"
        open={isSettingModalVisible}
        onCancel={() => {
          setIsSettingModalVisible(false);
          settingForm.resetFields();
        }}
        onOk={() => settingForm.submit()}
        width={700}
      >
        <Form form={settingForm} layout="vertical" onFinish={handleSettingSubmit}>
          <Form.Item name="setting_type" label="设定类型" rules={[{ required: true }]}>
            <Select 
              placeholder="选择设定类型"
              onChange={() => {
                // 清除之前类型的特定字段，保留名称和描述
                const currentValues = settingForm.getFieldsValue();
                settingForm.resetFields();
                settingForm.setFieldsValue({
                  setting_type: currentValues.setting_type,
                  name: currentValues.name,
                  description: currentValues.description,
                });
              }}
            >
              <Select.Option value="dimension">维度/位面</Select.Option>
              <Select.Option value="region">地理区域</Select.Option>
              <Select.Option value="celestial_body">天体</Select.Option>
              <Select.Option value="natural_law">自然法则</Select.Option>
              <Select.Option value="energy_system">能量体系</Select.Option>
              <Select.Option value="power_level">力量等级</Select.Option>
              <Select.Option value="civilization">文明</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="name" label="设定名称" rules={[{ required: true }]}>
            <Input placeholder="输入设定名称" />
          </Form.Item>
          <Form.Item name="description" label="设定描述">
            <TextArea rows={3} placeholder="描述这个设定的详细信息..." />
          </Form.Item>
          
          {/* 动态显示对应类型的表单字段 */}
          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.setting_type !== curr.setting_type}>
            {({ getFieldValue }) => {
              const settingType = getFieldValue('setting_type');
              return settingType ? getSettingTypeFields(settingType) : null;
            }}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// 角色管理组件
const CharacterManagementPanel = ({ worldId }) => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [form] = Form.useForm();

  // 获取角色列表
  const fetchCharacters = async () => {
    setLoading(true);
    try {
      const response = await characterApi.getCharacters(null, worldId);
      setCharacters(response.data || []);
    } catch (error) {
      message.error('获取角色列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (worldId) {
      fetchCharacters();
    }
  }, [worldId]);

  // 打开创建/编辑模态框
  const showModal = (character = null) => {
    setEditingCharacter(character);
    if (character) {
      form.setFieldsValue(character);
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  // 关闭模态框
  const handleCancel = () => {
    setModalVisible(false);
    setEditingCharacter(null);
    form.resetFields();
  };

  // 提交表单
  const handleSubmit = async (values) => {
    try {
      if (editingCharacter) {
        await characterApi.updateCharacter(editingCharacter.id, values);
        message.success('更新角色成功');
      } else {
        await characterApi.createCharacter({ ...values, world_id: worldId });
        message.success('创建角色成功');
      }
      setModalVisible(false);
      fetchCharacters();
    } catch (error) {
      message.error(editingCharacter ? '更新角色失败' : '创建角色失败');
      console.error(error);
    }
  };

  // 删除角色
  const handleDelete = async (id) => {
    try {
      await characterApi.deleteCharacter(id);
      message.success('删除角色成功');
      fetchCharacters();
    } catch (error) {
      message.error('删除角色失败');
      console.error(error);
    }
  };

  const columns = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: '角色类型',
      dataIndex: 'role_type',
      key: 'role_type',
      render: (type) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === '存活' ? 'green' : 'red'}>{status}</Tag>
      ),
    },
    {
      title: '重要程度',
      dataIndex: 'importance_level',
      key: 'importance_level',
      render: (level) => <Tag color="orange">{level}/10</Tag>,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个角色吗？"
            description="删除后将无法恢复"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={
          <Space>
            <UserOutlined />
            <span>角色管理</span>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
            创建角色
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={characters}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <Modal
        title={editingCharacter ? '编辑角色' : '创建角色'}
        open={modalVisible}
        onCancel={handleCancel}
        onOk={() => form.submit()}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="例如：阿尔萨斯" />
          </Form.Item>

          <Form.Item
            name="role_type"
            label="角色类型"
            rules={[{ required: true, message: '请选择角色类型' }]}
          >
            <Select placeholder="选择角色类型">
              <Option value="主角">主角</Option>
              <Option value="配角">配角</Option>
              <Option value="反派">反派</Option>
              <Option value="龙套">龙套</Option>
              <Option value="背景">背景</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            initialValue="存活"
          >
            <Select>
              <Option value="存活">存活</Option>
              <Option value="死亡">死亡</Option>
              <Option value="失踪">失踪</Option>
              <Option value="转生">转生</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="importance_level"
            label="重要程度"
            initialValue={5}
          >
            <Select>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                <Option key={level} value={level}>{level}/10</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="race"
            label="种族"
          >
            <Input placeholder="例如：人类、精灵" />
          </Form.Item>

          <Form.Item
            name="gender"
            label="性别"
          >
            <Select placeholder="选择性别">
              <Option value="男">男</Option>
              <Option value="女">女</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="age"
            label="年龄"
          >
            <Input type="number" placeholder="输入年龄" />
          </Form.Item>

          <Form.Item
            name="appearance"
            label="外貌描述"
          >
            <TextArea rows={3} placeholder="描述角色的外貌特征" />
          </Form.Item>

          <Form.Item
            name="personality"
            label="性格描述"
          >
            <TextArea rows={3} placeholder="描述角色的性格特点" />
          </Form.Item>

          <Form.Item
            name="background"
            label="背景故事"
          >
            <TextArea rows={4} placeholder="描述角色的背景故事" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// 主设定管理组件
const SettingManagement = ({ projectId }) => {
  const [selectedWorld, setSelectedWorld] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'detail'
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSelectWorld = (world) => {
    setSelectedWorld(world);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setSelectedWorld(null);
    setViewMode('list');
  };

  const handleEditWorld = () => {
    // 刷新世界数据
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div style={{ width: '100%' }} key={refreshKey}>
      {viewMode === 'list' ? (
        <WorldManagementPanel onSelectWorld={handleSelectWorld} />
      ) : (
        <WorldDetailPanel world={selectedWorld} onBack={handleBackToList} onEditWorld={handleEditWorld} />
      )}
    </div>
  );
};

export default SettingManagement;

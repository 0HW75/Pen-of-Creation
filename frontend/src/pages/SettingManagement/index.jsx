import React, { useState, useEffect } from 'react';
import {
  Layout, Card, Button, Table, Modal, Form, Input, Select,
  message, Popconfirm, Space, Typography, Tabs, Row, Col, Tag,
  Empty, Breadcrumb, Badge, Statistic, Divider, Timeline,
  Progress, Avatar, List, Tooltip, Drawer, Descriptions
} from 'antd';
import axios from 'axios';

// 导入新创建的组件
import WorldArchitecture from '../../components/WorldSetting/WorldArchitecture';
import EnergySystem from '../../components/WorldSetting/EnergySystem';
import SocietySystem from '../../components/WorldSetting/SocietySystem';
import HistoryTimeline from '../../components/WorldSetting/HistoryTimeline';

const { TextArea } = Input;
const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  GlobalOutlined, UserOutlined, EnvironmentOutlined,
  ToolOutlined, TeamOutlined, DatabaseOutlined,
  SettingOutlined, HomeOutlined, ArrowLeftOutlined,
  BookOutlined, FireOutlined, StarOutlined,
  ApartmentOutlined, ClockCircleOutlined, ShoppingOutlined,
  ExperimentOutlined, BugOutlined, NodeIndexOutlined,
  EyeOutlined, SaveOutlined, ThunderboltOutlined,
  CrownOutlined, BankOutlined, HistoryOutlined,
  TagsOutlined, LinkOutlined, DashboardOutlined,
  SearchOutlined, FilterOutlined, LayoutOutlined,
  MenuOutlined, CloseOutlined
} from '@ant-design/icons';

import {
  worldApi, characterApi, locationApi, itemApi, factionApi,
  worldSettingApi, energySocietyApi, historyTimelineApi, tagsRelationsApi
} from '../../services/api';

import './styles.css';

// ==================== 通用组件 ====================

// 统计卡片组件
const StatCard = ({ icon, title, value, color, trend }) => (
  <Card className="stat-card" bordered={false}>
    <div className="stat-card-content">
      <div className="stat-icon" style={{ backgroundColor: `${color}20`, color }}>
        {icon}
      </div>
      <div className="stat-info">
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
        {trend && <div className="stat-trend" style={{ color: trend > 0 ? '#52c41a' : '#ff4d4f' }}>
          {trend > 0 ? '+' : ''}{trend} 本周新增
        </div>}
      </div>
    </div>
  </Card>
);

// 实体卡片组件
const EntityCard = ({ title, subtitle, tags, icon, color, onClick, extra }) => (
  <div className="entity-card" onClick={onClick}>
    <div className="entity-card-header" style={{ background: `linear-gradient(135deg, ${color}20 0%, ${color}05 100%)` }}>
      <div className="entity-icon" style={{ color }}>
        {icon}
      </div>
      {extra && <div className="entity-extra">{extra}</div>}
    </div>
    <div className="entity-card-body">
      <h4 className="entity-title">{title}</h4>
      <p className="entity-subtitle">{subtitle}</p>
      <div className="entity-tags">
        {tags.map((tag, index) => (
          <Tag key={index} className="entity-tag">{tag}</Tag>
        ))}
      </div>
    </div>
  </div>
);

// ==================== 世界管理面板 ====================

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

  const getWorldTypeColor = (type) => {
    const colors = {
      'fantasy': '#722ed1',
      'scifi': '#1890ff',
      'modern': '#52c41a',
      'historical': '#fa8c16',
      'other': '#8c8c8c'
    };
    return colors[type] || '#1890ff';
  };

  const getWorldTypeName = (type) => {
    const names = {
      'fantasy': '奇幻',
      'scifi': '科幻',
      'modern': '现代',
      'historical': '历史',
      'other': '其他'
    };
    return names[type] || type;
  };

  return (
    <div className="world-management">
      <div className="page-header">
        <div className="page-title">
          <GlobalOutlined className="title-icon" />
          <div>
            <h1>世界观管理</h1>
            <p>管理你的小说世界观设定</p>
          </div>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => showModal()}
          className="create-btn"
        >
          创建新世界
        </Button>
      </div>

      <Row gutter={[24, 24]} className="worlds-grid">
        {worlds.map(world => (
          <Col xs={24} sm={12} lg={8} xl={6} key={world.id}>
            <EntityCard
              title={world.name}
              subtitle={world.description || '暂无描述'}
              tags={[getWorldTypeName(world.world_type)]}
              icon={<GlobalOutlined />}
              color={getWorldTypeColor(world.world_type)}
              onClick={() => onSelectWorld(world)}
              extra={
                <Space>
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<EditOutlined />}
                    onClick={(e) => { e.stopPropagation(); showModal(world); }}
                  />
                  <Popconfirm
                    title="确定要删除这个世界吗？"
                    onConfirm={(e) => { e.stopPropagation(); handleDelete(world.id); }}
                  >
                    <Button 
                      type="text" 
                      size="small" 
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Popconfirm>
                </Space>
              }
            />
          </Col>
        ))}
        
        <Col xs={24} sm={12} lg={8} xl={6}>
          <div className="create-world-card" onClick={() => showModal()}>
            <div className="create-icon">
              <PlusOutlined />
            </div>
            <span>创建新世界</span>
            <p>开始构建你的小说世界观</p>
          </div>
        </Col>
      </Row>

      <Modal
        title={isEditing ? '编辑世界' : '创建世界'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
        className="world-modal"
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
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
          <Form.Item name="description" label="世界描述">
            <TextArea rows={4} placeholder="描述这个世界的核心设定..." />
          </Form.Item>
          <Form.Item name="core_rules" label="核心规则">
            <TextArea rows={3} placeholder="描述世界的核心规则，如魔法体系、物理法则等" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// ==================== 世界详情面板 ====================

const WorldDetailPanel = ({ world, onBack, onEditWorld }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    characters: 0,
    locations: 0,
    factions: 0,
    items: 0,
    events: 0
  });
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();

  useEffect(() => {
    // 这里可以加载统计数据
    loadStats();
  }, [world.id]);

  const loadStats = async () => {
    // 加载各种统计数据
    try {
      // 并行加载所有统计数据
      const [charactersRes, locationsRes, factionsRes, itemsRes, eventsRes] = await Promise.all([
        characterApi.getCharacters(null, world.id).catch(() => ({ data: [] })),
        locationApi.getLocations(null).catch(() => ({ data: [] })),
        factionApi.getFactions(null).catch(() => ({ data: [] })),
        itemApi.getItems(null).catch(() => ({ data: [] })),
        historyTimelineApi.getHistoricalEvents(world.id).catch(() => ({ data: { data: [] } }))
      ]);

      setStats({
        characters: charactersRes.data?.length || 0,
        locations: locationsRes.data?.length || 0,
        factions: factionsRes.data?.length || 0,
        items: itemsRes.data?.length || 0,
        events: eventsRes.data?.data?.length || 0
      });
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  };

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

  const getWorldTypeName = (type) => {
    const names = {
      'fantasy': '奇幻',
      'scifi': '科幻',
      'modern': '现代',
      'historical': '历史',
      'other': '其他'
    };
    return names[type] || type;
  };

  const tabItems = [
    {
      key: 'overview',
      label: (
        <span>
          <DashboardOutlined /> 概览
        </span>
      ),
      children: <OverviewTab world={world} stats={stats} />,
    },
    {
      key: 'characters',
      label: (
        <span>
          <UserOutlined /> 角色库
        </span>
      ),
      children: <CharacterManagementPanel worldId={world.id} />,
    },
    {
      key: 'world-setting',
      label: (
        <span>
          <GlobalOutlined /> 世界架构
        </span>
      ),
      children: <WorldArchitecture worldId={world.id} />,
    },
    {
      key: 'energy',
      label: (
        <span>
          <ThunderboltOutlined /> 能量体系
        </span>
      ),
      children: <EnergySystem worldId={world.id} />,
    },
    {
      key: 'society',
      label: (
        <span>
          <TeamOutlined /> 社会体系
        </span>
      ),
      children: <SocietySystem worldId={world.id} />,
    },
    {
      key: 'timeline',
      label: (
        <span>
          <HistoryOutlined /> 历史脉络
        </span>
      ),
      children: <HistoryTimeline worldId={world.id} />,
    },
    {
      key: 'relations',
      label: (
        <span>
          <NodeIndexOutlined /> 关系网络
        </span>
      ),
      children: <RelationsPanel worldId={world.id} />,
    },
  ];

  return (
    <div className="world-detail">
      <Breadcrumb className="detail-breadcrumb">
        <Breadcrumb.Item>
          <a onClick={onBack}><ArrowLeftOutlined /> 返回世界列表</a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{world.name}</Breadcrumb.Item>
      </Breadcrumb>

      <div className="world-header">
        <div className="world-info">
          <div className="world-icon">
            <GlobalOutlined />
          </div>
          <div>
            <h1>{world.name}</h1>
            <Space>
              <Tag color="blue">{getWorldTypeName(world.world_type)}</Tag>
              <Text type="secondary">创建于 {new Date(world.created_at).toLocaleDateString()}</Text>
            </Space>
          </div>
        </div>
        <Space>
          <Button icon={<EditOutlined />} onClick={handleEditWorld}>编辑世界</Button>
          <Button type="primary" icon={<PlusOutlined />}>添加设定</Button>
        </Space>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab} 
        items={tabItems}
        className="world-tabs"
      />

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
    </div>
  );
};

// ==================== 概览标签页 ====================

const OverviewTab = ({ world, stats }) => {
  return (
    <div className="overview-tab">
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Row gutter={[24, 24]}>
            <Col xs={12} sm={6}>
              <StatCard
                icon={<UserOutlined />}
                title="总角色数"
                value={stats.characters}
                color="#1890ff"
                trend={12}
              />
            </Col>
            <Col xs={12} sm={6}>
              <StatCard
                icon={<TeamOutlined />}
                title="势力组织"
                value={stats.factions}
                color="#722ed1"
                trend={5}
              />
            </Col>
            <Col xs={12} sm={6}>
              <StatCard
                icon={<EnvironmentOutlined />}
                title="地点场景"
                value={stats.locations}
                color="#13c2c2"
              />
            </Col>
            <Col xs={12} sm={6}>
              <StatCard
                icon={<HistoryOutlined />}
                title="历史事件"
                value={stats.events}
                color="#fa8c16"
                trend={23}
              />
            </Col>
          </Row>
        </Col>

        <Col lg={16}>
          <Card title="世界描述" className="info-card">
            <Paragraph>
              {world.description || '暂无描述'}
            </Paragraph>
          </Card>
          <Card title="核心规则" className="info-card" style={{ marginTop: 24 }}>
            <Paragraph>
              {world.core_rules || '暂无核心规则设定'}
            </Paragraph>
          </Card>
        </Col>

        <Col lg={8}>
          <Card title="快速创建" className="quick-create-card">
            <div className="quick-create-list">
              <div className="quick-create-item">
                <div className="quick-icon" style={{ backgroundColor: '#1890ff20', color: '#1890ff' }}>
                  <UserOutlined />
                </div>
                <div className="quick-info">
                  <div className="quick-title">新建角色</div>
                  <div className="quick-desc">添加故事人物</div>
                </div>
              </div>
              <div className="quick-create-item">
                <div className="quick-icon" style={{ backgroundColor: '#13c2c220', color: '#13c2c2' }}>
                  <EnvironmentOutlined />
                </div>
                <div className="quick-info">
                  <div className="quick-title">新建地点</div>
                  <div className="quick-desc">添加场景设定</div>
                </div>
              </div>
              <div className="quick-create-item">
                <div className="quick-icon" style={{ backgroundColor: '#fa8c1620', color: '#fa8c16' }}>
                  <HistoryOutlined />
                </div>
                <div className="quick-info">
                  <div className="quick-title">新建事件</div>
                  <div className="quick-desc">添加历史节点</div>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// ==================== 角色管理面板 ====================

const CharacterManagementPanel = ({ worldId }) => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [form] = Form.useForm();

  const fetchCharacters = async () => {
    setLoading(true);
    try {
      const response = await characterApi.getCharacters(null, worldId);
      setCharacters(response.data || []);
    } catch (error) {
      message.error('获取角色列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (worldId) {
      fetchCharacters();
    }
  }, [worldId]);

  const showModal = (character = null) => {
    setEditingCharacter(character);
    if (character) {
      form.setFieldsValue(character);
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

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
    }
  };

  const handleDelete = async (id) => {
    try {
      await characterApi.deleteCharacter(id);
      message.success('删除角色成功');
      fetchCharacters();
    } catch (error) {
      message.error('删除角色失败');
    }
  };

  const getRoleTypeColor = (type) => {
    const colors = {
      '主角': '#1890ff',
      '配角': '#52c41a',
      '反派': '#f5222d',
      '龙套': '#8c8c8c',
      '背景': '#d9d9d9'
    };
    return colors[type] || '#1890ff';
  };

  return (
    <div className="character-management">
      <div className="panel-header">
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
            创建角色
          </Button>
          <Button icon={<FilterOutlined />}>筛选</Button>
        </Space>
        <Space>
          <Input.Search placeholder="搜索角色..." style={{ width: 200 }} />
        </Space>
      </div>

      <Row gutter={[24, 24]} className="characters-grid">
        {characters.map(character => (
          <Col xs={24} sm={12} lg={8} xl={6} key={character.id}>
            <EntityCard
              title={character.name}
              subtitle={character.role_type}
              tags={[character.race, character.gender, character.status].filter(Boolean)}
              icon={<UserOutlined />}
              color={getRoleTypeColor(character.role_type)}
              extra={
                <Tag color={character.status === '存活' ? 'success' : 'error'}>
                  {character.status}
                </Tag>
              }
            />
          </Col>
        ))}
        
        <Col xs={24} sm={12} lg={8} xl={6}>
          <div className="create-entity-card" onClick={() => showModal()}>
            <PlusOutlined />
            <span>创建新角色</span>
          </div>
        </Col>
      </Row>

      <Modal
        title={editingCharacter ? '编辑角色' : '创建角色'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="角色名称" rules={[{ required: true }]}>
            <Input placeholder="例如：阿尔萨斯" />
          </Form.Item>
          <Form.Item name="role_type" label="角色类型" rules={[{ required: true }]}>
            <Select placeholder="选择角色类型">
              <Select.Option value="主角">主角</Select.Option>
              <Select.Option value="配角">配角</Select.Option>
              <Select.Option value="反派">反派</Select.Option>
              <Select.Option value="龙套">龙套</Select.Option>
              <Select.Option value="背景">背景</Select.Option>
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="race" label="种族">
                <Input placeholder="例如：人类、精灵" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gender" label="性别">
                <Select placeholder="选择性别">
                  <Select.Option value="男">男</Select.Option>
                  <Select.Option value="女">女</Select.Option>
                  <Select.Option value="其他">其他</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="appearance" label="外貌描述">
            <TextArea rows={3} placeholder="描述角色的外貌特征" />
          </Form.Item>
          <Form.Item name="personality" label="性格描述">
            <TextArea rows={3} placeholder="描述角色的性格特点" />
          </Form.Item>
          <Form.Item name="background" label="背景故事">
            <TextArea rows={4} placeholder="描述角色的背景故事" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};



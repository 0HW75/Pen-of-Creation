import React, { useState, useEffect } from 'react';
import {
  Layout, Card, Button, Table, Modal, Form, Input, Select,
  message, Popconfirm, Space, Typography, Tabs, Row, Col, Tag,
  Empty, Breadcrumb, Badge, Statistic, Divider, Timeline,
  Progress, Avatar, List, Tooltip, Drawer, Descriptions, InputNumber
} from 'antd';

import axios from 'axios';

const { TextArea } = Input;
const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

// 导入新创建的组件
import WorldArchitecture from '../../components/WorldSetting/WorldArchitecture';
import EnergySystem from '../../components/WorldSetting/EnergySystem';
import SocietySystem from '../../components/WorldSetting/SocietySystem';
import HistoryTimeline from '../../components/WorldSetting/HistoryTimeline';
import CharacterCard from '../../components/CharacterCard';
import LocationManagement from '../../components/WorldSetting/LocationManagement';
import FactionManagement from '../../components/WorldSetting/FactionManagement';
import ItemManagement from '../../components/WorldSetting/ItemManagement';

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
  MenuOutlined, CloseOutlined, FileSearchOutlined
} from '@ant-design/icons';

import {
  worldApi, characterApi, locationApi, itemApi, factionApi,
  worldSettingApi, energySocietyApi, historyTimelineApi, tagsRelationsApi
} from '../../services/api';

import './styles.css';

// ==================== 通用组件 ====================

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

  useEffect(() => {
    loadRelationStats();
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

  const relationTypes = [
    { name: '角色-势力', count: stats.characterRelations, color: '#1890ff', icon: <UserOutlined /> },
    { name: '角色-地点', count: stats.characterRelations, color: '#52c41a', icon: <EnvironmentOutlined /> },
    { name: '势力-地点', count: stats.factionRelations, color: '#722ed1', icon: <BankOutlined /> },
    { name: '物品-持有者', count: stats.itemRelations, color: '#faad14', icon: <ShoppingOutlined /> },
  ];

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
          <Card title="关系网络图" style={{ minHeight: '400px' }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="关系网络可视化功能开发中..."
            />
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Text type="secondary">将展示角色、势力、地点之间的关联关系图</Text>
            </div>
          </Card>
        </Col>

        <Col lg={8}>
          <Card title="快速关联" style={{ minHeight: '400px' }}>
            <div className="quick-relations">
              <div className="quick-relation-item" style={{ padding: '12px', marginBottom: '12px', background: '#f5f5f5', borderRadius: '6px', cursor: 'pointer' }}>
                <Space>
                  <UserOutlined style={{ color: '#1890ff' }} />
                  <span>角色加入势力</span>
                </Space>
              </div>
              <div className="quick-relation-item" style={{ padding: '12px', marginBottom: '12px', background: '#f5f5f5', borderRadius: '6px', cursor: 'pointer' }}>
                <Space>
                  <ShoppingOutlined style={{ color: '#faad14' }} />
                  <span>物品分配持有者</span>
                </Space>
              </div>
              <div className="quick-relation-item" style={{ padding: '12px', marginBottom: '12px', background: '#f5f5f5', borderRadius: '6px', cursor: 'pointer' }}>
                <Space>
                  <EnvironmentOutlined style={{ color: '#52c41a' }} />
                  <span>角色移动到地点</span>
                </Space>
              </div>
              <div className="quick-relation-item" style={{ padding: '12px', marginBottom: '12px', background: '#f5f5f5', borderRadius: '6px', cursor: 'pointer' }}>
                <Space>
                  <TeamOutlined style={{ color: '#722ed1' }} />
                  <span>势力占领地点</span>
                </Space>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// 统计卡片组件
const StatCard = ({ icon, title, value, color, trend }) => (
  <Card className="stat-card" variant="borderless">
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

// ==================== 全局搜索组件 ====================

const GlobalSearchModal = ({ visible, onClose, worldId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (visible && searchTerm) {
      performSearch(searchTerm);
    }
  }, [visible, searchTerm, activeFilter]);

  const performSearch = async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      // 并行搜索所有实体
      const [charactersRes, factionsRes, locationsRes, itemsRes, eventsRes] = await Promise.all([
        characterApi.getCharacters(null, worldId).catch(() => ({ data: [] })),
        factionApi.getFactions(null, worldId).catch(() => ({ data: [] })),
        locationApi.getLocations(null, worldId).catch(() => ({ data: [] })),
        itemApi.getItems(null, worldId).catch(() => ({ data: [] })),
        historyTimelineApi.getHistoricalEvents(worldId).catch(() => ({ data: { data: [] } }))
      ]);

      const characters = (charactersRes.data || []).map(c => ({ ...c, type: 'character', typeName: '角色' }));
      const factions = (factionsRes.data || []).map(f => ({ ...f, type: 'faction', typeName: '势力' }));
      const locations = (locationsRes.data || []).map(l => ({ ...l, type: 'location', typeName: '地点' }));
      const items = (itemsRes.data || []).map(i => ({ ...i, type: 'item', typeName: '物品' }));
      const events = (eventsRes.data?.data || []).map(e => ({ ...e, type: 'event', typeName: '事件' }));

      const allResults = [...characters, ...factions, ...locations, ...items, ...events];

      // 过滤搜索结果
      const filtered = allResults.filter(item => {
        const matchType = activeFilter === 'all' || item.type === activeFilter;
        const matchSearch =
          (item.name && item.name.toLowerCase().includes(term.toLowerCase())) ||
          (item.description && item.description.toLowerCase().includes(term.toLowerCase())) ||
          (item.title && item.title.toLowerCase().includes(term.toLowerCase()));
        return matchType && matchSearch;
      });

      setSearchResults(filtered);
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      character: '#1890ff',
      faction: '#722ed1',
      location: '#52c41a',
      item: '#faad14',
      event: '#fa8c16'
    };
    return colors[type] || '#999';
  };

  const getTypeIcon = (type) => {
    const icons = {
      character: <UserOutlined />,
      faction: <BankOutlined />,
      location: <EnvironmentOutlined />,
      item: <ShoppingOutlined />,
      event: <HistoryOutlined />
    };
    return icons[type] || <FileSearchOutlined />;
  };

  return (
    <Modal
      title={
        <Space>
          <SearchOutlined />
          <span>全局搜索</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Input.Search
        placeholder="搜索角色、势力、地点、物品、事件..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onSearch={performSearch}
        loading={loading}
        style={{ marginBottom: 16 }}
        allowClear
      />

      <Space style={{ marginBottom: 16 }} wrap>
        <Tag
          color={activeFilter === 'all' ? 'blue' : 'default'}
          style={{ cursor: 'pointer' }}
          onClick={() => setActiveFilter('all')}
        >
          全部
        </Tag>
        <Tag
          color={activeFilter === 'character' ? 'blue' : 'default'}
          style={{ cursor: 'pointer' }}
          onClick={() => setActiveFilter('character')}
        >
          <UserOutlined /> 角色
        </Tag>
        <Tag
          color={activeFilter === 'faction' ? 'purple' : 'default'}
          style={{ cursor: 'pointer' }}
          onClick={() => setActiveFilter('faction')}
        >
          <BankOutlined /> 势力
        </Tag>
        <Tag
          color={activeFilter === 'location' ? 'green' : 'default'}
          style={{ cursor: 'pointer' }}
          onClick={() => setActiveFilter('location')}
        >
          <EnvironmentOutlined /> 地点
        </Tag>
        <Tag
          color={activeFilter === 'item' ? 'gold' : 'default'}
          style={{ cursor: 'pointer' }}
          onClick={() => setActiveFilter('item')}
        >
          <ShoppingOutlined /> 物品
        </Tag>
        <Tag
          color={activeFilter === 'event' ? 'orange' : 'default'}
          style={{ cursor: 'pointer' }}
          onClick={() => setActiveFilter('event')}
        >
          <HistoryOutlined /> 事件
        </Tag>
      </Space>

      <div style={{ maxHeight: '400px', overflow: 'auto' }}>
        {searchResults.length === 0 ? (
          <Empty description={searchTerm ? '未找到匹配结果' : '输入关键词开始搜索'} />
        ) : (
          <List
            dataSource={searchResults}
            renderItem={item => (
              <List.Item
                style={{ cursor: 'pointer', padding: '12px', borderRadius: '6px' }}
                onClick={() => {
                  // 可以在这里添加跳转到对应详情页的逻辑
                  message.info(`查看 ${item.name} 详情`);
                }}
              >
                <List.Item.Meta
                  avatar={
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: `${getTypeColor(item.type)}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: getTypeColor(item.type)
                    }}>
                      {getTypeIcon(item.type)}
                    </div>
                  }
                  title={
                    <Space>
                      <span>{item.name}</span>
                      <Tag color={getTypeColor(item.type)}>{item.typeName}</Tag>
                    </Space>
                  }
                  description={item.description?.substring(0, 100) || '暂无描述'}
                />
              </List.Item>
            )}
          />
        )}
      </div>

      {searchResults.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: 16, color: '#999' }}>
          找到 {searchResults.length} 个结果
        </div>
      )}
    </Modal>
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
  const [isSearchVisible, setIsSearchVisible] = useState(false);
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
      key: 'locations',
      label: (
        <span>
          <EnvironmentOutlined /> 地点场景
        </span>
      ),
      children: <LocationManagement worldId={world.id} />,
    },
    {
      key: 'factions',
      label: (
        <span>
          <BankOutlined /> 组织势力
        </span>
      ),
      children: <FactionManagement worldId={world.id} />,
    },
    {
      key: 'items',
      label: (
        <span>
          <ShoppingOutlined /> 物品资源
        </span>
      ),
      children: <ItemManagement worldId={world.id} />,
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
      <Breadcrumb
        className="detail-breadcrumb"
        items={[
          {
            title: <a onClick={onBack}><ArrowLeftOutlined /> 返回世界列表</a>,
          },
          {
            title: world.name,
          },
        ]}
      />

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
          <Button icon={<SearchOutlined />} onClick={() => setIsSearchVisible(true)}>全局搜索</Button>
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

      {/* 全局搜索模态框 */}
      <GlobalSearchModal
        visible={isSearchVisible}
        onClose={() => setIsSearchVisible(false)}
        worldId={world.id}
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
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    // 模拟加载最近活动数据
    setRecentActivities([
      { id: 1, type: 'character', action: 'create', name: '阿尔萨斯', time: '10分钟前', user: '作者' },
      { id: 2, type: 'location', action: 'update', name: '洛丹伦王城', time: '30分钟前', user: '作者' },
      { id: 3, type: 'faction', action: 'create', name: '白银之手骑士团', time: '1小时前', user: '作者' },
      { id: 4, type: 'item', action: 'create', name: '霜之哀伤', time: '2小时前', user: '作者' },
      { id: 5, type: 'event', action: 'update', name: '斯坦索姆屠城', time: '3小时前', user: '作者' },
    ]);
  }, []);

  const getActivityIcon = (type) => {
    const icons = {
      character: <UserOutlined style={{ color: '#1890ff' }} />,
      faction: <BankOutlined style={{ color: '#722ed1' }} />,
      location: <EnvironmentOutlined style={{ color: '#52c41a' }} />,
      item: <ShoppingOutlined style={{ color: '#faad14' }} />,
      event: <HistoryOutlined style={{ color: '#fa8c16' }} />
    };
    return icons[type] || <FileSearchOutlined />;
  };

  const getActivityText = (action) => {
    const texts = {
      create: '创建了',
      update: '更新了',
      delete: '删除了'
    };
    return texts[action] || action;
  };

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

          {/* 数据分布统计 */}
          <Card title="数据分布" style={{ marginTop: 24 }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div style={{ textAlign: 'center', padding: '16px', background: '#f0f5ff', borderRadius: '8px' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1890ff' }}>
                    {stats.characters + stats.factions + stats.locations + stats.items + stats.events}
                  </div>
                  <div style={{ color: '#666' }}>总设定数</div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center', padding: '16px', background: '#f6ffed', borderRadius: '8px' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#52c41a' }}>
                    {Math.round((stats.characters + stats.factions + stats.locations + stats.items + stats.events) / 5)}
                  </div>
                  <div style={{ color: '#666' }}>平均每个分类</div>
                </div>
              </Col>
            </Row>
            <div style={{ marginTop: 16 }}>
              <div style={{ marginBottom: '8px' }}>
                <Space>
                  <UserOutlined style={{ color: '#1890ff' }} />
                  <span>角色</span>
                  <span style={{ marginLeft: 'auto' }}>{stats.characters}</span>
                </Space>
                <Progress percent={stats.characters > 0 ? Math.min(stats.characters * 5, 100) : 0} size="small" strokeColor="#1890ff" />
              </div>
              <div style={{ marginBottom: '8px' }}>
                <Space>
                  <BankOutlined style={{ color: '#722ed1' }} />
                  <span>势力</span>
                  <span style={{ marginLeft: 'auto' }}>{stats.factions}</span>
                </Space>
                <Progress percent={stats.factions > 0 ? Math.min(stats.factions * 10, 100) : 0} size="small" strokeColor="#722ed1" />
              </div>
              <div style={{ marginBottom: '8px' }}>
                <Space>
                  <EnvironmentOutlined style={{ color: '#52c41a' }} />
                  <span>地点</span>
                  <span style={{ marginLeft: 'auto' }}>{stats.locations}</span>
                </Space>
                <Progress percent={stats.locations > 0 ? Math.min(stats.locations * 10, 100) : 0} size="small" strokeColor="#52c41a" />
              </div>
              <div style={{ marginBottom: '8px' }}>
                <Space>
                  <ShoppingOutlined style={{ color: '#faad14' }} />
                  <span>物品</span>
                  <span style={{ marginLeft: 'auto' }}>{stats.items}</span>
                </Space>
                <Progress percent={stats.items > 0 ? Math.min(stats.items * 10, 100) : 0} size="small" strokeColor="#faad14" />
              </div>
              <div>
                <Space>
                  <HistoryOutlined style={{ color: '#fa8c16' }} />
                  <span>事件</span>
                  <span style={{ marginLeft: 'auto' }}>{stats.events}</span>
                </Space>
                <Progress percent={stats.events > 0 ? Math.min(stats.events * 5, 100) : 0} size="small" strokeColor="#fa8c16" />
              </div>
            </div>
          </Card>
        </Col>

        <Col lg={8}>
          <Card title="快速创建" className="quick-create-card">
            <div className="quick-create-list">
              <div className="quick-create-item" style={{ cursor: 'pointer', padding: '12px', borderRadius: '6px', transition: 'background 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <div className="quick-icon" style={{ backgroundColor: '#1890ff20', color: '#1890ff', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserOutlined />
                </div>
                <div className="quick-info" style={{ marginLeft: 12 }}>
                  <div className="quick-title" style={{ fontWeight: 'bold' }}>新建角色</div>
                  <div className="quick-desc" style={{ color: '#999', fontSize: '12px' }}>添加故事人物</div>
                </div>
              </div>
              <div className="quick-create-item" style={{ cursor: 'pointer', padding: '12px', borderRadius: '6px', transition: 'background 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <div className="quick-icon" style={{ backgroundColor: '#13c2c220', color: '#13c2c2', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <EnvironmentOutlined />
                </div>
                <div className="quick-info" style={{ marginLeft: 12 }}>
                  <div className="quick-title" style={{ fontWeight: 'bold' }}>新建地点</div>
                  <div className="quick-desc" style={{ color: '#999', fontSize: '12px' }}>添加场景设定</div>
                </div>
              </div>
              <div className="quick-create-item" style={{ cursor: 'pointer', padding: '12px', borderRadius: '6px', transition: 'background 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <div className="quick-icon" style={{ backgroundColor: '#722ed120', color: '#722ed1', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BankOutlined />
                </div>
                <div className="quick-info" style={{ marginLeft: 12 }}>
                  <div className="quick-title" style={{ fontWeight: 'bold' }}>新建势力</div>
                  <div className="quick-desc" style={{ color: '#999', fontSize: '12px' }}>添加组织势力</div>
                </div>
              </div>
              <div className="quick-create-item" style={{ cursor: 'pointer', padding: '12px', borderRadius: '6px', transition: 'background 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <div className="quick-icon" style={{ backgroundColor: '#faad1420', color: '#faad14', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingOutlined />
                </div>
                <div className="quick-info" style={{ marginLeft: 12 }}>
                  <div className="quick-title" style={{ fontWeight: 'bold' }}>新建物品</div>
                  <div className="quick-desc" style={{ color: '#999', fontSize: '12px' }}>添加物品资源</div>
                </div>
              </div>
              <div className="quick-create-item" style={{ cursor: 'pointer', padding: '12px', borderRadius: '6px', transition: 'background 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <div className="quick-icon" style={{ backgroundColor: '#fa8c1620', color: '#fa8c16', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HistoryOutlined />
                </div>
                <div className="quick-info" style={{ marginLeft: 12 }}>
                  <div className="quick-title" style={{ fontWeight: 'bold' }}>新建事件</div>
                  <div className="quick-desc" style={{ color: '#999', fontSize: '12px' }}>添加历史节点</div>
                </div>
              </div>
            </div>
          </Card>

          {/* 最近活动 */}
          <Card title="最近活动" style={{ marginTop: 24 }}>
            <Timeline mode="left">
              {recentActivities.map(activity => (
                <Timeline.Item
                  key={activity.id}
                  dot={getActivityIcon(activity.type)}
                  label={activity.time}
                >
                  <div style={{ fontSize: '14px' }}>
                    <span style={{ color: '#666' }}>{getActivityText(activity.action)}</span>
                    <span style={{ fontWeight: 'bold', marginLeft: 4 }}>{activity.name}</span>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
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
  const [detailVisible, setDetailVisible] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [viewingCharacter, setViewingCharacter] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
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

  const handleDelete = async (character) => {
    try {
      await characterApi.deleteCharacter(character.id);
      message.success('删除角色成功');
      fetchCharacters();
    } catch (error) {
      message.error('删除角色失败');
    }
  };

  const handleView = (character) => {
    setViewingCharacter(character);
    setDetailVisible(true);
  };

  // 过滤角色
  const filteredCharacters = characters.filter(character => {
    const matchSearch = !searchText ||
      character.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      character.title?.toLowerCase().includes(searchText.toLowerCase());
    const matchRole = filterRole === 'all' || character.role === filterRole;
    const matchStatus = filterStatus === 'all' || character.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  // 统计信息
  const totalCharacters = characters.length;
  const importantCharacters = characters.filter(c => c.is_important).length;
  const aliveCharacters = characters.filter(c => c.status === 'alive').length;
  const deadCharacters = characters.filter(c => c.status === 'dead').length;

  return (
    <div className="character-management">
      {/* 统计面板 */}
      <Row gutter={16} className="stats-row" style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card className="stat-card" size="small">
            <Statistic
              title="角色总数"
              value={totalCharacters}
              prefix={<UserOutlined />}
              styles={{ content: { color: '#1890ff' } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card" size="small">
            <Statistic
              title="重要角色"
              value={importantCharacters}
              prefix={<StarOutlined />}
              styles={{ content: { color: '#faad14' } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card" size="small">
            <Statistic
              title="存活"
              value={aliveCharacters}
              prefix={<UserOutlined />}
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card" size="small">
            <Statistic
              title="已死亡"
              value={deadCharacters}
              prefix={<UserOutlined />}
              styles={{ content: { color: '#ff4d4f' } }}
            />
          </Card>
        </Col>
      </Row>

      {/* 工具栏 */}
      <Card className="toolbar-card" style={{ marginBottom: 16 }}>
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Space wrap>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
              创建角色
            </Button>
            <Select
              placeholder="角色类型"
              value={filterRole}
              onChange={setFilterRole}
              style={{ width: 120 }}
              allowClear
            >
              <Select.Option value="all">全部类型</Select.Option>
              <Select.Option value="主角">主角</Select.Option>
              <Select.Option value="配角">配角</Select.Option>
              <Select.Option value="反派">反派</Select.Option>
              <Select.Option value="NPC">NPC</Select.Option>
            </Select>
            <Select
              placeholder="状态"
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: 120 }}
              allowClear
            >
              <Select.Option value="all">全部状态</Select.Option>
              <Select.Option value="alive">存活</Select.Option>
              <Select.Option value="dead">已死亡</Select.Option>
            </Select>
          </Space>
          <Space wrap>
            <Input.Search
              placeholder="搜索角色..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              value={viewMode}
              onChange={setViewMode}
              style={{ width: 100 }}
            >
              <Select.Option value="grid">网格</Select.Option>
              <Select.Option value="list">列表</Select.Option>
            </Select>
          </Space>
        </div>
      </Card>

      {/* 角色列表 */}
      <div className="characters-container">
        {filteredCharacters.length === 0 ? (
          <Empty
            description={
              searchText || filterRole !== 'all' || filterStatus !== 'all'
                ? '没有找到匹配的角色'
                : '还没有创建任何角色，点击"创建角色"开始吧！'
            }
            className="empty-state"
          />
        ) : viewMode === 'grid' ? (
          <Row gutter={[16, 16]}>
            {filteredCharacters.map(character => (
              <Col xs={24} sm={12} lg={8} xl={6} key={character.id}>
                <CharacterCard
                  character={character}
                  viewMode="grid"
                  onView={handleView}
                  onEdit={showModal}
                  onDelete={handleDelete}
                />
              </Col>
            ))}
          </Row>
        ) : (
          <div className="characters-list">
            {filteredCharacters.map(character => (
              <CharacterCard
                key={character.id}
                character={character}
                viewMode="list"
                onView={handleView}
                onEdit={showModal}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* 创建/编辑模态框 */}
      <Modal
        title={editingCharacter ? '编辑角色' : '创建角色'}
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
                        <Form.Item name="name" label="角色名称" rules={[{ required: true, message: '请输入角色名称' }]}>
                          <Input placeholder="例如：阿尔萨斯" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="alternative_names" label="别名">
                          <Input placeholder="例如：阿尔、王子（多个别名用逗号分隔）" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item name="character_type" label="角色类型">
                          <Select placeholder="选择角色类型">
                            <Select.Option value="主角">主角</Select.Option>
                            <Select.Option value="配角">配角</Select.Option>
                            <Select.Option value="反派">反派</Select.Option>
                            <Select.Option value="NPC">NPC</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="role_type" label="角色定位">
                          <Select placeholder="选择角色定位">
                            <Select.Option value="领袖">领袖</Select.Option>
                            <Select.Option value="战士">战士</Select.Option>
                            <Select.Option value="法师">法师</Select.Option>
                            <Select.Option value="治疗">治疗</Select.Option>
                            <Select.Option value="辅助">辅助</Select.Option>
                            <Select.Option value="刺客">刺客</Select.Option>
                            <Select.Option value="射手">射手</Select.Option>
                            <Select.Option value="坦克">坦克</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="importance_level" label="重要程度 (1-10)">
                          <InputNumber min={1} max={10} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item name="race" label="种族">
                          <Input placeholder="例如：人类、精灵、矮人" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="occupation" label="职业/身份">
                          <Input placeholder="例如：骑士、法师、商人" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="faction" label="所属势力">
                          <Input placeholder="例如：白银之手、部落" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={6}>
                        <Form.Item name="gender" label="性别">
                          <Select placeholder="选择性别">
                            <Select.Option value="男">男</Select.Option>
                            <Select.Option value="女">女</Select.Option>
                            <Select.Option value="其他">其他</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item name="age" label="年龄">
                          <InputNumber min={0} max={9999} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item name="birth_date" label="出生日期">
                          <Input placeholder="例如：元年春" />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item name="status" label="状态">
                          <Select placeholder="选择状态">
                            <Select.Option value="alive">存活</Select.Option>
                            <Select.Option value="dead">已死亡</Select.Option>
                            <Select.Option value="missing">失踪</Select.Option>
                            <Select.Option value="sealed">被封印</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="birthplace" label="出生地">
                          <Input placeholder="例如：洛丹伦王城" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="nationality" label="国籍/籍贯">
                          <Input placeholder="例如：洛丹伦王国" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="current_location" label="当前位置">
                          <Input placeholder="例如：诺森德" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="current_level" label="当前等级/境界">
                          <Input placeholder="例如：60级/大法师" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item name="description" label="角色简介">
                      <TextArea rows={2} placeholder="简要描述角色的核心特点" />
                    </Form.Item>
                  </>
                )
              },
              {
                key: 'appearance',
                label: '外貌特征',
                children: (
                  <>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item name="appearance_age" label="外貌年龄">
                          <InputNumber min={0} max={9999} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={16}>
                        <Form.Item name="distinguishing_features" label="显著特征">
                          <Input placeholder="例如：金色长发、蓝色眼睛、左脸颊有疤痕" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item name="appearance" label="外貌详细描述">
                      <TextArea rows={6} placeholder="详细描述角色的外貌特征，包括身高、体型、面容、发型、眼睛、穿着风格等" />
                    </Form.Item>
                  </>
                )
              },
              {
                key: 'personality',
                label: '性格心理',
                children: (
                  <>
                    <Form.Item name="personality" label="性格描述">
                      <TextArea rows={3} placeholder="描述角色的性格特点，如开朗、内向、勇敢、谨慎等" />
                    </Form.Item>
                    <Form.Item name="core_traits" label="核心特质">
                      <TextArea rows={2} placeholder="例如：正义感强、重情重义、固执己见" />
                    </Form.Item>
                    <Form.Item name="values" label="价值观">
                      <TextArea rows={2} placeholder="角色信奉的价值观和人生信条" />
                    </Form.Item>
                    <Form.Item name="psychological_fear" label="心理恐惧">
                      <TextArea rows={2} placeholder="角色内心深处的恐惧和不安" />
                    </Form.Item>
                    <Form.Item name="psychological_trauma" label="心理创伤">
                      <TextArea rows={2} placeholder="角色经历过的心理创伤" />
                    </Form.Item>
                  </>
                )
              },
              {
                key: 'background',
                label: '背景经历',
                children: (
                  <>
                    <Form.Item name="background" label="背景故事">
                      <TextArea rows={4} placeholder="描述角色的出身、成长环境和早期经历" />
                    </Form.Item>
                    <Form.Item name="family_background" label="家庭背景">
                      <TextArea rows={2} placeholder="描述角色的家庭情况，如父母、兄弟姐妹等" />
                    </Form.Item>
                    <Form.Item name="growth_experience" label="成长经历">
                      <TextArea rows={3} placeholder="描述角色的成长过程和重要经历" />
                    </Form.Item>
                    <Form.Item name="important_turning_points" label="重要转折点">
                      <TextArea rows={3} placeholder="描述改变角色命运的关键事件" />
                    </Form.Item>
                  </>
                )
              },
              {
                key: 'abilities',
                label: '能力设定',
                children: (
                  <>
                    <Form.Item name="physical_abilities" label="身体能力">
                      <TextArea rows={2} placeholder="描述角色的身体素质，如力量、速度、耐力等" />
                    </Form.Item>
                    <Form.Item name="intelligence_perception" label="智力感知">
                      <TextArea rows={2} placeholder="描述角色的智力水平、感知能力和学习能力" />
                    </Form.Item>
                    <Form.Item name="special_talents" label="特殊天赋">
                      <TextArea rows={2} placeholder="描述角色与生俱来的特殊才能" />
                    </Form.Item>
                    <Form.Item name="special_abilities" label="特殊能力">
                      <TextArea rows={3} placeholder="描述角色掌握的特殊技能或法术" />
                    </Form.Item>
                    <Form.Item name="ability_levels" label="能力等级">
                      <TextArea rows={2} placeholder="描述各项能力的等级和熟练度" />
                    </Form.Item>
                    <Form.Item name="ability_limits" label="能力限制">
                      <TextArea rows={2} placeholder="描述角色能力的局限性和弱点" />
                    </Form.Item>
                    <Form.Item name="growth_path" label="成长路径">
                      <TextArea rows={2} placeholder="描述角色的成长方向和潜力" />
                    </Form.Item>
                  </>
                )
              },
              {
                key: 'items',
                label: '物品装备',
                children: (
                  <>
                    <Form.Item name="common_equipment" label="常用装备">
                      <TextArea rows={2} placeholder="描述角色日常使用的装备" />
                    </Form.Item>
                    <Form.Item name="special_items" label="特殊物品">
                      <TextArea rows={2} placeholder="描述角色拥有的特殊或魔法物品" />
                    </Form.Item>
                    <Form.Item name="personal_items" label="个人物品">
                      <TextArea rows={2} placeholder="描述对角色有个人意义的物品" />
                    </Form.Item>
                    <Form.Item name="key_items" label="关键物品">
                      <TextArea rows={2} placeholder="描述对剧情有关键作用的物品" />
                    </Form.Item>
                  </>
                )
              },
              {
                key: 'relationships',
                label: '人际关系',
                children: (
                  <>
                    <Form.Item name="family_members" label="家庭成员">
                      <TextArea rows={2} placeholder="描述角色的家庭成员及其关系" />
                    </Form.Item>
                    <Form.Item name="close_friends" label="挚友">
                      <TextArea rows={2} placeholder="描述角色的亲密朋友" />
                    </Form.Item>
                    <Form.Item name="mentor_student" label="师徒关系">
                      <TextArea rows={2} placeholder="描述角色的师父或徒弟" />
                    </Form.Item>
                    <Form.Item name="colleagues" label="同事/同伴">
                      <TextArea rows={2} placeholder="描述角色的同事或冒险同伴" />
                    </Form.Item>
                    <Form.Item name="grudges" label="仇敌">
                      <TextArea rows={2} placeholder="描述角色的敌人和仇人" />
                    </Form.Item>
                    <Form.Item name="love_relationships" label="爱情关系">
                      <TextArea rows={2} placeholder="描述角色的恋人和情感关系" />
                    </Form.Item>
                    <Form.Item name="complex_emotions" label="复杂情感">
                      <TextArea rows={2} placeholder="描述角色复杂的情感纠葛" />
                    </Form.Item>
                    <Form.Item name="unrequited_love" label="暗恋">
                      <TextArea rows={2} placeholder="描述角色的暗恋对象" />
                    </Form.Item>
                  </>
                )
              },
              {
                key: 'development',
                label: '角色发展',
                children: (
                  <>
                    <Form.Item name="character_arc" label="角色弧线">
                      <TextArea rows={3} placeholder="描述角色在故事中的成长轨迹和变化" />
                    </Form.Item>
                    <Form.Item name="motivation" label="动机">
                      <TextArea rows={2} placeholder="描述角色行动的根本动机和目标" />
                    </Form.Item>
                    <Form.Item name="secrets" label="秘密">
                      <TextArea rows={2} placeholder="描述角色隐藏的秘密" />
                    </Form.Item>
                    <Form.Item name="emotional_changes" label="情感变化">
                      <TextArea rows={2} placeholder="描述角色情感状态的变化过程" />
                    </Form.Item>
                  </>
                )
              }
            ]}
          />
        </Form>
      </Modal>

      {/* 详情模态框 */}
      <Modal
        title="角色详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setDetailVisible(false);
              showModal(viewingCharacter);
            }}
          >
            编辑
          </Button>
        ]}
        width={800}
      >
        {viewingCharacter && (
          <div className="character-detail">
            <div className="character-detail-header">
              <div
                className="character-detail-avatar"
                style={{
                  background: viewingCharacter.avatar
                    ? `url(${viewingCharacter.avatar}) center/cover`
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
              >
                {!viewingCharacter.avatar && <UserOutlined />}
              </div>
              <div className="character-detail-info">
                <h2>{viewingCharacter.name}</h2>
                <p className="character-detail-title">{viewingCharacter.title || '无称号'}</p>
                <div className="character-detail-tags">
                  {viewingCharacter.role && <Tag color="blue">{viewingCharacter.role}</Tag>}
                  {viewingCharacter.race && <Tag>{viewingCharacter.race}</Tag>}
                  {viewingCharacter.character_class && <Tag>{viewingCharacter.character_class}</Tag>}
                  {viewingCharacter.alignment && <Tag color="purple">{viewingCharacter.alignment}</Tag>}
                  {viewingCharacter.status && (
                    <Tag color={viewingCharacter.status === 'alive' ? 'success' : 'error'}>
                      {viewingCharacter.status === 'alive' ? '存活' : '已死亡'}
                    </Tag>
                  )}
                </div>
              </div>
            </div>
            <div className="character-detail-content">
              <Descriptions column={2} layout="vertical" bordered>
                <Descriptions.Item label="等级">Lv.{viewingCharacter.level || 1}</Descriptions.Item>
                <Descriptions.Item label="性别">{viewingCharacter.gender || '-'}</Descriptions.Item>
                <Descriptions.Item label="所属势力">{viewingCharacter.faction_name || '-'}</Descriptions.Item>
                <Descriptions.Item label="当前位置">{viewingCharacter.location_name || '-'}</Descriptions.Item>
              </Descriptions>
              <div className="character-detail-section">
                <h4>外貌描述</h4>
                <p>{viewingCharacter.appearance || '暂无描述'}</p>
              </div>
              <div className="character-detail-section">
                <h4>性格描述</h4>
                <p>{viewingCharacter.personality || '暂无描述'}</p>
              </div>
              <div className="character-detail-section">
                <h4>背景故事</h4>
                <p>{viewingCharacter.background || '暂无描述'}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ==================== 主设定管理组件 ====================

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
        <WorldManagementPanel onSelectWorld={handleSelectWorld} projectId={projectId} />
      ) : (
        <WorldDetailPanel world={selectedWorld} onBack={handleBackToList} onEditWorld={handleEditWorld} projectId={projectId} />
      )}
    </div>
  );
};

export default SettingManagement;



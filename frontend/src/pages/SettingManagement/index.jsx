import React, { useState, useEffect, Suspense } from 'react';
import {
  Layout, Card, Button, Modal, Form, Input, Select,
  message, Popconfirm, Space, Typography, Tabs, Row, Col, Tag,
  Empty, Breadcrumb, Statistic, Divider, Timeline,
  Progress, Avatar, List, Descriptions, InputNumber
} from 'antd';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

// 导入已拆分的通用组件
import StatCard from '../../components/SettingManagement/Common/StatCard';
import EntityCard from '../../components/SettingManagement/Common/EntityCard';
import RelationsPanel from '../../components/SettingManagement/Common/RelationsPanel';
import GlobalSearchModal from '../../components/SettingManagement/Common/GlobalSearchModal';

// 导入 WorldSetting 组件
import WorldArchitecture from '../../components/WorldSetting/WorldArchitecture';
import EnergySystem from '../../components/WorldSetting/EnergySystem';
import SocietySystem from '../../components/WorldSetting/SocietySystem';
import HistoryTimeline from '../../components/WorldSetting/HistoryTimeline';
import LocationManagement from '../../components/WorldSetting/LocationManagement';
import FactionManagement from '../../components/WorldSetting/FactionManagement';
import ItemManagement from '../../components/WorldSetting/ItemManagement';
import CharacterCard from '../../components/CharacterCard';

import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  GlobalOutlined, UserOutlined, EnvironmentOutlined,
  TeamOutlined, ArrowLeftOutlined, StarOutlined,
  ShoppingOutlined, BankOutlined, HistoryOutlined,
  DashboardOutlined, SearchOutlined, ThunderboltOutlined,
  CrownOutlined, SafetyOutlined, FileSearchOutlined
} from '@ant-design/icons';

import {
  worldApi, characterApi, locationApi, itemApi, factionApi,
  historyTimelineApi
} from '../../services/api';

import './styles.css';

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
    const colors = { fantasy: '#722ed1', scifi: '#1890ff', modern: '#52c41a', historical: '#fa8c16', other: '#8c8c8c' };
    return colors[type] || '#1890ff';
  };

  const getWorldTypeName = (type) => {
    const names = { fantasy: '奇幻', scifi: '科幻', modern: '现代', historical: '历史', other: '其他' };
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
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()} className="create-btn">
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
                  <Button type="text" size="small" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); showModal(world); }} />
                  <Popconfirm title="确定要删除这个世界吗？" onConfirm={(e) => { e.stopPropagation(); handleDelete(world.id); }}>
                    <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()} />
                  </Popconfirm>
                </Space>
              }
            />
          </Col>
        ))}
        <Col xs={24} sm={12} lg={8} xl={6}>
          <div className="create-world-card" onClick={() => showModal()}>
            <div className="create-icon"><PlusOutlined /></div>
            <span>创建新世界</span>
            <p>开始构建你的小说世界观</p>
          </div>
        </Col>
      </Row>

      <Modal title={isEditing ? '编辑世界' : '创建世界'} open={isModalVisible} onCancel={() => setIsModalVisible(false)} onOk={() => form.submit()} width={600} className="world-modal">
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="世界名称" rules={[{ required: true, message: '请输入世界名称' }]}>
            <Input placeholder="例如：艾泽拉斯、中土世界" />
          </Form.Item>
          <Form.Item name="world_type" label="世界类型" rules={[{ required: true, message: '请选择世界类型' }]}>
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

// ==================== 概览标签页 ====================

const OverviewTab = ({ world, stats }) => {
  const [recentActivities] = useState([
    { id: 1, type: 'character', action: 'create', name: '阿尔萨斯', time: '10分钟前' },
    { id: 2, type: 'location', action: 'update', name: '洛丹伦王城', time: '30分钟前' },
    { id: 3, type: 'faction', action: 'create', name: '白银之手骑士团', time: '1小时前' },
    { id: 4, type: 'item', action: 'create', name: '霜之哀伤', time: '2小时前' },
    { id: 5, type: 'event', action: 'update', name: '斯坦索姆屠城', time: '3小时前' },
  ]);

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

  const getActivityText = (action) => ({ create: '创建了', update: '更新了', delete: '删除了' }[action] || action);

  return (
    <div className="overview-tab">
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Row gutter={[24, 24]}>
            <Col xs={12} sm={6}>
              <StatCard icon={<UserOutlined />} title="总角色数" value={stats.characters} color="#1890ff" trend={12} />
            </Col>
            <Col xs={12} sm={6}>
              <StatCard icon={<TeamOutlined />} title="势力组织" value={stats.factions} color="#722ed1" trend={5} />
            </Col>
            <Col xs={12} sm={6}>
              <StatCard icon={<EnvironmentOutlined />} title="地点场景" value={stats.locations} color="#13c2c2" />
            </Col>
            <Col xs={12} sm={6}>
              <StatCard icon={<HistoryOutlined />} title="历史事件" value={stats.events} color="#fa8c16" trend={23} />
            </Col>
          </Row>
        </Col>

        <Col lg={16}>
          <Card title="世界描述" className="info-card">
            <Paragraph>{world.description || '暂无描述'}</Paragraph>
          </Card>
          <Card title="核心规则" className="info-card" style={{ marginTop: 24 }}>
            <Paragraph>{world.core_rules || '暂无核心规则设定'}</Paragraph>
          </Card>

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
              {[
                { icon: <UserOutlined style={{ color: '#1890ff' }} />, label: '角色', value: stats.characters, color: '#1890ff' },
                { icon: <BankOutlined style={{ color: '#722ed1' }} />, label: '势力', value: stats.factions, color: '#722ed1' },
                { icon: <EnvironmentOutlined style={{ color: '#52c41a' }} />, label: '地点', value: stats.locations, color: '#52c41a' },
                { icon: <ShoppingOutlined style={{ color: '#faad14' }} />, label: '物品', value: stats.items, color: '#faad14' },
                { icon: <HistoryOutlined style={{ color: '#fa8c16' }} />, label: '事件', value: stats.events, color: '#fa8c16' },
              ].map((item, idx) => (
                <div key={idx} style={{ marginBottom: '8px' }}>
                  <Space>{item.icon}<span>{item.label}</span><span style={{ marginLeft: 'auto' }}>{item.value}</span></Space>
                  <Progress percent={item.value > 0 ? Math.min(item.value * 5, 100) : 0} size="small" strokeColor={item.color} />
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col lg={8}>
          <Card title="快速创建" className="quick-create-card">
            <div className="quick-create-list">
              {[
                { icon: <UserOutlined />, color: '#1890ff', title: '新建角色', desc: '添加故事人物' },
                { icon: <EnvironmentOutlined />, color: '#13c2c2', title: '新建地点', desc: '添加场景设定' },
                { icon: <BankOutlined />, color: '#722ed1', title: '新建势力', desc: '添加组织势力' },
                { icon: <ShoppingOutlined />, color: '#faad14', title: '新建物品', desc: '添加物品资源' },
                { icon: <HistoryOutlined />, color: '#fa8c16', title: '新建事件', desc: '添加历史节点' },
              ].map((item, idx) => (
                <div key={idx} className="quick-create-item" style={{ cursor: 'pointer', padding: '12px', borderRadius: '6px', transition: 'background 0.3s', display: 'flex', alignItems: 'center' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ backgroundColor: `${item.color}20`, color: item.color, width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</div>
                  <div style={{ marginLeft: 12 }}>
                    <div style={{ fontWeight: 'bold' }}>{item.title}</div>
                    <div style={{ color: '#999', fontSize: '12px' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="最近活动" style={{ marginTop: 24 }}>
            <Timeline
              mode="start"
              items={recentActivities.map(activity => ({
                key: activity.id,
                dot: getActivityIcon(activity.type),
                label: activity.time,
                children: (
                  <div style={{ fontSize: '14px' }}>
                    <span style={{ color: '#666' }}>{getActivityText(activity.action)}</span>
                    <span style={{ fontWeight: 'bold', marginLeft: 4 }}>{activity.name}</span>
                  </div>
                )
              }))}
            />
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
    if (worldId) fetchCharacters();
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

  const filteredCharacters = characters.filter(character => {
    const matchSearch = !searchText || character.name?.toLowerCase().includes(searchText.toLowerCase());
    const matchRole = filterRole === 'all' || character.character_type === filterRole;
    const matchStatus = filterStatus === 'all' || character.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const totalCharacters = characters.length;
  const importantCharacters = characters.filter(c => c.importance_level >= 8).length;
  const aliveCharacters = characters.filter(c => c.status === 'alive').length;
  const deadCharacters = characters.filter(c => c.status === 'dead').length;

  return (
    <div className="character-management">
      <Row gutter={16} className="stats-row" style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="角色总数" value={totalCharacters} prefix={<UserOutlined />} styles={{ content: { color: '#1890ff' } }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="重要角色" value={importantCharacters} prefix={<StarOutlined />} styles={{ content: { color: '#faad14' } }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="存活" value={aliveCharacters} prefix={<UserOutlined />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="已死亡" value={deadCharacters} prefix={<UserOutlined />} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Space wrap>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>创建角色</Button>
            <Select placeholder="角色类型" value={filterRole} onChange={setFilterRole} style={{ width: 120 }} allowClear>
              <Select.Option value="all">全部类型</Select.Option>
              <Select.Option value="主角">主角</Select.Option>
              <Select.Option value="配角">配角</Select.Option>
              <Select.Option value="反派">反派</Select.Option>
              <Select.Option value="NPC">NPC</Select.Option>
            </Select>
            <Select placeholder="状态" value={filterStatus} onChange={setFilterStatus} style={{ width: 120 }} allowClear>
              <Select.Option value="all">全部状态</Select.Option>
              <Select.Option value="alive">存活</Select.Option>
              <Select.Option value="dead">已死亡</Select.Option>
            </Select>
          </Space>
          <Space wrap>
            <Input.Search placeholder="搜索角色..." value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 200 }} allowClear />
            <Select value={viewMode} onChange={setViewMode} style={{ width: 100 }}>
              <Select.Option value="grid">网格</Select.Option>
              <Select.Option value="list">列表</Select.Option>
            </Select>
          </Space>
        </div>
      </Card>

      <div className="characters-container">
        {filteredCharacters.length === 0 ? (
          <Empty description={searchText || filterRole !== 'all' || filterStatus !== 'all' ? '没有找到匹配的角色' : '还没有创建任何角色，点击"创建角色"开始吧！'} className="empty-state" />
        ) : viewMode === 'grid' ? (
          <Row gutter={[16, 16]}>
            {filteredCharacters.map(character => (
              <Col xs={24} sm={12} lg={8} xl={6} key={character.id}>
                <CharacterCard character={character} viewMode="grid" onView={handleView} onEdit={showModal} onDelete={handleDelete} />
              </Col>
            ))}
          </Row>
        ) : (
          <div className="characters-list">
            {filteredCharacters.map(character => (
              <CharacterCard key={character.id} character={character} viewMode="list" onView={handleView} onEdit={showModal} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      <Modal title={editingCharacter ? '编辑角色' : '创建角色'} open={modalVisible} onCancel={() => setModalVisible(false)} onOk={() => form.submit()} width={900} destroyOnHidden>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Tabs
            items={[
              {
                key: 'basic', label: '基本信息',
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
                          <Input placeholder="多个别名用逗号分隔" />
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
                      <Col span={8}><Form.Item name="race" label="种族"><Input placeholder="例如：人类、精灵" /></Form.Item></Col>
                      <Col span={8}><Form.Item name="occupation" label="职业/身份"><Input placeholder="例如：骑士、法师" /></Form.Item></Col>
                      <Col span={8}><Form.Item name="faction" label="所属势力"><Input placeholder="例如：白银之手" /></Form.Item></Col>
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
                      <Col span={6}><Form.Item name="age" label="年龄"><InputNumber min={0} max={9999} style={{ width: '100%' }} /></Form.Item></Col>
                      <Col span={6}><Form.Item name="birth_date" label="出生日期"><Input placeholder="例如：元年春" /></Form.Item></Col>
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
                    <Form.Item name="description" label="角色简介"><TextArea rows={2} placeholder="简要描述角色的核心特点" /></Form.Item>
                  </>
                )
              },
              { key: 'appearance', label: '外貌特征', children: <Form.Item name="appearance" label="外貌详细描述"><TextArea rows={6} placeholder="详细描述角色的外貌特征" /></Form.Item> },
              { key: 'personality', label: '性格心理', children: <Form.Item name="personality" label="性格描述"><TextArea rows={4} placeholder="描述角色的性格特点" /></Form.Item> },
              { key: 'background', label: '背景经历', children: <Form.Item name="background" label="背景故事"><TextArea rows={4} placeholder="描述角色的出身和成长环境" /></Form.Item> },
              { key: 'abilities', label: '能力设定', children: <Form.Item name="special_abilities" label="特殊能力"><TextArea rows={4} placeholder="描述角色掌握的特殊技能或法术" /></Form.Item> },
              { key: 'items', label: '物品装备', children: <Form.Item name="special_items" label="特殊物品"><TextArea rows={3} placeholder="描述角色拥有的特殊或魔法物品" /></Form.Item> },
              { key: 'relationships', label: '人际关系', children: <Form.Item name="family_members" label="家庭成员"><TextArea rows={3} placeholder="描述角色的家庭成员及其关系" /></Form.Item> },
              { key: 'development', label: '角色发展', children: <Form.Item name="character_arc" label="角色弧线"><TextArea rows={3} placeholder="描述角色在故事中的成长轨迹" /></Form.Item> },
            ]}
          />
        </Form>
      </Modal>

      <Modal title="角色详情" open={detailVisible} onCancel={() => setDetailVisible(false)} footer={[<Button key="close" onClick={() => setDetailVisible(false)}>关闭</Button>, <Button key="edit" type="primary" icon={<EditOutlined />} onClick={() => { setDetailVisible(false); showModal(viewingCharacter); }}>编辑</Button>]} width={800}>
        {viewingCharacter && (
          <div className="character-detail">
            <div className="character-detail-header" style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
              <Avatar size={80} icon={<UserOutlined />} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }} />
              <div style={{ marginLeft: 16 }}>
                <h2>{viewingCharacter.name}</h2>
                <Space>
                  {viewingCharacter.character_type && <Tag color="blue">{viewingCharacter.character_type}</Tag>}
                  {viewingCharacter.race && <Tag>{viewingCharacter.race}</Tag>}
                  {viewingCharacter.status && <Tag color={viewingCharacter.status === 'alive' ? 'success' : 'error'}>{viewingCharacter.status === 'alive' ? '存活' : '已死亡'}</Tag>}
                </Space>
              </div>
            </div>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="性别">{viewingCharacter.gender || '-'}</Descriptions.Item>
              <Descriptions.Item label="年龄">{viewingCharacter.age || '-'}</Descriptions.Item>
              <Descriptions.Item label="职业">{viewingCharacter.occupation || '-'}</Descriptions.Item>
              <Descriptions.Item label="所属势力">{viewingCharacter.faction || '-'}</Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 16 }}>
              <h4>角色简介</h4>
              <p>{viewingCharacter.description || '暂无描述'}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ==================== 世界详情面板 ====================

const WorldDetailPanel = ({ world, onBack, onEditWorld }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ characters: 0, locations: 0, factions: 0, items: 0, events: 0 });
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [editForm] = Form.useForm();

  useEffect(() => {
    loadStats();
  }, [world.id]);

  const loadStats = async () => {
    try {
      const [charactersRes, locationsRes, factionsRes, itemsRes, eventsRes] = await Promise.all([
        characterApi.getCharacters(null, world.id).catch(() => ({ data: [] })),
        locationApi.getLocations(null, world.id).catch(() => ({ data: [] })),
        factionApi.getFactions(null, world.id).catch(() => ({ data: [] })),
        itemApi.getItems(null, world.id).catch(() => ({ data: [] })),
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

  const getWorldTypeName = (type) => ({ fantasy: '奇幻', scifi: '科幻', modern: '现代', historical: '历史', other: '其他' }[type] || type);

  const tabItems = [
    { key: 'overview', label: <span><DashboardOutlined /> 概览</span>, children: <OverviewTab world={world} stats={stats} /> },
    { key: 'characters', label: <span><UserOutlined /> 角色库</span>, children: <CharacterManagementPanel worldId={world.id} /> },
    { key: 'locations', label: <span><EnvironmentOutlined /> 地点场景</span>, children: <LocationManagement worldId={world.id} /> },
    { key: 'factions', label: <span><BankOutlined /> 组织势力</span>, children: <FactionManagement worldId={world.id} /> },
    { key: 'items', label: <span><ShoppingOutlined /> 物品资源</span>, children: <ItemManagement worldId={world.id} /> },
    { key: 'world-setting', label: <span><GlobalOutlined /> 世界架构</span>, children: <WorldArchitecture worldId={world.id} /> },
    { key: 'energy', label: <span><ThunderboltOutlined /> 能量体系</span>, children: <EnergySystem worldId={world.id} /> },
    { key: 'society', label: <span><TeamOutlined /> 社会体系</span>, children: <SocietySystem worldId={world.id} /> },
    { key: 'timeline', label: <span><HistoryOutlined /> 历史脉络</span>, children: <HistoryTimeline worldId={world.id} /> },
    { key: 'relations', label: <span><SafetyOutlined /> 关系网络</span>, children: <RelationsPanel worldId={world.id} /> },
  ];

  return (
    <div className="world-detail">
      <Breadcrumb className="detail-breadcrumb" items={[{ title: <a onClick={onBack}><ArrowLeftOutlined /> 返回世界列表</a> }, { title: world.name }]} />

      <div className="world-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ fontSize: 48, color: '#1890ff', marginRight: 16 }}><GlobalOutlined /></div>
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

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} className="world-tabs" />

      <GlobalSearchModal visible={isSearchVisible} onClose={() => setIsSearchVisible(false)} worldId={world.id} />

      <Modal title="编辑世界" open={isEditModalVisible} onCancel={() => setIsEditModalVisible(false)} onOk={() => editForm.submit()}>
        <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item name="name" label="世界名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="world_type" label="世界类型" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="fantasy">奇幻</Select.Option>
              <Select.Option value="scifi">科幻</Select.Option>
              <Select.Option value="modern">现代</Select.Option>
              <Select.Option value="historical">历史</Select.Option>
              <Select.Option value="other">其他</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="世界描述"><TextArea rows={4} /></Form.Item>
          <Form.Item name="core_rules" label="核心规则"><TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// ==================== 主设定管理组件 ====================

const SettingManagement = ({ projectId }) => {
  const [selectedWorld, setSelectedWorld] = useState(null);
  const [viewMode, setViewMode] = useState('list');
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

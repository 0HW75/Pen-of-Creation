import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Row,
  Col,
  Radio,
  Empty,
  InputNumber,
  Upload,
  Statistic
} from 'antd';
import {
  PlusOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  SearchOutlined,
  GlobalOutlined,
  DatabaseOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { worldApi } from '../services/api';
import { useWorld } from '../contexts/WorldContext';
import WorldCard from '../components/WorldCard';
import '../styles/WorldManagement.css';

const { TextArea } = Input;
const { Option } = Select;

const WorldManagement = () => {
  const [worlds, setWorlds] = useState([]);
  const [worldStats, setWorldStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingWorld, setEditingWorld] = useState(null);
  const [viewingWorld, setViewingWorld] = useState(null);
  const [viewMode, setViewMode] = useState('card'); // 'card' | 'list'
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [form] = Form.useForm();

  const { selectedWorld, selectWorld } = useWorld();

  // 获取世界列表和统计信息
  const fetchWorlds = async () => {
    setLoading(true);
    try {
      const response = await worldApi.getWorlds();
      if (response.data.code === 200) {
        setWorlds(response.data.data);
        // 获取每个世界的统计信息
        const statsPromises = response.data.data.map(world =>
          worldApi.getWorldStats(world.id).catch(() => ({
            character_count: 0,
            location_count: 0,
            faction_count: 0,
            event_count: 0
          }))
        );
        const statsResults = await Promise.all(statsPromises);
        const statsMap = {};
        response.data.data.forEach((world, index) => {
          statsMap[world.id] = statsResults[index].data?.data || statsResults[index];
        });
        setWorldStats(statsMap);
      }
    } catch (error) {
      message.error('获取世界列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorlds();
  }, []);

  // 打开创建/编辑模态框
  const showModal = (world = null) => {
    setEditingWorld(world);
    if (world) {
      form.setFieldsValue(world);
    } else {
      form.resetFields();
      form.setFieldsValue({ status: 'active', version: '1.0' });
    }
    setModalVisible(true);
  };

  // 关闭模态框
  const handleCancel = () => {
    setModalVisible(false);
    setEditingWorld(null);
    form.resetFields();
  };

  // 提交表单
  const handleSubmit = async (values) => {
    try {
      if (editingWorld) {
        await worldApi.updateWorld(editingWorld.id, values);
        message.success('更新世界成功');
      } else {
        await worldApi.createWorld(values);
        message.success('创建世界成功');
      }
      setModalVisible(false);
      fetchWorlds();
    } catch (error) {
      message.error(editingWorld ? '更新世界失败' : '创建世界失败');
      console.error(error);
    }
  };

  // 删除世界
  const handleDelete = async (world) => {
    try {
      await worldApi.deleteWorld(world.id);
      message.success('删除世界成功');
      if (selectedWorld?.id === world.id) {
        selectWorld(null);
      }
      fetchWorlds();
    } catch (error) {
      message.error('删除世界失败');
      console.error(error);
    }
  };

  // 进入世界
  const handleEnter = (world) => {
    selectWorld(world);
    message.success(`已切换到世界：${world.name}`);
  };

  // 查看详情
  const handleView = (world) => {
    setViewingWorld(world);
    setDetailModalVisible(true);
  };

  // 过滤世界列表
  const filteredWorlds = worlds.filter(world => {
    const matchSearch = !searchText ||
      world.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      world.core_concept?.toLowerCase().includes(searchText.toLowerCase());
    const matchType = filterType === 'all' || world.world_type === filterType;
    return matchSearch && matchType;
  });

  // 获取世界类型列表
  const worldTypes = [...new Set(worlds.map(w => w.world_type))];

  // 统计信息
  const totalWorlds = worlds.length;
  const activeWorlds = worlds.filter(w => w.status === 'active').length;
  const totalCharacters = Object.values(worldStats).reduce((sum, stats) => sum + (stats.character_count || 0), 0);
  const totalLocations = Object.values(worldStats).reduce((sum, stats) => sum + (stats.location_count || 0), 0);

  return (
    <div className="world-management">
      {/* 统计面板 */}
      <Row gutter={16} className="stats-row">
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="世界总数"
              value={totalWorlds}
              prefix={<GlobalOutlined />}
              styles={{ content: { color: '#1890ff'  } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="活跃世界"
              value={activeWorlds}
              prefix={<CheckCircleOutlined />}
              styles={{ content: { color: '#52c41a'  } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="总角色数"
              value={totalCharacters}
              prefix={<DatabaseOutlined />}
              styles={{ content: { color: '#722ed1'  } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="总地点数"
              value={totalLocations}
              prefix={<ClockCircleOutlined />}
              styles={{ content: { color: '#fa8c16'  } }}
            />
          </Card>
        </Col>
      </Row>

      {/* 工具栏 */}
      <Card className="toolbar-card">
        <div className="toolbar">
          <div className="toolbar-left">
            <Input
              placeholder="搜索世界..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="search-input"
              allowClear
            />
            <Select
              placeholder="筛选类型"
              value={filterType}
              onChange={setFilterType}
              className="filter-select"
              allowClear
            >
              <Select.Option value="all">全部类型</Select.Option>
              {worldTypes.map(type => (
                <Select.Option key={type} value={type}>{type}</Select.Option>
              ))}
            </Select>
          </div>
          <div className="toolbar-right">
            <Radio.Group
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="card">
                <AppstoreOutlined /> 卡片
              </Radio.Button>
              <Radio.Button value="list">
                <UnorderedListOutlined /> 列表
              </Radio.Button>
            </Radio.Group>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
            >
              创建世界
            </Button>
          </div>
        </div>
      </Card>

      {/* 世界列表 */}
      <div className="worlds-container">
        {filteredWorlds.length === 0 ? (
          <Empty
            description={
              searchText || filterType !== 'all'
                ? '没有找到匹配的世界'
                : '还没有创建任何世界，点击"创建世界"开始吧！'
            }
            className="empty-state"
          />
        ) : viewMode === 'card' ? (
          <Row gutter={[16, 16]}>
            {filteredWorlds.map(world => (
              <Col xs={24} sm={12} lg={8} xl={6} key={world.id}>
                <WorldCard
                  world={world}
                  stats={worldStats[world.id] || {}}
                  isSelected={selectedWorld?.id === world.id}
                  onEnter={handleEnter}
                  onEdit={showModal}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              </Col>
            ))}
          </Row>
        ) : (
          // 列表视图
          <Card>
            <Row gutter={[16, 16]}>
              {filteredWorlds.map(world => (
                <Col span={24} key={world.id}>
                  <WorldCard
                    world={world}
                    stats={worldStats[world.id] || {}}
                    isSelected={selectedWorld?.id === world.id}
                    onEnter={handleEnter}
                    onEdit={showModal}
                    onDelete={handleDelete}
                    onView={handleView}
                  />
                </Col>
              ))}
            </Row>
          </Card>
        )}
      </div>

      {/* 创建/编辑模态框 */}
      <Modal
        title={editingWorld ? '编辑世界' : '创建世界'}
        open={modalVisible}
        onCancel={handleCancel}
        onOk={() => form.submit()}
        width={700}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="世界名称"
                rules={[{ required: true, message: '请输入世界名称' }]}
              >
                <Input placeholder="例如：艾泽拉斯" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="world_type"
                label="世界类型"
                rules={[{ required: true, message: '请选择世界类型' }]}
              >
                <Select placeholder="选择世界类型">
                  <Select.Option value="单一世界">单一世界</Select.Option>
                  <Select.Option value="多元宇宙">多元宇宙</Select.Option>
                  <Select.Option value="位面世界">位面世界</Select.Option>
                  <Select.Option value="虚拟世界">虚拟世界</Select.Option>
                  <Select.Option value="梦境世界">梦境世界</Select.Option>
                  <Select.Option value="其他">其他</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="core_concept"
            label="核心概念"
          >
            <TextArea
              rows={2}
              placeholder="用一句话描述这个世界的核心概念"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="世界描述"
          >
            <TextArea
              rows={4}
              placeholder="详细描述这个世界的特点、背景和设定"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="creation_origin"
                label="创世起源"
              >
                <TextArea
                  rows={3}
                  placeholder="描述这个世界的起源和创世神话"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="world_essence"
                label="世界本质"
              >
                <TextArea
                  rows={3}
                  placeholder="描述这个世界的本质和运行规则"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="status"
                label="状态"
                initialValue="active"
              >
                <Select>
                  <Select.Option value="active">活跃</Select.Option>
                  <Select.Option value="inactive">停用</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="version"
                label="版本"
                initialValue="1.0"
              >
                <Input placeholder="例如：1.0" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="core_theme"
                label="核心主题"
              >
                <Input placeholder="例如：史诗奇幻" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 详情模态框 */}
      <Modal
        title="世界详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          <Button
            key="enter"
            type="primary"
            onClick={() => {
              handleEnter(viewingWorld);
              setDetailModalVisible(false);
            }}
          >
            进入世界
          </Button>
        ]}
        width={800}
      >
        {viewingWorld && (
          <div className="world-detail">
            <div
              className="world-detail-cover"
              style={{
                background: viewingWorld.cover_image
                  ? `url(${viewingWorld.cover_image}) center/cover`
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              <h2>{viewingWorld.name}</h2>
              <p>{viewingWorld.core_concept}</p>
            </div>
            <div className="world-detail-content">
              <Row gutter={16}>
                <Col span={12}>
                  <h4>基本信息</h4>
                  <p><strong>类型：</strong>{viewingWorld.world_type}</p>
                  <p><strong>状态：</strong>{viewingWorld.status === 'active' ? '活跃' : '停用'}</p>
                  <p><strong>版本：</strong>{viewingWorld.version || '1.0'}</p>
                  <p><strong>创建时间：</strong>{new Date(viewingWorld.created_at).toLocaleString()}</p>
                </Col>
                <Col span={12}>
                  <h4>统计数据</h4>
                  <Row gutter={8}>
                    <Col span={12}>
                      <Statistic title="角色数" value={worldStats[viewingWorld.id]?.character_count || 0} />
                    </Col>
                    <Col span={12}>
                      <Statistic title="地点数" value={worldStats[viewingWorld.id]?.location_count || 0} />
                    </Col>
                    <Col span={12}>
                      <Statistic title="势力数" value={worldStats[viewingWorld.id]?.faction_count || 0} />
                    </Col>
                    <Col span={12}>
                      <Statistic title="事件数" value={worldStats[viewingWorld.id]?.event_count || 0} />
                    </Col>
                  </Row>
                </Col>
              </Row>
              <div className="world-detail-section">
                <h4>世界描述</h4>
                <p>{viewingWorld.description || '暂无描述'}</p>
              </div>
              <div className="world-detail-section">
                <h4>创世起源</h4>
                <p>{viewingWorld.creation_origin || '暂无描述'}</p>
              </div>
              <div className="world-detail-section">
                <h4>世界本质</h4>
                <p>{viewingWorld.world_essence || '暂无描述'}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WorldManagement;

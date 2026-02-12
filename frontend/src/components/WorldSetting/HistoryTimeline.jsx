import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Button, Table, Modal, Form, Input, Select, Tag,
  message, Space, Empty, Tabs, Row, Col, Statistic, InputNumber
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  ClockCircleOutlined, CalendarOutlined, HistoryOutlined,
  BookOutlined, FlagOutlined, StarOutlined, CrownOutlined,
  UserOutlined, TrophyOutlined
} from '@ant-design/icons';
import { historyTimelineApi } from '../../services/api';

const { TextArea } = Input;

// ==================== 历史纪元管理 ====================
const HistoricalEraManagement = ({ worldId }) => {
  const [eras, setEras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEra, setEditingEra] = useState(null);
  const [form] = Form.useForm();

  const fetchEras = async () => {
    setLoading(true);
    try {
      const response = await historyTimelineApi.getHistoricalEras(worldId);
      if (response.data.code === 200) {
        setEras(response.data.data);
      }
    } catch (error) {
      message.error('获取历史纪元列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (worldId) fetchEras();
  }, [worldId]);

  const handleSubmit = async (values) => {
    try {
      const data = {
        name: values.era_name,
        world_id: worldId,
        start_year: values.start_year,
        end_year: values.end_year,
        duration_description: values.duration_description,
        main_characteristics: values.main_characteristics,
        key_technologies: values.key_technologies,
        dominant_civilizations: values.dominant_civilizations,
        ending_cause: values.ending_cause,
        legacy_impact: values.legacy_impact,
        description: values.description,
        order_index: values.order_index || 0,
      };
      if (editingEra) {
        await historyTimelineApi.updateHistoricalEra(editingEra.id, data);
        message.success('历史纪元更新成功');
      } else {
        await historyTimelineApi.createHistoricalEra(data);
        message.success('历史纪元创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchEras();
    } catch (error) {
      message.error(editingEra ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await historyTimelineApi.deleteHistoricalEra(id);
      message.success('删除成功');
      fetchEras();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '纪元名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <CrownOutlined style={{ color: '#faad14' }} />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: '时间范围',
      key: 'time_range',
      render: (_, record) => (
        <Tag color="blue">
          {record.start_year} - {record.end_year || '至今'}
        </Tag>
      ),
    },
    {
      title: '主导文明',
      dataIndex: 'dominant_civilizations',
      key: 'dominant_civilizations',
      ellipsis: true,
    },
    {
      title: '排序',
      dataIndex: 'order_index',
      key: 'order_index',
      width: 80,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingEra(record);
              form.setFieldsValue({
                era_name: record.name,
                start_year: record.start_year,
                end_year: record.end_year,
                duration_description: record.duration_description,
                main_characteristics: record.main_characteristics,
                key_technologies: record.key_technologies,
                dominant_civilizations: record.dominant_civilizations,
                ending_cause: record.ending_cause,
                legacy_impact: record.legacy_impact,
                description: record.description,
                order_index: record.order_index,
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
            <CrownOutlined />
            <span>历史纪元管理</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingEra(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            新建纪元
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        <Table
          columns={columns}
          dataSource={eras}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Card>

      <Modal
        title={editingEra ? '编辑历史纪元' : '新建历史纪元'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={800}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="era_name"
                label="纪元名称"
                rules={[{ required: true, message: '请输入纪元名称' }]}
              >
                <Input placeholder="例如：黄金时代、黑暗纪元" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="order_index" label="排序索引">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="start_year" label="开始年份">
                <Input placeholder="例如：创世元年" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="end_year" label="结束年份">
                <Input placeholder="例如：魔法历1000年" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="duration_description" label="持续时间描述">
            <TextArea rows={2} placeholder="描述这个纪元的持续时间" />
          </Form.Item>
          <Form.Item name="main_characteristics" label="时代特征">
            <TextArea rows={2} placeholder="描述这个纪元的主要特征" />
          </Form.Item>
          <Form.Item name="key_technologies" label="关键技术">
            <TextArea rows={2} placeholder="这个纪元的关键技术或魔法" />
          </Form.Item>
          <Form.Item name="dominant_civilizations" label="主导文明">
            <Input placeholder="例如：古代帝国、精灵王国" />
          </Form.Item>
          <Form.Item name="ending_cause" label="结束原因">
            <TextArea rows={2} placeholder="这个纪元是如何结束的" />
          </Form.Item>
          <Form.Item name="legacy_impact" label="遗留影响">
            <TextArea rows={2} placeholder="这个纪元对后世的影响" />
          </Form.Item>
          <Form.Item name="description" label="详细描述">
            <TextArea rows={4} placeholder="关于这个纪元的详细描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// ==================== 历史事件管理 ====================
const HistoryEventManagement = ({ worldId, quickCreateTarget, onUpdate, onRefresh }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form] = Form.useForm();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await historyTimelineApi.getHistoricalEvents(worldId);
      if (response.data.code === 200) {
        setEvents(response.data.data);
      }
    } catch (error) {
      message.error('获取历史事件列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (worldId) fetchEvents();
  }, [worldId]);

  // 响应快速创建
  useEffect(() => {
    if (quickCreateTarget) {
      showModal();
    }
  }, [quickCreateTarget]);

  const handleSubmit = async (values) => {
    try {
      const data = {
        name: values.event_name,
        world_id: worldId,
        event_type: values.event_type,
        start_year: values.start_year,
        end_year: values.end_year,
        importance_level: values.importance_level,
        primary_causes: values.primary_causes,
        immediate_outcomes: values.immediate_outcomes,
        long_term_consequences: values.long_term_consequences,
        key_participants: values.key_participants,
        event_sequence: values.event_sequence,
        historical_significance: values.historical_significance,
        conflicting_accounts: values.conflicting_accounts,
        location_ids: values.location_ids,
        description: values.description,
        order_index: values.order_index || 0,
      };
      if (editingEvent) {
        await historyTimelineApi.updateHistoricalEvent(editingEvent.id, data);
        message.success('历史事件更新成功');
      } else {
        await historyTimelineApi.createHistoricalEvent(data);
        message.success('历史事件创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchEvents();
      if (onUpdate) onUpdate();
      if (onRefresh) onRefresh();
    } catch (error) {
      message.error(editingEvent ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await historyTimelineApi.deleteHistoricalEvent(id);
      message.success('删除成功');
      fetchEvents();
      if (onUpdate) onUpdate();
      if (onRefresh) onRefresh();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '事件名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <FlagOutlined style={{ color: '#f5222d' }} />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: '事件类型',
      dataIndex: 'event_type',
      key: 'event_type',
      render: (type) => {
        const colorMap = {
          '战争': 'red',
          '政治': 'blue',
          '文化': 'purple',
          '科技': 'green',
          '灾难': 'orange',
          '发现': 'cyan',
          '变革': 'magenta',
          '其他': 'default',
        };
        return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
      },
    },
    {
      title: '时间',
      key: 'time',
      render: (_, record) => (
        <Tag color="cyan">
          {record.start_year}{record.end_year && record.end_year !== record.start_year ? ` - ${record.end_year}` : ''}
        </Tag>
      ),
    },
    {
      title: '重要性',
      dataIndex: 'importance_level',
      key: 'importance_level',
      width: 90,
      render: (level) => {
        const colors = ['green', 'green', 'cyan', 'cyan', 'blue', 'blue', 'purple', 'purple', 'orange', 'red'];
        return <Tag color={colors[level - 1] || 'default'}>{level}/10</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingEvent(record);
              form.setFieldsValue({
                event_name: record.name,
                event_type: record.event_type,
                start_year: record.start_year,
                end_year: record.end_year,
                importance_level: record.importance_level,
                primary_causes: record.primary_causes,
                immediate_outcomes: record.immediate_outcomes,
                long_term_consequences: record.long_term_consequences,
                key_participants: record.key_participants,
                event_sequence: record.event_sequence,
                historical_significance: record.historical_significance,
                conflicting_accounts: record.conflicting_accounts,
                location_ids: record.location_ids,
                description: record.description,
                order_index: record.order_index,
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
            <FlagOutlined />
            <span>历史事件管理</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingEvent(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            新建历史事件
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        <Table
          columns={columns}
          dataSource={events}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Card>

      <Modal
        title={editingEvent ? '编辑历史事件' : '新建历史事件'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={850}
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
                      <Col span={16}>
                        <Form.Item
                          name="event_name"
                          label="事件名称"
                          rules={[{ required: true, message: '请输入事件名称' }]}
                        >
                          <Input placeholder="例如：诸神之战、魔法大革命" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="order_index" label="排序索引">
                          <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item name="event_type" label="事件类型" rules={[{ required: true }]}>
                          <Select placeholder="选择类型">
                            <Select.Option value="战争">战争</Select.Option>
                            <Select.Option value="政治">政治</Select.Option>
                            <Select.Option value="文化">文化</Select.Option>
                            <Select.Option value="科技">科技</Select.Option>
                            <Select.Option value="灾难">灾难</Select.Option>
                            <Select.Option value="发现">发现</Select.Option>
                            <Select.Option value="变革">变革</Select.Option>
                            <Select.Option value="其他">其他</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="start_year" label="开始时间">
                          <Input placeholder="例如：魔法历1000年" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="end_year" label="结束时间">
                          <Input placeholder="例如：魔法历1001年" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="importance_level" label="重要性 (1-10)">
                          <InputNumber min={1} max={10} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="location_ids" label="相关地点">
                          <Input placeholder="地点ID，多个用逗号分隔" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item name="description" label="事件简介">
                      <TextArea rows={3} placeholder="简要描述这个历史事件" />
                    </Form.Item>
                  </>
                )
              },
              {
                key: 'details',
                label: '详细过程',
                children: (
                  <>
                    <Form.Item name="primary_causes" label="主要原因">
                      <TextArea rows={3} placeholder="导致这个事件发生的主要原因" />
                    </Form.Item>
                    <Form.Item name="event_sequence" label="事件过程">
                      <TextArea rows={4} placeholder="详细描述事件的经过和发展过程" />
                    </Form.Item>
                    <Form.Item name="immediate_outcomes" label="直接结果">
                      <TextArea rows={3} placeholder="事件直接导致的结果" />
                    </Form.Item>
                    <Form.Item name="long_term_consequences" label="长期影响">
                      <TextArea rows={3} placeholder="事件对历史产生的长期影响" />
                    </Form.Item>
                  </>
                )
              },
              {
                key: 'participants',
                label: '参与与意义',
                children: (
                  <>
                    <Form.Item name="key_participants" label="主要参与者">
                      <TextArea rows={3} placeholder="参与这个事件的关键人物或势力" />
                    </Form.Item>
                    <Form.Item name="historical_significance" label="历史意义">
                      <TextArea rows={3} placeholder="这个事件在历史中的重要意义" />
                    </Form.Item>
                    <Form.Item name="conflicting_accounts" label="矛盾记载">
                      <TextArea rows={3} placeholder="关于这个事件的不同记载或争议" />
                    </Form.Item>
                  </>
                )
              }
            ]}
          />
        </Form>
      </Modal>
    </div>
  );
};

// ==================== 历史人物管理 ====================
const HistoricalFigureManagement = ({ worldId }) => {
  const [figures, setFigures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFigure, setEditingFigure] = useState(null);
  const [form] = Form.useForm();

  const fetchFigures = async () => {
    setLoading(true);
    try {
      const response = await historyTimelineApi.getHistoricalFigures(worldId);
      if (response.data.code === 200) {
        setFigures(response.data.data);
      }
    } catch (error) {
      message.error('获取历史人物列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (worldId) fetchFigures();
  }, [worldId]);

  const handleSubmit = async (values) => {
    try {
      const data = {
        name: values.figure_name,
        world_id: worldId,
        birth_year: values.birth_year,
        death_year: values.death_year,
        primary_role: values.primary_role,
        social_class: values.social_class,
        key_achievements: values.key_achievements,
        controversies: values.controversies,
        historical_legacy: values.historical_legacy,
        description: values.description,
        importance_level: values.importance_level,
        order_index: values.order_index || 0,
      };
      if (editingFigure) {
        await historyTimelineApi.updateHistoricalFigure(editingFigure.id, data);
        message.success('历史人物更新成功');
      } else {
        await historyTimelineApi.createHistoricalFigure(data);
        message.success('历史人物创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchFigures();
    } catch (error) {
      message.error(editingFigure ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await historyTimelineApi.deleteHistoricalFigure(id);
      message.success('删除成功');
      fetchFigures();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '人物名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: '生卒年',
      key: 'lifespan',
      render: (_, record) => (
        <Tag color="cyan">
          {record.birth_year || '?'} - {record.death_year || '?'}
        </Tag>
      ),
    },
    {
      title: '主要身份',
      dataIndex: 'primary_role',
      key: 'primary_role',
      ellipsis: true,
    },
    {
      title: '重要性',
      dataIndex: 'importance_level',
      key: 'importance_level',
      width: 90,
      render: (level) => {
        const colors = ['green', 'green', 'cyan', 'cyan', 'blue', 'blue', 'purple', 'purple', 'orange', 'red'];
        return <Tag color={colors[level - 1] || 'default'}>{level}/10</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingFigure(record);
              form.setFieldsValue({
                figure_name: record.name,
                birth_year: record.birth_year,
                death_year: record.death_year,
                primary_role: record.primary_role,
                social_class: record.social_class,
                key_achievements: record.key_achievements,
                controversies: record.controversies,
                historical_legacy: record.historical_legacy,
                description: record.description,
                importance_level: record.importance_level,
                order_index: record.order_index,
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
            <TrophyOutlined />
            <span>历史人物管理</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingFigure(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            新建历史人物
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        <Table
          columns={columns}
          dataSource={figures}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Card>

      <Modal
        title={editingFigure ? '编辑历史人物' : '新建历史人物'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={800}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="figure_name"
                label="人物名称"
                rules={[{ required: true, message: '请输入人物名称' }]}
              >
                <Input placeholder="例如：魔法皇帝、传奇英雄" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="order_index" label="排序索引">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="birth_year" label="出生年份">
                <Input placeholder="例如：魔法历100年" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="death_year" label="死亡年份">
                <Input placeholder="例如：魔法历150年" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="importance_level" label="重要性 (1-10)">
                <InputNumber min={1} max={10} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="primary_role" label="主要身份">
                <Input placeholder="例如：国王、将军、学者" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="social_class" label="社会阶级">
                <Input placeholder="例如：贵族、平民、奴隶" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="key_achievements" label="主要成就">
            <TextArea rows={3} placeholder="描述这个人物的主要成就和贡献" />
          </Form.Item>
          <Form.Item name="controversies" label="争议">
            <TextArea rows={2} placeholder="关于这个人物的争议和批评" />
          </Form.Item>
          <Form.Item name="historical_legacy" label="历史遗产">
            <TextArea rows={2} placeholder="这个人物留下的历史遗产和影响" />
          </Form.Item>
          <Form.Item name="description" label="详细描述">
            <TextArea rows={4} placeholder="关于这个历史人物的详细描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// ==================== 主组件 ====================
const HistoryTimeline = ({ worldId, quickCreateTarget, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('eras');
  const [stats, setStats] = useState({
    eras: 0,
    events: 0,
    figures: 0,
  });

  // 当快速创建事件时，自动切换到事件标签页
  useEffect(() => {
    if (quickCreateTarget) {
      setActiveTab('events');
    }
  }, [quickCreateTarget]);

  const loadStats = useCallback(() => {
    if (worldId) {
      Promise.all([
        historyTimelineApi.getHistoricalEras(worldId),
        historyTimelineApi.getHistoricalEvents(worldId),
        historyTimelineApi.getHistoricalFigures(worldId),
      ]).then(([erasRes, eventsRes, figuresRes]) => {
        setStats({
          eras: erasRes.data.data?.length || 0,
          events: eventsRes.data.data?.length || 0,
          figures: figuresRes.data.data?.length || 0,
        });
      }).catch(() => {
        // 忽略错误，使用默认值
      });
    }
  }, [worldId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const tabItems = [
    {
      key: 'eras',
      label: '历史纪元',
      children: <HistoricalEraManagement worldId={worldId} />,
    },
    {
      key: 'events',
      label: '历史事件',
      children: <HistoryEventManagement worldId={worldId} quickCreateTarget={quickCreateTarget} onUpdate={onUpdate} onRefresh={loadStats} />,
    },
    {
      key: 'figures',
      label: '历史人物',
      children: <HistoricalFigureManagement worldId={worldId} />,
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="历史纪元"
              value={stats.eras}
              prefix={<CrownOutlined />}
              styles={{ content: { color: '#faad14' } }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="历史事件"
              value={stats.events}
              prefix={<FlagOutlined />}
              styles={{ content: { color: '#f5222d' } }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="历史人物"
              value={stats.figures}
              prefix={<TrophyOutlined />}
              styles={{ content: { color: '#1890ff' } }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </div>
  );
};

export default HistoryTimeline;

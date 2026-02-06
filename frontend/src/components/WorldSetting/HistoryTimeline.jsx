import React, { useState, useEffect } from 'react';
import {
  Card, Button, Table, Modal, Form, Input, Select, Tag,
  message, Space, Empty, Tabs, Row, Col, Statistic
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  ClockCircleOutlined, CalendarOutlined, HistoryOutlined,
  BookOutlined, FlagOutlined, StarOutlined
} from '@ant-design/icons';
import { historyTimelineApi } from '../../services/api';

const { TextArea } = Input;

// 历史事件管理组件
const HistoryEventManagement = ({ worldId }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form] = Form.useForm();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await historyTimelineApi.getHistoryEvents(worldId);
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

  const handleSubmit = async (values) => {
    try {
      if (editingEvent) {
        await historyTimelineApi.updateHistoryEvent(editingEvent.id, values);
        message.success('历史事件更新成功');
      } else {
        await historyTimelineApi.createHistoryEvent({ ...values, world_id: worldId });
        message.success('历史事件创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchEvents();
    } catch (error) {
      message.error(editingEvent ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await historyTimelineApi.deleteHistoryEvent(id);
      message.success('删除成功');
      fetchEvents();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '事件名称',
      dataIndex: 'event_name',
      key: 'event_name',
      render: (text, record) => (
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
          '其他': 'default',
        };
        return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
      },
    },
    {
      title: '发生时间',
      dataIndex: 'event_time',
      key: 'event_time',
      render: (time) => <Tag color="cyan">{time}</Tag>,
    },
    {
      title: '影响程度',
      dataIndex: 'impact_level',
      key: 'impact_level',
      render: (level) => {
        const colorMap = {
          1: 'green',
          2: 'cyan',
          3: 'blue',
          4: 'purple',
          5: 'orange',
          6: 'red',
          7: 'red',
          8: 'red',
          9: 'red',
          10: 'red',
        };
        return <Tag color={colorMap[level] || 'default'}>{level}/10</Tag>;
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
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="event_name"
            label="事件名称"
            rules={[{ required: true, message: '请输入事件名称' }]}
          >
            <Input placeholder="例如：诸神之战、魔法大革命" />
          </Form.Item>
          <Form.Item
            name="event_type"
            label="事件类型"
            rules={[{ required: true }]}
            initialValue="其他"
          >
            <Select>
              <Option value="战争">战争</Option>
              <Option value="政治">政治</Option>
              <Option value="文化">文化</Option>
              <Option value="科技">科技</Option>
              <Option value="灾难">灾难</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="event_time"
            label="发生时间"
            rules={[{ required: true, message: '请输入发生时间' }]}
          >
            <Input placeholder="例如：创世元年、魔法历1000年" />
          </Form.Item>
          <Form.Item
            name="impact_level"
            label="影响程度"
            rules={[{ required: true }]}
            initialValue={5}
          >
            <Select>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                <Option key={level} value={level}>{level}/10</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="事件描述"
          >
            <TextArea rows={3} placeholder="描述这个历史事件..." />
          </Form.Item>
          <Form.Item
            name="causes"
            label="事件起因"
          >
            <TextArea rows={2} placeholder="事件的起因" />
          </Form.Item>
          <Form.Item
            name="consequences"
            label="事件后果"
          >
            <TextArea rows={2} placeholder="事件的后果和影响" />
          </Form.Item>
          <Form.Item
            name="related_characters"
            label="相关人物"
          >
            <Input placeholder="例如：创世神、魔法皇帝" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// 时间线管理组件
const TimelineManagement = ({ worldId }) => {
  const [timelines, setTimelines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTimeline, setEditingTimeline] = useState(null);
  const [form] = Form.useForm();

  const fetchTimelines = async () => {
    setLoading(true);
    try {
      const response = await historyTimelineApi.getTimelines(worldId);
      if (response.data.code === 200) {
        setTimelines(response.data.data);
      }
    } catch (error) {
      message.error('获取时间线列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (worldId) fetchTimelines();
  }, [worldId]);

  const handleSubmit = async (values) => {
    try {
      if (editingTimeline) {
        await historyTimelineApi.updateTimeline(editingTimeline.id, values);
        message.success('时间线更新成功');
      } else {
        await historyTimelineApi.createTimeline({ ...values, world_id: worldId });
        message.success('时间线创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchTimelines();
    } catch (error) {
      message.error(editingTimeline ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await historyTimelineApi.deleteTimeline(id);
      message.success('删除成功');
      fetchTimelines();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '时间线名称',
      dataIndex: 'timeline_name',
      key: 'timeline_name',
      render: (text, record) => (
        <Space>
          <ClockCircleOutlined style={{ color: '#1890ff' }} />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: '时间线类型',
      dataIndex: 'timeline_type',
      key: 'timeline_type',
      render: (type) => {
        const colorMap = {
          '世界': 'red',
          '地区': 'blue',
          '文明': 'green',
          '个人': 'purple',
          '其他': 'default',
        };
        return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
      },
    },
    {
      title: '时间跨度',
      dataIndex: 'time_span',
      key: 'time_span',
      render: (span) => <Tag color="cyan">{span}</Tag>,
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
              setEditingTimeline(record);
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
            <ClockCircleOutlined />
            <span>时间线管理</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingTimeline(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            新建时间线
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        <Table
          columns={columns}
          dataSource={timelines}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Card>

      <Modal
        title={editingTimeline ? '编辑时间线' : '新建时间线'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="timeline_name"
            label="时间线名称"
            rules={[{ required: true, message: '请输入时间线名称' }]}
          >
            <Input placeholder="例如：世界通史、人类文明史" />
          </Form.Item>
          <Form.Item
            name="timeline_type"
            label="时间线类型"
            rules={[{ required: true }]}
            initialValue="世界"
          >
            <Select>
              <Option value="世界">世界</Option>
              <Option value="地区">地区</Option>
              <Option value="文明">文明</Option>
              <Option value="个人">个人</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="time_span"
            label="时间跨度"
            rules={[{ required: true }]}
          >
            <Input placeholder="例如：创世元年-魔法历1000年" />
          </Form.Item>
          <Form.Item
            name="description"
            label="时间线描述"
          >
            <TextArea rows={3} placeholder="描述这个时间线..." />
          </Form.Item>
          <Form.Item
            name="key_periods"
            label="关键时期"
          >
            <TextArea rows={2} placeholder="时间线的关键时期" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// 历史脉络主组件
const HistoryTimeline = ({ worldId }) => {
  const [activeTab, setActiveTab] = useState('events');
  const [stats, setStats] = useState({
    events: 0,
    timelines: 0,
  });

  useEffect(() => {
    if (worldId) {
      // 获取统计数据
      Promise.all([
        historyTimelineApi.getHistoryEvents(worldId),
        historyTimelineApi.getTimelines(worldId),
      ]).then(([eventsRes, timelinesRes]) => {
        setStats({
          events: eventsRes.data.data?.length || 0,
          timelines: timelinesRes.data.data?.length || 0,
        });
      });
    }
  }, [worldId]);

  const tabItems = [
    {
      key: 'events',
      label: '历史事件',
      children: <HistoryEventManagement worldId={worldId} />,
    },
    {
      key: 'timelines',
      label: '时间线',
      children: <TimelineManagement worldId={worldId} />,
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="历史事件"
              value={stats.events}
              prefix={<FlagOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="时间线"
              value={stats.timelines}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="历史深度"
              value={`${Math.round((stats.events + stats.timelines) / 2)}`}
              prefix={<HistoryOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </div>
  );
};

export default HistoryTimeline;
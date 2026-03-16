import React, { useState, useEffect } from 'react';
import {
  Card, Button, Table, Modal, Form, Input, Select, Timeline, Tag,
  message, Space, Empty, Tabs, Row, Col, Statistic, Descriptions
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  ClockCircleOutlined, HistoryOutlined, CalendarOutlined,
  FlagOutlined, FireOutlined, StarOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import { historyTimelineApi } from '../../services/api';

const { TextArea } = Input;

// 历史事件管理组件
const EventManagement = ({ worldId }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [form] = Form.useForm();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await historyTimelineApi.getHistoricalEvents(worldId);
      const data = response.data?.data || [];
      // 按时间排序
      data.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
      setEvents(data);
    } catch (error) {
      message.error('获取事件列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (worldId) fetchEvents();
  }, [worldId]);

  const handleSubmit = async (values) => {
    try {
      // 字段映射转换
      const data = {
        name: values.name,
        world_id: worldId,
        event_type: values.event_type,
        start_year: values.event_date,
        end_year: values.event_date,
        importance_level: values.importance,
        key_participants: values.participants,
        description: values.description,
        immediate_outcomes: values.impact,
      };
      if (editingEvent) {
        await historyTimelineApi.updateHistoricalEvent(editingEvent.id, data);
        message.success('事件更新成功');
      } else {
        await historyTimelineApi.createHistoricalEvent(data);
        message.success('事件创建成功');
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
      await historyTimelineApi.deleteHistoricalEvent(id);
      message.success('删除成功');
      fetchEvents();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const showDetail = (record) => {
    setSelectedEvent(record);
    setDetailVisible(true);
  };

  const columns = [
    {
      title: '事件名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <FlagOutlined style={{ color: record.event_type === '战争' ? '#ff4d4f' : '#1890ff' }} />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'event_type',
      key: 'event_type',
      render: (type) => {
        const colorMap = {
          '战争': 'red',
          '政治': 'blue',
          '发现': 'green',
          '灾难': 'orange',
          '变革': 'purple',
          '诞生': 'cyan',
          '死亡': 'default',
          '其他': 'default',
        };
        return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
      },
    },
    {
      title: '发生时间',
      dataIndex: 'start_year',
      key: 'start_year',
      render: (date, record) => date || record.end_year || '-',
    },
    {
      title: '重要性',
      dataIndex: 'importance_level',
      key: 'importance_level',
      render: (importance) => {
        const stars = '⭐'.repeat(importance || 1);
        return <span>{stars}</span>;
      },
    },
    {
      title: '参与方',
      dataIndex: 'key_participants',
      key: 'key_participants',
      render: (participants) => participants || '-',
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
              setEditingEvent(record);
              // 反向字段映射
              form.setFieldsValue({
                name: record.name,
                event_type: record.event_type,
                event_date: record.start_year || record.end_year,
                importance: record.importance_level,
                participants: record.key_participants,
                description: record.description,
                impact: record.immediate_outcomes,
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

  // 生成时间线数据
  const timelineItems = events.map(event => ({
    color: event.event_type === '战争' ? 'red' : 
           event.event_type === '发现' ? 'green' : 
           event.event_type === '灾难' ? 'orange' : 'blue',
    label: event.event_date,
    content: (
      <div>
        <div style={{ fontWeight: 'bold' }}>{event.name}</div>
        <div style={{ color: '#666', fontSize: '12px' }}>
          <Tag size="small">{event.event_type}</Tag>
          {'⭐'.repeat(event.importance || 1)}
        </div>
        <div style={{ marginTop: 4, color: '#888' }}>
          {event.description?.substring(0, 50)}...
        </div>
      </div>
    ),
  }));

  return (
    <div>
      <Row gutter={16}>
        <Col span={14}>
          <Card
            title={
              <Space>
                <CalendarOutlined />
                <span>事件列表</span>
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
                新建事件
              </Button>
            }
          >
            <Table
              columns={columns}
              dataSource={events}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </Card>
        </Col>
        <Col span={10}>
          <Card
            title={
              <Space>
                <HistoryOutlined />
                <span>时间线预览</span>
              </Space>
            }
            style={{ height: '100%' }}
          >
            {events.length > 0 ? (
              <Timeline mode="start" items={timelineItems} />
            ) : (
              <Empty description="暂无事件数据" />
            )}
          </Card>
        </Col>
      </Row>

      {/* 创建/编辑模态框 */}
      <Modal
        title={editingEvent ? '编辑事件' : '新建事件'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="事件名称"
            rules={[{ required: true, message: '请输入事件名称' }]}
          >
            <Input placeholder="例如：黑暗之门开启、第三次战争" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="event_type"
                label="事件类型"
                rules={[{ required: true }]}
                initialValue="政治"
              >
                <Select>
                  <Select.Option value="战争">战争</Select.Option>
                  <Select.Option value="政治">政治</Select.Option>
                  <Select.Option value="发现">发现</Select.Option>
                  <Select.Option value="灾难">灾难</Select.Option>
                  <Select.Option value="变革">变革</Select.Option>
                  <Select.Option value="诞生">诞生</Select.Option>
                  <Select.Option value="死亡">死亡</Select.Option>
                  <Select.Option value="其他">其他</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="event_date"
                label="发生时间"
                rules={[{ required: true }]}
              >
                <Input placeholder="例如：黑暗之门元年、2024年" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="importance"
                label="重要性"
                initialValue={3}
              >
                <Select>
                  <Select.Option value={1}>⭐ 低</Select.Option>
                  <Select.Option value={2}>⭐⭐ 中低</Select.Option>
                  <Select.Option value={3}>⭐⭐⭐ 中</Select.Option>
                  <Select.Option value={4}>⭐⭐⭐⭐ 中高</Select.Option>
                  <Select.Option value={5}>⭐⭐⭐⭐⭐ 高</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="participants" label="参与方">
                <Input placeholder="例如：联盟、部落" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="事件描述">
            <TextArea rows={4} placeholder="详细描述这个事件的经过..." />
          </Form.Item>
          <Form.Item name="impact" label="事件影响">
            <TextArea rows={3} placeholder="该事件对世界产生的影响" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情抽屉 */}
      <Modal
        title="事件详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {selectedEvent && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="名称" span={2}>
              {selectedEvent.name}
            </Descriptions.Item>
            <Descriptions.Item label="类型">
              <Tag color="blue">{selectedEvent.event_type}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="发生时间">
              {selectedEvent.event_date}
            </Descriptions.Item>
            <Descriptions.Item label="重要性">
              {'⭐'.repeat(selectedEvent.importance || 1)}
            </Descriptions.Item>
            <Descriptions.Item label="参与方">
              {selectedEvent.participants || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="描述" span={2}>
              {selectedEvent.description || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="影响" span={2}>
              {selectedEvent.impact || '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

// 时间线管理主组件
const TimelineManagement = ({ worldId }) => {
  const [activeTab, setActiveTab] = useState('events');
  const [stats, setStats] = useState({
    total: 0,
    wars: 0,
    political: 0,
    discoveries: 0,
  });

  useEffect(() => {
    if (worldId) {
      historyTimelineApi.getHistoricalEvents(worldId).then((response) => {
        const data = response.data?.data || [];
        setStats({
          total: data.length,
          wars: data.filter(e => e.event_type === '战争').length,
          political: data.filter(e => e.event_type === '政治').length,
          discoveries: data.filter(e => e.event_type === '发现').length,
        });
      });
    }
  }, [worldId]);

  const tabItems = [
    {
      key: 'events',
      label: '历史事件',
      children: <EventManagement worldId={worldId} />,
    },
    {
      key: 'eras',
      label: '时代划分',
      children: <Empty description="时代划分功能开发中..." />,
    },
    {
      key: 'calendar',
      label: '历法系统',
      children: <Empty description="历法系统功能开发中..." />,
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="事件总数"
              value={stats.total}
              prefix={<ClockCircleOutlined />}
              styles={{ content: { color: '#1890ff' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="战争"
              value={stats.wars}
              prefix={<FireOutlined />}
              styles={{ content: { color: '#ff4d4f' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="政治事件"
              value={stats.political}
              prefix={<FlagOutlined />}
              styles={{ content: { color: '#52c41a'  } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="重大发现"
              value={stats.discoveries}
              prefix={<StarOutlined />}
              styles={{ content: { color: '#faad14' } }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </div>
  );
};

export default TimelineManagement;

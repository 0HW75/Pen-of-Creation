import React, { useState, useEffect } from 'react';
import {
  Card, Button, Table, Modal, Form, Input, Select, Tag, message, Space, Row, Col, InputNumber, Tabs
} from 'antd';
import { FlagOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { historyTimelineApi } from '../../../services/api';

const { TextArea } = Input;

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

  useEffect(() => {
    if (quickCreateTarget) {
      setModalVisible(true);
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

export default HistoryEventManagement;

import React, { useState, useEffect } from 'react';
import {
  Card, Button, Table, Modal, Form, Input, Tag, message, Space, Row, Col, InputNumber
} from 'antd';
import { CrownOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { historyTimelineApi } from '../../../services/api';

const { TextArea } = Input;

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

export default HistoricalEraManagement;

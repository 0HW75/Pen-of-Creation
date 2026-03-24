import React, { useState, useEffect } from 'react';
import {
  Card, Button, Table, Modal, Form, Input, Tag, message, Space, Row, Col, InputNumber
} from 'antd';
import { TrophyOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { historyTimelineApi } from '../../../services/api';

const { TextArea } = Input;

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
          <TrophyOutlined style={{ color: '#1890ff' }} />
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

export default HistoricalFigureManagement;

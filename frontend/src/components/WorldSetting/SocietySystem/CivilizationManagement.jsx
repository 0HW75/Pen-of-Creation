import React, { useState, useEffect } from 'react';
import {
  Card, Button, Table, Modal, Form, Input, Select, Tag, message, Space
} from 'antd';
import { GlobalOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { energySocietyApi } from '../../../services/api';

const { TextArea } = Input;

const CivilizationManagement = ({ worldId, civilizations, onRefresh, onCivilizationsChange }) => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCiv, setEditingCiv] = useState(null);
  const [form] = Form.useForm();

  const fetchCivilizations = async () => {
    setLoading(true);
    try {
      const response = await energySocietyApi.getCivilizations(worldId);
      if (response.data.code === 200) {
        onCivilizationsChange(response.data.data);
      }
    } catch (error) {
      message.error('获取文明列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (worldId && civilizations.length === 0) fetchCivilizations();
  }, [worldId]);

  const handleSubmit = async (values) => {
    try {
      const data = {
        name: values.civilization_name,
        world_id: worldId,
        civilization_type: values.civilization_type || '魔法文明',
        description: values.description || '',
        development_level: values.development_stage || '中世纪',
        population_scale: values.population_scale || '',
        territory_size: values.territory_size || '',
        political_system: values.political_system || '',
        economic_system: values.economic_system || '',
        technological_level: values.technological_level || '',
        magical_level: values.magical_level || '',
        cultural_characteristics: values.cultural_characteristics || '',
        religious_beliefs: values.religious_beliefs || '',
        taboos: values.taboos || '',
        values: values.core_values || '',
        historical_origin: values.historical_origin || '',
      };
      if (editingCiv) {
        await energySocietyApi.updateCivilization(editingCiv.id, data);
        message.success('文明更新成功');
      } else {
        await energySocietyApi.createCivilization(data);
        message.success('文明创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchCivilizations();
      if (onRefresh) onRefresh();
    } catch (error) {
      message.error(editingCiv ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await energySocietyApi.deleteCivilization(id);
      if (onRefresh) onRefresh();
      message.success('删除成功');
      fetchCivilizations();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '文明名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <GlobalOutlined style={{ color: '#1890ff' }} />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: '文明类型',
      dataIndex: 'civilization_type',
      key: 'civilization_type',
      render: (type) => {
        const colorMap = {
          '人类': 'blue',
          '精灵': 'green',
          '矮人': 'orange',
          '兽人': 'red',
          '混合': 'purple',
        };
        return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
      },
    },
    {
      title: '发展阶段',
      dataIndex: 'development_level',
      key: 'development_level',
      render: (stage) => <Tag color="cyan">{stage}</Tag>,
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
              setEditingCiv(record);
              form.setFieldsValue({
                civilization_name: record.name,
                civilization_type: record.civilization_type,
                development_stage: record.development_level,
                description: record.description,
                history_summary: record.historical_origin,
                cultural_features: record.cultural_characteristics,
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
            <GlobalOutlined />
            <span>文明管理</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingCiv(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            新建文明
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        <Table
          columns={columns}
          dataSource={civilizations}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Card>

      <Modal
        title={editingCiv ? '编辑文明' : '新建文明'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="civilization_name"
            label="文明名称"
            rules={[{ required: true, message: '请输入文明名称' }]}
          >
            <Input placeholder="例如：人类帝国、精灵王国" />
          </Form.Item>
          <Form.Item
            name="civilization_type"
            label="文明类型"
            rules={[{ required: true, message: '请输入文明类型' }]}
          >
            <Input placeholder="例如：魔法文明、科技文明、修真文明、机械文明等" />
          </Form.Item>
          <Form.Item
            name="development_stage"
            label="发展阶段"
            rules={[{ required: true }]}
            initialValue="原始"
          >
            <Select>
              <Select.Option value="原始">原始</Select.Option>
              <Select.Option value="古代">古代</Select.Option>
              <Select.Option value="中世纪">中世纪</Select.Option>
              <Select.Option value="近代">近代</Select.Option>
              <Select.Option value="现代">现代</Select.Option>
              <Select.Option value="未来">未来</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="文明描述"
          >
            <TextArea rows={3} placeholder="描述这个文明的特征..." />
          </Form.Item>
          <Form.Item
            name="history_summary"
            label="历史概要"
          >
            <TextArea rows={2} placeholder="文明的历史概要" />
          </Form.Item>
          <Form.Item
            name="cultural_features"
            label="文化特征"
          >
            <TextArea rows={2} placeholder="文明的文化特征" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CivilizationManagement;

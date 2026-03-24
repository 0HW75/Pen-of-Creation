import React, { useState, useEffect } from 'react';
import {
  Card, Button, Table, Modal, Form, Input, Select, Tag, message, Space
} from 'antd';
import { SmileOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { energySocietyApi } from '../../../services/api';

const { TextArea } = Input;

const CulturalCustomsManagement = ({ worldId, civilizations, onRefresh }) => {
  const [culturalCustoms, setCulturalCustoms] = useState([]);
  const [selectedCivilization, setSelectedCivilization] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCustom, setEditingCustom] = useState(null);
  const [form] = Form.useForm();

  const fetchCulturalCustoms = async (civId = null) => {
    setLoading(true);
    try {
      const response = await energySocietyApi.getCulturalCustoms(worldId, civId);
      if (response.data.code === 200) {
        setCulturalCustoms(response.data.data);
      }
    } catch (error) {
      message.error('获取文化习俗列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (worldId) {
      fetchCulturalCustoms();
    }
  }, [worldId]);

  const handleCivilizationChange = (civId) => {
    setSelectedCivilization(civId);
    fetchCulturalCustoms(civId);
  };

  const handleSubmit = async (values) => {
    try {
      const data = {
        name: values.custom_name,
        world_id: worldId,
        civilization_id: values.civilization_id,
        custom_type: values.custom_type || '节日',
        description: values.description || '',
        origin: values.origin || '',
        significance: values.significance || '',
        participants: values.participants || '',
        time_period: values.time_period || '',
        location: values.location || '',
        procedures: values.procedures || '',
        related_beliefs: values.related_beliefs || '',
        variations: values.variations || '',
        importance_level: values.importance_level || 5,
      };
      if (editingCustom) {
        await energySocietyApi.updateCulturalCustom(editingCustom.id, data);
        message.success('文化习俗更新成功');
      } else {
        await energySocietyApi.createCulturalCustom(data);
        message.success('文化习俗创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchCulturalCustoms();
      if (onRefresh) onRefresh();
    } catch (error) {
      message.error(editingCustom ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await energySocietyApi.deleteCulturalCustom(id);
      message.success('删除成功');
      fetchCulturalCustoms();
      if (onRefresh) onRefresh();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '习俗名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <SmileOutlined style={{ color: '#faad14' }} />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: '所属文明',
      dataIndex: 'civilization_id',
      key: 'civilization_id',
      render: (civId) => {
        const civ = civilizations.find(c => c.id === civId);
        return civ ? <Tag color="purple">{civ.name}</Tag> : <Tag>无</Tag>;
      },
    },
    {
      title: '习俗类型',
      dataIndex: 'custom_type',
      key: 'custom_type',
      render: (type) => {
        const colorMap = {
          '节日': 'red',
          '礼仪': 'blue',
          '禁忌': 'purple',
          '传统': 'green',
          '宗教': 'orange',
        };
        return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
      },
    },
    {
      title: '重要性',
      dataIndex: 'importance_level',
      key: 'importance_level',
      render: (level) => <Tag color="cyan">{level}/10</Tag>,
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
              setEditingCustom(record);
              form.setFieldsValue({
                custom_name: record.name,
                civilization_id: record.civilization_id,
                custom_type: record.custom_type,
                description: record.description,
                origin: record.origin,
                significance: record.significance,
                importance_level: record.importance_level,
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
            <SmileOutlined />
            <span>文化习俗管理</span>
          </Space>
        }
        extra={
          <Space>
            <Select
              placeholder="筛选文明"
              allowClear
              style={{ width: 150 }}
              onChange={handleCivilizationChange}
              value={selectedCivilization}
            >
              {civilizations.map(civ => (
                <Select.Option key={civ.id} value={civ.id}>{civ.name}</Select.Option>
              ))}
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingCustom(null);
                form.resetFields();
                setModalVisible(true);
              }}
            >
              新建文化习俗
            </Button>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Table
          columns={columns}
          dataSource={culturalCustoms}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Card>

      <Modal
        title={editingCustom ? '编辑文化习俗' : '新建文化习俗'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="civilization_id"
            label="所属文明"
            rules={[{ required: true, message: '请选择所属文明' }]}
          >
            <Select placeholder="选择文明">
              {civilizations.map(civ => (
                <Select.Option key={civ.id} value={civ.id}>{civ.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="custom_name"
            label="习俗名称"
            rules={[{ required: true, message: '请输入习俗名称' }]}
          >
            <Input placeholder="例如：丰收节、婚礼仪式" />
          </Form.Item>
          <Form.Item
            name="custom_type"
            label="习俗类型"
            rules={[{ required: true }]}
            initialValue="节日"
          >
            <Select>
              <Select.Option value="节日">节日</Select.Option>
              <Select.Option value="礼仪">礼仪</Select.Option>
              <Select.Option value="禁忌">禁忌</Select.Option>
              <Select.Option value="传统">传统</Select.Option>
              <Select.Option value="宗教">宗教</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="importance_level"
            label="重要性等级"
            rules={[{ required: true }]}
            initialValue={5}
          >
            <Input type="number" min={1} max={10} placeholder="1-10" />
          </Form.Item>
          <Form.Item
            name="description"
            label="习俗描述"
          >
            <TextArea rows={3} placeholder="描述这个文化习俗..." />
          </Form.Item>
          <Form.Item
            name="origin"
            label="起源"
          >
            <TextArea rows={2} placeholder="习俗的起源" />
          </Form.Item>
          <Form.Item
            name="significance"
            label="文化意义"
          >
            <TextArea rows={2} placeholder="习俗的文化意义" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CulturalCustomsManagement;

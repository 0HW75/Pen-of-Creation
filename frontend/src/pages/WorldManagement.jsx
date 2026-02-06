import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Input, Select, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, GlobalOutlined } from '@ant-design/icons';
import { worldApi } from '../services/api';

const { TextArea } = Input;
const { Option } = Select;

const WorldManagement = () => {
  const [worlds, setWorlds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWorld, setEditingWorld] = useState(null);
  const [form] = Form.useForm();

  // 获取世界列表
  const fetchWorlds = async () => {
    setLoading(true);
    try {
      const response = await worldApi.getWorlds();
      if (response.data.code === 200) {
        setWorlds(response.data.data);
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
  const handleDelete = async (id) => {
    try {
      await worldApi.deleteWorld(id);
      message.success('删除世界成功');
      fetchWorlds();
    } catch (error) {
      message.error('删除世界失败');
      console.error(error);
    }
  };

  const columns = [
    {
      title: '世界名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <GlobalOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          <strong>{text}</strong>
        </div>
      ),
    },
    {
      title: '世界类型',
      dataIndex: 'world_type',
      key: 'world_type',
      render: (type) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: '核心概念',
      dataIndex: 'core_concept',
      key: 'core_concept',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '活跃' : '停用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <div>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个世界吗？"
            description="删除后将无法恢复"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Card
        title="世界管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            创建世界
          </Button>
        }
        style={{ width: '100%' }}
      >
        <Table
          columns={columns}
          dataSource={worlds}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <Modal
        title={editingWorld ? '编辑世界' : '创建世界'}
        open={modalVisible}
        onCancel={handleCancel}
        onOk={() => form.submit()}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="世界名称"
            rules={[{ required: true, message: '请输入世界名称' }]}
          >
            <Input placeholder="例如：艾泽拉斯" />
          </Form.Item>

          <Form.Item
            name="world_type"
            label="世界类型"
            rules={[{ required: true, message: '请选择世界类型' }]}
          >
            <Select placeholder="选择世界类型">
              <Option value="单一世界">单一世界</Option>
              <Option value="多元宇宙">多元宇宙</Option>
              <Option value="位面世界">位面世界</Option>
              <Option value="虚拟世界">虚拟世界</Option>
              <Option value="梦境世界">梦境世界</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="core_concept"
            label="核心概念"
          >
            <TextArea
              rows={3}
              placeholder="描述这个世界的核心概念和主题"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="世界描述"
          >
            <TextArea
              rows={4}
              placeholder="详细描述这个世界的特点和背景"
            />
          </Form.Item>

          <Form.Item
            name="creation_origin"
            label="创世起源"
          >
            <TextArea
              rows={3}
              placeholder="描述这个世界的起源和创世神话"
            />
          </Form.Item>

          <Form.Item
            name="world_essence"
            label="世界本质"
          >
            <TextArea
              rows={3}
              placeholder="描述这个世界的本质和运行规则"
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            initialValue="active"
          >
            <Select>
              <Option value="active">活跃</Option>
              <Option value="inactive">停用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WorldManagement;

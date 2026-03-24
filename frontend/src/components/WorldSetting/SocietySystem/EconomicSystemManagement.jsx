import React, { useState, useEffect } from 'react';
import {
  Card, Button, Table, Modal, Form, Input, Select, Tag, message, Space
} from 'antd';
import { DollarOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { energySocietyApi } from '../../../services/api';

const { TextArea } = Input;

const EconomicSystemManagement = ({ worldId, civilizations, onRefresh }) => {
  const [economicSystems, setEconomicSystems] = useState([]);
  const [selectedCivilization, setSelectedCivilization] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSystem, setEditingSystem] = useState(null);
  const [form] = Form.useForm();

  const fetchEconomicSystems = async (civId = null) => {
    setLoading(true);
    try {
      const response = await energySocietyApi.getEconomicSystems(worldId, civId);
      if (response.data.code === 200) {
        setEconomicSystems(response.data.data);
      }
    } catch (error) {
      message.error('获取经济体系列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (worldId) {
      fetchEconomicSystems();
    }
  }, [worldId]);

  const handleCivilizationChange = (civId) => {
    setSelectedCivilization(civId);
    fetchEconomicSystems(civId);
  };

  const handleSubmit = async (values) => {
    try {
      const data = {
        name: values.system_name,
        world_id: worldId,
        civilization_id: values.civilization_id,
        economic_model: values.economic_model || '市场经济',
        description: values.description || '',
        currency_name: values.currency_name || '',
        currency_material: values.currency_material || '',
        denomination_system: values.denomination_system || '',
        exchange_rates: values.exchange_rates || '',
        major_industries: values.major_industries || '',
        trade_routes: values.trade_routes || '',
        trade_partners: values.trade_partners || '',
        resource_dependencies: values.resource_dependencies || '',
        wealth_distribution: values.wealth_distribution || '',
        taxation_system: values.taxation_system || '',
        banking_system: values.banking_system || '',
        economic_challenges: values.economic_challenges || '',
      };
      if (editingSystem) {
        await energySocietyApi.updateEconomicSystem(editingSystem.id, data);
        message.success('经济体系更新成功');
      } else {
        await energySocietyApi.createEconomicSystem(data);
        message.success('经济体系创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchEconomicSystems();
      if (onRefresh) onRefresh();
    } catch (error) {
      message.error(editingSystem ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await energySocietyApi.deleteEconomicSystem(id);
      message.success('删除成功');
      fetchEconomicSystems();
      if (onRefresh) onRefresh();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '经济体系名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <DollarOutlined style={{ color: '#52c41a' }} />
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
      title: '经济模式',
      dataIndex: 'economic_model',
      key: 'economic_model',
      render: (type) => {
        const colorMap = {
          '物物交换': 'green',
          '市场经济': 'blue',
          '计划经济': 'orange',
          '混合经济': 'purple',
        };
        return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
      },
    },
    {
      title: '货币名称',
      dataIndex: 'currency_name',
      key: 'currency_name',
      render: (unit) => unit ? <Tag color="cyan">{unit}</Tag> : '-',
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
              setEditingSystem(record);
              form.setFieldsValue({
                system_name: record.name,
                civilization_id: record.civilization_id,
                economic_model: record.economic_model,
                description: record.description,
                currency_name: record.currency_name,
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
            <DollarOutlined />
            <span>经济体系管理</span>
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
                setEditingSystem(null);
                form.resetFields();
                setModalVisible(true);
              }}
            >
              新建经济体系
            </Button>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Table
          columns={columns}
          dataSource={economicSystems}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Card>

      <Modal
        title={editingSystem ? '编辑经济体系' : '新建经济体系'}
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
            name="system_name"
            label="经济体系名称"
            rules={[{ required: true, message: '请输入经济体系名称' }]}
          >
            <Input placeholder="例如：自由市场经济、计划经济" />
          </Form.Item>
          <Form.Item
            name="economic_model"
            label="经济模式"
            rules={[{ required: true }]}
            initialValue="市场经济"
          >
            <Select>
              <Select.Option value="物物交换">物物交换</Select.Option>
              <Select.Option value="市场经济">市场经济</Select.Option>
              <Select.Option value="计划经济">计划经济</Select.Option>
              <Select.Option value="混合经济">混合经济</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="currency_name"
            label="货币名称"
          >
            <Input placeholder="例如：金币、银币" />
          </Form.Item>
          <Form.Item
            name="description"
            label="经济体系描述"
          >
            <TextArea rows={3} placeholder="描述这个经济体系..." />
          </Form.Item>
          <Form.Item
            name="major_industries"
            label="主要产业"
          >
            <TextArea rows={2} placeholder="经济体系的主要产业" />
          </Form.Item>
          <Form.Item
            name="trade_partners"
            label="贸易伙伴"
          >
            <TextArea rows={2} placeholder="贸易伙伴" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EconomicSystemManagement;

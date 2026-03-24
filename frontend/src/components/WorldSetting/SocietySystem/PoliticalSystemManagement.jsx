import React, { useState, useEffect } from 'react';
import {
  Card, Button, Table, Modal, Form, Input, Select, Tag, message, Space
} from 'antd';
import { CrownOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { energySocietyApi } from '../../../services/api';

const { TextArea } = Input;

const PoliticalSystemManagement = ({ worldId, civilizations, onRefresh }) => {
  const [politicalSystems, setPoliticalSystems] = useState([]);
  const [selectedCivilization, setSelectedCivilization] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSystem, setEditingSystem] = useState(null);
  const [form] = Form.useForm();

  const fetchPoliticalSystems = async (civId = null) => {
    setLoading(true);
    try {
      const response = await energySocietyApi.getPoliticalSystems(worldId, civId);
      if (response.data.code === 200) {
        setPoliticalSystems(response.data.data);
      }
    } catch (error) {
      message.error('获取政治体系列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (worldId) {
      fetchPoliticalSystems();
    }
  }, [worldId]);

  const handleCivilizationChange = (civId) => {
    setSelectedCivilization(civId);
    fetchPoliticalSystems(civId);
  };

  const handleSubmit = async (values) => {
    try {
      const data = {
        name: values.political_system_name,
        world_id: worldId,
        civilization_id: values.civilization_id,
        government_type: values.government_type || '君主制',
        description: values.description || '',
        power_structure: values.power_structure || '',
        succession_system: values.succession_system || '',
        decision_process: values.decision_process || '',
        administrative_divisions: values.administrative_divisions || '',
        legal_system: values.legal_system || '',
        military_organization: values.military_organization || '',
        diplomatic_style: values.diplomatic_style || '',
        internal_conflicts: values.internal_conflicts || '',
        external_threats: values.external_threats || '',
        political_stability: values.political_stability || '稳定',
      };
      if (editingSystem) {
        await energySocietyApi.updatePoliticalSystem(editingSystem.id, data);
        message.success('政治体系更新成功');
      } else {
        await energySocietyApi.createPoliticalSystem(data);
        message.success('政治体系创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchPoliticalSystems();
      if (onRefresh) onRefresh();
    } catch (error) {
      message.error(editingSystem ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await energySocietyApi.deletePoliticalSystem(id);
      message.success('删除成功');
      fetchPoliticalSystems();
      if (onRefresh) onRefresh();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '政治体系名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <CrownOutlined style={{ color: '#faad14' }} />
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
      title: '政府类型',
      dataIndex: 'government_type',
      key: 'government_type',
      render: (type) => {
        const colorMap = {
          '君主制': 'red',
          '共和制': 'blue',
          '民主制': 'green',
          '独裁制': 'purple',
          '其他': 'default',
        };
        return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
      },
    },
    {
      title: '政治稳定性',
      dataIndex: 'political_stability',
      key: 'political_stability',
      render: (stability) => stability ? <Tag color="cyan">{stability}</Tag> : '-',
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
                political_system_name: record.name,
                civilization_id: record.civilization_id,
                government_type: record.government_type,
                description: record.description,
                power_structure: record.power_structure,
                political_stability: record.political_stability,
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
            <span>政治体系管理</span>
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
              新建政治体系
            </Button>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Table
          columns={columns}
          dataSource={politicalSystems}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Card>

      <Modal
        title={editingSystem ? '编辑政治体系' : '新建政治体系'}
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
            name="political_system_name"
            label="政治体系名称"
            rules={[{ required: true, message: '请输入政治体系名称' }]}
          >
            <Input placeholder="例如：君主制、共和制" />
          </Form.Item>
          <Form.Item
            name="government_type"
            label="政府类型"
            rules={[{ required: true }]}
            initialValue="君主制"
          >
            <Select>
              <Select.Option value="君主制">君主制</Select.Option>
              <Select.Option value="共和制">共和制</Select.Option>
              <Select.Option value="民主制">民主制</Select.Option>
              <Select.Option value="独裁制">独裁制</Select.Option>
              <Select.Option value="其他">其他</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="political_stability"
            label="政治稳定性"
            initialValue="稳定"
          >
            <Select>
              <Select.Option value="稳定">稳定</Select.Option>
              <Select.Option value="不稳定">不稳定</Select.Option>
              <Select.Option value="动荡">动荡</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="政治体系描述"
          >
            <TextArea rows={3} placeholder="描述这个政治体系..." />
          </Form.Item>
          <Form.Item
            name="power_structure"
            label="权力结构"
          >
            <TextArea rows={2} placeholder="政治体系的权力结构" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PoliticalSystemManagement;

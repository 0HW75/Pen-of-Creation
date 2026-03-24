import React, { useState, useEffect } from 'react';
import {
  Card, Button, Table, Modal, Form, Input, Select, Tag, message, Space
} from 'antd';
import { TeamOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { energySocietyApi } from '../../../services/api';

const { TextArea } = Input;

const SocialClassManagement = ({ worldId, civilizations, onRefresh }) => {
  const [socialClasses, setSocialClasses] = useState([]);
  const [selectedCivilization, setSelectedCivilization] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [form] = Form.useForm();

  const fetchSocialClasses = async (civId = null) => {
    setLoading(true);
    try {
      const response = await energySocietyApi.getSocialClasses(worldId, civId);
      if (response.data.code === 200) {
        setSocialClasses(response.data.data);
      }
    } catch (error) {
      message.error('获取社会阶层列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (worldId) {
      fetchSocialClasses();
    }
  }, [worldId]);

  const handleCivilizationChange = (civId) => {
    setSelectedCivilization(civId);
    fetchSocialClasses(civId);
  };

  const handleSubmit = async (values) => {
    try {
      const data = {
        name: values.class_name,
        world_id: worldId,
        civilization_id: values.civilization_id,
        class_level: values.class_level || 1,
        description: values.description || '',
        privileges: values.privileges || '',
        obligations: values.obligations || '',
        typical_occupations: values.typical_occupations || '',
        living_standards: values.living_standards || '',
        education_access: values.education_access || '',
        social_mobility: values.social_mobility || '',
        percentage_of_population: values.population_ratio || '',
        typical_power_level: values.typical_power_level || 0,
      };
      if (editingClass) {
        await energySocietyApi.updateSocialClass(editingClass.id, data);
        message.success('社会阶层更新成功');
      } else {
        await energySocietyApi.createSocialClass(data);
        message.success('社会阶层创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchSocialClasses();
      if (onRefresh) onRefresh();
    } catch (error) {
      message.error(editingClass ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await energySocietyApi.deleteSocialClass(id);
      message.success('删除成功');
      fetchSocialClasses();
      if (onRefresh) onRefresh();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '阶层名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <TeamOutlined style={{ color: '#52c41a' }} />
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
      title: '阶级等级',
      dataIndex: 'class_level',
      key: 'class_level',
      render: (level) => <Tag color="blue">{level}</Tag>,
    },
    {
      title: '人口比例',
      dataIndex: 'percentage_of_population',
      key: 'percentage_of_population',
      render: (percentage) => percentage ? <Tag color="orange">{percentage}</Tag> : '-',
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
              setEditingClass(record);
              form.setFieldsValue({
                class_name: record.name,
                civilization_id: record.civilization_id,
                class_level: record.class_level,
                description: record.description,
                privileges: record.privileges,
                obligations: record.obligations,
                typical_occupations: record.typical_occupations,
                population_ratio: record.percentage_of_population,
                typical_power_level: record.typical_power_level,
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
            <TeamOutlined />
            <span>社会阶层管理</span>
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
                setEditingClass(null);
                form.resetFields();
                setModalVisible(true);
              }}
            >
              新建社会阶层
            </Button>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Table
          columns={columns}
          dataSource={socialClasses}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Card>

      <Modal
        title={editingClass ? '编辑社会阶层' : '新建社会阶层'}
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
            name="class_name"
            label="阶层名称"
            rules={[{ required: true, message: '请输入阶层名称' }]}
          >
            <Input placeholder="例如：贵族、平民、奴隶" />
          </Form.Item>
          <Form.Item
            name="class_level"
            label="阶级等级"
            rules={[{ required: true }]}
            initialValue={1}
          >
            <Input type="number" min={1} placeholder="例如：1表示最高等级" />
          </Form.Item>
          <Form.Item
            name="population_ratio"
            label="人口比例"
          >
            <Input placeholder="例如：10%" />
          </Form.Item>
          <Form.Item
            name="typical_occupations"
            label="典型职业"
          >
            <Input placeholder="例如：商人、农民、士兵" />
          </Form.Item>
          <Form.Item
            name="privileges"
            label="特权"
          >
            <TextArea rows={2} placeholder="该阶层的特权" />
          </Form.Item>
          <Form.Item
            name="obligations"
            label="义务"
          >
            <TextArea rows={2} placeholder="该阶层的义务" />
          </Form.Item>
          <Form.Item
            name="description"
            label="阶层描述"
          >
            <TextArea rows={3} placeholder="描述这个社会阶层..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SocialClassManagement;

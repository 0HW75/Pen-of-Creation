import React, { useState, useEffect } from 'react';
import {
  Card, Button, Table, Modal, Form, Input, Select, Tag,
  message, Space, Empty, Tabs, Row, Col, Statistic
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  GlobalOutlined, TeamOutlined, SmileOutlined,
  DollarOutlined, CrownOutlined, BookOutlined
} from '@ant-design/icons';
import { energySocietyApi } from '../../services/api';

const { TextArea } = Input;

// 文明管理组件
const CivilizationManagement = ({ worldId }) => {
  const [civilizations, setCivilizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCiv, setEditingCiv] = useState(null);
  const [form] = Form.useForm();

  const fetchCivilizations = async () => {
    setLoading(true);
    try {
      const response = await energySocietyApi.getCivilizations(worldId);
      if (response.data.code === 200) {
        setCivilizations(response.data.data);
      }
    } catch (error) {
      message.error('获取文明列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (worldId) fetchCivilizations();
  }, [worldId]);

  const handleSubmit = async (values) => {
    try {
      if (editingCiv) {
        await energySocietyApi.updateCivilization(editingCiv.id, values);
        message.success('文明更新成功');
      } else {
        await energySocietyApi.createCivilization({ ...values, world_id: worldId });
        message.success('文明创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchCivilizations();
    } catch (error) {
      message.error(editingCiv ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await energySocietyApi.deleteCivilization(id);
      message.success('删除成功');
      fetchCivilizations();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '文明名称',
      dataIndex: 'civilization_name',
      key: 'civilization_name',
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
      dataIndex: 'development_stage',
      key: 'development_stage',
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
              form.setFieldsValue(record);
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
            rules={[{ required: true }]}
            initialValue="人类"
          >
            <Select>
              <Option value="人类">人类</Option>
              <Option value="精灵">精灵</Option>
              <Option value="矮人">矮人</Option>
              <Option value="兽人">兽人</Option>
              <Option value="混合">混合</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="development_stage"
            label="发展阶段"
            rules={[{ required: true }]}
            initialValue="原始"
          >
            <Select>
              <Option value="原始">原始</Option>
              <Option value="古代">古代</Option>
              <Option value="中世纪">中世纪</Option>
              <Option value="近代">近代</Option>
              <Option value="现代">现代</Option>
              <Option value="未来">未来</Option>
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

// 社会阶层管理组件
const SocialClassManagement = ({ worldId }) => {
  const [socialClasses, setSocialClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [form] = Form.useForm();

  const fetchSocialClasses = async () => {
    setLoading(true);
    try {
      const response = await energySocietyApi.getSocialClasses(worldId);
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
    if (worldId) fetchSocialClasses();
  }, [worldId]);

  const handleSubmit = async (values) => {
    try {
      if (editingClass) {
        await energySocietyApi.updateSocialClass(editingClass.id, values);
        message.success('社会阶层更新成功');
      } else {
        await energySocietyApi.createSocialClass({ ...values, world_id: worldId });
        message.success('社会阶层创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchSocialClasses();
    } catch (error) {
      message.error(editingClass ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await energySocietyApi.deleteSocialClass(id);
      message.success('删除成功');
      fetchSocialClasses();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '阶层名称',
      dataIndex: 'class_name',
      key: 'class_name',
      render: (text, record) => (
        <Space>
          <TeamOutlined style={{ color: '#52c41a' }} />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: '社会地位',
      dataIndex: 'social_status',
      key: 'social_status',
      render: (status) => {
        const colorMap = {
          '高': 'red',
          '中': 'blue',
          '低': 'green',
        };
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: '人口比例',
      dataIndex: 'population_percentage',
      key: 'population_percentage',
      render: (percentage) => <Tag color="orange">{percentage}%</Tag>,
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
              form.setFieldsValue(record);
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
            name="class_name"
            label="阶层名称"
            rules={[{ required: true, message: '请输入阶层名称' }]}
          >
            <Input placeholder="例如：贵族、平民、奴隶" />
          </Form.Item>
          <Form.Item
            name="social_status"
            label="社会地位"
            rules={[{ required: true }]}
            initialValue="中"
          >
            <Select>
              <Option value="高">高</Option>
              <Option value="中">中</Option>
              <Option value="低">低</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="population_percentage"
            label="人口比例（%）"
            rules={[{ required: true, message: '请输入人口比例' }]}
            initialValue={50}
          >
            <Input type="number" placeholder="例如：50" />
          </Form.Item>
          <Form.Item
            name="description"
            label="阶层描述"
          >
            <TextArea rows={3} placeholder="描述这个社会阶层..." />
          </Form.Item>
          <Form.Item
            name="rights_privileges"
            label="权利特权"
          >
            <TextArea rows={2} placeholder="该阶层的权利和特权" />
          </Form.Item>
          <Form.Item
            name="duties_responsibilities"
            label="义务责任"
          >
            <TextArea rows={2} placeholder="该阶层的义务和责任" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// 文化习俗管理组件
const CulturalCustomsManagement = ({ worldId }) => {
  const [culturalCustoms, setCulturalCustoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCustom, setEditingCustom] = useState(null);
  const [form] = Form.useForm();

  const fetchCulturalCustoms = async () => {
    setLoading(true);
    try {
      const response = await energySocietyApi.getCulturalCustoms(worldId);
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
    if (worldId) fetchCulturalCustoms();
  }, [worldId]);

  const handleSubmit = async (values) => {
    try {
      if (editingCustom) {
        await energySocietyApi.updateCulturalCustom(editingCustom.id, values);
        message.success('文化习俗更新成功');
      } else {
        await energySocietyApi.createCulturalCustom({ ...values, world_id: worldId });
        message.success('文化习俗创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchCulturalCustoms();
    } catch (error) {
      message.error(editingCustom ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await energySocietyApi.deleteCulturalCustom(id);
      message.success('删除成功');
      fetchCulturalCustoms();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '习俗名称',
      dataIndex: 'custom_name',
      key: 'custom_name',
      render: (text, record) => (
        <Space>
          <SmileOutlined style={{ color: '#faad14' }} />
          <strong>{text}</strong>
        </Space>
      ),
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
      title: '适用范围',
      dataIndex: 'applicable_scope',
      key: 'applicable_scope',
      render: (scope) => <Tag color="cyan">{scope}</Tag>,
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
              form.setFieldsValue(record);
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
            initialValue="传统"
          >
            <Select>
              <Option value="节日">节日</Option>
              <Option value="礼仪">礼仪</Option>
              <Option value="禁忌">禁忌</Option>
              <Option value="传统">传统</Option>
              <Option value="宗教">宗教</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="applicable_scope"
            label="适用范围"
            rules={[{ required: true }]}
            initialValue="全社会"
          >
            <Select>
              <Option value="全社会">全社会</Option>
              <Option value="特定阶层">特定阶层</Option>
              <Option value="特定地区">特定地区</Option>
              <Option value="特定职业">特定职业</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="习俗描述"
          >
            <TextArea rows={3} placeholder="描述这个文化习俗..." />
          </Form.Item>
          <Form.Item
            name="origin_history"
            label="起源历史"
          >
            <TextArea rows={2} placeholder="习俗的起源和历史" />
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

// 经济体系管理组件
const EconomicSystemManagement = ({ worldId }) => {
  const [economicSystems, setEconomicSystems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSystem, setEditingSystem] = useState(null);
  const [form] = Form.useForm();

  const fetchEconomicSystems = async () => {
    setLoading(true);
    try {
      const response = await energySocietyApi.getEconomicSystems(worldId);
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
    if (worldId) fetchEconomicSystems();
  }, [worldId]);

  const handleSubmit = async (values) => {
    try {
      if (editingSystem) {
        await energySocietyApi.updateEconomicSystem(editingSystem.id, values);
        message.success('经济体系更新成功');
      } else {
        await energySocietyApi.createEconomicSystem({ ...values, world_id: worldId });
        message.success('经济体系创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchEconomicSystems();
    } catch (error) {
      message.error(editingSystem ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await energySocietyApi.deleteEconomicSystem(id);
      message.success('删除成功');
      fetchEconomicSystems();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '经济体系名称',
      dataIndex: 'system_name',
      key: 'system_name',
      render: (text, record) => (
        <Space>
          <DollarOutlined style={{ color: '#52c41a' }} />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: '经济类型',
      dataIndex: 'economic_type',
      key: 'economic_type',
      render: (type) => {
        const colorMap = {
          '农业': 'green',
          '商业': 'blue',
          '工业': 'orange',
          '混合': 'purple',
        };
        return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
      },
    },
    {
      title: '货币单位',
      dataIndex: 'currency_unit',
      key: 'currency_unit',
      render: (unit) => <Tag color="cyan">{unit}</Tag>,
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
              form.setFieldsValue(record);
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
            name="system_name"
            label="经济体系名称"
            rules={[{ required: true, message: '请输入经济体系名称' }]}
          >
            <Input placeholder="例如：自由市场经济、计划经济" />
          </Form.Item>
          <Form.Item
            name="economic_type"
            label="经济类型"
            rules={[{ required: true }]}
            initialValue="混合"
          >
            <Select>
              <Option value="农业">农业</Option>
              <Option value="商业">商业</Option>
              <Option value="工业">工业</Option>
              <Option value="混合">混合</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="currency_unit"
            label="货币单位"
            rules={[{ required: true }]}
            initialValue="金币"
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
            name="key_industries"
            label="关键产业"
          >
            <TextArea rows={2} placeholder="经济体系的关键产业" />
          </Form.Item>
          <Form.Item
            name="trade_relations"
            label="贸易关系"
          >
            <TextArea rows={2} placeholder="与其他文明的贸易关系" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// 政治体系管理组件
const PoliticalSystemManagement = ({ worldId }) => {
  const [politicalSystems, setPoliticalSystems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSystem, setEditingSystem] = useState(null);
  const [form] = Form.useForm();

  const fetchPoliticalSystems = async () => {
    setLoading(true);
    try {
      const response = await energySocietyApi.getPoliticalSystems(worldId);
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
    if (worldId) fetchPoliticalSystems();
  }, [worldId]);

  const handleSubmit = async (values) => {
    try {
      if (editingSystem) {
        await energySocietyApi.updatePoliticalSystem(editingSystem.id, values);
        message.success('政治体系更新成功');
      } else {
        await energySocietyApi.createPoliticalSystem({ ...values, world_id: worldId });
        message.success('政治体系创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchPoliticalSystems();
    } catch (error) {
      message.error(editingSystem ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await energySocietyApi.deletePoliticalSystem(id);
      message.success('删除成功');
      fetchPoliticalSystems();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '政治体系名称',
      dataIndex: 'system_name',
      key: 'system_name',
      render: (text, record) => (
        <Space>
          <CrownOutlined style={{ color: '#faad14' }} />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: '政治类型',
      dataIndex: 'political_type',
      key: 'political_type',
      render: (type) => {
        const colorMap = {
          ' monarchy': 'red',
          ' republic': 'blue',
          ' democracy': 'green',
          ' dictatorship': 'purple',
          ' other': 'default',
        };
        return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
      },
    },
    {
      title: '统治者称呼',
      dataIndex: 'ruler_title',
      key: 'ruler_title',
      render: (title) => <Tag color="cyan">{title}</Tag>,
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
              form.setFieldsValue(record);
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
            name="system_name"
            label="政治体系名称"
            rules={[{ required: true, message: '请输入政治体系名称' }]}
          >
            <Input placeholder="例如：君主制、共和制" />
          </Form.Item>
          <Form.Item
            name="political_type"
            label="政治类型"
            rules={[{ required: true }]}
            initialValue="monarchy"
          >
            <Select>
              <Option value="monarchy">君主制</Option>
              <Option value="republic">共和制</Option>
              <Option value="democracy">民主制</Option>
              <Option value="dictatorship">独裁制</Option>
              <Option value="other">其他</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="ruler_title"
            label="统治者称呼"
            rules={[{ required: true }]}
            initialValue="国王"
          >
            <Input placeholder="例如：国王、总统" />
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
          <Form.Item
            name="governing_principles"
            label="治理原则"
          >
            <TextArea rows={2} placeholder="政治体系的治理原则" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// 社会体系主组件
const SocietySystem = ({ worldId }) => {
  const [activeTab, setActiveTab] = useState('civilizations');
  const [stats, setStats] = useState({
    civilizations: 0,
    socialClasses: 0,
    culturalCustoms: 0,
    economicSystems: 0,
    politicalSystems: 0,
  });

  useEffect(() => {
    if (worldId) {
      // 获取统计数据
      Promise.all([
        energySocietyApi.getCivilizations(worldId),
        energySocietyApi.getSocialClasses(worldId),
        energySocietyApi.getCulturalCustoms(worldId),
        energySocietyApi.getEconomicSystems(worldId),
        energySocietyApi.getPoliticalSystems(worldId),
      ]).then(([civs, classes, customs, economies, politics]) => {
        setStats({
          civilizations: civs.data.data?.length || 0,
          socialClasses: classes.data.data?.length || 0,
          culturalCustoms: customs.data.data?.length || 0,
          economicSystems: economies.data.data?.length || 0,
          politicalSystems: politics.data.data?.length || 0,
        });
      });
    }
  }, [worldId]);

  const tabItems = [
    {
      key: 'civilizations',
      label: '文明',
      children: <CivilizationManagement worldId={worldId} />,
    },
    {
      key: 'socialClasses',
      label: '社会阶层',
      children: <SocialClassManagement worldId={worldId} />,
    },
    {
      key: 'culturalCustoms',
      label: '文化习俗',
      children: <CulturalCustomsManagement worldId={worldId} />,
    },
    {
      key: 'economicSystems',
      label: '经济体系',
      children: <EconomicSystemManagement worldId={worldId} />,
    },
    {
      key: 'politicalSystems',
      label: '政治体系',
      children: <PoliticalSystemManagement worldId={worldId} />,
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="文明数量"
              value={stats.civilizations}
              prefix={<GlobalOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="社会阶层"
              value={stats.socialClasses}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="文化习俗"
              value={stats.culturalCustoms}
              prefix={<SmileOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="经济体系"
              value={stats.economicSystems}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="政治体系"
              value={stats.politicalSystems}
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </div>
  );
};

export default SocietySystem;
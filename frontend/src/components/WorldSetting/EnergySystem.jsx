import React, { useState, useEffect } from 'react';
import {
  Card, Button, Table, Modal, Form, Input, Select, Tag,
  message, Space, Empty, Tabs, Row, Col, Statistic
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  FireOutlined, ThunderboltOutlined, StarOutlined,
  BookOutlined, WarningOutlined
} from '@ant-design/icons';
import { energySocietyApi } from '../../services/api';

const { TextArea } = Input;

// 能量体系管理组件
const EnergySystemManagement = ({ worldId }) => {
  const [energySystems, setEnergySystems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSystem, setEditingSystem] = useState(null);
  const [form] = Form.useForm();

  const fetchEnergySystems = async () => {
    setLoading(true);
    try {
      const response = await energySocietyApi.getEnergySystems(worldId);
      if (response.data.code === 200) {
        setEnergySystems(response.data.data);
      }
    } catch (error) {
      message.error('获取能量体系列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (worldId) fetchEnergySystems();
  }, [worldId]);

  const handleSubmit = async (values) => {
    try {
      if (editingSystem) {
        await energySocietyApi.updateEnergySystem(editingSystem.id, values);
        message.success('能量体系更新成功');
      } else {
        await energySocietyApi.createEnergySystem({ ...values, world_id: worldId });
        message.success('能量体系创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchEnergySystems();
    } catch (error) {
      message.error(editingSystem ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await energySocietyApi.deleteEnergySystem(id);
      message.success('删除成功');
      fetchEnergySystems();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '能量体系名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <FireOutlined style={{ color: '#fa541c' }} />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: '体系类型',
      dataIndex: 'system_type',
      key: 'system_type',
      render: (type) => <Tag color="red">{type}</Tag>,
    },
    {
      title: '基础法则',
      dataIndex: 'basic_laws',
      key: 'basic_laws',
      ellipsis: true,
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
            <FireOutlined />
            <span>能量体系管理</span>
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
            新建能量体系
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        <Table
          columns={columns}
          dataSource={energySystems}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Card>

      <Modal
        title={editingSystem ? '编辑能量体系' : '新建能量体系'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="能量体系名称"
            rules={[{ required: true, message: '请输入能量体系名称' }]}
          >
            <Input placeholder="例如：奥术魔法、元素之力" />
          </Form.Item>
          <Form.Item
            name="system_type"
            label="体系类型"
            rules={[{ required: true }]}
            initialValue="魔法"
          >
            <Select>
              <Select.Option value="魔法">魔法</Select.Option>
              <Select.Option value="斗气">斗气</Select.Option>
              <Select.Option value="魂力">魂力</Select.Option>
              <Select.Option value="科技">科技</Select.Option>
              <Select.Option value="异能">异能</Select.Option>
              <Select.Option value="修真">修真</Select.Option>
              <Select.Option value="其他">其他</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="体系描述"
          >
            <TextArea rows={3} placeholder="描述这个能量体系的基本特征..." />
          </Form.Item>
          <Form.Item
            name="basic_laws"
            label="基础法则"
          >
            <TextArea rows={2} placeholder="该能量体系的基本运行法则" />
          </Form.Item>
          <Form.Item
            name="energy_sources"
            label="能量来源"
          >
            <TextArea rows={2} placeholder="能量的主要来源" />
          </Form.Item>
          <Form.Item
            name="usage_limitations"
            label="使用限制"
          >
            <TextArea rows={2} placeholder="能量使用的限制条件" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// 能量形态管理组件
const EnergyFormManagement = ({ worldId }) => {
  const [energyForms, setEnergyForms] = useState([]);
  const [energySystems, setEnergySystems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingForm, setEditingForm] = useState(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [formsRes, systemsRes] = await Promise.all([
        energySocietyApi.getEnergyForms(worldId),
        energySocietyApi.getEnergySystems(worldId),
      ]);
      if (formsRes.data.code === 200) {
        setEnergyForms(formsRes.data.data);
      }
      if (systemsRes.data.code === 200) {
        setEnergySystems(systemsRes.data.data);
      }
    } catch (error) {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (worldId) fetchData();
  }, [worldId]);

  const handleSubmit = async (values) => {
    try {
      if (editingForm) {
        await energySocietyApi.updateEnergyForm(editingForm.id, values);
        message.success('能量形态更新成功');
      } else {
        await energySocietyApi.createEnergyForm({ ...values, world_id: worldId });
        message.success('能量形态创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error(editingForm ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await energySocietyApi.deleteEnergyForm(id);
      message.success('删除成功');
      fetchData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '能量形态名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <ThunderboltOutlined style={{ color: '#108ee9' }} />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: '形态类型',
      dataIndex: 'form_type',
      key: 'form_type',
      render: (type) => {
        const colorMap = {
          '元素': 'blue',
          '生命': 'green',
          '概念': 'purple',
          '复合': 'orange',
        };
        return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
      },
    },
    {
      title: '所属体系',
      dataIndex: 'energy_system_name',
      key: 'energy_system_name',
      render: (name) => name || '-',
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
              setEditingForm(record);
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
            <ThunderboltOutlined />
            <span>能量形态管理</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingForm(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            新建能量形态
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={energyForms}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Card>

      <Modal
        title={editingForm ? '编辑能量形态' : '新建能量形态'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="能量形态名称"
            rules={[{ required: true, message: '请输入能量形态名称' }]}
          >
            <Input placeholder="例如：火焰、生命能量" />
          </Form.Item>
          <Form.Item
            name="form_type"
            label="形态类型"
            rules={[{ required: true }]}
            initialValue="元素"
          >
            <Select>
              <Select.Option value="元素">元素</Select.Option>
              <Select.Option value="生命">生命</Select.Option>
              <Select.Option value="概念">概念</Select.Option>
              <Select.Option value="复合">复合</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="energy_system_id"
            label="所属能量体系"
          >
            <Select allowClear placeholder="选择所属能量体系（可选）">
              {energySystems.map(system => (
                <Select.Option key={system.id} value={system.id}>{system.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="形态描述"
          >
            <TextArea rows={3} placeholder="描述这个能量形态的特征..." />
          </Form.Item>
          <Form.Item
            name="basic_properties"
            label="基本属性"
          >
            <TextArea rows={2} placeholder="能量形态的基本属性" />
          </Form.Item>
          <Form.Item
            name="interaction_rules"
            label="相互作用规则"
          >
            <TextArea rows={2} placeholder="与其他能量形态的相互作用" />
          </Form.Item>
          <Form.Item
            name="visual_manifestation"
            label="视觉表现"
          >
            <TextArea rows={2} placeholder="能量形态的视觉表现" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// 力量等级管理组件
const PowerLevelManagement = ({ worldId }) => {
  const [powerLevels, setPowerLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const [form] = Form.useForm();

  const fetchPowerLevels = async () => {
    setLoading(true);
    try {
      const response = await energySocietyApi.getPowerLevels(worldId);
      if (response.data.code === 200) {
        setPowerLevels(response.data.data);
      }
    } catch (error) {
      message.error('获取力量等级列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (worldId) fetchPowerLevels();
  }, [worldId]);

  const handleSubmit = async (values) => {
    try {
      // 转换字段名以匹配后端 API
      const data = {
        name: values.level_name,
        level: values.level_number,
        level_name: values.level_name,
        description: values.power_description || '',
        abilities: values.signature_abilities || '',
        requirements: values.requirements || '',
        world_id: worldId,
      };
      if (editingLevel) {
        await energySocietyApi.updatePowerLevel(editingLevel.id, data);
        message.success('力量等级更新成功');
      } else {
        await energySocietyApi.createPowerLevel(data);
        message.success('力量等级创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchPowerLevels();
    } catch (error) {
      message.error(editingLevel ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await energySocietyApi.deletePowerLevel(id);
      message.success('删除成功');
      fetchPowerLevels();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '等级名称',
      dataIndex: 'level_name',
      key: 'level_name',
      render: (text, record) => (
        <Space>
          <StarOutlined style={{ color: '#faad14' }} />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: '等级',
      dataIndex: 'level_number',
      key: 'level_number',
      render: (level) => <Tag color="orange">{level}</Tag>,
    },
    {
      title: '力量描述',
      dataIndex: 'power_description',
      key: 'power_description',
      ellipsis: true,
    },
    {
      title: '标志性能力',
      dataIndex: 'signature_abilities',
      key: 'signature_abilities',
      ellipsis: true,
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
              setEditingLevel(record);
              // 将后端字段转换为前端表单字段
              form.setFieldsValue({
                level_name: record.level_name || record.name,
                level_number: record.level,
                power_description: record.description,
                signature_abilities: record.abilities,
                requirements: record.requirements,
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
            <StarOutlined />
            <span>力量等级管理</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingLevel(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            新建力量等级
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        <Table
          columns={columns}
          dataSource={powerLevels}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Card>

      <Modal
        title={editingLevel ? '编辑力量等级' : '新建力量等级'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="level_name"
            label="等级名称"
            rules={[{ required: true, message: '请输入等级名称' }]}
          >
            <Input placeholder="例如：学徒、大师" />
          </Form.Item>
          <Form.Item
            name="level_number"
            label="等级数字"
            rules={[{ required: true, message: '请输入等级数字' }]}
            initialValue={1}
          >
            <Input type="number" placeholder="例如：1、10" />
          </Form.Item>
          <Form.Item
            name="power_description"
            label="力量描述"
          >
            <TextArea rows={3} placeholder="描述这个等级的力量水平..." />
          </Form.Item>
          <Form.Item
            name="signature_abilities"
            label="标志性能力"
          >
            <TextArea rows={2} placeholder="该等级的标志性能力" />
          </Form.Item>
          <Form.Item
            name="requirements"
            label="晋升要求"
          >
            <TextArea rows={2} placeholder="晋升到该等级的要求" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// 力量代价管理组件
const PowerCostManagement = ({ worldId }) => {
  const [powerCosts, setPowerCosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCost, setEditingCost] = useState(null);
  const [form] = Form.useForm();

  const fetchPowerCosts = async () => {
    setLoading(true);
    try {
      const response = await energySocietyApi.getPowerCosts(worldId);
      if (response.data.code === 200) {
        setPowerCosts(response.data.data);
      }
    } catch (error) {
      message.error('获取力量代价列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (worldId) fetchPowerCosts();
  }, [worldId]);

  const handleSubmit = async (values) => {
    try {
      if (editingCost) {
        await energySocietyApi.updatePowerCost(editingCost.id, values);
        message.success('力量代价更新成功');
      } else {
        await energySocietyApi.createPowerCost({ ...values, world_id: worldId });
        message.success('力量代价创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchPowerCosts();
    } catch (error) {
      message.error(editingCost ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await energySocietyApi.deletePowerCost(id);
      message.success('删除成功');
      fetchPowerCosts();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '代价类型',
      dataIndex: 'cost_type',
      key: 'cost_type',
      render: (type) => (
        <Space>
          <WarningOutlined style={{ color: '#faad14' }} />
          <strong>{type}</strong>
        </Space>
      ),
    },
    {
      title: '严重程度',
      dataIndex: 'severity_level',
      key: 'severity_level',
      render: (level) => {
        const colorMap = {
          1: 'green',
          2: 'cyan',
          3: 'blue',
          4: 'purple',
          5: 'default',
          6: 'orange',
          7: 'red',
          8: 'red',
          9: 'red',
          10: 'red',
        };
        return <Tag color={colorMap[level] || 'default'}>{level}/10</Tag>;
      },
    },
    {
      title: '触发条件',
      dataIndex: 'trigger_conditions',
      key: 'trigger_conditions',
      ellipsis: true,
    },
    {
      title: '是否可逆',
      dataIndex: 'reversible',
      key: 'reversible',
      render: (reversible) => <Tag color={reversible ? 'green' : 'red'}>{reversible ? '是' : '否'}</Tag>,
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
              setEditingCost(record);
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
            <WarningOutlined />
            <span>力量代价管理</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingCost(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            新建力量代价
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        <Table
          columns={columns}
          dataSource={powerCosts}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Card>

      <Modal
        title={editingCost ? '编辑力量代价' : '新建力量代价'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="cost_type"
            label="代价类型"
            rules={[{ required: true, message: '请输入代价类型' }]}
          >
            <Input placeholder="例如：寿命、记忆" />
          </Form.Item>
          <Form.Item
            name="severity_level"
            label="严重程度"
            rules={[{ required: true, message: '请输入严重程度' }]}
            initialValue={5}
          >
            <Select>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                <Select.Option key={level} value={level}>{level}/10</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="代价描述"
          >
            <TextArea rows={3} placeholder="描述这个力量代价..." />
          </Form.Item>
          <Form.Item
            name="trigger_conditions"
            label="触发条件"
          >
            <TextArea rows={2} placeholder="触发这个代价的条件" />
          </Form.Item>
          <Form.Item
            name="payment_mechanism"
            label="支付机制"
          >
            <TextArea rows={2} placeholder="代价的支付机制" />
          </Form.Item>
          <Form.Item
            name="reversible"
            label="是否可逆"
            initialValue={false}
          >
            <Select>
              <Select.Option value={true}>是</Select.Option>
              <Select.Option value={false}>否</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="mitigation_methods"
            label="缓解方法"
          >
            <TextArea rows={2} placeholder="缓解这个代价的方法" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// 通用技能管理组件
const CommonSkillManagement = ({ worldId }) => {
  const [commonSkills, setCommonSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [form] = Form.useForm();

  const fetchCommonSkills = async () => {
    setLoading(true);
    try {
      const response = await energySocietyApi.getCommonSkills(worldId);
      if (response.data.code === 200) {
        setCommonSkills(response.data.data);
      }
    } catch (error) {
      message.error('获取通用技能列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (worldId) fetchCommonSkills();
  }, [worldId]);

  const handleSubmit = async (values) => {
    try {
      // 转换字段名以匹配后端 API
      const data = {
        name: values.skill_name,
        skill_type: values.skill_type,
        description: values.description || '',
        difficulty: values.difficulty_level || '普通',
        typical_users: values.applicable_classes || '',
        learning_time: values.learning_method || '',
        world_id: worldId,
      };
      if (editingSkill) {
        await energySocietyApi.updateCommonSkill(editingSkill.id, data);
        message.success('通用技能更新成功');
      } else {
        await energySocietyApi.createCommonSkill(data);
        message.success('通用技能创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchCommonSkills();
    } catch (error) {
      message.error(editingSkill ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await energySocietyApi.deleteCommonSkill(id);
      message.success('删除成功');
      fetchCommonSkills();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '技能名称',
      dataIndex: 'skill_name',
      key: 'skill_name',
      render: (text, record) => (
        <Space>
          <BookOutlined style={{ color: '#722ed1' }} />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: '技能类型',
      dataIndex: 'skill_type',
      key: 'skill_type',
      render: (type) => <Tag color="purple">{type}</Tag>,
    },
    {
      title: '适用职业',
      dataIndex: 'applicable_classes',
      key: 'applicable_classes',
      ellipsis: true,
    },
    {
      title: '学习难度',
      dataIndex: 'difficulty_level',
      key: 'difficulty_level',
      render: (level) => {
        const colorMap = {
          '简单': 'green',
          '中等': 'blue',
          '困难': 'orange',
          '大师': 'red',
        };
        return <Tag color={colorMap[level] || 'default'}>{level}</Tag>;
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
              setEditingSkill(record);
              // 将后端字段转换为前端表单字段
              form.setFieldsValue({
                skill_name: record.name,
                skill_type: record.skill_type,
                description: record.description,
                applicable_classes: record.typical_users,
                difficulty_level: record.difficulty,
                learning_method: record.learning_time,
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
            <BookOutlined />
            <span>通用技能管理</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingSkill(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            新建通用技能
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={commonSkills}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Card>

      <Modal
        title={editingSkill ? '编辑通用技能' : '新建通用技能'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="skill_name"
            label="技能名称"
            rules={[{ required: true, message: '请输入技能名称' }]}
          >
            <Input placeholder="例如：剑术、魔法理论" />
          </Form.Item>
          <Form.Item
            name="skill_type"
            label="技能类型"
            rules={[{ required: true }]}
            initialValue="战斗"
          >
            <Select>
              <Select.Option value="战斗">战斗</Select.Option>
              <Select.Option value="魔法">魔法</Select.Option>
              <Select.Option value="生活">生活</Select.Option>
              <Select.Option value="知识">知识</Select.Option>
              <Select.Option value="社交">社交</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="技能描述"
          >
            <TextArea rows={3} placeholder="描述这个技能..." />
          </Form.Item>
          <Form.Item
            name="applicable_classes"
            label="适用职业"
          >
            <Input placeholder="例如：战士、法师" />
          </Form.Item>
          <Form.Item
            name="difficulty_level"
            label="学习难度"
            initialValue="中等"
          >
            <Select>
              <Select.Option value="简单">简单</Select.Option>
              <Select.Option value="中等">中等</Select.Option>
              <Select.Option value="困难">困难</Select.Option>
              <Select.Option value="大师">大师</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="learning_method"
            label="学习方法"
          >
            <TextArea rows={2} placeholder="学习这个技能的方法" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// 能量体系主组件
const EnergySystem = ({ worldId }) => {
  const [activeTab, setActiveTab] = useState('systems');
  const [stats, setStats] = useState({
    energySystems: 0,
    energyForms: 0,
    powerLevels: 0,
    powerCosts: 0,
    commonSkills: 0,
  });

  useEffect(() => {
    if (worldId) {
      // 获取统计数据
      Promise.all([
        energySocietyApi.getEnergySystems(worldId),
        energySocietyApi.getEnergyForms(worldId),
        energySocietyApi.getPowerLevels(worldId),
        energySocietyApi.getPowerCosts(worldId),
        energySocietyApi.getCommonSkills(worldId),
      ]).then(([systems, forms, levels, costs, skills]) => {
        setStats({
          energySystems: systems.data.data?.length || 0,
          energyForms: forms.data.data?.length || 0,
          powerLevels: levels.data.data?.length || 0,
          powerCosts: costs.data.data?.length || 0,
          commonSkills: skills.data.data?.length || 0,
        });
      });
    }
  }, [worldId]);

  const tabItems = [
    {
      key: 'systems',
      label: '能量体系',
      children: <EnergySystemManagement worldId={worldId} />,
    },
    {
      key: 'forms',
      label: '能量形态',
      children: <EnergyFormManagement worldId={worldId} />,
    },
    {
      key: 'levels',
      label: '力量等级',
      children: <PowerLevelManagement worldId={worldId} />,
    },
    {
      key: 'costs',
      label: '力量代价',
      children: <PowerCostManagement worldId={worldId} />,
    },
    {
      key: 'skills',
      label: '通用技能',
      children: <CommonSkillManagement worldId={worldId} />,
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="能量体系"
              value={stats.energySystems}
              prefix={<FireOutlined />}
              styles={{ content: { color: '#fa541c'  } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="能量形态"
              value={stats.energyForms}
              prefix={<ThunderboltOutlined />}
              styles={{ content: { color: '#108ee9'  } }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="力量等级"
              value={stats.powerLevels}
              prefix={<StarOutlined />}
              styles={{ content: { color: '#faad14'  } }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="力量代价"
              value={stats.powerCosts}
              prefix={<WarningOutlined />}
              styles={{ content: { color: '#f5222d'  } }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="通用技能"
              value={stats.commonSkills}
              prefix={<BookOutlined />}
              styles={{ content: { color: '#722ed1'  } }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </div>
  );
};

export default EnergySystem;

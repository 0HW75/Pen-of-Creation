import React, { useState, useEffect } from 'react';
import {
  Card, Button, Table, Modal, Form, Input, Select, Tabs,
  message, Space, Tag, Empty, Row, Col, Statistic, Slider, Switch
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  ThunderboltOutlined, CrownOutlined, TeamOutlined,
  BookOutlined, GoldOutlined, BankOutlined, FireOutlined
} from '@ant-design/icons';
import { energySocietyApi } from '../../services/api';

const { TextArea } = Input;
const { Option } = Select;

// 能量体系管理
const EnergySystemManagement = ({ worldId }) => {
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSystem, setEditingSystem] = useState(null);
  const [form] = Form.useForm();

  const fetchSystems = async () => {
    setLoading(true);
    try {
      const response = await energySocietyApi.getEnergySystems(worldId);
      if (response.data.code === 200) {
        setSystems(response.data.data);
      }
    } catch (error) {
      message.error('获取能量体系列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (worldId) fetchSystems();
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
      fetchSystems();
    } catch (error) {
      message.error(editingSystem ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await energySocietyApi.deleteEnergySystem(id);
      message.success('删除成功');
      fetchSystems();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '体系名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <ThunderboltOutlined style={{ color: '#faad14' }} />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: '能量来源',
      dataIndex: 'energy_sources',
      key: 'energy_sources',
      ellipsis: true,
    },
    {
      title: '普及程度',
      dataIndex: 'prevalence',
      key: 'prevalence',
      render: (val) => <Tag color="blue">{val}%</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => {
            setEditingSystem(record);
            form.setFieldsValue(record);
            setModalVisible(true);
          }}>编辑</Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={<Space><ThunderboltOutlined /><span>能量体系</span></Space>}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => {
          setEditingSystem(null);
          form.resetFields();
          setModalVisible(true);
        }}>新建体系</Button>}
      >
        <Table columns={columns} dataSource={systems} rowKey="id" loading={loading} size="small" />
      </Card>

      <Modal
        title={editingSystem ? '编辑能量体系' : '新建能量体系'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="体系名称" rules={[{ required: true }]}>
            <Input placeholder="例如：奥术魔法、斗气" />
          </Form.Item>
          <Form.Item name="energy_sources" label="能量来源">
            <TextArea rows={2} placeholder="能量从何而来？" />
          </Form.Item>
          <Form.Item name="energy_types" label="能量类型">
            <TextArea rows={2} placeholder="有哪些类型的能量？" />
          </Form.Item>
          <Form.Item name="usage_principles" label="使用原理">
            <TextArea rows={2} placeholder="如何使用这种能量？" />
          </Form.Item>
          <Form.Item name="prevalence" label="普及程度" initialValue={50}>
            <Slider min={0} max={100} marks={{ 0: '罕见', 50: '普通', 100: '普及' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// 力量等级管理
const PowerLevelManagement = ({ worldId }) => {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const [form] = Form.useForm();

  const fetchLevels = async () => {
    setLoading(true);
    try {
      const response = await energySocietyApi.getPowerLevels(worldId);
      if (response.data.code === 200) {
        setLevels(response.data.data);
      }
    } catch (error) {
      message.error('获取力量等级列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (worldId) fetchLevels();
  }, [worldId]);

  const handleSubmit = async (values) => {
    try {
      if (editingLevel) {
        await energySocietyApi.updatePowerLevel(editingLevel.id, values);
        message.success('力量等级更新成功');
      } else {
        await energySocietyApi.createPowerLevel({ ...values, world_id: worldId });
        message.success('力量等级创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchLevels();
    } catch (error) {
      message.error(editingLevel ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await energySocietyApi.deletePowerLevel(id);
      message.success('删除成功');
      fetchLevels();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '等级名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <CrownOutlined style={{ color: record.level_number >= 8 ? '#faad14' : '#1890ff' }} />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: '等级序号',
      dataIndex: 'level_number',
      key: 'level_number',
      render: (num) => <Tag color="purple">Lv.{num}</Tag>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => {
            setEditingLevel(record);
            form.setFieldsValue(record);
            setModalVisible(true);
          }}>编辑</Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={<Space><CrownOutlined /><span>力量等级</span></Space>}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => {
          setEditingLevel(null);
          form.resetFields();
          setModalVisible(true);
        }}>新建等级</Button>}
      >
        <Table columns={columns} dataSource={levels} rowKey="id" loading={loading} size="small" />
      </Card>

      <Modal
        title={editingLevel ? '编辑力量等级' : '新建力量等级'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="等级名称" rules={[{ required: true }]}>
            <Input placeholder="例如：学徒、大师、传奇" />
          </Form.Item>
          <Form.Item name="level_number" label="等级序号" rules={[{ required: true }]} initialValue={1}>
            <Input type="number" min={1} placeholder="数字越大等级越高" />
          </Form.Item>
          <Form.Item name="description" label="等级描述">
            <TextArea rows={3} placeholder="描述该等级的特征..." />
          </Form.Item>
          <Form.Item name="abilities" label="能力描述">
            <TextArea rows={2} placeholder="该等级拥有的能力..." />
          </Form.Item>
          <Form.Item name="requirements" label="晋升要求">
            <TextArea rows={2} placeholder="如何晋升到该等级..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// 文明管理
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
      // 转换字段名以匹配后端 API
      const data = {
        name: values.name,
        world_id: worldId,
        civilization_type: values.civilization_type || '魔法文明',
        description: values.description || '',
        development_level: values.tech_level || '中世纪',
        population_scale: values.population_scale || '',
        territory_size: values.territory_size || '',
        political_system: values.political_system || '',
        economic_system: values.economic_system || '',
        technological_level: values.tech_level || '',
        magical_level: values.magic_tech_level || '',
        cultural_characteristics: values.cultural_characteristics || '',
        religious_beliefs: values.religious_beliefs || '',
        taboos: values.taboos || '',
        values: values.values || '',
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
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <TeamOutlined style={{ color: '#1890ff' }} />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: '种族构成',
      dataIndex: 'racial_composition',
      key: 'racial_composition',
      ellipsis: true,
    },
    {
      title: '科技水平',
      dataIndex: 'tech_level',
      key: 'tech_level',
      render: (level) => <Tag color="green">{level}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => {
            setEditingCiv(record);
            form.setFieldsValue(record);
            setModalVisible(true);
          }}>编辑</Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={<Space><BookOutlined /><span>文明管理</span></Space>}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => {
          setEditingCiv(null);
          form.resetFields();
          setModalVisible(true);
        }}>新建文明</Button>}
      >
        <Table columns={columns} dataSource={civilizations} rowKey="id" loading={loading} size="small" />
      </Card>

      <Modal
        title={editingCiv ? '编辑文明' : '新建文明'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="文明名称" rules={[{ required: true }]}>
            <Input placeholder="例如：高等精灵帝国" />
          </Form.Item>
          <Form.Item name="racial_composition" label="种族构成">
            <Input placeholder="例如：人类70%、精灵20%、其他10%" />
          </Form.Item>
          <Form.Item name="tech_level" label="科技水平" initialValue="中世纪">
            <Select>
              <Select.Option value="原始">原始</Select.Option>
              <Select.Option value="古代">古代</Select.Option>
              <Select.Option value="中世纪">中世纪</Select.Option>
              <Select.Option value="近代">近代</Select.Option>
              <Select.Option value="现代">现代</Select.Option>
              <Select.Option value="未来">未来</Select.Option>
              <Select.Option value="超科技">超科技</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="magic_tech_level" label="魔法/能量水平" initialValue="中等">
            <Select>
              <Select.Option value="无">无</Select.Option>
              <Select.Option value="低">低</Select.Option>
              <Select.Option value="中等">中等</Select.Option>
              <Select.Option value="高">高</Select.Option>
              <Select.Option value="极高">极高</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="文明描述">
            <TextArea rows={3} placeholder="描述这个文明的特征..." />
          </Form.Item>
          <Form.Item name="values" label="核心价值观">
            <TextArea rows={2} placeholder="这个文明崇尚什么？" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// 社会阶级管理
const SocialClassManagement = ({ worldId }) => {
  const [classes, setClasses] = useState([]);
  const [civilizations, setCivilizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [classesRes, civsRes] = await Promise.all([
        energySocietyApi.getSocialClasses(worldId),
        energySocietyApi.getCivilizations(worldId),
      ]);
      if (classesRes.data.code === 200) setClasses(classesRes.data.data);
      if (civsRes.data.code === 200) setCivilizations(civsRes.data.data);
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
      // 转换字段名以匹配后端 API
      const data = {
        name: values.name,
        world_id: worldId,
        civilization_id: values.civilization_id,
        class_level: values.class_level || 1,
        description: values.description || '',
        privileges: values.privileges || '',
        obligations: values.restrictions || '',
        typical_occupations: values.typical_occupations || '',
        living_standards: values.living_standards || '',
        education_access: values.education_access || '',
        social_mobility: values.social_mobility || '',
        percentage_of_population: values.percentage_of_population || '',
        typical_power_level: values.typical_power_level || 0,
      };
      if (editingClass) {
        await energySocietyApi.updateSocialClass(editingClass.id, data);
        message.success('社会阶级更新成功');
      } else {
        await energySocietyApi.createSocialClass(data);
        message.success('社会阶级创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error(editingClass ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await energySocietyApi.deleteSocialClass(id);
      message.success('删除成功');
      fetchData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '阶级名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <GoldOutlined style={{ color: record.class_level >= 8 ? '#faad14' : '#8c8c8c' }} />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: '等级',
      dataIndex: 'class_level',
      key: 'class_level',
      render: (level) => <Tag color={level >= 8 ? 'gold' : 'blue'}>{level}/10</Tag>,
    },
    {
      title: '所属文明',
      dataIndex: 'civilization_name',
      key: 'civilization_name',
      render: (name) => name || '通用',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => {
            setEditingClass(record);
            form.setFieldsValue(record);
            setModalVisible(true);
          }}>编辑</Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={<Space><GoldOutlined /><span>社会阶级</span></Space>}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => {
          setEditingClass(null);
          form.resetFields();
          setModalVisible(true);
        }}>新建阶级</Button>}
      >
        <Table columns={columns} dataSource={classes} rowKey="id" loading={loading} size="small" />
      </Card>

      <Modal
        title={editingClass ? '编辑社会阶级' : '新建社会阶级'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="阶级名称" rules={[{ required: true }]}>
            <Input placeholder="例如：贵族、平民、奴隶" />
          </Form.Item>
          <Form.Item name="civilization_id" label="所属文明">
            <Select allowClear placeholder="选择所属文明（可选）">
              {civilizations.map(c => (
                <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="class_level" label="阶级等级" initialValue={5}>
            <Slider min={1} max={10} marks={{ 1: '底层', 5: '中层', 10: '顶层' }} />
          </Form.Item>
          <Form.Item name="description" label="阶级描述">
            <TextArea rows={3} placeholder="描述这个阶级的特征..." />
          </Form.Item>
          <Form.Item name="privileges" label="特权">
            <TextArea rows={2} placeholder="这个阶级拥有什么特权？" />
          </Form.Item>
          <Form.Item name="restrictions" label="限制">
            <TextArea rows={2} placeholder="这个阶级有什么限制？" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// 经济体系管理
const EconomicSystemManagement = ({ worldId }) => {
  const [systems, setSystems] = useState([]);
  const [civilizations, setCivilizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSystem, setEditingSystem] = useState(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [systemsRes, civsRes] = await Promise.all([
        energySocietyApi.getEconomicSystems(worldId),
        energySocietyApi.getCivilizations(worldId),
      ]);
      if (systemsRes.data.code === 200) setSystems(systemsRes.data.data);
      if (civsRes.data.code === 200) setCivilizations(civsRes.data.data);
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
      // 转换字段名以匹配后端 API
      const data = {
        name: values.name,
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
      fetchData();
    } catch (error) {
      message.error(editingSystem ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await energySocietyApi.deleteEconomicSystem(id);
      message.success('删除成功');
      fetchData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '体系名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <GoldOutlined style={{ color: '#faad14' }} />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: '经济模式',
      dataIndex: 'economic_model',
      key: 'economic_model',
      render: (model) => <Tag color="orange">{model}</Tag>,
    },
    {
      title: '货币',
      dataIndex: 'currency_name',
      key: 'currency_name',
      render: (name) => name || '无',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => {
            setEditingSystem(record);
            form.setFieldsValue(record);
            setModalVisible(true);
          }}>编辑</Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={<Space><GoldOutlined /><span>经济体系</span></Space>}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => {
          setEditingSystem(null);
          form.resetFields();
          setModalVisible(true);
        }}>新建体系</Button>}
      >
        <Table columns={columns} dataSource={systems} rowKey="id" loading={loading} size="small" />
      </Card>

      <Modal
        title={editingSystem ? '编辑经济体系' : '新建经济体系'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="体系名称" rules={[{ required: true }]}>
            <Input placeholder="例如：暴风城经济体系" />
          </Form.Item>
          <Form.Item name="civilization_id" label="所属文明">
            <Select allowClear placeholder="选择所属文明（可选）">
              {civilizations.map(c => (
                <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="economic_model" label="经济模式" initialValue="市场经济">
            <Select>
              <Select.Option value="物物交换">物物交换</Select.Option>
              <Select.Option value="市场经济">市场经济</Select.Option>
              <Select.Option value="计划经济">计划经济</Select.Option>
              <Select.Option value="混合经济">混合经济</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="currency_name" label="货币名称">
            <Input placeholder="例如：金币、信用点" />
          </Form.Item>
          <Form.Item name="description" label="体系描述">
            <TextArea rows={3} placeholder="描述这个经济体系..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// 政治体系管理
const PoliticalSystemManagement = ({ worldId }) => {
  const [systems, setSystems] = useState([]);
  const [civilizations, setCivilizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSystem, setEditingSystem] = useState(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [systemsRes, civsRes] = await Promise.all([
        energySocietyApi.getPoliticalSystems(worldId),
        energySocietyApi.getCivilizations(worldId),
      ]);
      if (systemsRes.data.code === 200) setSystems(systemsRes.data.data);
      if (civsRes.data
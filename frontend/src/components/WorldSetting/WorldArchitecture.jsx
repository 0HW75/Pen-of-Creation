import React, { useState, useEffect } from 'react';
import {
  Card, Button, Table, Modal, Form, Input, Select, Tree,
  message, Space, Tag, Empty, Tabs, Row, Col, Statistic, Divider
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  GlobalOutlined, ApartmentOutlined, StarOutlined,
  ExperimentOutlined, ReloadOutlined
} from '@ant-design/icons';
import { worldSettingApi } from '../../services/api';

const { TextArea } = Input;
const { TabPane } = Tabs;

// 维度管理组件
const DimensionManagement = ({ worldId }) => {
  const [dimensions, setDimensions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDimension, setEditingDimension] = useState(null);
  const [form] = Form.useForm();

  const fetchDimensions = async () => {
    setLoading(true);
    try {
      const response = await worldSettingApi.getDimensions(worldId);
      if (response.data.code === 200) {
        setDimensions(response.data.data);
      }
    } catch (error) {
      message.error('获取维度列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (worldId) fetchDimensions();
  }, [worldId]);

  const handleSubmit = async (values) => {
    try {
      // 字段映射转换
      const data = {
        name: values.name,
        world_id: worldId,
        dimension_type: values.dimension_type,
        description: values.description,
        entry_conditions: values.access_method,
        time_flow: values.time_flow_ratio ? `${values.time_flow_ratio}:1` : '1:1',
        physical_properties: values.physical_properties,
      };
      if (editingDimension) {
        await worldSettingApi.updateDimension(editingDimension.id, data);
        message.success('维度更新成功');
      } else {
        await worldSettingApi.createDimension(data);
        message.success('维度创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchDimensions();
    } catch (error) {
      message.error(editingDimension ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await worldSettingApi.deleteDimension(id);
      message.success('删除成功');
      fetchDimensions();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '维度名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <GlobalOutlined style={{ color: record.dimension_type === '主维度' ? '#1890ff' : '#722ed1' }} />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'dimension_type',
      key: 'dimension_type',
      render: (type) => <Tag color={type === '主维度' ? 'blue' : 'purple'}>{type}</Tag>,
    },
    {
      title: '访问方式',
      dataIndex: 'entry_conditions',
      key: 'entry_conditions',
      ellipsis: true,
    },
    {
      title: '时间流速',
      dataIndex: 'time_flow',
      key: 'time_flow',
      render: (ratio) => ratio || '-',
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
              setEditingDimension(record);
              // 反向字段映射
              form.setFieldsValue({
                name: record.name,
                dimension_type: record.dimension_type,
                description: record.description,
                access_method: record.entry_conditions,
                time_flow_ratio: record.time_flow ? parseFloat(record.time_flow.split(':')[0]) : 1.0,
                physical_properties: record.physical_properties,
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
            <span>维度/位面管理</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingDimension(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            新建维度
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        <Table
          columns={columns}
          dataSource={dimensions}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Card>

      <Modal
        title={editingDimension ? '编辑维度' : '新建维度'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="维度名称"
            rules={[{ required: true, message: '请输入维度名称' }]}
          >
            <Input placeholder="例如：主物质界、暗影界" />
          </Form.Item>
          <Form.Item
            name="dimension_type"
            label="维度类型"
            rules={[{ required: true }]}
            initialValue="主维度"
          >
            <Select>
              <Select.Option value="主维度">主维度</Select.Option>
              <Select.Option value="平行维度">平行维度</Select.Option>
              <Select.Option value="子维度">子维度</Select.Option>
              <Select.Option value="口袋维度">口袋维度</Select.Option>
              <Select.Option value="虚空">虚空</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="维度描述"
          >
            <TextArea rows={3} placeholder="描述这个维度的基本特征..." />
          </Form.Item>
          <Form.Item
            name="access_method"
            label="访问方式"
          >
            <TextArea rows={2} placeholder="如何进入这个维度？" />
          </Form.Item>
          <Form.Item
            name="time_flow_ratio"
            label="时间流速比例"
            initialValue={1.0}
          >
            <Input type="number" step={0.1} placeholder="相对于主维度的时间流速" />
          </Form.Item>
          <Form.Item
            name="physical_properties"
            label="物理特性"
          >
            <TextArea rows={2} placeholder="该维度的物理法则特点" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// 区域管理组件
const RegionManagement = ({ worldId }) => {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRegion, setEditingRegion] = useState(null);
  const [form] = Form.useForm();

  const fetchRegions = async () => {
    setLoading(true);
    try {
      const response = await worldSettingApi.getRegions(worldId);
      if (response.data.code === 200) {
        setRegions(response.data.data);
      }
    } catch (error) {
      message.error('获取区域列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (worldId) fetchRegions();
  }, [worldId]);

  // 构建树形结构
  const buildTreeData = (data) => {
    const map = {};
    const roots = [];
    
    data.forEach(item => {
      map[item.id] = { ...item, key: item.id, title: item.name, children: [] };
    });
    
    data.forEach(item => {
      if (item.parent_id && map[item.parent_id]) {
        map[item.parent_id].children.push(map[item.id]);
      } else {
        roots.push(map[item.id]);
      }
    });
    
    return roots;
  };

  const handleSubmit = async (values) => {
    try {
      // 字段映射转换
      const data = {
        name: values.name,
        world_id: worldId,
        region_type: values.region_type,
        parent_region_id: values.parent_id,
        description: values.description,
        terrain: values.geography,
        climate: values.climate,
      };
      if (editingRegion) {
        await worldSettingApi.updateRegion(editingRegion.id, data);
        message.success('区域更新成功');
      } else {
        await worldSettingApi.createRegion(data);
        message.success('区域创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchRegions();
    } catch (error) {
      message.error(editingRegion ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await worldSettingApi.deleteRegion(id);
      message.success('删除成功');
      fetchRegions();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const treeData = buildTreeData(regions);

  return (
    <div>
      <Card
        title={
          <Space>
            <ApartmentOutlined />
            <span>地理区域管理</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingRegion(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            新建区域
          </Button>
        }
      >
        {regions.length > 0 ? (
          <Tree
            treeData={treeData}
            defaultExpandAll
            showLine
            showIcon={false}
            titleRender={(nodeData) => (
              <Space>
                <span>{nodeData.name}</span>
                <Tag size="small" color="blue">{nodeData.region_type}</Tag>
                <Space size="small">
                  <Button
                    type="link"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingRegion(nodeData);
                      // 反向字段映射
                      form.setFieldsValue({
                        name: nodeData.name,
                        region_type: nodeData.region_type,
                        parent_id: nodeData.parent_region_id,
                        description: nodeData.description,
                        geography: nodeData.terrain,
                        climate: nodeData.climate,
                      });
                      setModalVisible(true);
                    }}
                  />
                  <Button
                    type="link"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(nodeData.id);
                    }}
                  />
                </Space>
              </Space>
            )}
          />
        ) : (
          <Empty description="暂无区域数据" />
        )}
      </Card>

      <Modal
        title={editingRegion ? '编辑区域' : '新建区域'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="区域名称"
            rules={[{ required: true, message: '请输入区域名称' }]}
          >
            <Input placeholder="例如：暴风城、艾尔文森林" />
          </Form.Item>
          <Form.Item
            name="region_type"
            label="区域类型"
            rules={[{ required: true }]}
            initialValue="城市"
          >
            <Select>
              <Select.Option value="大陆">大陆</Select.Option>
              <Select.Option value="国家">国家</Select.Option>
              <Select.Option value="城市">城市</Select.Option>
              <Select.Option value="村庄">村庄</Select.Option>
              <Select.Option value="森林">森林</Select.Option>
              <Select.Option value="山脉">山脉</Select.Option>
              <Select.Option value="水域">水域</Select.Option>
              <Select.Option value="地下城">地下城</Select.Option>
              <Select.Option value="特殊">特殊</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="parent_id"
            label="上级区域"
          >
            <Select allowClear placeholder="选择上级区域（可选）">
              {regions.map(r => (
                <Select.Option key={r.id} value={r.id}>{r.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="区域描述"
          >
            <TextArea rows={3} placeholder="描述这个区域的特征..." />
          </Form.Item>
          <Form.Item
            name="geography"
            label="地理特征"
          >
            <TextArea rows={2} placeholder="地形、气候、资源等" />
          </Form.Item>
          <Form.Item
            name="climate"
            label="气候类型"
          >
            <Input placeholder="例如：温带季风气候" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// 天体管理组件
const CelestialBodyManagement = ({ worldId }) => {
  const [celestialBodies, setCelestialBodies] = useState([]);
  const [dimensions, setDimensions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBody, setEditingBody] = useState(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bodiesRes, dimsRes] = await Promise.all([
        worldSettingApi.getCelestialBodies(worldId),
        worldSettingApi.getDimensions(worldId),
      ]);
      if (bodiesRes.data.code === 200) {
        setCelestialBodies(bodiesRes.data.data);
      }
      if (dimsRes.data.code === 200) {
        setDimensions(dimsRes.data.data);
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
      // 字段映射转换
      const data = {
        name: values.name,
        world_id: worldId,
        body_type: values.body_type,
        dimension_id: values.dimension_id,
        description: values.description,
        // properties 和 influence 字段需要进一步拆分，暂时直接存储
        size: values.properties || '',
        magical_properties: values.influence || '',
      };
      if (editingBody) {
        await worldSettingApi.updateCelestialBody(editingBody.id, data);
        message.success('天体更新成功');
      } else {
        await worldSettingApi.createCelestialBody(data);
        message.success('天体创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error(editingBody ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await worldSettingApi.deleteCelestialBody(id);
      message.success('删除成功');
      fetchData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '天体名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <StarOutlined style={{ color: record.body_type === '恒星' ? '#faad14' : '#1890ff' }} />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'body_type',
      key: 'body_type',
      render: (type) => {
        const colorMap = {
          '恒星': 'orange',
          '行星': 'blue',
          '卫星': 'cyan',
          '小行星': 'default',
          '彗星': 'purple',
          '星云': 'magenta',
        };
        return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
      },
    },
    {
      title: '所属维度',
      dataIndex: 'dimension_name',
      key: 'dimension_name',
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
              setEditingBody(record);
              // 反向字段映射
              form.setFieldsValue({
                name: record.name,
                body_type: record.body_type,
                dimension_id: record.dimension_id,
                description: record.description,
                properties: record.size || record.mass || record.orbit_period,
                influence: record.magical_properties || record.cultural_significance,
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
            <span>天体管理</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingBody(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            新建天体
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={celestialBodies}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Card>

      <Modal
        title={editingBody ? '编辑天体' : '新建天体'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="天体名称"
            rules={[{ required: true, message: '请输入天体名称' }]}
          >
            <Input placeholder="例如：太阳、艾泽拉斯" />
          </Form.Item>
          <Form.Item
            name="body_type"
            label="天体类型"
            rules={[{ required: true }]}
            initialValue="行星"
          >
            <Select>
              <Select.Option value="恒星">恒星</Select.Option>
              <Select.Option value="行星">行星</Select.Option>
              <Select.Option value="卫星">卫星</Select.Option>
              <Select.Option value="小行星">小行星</Select.Option>
              <Select.Option value="彗星">彗星</Select.Option>
              <Select.Option value="星云">星云</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="dimension_id"
            label="所属维度"
          >
            <Select allowClear placeholder="选择所属维度">
              {dimensions.map(d => (
                <Select.Option key={d.id} value={d.id}>{d.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="天体描述"
          >
            <TextArea rows={3} placeholder="描述这个天体的特征..." />
          </Form.Item>
          <Form.Item
            name="properties"
            label="天体属性"
          >
            <TextArea rows={2} placeholder="大小、质量、轨道周期等" />
          </Form.Item>
          <Form.Item
            name="influence"
            label="对世界的影响"
          >
            <TextArea rows={2} placeholder="例如：魔力潮汐、季节变化" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// 自然法则管理组件
const NaturalLawManagement = ({ worldId }) => {
  const [laws, setLaws] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLaw, setEditingLaw] = useState(null);
  const [form] = Form.useForm();

  const fetchLaws = async () => {
    setLoading(true);
    try {
      const response = await worldSettingApi.getNaturalLaws(worldId);
      if (response.data.code === 200) {
        setLaws(response.data.data);
      }
    } catch (error) {
      message.error('获取自然法则列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (worldId) fetchLaws();
  }, [worldId]);

  const handleSubmit = async (values) => {
    try {
      // 字段映射转换
      const data = {
        name: values.name,
        world_id: worldId,
        law_type: values.law_type,
        description: values.description,
        limitations: values.scope,
        exceptions: values.exceptions,
      };
      if (editingLaw) {
        await worldSettingApi.updateNaturalLaw(editingLaw.id, data);
        message.success('法则更新成功');
      } else {
        await worldSettingApi.createNaturalLaw(data);
        message.success('法则创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchLaws();
    } catch (error) {
      message.error(editingLaw ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await worldSettingApi.deleteNaturalLaw(id);
      message.success('删除成功');
      fetchLaws();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '法则名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <ExperimentOutlined style={{ color: '#52c41a' }} />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: '法则类型',
      dataIndex: 'law_type',
      key: 'law_type',
      render: (type) => <Tag color="green">{type}</Tag>,
    },
    {
      title: '作用范围',
      dataIndex: 'limitations',
      key: 'limitations',
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
              setEditingLaw(record);
              // 反向字段映射
              form.setFieldsValue({
                name: record.name,
                law_type: record.law_type,
                description: record.description,
                scope: record.limitations,
                exceptions: record.exceptions,
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
            <ExperimentOutlined />
            <span>自然法则管理</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingLaw(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            新建法则
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={laws}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Card>

      <Modal
        title={editingLaw ? '编辑法则' : '新建法则'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="法则名称"
            rules={[{ required: true, message: '请输入法则名称' }]}
          >
            <Input placeholder="例如：魔力守恒定律" />
          </Form.Item>
          <Form.Item
            name="law_type"
            label="法则类型"
            rules={[{ required: true }]}
            initialValue="物理法则"
          >
            <Select>
              <Select.Option value="物理法则">物理法则</Select.Option>
              <Select.Option value="魔法法则">魔法法则</Select.Option>
              <Select.Option value="生命法则">生命法则</Select.Option>
              <Select.Option value="时间法则">时间法则</Select.Option>
              <Select.Option value="空间法则">空间法则</Select.Option>
              <Select.Option value="因果法则">因果法则</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="法则描述"
          >
            <TextArea rows={3} placeholder="描述这个法则的内容..." />
          </Form.Item>
          <Form.Item
            name="scope"
            label="作用范围"
          >
            <Input placeholder="例如：全宇宙、主物质界" />
          </Form.Item>
          <Form.Item
            name="exceptions"
            label="例外情况"
          >
            <TextArea rows={2} placeholder="该法则的例外或限制" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// 世界架构主组件
const WorldArchitecture = ({ worldId }) => {
  const [activeTab, setActiveTab] = useState('dimensions');
  const [stats, setStats] = useState({
    dimensions: 0,
    regions: 0,
    celestialBodies: 0,
    naturalLaws: 0,
  });

  useEffect(() => {
    if (worldId) {
      // 获取统计数据
      Promise.all([
        worldSettingApi.getDimensions(worldId),
        worldSettingApi.getRegions(worldId),
        worldSettingApi.getCelestialBodies(worldId),
        worldSettingApi.getNaturalLaws(worldId),
      ]).then(([dims, regions, bodies, laws]) => {
        setStats({
          dimensions: dims.data.data?.length || 0,
          regions: regions.data.data?.length || 0,
          celestialBodies: bodies.data.data?.length || 0,
          naturalLaws: laws.data.data?.length || 0,
        });
      });
    }
  }, [worldId]);

  const tabItems = [
    {
      key: 'dimensions',
      label: '维度/位面',
      children: <DimensionManagement worldId={worldId} />,
    },
    {
      key: 'regions',
      label: '地理区域',
      children: <RegionManagement worldId={worldId} />,
    },
    {
      key: 'celestial',
      label: '天体',
      children: <CelestialBodyManagement worldId={worldId} />,
    },
    {
      key: 'laws',
      label: '自然法则',
      children: <NaturalLawManagement worldId={worldId} />,
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="维度数量"
              value={stats.dimensions}
              prefix={<GlobalOutlined />}
              styles={{ content: { color: '#1890ff'  } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="区域数量"
              value={stats.regions}
              prefix={<ApartmentOutlined />}
              styles={{ content: { color: '#52c41a'  } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="天体数量"
              value={stats.celestialBodies}
              prefix={<StarOutlined />}
              styles={{ content: { color: '#faad14'  } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="自然法则"
              value={stats.naturalLaws}
              prefix={<ExperimentOutlined />}
              styles={{ content: { color: '#722ed1'  } }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </div>
  );
};

export default WorldArchitecture;

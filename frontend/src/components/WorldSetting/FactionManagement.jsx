import React, { useState, useEffect } from 'react';
import {
  Card, Button, Table, Modal, Form, Input, Select,
  message, Space, Tag, Empty, Tabs, Row, Col, Statistic, Descriptions, InputNumber
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  TeamOutlined, CrownOutlined, SafetyOutlined,
  GlobalOutlined, InfoCircleOutlined, ApartmentOutlined,
  AimOutlined, ThunderboltOutlined, BankOutlined, FlagOutlined
} from '@ant-design/icons';
import { factionApi } from '../../services/api';

const { TextArea } = Input;

// 组织概况管理组件
const FactionOverviewManagement = ({ worldId, projectId }) => {
  const [factions, setFactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFaction, setEditingFaction] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedFaction, setSelectedFaction] = useState(null);
  const [form] = Form.useForm();

  const fetchFactions = async () => {
    setLoading(true);
    try {
      const response = await factionApi.getFactions(projectId, worldId);
      const data = response.data || [];
      setFactions(data);
    } catch (error) {
      message.error('获取势力列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (worldId) fetchFactions();
  }, [worldId, projectId]);

  const handleSubmit = async (values) => {
    try {
      // 字段映射转换 - 完整数据库字段
      const data = {
        name: values.name,
        world_id: worldId,
        project_id: projectId,
        faction_type: values.faction_type,
        description: values.description,
        core_ideology: values.core_ideology,
        member_size: values.member_size,
        headquarters_location: values.headquarters_location,
        leader: values.leader,
        influence_level: values.influence_level || 50,
        territory_control: values.territory_control,
        economic_strength: values.economic_strength,
        military_strength: values.military_strength,
        diplomatic_relations: values.diplomatic_relations,
        internal_structure: values.internal_structure,
        founding_date: values.founding_date,
        historical_events: values.historical_events,
        current_status: values.current_status,
      };
      if (editingFaction) {
        await factionApi.updateFaction(editingFaction.id, data);
        message.success('势力更新成功');
      } else {
        await factionApi.createFaction(data);
        message.success('势力创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchFactions();
    } catch (error) {
      message.error(editingFaction ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await factionApi.deleteFaction(id);
      message.success('删除成功');
      fetchFactions();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const showDetail = (record) => {
    setSelectedFaction(record);
    setDetailVisible(true);
  };

  const columns = [
    {
      title: '势力名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <TeamOutlined style={{ color: record.faction_type === '国家' || record.faction_type === '帝国' ? '#1890ff' : '#52c41a' }} />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'faction_type',
      key: 'faction_type',
      render: (type) => {
        const colorMap = {
          '国家': 'blue',
          '王国': 'blue',
          '帝国': 'purple',
          '城邦': 'cyan',
          '部落': 'orange',
          '公会': 'green',
          '教派': 'magenta',
          '家族': 'gold',
          '商会': 'geekblue',
          '军队': 'red',
          '联盟': 'lime',
        };
        return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
      },
    },
    {
      title: '影响力',
      dataIndex: 'influence_level',
      key: 'influence_level',
      render: (level) => level ? (
        <Tag color={level >= 80 ? 'red' : level >= 50 ? 'orange' : level >= 30 ? 'blue' : 'default'}>
          {level}/100
        </Tag>
      ) : '-',
    },
    {
      title: '领袖',
      dataIndex: 'leader',
      key: 'leader',
      render: (leader) => leader || '-',
    },
    {
      title: '总部',
      dataIndex: 'headquarters_location',
      key: 'headquarters_location',
      render: (location) => location || '-',
    },
    {
      title: '当前状态',
      dataIndex: 'current_status',
      key: 'current_status',
      render: (status) => status || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<InfoCircleOutlined />}
            onClick={() => showDetail(record)}
          >
            详情
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingFaction(record);
              // 反向字段映射
              form.setFieldsValue({
                name: record.name,
                faction_type: record.faction_type,
                leader: record.leader,
                headquarters_location: record.headquarters_location,
                member_size: record.member_size,
                influence_level: record.influence_level,
                description: record.description,
                core_ideology: record.core_ideology,
                territory_control: record.territory_control,
                economic_strength: record.economic_strength,
                military_strength: record.military_strength,
                diplomatic_relations: record.diplomatic_relations,
                internal_structure: record.internal_structure,
                founding_date: record.founding_date,
                historical_events: record.historical_events,
                current_status: record.current_status,
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

  // 表单标签页配置
  const formTabItems = [
    {
      key: 'basic',
      label: '基本信息',
      children: (
        <>
          <Form.Item
            name="name"
            label="势力名称"
            rules={[{ required: true, message: '请输入势力名称' }]}
          >
            <Input placeholder="例如：暴风王国、银色黎明" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="faction_type"
                label="势力类型"
                rules={[{ required: true }]}
                initialValue="国家"
              >
                <Select>
                  <Select.Option value="国家">国家</Select.Option>
                  <Select.Option value="王国">王国</Select.Option>
                  <Select.Option value="帝国">帝国</Select.Option>
                  <Select.Option value="城邦">城邦</Select.Option>
                  <Select.Option value="部落">部落</Select.Option>
                  <Select.Option value="公会">公会</Select.Option>
                  <Select.Option value="教派">教派</Select.Option>
                  <Select.Option value="家族">家族</Select.Option>
                  <Select.Option value="商会">商会</Select.Option>
                  <Select.Option value="军队">军队</Select.Option>
                  <Select.Option value="联盟">联盟</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="current_status" label="当前状态">
                <Input placeholder="例如：兴盛、衰落、战争状态" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="leader" label="领袖">
                <Input placeholder="势力领袖名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="headquarters_location" label="总部地点">
                <Input placeholder="例如：暴风城" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="势力描述">
            <TextArea rows={3} placeholder="描述这个势力的基本情况..." />
          </Form.Item>
        </>
      ),
    },
    {
      key: 'ideology',
      label: '理念规模',
      children: (
        <>
          <Form.Item name="core_ideology" label="核心意识形态">
            <TextArea rows={3} placeholder="该势力的信仰、理念、目标、价值观" />
          </Form.Item>
          <Form.Item name="member_size" label="成员规模">
            <Input placeholder="例如：10万人、500名精英" />
          </Form.Item>
          <Form.Item
            name="influence_level"
            label="影响力等级"
            initialValue={50}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="0-100，数值越高影响力越大" />
          </Form.Item>
          <Form.Item name="founding_date" label="成立时间">
            <Input placeholder="例如：第一纪元203年" />
          </Form.Item>
        </>
      ),
    },
    {
      key: 'strength',
      label: '实力状况',
      children: (
        <>
          <Form.Item name="territory_control" label="控制领土">
            <TextArea rows={2} placeholder="势力控制的地理范围、重要据点" />
          </Form.Item>
          <Form.Item name="economic_strength" label="经济实力">
            <TextArea rows={2} placeholder="经济来源、财富状况、资源控制" />
          </Form.Item>
          <Form.Item name="military_strength" label="军事实力">
            <TextArea rows={2} placeholder="军队规模、装备水平、战斗能力" />
          </Form.Item>
          <Form.Item name="internal_structure" label="内部结构">
            <TextArea rows={3} placeholder="组织架构、等级制度、部门分工" />
          </Form.Item>
        </>
      ),
    },
    {
      key: 'relations',
      label: '关系历史',
      children: (
        <>
          <Form.Item name="diplomatic_relations" label="外交关系">
            <TextArea rows={4} placeholder="与其他势力的关系：盟友、敌对、中立等" />
          </Form.Item>
          <Form.Item name="historical_events" label="重大历史事件">
            <TextArea rows={4} placeholder="该势力经历的重要历史事件和发展历程" />
          </Form.Item>
        </>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={
          <Space>
            <TeamOutlined />
            <span>组织势力</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingFaction(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            新建势力
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={factions}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Card>

      {/* 创建/编辑模态框 */}
      <Modal
        title={editingFaction ? '编辑势力' : '新建势力'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={800}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Tabs items={formTabItems} />
        </Form>
      </Modal>

      {/* 详情抽屉 */}
      <Modal
        title="势力详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {selectedFaction && (
          <Tabs
            items={[
              {
                key: 'basic',
                label: '基本信息',
                children: (
                  <Descriptions column={2} bordered size="small">
                    <Descriptions.Item label="名称" span={2}>
                      <strong style={{ fontSize: 16 }}>{selectedFaction.name}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="类型">
                      <Tag color="blue">{selectedFaction.faction_type}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="当前状态">
                      {selectedFaction.current_status || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="领袖">
                      {selectedFaction.leader || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="总部">
                      {selectedFaction.headquarters_location || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="成立时间">
                      {selectedFaction.founding_date || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="描述" span={2}>
                      {selectedFaction.description || '-'}
                    </Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: 'ideology',
                label: '理念规模',
                children: (
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="核心意识形态">
                      {selectedFaction.core_ideology || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="成员规模">
                      {selectedFaction.member_size || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="影响力等级">
                      {selectedFaction.influence_level ? (
                        <Tag color={selectedFaction.influence_level >= 80 ? 'red' : selectedFaction.influence_level >= 50 ? 'orange' : 'default'}>
                          {selectedFaction.influence_level}/100
                        </Tag>
                      ) : '-'}
                    </Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: 'strength',
                label: '实力状况',
                children: (
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="控制领土">
                      {selectedFaction.territory_control || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="经济实力">
                      {selectedFaction.economic_strength || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="军事实力">
                      {selectedFaction.military_strength || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="内部结构">
                      {selectedFaction.internal_structure || '-'}
                    </Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: 'relations',
                label: '关系历史',
                children: (
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="外交关系">
                      {selectedFaction.diplomatic_relations || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="重大历史事件">
                      {selectedFaction.historical_events || '-'}
                    </Descriptions.Item>
                  </Descriptions>
                ),
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
};

// 组织结构管理组件
const FactionStructureManagement = ({ worldId, projectId }) => {
  const [structure, setStructure] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 这里可以加载组织结构数据
  }, [worldId]);

  return (
    <Card title="组织结构树">
      <Empty description="组织结构功能开发中..." />
    </Card>
  );
};

// 组织势力管理主组件
const FactionManagement = ({ worldId, projectId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    total: 0,
    nations: 0,
    guilds: 0,
    religions: 0,
  });

  useEffect(() => {
    if (worldId) {
      factionApi.getFactions(projectId, worldId).then((response) => {
        const data = response.data || [];
        setStats({
          total: data.length,
          nations: data.filter(f => ['国家', '王国', '帝国', '城邦'].includes(f.faction_type)).length,
          guilds: data.filter(f => ['公会', '商会', '家族'].includes(f.faction_type)).length,
          religions: data.filter(f => ['教派'].includes(f.faction_type)).length,
        });
      });
    }
  }, [worldId, projectId]);

  const tabItems = [
    {
      key: 'overview',
      label: '组织概况',
      children: <FactionOverviewManagement worldId={worldId} projectId={projectId} />,
    },
    {
      key: 'structure',
      label: '组织结构',
      children: <FactionStructureManagement worldId={worldId} projectId={projectId} />,
    },
    {
      key: 'goals',
      label: '能力与目标',
      children: <Empty description="能力与目标功能开发中..." />,
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="势力总数"
              value={stats.total}
              prefix={<TeamOutlined />}
              styles={{ content: { color: '#1890ff' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="国家/政权"
              value={stats.nations}
              prefix={<CrownOutlined />}
              styles={{ content: { color: '#faad14' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="公会/组织"
              value={stats.guilds}
              prefix={<ApartmentOutlined />}
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="宗教/教派"
              value={stats.religions}
              prefix={<SafetyOutlined />}
              styles={{ content: { color: '#722ed1' } }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </div>
  );
};

export default FactionManagement;

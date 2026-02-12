import React, { useState, useEffect, useCallback } from 'react';
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
const FactionOverviewManagement = ({ worldId, projectId, quickCreateTarget, onUpdate, onRefresh }) => {
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

  // 响应快速创建
  useEffect(() => {
    if (quickCreateTarget) {
      showModal();
    }
  }, [quickCreateTarget]);

  // 编辑时设置表单值
  useEffect(() => {
    if (modalVisible && editingFaction) {
      form.setFieldsValue({
        name: editingFaction.name,
        faction_type: editingFaction.faction_type,
        faction_status: editingFaction.faction_status,
        leader: editingFaction.leader,
        headquarters_location: editingFaction.headquarters_location,
        member_size: editingFaction.member_size,
        influence_level: editingFaction.influence_level,
        description: editingFaction.description,
        core_ideology: editingFaction.core_ideology,
        sphere_of_influence: editingFaction.sphere_of_influence,
        establishment_time: editingFaction.establishment_time,
        economic_strength: editingFaction.economic_strength,
        leadership_system: editingFaction.leadership_system,
        hierarchy: editingFaction.hierarchy,
        department_setup: editingFaction.department_setup,
        decision_mechanism: editingFaction.decision_mechanism,
        key_members: editingFaction.key_members,
        talent_reserve: editingFaction.talent_reserve,
        defectors: editingFaction.defectors,
        recruitment_method: editingFaction.recruitment_method,
        training_system: editingFaction.training_system,
        disciplinary_rules: editingFaction.disciplinary_rules,
        promotion_path: editingFaction.promotion_path,
        special_abilities: editingFaction.special_abilities,
        heritage_system: editingFaction.heritage_system,
        resource_reserves: editingFaction.resource_reserves,
        intelligence_network: editingFaction.intelligence_network,
        short_term_goals: editingFaction.short_term_goals,
        medium_term_plans: editingFaction.medium_term_plans,
        long_term_vision: editingFaction.long_term_vision,
        secret_plans: editingFaction.secret_plans,
        ally_relationships: editingFaction.ally_relationships,
        enemy_relationships: editingFaction.enemy_relationships,
        subordinate_relationships: editingFaction.subordinate_relationships,
        neutral_relationships: editingFaction.neutral_relationships,
      });
    }
  }, [modalVisible, editingFaction, form]);

  const handleSubmit = async (values) => {
    try {
      // 字段映射转换 - 与后端数据库字段保持一致
      // 过滤掉 undefined 值，确保所有字段都有正确的类型
      const data = {
        name: values.name,
        world_id: worldId,
        project_id: projectId,
        faction_type: values.faction_type || '国家',
        description: values.description || '',
        faction_status: values.faction_status || '活跃',
        core_ideology: values.core_ideology || '',
        sphere_of_influence: values.sphere_of_influence || '',
        influence_level: values.influence_level || '区域',
        establishment_time: values.establishment_time || '',
        member_size: values.member_size || '',
        headquarters_location: values.headquarters_location || '',
        economic_strength: values.economic_strength || '',
        leadership_system: values.leadership_system || '',
        hierarchy: values.hierarchy || '',
        department_setup: values.department_setup || '',
        decision_mechanism: values.decision_mechanism || '',
        leader: values.leader || '',
        key_members: values.key_members || '',
        talent_reserve: values.talent_reserve || '',
        defectors: values.defectors || '',
        recruitment_method: values.recruitment_method || '',
        training_system: values.training_system || '',
        disciplinary_rules: values.disciplinary_rules || '',
        promotion_path: values.promotion_path || '',
        special_abilities: values.special_abilities || '',
        heritage_system: values.heritage_system || '',
        resource_reserves: values.resource_reserves || '',
        intelligence_network: values.intelligence_network || '',
        short_term_goals: values.short_term_goals || '',
        medium_term_plans: values.medium_term_plans || '',
        long_term_vision: values.long_term_vision || '',
        secret_plans: values.secret_plans || '',
        ally_relationships: values.ally_relationships || '',
        enemy_relationships: values.enemy_relationships || '',
        subordinate_relationships: values.subordinate_relationships || '',
        neutral_relationships: values.neutral_relationships || '',
      };
      console.log('提交数据:', data);
      if (editingFaction) {
        await factionApi.updateFaction(editingFaction.id, data);
        message.success('势力更新成功');
      } else {
        await factionApi.createFaction(data);
        message.success('势力创建成功');
      }
      setModalVisible(false);
      setEditingFaction(null);
      fetchFactions();
      if (onUpdate) onUpdate();
      if (onRefresh) onRefresh();
    } catch (error) {
      message.error(editingFaction ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await factionApi.deleteFaction(id);
      message.success('删除成功');
      fetchFactions();
      if (onUpdate) onUpdate();
      if (onRefresh) onRefresh();
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
        <Tag color={level === '世界' ? 'red' : level === '大陆' ? 'orange' : level === '国家' ? 'blue' : 'default'}>
          {level}
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
      dataIndex: 'faction_status',
      key: 'faction_status',
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
              <Form.Item name="faction_status" label="当前状态" initialValue="活跃">
                <Select>
                  <Select.Option value="活跃">活跃</Select.Option>
                  <Select.Option value="衰落">衰落</Select.Option>
                  <Select.Option value="兴盛">兴盛</Select.Option>
                  <Select.Option value="战争状态">战争状态</Select.Option>
                  <Select.Option value="潜伏">潜伏</Select.Option>
                  <Select.Option value="解散">解散</Select.Option>
                </Select>
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
            initialValue="区域"
          >
            <Select>
              <Select.Option value="局部">局部</Select.Option>
              <Select.Option value="区域">区域</Select.Option>
              <Select.Option value="国家">国家</Select.Option>
              <Select.Option value="大陆">大陆</Select.Option>
              <Select.Option value="世界">世界</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="establishment_time" label="成立时间">
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
          <Form.Item name="sphere_of_influence" label="势力范围">
            <TextArea rows={2} placeholder="势力控制的地理范围、重要据点" />
          </Form.Item>
          <Form.Item name="economic_strength" label="经济实力">
            <TextArea rows={2} placeholder="经济来源、财富状况、资源控制" />
          </Form.Item>
          <Form.Item name="leadership_system" label="领导体制">
            <TextArea rows={2} placeholder="领导制度、权力结构" />
          </Form.Item>
          <Form.Item name="hierarchy" label="等级制度">
            <TextArea rows={2} placeholder="内部等级划分、晋升体系" />
          </Form.Item>
          <Form.Item name="department_setup" label="部门设置">
            <TextArea rows={2} placeholder="组织架构、部门分工" />
          </Form.Item>
          <Form.Item name="decision_mechanism" label="决策机制">
            <TextArea rows={2} placeholder="重大决策的制定流程" />
          </Form.Item>
        </>
      ),
    },
    {
      key: 'relations',
      label: '关系历史',
      children: (
        <>
          <Form.Item name="ally_relationships" label="盟友关系">
            <TextArea rows={3} placeholder="与其他势力的盟友关系" />
          </Form.Item>
          <Form.Item name="enemy_relationships" label="敌对关系">
            <TextArea rows={3} placeholder="与其他势力的敌对关系" />
          </Form.Item>
          <Form.Item name="neutral_relationships" label="中立关系">
            <TextArea rows={3} placeholder="与其他势力的中立关系" />
          </Form.Item>
          <Form.Item name="subordinate_relationships" label="从属关系">
            <TextArea rows={3} placeholder="与其他势力的从属或统属关系" />
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
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={800}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} preserve={false}>
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
                      {selectedFaction.faction_status || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="领袖">
                      {selectedFaction.leader || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="总部">
                      {selectedFaction.headquarters_location || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="成立时间">
                      {selectedFaction.establishment_time || '-'}
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
                        <Tag color={selectedFaction.influence_level === '世界' ? 'red' : selectedFaction.influence_level === '大陆' ? 'orange' : 'default'}>
                          {selectedFaction.influence_level}
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
                    <Descriptions.Item label="势力范围">
                      {selectedFaction.sphere_of_influence || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="经济实力">
                      {selectedFaction.economic_strength || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="领导体制">
                      {selectedFaction.leadership_system || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="等级制度">
                      {selectedFaction.hierarchy || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="部门设置">
                      {selectedFaction.department_setup || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="决策机制">
                      {selectedFaction.decision_mechanism || '-'}
                    </Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: 'relations',
                label: '关系历史',
                children: (
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="盟友关系">
                      {selectedFaction.ally_relationships || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="敌对关系">
                      {selectedFaction.enemy_relationships || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="中立关系">
                      {selectedFaction.neutral_relationships || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="从属关系">
                      {selectedFaction.subordinate_relationships || '-'}
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
const FactionManagement = ({ worldId, projectId, quickCreateTarget, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    total: 0,
    nations: 0,
    guilds: 0,
    religions: 0,
  });

  const loadStats = useCallback(() => {
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

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const tabItems = [
    {
      key: 'overview',
      label: '组织概况',
      children: <FactionOverviewManagement worldId={worldId} projectId={projectId} quickCreateTarget={quickCreateTarget} onUpdate={onUpdate} onRefresh={loadStats} />,
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

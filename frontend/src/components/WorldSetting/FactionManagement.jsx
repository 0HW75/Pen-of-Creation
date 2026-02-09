import React, { useState, useEffect } from 'react';
import {
  Card, Button, Table, Modal, Form, Input, Select, Tree,
  message, Space, Tag, Empty, Tabs, Row, Col, Statistic, Descriptions, Progress
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  TeamOutlined, CrownOutlined, SafetyOutlined,
  GlobalOutlined, InfoCircleOutlined, ApartmentOutlined,
  AimOutlined, ThunderboltOutlined
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
      const data = { ...values, world_id: worldId, project_id: projectId };
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
          <TeamOutlined style={{ color: record.faction_type === '国家' ? '#1890ff' : '#52c41a' }} />
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
      title: '阵营',
      dataIndex: 'alignment',
      key: 'alignment',
      render: (alignment) => {
        const colorMap = {
          '守序善良': 'blue',
          '中立善良': 'cyan',
          '混乱善良': 'geekblue',
          '守序中立': 'green',
          '绝对中立': 'default',
          '混乱中立': 'lime',
          '守序邪恶': 'orange',
          '中立邪恶': 'gold',
          '混乱邪恶': 'red',
        };
        return alignment ? <Tag color={colorMap[alignment]}>{alignment}</Tag> : '-';
      },
    },
    {
      title: '影响力',
      dataIndex: 'influence_level',
      key: 'influence_level',
      render: (level) => level ? <Progress percent={level} size="small" /> : '-',
    },
    {
      title: '成员规模',
      dataIndex: 'member_count',
      key: 'member_count',
      render: (count) => count || '-',
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
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
              <Form.Item name="alignment" label="阵营倾向">
                <Select placeholder="选择阵营">
                  <Select.Option value="守序善良">守序善良</Select.Option>
                  <Select.Option value="中立善良">中立善良</Select.Option>
                  <Select.Option value="混乱善良">混乱善良</Select.Option>
                  <Select.Option value="守序中立">守序中立</Select.Option>
                  <Select.Option value="绝对中立">绝对中立</Select.Option>
                  <Select.Option value="混乱中立">混乱中立</Select.Option>
                  <Select.Option value="守序邪恶">守序邪恶</Select.Option>
                  <Select.Option value="中立邪恶">中立邪恶</Select.Option>
                  <Select.Option value="混乱邪恶">混乱邪恶</Select.Option>
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
              <Form.Item name="headquarters" label="总部地点">
                <Input placeholder="例如：暴风城" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="member_count" label="成员规模">
                <Input placeholder="例如：10万人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="influence_level" label="影响力等级">
                <Input type="number" min={0} max={100} placeholder="0-100" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="势力描述">
            <TextArea rows={3} placeholder="描述这个势力的基本情况..." />
          </Form.Item>
          <Form.Item name="ideology" label="意识形态">
            <TextArea rows={2} placeholder="该势力的信仰、理念、目标" />
          </Form.Item>
          <Form.Item name="history" label="历史背景">
            <TextArea rows={2} placeholder="势力的成立背景和发展历史" />
          </Form.Item>
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
        width={600}
      >
        {selectedFaction && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="名称" span={2}>
              {selectedFaction.name}
            </Descriptions.Item>
            <Descriptions.Item label="类型">
              <Tag color="blue">{selectedFaction.faction_type}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="阵营">
              {selectedFaction.alignment ? <Tag>{selectedFaction.alignment}</Tag> : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="领袖">
              {selectedFaction.leader || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="总部">
              {selectedFaction.headquarters || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="成员规模">
              {selectedFaction.member_count || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="影响力" span={2}>
              {selectedFaction.influence_level ? (
                <Progress percent={parseInt(selectedFaction.influence_level)} />
              ) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="描述" span={2}>
              {selectedFaction.description || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="意识形态" span={2}>
              {selectedFaction.ideology || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="历史背景" span={2}>
              {selectedFaction.history || '-'}
            </Descriptions.Item>
          </Descriptions>
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
              styles={{ content: { color: '#1890ff'  } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="国家/政权"
              value={stats.nations}
              prefix={<CrownOutlined />}
              styles={{ content: { color: '#faad14'  } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="公会/组织"
              value={stats.guilds}
              prefix={<ApartmentOutlined />}
              styles={{ content: { color: '#52c41a'  } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="宗教/教派"
              value={stats.religions}
              prefix={<SafetyOutlined />}
              styles={{ content: { color: '#722ed1'  } }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </div>
  );
};

export default FactionManagement;

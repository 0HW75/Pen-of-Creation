import React, { useState, useEffect } from 'react';
import {
  Card, Button, Table, Modal, Form, Input, Select, Tag, message, Space, Row, Col, Empty
} from 'antd';
import { StarOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { worldSettingApi } from '../../../services/api';

const { TextArea } = Input;

const CelestialBodyManagement = ({ worldId, onRefresh }) => {
  const [celestialBodies, setCelestialBodies] = useState([]);
  const [dimensions, setDimensions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBody, setEditingBody] = useState(null);
  const [selectedBody, setSelectedBody] = useState(null);
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
      const data = {
        name: values.name,
        world_id: worldId,
        body_type: values.body_type,
        dimension_id: values.dimension_id,
        description: values.description,
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
      if (onRefresh) onRefresh();
    } catch (error) {
      message.error(editingBody ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await worldSettingApi.deleteCelestialBody(id);
      message.success('删除成功');
      fetchData();
      if (onRefresh) onRefresh();
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
            onClick={(e) => {
              e.stopPropagation();
              setEditingBody(record);
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
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(record.id);
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const expandedRowRender = (record) => (
    <div style={{ margin: 0, padding: '12px 24px', backgroundColor: '#fafafa' }}>
      <Row gutter={[16, 8]}>
        <Col span={24}>
          <strong>描述：</strong>
          <span>{record.description || '暂无描述'}</span>
        </Col>
        <Col span={12}>
          <strong>天体属性：</strong>
          <span>{record.size || record.mass || '暂无'}</span>
        </Col>
        <Col span={12}>
          <strong>对世界的影响：</strong>
          <span>{record.magical_properties || '暂无'}</span>
        </Col>
      </Row>
    </div>
  );

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
        {celestialBodies.length === 0 ? (
          <Empty
            description={
              <span>
                暂无天体数据<br />
                点击右上角"新建天体"按钮创建
              </span>
            }
          />
        ) : (
          <>
            <Table
              columns={columns}
              dataSource={celestialBodies}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 5 }}
              size="small"
              expandable={{
                expandedRowRender,
                rowExpandable: (record) => record.description || record.size || record.magical_properties,
              }}
              onRow={(record) => ({
                onClick: () => setSelectedBody(record),
                style: { cursor: 'pointer' }
              })}
            />
            {selectedBody && (
              <Card
                size="small"
                title={`天体详情：${selectedBody.name}`}
                style={{ marginTop: 16, backgroundColor: '#fff7e6' }}
              >
                <Row gutter={[16, 8]}>
                  <Col span={8}>
                    <strong>类型：</strong>
                    <Tag color={
                      selectedBody.body_type === '恒星' ? 'orange' :
                      selectedBody.body_type === '行星' ? 'blue' :
                      selectedBody.body_type === '卫星' ? 'cyan' :
                      selectedBody.body_type === '彗星' ? 'purple' :
                      'default'
                    }>{selectedBody.body_type}</Tag>
                  </Col>
                  <Col span={8}>
                    <strong>所属维度：</strong>
                    {selectedBody.dimension_name || '-'}
                  </Col>
                  <Col span={8}>
                    <strong>天体属性：</strong>
                    {selectedBody.size || '暂无'}
                  </Col>
                  <Col span={24}>
                    <strong>描述：</strong>
                    {selectedBody.description || '暂无描述'}
                  </Col>
                  <Col span={24}>
                    <strong>对世界的影响：</strong>
                    {selectedBody.magical_properties || '暂无'}
                  </Col>
                </Row>
              </Card>
            )}
          </>
        )}
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

export default CelestialBodyManagement;

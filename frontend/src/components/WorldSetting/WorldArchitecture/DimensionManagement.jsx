import React, { useState, useEffect } from 'react';
import {
  Card, Button, Table, Modal, Form, Input, Select, Tag, message, Space, Row, Col, Empty
} from 'antd';
import { GlobalOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { worldSettingApi } from '../../../services/api';

const { TextArea } = Input;

const DimensionManagement = ({ worldId, onRefresh }) => {
  const [dimensions, setDimensions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDimension, setEditingDimension] = useState(null);
  const [selectedDimension, setSelectedDimension] = useState(null);
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
      if (onRefresh) onRefresh();
    } catch (error) {
      message.error(editingDimension ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await worldSettingApi.deleteDimension(id);
      if (onRefresh) onRefresh();
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
      render: (type) => {
        const colorMap = {
          '主维度': 'blue',
          '平行维度': 'purple',
          '子维度': 'cyan',
          '口袋维度': 'green',
          '虚空': 'default',
        };
        return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
      },
    },
    {
      title: '访问方式',
      dataIndex: 'entry_conditions',
      key: 'entry_conditions',
      ellipsis: true,
      render: (text) => text || '-',
    },
    {
      title: '时间流速',
      dataIndex: 'time_flow',
      key: 'time_flow',
      render: (ratio) => ratio || '1:1',
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
              setEditingDimension(record);
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
          <strong>物理特性：</strong>
          <span>{record.physical_properties || '暂无'}</span>
        </Col>
        <Col span={12}>
          <strong>进入条件：</strong>
          <span>{record.entry_conditions || '暂无'}</span>
        </Col>
      </Row>
    </div>
  );

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
        {dimensions.length === 0 ? (
          <Empty
            description={
              <span>
                暂无维度数据<br />
                点击右上角"新建维度"按钮创建
              </span>
            }
          />
        ) : (
          <>
            <Table
              columns={columns}
              dataSource={dimensions}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 5 }}
              size="small"
              expandable={{
                expandedRowRender,
                rowExpandable: (record) => record.description || record.physical_properties || record.entry_conditions,
              }}
              onRow={(record) => ({
                onClick: () => setSelectedDimension(record),
                style: { cursor: 'pointer' }
              })}
            />
            {selectedDimension && (
              <Card
                size="small"
                title={`维度详情：${selectedDimension.name}`}
                style={{ marginTop: 16, backgroundColor: '#f6ffed' }}
              >
                <Row gutter={[16, 8]}>
                  <Col span={8}><strong>类型：</strong>{selectedDimension.dimension_type}</Col>
                  <Col span={8}><strong>时间流速：</strong>{selectedDimension.time_flow || '1:1'}</Col>
                  <Col span={8}><strong>访问方式：</strong>{selectedDimension.entry_conditions || '暂无'}</Col>
                  <Col span={24}><strong>物理特性：</strong>{selectedDimension.physical_properties || '暂无'}</Col>
                  <Col span={24}><strong>描述：</strong>{selectedDimension.description || '暂无描述'}</Col>
                </Row>
              </Card>
            )}
          </>
        )}
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

export default DimensionManagement;

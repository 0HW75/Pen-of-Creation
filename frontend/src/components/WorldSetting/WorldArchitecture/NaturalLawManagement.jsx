import React, { useState, useEffect } from 'react';
import {
  Card, Button, Table, Modal, Form, Input, Select, Tag, message, Space, Row, Col, Empty
} from 'antd';
import { ExperimentOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { worldSettingApi } from '../../../services/api';

const { TextArea } = Input;

const NaturalLawManagement = ({ worldId, onRefresh }) => {
  const [laws, setLaws] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLaw, setEditingLaw] = useState(null);
  const [selectedLaw, setSelectedLaw] = useState(null);
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
      if (onRefresh) onRefresh();
    } catch (error) {
      message.error(editingLaw ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await worldSettingApi.deleteNaturalLaw(id);
      message.success('删除成功');
      fetchLaws();
      if (onRefresh) onRefresh();
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
      render: (type) => {
        const colorMap = {
          '物理法则': 'blue',
          '魔法法则': 'purple',
          '生命法则': 'green',
          '时间法则': 'cyan',
          '空间法则': 'geekblue',
          '因果法则': 'magenta',
        };
        return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
      },
    },
    {
      title: '作用范围',
      dataIndex: 'limitations',
      key: 'limitations',
      ellipsis: true,
      render: (text) => text || '-',
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
              setEditingLaw(record);
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
          <strong>法则描述：</strong>
          <span>{record.description || '暂无描述'}</span>
        </Col>
        <Col span={12}>
          <strong>作用范围：</strong>
          <span>{record.limitations || '暂无'}</span>
        </Col>
        <Col span={12}>
          <strong>例外情况：</strong>
          <span>{record.exceptions || '暂无'}</span>
        </Col>
      </Row>
    </div>
  );

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
        {laws.length === 0 ? (
          <Empty
            description={
              <span>
                暂无法则数据<br />
                点击右上角"新建法则"按钮创建
              </span>
            }
          />
        ) : (
          <>
            <Table
              columns={columns}
              dataSource={laws}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 5 }}
              size="small"
              expandable={{
                expandedRowRender,
                rowExpandable: (record) => record.description || record.limitations || record.exceptions,
              }}
              onRow={(record) => ({
                onClick: () => setSelectedLaw(record),
                style: { cursor: 'pointer' }
              })}
            />
            {selectedLaw && (
              <Card
                size="small"
                title={`法则详情：${selectedLaw.name}`}
                style={{ marginTop: 16, backgroundColor: '#f6ffed' }}
              >
                <Row gutter={[16, 8]}>
                  <Col span={8}>
                    <strong>类型：</strong>
                    <Tag color={
                      selectedLaw.law_type === '物理法则' ? 'blue' :
                      selectedLaw.law_type === '魔法法则' ? 'purple' :
                      selectedLaw.law_type === '生命法则' ? 'green' :
                      selectedLaw.law_type === '时间法则' ? 'cyan' :
                      selectedLaw.law_type === '空间法则' ? 'geekblue' :
                      selectedLaw.law_type === '因果法则' ? 'magenta' :
                      'default'
                    }>{selectedLaw.law_type}</Tag>
                  </Col>
                  <Col span={8}>
                    <strong>作用范围：</strong>
                    {selectedLaw.limitations || '暂无'}
                  </Col>
                  <Col span={8}>
                    <strong>例外情况：</strong>
                    {selectedLaw.exceptions || '暂无'}
                  </Col>
                  <Col span={24}>
                    <strong>法则描述：</strong>
                    {selectedLaw.description || '暂无描述'}
                  </Col>
                </Row>
              </Card>
            )}
          </>
        )}
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

export default NaturalLawManagement;

import React, { useState, useEffect } from 'react';
import {
  Card, Button, Tree, Modal, Form, Input, Select, Tag, message, Space, Row, Col, Empty
} from 'antd';
import { ApartmentOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { worldSettingApi } from '../../../services/api';

const { TextArea } = Input;

const RegionManagement = ({ worldId, onRefresh }) => {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRegion, setEditingRegion] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
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
      if (onRefresh) onRefresh();
    } catch (error) {
      message.error(editingRegion ? '更新失败' : '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await worldSettingApi.deleteRegion(id);
      message.success('删除成功');
      fetchRegions();
      if (onRefresh) onRefresh();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const treeData = buildTreeData(regions);

  const regionTypeColorMap = {
    '大陆': 'red',
    '国家': 'orange',
    '城市': 'blue',
    '村庄': 'cyan',
    '森林': 'green',
    '山脉': 'geekblue',
    '水域': 'purple',
    '地下城': 'magenta',
    '特殊': 'default',
  };

  return (
    <div>
      <Row gutter={16}>
        <Col span={selectedRegion ? 16 : 24}>
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
                onSelect={(selectedKeys, { node }) => {
                  if (selectedKeys.length > 0) {
                    setSelectedRegion(node);
                  } else {
                    setSelectedRegion(null);
                  }
                }}
                titleRender={(nodeData) => (
                  <Space>
                    <span style={{ fontWeight: selectedRegion?.id === nodeData.id ? 'bold' : 'normal' }}>
                      {nodeData.name}
                    </span>
                    <Tag size="small" color={regionTypeColorMap[nodeData.region_type] || 'default'}>
                      {nodeData.region_type}
                    </Tag>
                    <Space size="small">
                      <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingRegion(nodeData);
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
              <Empty
                description={
                  <span>
                    暂无区域数据<br />
                    点击右上角"新建区域"按钮创建
                  </span>
                }
              />
            )}
          </Card>
        </Col>
        {selectedRegion && (
          <Col span={8}>
            <Card
              size="small"
              title={`区域详情：${selectedRegion.name}`}
              style={{ backgroundColor: '#e6f7ff' }}
            >
              <p><strong>名称：</strong>{selectedRegion.name}</p>
              <p><strong>类型：</strong><Tag color={regionTypeColorMap[selectedRegion.region_type] || 'default'}>{selectedRegion.region_type}</Tag></p>
              <p><strong>描述：</strong>{selectedRegion.description || '暂无描述'}</p>
              <p><strong>地理特征：</strong>{selectedRegion.terrain || '暂无'}</p>
              <p><strong>气候类型：</strong>{selectedRegion.climate || '暂无'}</p>
              <Button type="link" onClick={() => setSelectedRegion(null)}>关闭详情</Button>
            </Card>
          </Col>
        )}
      </Row>

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

export default RegionManagement;

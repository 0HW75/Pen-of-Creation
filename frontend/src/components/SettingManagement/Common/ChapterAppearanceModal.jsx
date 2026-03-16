import React, { useState, useEffect } from 'react';
import { Modal, Table, Button, Tag, Space, Form, Select, Input, message, Popconfirm, Empty, Tooltip, Badge } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, BookOutlined, FileTextOutlined } from '@ant-design/icons';
import { chapterAppearanceApi, chapterApi } from '../../../services/api';

const { Option } = Select;
const { TextArea } = Input;

const APPEARANCE_TYPE_COLORS = {
  '首次出现': '#52c41a',
  '重要事件': '#f5222d',
  '提及': '#1890ff',
  '回忆': '#722ed1',
  '客串': '#faad14',
  '死亡': '#8c8c8c',
};

const ChapterAppearanceModal = ({ visible, entityType, entityId, entityName, projectId, onClose }) => {
  const [appearances, setAppearances] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && entityType && entityId) {
      loadAppearances();
      loadChapters();
    }
  }, [visible, entityType, entityId]);

  const loadAppearances = async () => {
    setLoading(true);
    try {
      const res = await chapterAppearanceApi.getEntityAppearances(entityType, entityId);
      if (res.data.code === 200) {
        setAppearances(res.data.data || []);
      }
    } catch (error) {
      console.error('加载章节出现记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChapters = async () => {
    if (!projectId) return;
    try {
      const res = await chapterApi.getChapters(projectId);
      if (res.data && res.data.data) {
        const chapterList = res.data.data.chapters || res.data.data || [];
        setChapters(chapterList.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)));
      }
    } catch (error) {
      console.error('加载章节列表失败:', error);
    }
  };

  const handleAddAppearance = () => {
    setEditingRecord(null);
    form.resetFields();
    setAddModalVisible(true);
  };

  const handleEditAppearance = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      chapter_id: record.chapter_id,
      appearance_type: record.appearance_type,
      description: record.description,
    });
    setAddModalVisible(true);
  };

  const handleDeleteAppearance = async (id) => {
    try {
      const res = await chapterAppearanceApi.deleteAppearance(id);
      if (res.data.code === 200) {
        message.success('删除成功');
        loadAppearances();
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        chapter_id: values.chapter_id,
        entity_type: entityType,
        entity_id: entityId,
        appearance_type: values.appearance_type || '提及',
        description: values.description || '',
      };

      if (editingRecord) {
        const res = await chapterAppearanceApi.updateAppearance(editingRecord.id, data);
        if (res.data.code === 200) {
          message.success('更新成功');
          setAddModalVisible(false);
          loadAppearances();
        }
      } else {
        const res = await chapterAppearanceApi.createAppearance(data);
        if (res.data.code === 200) {
          message.success('添加成功');
          setAddModalVisible(false);
          loadAppearances();
        }
      }
    } catch (error) {
      message.error(editingRecord ? '更新失败' : '添加失败');
    }
  };

  const getChapterTitle = (chapterId) => {
    const chapter = chapters.find(c => c.id === chapterId);
    return chapter ? chapter.title : '未知章节';
  };

  const columns = [
    {
      title: '章节',
      dataIndex: 'chapter_id',
      key: 'chapter_id',
      render: (chapterId, record) => (
        <Space>
          <FileTextOutlined />
          <span>
            {record.volume && <Tag color="blue" style={{ marginRight: 4 }}>{record.volume}</Tag>}
            {record.chapter_title || getChapterTitle(chapterId)}
          </span>
        </Space>
      ),
    },
    {
      title: '出现类型',
      dataIndex: 'appearance_type',
      key: 'appearance_type',
      width: 120,
      render: (type) => (
        <Tag color={APPEARANCE_TYPE_COLORS[type] || '#999'}>
          {type}
        </Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => text || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditAppearance(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定删除此记录吗？"
            onConfirm={() => handleDeleteAppearance(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const getEntityTypeLabel = () => {
    const labels = {
      character: '角色',
      location: '地点',
      item: '物品',
      faction: '势力',
      civilization: '文明',
      historical_event: '历史事件',
      historical_figure: '历史人物',
      dimension: '维度',
      region: '区域',
      energy_system: '能量体系',
      power_level: '力量等级',
      common_skill: '通用技能',
    };
    return labels[entityType] || entityType;
  };

  const groupByVolume = (data) => {
    const grouped = {};
    data.forEach(item => {
      const key = item.volume || '未分卷';
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });
    return grouped;
  };

  const renderGroupedTable = () => {
    const grouped = groupByVolume(appearances);
    const volumeOrder = chapters.reduce((acc, ch) => {
      if (ch.volume && !acc.includes(ch.volume)) {
        acc.push(ch.volume);
      }
      return acc;
    }, []);

    return Object.entries(grouped).map(([volume, items]) => (
      <div key={volume} style={{ marginBottom: 16 }}>
        {volume !== '未分卷' && (
          <div style={{ marginBottom: 8, fontWeight: 500, color: '#666' }}>
            <BookOutlined style={{ marginRight: 8 }} />
            {volume}
          </div>
        )}
        <Table
          dataSource={items}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={false}
          showHeader={volume === Object.keys(grouped)[0]}
        />
      </div>
    ));
  };

  return (
    <>
      <Modal
        title={
          <Space>
            <BookOutlined />
            <span>章节出现索引</span>
            <Tag color="blue">{getEntityTypeLabel()}</Tag>
            <span style={{ fontWeight: 'normal', color: '#666' }}>
              {entityName}
            </span>
          </Space>
        }
        open={visible}
        onCancel={onClose}
        footer={[
          <Button key="close" onClick={onClose}>
            关闭
          </Button>,
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAddAppearance}>
            添加章节
          </Button>,
        ]}
        width={800}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>加载中...</div>
        ) : appearances.length > 0 ? (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Badge status="processing" text={`共 ${appearances.length} 个章节出现记录`} />
            </div>
            {renderGroupedTable()}
          </div>
        ) : (
          <Empty
            description="暂无章节出现记录"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddAppearance}>
              添加章节
            </Button>
          </Empty>
        )}
      </Modal>

      <Modal
        title={editingRecord ? '编辑章节出现记录' : '添加章节出现记录'}
        open={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onOk={handleSubmit}
        okText="确定"
        cancelText="取消"
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="chapter_id"
            label="选择章节"
            rules={[{ required: true, message: '请选择章节' }]}
          >
            <Select
              placeholder="请选择章节"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {chapters.map(chapter => (
                <Option key={chapter.id} value={chapter.id}>
                  {chapter.volume && `[${chapter.volume}] `}
                  {chapter.title}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="appearance_type"
            label="出现类型"
            initialValue="提及"
          >
            <Select placeholder="请选择出现类型">
              {Object.entries(APPEARANCE_TYPE_COLORS).map(([type, color]) => (
                <Option key={type} value={type}>
                  <Tag color={color} style={{ marginRight: 0 }}>{type}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea
              placeholder="描述该实体在此章节中的出现情况（可选）"
              rows={3}
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ChapterAppearanceModal;

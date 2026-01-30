import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Modal, Form, Input, Select, 
  message, Popconfirm, Space, Card, Typography, 
  InputNumber, Tooltip
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  UpOutlined, DownOutlined, FileTextOutlined 
} from '@ant-design/icons';
import { chapterApi } from '../services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ChapterManagement = ({ projectId, onChapterSelect }) => {
  console.log('ChapterManagement projectId:', projectId);
  
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(null);
  
  // 将 form 实例移到 Modal 内部的组件中

  // 加载章节列表
  const loadChapters = async () => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      const response = await chapterApi.getChapters(projectId);
      setChapters(response.data);
    } catch (error) {
      message.error('加载章节失败，请检查网络连接或后端服务是否正常');
      console.error('Error loading chapters:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChapters();
  }, [projectId]);

  // 创建一个内部组件来包含 Form，这样 form 实例就只会在 Modal 可见时创建
  const ChapterForm = () => {
    const [form] = Form.useForm();
    
    // 当模态框显示且 currentChapter 存在时，设置表单字段的值
    useEffect(() => {
      if (isEditing && currentChapter) {
        form.setFieldsValue(currentChapter);
      } else {
        form.resetFields();
        // 设置默认值
        form.setFieldsValue({
          project_id: projectId,
          status: '未写',
          type: '普通',
          order_index: chapters.length
        });
      }
    }, [isEditing, currentChapter, projectId, chapters.length, form]);
    
    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="title"
          label="章节标题"
          rules={[{ required: true, message: '请输入章节标题' }]}
        >
          <Input placeholder="请输入章节标题" />
        </Form.Item>

        <Form.Item
          name="content"
          label="章节内容"
        >
          <TextArea rows={6} placeholder="请输入章节内容" />
        </Form.Item>

        <Form.Item
          name="status"
          label="章节状态"
        >
          <Select placeholder="请选择章节状态">
            <Select.Option value="未写">未写</Select.Option>
            <Select.Option value="写作中">写作中</Select.Option>
            <Select.Option value="已完成">已完成</Select.Option>
            <Select.Option value="修改中">修改中</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="type"
          label="章节类型"
        >
          <Select placeholder="请选择章节类型">
            <Select.Option value="普通">普通</Select.Option>
            <Select.Option value="序章">序章</Select.Option>
            <Select.Option value="终章">终章</Select.Option>
            <Select.Option value="番外">番外</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="order_index"
          label="排序索引"
          rules={[{ required: true, message: '请输入排序索引' }]}
        >
          <InputNumber min={0} placeholder="请输入排序索引" />
        </Form.Item>

        <Form.Item
          name="project_id"
          hidden
          rules={[{ required: true, message: '缺少项目ID' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item style={{ textAlign: 'right' }}>
          <Button onClick={() => setIsModalVisible(false)} style={{ marginRight: '8px' }}>
            取消
          </Button>
          <Button type="primary" htmlType="submit">
            {isEditing ? '更新' : '创建'}
          </Button>
        </Form.Item>
      </Form>
    );
  };

  // 显示创建/编辑模态框
  const showModal = (chapter = null) => {
    if (chapter) {
      setCurrentChapter(chapter);
      setIsEditing(true);
    } else {
      setCurrentChapter(null);
      setIsEditing(false);
    }
    setIsModalVisible(true);
  };

  // 处理表单提交
  const handleSubmit = async (values) => {
    console.log('handleSubmit called');
    console.log('Form values:', values);
    console.log('Project ID:', projectId);
    console.log('isEditing:', isEditing);
    console.log('currentChapter:', currentChapter);

    if (!projectId) {
      message.error('请先选择项目');
      console.error('projectId is null or undefined');
      return;
    }

    try {
      if (isEditing) {
        console.log('Updating chapter:', currentChapter.id);
        await chapterApi.updateChapter(currentChapter.id, values);
        message.success('章节更新成功');
      } else {
        console.log('Creating chapter');
        // 手动构建包含所有必需字段的对象
        const chapterData = {
          project_id: projectId,
          title: values.title,
          content: values.content || '',
          status: values.status || '未写',
          type: values.type || '普通',
          order_index: chapters.length
        };
        console.log('Chapter data:', chapterData);
        await chapterApi.createChapter(chapterData);
        message.success('章节创建成功');
      }
      setIsModalVisible(false);
      loadChapters();
    } catch (error) {
      message.error(isEditing ? '更新章节失败' : '创建章节失败');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
    }
  };

  // 处理删除章节
  const handleDelete = async (chapterId) => {
    try {
      await chapterApi.deleteChapter(chapterId);
      message.success('章节删除成功');
      loadChapters();
    } catch (error) {
      message.error('删除章节失败');
      console.error('Error deleting chapter:', error);
    }
  };

  // 处理章节排序
  const handleSort = async (chapterId, direction) => {
    const chapterIndex = chapters.findIndex(ch => ch.id === chapterId);
    if (chapterIndex === -1) return;

    const newChapters = [...chapters];
    const newIndex = direction === 'up' ? chapterIndex - 1 : chapterIndex + 1;

    if (newIndex < 0 || newIndex >= newChapters.length) return;

    // 交换顺序
    [newChapters[chapterIndex], newChapters[newIndex]] = [newChapters[newIndex], newChapters[chapterIndex]];

    // 更新order_index
    try {
      setLoading(true);
      for (let i = 0; i < newChapters.length; i++) {
        await chapterApi.updateChapter(newChapters[i].id, { order_index: i });
      }
      message.success('章节排序成功');
      loadChapters();
    } catch (error) {
      message.error('排序失败');
      console.error('Error sorting chapters:', error);
    } finally {
      setLoading(false);
    }
  };

  // 表格列配置
  const columns = [
    {
      title: '顺序',
      dataIndex: 'order_index',
      key: 'order_index',
      width: 80,
      render: (text) => <Text>{text + 1}</Text>,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Text strong onClick={() => onChapterSelect && onChapterSelect(record.id)} style={{ cursor: 'pointer' }}>
          {text}
        </Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (text) => (
        <Text>{text}</Text>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
    },
    {
      title: '字数',
      dataIndex: 'word_count',
      key: 'word_count',
      width: 100,
      render: (text) => <Text>{text} 字</Text>,
    },
    {
      title: '排序',
      key: 'sort',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="上移">
            <Button 
              icon={<UpOutlined />} 
              size="small"
              onClick={() => handleSort(record.id, 'up')}
              disabled={record.order_index === 0}
            />
          </Tooltip>
          <Tooltip title="下移">
            <Button 
              icon={<DownOutlined />} 
              size="small"
              onClick={() => handleSort(record.id, 'down')}
              disabled={record.order_index === chapters.length - 1}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {onChapterSelect && (
            <Button 
              type="default" 
              icon={<FileTextOutlined />}
              onClick={() => onChapterSelect(record.id)}
            >
              选择
            </Button>
          )}
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => showModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个章节吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              danger 
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!projectId) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <Text type="warning" style={{ fontSize: '18px' }}>
              请先选择一个项目，然后再进行章节管理
            </Text>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Title level={2}>章节管理</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            新建章节
          </Button>
        </div>

        <Table 
          columns={columns} 
          dataSource={chapters} 
          rowKey="id" 
          loading={loading}
          pagination={{ 
            pageSize: 10, 
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50']
          }}
          locale={{ emptyText: '暂无章节，请点击"新建章节"按钮创建' }}
        />
      </Card>

      {/* 创建/编辑章节模态框 */}
      <Modal
        title={isEditing ? '编辑章节' : '新建章节'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <ChapterForm />
      </Modal>
    </div>
  );
};

export default ChapterManagement;
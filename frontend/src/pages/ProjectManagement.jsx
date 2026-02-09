import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Modal, Form, Input, Select, 
  message, Popconfirm, Space, Card, Typography, 
  Tabs, Radio, Divider
} from 'antd';

const { TextArea } = Input;
import { PlusOutlined, EditOutlined, DeleteOutlined, FileOutlined } from '@ant-design/icons';
import { projectApi } from '../services/api';

const { Title, Text } = Typography;

const ProjectManagement = ({ onSelectProject }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [activeTab, setActiveTab] = useState('projects');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  // 将 form 实例移到 Modal 内部的组件中

  // 项目模板定义
  const projectTemplates = [
    {
      id: 'fantasy-epic',
      name: '奇幻史诗',
      description: '宏大的奇幻世界，包含魔法、种族、王国等元素',
      genre: '玄幻',
      targetAudience: '成人',
      coreTheme: '英雄的成长与责任',
      synopsis: '在一个充满魔法的世界中，一个平凡的少年发现了自己的特殊命运，踏上了拯救世界的旅程。',
      dailyWordGoal: 2000,
      totalWordGoal: 500000
    },
    {
      id: 'urban-romance',
      name: '都市言情',
      description: '现代都市中的爱情故事，包含职场、家庭等元素',
      genre: '言情',
      targetAudience: '青少年',
      coreTheme: '爱情与自我成长',
      synopsis: '两个性格迥异的年轻人在都市中相遇，经历了种种考验，最终找到真爱。',
      dailyWordGoal: 1500,
      totalWordGoal: 200000
    },
    {
      id: 'sci-fi-adventure',
      name: '科幻冒险',
      description: '未来世界的科幻故事，包含太空、科技、探险等元素',
      genre: '科幻',
      targetAudience: '全年龄',
      coreTheme: '探索与未知',
      synopsis: '一支宇航员小队前往未知的星系，发现了一个神秘的外星文明，揭开了宇宙的秘密。',
      dailyWordGoal: 1800,
      totalWordGoal: 300000
    },
    {
      id: 'mystery-detective',
      name: '悬疑推理',
      description: '充满悬念的推理故事，包含案件、线索、解谜等元素',
      genre: '悬疑',
      targetAudience: '成人',
      coreTheme: '真相与正义',
      synopsis: '一位资深侦探接手了一桩看似普通却隐藏着巨大秘密的案件，通过层层推理，最终揭开了真相。',
      dailyWordGoal: 1600,
      totalWordGoal: 250000
    }
  ];

  // 加载项目列表
  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await projectApi.getProjects();
      setProjects(response.data);
    } catch (error) {
      message.error('加载项目失败，请检查网络连接或后端服务是否正常');
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // 创建一个内部组件来包含 Form，这样 form 实例就只会在 Modal 可见时创建
  const ProjectForm = () => {
    const [form] = Form.useForm();
    
    // 当模态框显示且 currentProject 存在时，设置表单字段的值
    useEffect(() => {
      if (isEditing && currentProject) {
        form.setFieldsValue(currentProject);
      } else if (selectedTemplate) {
        form.setFieldsValue({
          title: '', // 标题需要用户自定义
          pen_name: '', // 笔名需要用户自定义
          genre: selectedTemplate.genre,
          targetAudience: selectedTemplate.targetAudience,
          coreTheme: selectedTemplate.coreTheme,
          synopsis: selectedTemplate.synopsis,
          daily_word_goal: selectedTemplate.dailyWordGoal,
          total_word_goal: selectedTemplate.totalWordGoal
        });
      } else {
        form.resetFields();
      }
    }, [isEditing, currentProject, selectedTemplate, form]);
    
    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="title"
          label="项目标题"
          rules={[{ required: true, message: '请输入项目标题' }]}
        >
          <Input placeholder="请输入项目标题" />
        </Form.Item>

        <Form.Item
          name="pen_name"
          label="笔名"
          rules={[{ required: true, message: '请输入笔名' }]}
        >
          <Input placeholder="请输入笔名" />
        </Form.Item>

        <Form.Item
          name="genre"
          label="小说类型"
          rules={[{ required: true, message: '请选择小说类型' }]}
        >
          <Select placeholder="请选择小说类型" style={{ width: '100%' }}>
            <Select.Option value="玄幻">玄幻</Select.Option>
            <Select.Option value="科幻">科幻</Select.Option>
            <Select.Option value="都市">都市</Select.Option>
            <Select.Option value="历史">历史</Select.Option>
            <Select.Option value="武侠">武侠</Select.Option>
            <Select.Option value="悬疑">悬疑</Select.Option>
            <Select.Option value="言情">言情</Select.Option>
            <Select.Option value="其他">其他</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="target_audience"
          label="目标读者"
          rules={[{ required: true, message: '请选择目标读者' }]}
        >
          <Select placeholder="请选择目标读者" style={{ width: '100%' }}>
            <Select.Option value="青少年">青少年</Select.Option>
            <Select.Option value="成人">成人</Select.Option>
            <Select.Option value="全年龄">全年龄</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="core_theme"
          label="核心主题"
          rules={[{ required: true, message: '请输入核心主题' }]}
        >
          <TextArea rows={3} placeholder="请输入小说的核心主题" />
        </Form.Item>

        <Form.Item
          name="synopsis"
          label="故事梗概"
          rules={[{ required: true, message: '请输入故事梗概' }]}
        >
          <TextArea rows={4} placeholder="请输入小说的故事梗概" />
        </Form.Item>

        <Form.Item
          name="daily_word_goal"
          label="每日字数目标"
        >
          <Input type="number" placeholder="请输入每日字数目标" />
        </Form.Item>

        <Form.Item
          name="total_word_goal"
          label="总字数目标"
        >
          <Input type="number" placeholder="请输入总字数目标" />
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
  const showModal = (project = null) => {
    if (project) {
      setCurrentProject(project);
      setIsEditing(true);
    } else {
      setCurrentProject(null);
      setIsEditing(false);
    }
    setIsModalVisible(true);
  };

  // 应用模板创建项目
  const applyTemplate = (template) => {
    setSelectedTemplate(template);
    setCurrentProject(null);
    setIsEditing(false);
    setIsModalVisible(true);
    setActiveTab('projects');
  };

  // 处理表单提交
  const handleSubmit = async (values) => {
    try {
      if (isEditing) {
        await projectApi.updateProject(currentProject.id, values);
        message.success('项目更新成功');
      } else {
        await projectApi.createProject(values);
        message.success('项目创建成功');
        // 项目创建成功后，通知导航模块更新流程状态
        window.dispatchEvent(new CustomEvent('navigateTo', { detail: { key: 'navigation' } }));
      }
      setIsModalVisible(false);
      loadProjects();
      // 通知 App.jsx 刷新项目列表
      window.dispatchEvent(new CustomEvent('refreshProjects'));
    } catch (error) {
      message.error(isEditing ? '更新项目失败' : '创建项目失败');
      console.error('Error:', error);
    }
  };

  // 处理删除项目
  const handleDelete = async (projectId) => {
    try {
      await projectApi.deleteProject(projectId);
      message.success('项目删除成功');
      loadProjects();
      // 通知 App.jsx 刷新项目列表
      window.dispatchEvent(new CustomEvent('refreshProjects'));
    } catch (error) {
      message.error('删除项目失败');
      console.error('Error deleting project:', error);
    }
  };

  // 表格列配置
  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: '笔名',
      dataIndex: 'pen_name',
      key: 'pen_name',
    },
    {
      title: '类型',
      dataIndex: 'genre',
      key: 'genre',
    },
    {
      title: '目标读者',
      dataIndex: 'target_audience',
      key: 'target_audience',
    },
    {
      title: '字数',
      dataIndex: 'word_count',
      key: 'word_count',
      render: (text) => <Text>{text} 字</Text>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {onSelectProject && (
            <Button 
              type="default" 
              onClick={() => onSelectProject(record.id)}
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
            title="确定要删除这个项目吗？"
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

  return (
    <div style={{ padding: '0' }}>
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'projects',
              label: '项目管理',
              children: (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                    <Title level={2}>项目管理</Title>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => showModal()}
                      size="middle"
                    >
                      新建项目
                    </Button>
                  </div>

                  <Table 
                    columns={columns} 
                    dataSource={projects} 
                    rowKey="id" 
                    loading={loading}
                    pagination={{ 
                      pageSize: 10, 
                      showSizeChanger: true,
                      pageSizeOptions: ['10', '20', '50'],
                      showTotal: (total) => `共 ${total} 个项目`
                    }}
                    locale={{ emptyText: '暂无项目，请点击"新建项目"按钮创建' }}
                    scroll={{ x: 'max-content' }}
                  />
                </>
              )
            },
            {
              key: 'templates',
              label: '项目模板',
              children: (
                <>
                  <Title level={2}>项目模板</Title>
                  <div style={{ marginBottom: '24px' }}>
                    <Text>
                      选择一个模板快速创建项目，模板包含预设的类型、主题和目标等信息。
                    </Text>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {projectTemplates.map(template => (
                      <Card key={template.id} hoverable>
                        <Card.Meta
                          title={template.name}
                          description={template.description}
                        />
                        <Divider />
                        <div style={{ marginBottom: '12px' }}>
                          <Text strong>类型：</Text>
                          <Text>{template.genre}</Text>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <Text strong>目标读者：</Text>
                          <Text>{template.targetAudience}</Text>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <Text strong>核心主题：</Text>
                          <Text>{template.coreTheme}</Text>
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                          <Text strong>每日目标：</Text>
                          <Text>{template.dailyWordGoal} 字</Text>
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                          <Text strong>总目标：</Text>
                          <Text>{template.totalWordGoal} 字</Text>
                        </div>
                        <Button 
                          type="primary" 
                          block
                          onClick={() => applyTemplate(template)}
                        >
                          应用模板
                        </Button>
                      </Card>
                    ))}
                  </div>
                </>
              )
            }
          ]}
        />
      </Card>

      {/* 创建/编辑项目模态框 */}
      <Modal
        title={isEditing ? '编辑项目' : selectedTemplate ? `基于模板创建项目：${selectedTemplate.name}` : '新建项目'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={{ xs: '90%', sm: 600, md: 800 }}
        destroyOnHidden
      >
        <ProjectForm />
      </Modal>
    </div>
  );
};

export default ProjectManagement;
import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Modal, Form, Input, Select, 
  message, Popconfirm, Space, Card, Typography, 
  Tabs, Radio, Divider, Row, Col, Progress, Tag, Empty
} from 'antd';

const { TextArea } = Input;
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, FileOutlined,
  GlobalOutlined, BookOutlined, ArrowRightOutlined
} from '@ant-design/icons';
import { projectApi, worldApi } from '../services/api';
import ProjectCreationWizard from '../components/ProjectCreationWizard';

const { Title, Text } = Typography;

const ProjectManagement = ({ onSelectProject }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [activeTab, setActiveTab] = useState('projects');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [worlds, setWorlds] = useState([]);
  const [worldsLoading, setWorldsLoading] = useState(false);
  const [wizardVisible, setWizardVisible] = useState(false);
  const [projectStats, setProjectStats] = useState({});
  
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
      // 加载每个项目的统计信息
      loadProjectStats(response.data);
    } catch (error) {
      message.error('加载项目失败，请检查网络连接或后端服务是否正常');
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载世界观列表
  const loadWorlds = async () => {
    setWorldsLoading(true);
    try {
      const response = await worldApi.getWorlds();
      if (response.data.code === 200) {
        setWorlds(response.data.data);
      }
    } catch (error) {
      console.error('加载世界观列表失败:', error);
    } finally {
      setWorldsLoading(false);
    }
  };

  // 加载项目统计信息
  const loadProjectStats = async (projectsList) => {
    const stats = {};
    for (const project of projectsList) {
      try {
        // 这里可以根据实际需求加载项目统计
        // 例如：字数统计、章节数等
        stats[project.id] = {
          wordCount: project.word_count || 0,
          chapterCount: project.chapter_count || 0,
          progress: project.total_word_goal > 0 
            ? Math.round((project.word_count || 0) / project.total_word_goal * 100)
            : 0
        };
      } catch (error) {
        console.error(`加载项目 ${project.id} 统计失败:`, error);
      }
    }
    setProjectStats(stats);
  };

  useEffect(() => {
    loadProjects();
    loadWorlds();
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

        {/* 世界观关联选项 */}
        <Form.Item
          name="world_id"
          label="关联世界观"
        >
          <Select 
            placeholder="请选择要关联的世界观" 
            style={{ width: '100%' }}
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {worlds.map(world => (
              <Select.Option key={world.id} value={world.id}>
                {world.name} ({world.world_type || '未分类'})
              </Select.Option>
            ))}
          </Select>
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
      setIsModalVisible(true);
    } else {
      // 使用新的向导创建项目
      setWizardVisible(true);
    }
  };

  // 处理向导创建成功
  const handleWizardSuccess = (project, world) => {
    loadProjects();
    message.success('项目创建成功！');
    // 如果有关联世界观，刷新世界观列表
    if (world) {
      loadWorlds();
    }
  };

  // 获取项目关联的世界观
  const getProjectWorld = (project) => {
    // 这里假设项目有 world_id 字段关联世界观
    // 如果没有，可以返回 null
    return project.world_id ? worlds.find(w => w.id === project.world_id) : null;
  };

  // 渲染项目卡片
  const renderProjectCard = (project) => {
    const world = getProjectWorld(project);
    const stats = projectStats[project.id] || { wordCount: 0, progress: 0 };
    
    return (
      <Card
        key={project.id}
        hoverable
        style={{ height: '100%' }}
        actions={[
          onSelectProject && (
            <Button 
              type="link" 
              onClick={() => onSelectProject(project.id)}
            >
              选择
            </Button>
          ),
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => {
              setCurrentProject(project);
              setIsEditing(true);
              setIsModalVisible(true);
            }}
          >
            编辑
          </Button>,
          <Popconfirm
            title="确定要删除这个项目吗？"
            onConfirm={() => handleDelete(project.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="link" 
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        ].filter(Boolean)}
      >
        <Card.Meta
          title={
            <Space>
              <BookOutlined style={{ color: '#1890ff' }} />
              <Text strong style={{ fontSize: 16 }}>{project.title}</Text>
            </Space>
          }
          description={
            <Space direction="vertical" style={{ width: '100%', marginTop: 8 }}>
              <Text type="secondary">笔名: {project.pen_name}</Text>
              <Space>
                <Tag color="blue">{project.genre}</Tag>
                <Tag color="green">{project.target_audience}</Tag>
              </Space>
              
              {/* 世界观信息 */}
              <div style={{ marginTop: 8 }}>
                {world ? (
                  <Space>
                    <GlobalOutlined style={{ color: '#52c41a' }} />
                    <Text type="secondary">世界观: </Text>
                    <Text>{world.name}</Text>
                  </Space>
                ) : (
                  <Space>
                    <GlobalOutlined style={{ color: '#d9d9d9' }} />
                    <Text type="secondary">未关联世界观</Text>
                  </Space>
                )}
              </div>

              {/* 创作进度 */}
              <div style={{ marginTop: 12 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                    <Text type="secondary">创作进度</Text>
                    <Text type="secondary">{stats.wordCount} / {project.total_word_goal || 300000} 字</Text>
                  </Space>
                  <Progress 
                    percent={stats.progress} 
                    size="small" 
                    status={stats.progress >= 100 ? 'success' : 'active'}
                  />
                </Space>
              </div>
            </Space>
          }
        />
      </Card>
    );
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
                    <div>
                      <Title level={2} style={{ marginBottom: 8 }}>项目管理</Title>
                      <Text type="secondary">管理你的小说项目，关联世界观，追踪创作进度</Text>
                    </div>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => showModal()}
                      size="large"
                    >
                      新建项目
                    </Button>
                  </div>

                  {projects.length > 0 ? (
                    <Row gutter={[24, 24]}>
                      {projects.map(project => (
                        <Col xs={24} sm={12} lg={8} xl={6} key={project.id}>
                          {renderProjectCard(project)}
                        </Col>
                      ))}
                      {/* 添加新项目卡片 */}
                      <Col xs={24} sm={12} lg={8} xl={6}>
                        <Card
                          hoverable
                          style={{ 
                            height: '100%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            borderStyle: 'dashed',
                            backgroundColor: '#fafafa'
                          }}
                          onClick={() => setWizardVisible(true)}
                        >
                          <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <PlusOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                            <div style={{ color: '#666', fontSize: 16 }}>创建新项目</div>
                            <div style={{ color: '#999', fontSize: 14, marginTop: 8 }}>开始你的创作之旅</div>
                          </div>
                        </Card>
                      </Col>
                    </Row>
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <Space direction="vertical" size="large">
                          <Text type="secondary">暂无项目</Text>
                          <Button 
                            type="primary" 
                            icon={<PlusOutlined />}
                            onClick={() => setWizardVisible(true)}
                            size="large"
                          >
                            创建第一个项目
                          </Button>
                        </Space>
                      }
                      style={{ padding: '60px 0' }}
                    />
                  )}
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

      {/* 项目创建向导 */}
      <ProjectCreationWizard
        visible={wizardVisible}
        onCancel={() => setWizardVisible(false)}
        onSuccess={handleWizardSuccess}
      />
    </div>
  );
};

export default ProjectManagement;
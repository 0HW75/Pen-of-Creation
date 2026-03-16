import React, { useState, useEffect } from 'react';
import {
  Modal,
  Steps,
  Form,
  Input,
  Select,
  Button,
  Radio,
  Card,
  Typography,
  Space,
  Divider,
  message,
  Spin,
  Empty,
  Tag,
  Progress
} from 'antd';
import {
  PlusOutlined,
  CheckCircleOutlined,
  GlobalOutlined,
  BookOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  CheckOutlined,
  BulbOutlined
} from '@ant-design/icons';
import { projectApi, worldApi } from '../services/api';
import AIProposalModal from './AIProposalModal';

const { Step } = Steps;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

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
    totalWordGoal: 500000,
    color: '#722ed1'
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
    totalWordGoal: 200000,
    color: '#eb2f96'
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
    totalWordGoal: 300000,
    color: '#1890ff'
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
    totalWordGoal: 250000,
    color: '#fa8c16'
  }
];

// 世界类型选项
const worldTypes = [
  { value: 'fantasy', label: '奇幻', color: '#722ed1' },
  { value: 'scifi', label: '科幻', color: '#1890ff' },
  { value: 'modern', label: '现代', color: '#52c41a' },
  { value: 'historical', label: '历史', color: '#fa8c16' },
  { value: 'other', label: '其他', color: '#8c8c8c' }
];

const ProjectCreationWizard = ({ visible, onCancel, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [worlds, setWorlds] = useState([]);
  const [worldsLoading, setWorldsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedWorldOption, setSelectedWorldOption] = useState('new'); // 'new' | 'existing' | 'skip'
  const [selectedExistingWorld, setSelectedExistingWorld] = useState(null);
  const [createdProject, setCreatedProject] = useState(null);
  const [createdWorld, setCreatedWorld] = useState(null);
  const [step1Values, setStep1Values] = useState(null); // 保存步骤1的表单值
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false); // AI提案弹窗状态

  // 加载世界观列表
  useEffect(() => {
    if (visible && currentStep === 1) {
      loadWorlds();
    }
  }, [visible, currentStep]);

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

  // 打开AI提案弹窗
  const openProposalModal = () => {
    setIsProposalModalOpen(true);
  };

  // 关闭AI提案弹窗
  const closeProposalModal = () => {
    setIsProposalModalOpen(false);
  };

  // 应用AI生成的提案
  const applyProposal = (proposal) => {
    form.setFieldsValue({
      title: proposal.title || form.getFieldValue('title'),
      pen_name: proposal.pen_name || form.getFieldValue('pen_name'),
      genre: proposal.genre || form.getFieldValue('genre'),
      target_audience: proposal.target_audience || form.getFieldValue('target_audience'),
      core_theme: proposal.core_theme || form.getFieldValue('core_theme'),
      synopsis: proposal.synopsis || form.getFieldValue('synopsis'),
      daily_word_goal: proposal.daily_word_goal || form.getFieldValue('daily_word_goal') || 2000,
      total_word_goal: proposal.total_word_goal || form.getFieldValue('total_word_goal') || 300000
    });
    message.success('AI提案已应用到表单');
  };

  // 步骤1：项目信息
  const renderStep1 = () => {
    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text type="secondary">填写你的小说基本信息</Text>
          <Button
            type="primary"
            icon={<BulbOutlined />}
            onClick={openProposalModal}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none'
            }}
          >
            AI创意提案
          </Button>
        </div>

        <Form.Item
          name="title"
          label="项目标题"
          rules={[{ required: true, message: '请输入项目标题' }]}
        >
          <Input placeholder="给你的小说起个名字" size="large" />
        </Form.Item>

        <Form.Item
          name="pen_name"
          label="笔名"
          rules={[{ required: true, message: '请输入笔名' }]}
        >
          <Input placeholder="你的作者名" size="large" />
        </Form.Item>

        <Form.Item
          name="genre"
          label="小说类型"
          rules={[{ required: true, message: '请选择小说类型' }]}
        >
          <Select placeholder="选择小说类型" size="large">
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
          <Select placeholder="选择目标读者" size="large">
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
          <TextArea
            rows={2}
            placeholder="一句话概括你的故事核心"
          />
        </Form.Item>

        <Form.Item
          name="synopsis"
          label="故事梗概"
          rules={[{ required: true, message: '请输入故事梗概' }]}
        >
          <TextArea
            rows={4}
            placeholder="简要描述你的故事"
          />
        </Form.Item>

        <Divider />

        <Form.Item label="写作目标">
          <Space size="large">
            <Form.Item
              name="daily_word_goal"
              label="每日目标"
              style={{ marginBottom: 0 }}
            >
              <Input type="number" addonAfter="字" style={{ width: 150 }} />
            </Form.Item>
            <Form.Item
              name="total_word_goal"
              label="总目标"
              style={{ marginBottom: 0 }}
            >
              <Input type="number" addonAfter="字" style={{ width: 150 }} />
            </Form.Item>
          </Space>
        </Form.Item>
      </>
    );
  };

  // 步骤2：世界观选择
  const renderStep2 = () => {
    return (
      <div>
        <Radio.Group
          value={selectedWorldOption}
          onChange={(e) => setSelectedWorldOption(e.target.value)}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* 创建新世界 */}
            <Card
              hoverable
              style={{
                borderColor: selectedWorldOption === 'new' ? '#1890ff' : undefined,
                backgroundColor: selectedWorldOption === 'new' ? '#f0f7ff' : undefined
              }}
              onClick={() => setSelectedWorldOption('new')}
            >
              <Radio value="new">
                <Space>
                  <PlusOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                  <div>
                    <Text strong style={{ fontSize: 16 }}>创建新的世界观</Text>
                    <Paragraph type="secondary" style={{ marginBottom: 0, marginTop: 4 }}>
                      为你的小说创建一个全新的世界观设定
                    </Paragraph>
                  </div>
                </Space>
              </Radio>
            </Card>

            {/* 选择已有世界 */}
            <Card
              hoverable
              style={{
                borderColor: selectedWorldOption === 'existing' ? '#1890ff' : undefined,
                backgroundColor: selectedWorldOption === 'existing' ? '#f0f7ff' : undefined
              }}
              onClick={() => setSelectedWorldOption('existing')}
            >
              <Radio value="existing">
                <Space>
                  <GlobalOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                  <div>
                    <Text strong style={{ fontSize: 16 }}>关联已有世界观</Text>
                    <Paragraph type="secondary" style={{ marginBottom: 0, marginTop: 4 }}>
                      选择之前创建的世界观
                    </Paragraph>
                  </div>
                </Space>
              </Radio>
              {selectedWorldOption === 'existing' && (
                <div style={{ marginTop: 16, marginLeft: 32 }}>
                  <Spin spinning={worldsLoading}>
                    {worlds.length > 0 ? (
                      <Radio.Group
                        value={selectedExistingWorld}
                        onChange={(e) => setSelectedExistingWorld(e.target.value)}
                      >
                        <Space direction="vertical">
                          {worlds.map(world => (
                            <Radio key={world.id} value={world.id}>
                              <Space>
                                <span>{world.name}</span>
                                <Tag color={worldTypes.find(t => t.value === world.world_type)?.color || 'default'}>
                                  {worldTypes.find(t => t.value === world.world_type)?.label || world.world_type}
                                </Tag>
                              </Space>
                            </Radio>
                          ))}
                        </Space>
                      </Radio.Group>
                    ) : (
                      <Empty description="暂无世界观，请先创建" />
                    )}
                  </Spin>
                </div>
              )}
            </Card>

            {/* 跳过 */}
            <Card
              hoverable
              style={{
                borderColor: selectedWorldOption === 'skip' ? '#1890ff' : undefined,
                backgroundColor: selectedWorldOption === 'skip' ? '#f0f7ff' : undefined
              }}
              onClick={() => setSelectedWorldOption('skip')}
            >
              <Radio value="skip">
                <Space>
                  <CheckOutlined style={{ fontSize: 24, color: '#8c8c8c' }} />
                  <div>
                    <Text strong style={{ fontSize: 16 }}>暂时跳过</Text>
                    <Paragraph type="secondary" style={{ marginBottom: 0, marginTop: 4 }}>
                      稍后可以在设定数据库中创建和关联
                    </Paragraph>
                  </div>
                </Space>
              </Radio>
            </Card>
          </Space>
        </Radio.Group>

        {/* 新世界观表单 */}
        {selectedWorldOption === 'new' && (
          <Card style={{ marginTop: 16 }} title="新世界基本信息">
            <Form.Item
              name="world_name"
              label="世界观名称"
              rules={[{ required: true, message: '请输入世界观名称' }]}
            >
              <Input placeholder="例如：艾泽拉斯、中土世界" />
            </Form.Item>
            <Form.Item
              name="world_type"
              label="世界类型"
              rules={[{ required: true, message: '请选择世界类型' }]}
            >
              <Select placeholder="选择世界类型">
                {worldTypes.map(type => (
                  <Select.Option key={type.value} value={type.value}>
                    <Tag color={type.color}>{type.label}</Tag>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="world_description"
              label="世界描述"
            >
              <TextArea
                rows={3}
                placeholder="简要描述这个世界的特点"
              />
            </Form.Item>
          </Card>
        )}
      </div>
    );
  };

  // 步骤3：模板选择
  const renderStep3 = () => {
    return (
      <div>
        <Paragraph style={{ marginBottom: 24 }}>
          选择一个创作模板，模板会预设一些常用的设定和结构，帮助你快速开始。
          <Text type="secondary">也可以不选择模板，完全自定义创作。</Text>
        </Paragraph>

        <Radio.Group
          value={selectedTemplate?.id || 'none'}
          onChange={(e) => {
            const template = projectTemplates.find(t => t.id === e.target.value);
            setSelectedTemplate(template || null);
          }}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {/* 不使用模板 */}
            <Card
              hoverable
              style={{
                borderColor: !selectedTemplate ? '#1890ff' : undefined,
                backgroundColor: !selectedTemplate ? '#f0f7ff' : undefined
              }}
              onClick={() => setSelectedTemplate(null)}
            >
              <Radio value="none">
                <Space>
                  <CheckCircleOutlined style={{ fontSize: 24, color: '#8c8c8c' }} />
                  <div>
                    <Text strong style={{ fontSize: 16 }}>不使用模板</Text>
                    <Paragraph type="secondary" style={{ marginBottom: 0, marginTop: 4 }}>
                      完全自定义，从零开始创作
                    </Paragraph>
                  </div>
                </Space>
              </Radio>
            </Card>

            <Divider style={{ margin: '12px 0' }}>推荐模板</Divider>

            {/* 模板列表 */}
            {projectTemplates.map(template => (
              <Card
                key={template.id}
                hoverable
                style={{
                  borderColor: selectedTemplate?.id === template.id ? template.color : undefined,
                  backgroundColor: selectedTemplate?.id === template.id ? `${template.color}10` : undefined
                }}
                onClick={() => setSelectedTemplate(template)}
              >
                <Radio value={template.id}>
                  <Space align="start">
                    <BookOutlined style={{ fontSize: 24, color: template.color }} />
                    <div style={{ flex: 1 }}>
                      <Space>
                        <Text strong style={{ fontSize: 16 }}>{template.name}</Text>
                        <Tag color={template.color}>{template.genre}</Tag>
                      </Space>
                      <Paragraph type="secondary" style={{ marginBottom: 8, marginTop: 4 }}>
                        {template.description}
                      </Paragraph>
                      <Space size="large">
                        <Text type="secondary">每日目标: {template.dailyWordGoal}字</Text>
                        <Text type="secondary">总目标: {template.totalWordGoal}字</Text>
                      </Space>
                    </div>
                  </Space>
                </Radio>
              </Card>
            ))}
          </Space>
        </Radio.Group>
      </div>
    );
  };

  // 步骤4：完成
  const renderStep4 = () => {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <CheckCircleOutlined style={{ fontSize: 72, color: '#52c41a', marginBottom: 24 }} />
        <Title level={3}>项目创建成功！</Title>
        <Paragraph style={{ fontSize: 16, marginBottom: 24 }}>
          你的小说项目《{createdProject?.title}》已经创建完成
          {createdWorld && `，世界观《${createdWorld.name}》已关联`}
        </Paragraph>
        <div style={{ backgroundColor: '#f5f5f5', padding: 24, borderRadius: 8, textAlign: 'left', maxWidth: 400, margin: '0 auto' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text type="secondary">项目标题：</Text>
              <Text strong>{createdProject?.title}</Text>
            </div>
            <div>
              <Text type="secondary">小说类型：</Text>
              <Text>{createdProject?.genre}</Text>
            </div>
            <div>
              <Text type="secondary">目标读者：</Text>
              <Text>{createdProject?.target_audience}</Text>
            </div>
            {createdWorld && (
              <div>
                <Text type="secondary">关联世界观：</Text>
                <Text>{createdWorld.name}</Text>
              </div>
            )}
            <Divider style={{ margin: '12px 0' }} />
            <div>
              <Text type="secondary">下一步建议：</Text>
              <Text strong>完善世界观设定或开始创建故事大纲</Text>
            </div>
          </Space>
        </div>
      </div>
    );
  };

  // 下一步
  const handleNext = async () => {
    if (currentStep === 0) {
      // 验证表单
      try {
        const values = await form.validateFields();
        setStep1Values(values); // 保存步骤1的表单值
        setCurrentStep(1);
      } catch (error) {
        return;
      }
    } else if (currentStep === 1) {
      // 验证世界观选择
      if (selectedWorldOption === 'existing' && !selectedExistingWorld) {
        message.warning('请选择一个世界观');
        return;
      }
      if (selectedWorldOption === 'new') {
        try {
          await form.validateFields(['world_name', 'world_type']);
        } catch (error) {
          return;
        }
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // 提交创建
      await handleSubmit();
    }
  };

  // 上一步
  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  // 提交创建
  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. 先处理世界观（创建或获取）
      let world = null;
      let worldId = null;
      
      if (selectedWorldOption === 'new') {
        // 创建新世界
        const formValues = form.getFieldsValue();
        const worldData = {
          name: formValues.world_name,
          world_type: formValues.world_type,
          description: formValues.world_description || ''
        };
        const worldResponse = await worldApi.createWorld(worldData);
        world = worldResponse.data;
        worldId = world.id;
        setCreatedWorld(world);
      } else if (selectedWorldOption === 'existing') {
        // 获取已有世界信息
        const worldResponse = await worldApi.getWorld(selectedExistingWorld);
        world = worldResponse.data;
        worldId = world.id;
        setCreatedWorld(world);
      }

      // 2. 创建项目（关联世界观）
      const currentValues = form.getFieldsValue();
      const formValues = { ...step1Values, ...currentValues };
      console.log('Step1 values:', step1Values);
      console.log('Current values:', currentValues);
      console.log('Merged form values:', formValues);
      
      const projectData = {
        ...formValues,
        daily_word_goal: parseInt(formValues.daily_word_goal) || 2000,
        total_word_goal: parseInt(formValues.total_word_goal) || 300000,
        world_id: worldId  // 关联世界观
      };
      
      console.log('Project data to send:', projectData);

      // 如果有选择模板，合并模板数据
      if (selectedTemplate) {
        projectData.daily_word_goal = selectedTemplate.dailyWordGoal;
        projectData.total_word_goal = selectedTemplate.totalWordGoal;
      }

      const projectResponse = await projectApi.createProject(projectData);
      const newProject = projectResponse.data;
      setCreatedProject(newProject);

      // 3. 进入完成步骤
      setCurrentStep(3);

      // 4. 通知父组件
      if (onSuccess) {
        onSuccess(newProject, world);
      }

      // 5. 刷新项目列表
      window.dispatchEvent(new CustomEvent('refreshProjects'));

    } catch (error) {
      message.error('创建失败：' + (error.message || '未知错误'));
      console.error('创建失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 关闭并重置
  const handleClose = () => {
    setCurrentStep(0);
    setSelectedTemplate(null);
    setSelectedWorldOption('new');
    setSelectedExistingWorld(null);
    setCreatedProject(null);
    setCreatedWorld(null);
    setStep1Values(null);
    form.resetFields();
    onCancel();
  };

  // 步骤配置
  const steps = [
    {
      title: '项目信息',
      description: '填写基本信息',
      content: renderStep1
    },
    {
      title: '世界观',
      description: '选择或创建',
      content: renderStep2
    },
    {
      title: '创作模板',
      description: '选择模板（可选）',
      content: renderStep3
    },
    {
      title: '完成',
      description: '创建成功',
      content: renderStep4
    }
  ];

  return (
    <Modal
      title="创建新项目"
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={800}
      destroyOnClose
      closable={!loading}
      maskClosable={!loading}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          daily_word_goal: 2000,
          total_word_goal: 300000
        }}
      >
        <Steps
          current={currentStep}
          items={steps.map(step => ({
            title: step.title,
            description: step.description
          }))}
          style={{ marginBottom: 32 }}
        />

        <div style={{ minHeight: 400 }}>
          {steps[currentStep].content()}
        </div>

        {/* 按钮区域 */}
        {currentStep < 3 && (
          <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              onClick={handlePrev}
              disabled={currentStep === 0 || loading}
              size="large"
            >
              <ArrowLeftOutlined /> 上一步
            </Button>
            <Button
              type="primary"
              onClick={handleNext}
              loading={loading}
              size="large"
            >
              {currentStep === 2 ? '创建项目' : '下一步'}
              {currentStep < 2 && <ArrowRightOutlined style={{ marginLeft: 4 }} />}
            </Button>
          </div>
        )}

        {currentStep === 3 && (
          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <Button
              type="primary"
              onClick={handleClose}
              size="large"
            >
              开始创作
            </Button>
          </div>
        )}
      </Form>

      {/* AI提案弹窗 */}
      <AIProposalModal
        isOpen={isProposalModalOpen}
        onClose={closeProposalModal}
        onApply={applyProposal}
      />
    </Modal>
  );
};

export default ProjectCreationWizard;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Modal, Form, Input, Select, Button, Spin, message, Tabs, Card,
  Descriptions, Tag, Progress, Collapse, List, Badge, Space, Popconfirm,
  Alert, Typography, Divider, Empty
} from 'antd';
import {
  StarOutlined, SaveOutlined, ReloadOutlined, PauseCircleOutlined,
  PlayCircleOutlined, EyeOutlined, HistoryOutlined, CheckCircleOutlined,
  ExclamationCircleOutlined, LoadingOutlined
} from '@ant-design/icons';
import { aiGenerationApi } from '../../services/api';

const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;
const { Text, Title } = Typography;

const ENTITY_TYPE_LABELS = {
  character: '角色',
  location: '地点',
  item: '物品',
  faction: '势力',
  energy_system: '能量体系',
  civilization: '文明文化',
  historical_event: '历史事件',
  region: '地理区域',
  dimension: '维度位面'
};

const STRATEGY_LABELS = {
  simple: '简单生成',
  detailed: '详细生成',
  batch: '批量生成',
  creative: '创意生成',
  conservative: '保守生成'
};

const AIGenerateModal = ({ visible, onCancel, onGenerate, worldId, projectId, defaultEntityType }) => {
  const [form] = Form.useForm();

  // 原有状态
  const [loading, setLoading] = useState(false);
  const [strategies, setStrategies] = useState([]);
  const [entityTypes, setEntityTypes] = useState([]);
  const [result, setResult] = useState(null);
  const [previewPrompt, setPreviewPrompt] = useState('');
  const [activeTab, setActiveTab] = useState('input');

  // 新增状态管理
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAborted, setIsAborted] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [abortController, setAbortController] = useState(null);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0, percent: 0 });
  const [generationLogs, setGenerationLogs] = useState([]);
  const [currentInput, setCurrentInput] = useState(null);
  const [showInputDetails, setShowInputDetails] = useState(false);

  // 检查点相关状态
  const [checkpoints, setCheckpoints] = useState([]);
  const [showCheckpointRestore, setShowCheckpointRestore] = useState(false);
  const [loadingCheckpoints, setLoadingCheckpoints] = useState(false);

  const eventSourceRef = useRef(null);

  // 加载策略和实体类型
  useEffect(() => {
    loadStrategies();
    loadEntityTypes();
  }, []);

  // Modal打开时检查检查点
  useEffect(() => {
    if (visible && projectId) {
      checkForCheckpoints();
    }
  }, [visible, projectId]);

  // 清理函数
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setResult(null);
      setPreviewPrompt('');
      setActiveTab('input');
      if (defaultEntityType) {
        form.setFieldsValue({ entity_type: defaultEntityType });
      }
      // 重置生成相关状态
      resetGenerationState();
    }
  }, [visible, defaultEntityType]);

  const resetGenerationState = () => {
    setIsGenerating(false);
    setIsAborted(false);
    setSessionId(null);
    setAbortController(null);
    setGenerationProgress({ current: 0, total: 0, percent: 0 });
    setGenerationLogs([]);
    setCurrentInput(null);
    setShowInputDetails(false);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  const loadStrategies = async () => {
    try {
      const response = await aiGenerationApi.getStrategies();
      if (response.data.success) {
        setStrategies(response.data.strategies);
      }
    } catch (error) {
      console.error('加载策略失败:', error);
    }
  };

  const loadEntityTypes = async () => {
    try {
      const response = await aiGenerationApi.getEntityTypes();
      if (response.data.success) {
        setEntityTypes(response.data.entity_types);
      }
    } catch (error) {
      console.error('加载实体类型失败:', error);
    }
  };

  // 检查是否有可恢复的检查点
  const checkForCheckpoints = async () => {
    if (!projectId) return;

    setLoadingCheckpoints(true);
    try {
      const response = await aiGenerationApi.getCheckpoints({ project_id: projectId });
      if (response.data?.code === 200 && response.data?.data?.checkpoints?.length > 0) {
        // 过滤出未完成的检查点
        const incompleteCheckpoints = response.data.data.checkpoints.filter(
          cp => cp.status !== 'completed' && cp.status !== 'failed'
        );
        if (incompleteCheckpoints.length > 0) {
          setCheckpoints(incompleteCheckpoints);
          setShowCheckpointRestore(true);
        }
      }
    } catch (error) {
      console.error('检查检查点失败:', error);
    } finally {
      setLoadingCheckpoints(false);
    }
  };

  // 中止生成
  const handleAbortGeneration = async () => {
    if (!sessionId) {
      message.warning('没有正在进行的生成会话');
      return;
    }

    try {
      setLoading(true);
      const response = await aiGenerationApi.abortGeneration({ session_id: sessionId });

      if (response.data?.code === 200) {
        setIsAborted(true);
        message.success('已发送中止请求');

        // 关闭EventSource
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }

        // 更新状态
        setIsGenerating(false);
        addLog('info', '用户中止了生成过程');
      } else {
        message.warning(response.data?.message || '中止请求发送失败');
      }
    } catch (error) {
      console.error('中止生成失败:', error);
      message.error('中止请求失败');
    } finally {
      setLoading(false);
    }
  };

  // 从检查点恢复
  const handleResumeFromCheckpoint = async (checkpoint) => {
    try {
      setLoading(true);
      const response = await aiGenerationApi.resumeGeneration({
        checkpoint_id: checkpoint.id
      });

      if (response.data?.code === 200) {
        message.success('检查点已加载');
        setShowCheckpointRestore(false);

        // 恢复状态
        const data = response.data.data;
        setSessionId(data.session_id);

        // 可以在这里继续之前的生成流程
        // TODO: 根据恢复的数据继续生成
      } else {
        message.error(response.data?.message || '恢复失败');
      }
    } catch (error) {
      console.error('恢复检查点失败:', error);
      message.error('恢复检查点失败');
    } finally {
      setLoading(false);
    }
  };

  // 删除检查点
  const handleDeleteCheckpoint = async (checkpointId) => {
    try {
      const response = await aiGenerationApi.deleteCheckpoint(checkpointId);
      if (response.data?.code === 200) {
        message.success('检查点已删除');
        setCheckpoints(prev => prev.filter(cp => cp.id !== checkpointId));
        if (checkpoints.length <= 1) {
          setShowCheckpointRestore(false);
        }
      }
    } catch (error) {
      console.error('删除检查点失败:', error);
      message.error('删除检查点失败');
    }
  };

  // 添加生成日志
  const addLog = useCallback((type, content, data = null) => {
    setGenerationLogs(prev => [...prev, {
      id: Date.now() + Math.random(),
      type,
      content,
      data,
      timestamp: new Date().toLocaleTimeString()
    }]);
  }, []);

  const handlePreview = async () => {
    try {
      const values = await form.validateFields(['entity_type', 'prompt', 'strategy', 'style']);
      setLoading(true);
      const response = await aiGenerationApi.previewPrompt({
        ...values,
        world_id: worldId,
        project_id: projectId
      });
      if (response.data.success) {
        setPreviewPrompt(response.data.prompt);
        setActiveTab('preview');
      }
    } catch (error) {
      message.error('预览失败');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      setIsGenerating(true);
      setIsAborted(false);
      setGenerationLogs([]);

      const response = await aiGenerationApi.generateSetting({
        ...values,
        world_id: worldId,
        project_id: projectId
      });

      if (response.data.success) {
        setResult(response.data);
        setActiveTab('result');
        message.success('生成成功');
      } else {
        message.error(response.data.error || '生成失败');
      }
    } catch (error) {
      message.error('生成请求失败');
    } finally {
      setLoading(false);
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!result || !result.data) {
      message.warning('没有可保存的数据');
      return;
    }

    try {
      setLoading(true);
      const values = form.getFieldsValue();
      const response = await aiGenerationApi.saveSetting({
        entity_type: values.entity_type,
        data: result.data,
        world_id: worldId,
        project_id: projectId
      });

      if (response.data.success) {
        message.success('保存成功');
        if (onGenerate) {
          onGenerate(response.data);
        }
        onCancel();
      } else {
        message.error(response.data.error || '保存失败');
      }
    } catch (error) {
      message.error('保存请求失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    setActiveTab('input');
    setResult(null);
    resetGenerationState();
  };

  // 渲染检查点恢复UI
  const renderCheckpointRestore = () => {
    if (!showCheckpointRestore || checkpoints.length === 0) return null;

    return (
      <Alert
        type="info"
        showIcon
        icon={<HistoryOutlined />}
        message="发现未完成的生成任务"
        description={
          <div style={{ marginTop: 8 }}>
            <Text>检测到 {checkpoints.length} 个可恢复的检查点：</Text>
            <List
              size="small"
              dataSource={checkpoints.slice(0, 3)}
              renderItem={checkpoint => (
                <List.Item
                  actions={[
                    <Button
                      type="link"
                      size="small"
                      icon={<PlayCircleOutlined />}
                      onClick={() => handleResumeFromCheckpoint(checkpoint)}
                    >
                      恢复
                    </Button>,
                    <Button
                      type="link"
                      size="small"
                      danger
                      onClick={() => handleDeleteCheckpoint(checkpoint.id)}
                    >
                      删除
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>会话: {checkpoint.session_id?.slice(-8)}</Text>
                        <Tag color="blue">{checkpoint.stage}</Tag>
                        <Tag>{checkpoint.progress_percent}%</Tag>
                      </Space>
                    }
                    description={
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        创建时间: {new Date(checkpoint.created_at).toLocaleString()}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
            <Button
              type="link"
              size="small"
              onClick={() => setShowCheckpointRestore(false)}
            >
              忽略，开始新任务
            </Button>
          </div>
        }
        style={{ marginBottom: 16 }}
      />
    );
  };

  // 渲染输入内容查看
  const renderInputDetails = () => {
    if (!currentInput) return null;

    const { sections } = currentInput;
    if (!sections) return null;

    return (
      <Collapse
        activeKey={showInputDetails ? ['input'] : []}
        onChange={(keys) => setShowInputDetails(keys.includes('input'))}
        style={{ marginTop: 16 }}
      >
        <Panel
          header={
            <Space>
              <EyeOutlined />
              <Text strong>查看输入内容</Text>
              {currentInput.element_name && (
                <Tag color="blue">{currentInput.element_name}</Tag>
              )}
              {currentInput.stage && (
                <Tag color="purple">{currentInput.stage === 'extraction' ? '提取' : '生成'}</Tag>
              )}
            </Space>
          }
          key="input"
        >
          {sections.element && (
            <>
              <Title level={5}>当前处理元素</Title>
              <Descriptions bordered size="small" column={1}>
                <Descriptions.Item label="名称">{sections.element.name || '-'}</Descriptions.Item>
                <Descriptions.Item label="类型">{sections.element.type || '-'}</Descriptions.Item>
                <Descriptions.Item label="简介">
                  <Text style={{ whiteSpace: 'pre-wrap' }}>{sections.element.brief || '-'}</Text>
                </Descriptions.Item>
                {sections.element.evidence && (
                  <Descriptions.Item label="证据">
                    <Text style={{ whiteSpace: 'pre-wrap' }}>{sections.element.evidence}</Text>
                  </Descriptions.Item>
                )}
              </Descriptions>
              <Divider />
            </>
          )}

          {sections.prompt_summary && (
            <>
              <Title level={5}>Prompt摘要</Title>
              <div style={{
                background: '#f6ffed',
                border: '1px solid #b7eb8f',
                borderRadius: 4,
                padding: 12,
                marginBottom: 16
              }}>
                <Text style={{ whiteSpace: 'pre-wrap' }}>{sections.prompt_summary}</Text>
                {sections.full_prompt_length && (
                  <div style={{ marginTop: 8 }}>
                    <Tag color="green">完整长度: {sections.full_prompt_length} 字符</Tag>
                  </div>
                )}
              </div>
              <Divider />
            </>
          )}

          {sections.story_context && (
            <>
              <Title level={5}>故事上下文</Title>
              {sections.story_context.outline && (
                <div style={{ marginBottom: 8 }}>
                  <Tag color="blue">大纲</Tag>
                  <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                    {sections.story_context.outline.substring(0, 100)}...
                  </Text>
                </div>
              )}
              {sections.story_context.volume && (
                <div style={{ marginBottom: 8 }}>
                  <Tag color="cyan">卷纲</Tag>
                  <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                    {sections.story_context.volume.substring(0, 100)}...
                  </Text>
                </div>
              )}
              {sections.story_context.chapters && sections.story_context.chapters.length > 0 && (
                <div>
                  <Tag color="geekblue">章纲</Tag>
                  <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                    {sections.story_context.chapters.length} 个章节
                  </Text>
                </div>
              )}
              <Divider />
            </>
          )}

          {(sections.previous_context || sections.generated_context) && (
            <>
              <Title level={5}>已生成上下文</Title>
              {sections.previous_context && (
                <div style={{ marginBottom: 8 }}>
                  <Tag color="orange">之前批次</Tag>
                  <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                    {sections.previous_context.substring(0, 100)}...
                  </Text>
                </div>
              )}
              {sections.generated_context && (
                <div>
                  <Tag color="gold">同批次</Tag>
                  <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                    {sections.generated_context.substring(0, 100)}...
                  </Text>
                </div>
              )}
            </>
          )}
        </Panel>
      </Collapse>
    );
  };

  // 渲染生成进度和日志
  const renderGenerationStatus = () => {
    if (!isGenerating && generationLogs.length === 0) return null;

    return (
      <Card
        size="small"
        title={
          <Space>
            <Badge status={isGenerating ? "processing" : isAborted ? "error" : "success"} />
            <Text strong>生成状态</Text>
            {isGenerating && <LoadingOutlined />}
          </Space>
        }
        extra={
          isGenerating && (
            <Popconfirm
              title="确认中止生成？"
              description="中止后可以在检查点恢复，但当前元素需要重新生成。"
              onConfirm={handleAbortGeneration}
              okText="确认中止"
              cancelText="继续生成"
              okButtonProps={{ danger: true }}
            >
              <Button
                danger
                size="small"
                icon={<PauseCircleOutlined />}
                loading={loading}
              >
                中止生成
              </Button>
            </Popconfirm>
          )
        }
        style={{ marginTop: 16, marginBottom: 16 }}
      >
        {/* 进度条 */}
        {generationProgress.total > 0 && (
          <div style={{ marginBottom: 16 }}>
            <Progress
              percent={generationProgress.percent}
              status={isAborted ? "exception" : isGenerating ? "active" : "success"}
              format={() => `${generationProgress.current}/${generationProgress.total}`}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              已完成 {generationProgress.current} / {generationProgress.total} 个元素
              {sessionId && (
                <span style={{ marginLeft: 16 }}>
                  会话: {sessionId.slice(-8)}
                </span>
              )}
            </Text>
          </div>
        )}

        {/* 中止状态提示 */}
        {isAborted && (
          <Alert
            type="warning"
            showIcon
            icon={<ExclamationCircleOutlined />}
            message="生成已中止"
            description="您可以在稍后从检查点恢复生成。"
            style={{ marginBottom: 16 }}
          />
        )}

        {/* 日志列表 */}
        {generationLogs.length > 0 && (
          <div style={{
            maxHeight: 300,
            overflow: 'auto',
            background: '#f5f5f5',
            padding: 12,
            borderRadius: 4
          }}>
            <List
              size="small"
              dataSource={generationLogs.slice(-50)}
              renderItem={log => (
                <List.Item style={{ padding: '4px 0', border: 'none' }}>
                  <Space>
                    <Text type="secondary" style={{ fontSize: 11 }}>[{log.timestamp}]</Text>
                    {log.type === 'success' && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
                    {log.type === 'error' && <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
                    {log.type === 'info' && <LoadingOutlined style={{ color: '#1890ff' } } />}
                    <Text style={{
                      color: log.type === 'error' ? '#ff4d4f' :
                             log.type === 'success' ? '#52c41a' : '#000'
                    }}>
                      {log.content}
                    </Text>
                  </Space>
                </List.Item>
              )}
            />
          </div>
        )}

        {/* 输入内容查看 */}
        {renderInputDetails()}
      </Card>
    );
  };

  const renderResult = () => {
    if (!result || !result.data) return null;

    const data = result.data;
    const entries = Object.entries(data).filter(([_, value]) => value);

    return (
      <div className="ai-generate-result">
        <Card size="small" title="生成结果">
          <Descriptions column={1} size="small">
            {entries.map(([key, value]) => (
              <Descriptions.Item key={key} label={key}>
                {typeof value === 'string' && value.length > 100
                  ? <div style={{ whiteSpace: 'pre-wrap' }}>{value}</div>
                  : String(value)
                }
              </Descriptions.Item>
            ))}
          </Descriptions>
        </Card>

        {result.metadata && (
          <div style={{ marginTop: 16, color: '#999', fontSize: 12 }}>
            <Tag>提供商: {result.metadata.provider}</Tag>
            <Tag>Token: {result.metadata.tokens_used}</Tag>
          </div>
        )}

        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Button icon={<ReloadOutlined />} onClick={handleRegenerate} style={{ marginRight: 8 }}>
            重新生成
          </Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
            保存到数据库
          </Button>
        </div>
      </div>
    );
  };

  const tabItems = [
    {
      key: 'input',
      label: '输入',
      children: (
        <Form form={form} layout="vertical">
          {/* 检查点恢复提示 */}
          {renderCheckpointRestore()}

          <Form.Item
            name="entity_type"
            label="实体类型"
            rules={[{ required: true, message: '请选择实体类型' }]}
          >
            <Select placeholder="选择要生成的实体类型">
              {entityTypes.map(entity => (
                <Option key={entity.type} value={entity.type}>
                  {ENTITY_TYPE_LABELS[entity.type] || entity.type}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="prompt"
            label="生成提示"
            rules={[{ required: true, message: '请输入生成提示' }]}
          >
            <TextArea
              rows={4}
              placeholder="描述你想要生成的内容，例如：创建一个来自魔法学院的年轻天才法师..."
            />
          </Form.Item>

          <Form.Item
            name="strategy"
            label="生成策略"
            initialValue="detailed"
          >
            <Select>
              {strategies.map(s => (
                <Option key={s.name} value={s.name}>
                  {STRATEGY_LABELS[s.name] || s.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="style"
            label="风格要求"
          >
            <Input placeholder="例如：东方玄幻风格、西方奇幻风格、科幻风格..." />
          </Form.Item>

          {/* 生成状态显示 */}
          {renderGenerationStatus()}

          <Form.Item>
            <Button onClick={handlePreview} style={{ marginRight: 8 }} disabled={isGenerating}>
              预览提示词
            </Button>
            <Button
              type="primary"
              onClick={handleGenerate}
              loading={isGenerating}
              disabled={isGenerating}
            >
              {isGenerating ? '生成中...' : '开始生成'}
            </Button>
          </Form.Item>
        </Form>
      )
    },
    {
      key: 'preview',
      label: '预览',
      disabled: !previewPrompt,
      children: (
        <>
          <div style={{
            background: '#f5f5f5',
            padding: 16,
            borderRadius: 8,
            maxHeight: 400,
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace'
          }}>
            {previewPrompt}
          </div>
          <div style={{ marginTop: 16 }}>
            <Button
              type="primary"
              onClick={handleGenerate}
              loading={isGenerating}
              disabled={isGenerating}
            >
              {isGenerating ? '生成中...' : '开始生成'}
            </Button>
          </div>
        </>
      )
    },
    {
      key: 'result',
      label: '结果',
      disabled: !result,
      children: renderResult()
    }
  ];

  return (
    <Modal
      title={
        <span>
          <StarOutlined style={{ color: '#1890ff', marginRight: 8 }} />
          AI智能生成
          {isGenerating && (
            <Tag color="processing" style={{ marginLeft: 8 }}>生成中</Tag>
          )}
          {isAborted && (
            <Tag color="warning" style={{ marginLeft: 8 }}>已中止</Tag>
          )}
        </span>
      }
      open={visible}
      onCancel={() => {
        if (isGenerating) {
          Modal.confirm({
            title: '生成正在进行中',
            content: '关闭窗口不会中止生成，您可以在检查点中恢复。确定要关闭吗？',
            onOk: onCancel
          });
        } else {
          onCancel();
        }
      }}
      width={800}
      footer={null}
      destroyOnHidden
    >
      <Spin spinning={loading && !isGenerating}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Spin>
    </Modal>
  );
};

export default AIGenerateModal;

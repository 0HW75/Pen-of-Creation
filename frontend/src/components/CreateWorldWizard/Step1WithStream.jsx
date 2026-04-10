import React, { useState, useRef, useEffect } from 'react';
import { Form, Select, Radio, Card, Typography, Alert, Button, Space, Progress, Input, Divider, message } from 'antd';
import { BookOutlined, FileTextOutlined, ReadOutlined, AppstoreOutlined, PauseCircleOutlined, HistoryOutlined } from '@ant-design/icons';
import { projectApi, blueprintApi, worldviewGenerationApi } from '../../services/api';
import CheckpointRestoreModal from './CheckpointRestoreModal';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Step1WithStream = ({ onComplete, initialData }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [outlines, setOutlines] = useState([]);
  const [volumes, setVolumes] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [contentScopeType, setContentScopeType] = useState('full');
  const [selectedOutline, setSelectedOutline] = useState(null);
  const [selectedVolume, setSelectedVolume] = useState(null);
  const [estimatedWordCount, setEstimatedWordCount] = useState(0);
  
  // 流式输出相关状态
  const [isStreaming, setIsStreaming] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('');
  const [inputContent, setInputContent] = useState('');
  const [outputContent, setOutputContent] = useState('');
  const [streamLog, setStreamLog] = useState([]);
  const [aiStreamContent, setAiStreamContent] = useState(''); // AI实时流式输出内容
  const [currentContext, setCurrentContext] = useState(''); // 当前正在分析的上下文
  const [sessionId, setSessionId] = useState(null); // 生成会话ID
  const [isAborting, setIsAborting] = useState(false); // 是否正在中止
  
  // 检查点恢复相关状态
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [hasCheckpoints, setHasCheckpoints] = useState(false);
  const [checkpointData, setCheckpointData] = useState(null);
  
  const outputRef = useRef(null);
  const aiStreamRef = useRef(null);
  const abortControllerRef = useRef(null); // 用于中止fetch请求

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (initialData.projectId) {
      setSelectedProject(initialData.projectId);
      form.setFieldsValue({ projectId: initialData.projectId });
      loadProjectOutlines(initialData.projectId);
    }
  }, [initialData]);

  // 当选择的项目变化时，检查检查点
  useEffect(() => {
    if (selectedProject) {
      checkAvailableCheckpoints(selectedProject);
    } else {
      setHasCheckpoints(false);
    }
  }, [selectedProject]);

  // 自动滚动到底部
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [streamLog]);

  // AI流式输出自动滚动
  useEffect(() => {
    if (aiStreamRef.current) {
      aiStreamRef.current.scrollTop = aiStreamRef.current.scrollHeight;
    }
  }, [aiStreamContent]);

  // 检查是否有可用的检查点
  const checkAvailableCheckpoints = async (projectId) => {
    if (!projectId) return;
    try {
      const response = await worldviewGenerationApi.getCheckpoints({
        project_id: projectId,
        stage: 'extraction'
      });
      if (response.data?.code === 200) {
        // 后端返回的数据结构是 {total, checkpoints, limit, offset}
        const result = response.data.data || {};
        const checkpoints = (result.checkpoints || []).filter(cp => 
          cp.status === 'in_progress' || cp.status === 'aborted'
        );
        console.log(`找到 ${checkpoints.length} 个可用检查点`);
        setHasCheckpoints(checkpoints.length > 0);
      }
    } catch (error) {
      console.error('检查检查点失败:', error);
    }
  };

  // 处理检查点恢复
  const handleCheckpointRestore = async (data, checkpoint) => {
    console.log('从检查点恢复 - 原始数据:', data);
    setCheckpointData(data);
    
    // 恢复检查点数据 - 后端返回的是 parsed_data
    const cpData = data?.parsed_data || data?.checkpoint_data;
    
    console.log('解析后的检查点数据:', cpData);
    console.log('是否有 merged_result:', !!cpData?.merged_result);
    console.log('merged_result 类型:', typeof cpData?.merged_result);
    console.log('merged_result 内容:', cpData?.merged_result);
    
    if (!cpData) {
      console.error('检查点数据为空');
      throw new Error('检查点数据格式不正确');
    }
    
    // 如果检查点包含提取结果，直接完成
    if (cpData.merged_result && Object.keys(cpData.merged_result).length > 0) {
      message.success(`已恢复检查点 #${checkpoint.id}，提取进度: ${checkpoint.progress_percent || data?.progress_percent}%`);
      
      // 调用完成回调，传递恢复的数据
      try {
        await onComplete({
          projectId: selectedProject,
          contentScope: cpData.content_scope || {},
          extractionResult: {
            elements: cpData.merged_result,
            statistics: cpData.statistics || {},
          },
          storyContext: cpData.story_context || {},
          fromCheckpoint: true,
          checkpointId: checkpoint.id
        });
      } catch (error) {
        console.error('onComplete 调用失败:', error);
        throw error;
      }
    } else {
      console.warn('检查点中没有可恢复的提取结果', cpData);
      throw new Error('检查点中没有可恢复的提取结果');
    }
  };

  const loadProjects = async () => {
    try {
      const response = await projectApi.getProjects();
      if (Array.isArray(response.data)) {
        setProjects(response.data);
      } else if (response.data.code === 200) {
        setProjects(response.data.data);
      }
    } catch (error) {
      console.error('加载项目列表失败:', error);
    }
  };

  const loadProjectOutlines = async (projectId) => {
    try {
      const response = await blueprintApi.getProjectOutline(projectId);
      let outlineData = null;
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        outlineData = response.data[0];
      } else if (response.data.code === 200 && response.data.data) {
        outlineData = response.data.data;
      }
      
      if (outlineData) {
        setOutlines([outlineData]);
        setSelectedOutline(outlineData.id);
        form.setFieldsValue({ outlineId: outlineData.id });
        loadOutlineVolumes(outlineData.id);
        estimateWordCount();
        // 检查是否有可用的检查点
        checkAvailableCheckpoints(projectId);
      } else {
        setOutlines([]);
        setVolumes([]);
        setChapters([]);
        setHasCheckpoints(false);
      }
    } catch (error) {
      console.error('加载大纲失败:', error);
      setOutlines([]);
    }
  };

  const loadOutlineVolumes = async (outlineId) => {
    try {
      const response = await blueprintApi.getOutlineVolumes(outlineId);
      if (Array.isArray(response.data)) {
        setVolumes(response.data);
      } else if (response.data.code === 200) {
        setVolumes(response.data.data);
      }
    } catch (error) {
      console.error('加载卷纲失败:', error);
    }
  };

  const loadVolumeChapters = async (volumeId) => {
    try {
      const response = await blueprintApi.getVolumeChapters(volumeId);
      let loadedChapters = [];
      if (Array.isArray(response.data)) {
        loadedChapters = response.data;
        setChapters(response.data);
      } else if (response.data.code === 200) {
        loadedChapters = response.data.data;
        setChapters(response.data.data);
      }
      setTimeout(() => {
        estimateWordCount();
      }, 0);
    } catch (error) {
      console.error('加载章纲失败:', error);
    }
  };

  const calculateTextLength = (obj) => {
    let length = 0;
    if (!obj || typeof obj !== 'object') return length;
    
    Object.values(obj).forEach(value => {
      if (typeof value === 'string') {
        length += value.length;
      } else if (Array.isArray(value)) {
        value.forEach(item => {
          if (typeof item === 'string') {
            length += item.length;
          } else if (typeof item === 'object') {
            length += calculateTextLength(item);
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        length += calculateTextLength(value);
      }
    });
    return length;
  };

  const estimateWordCount = () => {
    let count = 0;
    
    switch (contentScopeType) {
      case 'full':
        outlines.forEach(outline => {
          count += calculateTextLength(outline);
        });
        break;
      case 'outline':
        const selectedOutlineData = outlines.find(o => o.id === selectedOutline);
        if (selectedOutlineData) {
          count += calculateTextLength(selectedOutlineData);
        }
        break;
      case 'volume':
        const selectedVolumeData = volumes.find(v => v.id === selectedVolume);
        if (selectedVolumeData) {
          count += calculateTextLength(selectedVolumeData);
          const volumeChapters = chapters.filter(c => c.volume_id === selectedVolume);
          volumeChapters.forEach(chapter => {
            count += calculateTextLength(chapter);
          });
        }
        break;
      case 'chapter':
        const selectedChapterData = chapters.find(c => c.id === form.getFieldValue('chapterId'));
        if (selectedChapterData) {
          count += calculateTextLength(selectedChapterData);
        }
        break;
      default:
        break;
    }
    
    setEstimatedWordCount(Math.round(count * 0.5));
  };

  const handleProjectChange = (projectId) => {
    setSelectedProject(projectId);
    loadProjectOutlines(projectId);
    setSelectedOutline(null);
    setSelectedVolume(null);
    setVolumes([]);
    setChapters([]);
    form.setFieldsValue({
      outlineId: undefined,
      volumeId: undefined,
      chapterId: undefined,
    });
  };

  const handleContentScopeChange = (e) => {
    setContentScopeType(e.target.value);
    setTimeout(() => {
      estimateWordCount();
    }, 0);
  };

  const handleOutlineChange = (outlineId) => {
    setSelectedOutline(outlineId);
    loadOutlineVolumes(outlineId);
    setSelectedVolume(null);
    setChapters([]);
    form.setFieldsValue({
      volumeId: undefined,
      chapterId: undefined,
    });
    setTimeout(() => {
      estimateWordCount();
    }, 0);
  };

  const handleVolumeChange = (volumeId) => {
    setSelectedVolume(volumeId);
    loadVolumeChapters(volumeId);
    form.setFieldsValue({
      chapterId: undefined,
    });
    setTimeout(() => {
      estimateWordCount();
    }, 0);
  };

  // 中止提取
  const handleAbortExtraction = async () => {
    if (!sessionId) return;
    
    setIsAborting(true);
    try {
      // 调用API发送中止请求
      await worldviewGenerationApi.abortGeneration({ session_id: sessionId });
      
      // 取消fetch请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      setStreamLog(prev => [...prev, { type: 'system', content: '用户中止了提取过程' }]);
    } catch (error) {
      console.error('中止提取失败:', error);
    } finally {
      setIsAborting(false);
      setIsStreaming(false);
    }
  };

  const handleStartExtraction = async () => {
    const values = await form.validateFields();
    
    const contentScope = {
      type: contentScopeType,
    };

    switch (contentScopeType) {
      case 'outline':
        contentScope.outline_id = values.outlineId;
        break;
      case 'volume':
        contentScope.outline_id = values.outlineId;
        contentScope.volume_id = values.volumeId;
        break;
      case 'chapter':
        contentScope.outline_id = values.outlineId;
        contentScope.volume_id = values.volumeId;
        contentScope.chapter_id = values.chapterId;
        break;
      default:
        break;
    }

    setIsStreaming(true);
    setProgress(0);
    setCurrentStage('准备中...');
    setInputContent('');
    setOutputContent('');
    setStreamLog([]);
    setAiStreamContent('');
    setCurrentContext('');
    setSessionId(null);

    // 创建AbortController用于中止请求
    abortControllerRef.current = new AbortController();

    try {
      const response = await worldviewGenerationApi.extractBlueprintElementsStream({
        project_id: values.projectId,
        content_scope: contentScope,
        extraction_config: {
          target_types: ['characters', 'locations', 'factions', 'items', 'dimensions', 'regions', 'celestial_bodies', 'natural_laws', 'energy_systems', 'civilizations', 'social_classes', 'political_systems', 'economic_systems', 'cultural_customs', 'timeline_events', 'relations'],
          strategy: 'infer_potential',
        },
      }, abortControllerRef.current.signal);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              switch (data.type) {
                case 'start':
                  setCurrentStage('开始提取');
                  setStreamLog(prev => [...prev, { type: 'system', content: data.message }]);
                  break;
                case 'session_id':
                  // 保存会话ID用于中止
                  setSessionId(data.session_id);
                  break;
                case 'input':
                  setCurrentStage(`正在分析: ${data.stage}`);
                  setInputContent(data.content);
                  setCurrentContext(data.context || data.stage);
                  // 开始新分析时清空AI流式内容
                  setAiStreamContent('');
                  setStreamLog(prev => [...prev, { 
                    type: 'input', 
                    stage: data.stage, 
                    content: data.content,
                    context: data.context,
                    volume: data.volume,
                    chapter: data.chapter 
                  }]);
                  break;
                case 'output':
                  setOutputContent(prev => prev + '\n' + data.content);
                  setStreamLog(prev => [...prev, { 
                    type: 'output', 
                    content: data.content,
                    chapter: data.chapter 
                  }]);
                  break;
                case 'ai_stream':
                  // AI实时流式输出
                  setAiStreamContent(prev => prev + data.content);
                  break;
                case 'progress':
                  setProgress(data.progress);
                  setCurrentStage(`${data.stage}: ${data.current}/${data.total}`);
                  break;
                case 'complete':
                  setProgress(100);
                  setCurrentStage('提取完成');
                  setStreamLog(prev => [...prev, { type: 'system', content: data.message }]);
                  onComplete({
                    projectId: values.projectId,
                    contentScope,
                    extractionResult: {
                      elements: data.elements,
                      statistics: data.statistics,
                    },
                    storyContext: data.story_context,
                    checkpointId: sessionId,
                  });
                  break;
                case 'aborted':
                  setStreamLog(prev => [...prev, { type: 'system', content: '提取已中止' }]);
                  break;
                case 'error':
                  setStreamLog(prev => [...prev, { type: 'error', content: data.message }]);
                  break;
              }
            } catch (e) {
              console.error('解析流数据失败:', e);
            }
          }
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('提取已被用户中止');
        setStreamLog(prev => [...prev, { type: 'system', content: '提取已中止' }]);
      } else {
        console.error('流式提取失败:', error);
        setStreamLog(prev => [...prev, { type: 'error', content: '提取失败: ' + error.message }]);
      }
    } finally {
      setIsStreaming(false);
      setIsAborting(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div style={{ padding: '20px 0' }}>
      <Title level={4} style={{ marginBottom: 24 }}>
        选择故事蓝图内容
      </Title>

      <Form form={form} layout="vertical">
        <Form.Item
          name="projectId"
          label="选择项目"
          rules={[{ required: true, message: '请选择一个项目' }]}
        >
          <Select
            placeholder="请选择项目"
            onChange={handleProjectChange}
            style={{ width: '100%' }}
          >
            {projects.map(project => (
              <Option key={project.id} value={project.id}>
                <Space>
                  <BookOutlined />
                  {project.title || project.name || '未命名项目'}
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>

        {selectedProject && (
          <>
            <Form.Item label="内容范围">
              <Radio.Group value={contentScopeType} onChange={handleContentScopeChange}>
                <Space direction="vertical">
                  <Radio value="full">
                    <Space><AppstoreOutlined />使用整个故事蓝图</Space>
                  </Radio>
                  <Radio value="outline">
                    <Space><FileTextOutlined />使用选定大纲的全部内容</Space>
                  </Radio>
                  <Radio value="volume">
                    <Space><ReadOutlined />使用选定卷纲的全部内容</Space>
                  </Radio>
                  <Radio value="chapter">
                    <Space><BookOutlined />使用选定章纲的内容</Space>
                  </Radio>
                </Space>
              </Radio.Group>
            </Form.Item>

            {outlines.length === 0 && (
              <Alert
                message="该项目暂无故事蓝图"
                description="请先创建故事大纲，或选择其他项目"
                type="warning"
                showIcon
                style={{ marginTop: 16 }}
              />
            )}

            {outlines.length > 0 && contentScopeType !== 'full' && (
              <Form.Item
                name="outlineId"
                label="选择大纲"
                rules={[{ required: true, message: '请选择大纲' }]}
              >
                <Select
                  placeholder="请选择大纲"
                  onChange={handleOutlineChange}
                  style={{ width: '100%' }}
                >
                  {outlines.map(outline => (
                    <Option key={outline.id} value={outline.id}>
                      {outline.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            {contentScopeType === 'volume' || contentScopeType === 'chapter' ? (
              <Form.Item
                name="volumeId"
                label="选择卷纲"
                rules={[{ required: true, message: '请选择卷纲' }]}
              >
                <Select
                  placeholder="请选择卷纲"
                  onChange={handleVolumeChange}
                  style={{ width: '100%' }}
                  disabled={!selectedOutline}
                >
                  {volumes.map(volume => (
                    <Option key={volume.id} value={volume.id}>
                      {volume.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            ) : null}

            {contentScopeType === 'chapter' && (
              <Form.Item
                name="chapterId"
                label="选择章纲"
                rules={[{ required: true, message: '请选择章纲' }]}
              >
                <Select
                  placeholder="请选择章纲"
                  style={{ width: '100%' }}
                  disabled={!selectedVolume}
                >
                  {chapters.map(chapter => (
                    <Option key={chapter.id} value={chapter.id}>
                      {chapter.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            <Card size="small" style={{ marginTop: 16, backgroundColor: '#f6ffed' }}>
              <Text strong>预计分析字数：</Text>
              <Text>约 {estimatedWordCount.toLocaleString()} 字</Text>
            </Card>
          </>
        )}

        <Form.Item style={{ marginTop: 32, textAlign: 'right' }}>
          <Space>
            {hasCheckpoints && !isStreaming && (
              <Button
                type="default"
                size="large"
                icon={<HistoryOutlined />}
                onClick={() => setShowRestoreModal(true)}
                style={{ 
                  backgroundColor: '#fff7e6', 
                  borderColor: '#ffa940',
                  color: '#d46b08'
                }}
              >
                恢复之前的进度
              </Button>
            )}
            <Button
              type="primary"
              size="large"
              onClick={handleStartExtraction}
              loading={isStreaming}
              disabled={!selectedProject || (contentScopeType !== 'full' && !selectedOutline)}
            >
              {isStreaming ? '提取中...' : '开始提取设定元素'}
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 流式输出显示区域 */}
      {isStreaming && (
        <Card 
          style={{ marginTop: 24 }} 
          title="提取进度"
          extra={
            <Button
              danger
              icon={<PauseCircleOutlined />}
              onClick={handleAbortExtraction}
              loading={isAborting}
              disabled={!sessionId}
            >
              中止提取
            </Button>
          }
        >
          <Progress percent={progress} status={progress === 100 ? 'success' : 'active'} />
          <Text type="secondary">{currentStage}</Text>
          
          <Divider />
          
          <div style={{ display: 'flex', gap: 16, height: 500 }}>
            {/* 输入内容显示 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Text strong>正在分析的原文：</Text>
              <TextArea
                value={inputContent}
                readOnly
                style={{ flex: 1, marginTop: 8, backgroundColor: '#f5f5f5' }}
              />
            </div>
            
            {/* AI实时流式输出显示 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Text strong>
                AI 实时输出
                {currentContext && <span style={{ color: '#1890ff', marginLeft: 8 }}>({currentContext})</span>}
                <span style={{ 
                  display: 'inline-block', 
                  width: 8, 
                  height: 8, 
                  backgroundColor: '#52c41a', 
                  borderRadius: '50%', 
                  marginLeft: 8,
                  animation: 'pulse 1s infinite'
                }} />
              </Text>
              <div
                ref={aiStreamRef}
                style={{
                  flex: 1,
                  marginTop: 8,
                  padding: 12,
                  backgroundColor: '#f6ffed',
                  border: '1px solid #b7eb8f',
                  borderRadius: 6,
                  overflowY: 'auto',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {aiStreamContent || <span style={{ color: '#999' }}>等待AI响应...</span>}
              </div>
            </div>
            
            {/* 输出日志显示 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Text strong>处理日志：</Text>
              <div
                ref={outputRef}
                style={{
                  flex: 1,
                  marginTop: 8,
                  padding: 12,
                  backgroundColor: '#f0f8ff',
                  border: '1px solid #d9d9d9',
                  borderRadius: 6,
                  overflowY: 'auto',
                  fontFamily: 'monospace',
                  fontSize: 12,
                }}
              >
                {streamLog.map((log, index) => (
                  <div key={index} style={{ marginBottom: 8 }}>
                    {log.type === 'input' && (
                      <div style={{ color: '#1890ff' }}>
                        <strong>[输入] {log.context || log.stage}</strong>
                      </div>
                    )}
                    {log.type === 'output' && (
                      <div style={{ color: '#52c41a' }}>
                        <strong>[结果]</strong> {log.content}
                      </div>
                    )}
                    {log.type === 'system' && (
                      <div style={{ color: '#666' }}>
                        <strong>[系统]</strong> {log.content}
                      </div>
                    )}
                    {log.type === 'error' && (
                      <div style={{ color: '#f5222d' }}>
                        <strong>[错误]</strong> {log.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* 添加CSS动画 */}
          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.3; }
            }
          `}</style>
        </Card>
      )}

      {/* 检查点恢复弹窗 */}
      <CheckpointRestoreModal
        visible={showRestoreModal}
        onCancel={() => setShowRestoreModal(false)}
        onRestore={handleCheckpointRestore}
        projectId={selectedProject}
        stage="extraction"
      />
    </div>
  );
};

export default Step1WithStream;

import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Progress, Space, Typography, Row, Col, List, Tag, message, Collapse, Divider, Popconfirm, Modal } from 'antd';
import {
  PlayCircleOutlined, CheckCircleOutlined, LoadingOutlined,
  ThunderboltOutlined, UserOutlined, EnvironmentOutlined, TeamOutlined,
  GlobalOutlined, BankOutlined, ShoppingOutlined, HistoryOutlined, LinkOutlined,
  FileTextOutlined, BookOutlined, ReadOutlined, DatabaseOutlined, PaperClipOutlined,
  PauseCircleOutlined, HistoryOutlined as HistoryIcon
} from '@ant-design/icons';
import { worldviewGenerationApi, worldApi, characterApi, locationApi, factionApi, itemApi, settingApi, worldSettingApi } from '../../services/api';
import CheckpointRestoreModal from './CheckpointRestoreModal';

const { Title, Text } = Typography;
const { Panel } = Collapse;

// 批次类型配置
const batchTypeConfig = {
  energy_system: { title: '能量体系', icon: <ThunderboltOutlined />, color: '#f5222d', priority: 'P0' },
  character: { title: '角色设定', icon: <UserOutlined />, color: '#1890ff', priority: 'P0' },
  location: { title: '地点场景', icon: <EnvironmentOutlined />, color: '#52c41a', priority: 'P0' },
  faction: { title: '组织势力', icon: <TeamOutlined />, color: '#fa8c16', priority: 'P1' },
  world_architecture: { title: '世界架构', icon: <GlobalOutlined />, color: '#722ed1', priority: 'P1' },
  civilization: { title: '文明体系', icon: <BankOutlined />, color: '#13c2c2', priority: 'P1' },
  item: { title: '物品资源', icon: <ShoppingOutlined />, color: '#eb2f96', priority: 'P2' },
  historical_event: { title: '历史脉络', icon: <HistoryOutlined />, color: '#fa541c', priority: 'P2' },
  relation: { title: '关系网络', icon: <LinkOutlined />, color: '#2f54eb', priority: 'P3' },
};

// 提示词结构显示组件
const PromptStructureDisplay = ({ sections }) => {
  if (!sections) return <Text type="secondary">等待数据...</Text>;

  const { element, story_context, generated_context, previous_context } = sections;

  const sectionStyle = {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    border: '1px solid',
  };

  const headerStyle = {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 8,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  const contentStyle = {
    fontSize: 12,
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 8 }}>
      {/* 目标元素信息 - 蓝色 */}
      <div style={{ ...sectionStyle, backgroundColor: '#e6f7ff', borderColor: '#91d5ff' }}>
        <div style={{ ...headerStyle, color: '#1890ff' }}>
          <FileTextOutlined />
          目标元素信息
        </div>
        <div style={contentStyle}>
          <div><strong>名称：</strong>{element?.name || '未命名'}</div>
          <div><strong>类型：</strong>{element?.type || '未知'}</div>
          <div><strong>简介：</strong>{element?.brief || '无'}</div>
          <div><strong>证据：</strong>{element?.evidence || '无'}</div>
        </div>
      </div>

      {/* 故事背景上下文 - 绿色 */}
      {(story_context?.outline || story_context?.volume || (story_context?.chapters?.length > 0)) && (
        <div style={{ ...sectionStyle, backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }}>
          <div style={{ ...headerStyle, color: '#52c41a' }}>
            <BookOutlined />
            故事背景上下文
          </div>
          <Collapse ghost size="small">
            {story_context?.outline && (
              <Panel header="大纲内容" key="outline">
                <div style={{ ...contentStyle, color: '#389e0d' }}>{story_context.outline}</div>
              </Panel>
            )}
            {story_context?.volume && (
              <Panel header="卷纲内容" key="volume">
                <div style={{ ...contentStyle, color: '#389e0d' }}>{story_context.volume}</div>
              </Panel>
            )}
            {story_context?.chapters?.length > 0 && (
              <Panel header={`章纲内容 (${story_context.chapters.length}个)`} key="chapters">
                {story_context.chapters.map((chapter, idx) => (
                  <div key={idx} style={{ marginBottom: 8, padding: 8, backgroundColor: '#f0f0f0', borderRadius: 4 }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>章纲 {idx + 1}</Text>
                    <div style={{ ...contentStyle, color: '#389e0d', marginTop: 4 }}>{chapter}</div>
                  </div>
                ))}
              </Panel>
            )}
          </Collapse>
        </div>
      )}

      {/* 之前批次已生成内容 - 深蓝色 */}
      {previous_context && (
        <div style={{ ...sectionStyle, backgroundColor: '#e6f4ff', borderColor: '#91caff' }}>
          <div style={{ ...headerStyle, color: '#0958d9' }}>
            <BookOutlined />
            之前批次已生成内容（跨类型上下文）
          </div>
          <div style={{ ...contentStyle, color: '#0958d9' }}>{previous_context}</div>
        </div>
      )}

      {/* 同批次已生成内容 - 橙色 */}
      {generated_context && (
        <div style={{ ...sectionStyle, backgroundColor: '#fff7e6', borderColor: '#ffd591' }}>
          <div style={{ ...headerStyle, color: '#fa8c16' }}>
            <PaperClipOutlined />
            同批次已生成内容
          </div>
          <div style={{ ...contentStyle, color: '#d46b08' }}>{generated_context}</div>
        </div>
      )}

      {/* 数据库已有内容 - 紫色 */}
      <div style={{ ...sectionStyle, backgroundColor: '#f9f0ff', borderColor: '#d3adf7' }}>
        <div style={{ ...headerStyle, color: '#722ed1' }}>
          <DatabaseOutlined />
          数据库已有设定（自动获取相关类型）
        </div>
        <Text type="secondary" style={{ fontSize: 12 }}>
          根据当前生成类型，系统会自动从数据库获取相关的已有设定作为上下文
        </Text>
      </div>
    </div>
  );
};

const Step3Generate = ({ generationSessionId, batches, onComplete, onPrev, projectId, worldId, storyContext }) => {
  const [batchStatuses, setBatchStatuses] = useState({});
  const [currentBatchIndex, setCurrentBatchIndex] = useState(-1);
  const [generating, setGenerating] = useState(false);
  const [completedBatches, setCompletedBatches] = useState([]);
  const [generatedResults, setGeneratedResults] = useState({});
  
  // 检查点恢复相关状态
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [hasCheckpoints, setHasCheckpoints] = useState(false);
  
  // 跨批次累积的所有已生成结果（用于传递给后续批次作为上下文）
  const [allGeneratedResults, setAllGeneratedResults] = useState([]);
  const allGeneratedResultsRef = useRef([]); // 用于保存实时值

  // 流式输出相关状态
  const [showStreamPanel, setShowStreamPanel] = useState(false);
  const [currentBatchName, setCurrentBatchName] = useState('');
  const [inputSections, setInputSections] = useState(null); // 结构化的输入数据
  const [aiStreamContent, setAiStreamContent] = useState('');
  const [streamLog, setStreamLog] = useState([]);
  const [currentElement, setCurrentElement] = useState('');
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentElementIndex, setCurrentElementIndex] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // 中止相关状态
  const [sessionId, setSessionId] = useState(null);
  const [isAborting, setIsAborting] = useState(false);
  const abortControllerRef = useRef(null);

  const outputRef = useRef(null);
  const aiStreamRef = useRef(null);

  // 初始化批次状态
  useEffect(() => {
    const initialStatuses = {};
    batches.forEach(batch => {
      initialStatuses[batch.batch_id] = {
        status: 'pending',
        progress: 0,
        results: [],
      };
    });
    setBatchStatuses(initialStatuses);
    
    // 检查是否有可用的检查点
    if (projectId) {
      checkAvailableCheckpoints();
    }
  }, [batches, projectId]);
  
  // 检查是否有可用的检查点
  const checkAvailableCheckpoints = async () => {
    if (!projectId) return;
    try {
      const response = await worldviewGenerationApi.getCheckpoints({
        project_id: projectId,
        stage: 'generation'
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
    
    // 恢复检查点数据 - 后端返回的是 parsed_data
    const cpData = data?.parsed_data || data?.checkpoint_data;
    
    console.log('解析后的检查点数据:', cpData);
    console.log('检查结果点字段:', {
      has_generated_results: !!cpData?.generated_results,
      has_results: !!cpData?.results,
      has_elements: !!cpData?.elements,
      has_merged_result: !!cpData?.merged_result,
    });
    
    if (!cpData) {
      console.error('检查点数据为空');
      throw new Error('检查点数据格式不正确');
    }
    
    // 恢复已生成的结果 - 后端使用 'results' 字段
    const generatedResults = cpData.results || cpData.generated_results;
    
    // 获取批次配置中的 batch_id
    const batchConfig = cpData.batch_config || {};
    const batchId = batchConfig.batch_id || checkpoint.session_id || 'unknown';
    
    if (generatedResults && generatedResults.length > 0) {
      console.log(`恢复 ${generatedResults.length} 个生成结果，批次ID: ${batchId}`);
      console.log('当前 batches:', batches.map(b => ({ id: b.batch_id, name: b.batch_name })));
      console.log('检查点 batchConfig:', batchConfig);
      
      // 为每个结果添加 batch_id（如果后端没有添加）
      const resultsWithBatchId = generatedResults.map(result => ({
        ...result,
        batch_id: result.batch_id || batchId
      }));
      
      // 累积结果，而不是覆盖（避免多个检查点恢复时丢失之前的数据）
      const existingResults = allGeneratedResultsRef.current || [];
      const existingIds = new Set(existingResults.map(r => r.element_id));
      const newResults = resultsWithBatchId.filter(r => !existingIds.has(r.element_id));
      const combinedResults = [...existingResults, ...newResults];
      
      setAllGeneratedResults(combinedResults);
      allGeneratedResultsRef.current = combinedResults; // 同步更新 ref
      console.log(`[handleCheckpointRestore] 累积结果: 原有 ${existingResults.length} 个 + 新增 ${newResults.length} 个 = 共 ${combinedResults.length} 个`);
      
      // 按批次组织结果
      const resultsByBatch = {};
      resultsWithBatchId.forEach(result => {
        const resultBatchId = result.batch_id || 'unknown';
        if (!resultsByBatch[resultBatchId]) {
          resultsByBatch[resultBatchId] = [];
        }
        resultsByBatch[resultBatchId].push(result);
      });
      setGeneratedResults(resultsByBatch);
      console.log('按批次组织的结果:', resultsByBatch);
      
      // 更新批次状态 - 使用 batchId 来更新对应批次
      const restoredStatuses = { ...batchStatuses };
      console.log('恢复前的 batchStatuses:', restoredStatuses);
      
      // 先初始化所有批次状态（如果还没有初始化）
      batches.forEach(batch => {
        if (!restoredStatuses[batch.batch_id]) {
          restoredStatuses[batch.batch_id] = {
            status: 'pending',
            progress: 0,
            results: []
          };
        }
      });
      
      // 尝试匹配批次 - 首先按 batch_id，然后按 entity_type
      let matchedBatchId = batchId;
      const batchIds = batches.map(b => b.batch_id);
      
      // 如果 batchId 不在 batches 中，尝试找到匹配的
      if (!batchIds.includes(batchId)) {
        console.log(`批次ID ${batchId} 不在当前batches中，尝试匹配...`);
        
        // 获取检查点中的 entity_type
        const checkpointEntityType = batchConfig.entity_type;
        console.log(`检查点 entity_type: ${checkpointEntityType}`);
        
        // 尝试根据 entity_type 匹配批次
        if (checkpointEntityType) {
          const matchedBatch = batches.find(b => b.type === checkpointEntityType);
          if (matchedBatch) {
            matchedBatchId = matchedBatch.batch_id;
            console.log(`根据 entity_type ${checkpointEntityType} 匹配到批次: ${matchedBatchId}`);
          }
        }
        
        // 如果还是没有匹配到，尝试使用 session_id 匹配
        if (matchedBatchId === batchId && checkpoint.session_id && batchIds.includes(checkpoint.session_id)) {
          matchedBatchId = checkpoint.session_id;
        }
        
        // 如果只有一个批次，默认使用第一个
        if (matchedBatchId === batchId && batches.length === 1) {
          matchedBatchId = batches[0].batch_id;
          console.log(`只有一个批次，使用第一个批次ID: ${matchedBatchId}`);
        }
      }
      
      // 更新已恢复的批次状态
      if (restoredStatuses[matchedBatchId]) {
        restoredStatuses[matchedBatchId].status = 'completed';
        restoredStatuses[matchedBatchId].progress = 100;
        restoredStatuses[matchedBatchId].results = resultsByBatch[batchId] || resultsWithBatchId;
        console.log(`已更新批次 ${matchedBatchId} 状态为 completed`);
      } else {
        console.warn(`未找到匹配的批次ID: ${matchedBatchId}`);
      }
      
      setBatchStatuses(restoredStatuses);
      console.log('恢复后的 batchStatuses:', restoredStatuses);
      
      // 更新已完成批次列表
      setCompletedBatches(prev => {
        if (!prev.includes(matchedBatchId)) {
          return [...prev, matchedBatchId];
        }
        return prev;
      });
      
      message.success(`已恢复检查点 #${checkpoint.id}，生成进度: ${checkpoint.progress_percent || data?.progress_percent || 0}%`);
    } else if (cpData.merged_result) {
      // 如果是提取阶段的检查点，也尝试恢复
      console.log('检测到提取阶段检查点');
      message.info('检测到提取阶段检查点，将跳转到提取步骤');
    } else {
      console.warn('检查点中没有可恢复的生成结果', cpData);
      throw new Error('检查点中没有可恢复的生成结果');
    }
  };

  // 自动滚动
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [streamLog]);

  useEffect(() => {
    if (aiStreamRef.current) {
      aiStreamRef.current.scrollTop = aiStreamRef.current.scrollHeight;
    }
  }, [aiStreamContent]);

  // 中止生成
  const handleAbortGeneration = async () => {
    if (!sessionId) return;
    
    setIsAborting(true);
    try {
      // 调用API发送中止请求
      await worldviewGenerationApi.abortGeneration({ session_id: sessionId });
      
      // 取消fetch请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      setStreamLog(prev => [...prev, { type: 'system', content: '用户中止了生成过程' }]);
      message.info('已发送中止请求');
    } catch (error) {
      console.error('中止生成失败:', error);
      message.error('中止请求失败');
    } finally {
      setIsAborting(false);
      setGenerating(false);
    }
  };

  const handleGenerateBatch = async (batchIndex) => {
    const batch = batches[batchIndex];
    if (!batch) return;

    setCurrentBatchIndex(batchIndex);
    setGenerating(true);
    setShowStreamPanel(true);
    setCurrentBatchName(batch.batch_name);

    // 重置流式输出状态
    setInputSections(null);
    setAiStreamContent('');
    setStreamLog([]);
    setCurrentElement('');
    setCurrentProgress(0);
    setCurrentElementIndex(0);
    setTotalElements(batch.elements?.length || 0);
    setSessionId(null);

    // 创建AbortController用于中止请求
    abortControllerRef.current = new AbortController();

    // 更新状态为生成中
    setBatchStatuses(prev => ({
      ...prev,
      [batch.batch_id]: { ...prev[batch.batch_id], status: 'generating', progress: 0 }
    }));

    try {
      // 使用流式API，传递故事上下文和之前所有已生成的结果
      const response = await worldviewGenerationApi.executeBatchGenerationStream({
        batch_id: batch.batch_id,
        entity_type: batch.type,
        elements: batch.elements,
        world_id: worldId,
        project_id: projectId,
        story_context: storyContext || {}, // 传递故事上下文（大纲、卷纲、章纲）
        previous_results: allGeneratedResults, // 传递之前所有已生成的结果作为上下文
      }, abortControllerRef.current.signal);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let batchResults = [];

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
                  setStreamLog(prev => [...prev, { type: 'system', content: data.message }]);
                  // 保存会话ID
                  if (data.session_id) {
                    setSessionId(data.session_id);
                  }
                  break;

                case 'session_id':
                  // 保存会话ID用于中止
                  setSessionId(data.session_id);
                  break;

                case 'progress':
                  setCurrentProgress(data.progress);
                  setCurrentElementIndex(data.current);
                  setTotalElements(data.total);
                  setCurrentElement(data.element_name);
                  setBatchStatuses(prev => ({
                    ...prev,
                    [batch.batch_id]: { ...prev[batch.batch_id], progress: data.progress }
                  }));
                  break;

                case 'input':
                  // 使用结构化的sections数据
                  if (data.sections) {
                    setInputSections(data.sections);
                  }
                  setCurrentElement(data.element);
                  setAiStreamContent(''); // 清空之前的AI输出
                  setStreamLog(prev => [...prev, {
                    type: 'input',
                    element: data.element,
                    content: data.content
                  }]);
                  break;

                case 'output':
                  setStreamLog(prev => [...prev, { type: 'output', content: data.content }]);
                  break;

                case 'ai_stream':
                  setAiStreamContent(prev => prev + data.content);
                  break;

                case 'complete':
                  batchResults = data.results || [];
                  setStreamLog(prev => [...prev, { type: 'system', content: data.message }]);

                  // 更新状态为完成
                  setBatchStatuses(prev => ({
                    ...prev,
                    [batch.batch_id]: {
                      ...prev[batch.batch_id],
                      status: 'completed',
                      progress: 100,
                      results: batchResults
                    }
                  }));

                  setGeneratedResults(prev => ({
                    ...prev,
                    [batch.batch_id]: batchResults
                  }));

                  // 将当前批次的成功结果添加到跨批次累积结果中（去重）
                  const successfulResults = batchResults.filter(r => r.success);
                  const existingResults = allGeneratedResultsRef.current || [];
                  const existingIds = new Set(existingResults.map(r => r.element_id));
                  const uniqueNewResults = successfulResults.filter(r => !existingIds.has(r.element_id));
                  const newResults = [...existingResults, ...uniqueNewResults];
                  allGeneratedResultsRef.current = newResults;
                  setAllGeneratedResults(newResults);
                  console.log('已累积生成结果:', newResults.length, '个（新增', uniqueNewResults.length, '个）');

                  setCompletedBatches(prev => [...prev, batch.batch_id]);
                  message.success(`${batch.batch_name} 生成完成！成功 ${data.success_count}/${data.total}`);
                  break;

                case 'aborted':
                  setStreamLog(prev => [...prev, { type: 'system', content: '生成已中止' }]);
                  message.info('生成已中止');
                  break;

                case 'error':
                  setStreamLog(prev => [...prev, { type: 'error', content: data.message }]);
                  throw new Error(data.message);
              }
            } catch (e) {
              console.error('解析流数据失败:', e);
            }
          }
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('生成已被用户中止');
        setStreamLog(prev => [...prev, { type: 'system', content: '生成已中止' }]);
        message.info('生成已中止');
      } else {
        console.error('生成批次失败:', error);
        setBatchStatuses(prev => ({
          ...prev,
          [batch.batch_id]: {
            ...prev[batch.batch_id],
            status: 'failed',
            progress: 0
          }
        }));
        message.error(`${batch.batch_name} 生成失败：${error.message}`);
      }
    } finally {
      setGenerating(false);
      setIsAborting(false);
      abortControllerRef.current = null;
    }
  };

  const handleGenerateAll = async () => {
    for (let i = 0; i < batches.length; i++) {
      if (batchStatuses[batches[i].batch_id]?.status !== 'completed') {
        await handleGenerateBatch(i);
        // 等待当前批次完成
        await new Promise(resolve => {
          const checkInterval = setInterval(() => {
            if (batchStatuses[batches[i].batch_id]?.status === 'completed' ||
                batchStatuses[batches[i].batch_id]?.status === 'failed') {
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);
        });
      }
    }
  };

  const handleComplete = async () => {
    console.log('handleComplete 被调用');
    console.log('batchStatuses:', batchStatuses);
    console.log('batches:', batches);
    
    // 检查是否有已完成的批次
    const completedCount = batches.filter(batch =>
      batchStatuses[batch.batch_id]?.status === 'completed'
    ).length;
    
    console.log('已完成批次数量:', completedCount);
    console.log('allGeneratedResultsRef.current:', allGeneratedResultsRef.current);

    // 如果没有完成任何批次，提示用户
    if (completedCount === 0) {
      message.warning('请至少生成一个批次的设定');
      return;
    }

    // 收集所有已生成的结果
    const worldData = {
      name: `世界观_${new Date().toLocaleDateString()}`,
      description: '从故事蓝图生成的世界观',
      project_id: projectId,
      generation_session_id: generationSessionId,
      generated_elements: allGeneratedResultsRef.current,
      story_context: storyContext,
    };
    
    console.log('准备创建世界，数据:', worldData);

    // 如果部分完成，显示确认对话框
    if (completedCount < batches.length) {
      Modal.confirm({
        title: '部分批次未完成',
        content: `已完成 ${completedCount}/${batches.length} 个批次。确定要现在完成创建吗？您可以在之后继续添加其他设定。`,
        okText: '确定完成',
        cancelText: '继续生成',
        onOk: async () => {
          console.log('用户确认创建世界');
          await createWorld(worldData);
        }
      });
    } else {
      // 全部完成，直接创建
      console.log('全部完成，直接创建世界');
      await createWorld(worldData);
    }
  };

  // 创建世界的辅助函数
  const createWorld = async (worldData) => {
    console.log('createWorld 被调用，数据:', worldData);
    try {
      message.loading('正在创建世界观...', 0);

      // 调用API创建世界
      console.log('调用 worldApi.createWorld');
      const response = await worldApi.createWorld({
        name: worldData.name,
        description: worldData.description,
        project_id: worldData.project_id,
      });
      
      console.log('createWorld 响应:', response);

      if (response.data?.code === 200 || response.data?.id) {
        const worldId = response.data.data?.id || response.data.id;
        console.log('世界观创建成功，ID:', worldId);
        message.success('世界观创建成功！');

        // 保存生成的设定元素
        console.log('开始保存生成的设定元素');
        await saveGeneratedElements(worldId);

        console.log('调用 onComplete');
        onComplete(worldId);
      } else {
        console.error('创建世界观失败:', response.data);
        message.error('创建世界观失败：' + (response.data?.message || '未知错误'));
      }
    } catch (error) {
      console.error('创建世界观失败:', error);
      message.error('创建世界观失败：' + (error.response?.data?.message || error.message));
    } finally {
      message.destroy();
    }
  };

  // 保存生成的设定元素
  const saveGeneratedElements = async (worldId) => {
    console.log('saveGeneratedElements 被调用');
    
    // 使用 ref 获取实时值
    const resultsToSave = allGeneratedResultsRef.current;
    console.log('allGeneratedResults (from ref):', resultsToSave);
    console.log('allGeneratedResults 长度:', resultsToSave?.length);
    
    if (!resultsToSave || resultsToSave.length === 0) {
      console.log('没有生成的设定元素需要保存');
      message.warning('没有生成的设定元素需要保存');
      return;
    }

    console.log('开始保存生成的设定元素，数量:', resultsToSave.length);
    console.log('每个结果的 element_type:', resultsToSave.map(r => ({ 
      id: r.element_id, 
      name: r.element_name, 
      type: r.element_type,
      hasData: !!r.data 
    })));
    message.loading('正在保存设定元素...', 0);
    let savedCount = 0;
    let failedCount = 0;

    try {
      for (const result of resultsToSave) {
        console.log('处理元素:', result);
        
        if (!result.success || !result.data) {
          console.log('跳过无效结果:', result);
          continue;
        }

        try {
          // 后端返回的数据结构: { element_id, element_name, data: {...}, success, sources: [...], source_chapter: {...} }
          const elementData = result.data;  // 这是生成的详细数据
          const elementName = result.element_name || elementData?.name || '未命名';
          
          // 获取来源章节信息（用于维护章节出现索引）
          const sourceChapters = result.sources || (result.source_chapter ? [result.source_chapter] : []);
          
          // 从批次信息中获取元素类型
          let elementType = result.element_type;
          console.log(`[saveGeneratedElements] 后端返回的 element_type: ${elementType}, element_id: ${result.element_id}`);
          
          if (!elementType) {
            // 尝试从 element_id 推断类型
            const elementId = result.element_id || '';
            console.log(`[saveGeneratedElements] 尝试从 element_id 推断: ${elementId}`);
            
            if (elementId.includes('energy') || elementId.includes('system')) {
              elementType = 'energy_system';
            } else if (elementId.includes('char')) {  // char_001, character_001 都匹配
              elementType = 'character';
            } else if (elementId.includes('loc')) {  // loc_001, location_001 都匹配
              elementType = 'location';
            } else if (elementId.includes('faction') || elementId.includes('fac_')) {
              elementType = 'faction';
            } else if (elementId.includes('item') || elementId.includes('itm_')) {
              elementType = 'item';
            } else if (elementId.includes('world') || elementId.includes('arch') || elementId.includes('dim_')) {
              elementType = 'world_architecture';
            } else {
              // 使用名称和数据推断
              console.log(`[saveGeneratedElements] 使用 inferElementType 推断类型`);
              elementType = inferElementType(elementName, elementData);
            }
          }
          
          console.log(`[saveGeneratedElements] 最终元素类型: name=${elementName}, type=${elementType}, id=${result.element_id}`);
          console.log('元素数据:', elementData);

          switch (elementType) {
            case 'character':
              await characterApi.createCharacter({
                project_id: projectId,
                world_id: worldId,
                name: elementData.name || elementName,
                description: elementData.description || '',
                character_type: elementData.character_type || elementData.role_type || '配角',
                role_type: elementData.role_type || elementData.character_type || '配角',
                status: elementData.status || '存活',
                importance_level: elementData.importance_level || 5,
                race: elementData.race || '',
                gender: elementData.gender || '',
                age: elementData.age || 0,
                birth_date: elementData.birth_date || '',
                appearance: elementData.appearance || '',
                appearance_age: elementData.appearance_age || elementData.age || 0,
                distinguishing_features: elementData.distinguishing_features || '',
                personality: elementData.personality || '',
                core_traits: elementData.core_traits || '',
                psychological_fear: elementData.psychological_fear || '',
                values: elementData.values || '',
                psychological_trauma: elementData.psychological_trauma || '',
                background: elementData.background || '',
                birthplace: elementData.birthplace || '',
                nationality: elementData.nationality || '',
                family_background: elementData.family_background || '',
                occupation: elementData.occupation || elementData.profession || '',
                faction: elementData.faction || elementData.affiliation || '',
                current_location: elementData.current_location || '',
                ability_levels: elementData.ability_levels || '',
                ability_limits: elementData.ability_limits || '',
                special_abilities: elementData.special_abilities || elementData.abilities || '',
                physical_abilities: elementData.physical_abilities || '',
                intelligence_perception: elementData.intelligence_perception || '',
                special_talents: elementData.special_talents || '',
                character_arc: elementData.character_arc || '',
                motivation: elementData.motivation || '',
                secrets: elementData.secrets || '',
                growth_experience: elementData.growth_experience || '',
                important_turning_points: elementData.important_turning_points || '',
                source_chapters: sourceChapters,
              });
              savedCount++;
              console.log('角色保存成功:', elementName);
              break;

            case 'location':
              await locationApi.createLocation({
                project_id: projectId,
                world_id: worldId,
                name: elementData.name || elementName,
                description: elementData.description || '',
                location_type: elementData.location_type || '其他',
                region: elementData.region || '',
                geographical_location: elementData.geographical_location || '',
                terrain: elementData.terrain || '',
                climate: elementData.climate || '',
                special_environment: elementData.special_environment || '',
                controlling_faction: elementData.controlling_faction || '',
                population_composition: elementData.population_composition || '',
                economic_status: elementData.economic_status || '',
                cultural_features: elementData.cultural_features || '',
                overall_layout: elementData.overall_layout || '',
                functional_areas: elementData.functional_areas || '',
                key_buildings: elementData.key_buildings || '',
                secret_areas: elementData.secret_areas || '',
                defense_facilities: elementData.defense_facilities || '',
                guard_force: elementData.guard_force || '',
                defense_weaknesses: elementData.defense_weaknesses || '',
                emergency_plans: elementData.emergency_plans || '',
                main_resources: elementData.main_resources || '',
                potential_dangers: elementData.potential_dangers || '',
                access_restrictions: elementData.access_restrictions || '',
                survival_conditions: elementData.survival_conditions || '',
                importance: elementData.importance || 5,
                source_chapters: sourceChapters,
              });
              savedCount++;
              console.log('地点保存成功:', elementName);
              break;

            case 'faction':
              await factionApi.createFaction({
                project_id: projectId,
                world_id: worldId,
                name: elementData.name || elementName,
                description: elementData.description || '',
                faction_type: elementData.faction_type || '其他',
                ideology: elementData.ideology || '',
                structure: elementData.structure || '',
                influence: elementData.influence || '',
                source_chapters: sourceChapters,
              });
              savedCount++;
              console.log('组织保存成功:', elementName);
              break;

            case 'item':
              await itemApi.createItem({
                project_id: projectId,
                world_id: worldId,
                name: elementData.name || elementName,
                description: elementData.description || '',
                item_type: elementData.item_type || '其他',
                properties: elementData.properties || '',
                origin: elementData.origin || '',
                significance: elementData.significance || '',
                source_chapters: sourceChapters,
              });
              savedCount++;
              console.log('物品保存成功:', elementName);
              break;

            case 'energy_system':
              // 使用专门的能量体系API
              try {
                await settingApi.createEnergySystem({
                  world_id: worldId,
                  name: elementData.name || elementName,
                  energy_type: elementData.energy_type || elementData.type || '魔法',
                  description: elementData.description || elementData.overview || '',
                  source: elementData.source || '',
                  acquisition_method: elementData.acquisition_method || '',
                  storage_method: elementData.storage_method || '',
                  usage_limitations: elementData.usage_limitations || elementData.basic_laws || '',
                  common_applications: elementData.common_applications || '',
                  rarity: elementData.rarity || '常见',
                  stability: elementData.stability || '稳定',
                  interaction_with_other_energies: elementData.interaction_with_other_energies || '',
                  cultivation_method: elementData.cultivation_method || elementData.advancement_paths || '',
                  typical_manifestations: elementData.typical_manifestations || '',
                });
                savedCount++;
                console.log('能量体系保存成功:', elementName);
              } catch (energyError) {
                console.error('能量体系保存失败，尝试使用物品API:', energyError);
                // 如果能量体系API失败，回退到物品API
                await itemApi.createItem({
                  project_id: projectId,
                  world_id: worldId,
                  name: elementData.name || elementName,
                  description: elementData.description || '',
                  item_type: '能量体系',
                  properties: JSON.stringify(elementData),
                  origin: 'AI生成',
                  significance: elementData.significance || '核心设定',
                });
                savedCount++;
              }
              break;

            case 'world_architecture':
              // 根据架构类型选择不同的API
              const architectureType = elementData.architecture_type || '';
              console.log(`保存世界架构: ${elementName}, 类型: ${architectureType}`);
              
              try {
                if (architectureType.includes('维度') || architectureType.includes('位面')) {
                  await worldSettingApi.createDimension({
                    world_id: worldId,
                    name: elementData.name || elementName,
                    dimension_type: elementData.dimension_type || '位面',
                    description: elementData.description || '',
                    entry_conditions: elementData.entry_conditions || '',
                    physical_properties: elementData.physical_properties || '',
                    time_flow: elementData.time_flow || '',
                    special_rules: elementData.special_rules || '',
                  });
                  console.log('维度保存成功:', elementName);
                } else if (architectureType.includes('区域') || architectureType.includes('地理')) {
                  await worldSettingApi.createRegion({
                    world_id: worldId,
                    name: elementData.name || elementName,
                    region_type: elementData.region_type || '区域',
                    description: elementData.description || '',
                    climate: elementData.climate || '',
                    terrain: elementData.terrain || '',
                    geographical_coordinates: elementData.geographical_coordinates || '',
                  });
                  console.log('区域保存成功:', elementName);
                } else if (architectureType.includes('天体')) {
                  await worldSettingApi.createCelestialBody({
                    world_id: worldId,
                    name: elementData.name || elementName,
                    celestial_type: elementData.celestial_type || '行星',
                    description: elementData.description || '',
                    position: elementData.position || '',
                    size: elementData.size || '',
                    characteristics: elementData.characteristics || '',
                  });
                  console.log('天体保存成功:', elementName);
                } else if (architectureType.includes('法则') || architectureType.includes('规则')) {
                  await worldSettingApi.createNaturalLaw({
                    world_id: worldId,
                    name: elementData.name || elementName,
                    law_type: elementData.law_type || '物理法则',
                    description: elementData.description || '',
                    effects: elementData.effects || '',
                    exceptions: elementData.exceptions || '',
                  });
                  console.log('自然法则保存成功:', elementName);
                } else {
                  // 默认保存为维度
                  await worldSettingApi.createDimension({
                    world_id: worldId,
                    name: elementData.name || elementName,
                    dimension_type: elementData.dimension_type || '位面',
                    description: elementData.description || '',
                    entry_conditions: elementData.entry_conditions || '',
                    physical_properties: elementData.physical_properties || '',
                    time_flow: elementData.time_flow || '',
                    special_rules: elementData.special_rules || '',
                  });
                  console.log('世界架构(默认维度)保存成功:', elementName);
                }
                savedCount++;
              } catch (archError) {
                console.error('世界架构保存失败，尝试使用物品API:', archError);
                // 如果世界架构API失败，回退到物品API
                await itemApi.createItem({
                  project_id: projectId,
                  world_id: worldId,
                  name: elementData.name || elementName,
                  description: elementData.description || '',
                  item_type: '世界架构',
                  properties: JSON.stringify(elementData),
                  origin: 'AI生成',
                  significance: elementData.significance || '核心设定',
                });
                savedCount++;
              }
              break;

            default:
              // 其他类型作为通用设定保存
              console.log(`未处理的元素类型: ${elementType}`, elementData);
              break;
          }
        } catch (saveError) {
          console.error(`保存元素失败: ${result.element_name}`, saveError);
          failedCount++;
        }
      }

      if (savedCount > 0) {
        message.success(`成功保存 ${savedCount} 个设定元素${failedCount > 0 ? `，${failedCount} 个失败` : ''}`);
      }
    } catch (error) {
      console.error('保存设定元素失败:', error);
      message.error('保存设定元素失败');
    } finally {
      message.destroy();
    }
  };

  // 推断元素类型
  const inferElementType = (elementName, elementData) => {
    // 根据元素名称或数据推断类型
    const name = (elementName || '').toLowerCase();
    const type = (elementData?.type || '').toLowerCase();
    
    console.log('推断元素类型:', { name, type, elementData });

    // 优先检查 type 字段
    if (type.includes('character')) return 'character';
    if (type.includes('location')) return 'location';
    if (type.includes('faction')) return 'faction';
    if (type.includes('item')) return 'item';
    if (type.includes('energy')) return 'energy_system';
    
    // 检查名称关键词
    if (name.includes('角色') || name.includes('人物') || name.includes('主角') || name.includes('配角')) {
      return 'character';
    }
    if (name.includes('地点') || name.includes('场景') || name.includes('城市') || name.includes('建筑')) {
      return 'location';
    }
    if (name.includes('组织') || name.includes('势力') || name.includes('门派') || name.includes('家族')) {
      return 'faction';
    }
    if (name.includes('物品') || name.includes('道具') || name.includes('武器') || name.includes('法宝')) {
      return 'item';
    }
    if (name.includes('能量') || name.includes('体系') || name.includes('修炼') || name.includes('功法') || name.includes('等级')) {
      return 'energy_system';
    }
    if (name.includes('世界') || name.includes('维度') || name.includes('位面') || name.includes('宇宙') || name.includes('空间')) {
      return 'world_architecture';
    }

    // 根据数据内容推断
    if (elementData?.abilities || elementData?.personality || elementData?.background || 
        elementData?.age || elementData?.appearance || elementData?.ability_levels ||
        elementData?.gender || elementData?.role_in_story) {
      return 'character';
    }
    if (elementData?.geography || elementData?.climate || elementData?.terrain ||
        elementData?.location_type || elementData?.geographical_coordinates) {
      return 'location';
    }
    if (elementData?.ideology || elementData?.structure || elementData?.members ||
        elementData?.faction_type || elementData?.influence) {
      return 'faction';
    }
    if (elementData?.energy_type || elementData?.power_levels || elementData?.cultivation_system ||
        elementData?.energy_source || elementData?.acquisition_method) {
      return 'energy_system';
    }

    // 默认类型
    console.log('无法确定类型，使用默认类型 item');
    return 'item';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'generating':
        return <LoadingOutlined style={{ color: '#1890ff' }} spin />;
      case 'failed':
        return <Text type="danger">失败</Text>;
      default:
        return <PlayCircleOutlined style={{ color: '#8c8c8c' }} />;
    }
  };

  const allCompleted = batches.every(batch =>
    batchStatuses[batch.batch_id]?.status === 'completed'
  );

  return (
    <div style={{ padding: '20px 0' }}>
      <Title level={4} style={{ marginBottom: 24 }}>
        分批次生成详细设定
      </Title>

      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        建议按顺序生成，能量体系会影响角色能力设定
      </Text>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card size="small">
            <Row justify="space-between" align="middle">
              <Col>
                <Space>
                  <Text>总进度：</Text>
                  <Progress
                    percent={Math.round((completedBatches.length / batches.length) * 100)}
                    style={{ width: 200 }}
                  />
                  <Text type="secondary">
                    {completedBatches.length} / {batches.length} 个批次
                  </Text>
                </Space>
              </Col>
              <Col>
                <Space>
                  {hasCheckpoints && !generating && (
                    <Button
                      type="default"
                      icon={<HistoryIcon />}
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
                    onClick={handleGenerateAll}
                    disabled={generating || allCompleted}
                    loading={generating}
                  >
                    全部生成
                  </Button>
                  <Button
                    type="primary"
                    onClick={handleComplete}
                  >
                    完成创建
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={batches}
        renderItem={(batch, index) => {
          if (!batch) return null;
          const config = batchTypeConfig[batch.type] || {
            title: batch.type || '未知类型',
            icon: <PlayCircleOutlined />,
            color: '#8c8c8c',
            priority: 'P2'
          };
          const status = batchStatuses[batch.batch_id] || { status: 'pending', progress: 0 };

          return (
            <List.Item>
              <Card
                size="small"
                style={{
                  borderLeft: `4px solid ${config.color}`,
                  opacity: status.status === 'completed' ? 0.8 : 1
                }}
              >
                <Row justify="space-between" align="middle">
                  <Col flex="auto">
                    <Space>
                      {getStatusIcon(status.status)}
                      <span style={{ color: config.color }}>{config.icon}</span>
                      <Text strong>{batch.batch_name || '未命名批次'}</Text>
                      <Tag color={config.color}>{config.priority}</Tag>
                      <Text type="secondary">
                        {batch.element_count || batch.elements?.length || 0} 个元素
                      </Text>
                      <Text type="secondary">
                        预计 {batch.estimated_time || '未知'}
                      </Text>
                    </Space>
                  </Col>
                  <Col>
                    <Space>
                      {status.status === 'generating' && (
                        <Progress
                          percent={status.progress}
                          size="small"
                          style={{ width: 100 }}
                        />
                      )}
                      <Button
                        type={status.status === 'completed' ? 'default' : 'primary'}
                        size="small"
                        icon={status.status === 'completed' ? <CheckCircleOutlined /> : <PlayCircleOutlined />}
                        onClick={() => handleGenerateBatch(index)}
                        disabled={status.status === 'generating' || status.status === 'completed'}
                        loading={status.status === 'generating'}
                      >
                        {status.status === 'completed' ? '已完成' :
                         status.status === 'generating' ? '生成中...' : '生成'}
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Card>
            </List.Item>
          );
        }}
      />

      {/* 流式输出显示区域 */}
      {showStreamPanel && (
        <Card 
          style={{ marginTop: 24 }} 
          title={`生成进度 - ${currentBatchName}`}
          extra={
            generating && (
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
                  loading={isAborting}
                  disabled={!sessionId}
                >
                  中止生成
                </Button>
              </Popconfirm>
            )
          }
        >
          <Progress percent={currentProgress} status={generating ? 'active' : 'success'} />
          <Space style={{ marginBottom: 16 }}>
            <Text type="secondary">
              进度: {currentElementIndex} / {totalElements} 个元素
            </Text>
            {currentElement && (
              <Tag color="blue">当前: {currentElement}</Tag>
            )}
          </Space>

          <Divider />

          <div style={{ display: 'flex', gap: 16, height: 500 }}>
            {/* 输入内容显示 - 使用新的结构化组件 */}
            <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <Text strong style={{ marginBottom: 8 }}>
                <ReadOutlined style={{ marginRight: 8 }} />
                提示词结构（发送给AI的上下文）
              </Text>
              <div style={{
                flex: 1,
                border: '1px solid #d9d9d9',
                borderRadius: 8,
                overflow: 'hidden',
                backgroundColor: '#fafafa'
              }}>
                <PromptStructureDisplay sections={inputSections} />
              </div>
            </div>

            {/* AI实时流式输出显示 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <Text strong>
                AI 实时输出
                {currentElement && <span style={{ color: '#1890ff', marginLeft: 8 }}>({currentElement})</span>}
                {generating && (
                  <span style={{
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    backgroundColor: '#52c41a',
                    borderRadius: '50%',
                    marginLeft: 8,
                    animation: 'pulse 1s infinite'
                  }} />
                )}
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
            <div style={{ flex: 0.8, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
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
                        <strong>[输入] {log.element}</strong>
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

          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.3; }
            }
          `}</style>
        </Card>
      )}

      <Row justify="space-between" style={{ marginTop: 32 }}>
        <Col>
          <Button size="large" onClick={onPrev} disabled={generating}>
            上一步
          </Button>
        </Col>
        <Col>
          <Button
            type="primary"
            size="large"
            onClick={handleComplete}
          >
            完成创建
          </Button>
        </Col>
      </Row>

      {/* 检查点恢复弹窗 */}
      <CheckpointRestoreModal
        visible={showRestoreModal}
        onCancel={() => setShowRestoreModal(false)}
        onRestore={handleCheckpointRestore}
        projectId={projectId}
        stage="generation"
      />
    </div>
  );
};

export default Step3Generate;

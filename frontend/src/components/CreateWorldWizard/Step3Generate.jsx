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
import BatchList, { batchTypeConfig } from './BatchList';
import StreamPanel from './StreamPanel';
import { useSaveElements } from './useSaveElements';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const Step3Generate = ({ generationSessionId, batches, onComplete, onPrev, projectId, worldId, storyContext, parentCheckpointId }) => {
  const [batchStatuses, setBatchStatuses] = useState({});
  const [currentBatchIndex, setCurrentBatchIndex] = useState(-1);
  const [generating, setGenerating] = useState(false);
  const [completedBatches, setCompletedBatches] = useState([]);
  const [generatedResults, setGeneratedResults] = useState({});
  
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [hasCheckpoints, setHasCheckpoints] = useState(false);
  
  const [allGeneratedResults, setAllGeneratedResults] = useState([]);
  const allGeneratedResultsRef = useRef([]);

  const [showStreamPanel, setShowStreamPanel] = useState(false);
  const [currentBatchName, setCurrentBatchName] = useState('');
  const [inputSections, setInputSections] = useState(null);
  const [aiStreamContent, setAiStreamContent] = useState('');
  const [streamLog, setStreamLog] = useState([]);
  const [currentElement, setCurrentElement] = useState('');
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentElementIndex, setCurrentElementIndex] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  const [sessionId, setSessionId] = useState(null);
  const [isAborting, setIsAborting] = useState(false);
  const abortControllerRef = useRef(null);

  const outputRef = useRef(null);
  const aiStreamRef = useRef(null);

  const { saveGeneratedElements } = useSaveElements(projectId);

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
    
    if (projectId) {
      checkAvailableCheckpoints();
    }
  }, [batches, projectId]);
  
  const checkAvailableCheckpoints = async () => {
    if (!projectId) return;
    try {
      const response = await worldviewGenerationApi.getCheckpoints({
        project_id: projectId,
        stage: 'generation'
      });
      if (response.data?.code === 200) {
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
  
  const handleCheckpointRestore = async (data, checkpoint) => {
    console.log('从检查点恢复 - 原始数据:', data);
    
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
    
    const generatedResults = cpData.results || cpData.generated_results;
    
    const batchConfig = cpData.batch_config || {};
    const batchId = batchConfig.batch_id || checkpoint.session_id || 'unknown';
    
    if (generatedResults && generatedResults.length > 0) {
      console.log(`恢复 ${generatedResults.length} 个生成结果，批次ID: ${batchId}`);
      console.log('当前 batches:', batches.map(b => ({ id: b.batch_id, name: b.batch_name })));
      console.log('检查点 batchConfig:', batchConfig);
      
      const resultsWithBatchId = generatedResults.map(result => ({
        ...result,
        batch_id: result.batch_id || batchId
      }));
      
      const existingResults = allGeneratedResultsRef.current || [];
      const existingIds = new Set(existingResults.map(r => r.element_id));
      const newResults = resultsWithBatchId.filter(r => !existingIds.has(r.element_id));
      const combinedResults = [...existingResults, ...newResults];
      
      setAllGeneratedResults(combinedResults);
      allGeneratedResultsRef.current = combinedResults;
      console.log(`[handleCheckpointRestore] 累积结果: 原有 ${existingResults.length} 个 + 新增 ${newResults.length} 个 = 共 ${combinedResults.length} 个`);
      
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
      
      const restoredStatuses = { ...batchStatuses };
      console.log('恢复前的 batchStatuses:', restoredStatuses);
      
      batches.forEach(batch => {
        if (!restoredStatuses[batch.batch_id]) {
          restoredStatuses[batch.batch_id] = {
            status: 'pending',
            progress: 0,
            results: []
          };
        }
      });
      
      let matchedBatchId = batchId;
      const batchIds = batches.map(b => b.batch_id);
      
      if (!batchIds.includes(batchId)) {
        console.log(`批次ID ${batchId} 不在当前batches中，尝试匹配...`);
        
        const checkpointEntityType = batchConfig.entity_type;
        console.log(`检查点 entity_type: ${checkpointEntityType}`);
        
        if (checkpointEntityType) {
          const matchedBatch = batches.find(b => b.type === checkpointEntityType);
          if (matchedBatch) {
            matchedBatchId = matchedBatch.batch_id;
            console.log(`根据 entity_type ${checkpointEntityType} 匹配到批次: ${matchedBatchId}`);
          }
        }
        
        if (matchedBatchId === batchId && checkpoint.session_id && batchIds.includes(checkpoint.session_id)) {
          matchedBatchId = checkpoint.session_id;
        }
        
        if (matchedBatchId === batchId && batches.length === 1) {
          matchedBatchId = batches[0].batch_id;
          console.log(`只有一个批次，使用第一个批次ID: ${matchedBatchId}`);
        }
      }
      
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
      
      setCompletedBatches(prev => {
        if (!prev.includes(matchedBatchId)) {
          return [...prev, matchedBatchId];
        }
        return prev;
      });
      
      message.success(`已恢复检查点 #${checkpoint.id}，生成进度: ${checkpoint.progress_percent || data?.progress_percent || 0}%`);
    } else if (cpData.merged_result) {
      console.log('检测到提取阶段检查点');
      message.info('检测到提取阶段检查点，将跳转到提取步骤');
    } else {
      console.warn('检查点中没有可恢复的生成结果', cpData);
      throw new Error('检查点中没有可恢复的生成结果');
    }
  };

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

  const handleAbortGeneration = async () => {
    if (!sessionId) return;
    
    setIsAborting(true);
    try {
      await worldviewGenerationApi.abortGeneration({ session_id: sessionId });
      
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

    setInputSections(null);
    setAiStreamContent('');
    setStreamLog([]);
    setCurrentElement('');
    setCurrentProgress(0);
    setCurrentElementIndex(0);
    setTotalElements(batch.elements?.length || 0);
    setSessionId(null);

    abortControllerRef.current = new AbortController();

    setBatchStatuses(prev => ({
      ...prev,
      [batch.batch_id]: { ...prev[batch.batch_id], status: 'generating', progress: 0 }
    }));

    try {
      const response = await worldviewGenerationApi.executeBatchGenerationStream({
        batch_id: batch.batch_id,
        entity_type: batch.type,
        elements: batch.elements,
        world_id: worldId,
        project_id: projectId,
        story_context: storyContext || {},
        previous_results: allGeneratedResults,
        parent_checkpoint_id: parentCheckpointId,
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
                  if (data.session_id) {
                    setSessionId(data.session_id);
                  }
                  break;

                case 'session_id':
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
                  if (data.sections) {
                    setInputSections(data.sections);
                  }
                  setCurrentElement(data.element);
                  setAiStreamContent('');
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
      const batch = batches[i];
      const shouldSkip = await new Promise(resolve => {
        setBatchStatuses(prev => {
          resolve(prev[batch.batch_id]?.status === 'completed');
          return prev;
        });
      });

      if (!shouldSkip) {
        await handleGenerateBatch(i);
        await new Promise(resolve => {
          const checkInterval = setInterval(() => {
            setBatchStatuses(prev => {
              const status = prev[batch.batch_id]?.status;
              if (status === 'completed' || status === 'failed') {
                clearInterval(checkInterval);
                resolve();
              }
              return prev;
            });
          }, 100);
        });
      }
    }
  };

  const handleComplete = async () => {
    console.log('handleComplete 被调用');
    console.log('batchStatuses:', batchStatuses);
    console.log('batches:', batches);
    
    const completedCount = batches.filter(batch =>
      batchStatuses[batch.batch_id]?.status === 'completed'
    ).length;
    
    console.log('已完成批次数量:', completedCount);
    console.log('allGeneratedResultsRef.current:', allGeneratedResultsRef.current);

    if (completedCount === 0) {
      message.warning('请至少生成一个批次的设定');
      return;
    }

    const worldData = {
      name: `世界观_${new Date().toLocaleDateString()}`,
      description: '从故事蓝图生成的世界观',
      project_id: projectId,
      generation_session_id: generationSessionId,
      generated_elements: allGeneratedResultsRef.current,
      story_context: storyContext,
    };
    
    console.log('准备创建世界，数据:', worldData);

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
      console.log('全部完成，直接创建世界');
      await createWorld(worldData);
    }
  };

  const createWorld = async (worldData) => {
    console.log('createWorld 被调用，数据:', worldData);
    try {
      message.loading('正在创建世界观...', 0);

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

        console.log('开始保存生成的设定元素');
        await saveGeneratedElements(allGeneratedResultsRef.current, worldId);

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

      <BatchList 
        batches={batches} 
        batchStatuses={batchStatuses} 
        onGenerateBatch={handleGenerateBatch} 
      />

      <StreamPanel
        showStreamPanel={showStreamPanel}
        currentBatchName={currentBatchName}
        generating={generating}
        currentProgress={currentProgress}
        currentElementIndex={currentElementIndex}
        totalElements={totalElements}
        currentElement={currentElement}
        inputSections={inputSections}
        aiStreamContent={aiStreamContent}
        streamLog={streamLog}
        sessionId={sessionId}
        isAborting={isAborting}
        onAbort={handleAbortGeneration}
        aiStreamRef={aiStreamRef}
        outputRef={outputRef}
      />

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
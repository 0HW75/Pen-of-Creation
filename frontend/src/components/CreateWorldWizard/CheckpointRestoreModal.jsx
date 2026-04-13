import React, { useState, useEffect } from 'react';
import { Modal, List, Button, Tag, Space, Typography, Empty, message, Popconfirm, Alert, Row, Col } from 'antd';
import {
  HistoryOutlined, DeleteOutlined, PlayCircleOutlined,
  ClockCircleOutlined, CheckCircleOutlined, LoadingOutlined
} from '@ant-design/icons';
import { worldviewGenerationApi } from '../../services/api';

const { Text, Title } = Typography;

/**
 * 检查点恢复弹窗组件
 * 用于显示和管理可用的检查点，支持恢复之前的生成进度
 * 支持级联恢复：Step3 恢复时可同时恢复关联的 Step1 检查点
 */
const CheckpointRestoreModal = ({
  visible,
  onCancel,
  onRestore,
  onRestoreStep1,
  projectId,
  stage // 'extraction' 或 'generation'
}) => {
  const [checkpoints, setCheckpoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [restoringId, setRestoringId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // 加载检查点列表
  useEffect(() => {
    if (visible && projectId) {
      loadCheckpoints();
    }
  }, [visible, projectId]);

  const loadCheckpoints = async () => {
    setLoading(true);
    try {
      const response = await worldviewGenerationApi.getCheckpoints({
        project_id: projectId,
        stage: stage
      });

      if (response.data?.code === 200) {
        const result = response.data.data || {};
        const validCheckpoints = (result.checkpoints || []).filter(cp => {
          return cp.status === 'in_progress' || cp.status === 'aborted' || cp.status === 'completed';
        });
        console.log(`加载到 ${validCheckpoints.length} 个可用检查点`);
        setCheckpoints(validCheckpoints);
      } else {
        message.error(response.data?.message || '获取检查点列表失败');
      }
    } catch (error) {
      console.error('获取检查点列表失败:', error);
      message.error('获取检查点列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 恢复单个检查点
  const handleRestore = async (checkpoint) => {
    setRestoringId(checkpoint.id);
    try {
      const response = await worldviewGenerationApi.getCheckpoint(checkpoint.id);

      if (response.data?.code === 200) {
        const checkpointData = response.data.data;
        console.log('检查点数据:', checkpointData);

        if (!checkpointData) {
          message.error('检查点数据为空');
          return;
        }

        const hasData = checkpointData.parsed_data || checkpointData.checkpoint_data;
        if (!hasData) {
          message.error('检查点中没有数据');
          return;
        }

        message.success('检查点已加载，正在恢复进度...');
        if (onRestore) {
          try {
            await onRestore(checkpointData, checkpoint);
            onCancel();
          } catch (restoreError) {
            console.error('恢复处理失败:', restoreError);
            message.error('恢复处理失败: ' + restoreError.message);
          }
        } else {
          onCancel();
        }
      } else {
        message.error(response.data?.message || '恢复检查点失败');
      }
    } catch (error) {
      console.error('恢复检查点失败:', error);
      message.error('恢复检查点失败: ' + (error.message || '未知错误'));
    } finally {
      setRestoringId(null);
    }
  };

  // 恢复同一会话的所有检查点（级联恢复）
  // 在 Step3 阶段，只恢复属于特定 Step1 检查点的 Step3 检查点
  const handleRestoreAll = async (sessionCheckpoints, step1CheckpointId = null) => {
    if (!sessionCheckpoints || sessionCheckpoints.length === 0) return;

    setRestoringId('all');
    try {
      // 在 Step3 阶段，需要按 parent_checkpoint_id 过滤
      let filteredCheckpoints = sessionCheckpoints;
      let targetStep1Id = step1CheckpointId;

      if (stage === 'generation') {
        // 如果没有指定 Step1 ID，尝试从检查点中推断
        if (!targetStep1Id) {
          // 查找有 parent_checkpoint_id 的检查点
          const checkpointWithParent = sessionCheckpoints.find(cp => cp.parent_checkpoint_id);
          if (checkpointWithParent) {
            targetStep1Id = checkpointWithParent.parent_checkpoint_id;
          }
        }

        // 如果找到了 Step1 ID，只恢复属于该 Step1 的检查点
        if (targetStep1Id) {
          filteredCheckpoints = sessionCheckpoints.filter(cp =>
            cp.parent_checkpoint_id === targetStep1Id ||
            (!cp.parent_checkpoint_id && cp.stage === 'generation')
          );

          // 先恢复 Step1 检查点
          message.loading(`正在恢复 Step1 检查点 #${targetStep1Id}...`, 0);
          try {
            const response = await worldviewGenerationApi.getCheckpoint(targetStep1Id);
            if (response.data?.code === 200) {
              const checkpointData = response.data.data;
              if (checkpointData && (checkpointData.parsed_data || checkpointData.checkpoint_data)) {
                if (onRestoreStep1) {
                  await onRestoreStep1(checkpointData, { id: targetStep1Id, ...checkpointData });
                } else if (onRestore) {
                  await onRestore(checkpointData, { id: targetStep1Id, ...checkpointData });
                }
              }
            }
          } catch (error) {
            console.error(`恢复 Step1 检查点 #${targetStep1Id} 失败:`, error);
            message.warning(`Step1 检查点 #${targetStep1Id} 恢复失败，继续恢复 Step3 检查点`);
          }
        }
      }

      message.loading(`正在恢复 ${filteredCheckpoints.length} 个检查点...`, 0);

      // 恢复当前阶段的检查点
      const sortedCheckpoints = [...filteredCheckpoints].sort((a, b) => a.id - b.id);
      let successCount = 0;

      for (const checkpoint of sortedCheckpoints) {
        try {
          console.log(`[handleRestoreAll] 正在恢复检查点 #${checkpoint.id}: ${checkpoint.name || '未命名'}`);
          const response = await worldviewGenerationApi.getCheckpoint(checkpoint.id);
          if (response.data?.code === 200) {
            const checkpointData = response.data.data;
            if (checkpointData && (checkpointData.parsed_data || checkpointData.checkpoint_data)) {
              await onRestore(checkpointData, checkpoint);
              successCount++;
              console.log(`[handleRestoreAll] 检查点 #${checkpoint.id} 恢复成功`);
            } else {
              console.warn(`[handleRestoreAll] 检查点 #${checkpoint.id} 没有有效数据`);
            }
          } else {
            console.error(`[handleRestoreAll] 获取检查点 #${checkpoint.id} 失败:`, response.data?.message);
          }
        } catch (error) {
          console.error(`[handleRestoreAll] 恢复检查点 #${checkpoint.id} 失败:`, error);
        }
      }

      message.success(`成功恢复 ${successCount} 个检查点`);
      console.log(`[handleRestoreAll] 所有检查点恢复完成，成功: ${successCount}/${sortedCheckpoints.length}`);
      onCancel();
    } catch (error) {
      console.error('恢复所有检查点失败:', error);
      message.error('恢复所有检查点失败: ' + (error.message || '未知错误'));
    } finally {
      setRestoringId(null);
      message.destroy();
    }
  };

  // 按会话分组检查点
  // 在 Step3 阶段，按 parent_checkpoint_id 分组，让同一 Step1 下的检查点在一起
  const getSessionGroups = () => {
    const groups = {};
    checkpoints.forEach(cp => {
      // 在 Step3 阶段，如果有 parent_checkpoint_id，按 parent 分组
      // 否则按 session_id 分组
      let groupKey;
      if (stage === 'generation' && cp.parent_checkpoint_id) {
        groupKey = `parent_${cp.parent_checkpoint_id}`;
      } else {
        groupKey = cp.session_id || 'unknown';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(cp);
    });
    return groups;
  };

  // 删除检查点
  const handleDelete = async (checkpointId) => {
    setDeletingId(checkpointId);
    try {
      const response = await worldviewGenerationApi.deleteCheckpoint(checkpointId);
      if (response.data?.code === 200) {
        message.success('检查点已删除');
        setCheckpoints(prev => prev.filter(cp => cp.id !== checkpointId));
      } else {
        message.error(response.data?.message || '删除失败');
      }
    } catch (error) {
      console.error('删除检查点失败:', error);
      message.error('删除检查点失败');
    } finally {
      setDeletingId(null);
    }
  };

  // 格式化时间
  const formatTime = (timeStr) => {
    if (!timeStr) return '未知时间';
    const date = new Date(timeStr);
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 获取阶段标签
  const getStageTag = (stageType) => {
    const stageMap = {
      'extraction': { text: 'Step1-提取', color: 'blue' },
      'generation': { text: 'Step3-生成', color: 'green' },
      'outline': { text: '大纲提取', color: 'cyan' },
      'volume': { text: '卷纲提取', color: 'purple' },
      'chapter': { text: '章纲提取', color: 'orange' },
      'element': { text: '元素生成', color: 'magenta' }
    };
    const stage = stageMap[stageType] || { text: stageType, color: 'default' };
    return <Tag color={stage.color}>{stage.text}</Tag>;
  };

  // 获取状态标签
  const getStatusTag = (status) => {
    const statusMap = {
      'in_progress': { text: '进行中', color: 'processing', icon: <LoadingOutlined /> },
      'completed': { text: '已完成', color: 'success', icon: <CheckCircleOutlined /> },
      'aborted': { text: '已中止', color: 'warning', icon: <ClockCircleOutlined /> }
    };
    const statusInfo = statusMap[status] || { text: status, color: 'default', icon: null };
    return (
      <Tag icon={statusInfo.icon} color={statusInfo.color}>
        {statusInfo.text}
      </Tag>
    );
  };

  const sessionGroups = getSessionGroups();

  return (
    <Modal
      title={
        <Space>
          <HistoryOutlined />
          <span>恢复之前的进度</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="refresh" onClick={loadCheckpoints} loading={loading}>
          刷新列表
        </Button>,
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>
      ]}
      width={700}
    >
      <Alert
        message="检查点说明"
        description={
          <div>
            <p>系统会自动保存您的生成进度。如果生成过程中断，您可以从这里恢复。</p>
            <p>检查点默认保存7天，过期后会自动清理。</p>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {checkpoints.length === 0 ? (
        <Empty
          description={
            <div>
              <p>暂无可用检查点</p>
              <Text type="secondary">
                开始提取或生成设定后，系统会自动保存进度
              </Text>
            </div>
          }
        />
      ) : (
        <>
          {Object.entries(sessionGroups).map(([groupKey, sessionCheckpoints]) => {
            // 判断是否是 parent 分组
            const isParentGroup = groupKey.startsWith('parent_');
            const parentId = isParentGroup ? groupKey.replace('parent_', '') : null;
            // 找到 Step1 检查点的名称
            const step1Checkpoint = isParentGroup ?
              checkpoints.find(cp => cp.id === parseInt(parentId)) : null;
            const groupTitle = isParentGroup ?
              `Step1: ${step1Checkpoint?.name || '#' + parentId}` :
              `会话: ${groupKey.slice(-12)}`;

            return (
            <div key={groupKey} style={{ marginBottom: 24 }}>
              <div style={{ marginBottom: 12, padding: '8px 12px', backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                <Row justify="space-between" align="middle">
                  <Col>
                    <Space>
                      <Text strong>{groupTitle}</Text>
                      <Tag color="blue">{sessionCheckpoints.length} 个检查点</Tag>
                    </Space>
                  </Col>
                  <Col>
                    <Button
                      type="primary"
                      icon={<PlayCircleOutlined />}
                      onClick={() => handleRestoreAll(sessionCheckpoints)}
                      loading={restoringId === 'all'}
                      disabled={restoringId !== null || deletingId !== null}
                    >
                      恢复全部
                    </Button>
                  </Col>
                </Row>
              </div>
              <List
                loading={loading}
                dataSource={sessionCheckpoints}
                renderItem={(checkpoint) => (
                  <List.Item
                    actions={[
                      <Button
                        key="restore"
                        type="primary"
                        icon={<PlayCircleOutlined />}
                        onClick={() => handleRestore(checkpoint)}
                        loading={restoringId === checkpoint.id}
                        disabled={restoringId !== null || deletingId !== null}
                      >
                        恢复
                      </Button>,
                      <Popconfirm
                        key="delete"
                        title="确认删除？"
                        description="删除后无法恢复，确定要删除此检查点吗？"
                        onConfirm={() => handleDelete(checkpoint.id)}
                        okText="删除"
                        okButtonProps={{ danger: true }}
                        cancelText="取消"
                      >
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          loading={deletingId === checkpoint.id}
                          disabled={restoringId !== null || deletingId !== null}
                        >
                          删除
                        </Button>
                      </Popconfirm>
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text strong>{checkpoint.name || `检查点 #${checkpoint.id}`}</Text>
                          {getStageTag(checkpoint.checkpoint_type || checkpoint.stage)}
                          {getStatusTag(checkpoint.status)}
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <Space>
                            <ClockCircleOutlined />
                            <Text type="secondary">创建时间: {formatTime(checkpoint.created_at)}</Text>
                          </Space>
                          <Space>
                            <HistoryOutlined />
                            <Text type="secondary">更新时间: {formatTime(checkpoint.updated_at)}</Text>
                          </Space>
                          {checkpoint.progress_percent > 0 && (
                            <Space>
                              <Text type="secondary">进度: {checkpoint.progress_percent}%</Text>
                            </Space>
                          )}
                          {checkpoint.parent_checkpoint_id && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              关联Step1: #{checkpoint.parent_checkpoint_id}
                            </Text>
                          )}
                          {checkpoint.session_id && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              会话: {checkpoint.session_id.slice(-8)}
                            </Text>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
            );
          })}
        </>
      )}
    </Modal>
  );
};

export default CheckpointRestoreModal;

import React, { useState, useEffect } from 'react';
import { Modal, List, Button, Tag, Space, Typography, Empty, message, Popconfirm, Alert } from 'antd';
import {
  HistoryOutlined, DeleteOutlined, PlayCircleOutlined,
  ClockCircleOutlined, CheckCircleOutlined, LoadingOutlined
} from '@ant-design/icons';
import { worldviewGenerationApi } from '../../services/api';

const { Text, Title } = Typography;

/**
 * 检查点恢复弹窗组件
 * 用于显示和管理可用的检查点，支持恢复之前的生成进度
 */
const CheckpointRestoreModal = ({
  visible,
  onCancel,
  onRestore,
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
        // 后端返回的数据结构是 {total, checkpoints, limit, offset}
        const result = response.data.data || {};
        // 过滤出未过期且状态为in_progress的检查点
        const validCheckpoints = (result.checkpoints || []).filter(cp => {
          return cp.status === 'in_progress' || cp.status === 'aborted';
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

  // 恢复检查点
  const handleRestore = async (checkpoint) => {
    setRestoringId(checkpoint.id);
    try {
      // 首先获取检查点详情
      const response = await worldviewGenerationApi.getCheckpoint(checkpoint.id);

      if (response.data?.code === 200) {
        const checkpointData = response.data.data;
        console.log('检查点数据:', checkpointData);
        
        // 检查数据是否有效
        if (!checkpointData) {
          message.error('检查点数据为空');
          return;
        }
        
        // 检查是否有 parsed_data 或 checkpoint_data
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
      'extraction': { text: '提取阶段', color: 'blue' },
      'generation': { text: '生成阶段', color: 'green' },
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
        <List
          loading={loading}
          dataSource={checkpoints}
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
                    <Text strong>检查点 #{checkpoint.id}</Text>
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
      )}
    </Modal>
  );
};

export default CheckpointRestoreModal;

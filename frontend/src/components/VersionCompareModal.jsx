import React, { useState, useEffect } from 'react';
import { Modal, Button, Space, Tag, Typography, Row, Col, Divider } from 'antd';
import { DiffOutlined, SwapOutlined } from '@ant-design/icons';
import ReactDiffViewer from 'react-diff-viewer-continued';

const { Text, Title } = Typography;

const VersionCompareModal = ({ isOpen, onClose, version1, version2 }) => {
  const [diffStats, setDiffStats] = useState({
    additions: 0,
    deletions: 0,
    unchanged: 0
  });
  const [swapOrder, setSwapOrder] = useState(false);

  useEffect(() => {
    if (version1 && version2) {
      calculateDiffStats();
    }
  }, [version1, version2]);

  const calculateDiffStats = () => {
    if (!version1?.content || !version2?.content) return;

    const oldLines = version1.content.split('\n');
    const newLines = version2.content.split('\n');
    
    // 简单的统计（实际应该使用diff算法）
    const oldSet = new Set(oldLines);
    const newSet = new Set(newLines);
    
    let additions = 0;
    let deletions = 0;
    let unchanged = 0;

    newLines.forEach(line => {
      if (!oldSet.has(line) && line.trim()) {
        additions++;
      }
    });

    oldLines.forEach(line => {
      if (!newSet.has(line) && line.trim()) {
        deletions++;
      }
    });

    unchanged = Math.min(oldLines.length, newLines.length) - additions;

    setDiffStats({ additions, deletions, unchanged });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOldVersion = () => swapOrder ? version2 : version1;
  const getNewVersion = () => swapOrder ? version1 : version2;

  if (!version1 || !version2) return null;

  const oldVersion = getOldVersion();
  const newVersion = getNewVersion();

  return (
    <Modal
      title={
        <Space>
          <DiffOutlined />
          <span>版本对比</span>
        </Space>
      }
      open={isOpen}
      onCancel={onClose}
      width={1200}
      footer={[
        <Button key="swap" icon={<SwapOutlined />} onClick={() => setSwapOrder(!swapOrder)}>
          交换对比顺序
        </Button>,
        <Button key="close" type="primary" onClick={onClose}>
          关闭
        </Button>
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <div style={{ 
              padding: 12, 
              background: '#fff2f0', 
              borderRadius: 8,
              border: '1px solid #ffccc7'
            }}>
              <Title level={5} style={{ margin: 0, color: '#cf1322' }}>
                旧版本: {oldVersion?.version_name}
              </Title>
              <Space direction="vertical" size={0} style={{ marginTop: 8 }}>
                <Text type="secondary">版本号: #{oldVersion?.version_number}</Text>
                <Text type="secondary">字数: {oldVersion?.word_count}</Text>
                <Text type="secondary">创建时间: {formatDate(oldVersion?.created_at)}</Text>
                {oldVersion?.provider && (
                  <Tag size="small">{oldVersion.provider}</Tag>
                )}
              </Space>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ 
              padding: 12, 
              background: '#f6ffed', 
              borderRadius: 8,
              border: '1px solid #b7eb8f'
            }}>
              <Title level={5} style={{ margin: 0, color: '#389e0d' }}>
                新版本: {newVersion?.version_name}
              </Title>
              <Space direction="vertical" size={0} style={{ marginTop: 8 }}>
                <Text type="secondary">版本号: #{newVersion?.version_number}</Text>
                <Text type="secondary">字数: {newVersion?.word_count}</Text>
                <Text type="secondary">创建时间: {formatDate(newVersion?.created_at)}</Text>
                {newVersion?.provider && (
                  <Tag size="small">{newVersion.provider}</Tag>
                )}
              </Space>
            </div>
          </Col>
        </Row>
      </div>

      <Divider />

      <div style={{ marginBottom: 16 }}>
        <Space>
          <Tag color="success">新增: {diffStats.additions} 行</Tag>
          <Tag color="error">删除: {diffStats.deletions} 行</Tag>
          <Tag color="default">未变更: {diffStats.unchanged} 行</Tag>
          <Tag color="processing">
            字数变化: {(newVersion?.word_count || 0) - (oldVersion?.word_count || 0)}
          </Tag>
        </Space>
      </div>

      <div style={{ 
        maxHeight: 600, 
        overflow: 'auto',
        border: '1px solid #d9d9d9',
        borderRadius: 8
      }}>
        <ReactDiffViewer
          oldValue={oldVersion?.content || ''}
          newValue={newVersion?.content || ''}
          splitView={true}
          showDiffOnly={false}
          hideLineNumbers={false}
          styles={{
            contentText: {
              fontSize: 14,
              lineHeight: '1.6'
            },
            gutter: {
              minWidth: 50
            }
          }}
        />
      </div>
    </Modal>
  );
};

export default VersionCompareModal;

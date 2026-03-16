import React, { useState, useEffect } from 'react';
import { Modal, Button, List, Tag, Space, Tooltip, message, Popconfirm, Badge } from 'antd';
import { 
  HistoryOutlined, 
  StarOutlined, 
  StarFilled, 
  CheckCircleOutlined,
  DeleteOutlined,
  ReloadOutlined,
  DiffOutlined,
  EditOutlined,
  CopyOutlined
} from '@ant-design/icons';
import { aiVersionAPI } from '../services/api';
import VersionCompareModal from './VersionCompareModal';
import RegenerateModal from './RegenerateModal';

const AIVersionManager = ({ 
  isOpen, 
  onClose, 
  entityType, 
  entityId, 
  projectId,
  onVersionSelect,
  onVersionApplied
}) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [regenerateModalOpen, setRegenerateModalOpen] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(null);

  useEffect(() => {
    if (isOpen && entityType && entityId) {
      loadVersions();
    }
  }, [isOpen, entityType, entityId]);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const response = await aiVersionAPI.getVersions({
        project_id: projectId,
        entity_type: entityType,
        entity_id: entityId
      });
      setVersions(response.data || []);
    } catch (error) {
      message.error('加载版本列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetCurrent = async (versionId) => {
    try {
      await aiVersionAPI.setCurrentVersion(versionId);
      message.success('已设置为当前版本');
      loadVersions();
      if (onVersionApplied) {
        onVersionApplied();
      }
    } catch (error) {
      message.error('设置当前版本失败');
      console.error(error);
    }
  };

  const handleToggleFavorite = async (version) => {
    try {
      await aiVersionAPI.updateVersion(version.id, {
        is_favorite: !version.is_favorite
      });
      message.success(version.is_favorite ? '已取消收藏' : '已收藏');
      loadVersions();
    } catch (error) {
      message.error('操作失败');
      console.error(error);
    }
  };

  const handleDelete = async (versionId) => {
    try {
      await aiVersionAPI.deleteVersion(versionId);
      message.success('删除成功');
      loadVersions();
    } catch (error) {
      message.error('删除失败');
      console.error(error);
    }
  };

  const handleApplyVersion = async (version) => {
    try {
      await aiVersionAPI.applyVersion(entityType, entityId, version.id);
      message.success('版本已应用');
      if (onVersionSelect) {
        onVersionSelect(version);
      }
      if (onVersionApplied) {
        onVersionApplied();
      }
      loadVersions();
    } catch (error) {
      message.error('应用版本失败');
      console.error(error);
    }
  };

  const handleOpenCompare = () => {
    if (selectedVersions.length !== 2) {
      message.warning('请选择两个版本进行对比');
      return;
    }
    setCompareModalOpen(true);
  };

  const handleOpenRegenerate = (version) => {
    setCurrentVersion(version);
    setRegenerateModalOpen(true);
  };

  const handleRegenerateSuccess = () => {
    setRegenerateModalOpen(false);
    loadVersions();
    if (onVersionApplied) {
      onVersionApplied();
    }
  };

  const handleVersionSelect = (version, checked) => {
    if (checked) {
      if (selectedVersions.length >= 2) {
        message.warning('最多选择两个版本进行对比');
        return;
      }
      setSelectedVersions([...selectedVersions, version]);
    } else {
      setSelectedVersions(selectedVersions.filter(v => v.id !== version.id));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEntityTypeLabel = (type) => {
    const labels = {
      'outline': '大纲',
      'volume': '卷纲',
      'chapter': '章纲',
      'content': '正文'
    };
    return labels[type] || type;
  };

  return (
    <>
      <Modal
        title={
          <Space>
            <HistoryOutlined />
            <span>AI生成版本管理</span>
            <Tag color="blue">{getEntityTypeLabel(entityType)}</Tag>
          </Space>
        }
        open={isOpen}
        onCancel={onClose}
        width={800}
        footer={[
          <Button key="close" onClick={onClose}>
            关闭
          </Button>,
          <Button 
            key="compare" 
            icon={<DiffOutlined />}
            onClick={handleOpenCompare}
            disabled={selectedVersions.length !== 2}
            type="primary"
          >
            对比选中版本
          </Button>
        ]}
      >
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Badge count={versions.length} showZero>
              <span style={{ color: '#666' }}>共 {versions.length} 个版本</span>
            </Badge>
            {selectedVersions.length > 0 && (
              <Tag color="processing">
                已选择 {selectedVersions.length}/2 个版本
              </Tag>
            )}
          </Space>
        </div>

        <List
          loading={loading}
          dataSource={versions}
          renderItem={(version) => (
            <List.Item
              key={version.id}
              actions={[
                <Tooltip title="设为当前版本">
                  <Button
                    type={version.is_current ? "primary" : "text"}
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleSetCurrent(version.id)}
                    disabled={version.is_current}
                  >
                    {version.is_current ? '当前' : '设为当前'}
                  </Button>
                </Tooltip>,
                <Tooltip title="应用到实体">
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleApplyVersion(version)}
                  >
                    应用
                  </Button>
                </Tooltip>,
                <Tooltip title="重新生成">
                  <Button
                    type="text"
                    icon={<ReloadOutlined />}
                    onClick={() => handleOpenRegenerate(version)}
                  >
                    重生成
                  </Button>
                </Tooltip>,
                <Tooltip title={version.is_favorite ? '取消收藏' : '收藏'}>
                  <Button
                    type="text"
                    icon={version.is_favorite ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                    onClick={() => handleToggleFavorite(version)}
                  />
                </Tooltip>,
                <Popconfirm
                  title="确认删除"
                  description="删除后将无法恢复，是否继续？"
                  onConfirm={() => handleDelete(version.id)}
                  okText="删除"
                  cancelText="取消"
                >
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <input
                    type="checkbox"
                    checked={selectedVersions.some(v => v.id === version.id)}
                    onChange={(e) => handleVersionSelect(version, e.target.checked)}
                    style={{ marginTop: 8 }}
                  />
                }
                title={
                  <Space>
                    <span style={{ fontWeight: version.is_current ? 'bold' : 'normal' }}>
                      {version.version_name}
                    </span>
                    {version.is_current && (
                      <Tag color="success">当前使用</Tag>
                    )}
                    {version.is_favorite && (
                      <Tag color="warning" icon={<StarFilled />}>收藏</Tag>
                    )}
                    {version.parent_version_id && (
                      <Tag color="blue">基于版本#{version.parent_version_id}</Tag>
                    )}
                  </Space>
                }
                description={
                  <Space direction="vertical" size={0} style={{ width: '100%' }}>
                    <Space>
                      <span style={{ color: '#999' }}>版本号: #{version.version_number}</span>
                      <span style={{ color: '#999' }}>字数: {version.word_count}</span>
                      {version.provider && (
                        <Tag size="small">{version.provider}</Tag>
                      )}
                    </Space>
                    <span style={{ color: '#999', fontSize: 12 }}>
                      创建于: {formatDate(version.created_at)}
                    </span>
                    {version.content && (
                      <div style={{ 
                        marginTop: 8, 
                        padding: 8, 
                        background: '#f5f5f5', 
                        borderRadius: 4,
                        maxHeight: 100,
                        overflow: 'auto',
                        fontSize: 12
                      }}>
                        {version.content.substring(0, 200)}
                        {version.content.length > 200 && '...'}
                      </div>
                    )}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Modal>

      <VersionCompareModal
        isOpen={compareModalOpen}
        onClose={() => {
          setCompareModalOpen(false);
          setSelectedVersions([]);
        }}
        version1={selectedVersions[0]}
        version2={selectedVersions[1]}
      />

      <RegenerateModal
        isOpen={regenerateModalOpen}
        onClose={() => setRegenerateModalOpen(false)}
        version={currentVersion}
        onSuccess={handleRegenerateSuccess}
      />
    </>
  );
};

export default AIVersionManager;

import React, { useState } from 'react';
import { Modal, Button, Input, Radio, Space, message, Typography, Alert, Divider } from 'antd';
import { ReloadOutlined, EditOutlined, FileTextOutlined } from '@ant-design/icons';
import { aiVersionAPI } from '../services/api';

const { TextArea } = Input;
const { Text, Title } = Typography;

const RegenerateModal = ({ isOpen, onClose, version, onSuccess }) => {
  const [regenerateType, setRegenerateType] = useState('full'); // 'full' | 'partial'
  const [selectedText, setSelectedText] = useState('');
  const [modificationPrompt, setModificationPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegenerate = async () => {
    if (!version) return;

    if (regenerateType === 'partial' && !selectedText) {
      message.warning('请输入要修改的段落内容');
      return;
    }

    if (!modificationPrompt.trim()) {
      message.warning('请输入修改要求');
      return;
    }

    setLoading(true);
    try {
      const response = await aiVersionAPI.regenerateVersion(version.id, {
        modification_prompt: modificationPrompt,
        selected_text: regenerateType === 'partial' ? selectedText : '',
        temperature: 0.7
      });

      if (response.data?.success) {
        message.success('重新生成成功');
        if (onSuccess) {
          onSuccess(response.data.new_version);
        }
        onClose();
      } else {
        message.error('重新生成失败');
      }
    } catch (error) {
      message.error('重新生成失败: ' + (error.response?.data?.error || error.message));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRegenerateType('full');
    setSelectedText('');
    setModificationPrompt('');
    onClose();
  };

  const presetPrompts = [
    { label: '更详细', value: '请增加更多细节描写，使内容更加丰富' },
    { label: '更简洁', value: '请精简内容，去除冗余描述，保留核心信息' },
    { label: '更生动', value: '请使用更生动的语言，增加画面感和感染力' },
    { label: '调整语气', value: '请调整语气，使其更加正式/轻松/紧张（根据上下文）' },
    { label: '增加冲突', value: '请增加戏剧冲突，提升故事的紧张感' },
    { label: '深化角色', value: '请深化角色刻画，展现更多内心活动' }
  ];

  return (
    <Modal
      title={
        <Space>
          <ReloadOutlined />
          <span>重新生成内容</span>
        </Space>
      }
      open={isOpen}
      onCancel={handleClose}
      width={700}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          取消
        </Button>,
        <Button 
          key="regenerate" 
          type="primary" 
          icon={<ReloadOutlined />}
          onClick={handleRegenerate}
          loading={loading}
        >
          重新生成
        </Button>
      ]}
    >
      {version && (
        <div style={{ marginBottom: 16 }}>
          <Alert
            message={`基于版本: ${version.version_name} (#${version.version_number})`}
            description={`原文字数: ${version.word_count} | 创建时间: ${new Date(version.created_at).toLocaleString('zh-CN')}`}
            type="info"
            showIcon
          />
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <Title level={5}>选择重新生成方式</Title>
        <Radio.Group 
          value={regenerateType} 
          onChange={(e) => setRegenerateType(e.target.value)}
        >
          <Space direction="vertical">
            <Radio value="full">
              <Space>
                <FileTextOutlined />
                <span>整体重新生成</span>
              </Space>
              <div style={{ marginLeft: 24, color: '#666', fontSize: 12 }}>
                基于原文整体内容重新生成，适合大幅度修改
              </div>
            </Radio>
            <Radio value="partial">
              <Space>
                <EditOutlined />
                <span>局部重新生成</span>
              </Space>
              <div style={{ marginLeft: 24, color: '#666', fontSize: 12 }}>
                只修改选中的段落，保留其他内容不变
              </div>
            </Radio>
          </Space>
        </Radio.Group>
      </div>

      {regenerateType === 'partial' && (
        <div style={{ marginBottom: 16 }}>
          <Title level={5}>选择要修改的内容</Title>
          <TextArea
            placeholder="请输入或粘贴您想要修改的段落内容..."
            value={selectedText}
            onChange={(e) => setSelectedText(e.target.value)}
            rows={6}
            style={{ marginBottom: 8 }}
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            提示：您可以从原文中复制需要修改的段落粘贴到这里
          </Text>
        </div>
      )}

      <Divider />

      <div style={{ marginBottom: 16 }}>
        <Title level={5}>修改要求</Title>
        <TextArea
          placeholder="请描述您希望如何修改内容，例如：增加细节描写、调整语气、精简内容等..."
          value={modificationPrompt}
          onChange={(e) => setModificationPrompt(e.target.value)}
          rows={4}
        />
      </div>

      <div>
        <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
          快速选择修改要求：
        </Text>
        <Space wrap>
          {presetPrompts.map((prompt) => (
            <Button
              key={prompt.value}
              size="small"
              onClick={() => setModificationPrompt(prompt.value)}
            >
              {prompt.label}
            </Button>
          ))}
        </Space>
      </div>

      {version?.content && regenerateType === 'full' && (
        <>
          <Divider />
          <div>
            <Title level={5}>原文内容预览</Title>
            <div style={{ 
              maxHeight: 200, 
              overflow: 'auto',
              padding: 12,
              background: '#f5f5f5',
              borderRadius: 8,
              fontSize: 12
            }}>
              {version.content.substring(0, 500)}
              {version.content.length > 500 && '...'}
            </div>
          </div>
        </>
      )}
    </Modal>
  );
};

export default RegenerateModal;

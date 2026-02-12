import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Spin, message, Tabs, Card, Descriptions, Tag } from 'antd';
import { StarOutlined, SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import { aiGenerationApi } from '../../services/api';

const { TextArea } = Input;
const { Option } = Select;

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
  const [loading, setLoading] = useState(false);
  const [strategies, setStrategies] = useState([]);
  const [entityTypes, setEntityTypes] = useState([]);
  const [result, setResult] = useState(null);
  const [previewPrompt, setPreviewPrompt] = useState('');
  const [activeTab, setActiveTab] = useState('input');

  useEffect(() => {
    loadStrategies();
    loadEntityTypes();
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
    }
  }, [visible, defaultEntityType]);

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
          
          <Form.Item>
            <Button onClick={handlePreview} style={{ marginRight: 8 }}>
              预览提示词
            </Button>
            <Button type="primary" onClick={handleGenerate}>
              开始生成
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
            <Button type="primary" onClick={handleGenerate}>
              开始生成
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
        </span>
      }
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={null}
      destroyOnHidden
    >
      <Spin spinning={loading}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Spin>
    </Modal>
  );
};

export default AIGenerateModal;

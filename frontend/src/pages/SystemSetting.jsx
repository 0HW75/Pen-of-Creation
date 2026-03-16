import React, { useState, useEffect, useRef } from 'react';
import { Card, Tabs, Button, Form, Input, Select, message, Spin, Space, Alert, Divider } from 'antd';
import { SettingOutlined, SaveOutlined, ReloadOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { aiApi } from '../services/api';

const { Option } = Select;

const SystemSetting = () => {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('ai');

  // 获取AI配置
  const fetchAiConfig = async () => {
    setLoading(true);
    try {
      const response = await aiApi.getConfig();
      if (response.data.success) {
        setConfig(response.data.config);
        // 填充表单
        form.setFieldsValue({
          defaultProvider: response.data.config.default_provider,
        });
        message.success('获取配置成功');
      } else {
        message.error('获取配置失败');
      }
    } catch (error) {
      console.error('获取AI配置失败:', error);
      message.error('获取配置失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 设置默认提供商
  const handleSetDefaultProvider = async (values) => {
    setLoading(true);
    try {
      const response = await aiApi.setDefaultProvider({
        provider: values.defaultProvider
      });
      if (response.data.success) {
        message.success('设置默认提供商成功');
        fetchAiConfig(); // 重新获取配置
      } else {
        message.error(response.data.error || '设置失败');
      }
    } catch (error) {
      console.error('设置默认提供商失败:', error);
      message.error('设置失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 更新提供商配置
  const handleUpdateProvider = async (provider, providerConfig) => {
    setLoading(true);
    try {
      const response = await aiApi.updateProviderConfig(provider, providerConfig);
      if (response.data.success) {
        message.success(`更新${provider}配置成功`);
        fetchAiConfig(); // 重新获取配置
      } else {
        message.error(response.data.error || '更新失败');
      }
    } catch (error) {
      console.error(`更新${provider}配置失败:`, error);
      message.error('更新失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 初始化获取配置
  useEffect(() => {
    fetchAiConfig();
  }, []);

  // 提供商配置表单组件
  const ProviderForm = ({ provider, providerConfig, loading, onUpdate }) => {
    const [providerForm] = Form.useForm();
    const [testLoading, setTestLoading] = useState(false);
    const apiKeyRef = useRef('');
    
    // 保存API密钥值
    const handleApiKeyChange = (e) => {
      apiKeyRef.current = e.target.value;
      // 同时更新表单字段，确保表单值与ref同步
      providerForm.setFieldsValue({ api_key: e.target.value });
    };
    
    // 填充表单数据
    useEffect(() => {
      if (providerConfig) {
        // 保存当前API密钥值
        const currentApiKey = apiKeyRef.current;
        
        // 构建要设置的表单值
        const formValues = {
          ...providerConfig,
          // 确保有默认值
          temperature: providerConfig.temperature || 0.7,
          max_tokens: providerConfig.max_tokens || 1000
        };
        
        // 如果用户已经输入了API密钥，保持不变
        if (currentApiKey) {
          formValues.api_key = currentApiKey;
        }
        
        // 设置表单值
        providerForm.setFieldsValue(formValues);
        
        // 更新ref值
        if (!currentApiKey) {
          apiKeyRef.current = providerConfig.api_key || '';
        }
      }
    }, [providerConfig, providerForm]);

    const handleSave = async () => {
      try {
        const values = await providerForm.validateFields();
        // 确保保存API密钥
        if (apiKeyRef.current) {
          values.api_key = apiKeyRef.current;
        }
        await onUpdate(provider, values);
      } catch (error) {
        console.error('表单验证失败:', error);
        message.error('表单验证失败，请检查输入');
      }
    };

    const handleTestConnection = async () => {
      try {
        setTestLoading(true);
        // 获取表单值，不进行严格验证
        const values = await providerForm.getFieldsValue();
        // 确保使用当前API密钥
        if (apiKeyRef.current) {
          values.api_key = apiKeyRef.current;
        }
        // 先保存配置，然后测试连接
        await onUpdate(provider, values);
        const response = await aiApi.testConnection(provider);
        if (response.data.success) {
          if (response.data.result.success) {
            message.success(`连接测试成功: ${response.data.result.message}`);
          } else {
            message.error(`连接测试失败: ${response.data.result.error}`);
          }
        } else {
          message.error('测试连接失败');
        }
      } catch (error) {
        console.error('测试连接失败:', error);
        message.error('测试连接失败，请检查配置');
      } finally {
        setTestLoading(false);
      }
    };

    return (
      <Form
        form={providerForm}
        layout="vertical"
        style={{ maxWidth: 600 }}
      >
        <Form.Item
          label="API密钥"
          name="api_key"
          rules={[{ required: true, message: '请输入API密钥' }]}
        >
          <Input.Password 
            placeholder={`请输入${provider} API密钥`} 
            onChange={handleApiKeyChange}
          />
        </Form.Item>
        
        <Form.Item
          label="API基础URL"
          name="api_base"
        >
          <Input placeholder={`请输入${provider} API基础URL`} />
        </Form.Item>
        
        <Form.Item
          label="默认模型"
          name="model"
          rules={[{ required: true, message: '请输入默认模型' }]}
        >
          <Input placeholder={`请输入${provider} 默认模型`} />
        </Form.Item>
        
        <Form.Item
          label="超时时间"
          name="timeout"
          rules={[{ required: true, message: '请输入超时时间' }]}
        >
          <Input type="number" placeholder="请输入超时时间（秒）" />
        </Form.Item>
        
        <Form.Item
          label="默认温度"
          name="temperature"
          rules={[{ required: true, message: '请输入默认温度' }]}
        >
          <Input type="number" min="0" max="2" step="0.1" placeholder="请输入默认温度（0-2）" />
        </Form.Item>
        
        <Form.Item
          label="默认Token限制"
          name="max_tokens"
          rules={[{ required: true, message: '请输入默认Token限制' }]}
        >
          <Input type="number" placeholder="请输入默认Token限制" />
        </Form.Item>
        
        {provider === 'azure' && (
          <Form.Item
            label="API版本"
            name="api_version"
            rules={[{ required: true, message: '请输入API版本' }]}
          >
            <Input placeholder="请输入Azure OpenAI API版本" />
          </Form.Item>
        )}
        
        <Form.Item>
          <Space>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={loading}>
              保存配置
            </Button>
            <Button icon={<ReloadOutlined />} onClick={() => providerForm.resetFields()}>
              重置
            </Button>
            <Button icon={<CheckCircleOutlined />} onClick={handleTestConnection} loading={testLoading}>
              测试连接
            </Button>
          </Space>
        </Form.Item>
      </Form>
    );
  };

  if (loading && !config) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Tabs items配置
  const tabsItems = [
    {
      key: 'ai',
      label: 'AI服务配置',
      children: config && (
        <div>
          <Card size="small" title="默认提供商设置" style={{ marginBottom: '24px' }}>
            <Form
              form={form}
              layout="horizontal"
              onFinish={handleSetDefaultProvider}
              style={{ maxWidth: 600 }}
            >
              <Form.Item
                label="默认AI提供商"
                name="defaultProvider"
                rules={[{ required: true, message: '请选择默认提供商' }]}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
              >
                <Select placeholder="请选择默认AI提供商">
                  {config.available_providers.map(provider => (
                    <Select.Option key={provider} value={provider}>
                      {provider}
                      {config.configured_providers.includes(provider) && (
                        <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: '8px' }} />
                      )}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item wrapperCol={{ span: 16, offset: 8 }}>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                  保存默认设置
                </Button>
              </Form.Item>
            </Form>
          </Card>
          
          <Divider titlePlacement="left">提供商配置</Divider>
          
          <Space orientation="vertical" style={{ width: '100%' }}>
            {Object.entries(config.providers).map(([provider, providerConfig]) => (
              <Card
                key={provider}
                title={
                  <Space>
                    <span>{provider} 配置</span>
                    {providerConfig.configured ? (
                      <Alert
                        title="已配置"
                        type="success"
                        showIcon
                        size="small"
                        style={{ marginLeft: '8px' }}
                      />
                    ) : (
                      <Alert
                        title="未配置"
                        type="warning"
                        showIcon
                        size="small"
                        style={{ marginLeft: '8px' }}
                      />
                    )}
                  </Space>
                }
                style={{ maxWidth: 800 }}
              >
                <ProviderForm 
                  provider={provider} 
                  providerConfig={providerConfig} 
                  loading={loading} 
                  onUpdate={handleUpdateProvider} 
                />
              </Card>
            ))}
          </Space>
        </div>
      ),
    },
    {
      key: 'system',
      label: '系统设置',
      children: (
        <Card>
          <Alert
            title="系统设置"
            description="系统级别的设置选项将在此处添加"
            type="info"
            showIcon
          />
          <Divider />
          <p>功能开发中...</p>
        </Card>
      ),
    },
    {
      key: 'about',
      label: '关于',
      children: (
        <Card>
          <h2 style={{ color: '#1890ff', marginBottom: '16px' }}>创世之笔 - 小说创作助手</h2>
          <Divider />
          <p><strong>版本：</strong>1.0.0</p>
          <p><strong>描述：</strong>一个功能强大的小说创作辅助工具，集成AI辅助写作、智能设定生成、数据可视化等功能。</p>
          <p><strong>技术栈：</strong></p>
          <ul style={{ marginLeft: '24px' }}>
            <li>前端：React + Ant Design + Vite</li>
            <li>后端：Flask + SQLite</li>
            <li>AI服务：OpenAI、Anthropic、Google、Azure</li>
            <li>数据可视化：ECharts</li>
            <li>代码编辑器：Monaco Editor</li>
          </ul>
          <Divider />
          <p><strong>功能特性：</strong></p>
          <ul style={{ marginLeft: '24px' }}>
            <li>智能开篇生成</li>
            <li>AI续写功能</li>
            <li>文本润色抛光</li>
            <li>智能世界观生成</li>
            <li>智能角色生成</li>
            <li>数据可视化分析</li>
            <li>作品健康度分析</li>
            <li>多AI服务提供商支持</li>
          </ul>
        </Card>
      ),
    },
  ];

  return (
    <div style={{ padding: '0' }}>
      <Card
        title={<Space>
          <SettingOutlined />
          <span>系统设置</span>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchAiConfig} 
            loading={loading}
            size="small"
          >
            刷新
          </Button>
        </Space>}
        extra={
          <Alert
            title="设置说明"
            description="修改设置后需要保存才能生效。API密钥会安全存储在服务器端，不会在客户端暴露。"
            type="info"
            showIcon
            style={{ maxWidth: 400 }}
          />
        }
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabsItems} />
      </Card>
    </div>
  );
};

export default SystemSetting;

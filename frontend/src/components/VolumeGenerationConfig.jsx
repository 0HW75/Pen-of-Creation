import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Button, Space, Divider, Tabs, Alert } from 'antd';
import { SettingOutlined, ReloadOutlined, SaveOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { TabPane } = Tabs;

// 默认配置
const defaultConfig = {
  systemPrompt: '你是一位专业的小说编辑和大纲架构师，擅长将长篇故事大纲分解为合理的卷纲结构。',
  userPromptTemplate: `请根据以下信息，生成当前卷纲：

# 故事大纲
{{outlineContent}}

# 当前卷规划
卷号：第{{volumeIndex}}卷
标题：{{volumeTitle}}
概述：{{volumeBrief}}
{{previousVolumesInfo}}

# 要求
1. 生成当前卷的详细内容，包括：
   - 核心冲突（2-3句话概括）
   - 主要内容概述（5-8句话）
   - 关键事件（3-5个，每个用1-2句话描述）
   - 角色发展（2-3句话）
   - 章节数量：{{minChapters}}-{{maxChapters}}章
2. 确保与大纲和前文卷纲连贯
3. **重要格式要求**：
   - 必须输出合法的JSON格式
   - 使用英文双引号，不要用中文引号
   - 不要使用三引号
   - 字符串中的换行用\\n表示
   - key_events是字符串数组，每个事件用一句话描述
4. 输出字段：id、title、core_conflict、content、key_events（数组）、character_development、chapter_count、order_index

请直接输出合法的JSON，不要包含其他文字或markdown代码块标记！`,
  minVolumes: 3,
  maxVolumes: 5,
  minChapters: 5,
  maxChapters: 8,
  maxTokens: 4000,
  temperature: 0.7,
  useArchitectPrompt: true,
  combinePrompts: true,
  incrementalMode: true  // 默认启用逐卷生成模式
};

const VolumeGenerationConfig = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
  onSave
}) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (isOpen && config) {
      form.setFieldsValue(config);
    }
  }, [isOpen, config, form]);

  const handleReset = () => {
    form.setFieldsValue(defaultConfig);
  };

  const handleSave = () => {
    const values = form.getFieldsValue();
    onSave(values);
    onClose();
  };

  const renderPreview = () => {
    const values = form.getFieldsValue();
    const template = values.userPromptTemplate || defaultConfig.userPromptTemplate;
    const preview = template
      .replace(/\{\{outlineContent\}\}/g, '[大纲内容将在此处插入]')
      .replace(/\{\{volumeIndex\}\}/g, '1')
      .replace(/\{\{volumeTitle\}\}/g, '示例卷标题')
      .replace(/\{\{volumeBrief\}\}/g, '示例卷概述')
      .replace(/\{\{previousVolumesInfo\}\}/g, '[前文卷纲信息]')
      .replace(/\{\{minVolumes\}\}/g, values.minVolumes || 3)
      .replace(/\{\{maxVolumes\}\}/g, values.maxVolumes || 5)
      .replace(/\{\{minChapters\}\}/g, values.minChapters || 5)
      .replace(/\{\{maxChapters\}\}/g, values.maxChapters || 8);
    return preview;
  };

  return (
    <Modal
      title={
        <Space>
          <SettingOutlined />
          <span>卷纲生成配置</span>
        </Space>
      }
      open={isOpen}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="reset" icon={<ReloadOutlined />} onClick={handleReset}>
          恢复默认
        </Button>,
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button key="save" type="primary" icon={<SaveOutlined />} onClick={handleSave}>
          保存配置
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={defaultConfig}
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="基本设置" key="basic">
            <Alert
              message="提示词模板变量说明"
              description={
                <div>
                  <p><strong>逐卷生成模式可用的模板变量：</strong></p>
                  <ul style={{ marginBottom: 8, paddingLeft: 20 }}>
                    <li><code>{'{{outlineContent}}'}</code> - 故事大纲内容</li>
                    <li><code>{'{{volumeIndex}}'}</code> - 当前卷号</li>
                    <li><code>{'{{volumeTitle}}'}</code> - 当前卷标题</li>
                    <li><code>{'{{volumeBrief}}'}</code> - 当前卷概述</li>
                    <li><code>{'{{previousVolumesInfo}}'}</code> - 前文卷纲信息</li>
                    <li><code>{'{{minChapters}}'}</code> - 最小章节数</li>
                    <li><code>{'{{maxChapters}}'}</code> - 最大章节数</li>
                  </ul>
                  <p><strong>格式要求：</strong>输出合法JSON，使用英文双引号，禁止三引号</p>
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Form.Item
              name="useArchitectPrompt"
              valuePropName="checked"
            >
              <input type="checkbox" id="useArchitectPrompt" />
              <label htmlFor="useArchitectPrompt" style={{ marginLeft: 8 }}>
                使用选中架构师的提示词
              </label>
            </Form.Item>

            <Form.Item
              name="combinePrompts"
              valuePropName="checked"
            >
              <input type="checkbox" id="combinePrompts" />
              <label htmlFor="combinePrompts" style={{ marginLeft: 8 }}>
                合并架构师提示词和系统提示词（而非覆盖）
              </label>
            </Form.Item>

            <Form.Item
              name="incrementalMode"
              valuePropName="checked"
            >
              <input type="checkbox" id="incrementalMode" />
              <label htmlFor="incrementalMode" style={{ marginLeft: 8 }}>
                启用逐卷生成模式（推荐，避免token超限）
              </label>
            </Form.Item>

            <Divider />

            <Form.Item
              label="系统提示词"
              name="systemPrompt"
              rules={[{ required: true, message: '请输入系统提示词' }]}
            >
              <TextArea
                rows={6}
                placeholder="定义AI的角色和基本能力..."
              />
            </Form.Item>

            <Form.Item
              label="用户提示词模板"
              name="userPromptTemplate"
              rules={[{ required: true, message: '请输入用户提示词模板' }]}
            >
              <TextArea
                rows={10}
                placeholder="定义分解要求和输出格式..."
              />
            </Form.Item>
          </TabPane>

          <TabPane tab="参数设置" key="params">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Form.Item
                label="卷数范围"
                required
              >
                <Space>
                  <Form.Item
                    name="minVolumes"
                    noStyle
                    rules={[
                      { required: true, message: '请输入最小卷数' },
                      { type: 'number', min: 1, max: 50, message: '最小卷数1-50' }
                    ]}
                  >
                    <InputNumber min={1} max={50} placeholder="最小卷数" />
                  </Form.Item>
                  <span>至</span>
                  <Form.Item
                    name="maxVolumes"
                    noStyle
                    rules={[
                      { required: true, message: '请输入最大卷数' },
                      { type: 'number', min: 1, max: 50, message: '最大卷数1-50' }
                    ]}
                  >
                    <InputNumber min={1} max={50} placeholder="最大卷数" />
                  </Form.Item>
                </Space>
              </Form.Item>

              <Form.Item
                label="每卷章节数范围"
                required
              >
                <Space>
                  <Form.Item
                    name="minChapters"
                    noStyle
                    rules={[
                      { required: true, message: '请输入最小章节数' },
                      { type: 'number', min: 1, max: 100, message: '最小章节数1-100' }
                    ]}
                  >
                    <InputNumber min={1} max={100} placeholder="最小章节数" />
                  </Form.Item>
                  <span>至</span>
                  <Form.Item
                    name="maxChapters"
                    noStyle
                    rules={[
                      { required: true, message: '请输入最大章节数' },
                      { type: 'number', min: 1, max: 100, message: '最大章节数1-100' }
                    ]}
                  >
                    <InputNumber min={1} max={100} placeholder="最大章节数" />
                  </Form.Item>
                </Space>
              </Form.Item>

              <Form.Item
                label="Max Tokens"
                name="maxTokens"
                rules={[
                  { required: true, message: '请输入Max Tokens' },
                  { type: 'number', min: 1000, max: 200000, message: 'Max Tokens必须在1000-200000之间' }
                ]}
              >
                <InputNumber
                  min={1000}
                  max={200000}
                  step={1000}
                  style={{ width: '100%' }}
                  placeholder="1000-200000"
                />
              </Form.Item>

              <Form.Item
                label="Temperature"
                name="temperature"
                rules={[
                  { required: true, message: '请输入Temperature' },
                  { type: 'number', min: 0, max: 2, message: 'Temperature必须在0-2之间' }
                ]}
              >
                <InputNumber
                  min={0}
                  max={2}
                  step={0.1}
                  style={{ width: '100%' }}
                  placeholder="0-2"
                />
              </Form.Item>
            </Space>
          </TabPane>

          <TabPane tab="预览" key="preview">
            <Alert
              message="最终发送给AI的提示词预览"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <div
              style={{
                background: '#f5f5f5',
                padding: 16,
                borderRadius: 8,
                maxHeight: 400,
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                fontSize: 12
              }}
            >
              <strong>System Prompt:</strong>
              <div style={{ marginBottom: 16, color: '#666' }}>
                {form.getFieldValue('systemPrompt') || defaultConfig.systemPrompt}
              </div>

              <strong>User Prompt:</strong>
              <div style={{ color: '#666' }}>
                {renderPreview()}
              </div>
            </div>
          </TabPane>
        </Tabs>
      </Form>
    </Modal>
  );
};

export default VolumeGenerationConfig;

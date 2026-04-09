import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Button, Space, Divider, Tabs, Alert } from 'antd';
import { SettingOutlined, ReloadOutlined, SaveOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { TabPane } = Tabs;

const defaultConfig = {
  systemPrompt: `你是一位小说章纲生成助手。

【输出格式 - 必须严格遵守】
只输出纯JSON，格式如下（不要任何其他文字）：
{"id": 1, "title": "标题", "core_event": ["事件A", "事件B"], "scenes": ["场景X"], "characters": ["角色Y"], "emotional_goal": "情感", "order_index": 1}

【注意】id必须是数字，不能是字符串！

【禁止】
- 不要输出markdown代码块
- 不要输出任何解释性文字
- 字符串值内不要使用英文双引号，如需引号用单引号替代`,
  userPromptTemplate: `根据以下卷纲生成章纲：

卷纲：{{volumeContent}}
章节：第{{chapterIndex}}章《{{chapterTitle}}》
概述：{{chapterBrief}}
前文章节：{{previousChaptersInfo}}

【必须严格遵循的JSON格式 - 不要修改任何内容】
{"id": 1, "title": "标题", "core_event": ["事件1", "事件2"], "scenes": ["场景1"], "characters": ["角色1"], "emotional_goal": "情感", "order_index": 1}

【重要】id必须是数字类型，如1、2、3等，不能是字符串！

【规则】
- 只输出纯JSON，不要markdown代码块
- 使用英文半角引号 ""
- 数组元素用英文逗号分隔，结尾不要逗号
- 对象属性用英文逗号分隔，结尾不要逗号
- 总字数不超过500字`,
  minChapters: 5,
  maxChapters: 10,
  minWords: 2000,
  maxWords: 5000,
  maxTokens: 2000,
  temperature: 0.7,
  useArchitectPrompt: true,
  combinePrompts: true,
  incrementalMode: true
};

const ChapterGenerationConfig = ({
  isOpen,
  onClose,
  config,
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
      .replace(/\{\{volumeContent\}\}/g, '[卷纲内容将在此处插入]')
      .replace(/\{\{chapterIndex\}\}/g, '1')
      .replace(/\{\{chapterTitle\}\}/g, '示例章节标题')
      .replace(/\{\{chapterBrief\}\}/g, '示例章节概述')
      .replace(/\{\{previousChaptersInfo\}\}/g, '[前文章节信息]')
      .replace(/\{\{minChapters\}\}/g, values.minChapters || 5)
      .replace(/\{\{maxChapters\}\}/g, values.maxChapters || 10)
      .replace(/\{\{minWords\}\}/g, values.minWords || 2000)
      .replace(/\{\{maxWords\}\}/g, values.maxWords || 5000);
    return preview;
  };

  return (
    <Modal
      title={
        <Space>
          <SettingOutlined />
          <span>章纲生成配置</span>
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
                  <p><strong>逐章生成模式可用的模板变量：</strong></p>
                  <ul style={{ marginBottom: 8, paddingLeft: 20 }}>
                    <li><code>{'{{volumeContent}}'}</code> - 卷纲内容</li>
                    <li><code>{'{{chapterIndex}}'}</code> - 当前章节号</li>
                    <li><code>{'{{chapterTitle}}'}</code> - 当前章节标题</li>
                    <li><code>{'{{chapterBrief}}'}</code> - 当前章节概述</li>
                    <li><code>{'{{previousChaptersInfo}}'}</code> - 前文章节信息</li>
                    <li><code>{'{{minWords}}'}</code> - 最小字数</li>
                    <li><code>{'{{maxWords}}'}</code> - 最大字数</li>
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
                启用逐章生成模式（推荐，避免token超限）
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
                placeholder="定义章节生成要求和输出格式..."
              />
            </Form.Item>
          </TabPane>

          <TabPane tab="参数设置" key="params">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Form.Item
                label="章节数范围"
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
                label="每章字数范围"
                required
              >
                <Space>
                  <Form.Item
                    name="minWords"
                    noStyle
                    rules={[
                      { required: true, message: '请输入最小字数' },
                      { type: 'number', min: 500, max: 50000, message: '最小字数500-50000' }
                    ]}
                  >
                    <InputNumber min={500} max={50000} step={500} placeholder="最小字数" />
                  </Form.Item>
                  <span>至</span>
                  <Form.Item
                    name="maxWords"
                    noStyle
                    rules={[
                      { required: true, message: '请输入最大字数' },
                      { type: 'number', min: 500, max: 50000, message: '最大字数500-50000' }
                    ]}
                  >
                    <InputNumber min={500} max={50000} step={500} placeholder="最大字数" />
                  </Form.Item>
                </Space>
              </Form.Item>

              <Form.Item
                label="Max Tokens"
                name="maxTokens"
                rules={[
                  { required: true, message: '请输入Max Tokens' },
                  { type: 'number', min: 100, max: 200000, message: 'Max Tokens必须在100-200000之间' }
                ]}
              >
                <InputNumber
                  min={100}
                  max={200000}
                  step={100}
                  style={{ width: '100%' }}
                  placeholder="100-200000"
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

export default ChapterGenerationConfig;

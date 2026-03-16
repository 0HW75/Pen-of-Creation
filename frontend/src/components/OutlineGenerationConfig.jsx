import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Space, Divider, Tabs, Card, List, Tag, Select, Alert, InputNumber } from 'antd';
import { SettingOutlined, ReloadOutlined, SaveOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

// 默认配置
const defaultConfig = {
  systemPrompt: '你是一位专业的小说大纲策划师，擅长根据世界观和故事设定生成精彩的故事大纲。',
  userPromptTemplate: `请根据以下信息，生成故事大纲：

# 世界观设定
{{worldview}}

# 故事设定
{{storySetting}}

# 要求
1. 生成完整的故事大纲，包括：
   - 核心冲突
   - 主要情节线
   - 关键转折点
   - 结局走向
2. 确保大纲逻辑连贯，情节吸引人
3. **重要格式要求**：
   - 必须输出合法的JSON格式
   - 使用英文双引号，不要用中文引号
   - 不要使用三引号
   - 字符串中的换行用\\n表示
4. 输出字段：title、core_conflict、content、key_points（数组）、ending

请直接输出合法的JSON，不要包含其他文字或markdown代码块标记！`,
  maxTokens: 8000,
  temperature: 0.7,
  useArchitectPrompt: true,
  combinePrompts: true
};

const OutlineGenerationConfig = ({
  isOpen,
  onClose,
  config,
  onSave,
  // 架构师管理相关
  architects,
  selectedArchitect,
  onSelectArchitect,
  onOpenArchitectManager,
  // 系统提示词相关
  systemPrompt: currentSystemPrompt,
  onSaveSystemPrompt,
  // 大纲结构相关
  worldviewStructurePrompt: currentWorldviewPrompt,
  onSaveWorldviewPrompt
}) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('basic');
  const [localSystemPrompt, setLocalSystemPrompt] = useState(currentSystemPrompt || '');
  const [localWorldviewPrompt, setLocalWorldviewPrompt] = useState(currentWorldviewPrompt || '');

  useEffect(() => {
    if (isOpen && config) {
      form.setFieldsValue(config);
    }
  }, [isOpen, config, form]);

  useEffect(() => {
    setLocalSystemPrompt(currentSystemPrompt || '');
  }, [currentSystemPrompt]);

  useEffect(() => {
    setLocalWorldviewPrompt(currentWorldviewPrompt || '');
  }, [currentWorldviewPrompt]);

  const handleReset = () => {
    form.setFieldsValue(defaultConfig);
  };

  const handleSave = () => {
    const values = form.getFieldsValue();
    onSave(values);
    onClose();
  };

  const handleSaveSystemPrompt = () => {
    onSaveSystemPrompt(localSystemPrompt);
  };

  const handleSaveWorldviewPrompt = () => {
    onSaveWorldviewPrompt(localWorldviewPrompt);
  };

  const renderPreview = () => {
    const values = form.getFieldsValue();
    const template = values.userPromptTemplate || defaultConfig.userPromptTemplate;
    const preview = template
      .replace(/\{\{worldview\}\}/g, '[一句话梗概将在此处插入]')
      .replace(/\{\{storySetting\}\}/g, '[核心主题将在此处插入]')
      .replace(/\{\{title\}\}/g, '[项目标题]')
      .replace(/\{\{genre\}\}/g, '[小说类型]')
      .replace(/\{\{core_theme\}\}/g, '[核心主题]')
      .replace(/\{\{synopsis\}\}/g, '[一句话梗概]')
      .replace(/\{\{writing_style\}\}/g, '[创作风格]')
      .replace(/\{\{reference_works\}\}/g, '[参考作品]')
      .replace(/\{\{target_audience\}\}/g, '[目标读者]')
      .replace(/\{\{maxTokens\}\}/g, values.maxTokens || 8000)
      .replace(/\{\{temperature\}\}/g, values.temperature || 0.7);
    return preview;
  };

  // 渲染完整的系统提示词预览（包括架构师 + 系统提示词 + 大纲结构）
  const renderSystemPromptPreview = () => {
    const values = form.getFieldsValue();
    let fullSystemPrompt = '';
    
    // 1. 架构师提示词
    if (values.useArchitectPrompt && selectedArchitect?.prompt) {
      fullSystemPrompt += selectedArchitect.prompt;
    }
    
    // 2. 系统提示词
    const systemPromptText = localSystemPrompt || values.systemPrompt || defaultConfig.systemPrompt;
    if (systemPromptText) {
      if (fullSystemPrompt) fullSystemPrompt += '\n\n';
      fullSystemPrompt += '【通用规则】\n' + systemPromptText;
    }
    
    // 3. 大纲结构提示词
    const structurePromptText = localWorldviewPrompt || '';
    if (structurePromptText) {
      if (fullSystemPrompt) fullSystemPrompt += '\n\n';
      fullSystemPrompt += '【结构要求】\n' + structurePromptText;
    }
    
    return fullSystemPrompt || '（未配置系统提示词）';
  };

  return (
    <Modal
      title={
        <Space>
          <SettingOutlined />
          <span>大纲生成配置</span>
        </Space>
      }
      open={isOpen}
      onCancel={onClose}
      width={900}
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
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="生成配置" key="basic">
          <Alert
            message="提示词模板变量说明"
            description={
              <div>
                <p><strong>可用的模板变量：</strong></p>
                <ul style={{ marginBottom: 8, paddingLeft: 20 }}>
                  <li><code>{'{{worldview}}'}</code> - 世界观设定（使用项目的一句话梗概）</li>
                  <li><code>{'{{storySetting}}'}</code> - 故事设定（使用项目的核心主题）</li>
                  <li><code>{'{{title}}'}</code> - 项目标题</li>
                  <li><code>{'{{genre}}'}</code> - 小说类型</li>
                  <li><code>{'{{core_theme}}'}</code> - 核心主题</li>
                  <li><code>{'{{synopsis}}'}</code> - 一句话梗概</li>
                  <li><code>{'{{writing_style}}'}</code> - 创作风格</li>
                  <li><code>{'{{reference_works}}'}</code> - 参考作品</li>
                  <li><code>{'{{target_audience}}'}</code> - 目标读者</li>
                </ul>
                <p><strong>格式要求：</strong>输出合法JSON，使用英文双引号，禁止三引号</p>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form form={form} layout="vertical" initialValues={defaultConfig}>
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
                placeholder="定义大纲生成要求和输出格式..."
              />
            </Form.Item>

            <Space>
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
                  placeholder="0-2"
                />
              </Form.Item>
            </Space>
          </Form>
        </TabPane>

        <TabPane tab="架构师管理" key="architect">
          <Card
            title="当前选中架构师"
            extra={
              <Button type="primary" onClick={onOpenArchitectManager}>
                管理架构师
              </Button>
            }
          >
            {selectedArchitect ? (
              <div>
                <h4>{selectedArchitect.name}</h4>
                <p style={{ color: '#666' }}>{selectedArchitect.description}</p>
                <Tag color="blue">已选中</Tag>
              </div>
            ) : (
              <div style={{ color: '#999' }}>
                未选择架构师，点击"管理架构师"按钮选择
              </div>
            )}
          </Card>

          <Divider />

          <Card title="架构师列表">
            <List
              dataSource={architects}
              renderItem={(architect) => (
                <List.Item
                  actions={[
                    <Button
                      type={selectedArchitect?.id === architect.id ? 'primary' : 'default'}
                      onClick={() => onSelectArchitect(architect)}
                    >
                      {selectedArchitect?.id === architect.id ? '已选中' : '选择'}
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    title={architect.name}
                    description={architect.description}
                  />
                </List.Item>
              )}
            />
          </Card>
        </TabPane>

        <TabPane tab="系统提示词" key="systemPrompt">
          <Alert
            message="系统提示词说明"
            description="系统提示词定义了AI的角色、基本能力和大纲结构要求，会在每次生成大纲时作为系统消息发送给AI。"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          {/* 显示当前选中的架构师信息 */}
          {selectedArchitect && (
            <Card 
              size="small" 
              style={{ marginBottom: 16, backgroundColor: '#f0f5ff' }}
              title={<span style={{ fontWeight: 'bold', color: '#1890ff' }}>当前选中架构师：{selectedArchitect.name}</span>}
              extra={
                <Button 
                  type="primary" 
                  size="small"
                  onClick={() => {
                    if (selectedArchitect?.prompt) {
                      setLocalSystemPrompt(selectedArchitect.prompt);
                    }
                  }}
                >
                  同步架构师提示词到系统提示词
                </Button>
              }
            >
              <p style={{ color: '#666', margin: 0 }}>{selectedArchitect.description}</p>
            </Card>
          )}
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 'bold', marginBottom: 8, display: 'block' }}>
              角色定义与基本能力
            </label>
            <TextArea
              rows={8}
              value={localSystemPrompt}
              onChange={(e) => setLocalSystemPrompt(e.target.value)}
              placeholder="定义AI的角色和基本能力，例如：你是一位专业的小说大纲策划师..."
            />
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 'bold', marginBottom: 8, display: 'block' }}>
              大纲结构要求
            </label>
            <TextArea
              rows={8}
              value={localWorldviewPrompt}
              onChange={(e) => setLocalWorldviewPrompt(e.target.value)}
              placeholder="定义大纲的结构要求，例如：大纲应包含以下部分..."
            />
          </div>
          
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => {
              handleSaveSystemPrompt();
              handleSaveWorldviewPrompt();
            }}
            style={{ marginTop: 8 }}
          >
            保存系统提示词
          </Button>
        </TabPane>

        <TabPane tab="预览" key="preview">
          <Alert
            message="最终发送给AI的完整提示词预览"
            description="以下预览展示了实际发送给AI的完整提示词，包括架构师提示词、系统提示词和大纲结构要求的组合。"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <div
            style={{
              background: '#f5f5f5',
              padding: 16,
              borderRadius: 8,
              maxHeight: 500,
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              fontSize: 12
            }}
          >
            <div style={{ marginBottom: 8, color: '#1890ff', fontWeight: 'bold' }}>
              System Prompt（系统提示词）:
            </div>
            <div style={{ marginBottom: 24, color: '#666', borderLeft: '3px solid #1890ff', paddingLeft: 12 }}>
              {renderSystemPromptPreview()}
            </div>

            <div style={{ marginBottom: 8, color: '#52c41a', fontWeight: 'bold' }}>
              User Prompt（用户提示词）:
            </div>
            <div style={{ color: '#666', borderLeft: '3px solid #52c41a', paddingLeft: 12 }}>
              {renderPreview()}
            </div>
          </div>
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default OutlineGenerationConfig;

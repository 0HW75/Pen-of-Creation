import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, Button, Modal, Form, Input, Select, 
  message, Popconfirm, Space, Card, Typography, Tabs, 
  InputNumber, Divider
} from 'antd';
import axios from 'axios';

const { TextArea } = Input;
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  UserOutlined, EnvironmentOutlined, 
  ToolOutlined, TeamOutlined, 
  RocketOutlined 
} from '@ant-design/icons';
import { 
  characterApi, locationApi, itemApi, factionApi, relationshipApi, aiApi 
} from '../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

const SettingManagement = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState('characters');
  const [settings, setSettings] = useState({
    characters: [],
    locations: [],
    items: [],
    factions: [],
    relationships: []
  });
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // 将 form 实例移到 Modal 内部的组件中
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [cancelToken, setCancelToken] = useState(null);
  // AI设定生成状态
  const [isAiModalVisible, setIsAiModalVisible] = useState(false);
  const [aiFunction, setAiFunction] = useState('world');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenre, setAiGenre] = useState('玄幻');
  const [aiGender, setAiGender] = useState('');
  const [aiRole, setAiRole] = useState('');
  const [aiElements, setAiElements] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');

  // 加载设定数据
  const loadSettings = async (type) => {
    if (!projectId) return;
    
    // 取消之前的请求
    if (cancelToken) {
      cancelToken.cancel('请求已取消');
    }
    
    // 创建新的取消令牌
    const source = axios.CancelToken.source();
    setCancelToken(source);
    
    setLoading(true);
    try {
      let response;
      switch (type) {
        case 'characters':
          response = await characterApi.getCharacters(projectId, source.token);
          setSettings(prev => ({ ...prev, characters: response.data }));
          break;
        case 'locations':
          response = await locationApi.getLocations(projectId, source.token);
          setSettings(prev => ({ ...prev, locations: response.data }));
          break;
        case 'items':
          response = await itemApi.getItems(projectId, source.token);
          setSettings(prev => ({ ...prev, items: response.data }));
          break;
        case 'factions':
          response = await factionApi.getFactions(projectId, source.token);
          setSettings(prev => ({ ...prev, factions: response.data }));
          break;
        case 'relationships':
          response = await relationshipApi.getRelationships(projectId, source.token);
          setSettings(prev => ({ ...prev, relationships: response.data }));
          break;
        default:
          break;
      }
    } catch (error) {
      if (!axios.isCancel(error)) {
        message.error('加载设定失败，请检查网络连接或后端服务是否正常');
        console.error('Error loading settings:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // 当标签页切换或项目ID变化时加载数据
  useEffect(() => {
    loadSettings(activeTab);
  }, [activeTab, projectId]);

  // 创建一个内部组件来包含 Form，这样 form 实例就只会在 Modal 可见时创建
  const SettingForm = () => {
    const [form] = Form.useForm();
    
    // 当模态框显示且 currentItem 存在时，设置表单字段的值
    useEffect(() => {
      if (isEditing && currentItem) {
        form.setFieldsValue(currentItem);
      } else {
        form.resetFields();
      }
    }, [isEditing, currentItem, form]);
    
    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        {renderForm()}

        <Form.Item style={{ textAlign: 'right' }}>
          <Button onClick={() => setIsModalVisible(false)} style={{ marginRight: '8px' }}>
            取消
          </Button>
          <Button type="primary" htmlType="submit">
            {isEditing ? '更新' : '创建'}
          </Button>
        </Form.Item>
      </Form>
    );
  };

  // 显示创建/编辑模态框
  const showModal = (item = null) => {
    if (item) {
      setCurrentItem(item);
      setIsEditing(true);
    } else {
      setCurrentItem(null);
      setIsEditing(false);
    }
    setIsModalVisible(true);
  };

  // 处理表单提交
  const handleSubmit = async (values) => {
    if (!projectId) {
      message.error('请先选择项目');
      return;
    }

    try {
      const data = { ...values, project_id: projectId };
      
      switch (activeTab) {
        case 'characters':
          if (isEditing) {
            await characterApi.updateCharacter(currentItem.id, data);
          } else {
            await characterApi.createCharacter(data);
          }
          break;
        case 'locations':
          if (isEditing) {
            await locationApi.updateLocation(currentItem.id, data);
          } else {
            await locationApi.createLocation(data);
          }
          break;
        case 'items':
          if (isEditing) {
            await itemApi.updateItem(currentItem.id, data);
          } else {
            await itemApi.createItem(data);
          }
          break;
        case 'factions':
          if (isEditing) {
            await factionApi.updateFaction(currentItem.id, data);
          } else {
            await factionApi.createFaction(data);
          }
          break;
        case 'relationships':
          if (isEditing) {
            await relationshipApi.updateRelationship(currentItem.id, data);
          } else {
            await relationshipApi.createRelationship(data);
          }
          break;
        default:
          break;
      }

      message.success(isEditing ? '设定更新成功' : '设定创建成功');
      setIsModalVisible(false);
      loadSettings(activeTab);
    } catch (error) {
      message.error(isEditing ? '更新设定失败' : '创建设定失败');
      console.error('Error:', error);
    }
  };

  // 处理删除设定
  const handleDelete = async (id) => {
    try {
      switch (activeTab) {
        case 'characters':
          await characterApi.deleteCharacter(id);
          break;
        case 'locations':
          await locationApi.deleteLocation(id);
          break;
        case 'items':
          await itemApi.deleteItem(id);
          break;
        case 'factions':
          await factionApi.deleteFaction(id);
          break;
        case 'relationships':
          await relationshipApi.deleteRelationship(id);
          break;
        default:
          break;
      }

      message.success('设定删除成功');
      loadSettings(activeTab);
    } catch (error) {
      message.error('删除设定失败');
      console.error('Error deleting setting:', error);
    }
  };

  // 表格列配置
  const getColumns = (type) => {
    const baseColumns = [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        width: 80,
        render: (text) => <Text code>{text}</Text>,
      },
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        render: (text) => <Text strong>{text}</Text>,
      },
      {
        title: '操作',
        key: 'action',
        render: (_, record) => (
          <Space size="middle">
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={() => showModal(record)}
            >
              编辑
            </Button>
            <Popconfirm
              title="确定要删除这个设定吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button 
                danger 
                icon={<DeleteOutlined />}
              >
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ];

    switch (type) {
      case 'characters':
        return [
          baseColumns[0],
          baseColumns[1],
          {
            title: '基本信息',
            dataIndex: 'basic_info',
            key: 'basic_info',
            ellipsis: true,
          },
          baseColumns[2]
        ];
      case 'locations':
      case 'items':
      case 'factions':
        return [
          baseColumns[0],
          baseColumns[1],
          {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
          },
          {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
          },
          {
            title: '重要性',
            dataIndex: 'importance',
            key: 'importance',
          },
          baseColumns[2]
        ];
      case 'relationships':
        return [
          {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            render: (text) => <Text code>{text}</Text>,
          },
          {
            title: '关系名称',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <Text strong>{text}</Text>,
          },
          {
            title: '源对象',
            dataIndex: 'source_id',
            key: 'source_id',
          },
          {
            title: '目标对象',
            dataIndex: 'target_id',
            key: 'target_id',
          },
          {
            title: '关系类型',
            dataIndex: 'relationship_type',
            key: 'relationship_type',
          },
          {
            title: '强度',
            dataIndex: 'strength',
            key: 'strength',
          },
          {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
          },
          {
            title: '操作',
            key: 'action',
            render: (_, record) => (
              <Space size="middle">
                <Button 
                  type="primary" 
                  icon={<EditOutlined />} 
                  onClick={() => showModal(record)}
                >
                  编辑
                </Button>
                <Popconfirm
                  title="确定要删除这个关系吗？"
                  onConfirm={() => handleDelete(record.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button 
                    danger 
                    icon={<DeleteOutlined />}
                  >
                    删除
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ];
      default:
        return baseColumns;
    }
  };

  // 获取当前标签页的数据
  const getCurrentData = () => {
    return settings[activeTab] || [];
  };

  // 渲染表单
  const renderForm = () => {
    switch (activeTab) {
      case 'characters':
        return (
          <>
            <Form.Item
              name="name"
              label="角色名称"
              rules={[{ required: true, message: '请输入角色名称' }]}
            >
              <Input placeholder="请输入角色名称" />
            </Form.Item>

            <Form.Item
              name="basic_info"
              label="基本信息"
            >
              <TextArea rows={2} placeholder="请输入角色的基本信息，如性别、年龄、种族等" />
            </Form.Item>

            <Form.Item
              name="appearance"
              label="外貌特征"
            >
              <TextArea rows={2} placeholder="请输入角色的外貌特征" />
            </Form.Item>

            <Form.Item
              name="personality"
              label="性格特点"
            >
              <TextArea rows={2} placeholder="请输入角色的性格特点" />
            </Form.Item>

            <Form.Item
              name="background"
              label="背景故事"
            >
              <TextArea rows={3} placeholder="请输入角色的背景故事" />
            </Form.Item>

            <Form.Item
              name="character_arc"
              label="人物弧光"
            >
              <TextArea rows={2} placeholder="请输入角色的成长和变化历程" />
            </Form.Item>

            <Form.Item
              name="motivation"
              label="动机目标"
            >
              <TextArea rows={2} placeholder="请输入角色的核心动机和追求目标" />
            </Form.Item>

            <Form.Item
              name="secrets"
              label="秘密与谎言"
            >
              <TextArea rows={2} placeholder="请输入角色隐藏的秘密和谎言" />
            </Form.Item>
          </>
        );
      case 'locations':
      case 'items':
      case 'factions':
        return (
          <>
            <Form.Item
              name="name"
              label={activeTab === 'locations' ? '地点名称' : activeTab === 'items' ? '物品名称' : '势力名称'}
              rules={[{ required: true, message: `请输入${activeTab === 'locations' ? '地点' : activeTab === 'items' ? '物品' : '势力'}名称` }]}
            >
              <Input placeholder={`请输入${activeTab === 'locations' ? '地点' : activeTab === 'items' ? '物品' : '势力'}名称`} />
            </Form.Item>

            <Form.Item
              name="description"
              label="描述"
            >
              <TextArea rows={3} placeholder={`请输入${activeTab === 'locations' ? '地点' : activeTab === 'items' ? '物品' : '势力'}的详细描述`} />
            </Form.Item>

            <Form.Item
              name="type"
              label="类型"
            >
              <Input placeholder={`请输入${activeTab === 'locations' ? '地点' : activeTab === 'items' ? '物品' : '势力'}的类型`} />
            </Form.Item>

            <Form.Item
              name="importance"
              label="重要性"
            >
              <InputNumber min={0} max={10} placeholder="请输入重要性等级（0-10）" />
            </Form.Item>
          </>
        );
      case 'relationships':
        return (
          <>
            <Form.Item
              name="name"
              label="关系名称"
              rules={[{ required: true, message: '请输入关系名称' }]}
            >
              <Input placeholder="请输入关系名称" />
            </Form.Item>

            <Form.Item
              name="source_id"
              label="源对象ID"
              rules={[{ required: true, message: '请输入源对象ID' }]}
            >
              <Input placeholder="请输入源对象ID" />
            </Form.Item>

            <Form.Item
              name="target_id"
              label="目标对象ID"
              rules={[{ required: true, message: '请输入目标对象ID' }]}
            >
              <Input placeholder="请输入目标对象ID" />
            </Form.Item>

            <Form.Item
              name="relationship_type"
              label="关系类型"
              rules={[{ required: true, message: '请输入关系类型' }]}
            >
              <Input placeholder="请输入关系类型（如：朋友、敌人、家人等）" />
            </Form.Item>

            <Form.Item
              name="strength"
              label="关系强度"
            >
              <InputNumber min={0} max={10} placeholder="请输入关系强度（0-10）" />
            </Form.Item>

            <Form.Item
              name="description"
              label="关系描述"
            >
              <TextArea rows={3} placeholder="请输入关系的详细描述" />
            </Form.Item>
          </>
        );
      default:
        return null;
    }
  };

  // 获取标签页图标
  const getTabIcon = (tab) => {
    switch (tab) {
      case 'characters':
        return <UserOutlined />;
      case 'locations':
        return <EnvironmentOutlined />;
      case 'items':
        return <ToolOutlined />;
      case 'factions':
        return <TeamOutlined />;
      case 'relationships':
        return <TeamOutlined />;
      default:
        return null;
    }
  };

  // AI设定生成处理
  const handleAiGenerate = useCallback(async () => {
    setIsAiLoading(true);
    setAiResult('');
    
    try {
      let messages = [];
      let maxTokens = 1000;
      
      switch (aiFunction) {
        case 'world':
          messages = [
            {
              'role': 'system',
              'content': '你是一位专业的小说世界观设定师，擅长构建完整、丰富的虚构世界。'
            },
            {
              'role': 'user',
              'content': `请根据以下创意生成一个详细的小说世界观设定，包括但不限于：世界起源、地理环境、种族、文化、历史、魔法/科技体系、重要势力等。\n\n创意：${aiPrompt}`
            }
          ];
          maxTokens = 2000;
          break;
        case 'character':
          messages = [
            {
              'role': 'system',
              'content': '你是一位专业的小说角色设计师，擅长创建立体、丰满的人物形象。'
            },
            {
              'role': 'user',
              'content': `请根据以下创意生成一个详细的小说角色设定，包括但不限于：基本信息、外貌特征、性格特点、背景故事、人物弧光、动机目标、秘密与谎言等。\n\n创意：${aiPrompt}`
            }
          ];
          maxTokens = 1500;
          break;
        default:
          break;
      }
      
      // 使用流式输出
      const response = await aiApi.streamChatCompletion({
        messages: messages,
        max_tokens: maxTokens,
        temperature: 0.7
      });
      
      // 处理流式响应
      let partialResult = '';
      
      console.log('响应数据类型:', typeof response.data);
      console.log('响应数据:', response.data);
      console.log('响应完整对象:', response);
      
      // 检查response.data的类型
      if (response.data) {
        if (typeof response.data === 'object') {
          console.log('响应数据是对象，检查是否有getReader方法:', typeof response.data.getReader);
          console.log('响应数据是否有on方法:', typeof response.data.on);
          
          if (response.data.getReader) {
            // 如果是ReadableStream对象
            console.log('处理ReadableStream对象');
            const reader = response.data.getReader();
            
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                console.log('ReadableStream读取完成');
                break;
              }
              
              // 解析SSE数据
              const chunk = new TextDecoder('utf-8').decode(value);
              console.log('ReadableStream读取到数据:', chunk);
              const lines = chunk.split('\n');
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.substring(6);
                  if (data === '[DONE]') {
                    console.log('ReadableStream遇到[DONE]');
                    break;
                  }
                  try {
                    const chunkData = JSON.parse(data);
                    console.log('ReadableStream解析到数据:', chunkData);
                    if (chunkData.content) {
                      partialResult += chunkData.content;
                      setAiResult(partialResult);
                    }
                  } catch (error) {
                    console.error('解析流式响应失败:', error);
                  }
                }
              }
            }
          } else if (typeof response.data.on === 'function') {
            // 如果是Node.js风格的流
            console.log('处理Node.js风格的流');
            response.data.on('data', (chunk) => {
              const chunkStr = chunk.toString('utf-8');
              console.log('Node.js流接收到数据:', chunkStr);
              const lines = chunkStr.split('\n');
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.substring(6);
                  if (data === '[DONE]') {
                    console.log('Node.js流遇到[DONE]');
                    return;
                  }
                  try {
                    const chunkData = JSON.parse(data);
                    console.log('Node.js流解析到数据:', chunkData);
                    if (chunkData.content) {
                      partialResult += chunkData.content;
                      setAiResult(partialResult);
                    }
                  } catch (error) {
                    console.error('解析流式响应失败:', error);
                  }
                }
              }
            });
            
            response.data.on('end', () => {
              console.log('Node.js流结束');
            });
            
            response.data.on('error', (error) => {
              console.error('Node.js流错误:', error);
            });
          } else {
            // 其他类型的对象
            console.log('处理其他类型的对象');
            try {
              // 检查是否直接是SSE数据格式
              if (typeof response.data === 'string' || response.data instanceof String) {
                console.log('对象是字符串实例');
                const lines = response.data.split('\n');
                
                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    const data = line.substring(6);
                    if (data === '[DONE]') {
                      break;
                    }
                    try {
                      const chunkData = JSON.parse(data);
                      console.log('解析到SSE数据:', chunkData);
                      if (chunkData.content) {
                        partialResult += chunkData.content;
                        setAiResult(partialResult);
                      }
                    } catch (error) {
                      console.error('解析流式响应失败:', error);
                    }
                  }
                }
              } else {
                // 尝试将对象转换为字符串
                const dataStr = JSON.stringify(response.data);
                console.log('对象转换为字符串:', dataStr);
                
                // 检查是否包含SSE格式数据
                if (dataStr.includes('data: ')) {
                  console.log('字符串包含SSE格式数据');
                  const lines = dataStr.split('\n');
                  
                  for (const line of lines) {
                    if (line.startsWith('data: ')) {
                      const data = line.substring(6);
                      if (data === '[DONE]') {
                        break;
                      }
                      try {
                        const chunkData = JSON.parse(data);
                        console.log('解析到SSE数据:', chunkData);
                        if (chunkData.content) {
                          partialResult += chunkData.content;
                          setAiResult(partialResult);
                        }
                      } catch (error) {
                        console.error('解析流式响应失败:', error);
                      }
                    }
                  }
                } else {
                  // 可能是直接的JSON响应
                  console.log('尝试作为直接JSON响应处理');
                  const chunkData = response.data;
                  console.log('直接JSON响应数据:', chunkData);
                  if (chunkData.content) {
                    partialResult += chunkData.content;
                    setAiResult(partialResult);
                  }
                }
              }
            } catch (error) {
              console.error('处理对象响应失败:', error);
              throw new Error('处理响应数据失败');
            }
          }
        } else if (typeof response.data === 'string') {
          // 如果是字符串，直接解析
          console.log('处理字符串响应');
          console.log('字符串响应内容:', response.data);
          const lines = response.data.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.substring(6);
              if (data === '[DONE]') {
                console.log('字符串响应遇到[DONE]');
                break;
              }
              try {
                const chunkData = JSON.parse(data);
                console.log('字符串响应解析到数据:', chunkData);
                if (chunkData.content) {
                  partialResult += chunkData.content;
                  setAiResult(partialResult);
                }
              } catch (error) {
                console.error('解析流式响应失败:', error);
              }
            }
          }
        } else {
          console.error('未知的响应数据类型:', typeof response.data);
          throw new Error('未知的响应数据类型');
        }
      } else {
        console.error('无效的响应数据:', response.data);
        throw new Error('无效的响应数据');
      }
    } catch (error) {
      console.error('AI设定生成失败:', error);
      // 根据错误类型显示更准确的错误信息
      if (error.message && (error.message.includes('API密钥') || error.message.includes('未配置'))) {
        message.error('AI设定生成失败，请检查API密钥是否正确');
      } else if (error.message && error.message.includes('timeout')) {
        message.error('AI设定生成超时，请稍后重试');
      } else if (error.message && error.message.includes('getReader')) {
        message.error('AI设定生成失败，流式响应处理错误');
      } else {
        message.error(`AI设定生成失败: ${error.message || '未知错误'}`);
      }
    } finally {
      setIsAiLoading(false);
    }
  }, [aiFunction, aiPrompt, aiGenre, aiGender, aiRole, aiElements]);

  // 获取标签页标题
  const getTabTitle = (tab) => {
    switch (tab) {
      case 'characters':
        return '角色管理';
      case 'locations':
        return '地点管理';
      case 'items':
        return '物品管理';
      case 'factions':
        return '势力管理';
      case 'relationships':
        return '关系管理';
      default:
        return tab;
    }
  };

  if (!projectId) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <Text type="warning" style={{ fontSize: '18px' }}>
              请先选择一个项目，然后再进行设定管理
            </Text>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '0' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <Title level={2}>设定管理</Title>
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => showModal()}
              size="middle"
            >
              新建{activeTab === 'characters' ? '角色' : activeTab === 'locations' ? '地点' : activeTab === 'items' ? '物品' : activeTab === 'factions' ? '势力' : '关系'}
            </Button>
            <Button 
              type="dashed" 
              icon={<RocketOutlined />}
              onClick={() => setIsAiModalVisible(true)}
              size="middle"
            >
              AI智能设定生成
            </Button>
          </Space>
        </div>

        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          tabPlacement="top"
          className="setting-tabs"
          items={[
            {
              key: 'characters',
              label: <span>{getTabIcon('characters')} {getTabTitle('characters')}</span>,
              children: (
                <Table 
                  columns={getColumns('characters')} 
                  dataSource={getCurrentData()} 
                  rowKey="id" 
                  loading={loading}
                  pagination={{ 
                    pageSize: 10, 
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50'],
                    showTotal: (total) => `共 ${total} 个角色`
                  }}
                  locale={{ emptyText: '暂无角色设定，请点击"新建角色"按钮创建' }}
                  scroll={{ x: 'max-content' }}
                />
              ),
            },
            {
              key: 'locations',
              label: <span>{getTabIcon('locations')} {getTabTitle('locations')}</span>,
              children: (
                <Table 
                  columns={getColumns('locations')} 
                  dataSource={getCurrentData()} 
                  rowKey="id" 
                  loading={loading}
                  pagination={{ 
                    pageSize: 10, 
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50'],
                    showTotal: (total) => `共 ${total} 个地点`
                  }}
                  locale={{ emptyText: '暂无地点设定，请点击"新建地点"按钮创建' }}
                  scroll={{ x: 'max-content' }}
                />
              ),
            },
            {
              key: 'items',
              label: <span>{getTabIcon('items')} {getTabTitle('items')}</span>,
              children: (
                <Table 
                  columns={getColumns('items')} 
                  dataSource={getCurrentData()} 
                  rowKey="id" 
                  loading={loading}
                  pagination={{ 
                    pageSize: 10, 
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50'],
                    showTotal: (total) => `共 ${total} 个物品`
                  }}
                  locale={{ emptyText: '暂无物品设定，请点击"新建物品"按钮创建' }}
                  scroll={{ x: 'max-content' }}
                />
              ),
            },
            {
              key: 'factions',
              label: <span>{getTabIcon('factions')} {getTabTitle('factions')}</span>,
              children: (
                <Table 
                  columns={getColumns('factions')} 
                  dataSource={getCurrentData()} 
                  rowKey="id" 
                  loading={loading}
                  pagination={{ 
                    pageSize: 10, 
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50'],
                    showTotal: (total) => `共 ${total} 个势力`
                  }}
                  locale={{ emptyText: '暂无势力设定，请点击"新建势力"按钮创建' }}
                  scroll={{ x: 'max-content' }}
                />
              ),
            },
            {
              key: 'relationships',
              label: <span>{getTabIcon('relationships')} {getTabTitle('relationships')}</span>,
              children: (
                <Table 
                  columns={getColumns('relationships')} 
                  dataSource={getCurrentData()} 
                  rowKey="id" 
                  loading={loading}
                  pagination={{ 
                    pageSize: 10, 
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50'],
                    showTotal: (total) => `共 ${total} 个关系`
                  }}
                  locale={{ emptyText: '暂无关系设定，请点击"新建关系"按钮创建' }}
                  scroll={{ x: 'max-content' }}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* 创建/编辑设定模态框 */}
      <Modal
        title={isEditing ? '编辑设定' : `新建${activeTab === 'characters' ? '角色' : activeTab === 'locations' ? '地点' : activeTab === 'items' ? '物品' : activeTab === 'factions' ? '势力' : '关系'}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={{ xs: '90%', sm: 600, md: 800 }}
        destroyOnHidden
      >
        <SettingForm />
      </Modal>

      {/* AI智能设定生成模态框 */}
      <Modal
        title="AI智能设定生成"
        open={isAiModalVisible}
        onCancel={() => setIsAiModalVisible(false)}
        footer={null}
        width={700}
      >
        <div style={{ padding: '16px 0' }}>
          <div style={{ marginBottom: '24px' }}>
            <Text strong style={{ marginBottom: '8px', display: 'block' }}>功能选择</Text>
            <Select
              value={aiFunction}
              onChange={setAiFunction}
              style={{ width: '100%' }}
              size="large"
            >
              <Option value="world" icon={<RocketOutlined />}>智能世界观生成</Option>
              <Option value="character" icon={<UserOutlined />}>智能角色生成</Option>
            </Select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <Text strong style={{ marginBottom: '8px', display: 'block' }}>创意描述</Text>
            <Input.TextArea
              placeholder={aiFunction === 'world' ? '请输入世界观创意，如：一个由元素精灵守护的魔法世界' : '请输入角色创意，如：一个失去记忆的骑士'}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={4}
              style={{ marginBottom: '16px' }}
            />
          </div>

          {aiFunction === 'world' && (
            <div style={{ marginBottom: '16px' }}>
              <Text strong style={{ marginBottom: '8px', display: 'block' }}>包含元素（可选）</Text>
              <Select
                mode="tags"
                value={aiElements}
                onChange={setAiElements}
                style={{ width: '100%' }}
                placeholder="请输入要包含的元素，如：魔法、龙、精灵等"
              />
            </div>
          )}

          {aiFunction === 'character' && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <Text strong style={{ marginBottom: '8px', display: 'block' }}>性别</Text>
                  <Select
                    value={aiGender}
                    onChange={setAiGender}
                    style={{ width: '100%' }}
                  >
                    <Option value="">无特殊要求</Option>
                    <Option value="男">男</Option>
                    <Option value="女">女</Option>
                    <Option value="其他">其他</Option>
                  </Select>
                </div>
                <div style={{ flex: 1 }}>
                  <Text strong style={{ marginBottom: '8px', display: 'block' }}>角色定位</Text>
                  <Select
                    value={aiRole}
                    onChange={setAiRole}
                    style={{ width: '100%' }}
                  >
                    <Option value="">无特殊要求</Option>
                    <Option value="主角">主角</Option>
                    <Option value="反派">反派</Option>
                    <Option value="配角">配角</Option>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <Text strong style={{ marginBottom: '8px', display: 'block' }}>小说类型</Text>
            <Select
              value={aiGenre}
              onChange={setAiGenre}
              style={{ width: '100%' }}
              size="middle"
            >
              <Option value="玄幻">玄幻</Option>
              <Option value="科幻">科幻</Option>
              <Option value="言情">言情</Option>
              <Option value="悬疑">悬疑</Option>
              <Option value="都市">都市</Option>
              <Option value="历史">历史</Option>
              <Option value="武侠">武侠</Option>
            </Select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <Text strong style={{ marginBottom: '8px', display: 'block' }}>AI生成结果</Text>
            <div style={{ 
              border: '1px solid #d9d9d9', 
              borderRadius: '4px', 
              padding: '16px', 
              backgroundColor: '#f9f9f9',
              minHeight: '200px',
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              {isAiLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px' }}>
                  <Text type="secondary">生成中，请稍候...</Text>
                </div>
              ) : aiResult ? (
                <Text>{aiResult}</Text>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px' }}>
                  <Text type="secondary">点击"生成"按钮开始AI设定生成</Text>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button onClick={() => setIsAiModalVisible(false)}>
              取消
            </Button>
            <Button 
              type="primary" 
              onClick={handleAiGenerate}
              loading={isAiLoading}
            >
              生成
            </Button>
            {aiResult && (
              <Button 
                type="success" 
                onClick={() => {
                  // 保存生成结果到对应的设定类型
                  if (aiFunction === 'world') {
                    // 世界观生成结果可以保存为地点或势力等
                    message.info('世界观生成结果已生成，您可以手动创建对应的地点、势力等设定');
                  } else if (aiFunction === 'character') {
                    // 角色生成结果可以保存为角色设定
                    message.info('角色生成结果已生成，您可以手动创建对应的角色设定');
                  }
                }}
              >
                保存
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SettingManagement;
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, Button, List, Progress, Tag, Input, Select, Space, Tooltip, Spin, message } from 'antd';
import { FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, BulbOutlined, ArrowRightOutlined, ReloadOutlined, SettingOutlined, CompassOutlined } from '@ant-design/icons';
import { getNavigationFlow, getTasks, updateTaskStatus, generateInspiration, getInspirationList } from '../services/navigationApi';
import CreationFlowChart from '../components/CreationFlowChart';
import TaskList from '../components/TaskList';
import InspirationGenerator from '../components/InspirationGenerator';

const { Content, Sider } = Layout;
const { Option } = Select;

const NavigationPage = ({ projectId }) => {
  const [activeView, setActiveView] = useState('flow');
  const [flowData, setFlowData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [inspirations, setInspirations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const handleStageClick = (stageId) => {
    // 根据阶段ID跳转到对应功能模块
    switch (stageId) {
      case 'project_creation':
        // 跳转到项目管理模块
        window.dispatchEvent(new CustomEvent('navigateTo', { detail: { key: 'project' } }));
        break;
      case 'setting_building':
        // 跳转到设定管理模块
        window.dispatchEvent(new CustomEvent('navigateTo', { detail: { key: 'setting' } }));
        break;
      case 'outline_planning':
      case 'chapter_creation':
        // 跳转到编辑器模块
        window.dispatchEvent(new CustomEvent('navigateTo', { detail: { key: 'editor' } }));
        break;
      case 'revision':
        // 跳转到作品分析模块
        window.dispatchEvent(new CustomEvent('navigateTo', { detail: { key: 'analysis' } }));
        break;
      case 'export':
        // 跳转到导出功能
        message.info('导出功能开发中');
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    loadNavigationData();
  }, [projectId]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenWidth(width);
      setIsMobile(width < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadNavigationData = async () => {
    setLoading(true);
    try {
      const flow = await getNavigationFlow();
      setFlowData(flow);
      
      const taskList = await getTasks();
      setTasks(taskList);
      
      const inspirationList = await getInspirationList();
      setInspirations(inspirationList);
      
      message.success('导航数据加载成功');
    } catch (error) {
      console.error('Failed to load navigation data:', error);
      message.error('导航数据加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = async (taskId, status) => {
    try {
      await updateTaskStatus(taskId, status);
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status } : task
      ));
      message.success('任务状态更新成功');
    } catch (error) {
      console.error('Failed to update task status:', error);
      message.error('任务状态更新失败');
    }
  };

  const handleGenerateInspiration = async (type = 'plot') => {
    setLoading(true);
    try {
      const newInspiration = await generateInspiration(type);
      setInspirations([...inspirations, newInspiration]);
      message.success('灵感生成成功');
    } catch (error) {
      console.error('Failed to generate inspiration:', error);
      message.error('灵感生成失败');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'flow':
        return <CreationFlowChart flowData={flowData} onStageClick={handleStageClick} />;
      case 'tasks':
        return <TaskList tasks={tasks} onUpdateTask={handleTaskUpdate} />;
      case 'inspiration':
        return <InspirationGenerator inspirations={inspirations} onGenerate={handleGenerateInspiration} />;
      default:
        return <CreationFlowChart flowData={flowData} />;
    }
  };

  return (
    <Layout style={{ minHeight: '80vh' }} className="navigation-page">
      {!isMobile ? (
        <Layout>
          <Sider 
            width={240} 
            style={{ 
              background: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ padding: '20px', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>
              <CompassOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
              <h3 style={{ margin: '10px 0 0 0', color: '#1890ff' }}>创作导航</h3>
            </div>
            <Menu
              mode="inline"
              selectedKeys={[activeView]}
              style={{ 
                height: 'calc(100% - 80px)', 
                borderRight: 0,
                marginTop: '16px'
              }}
              onSelect={({ key }) => setActiveView(key)}
              items={[
                {
                  key: 'flow',
                  icon: <FileTextOutlined />,
                  label: '创作流程图',
                },
                {
                  key: 'tasks',
                  icon: <CheckCircleOutlined />,
                  label: '今日任务',
                },
                {
                key: 'inspiration',
                icon: <BulbOutlined />,
                label: '灵感激发器',
              },
              ]}
            />
          </Sider>
          <Layout style={{ padding: '24px' }}>
            <Content style={{ 
              background: '#fff', 
              padding: 24, 
              margin: 0, 
              minHeight: 600, 
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ margin: 0, color: '#333' }}>创作导航</h1>
                <Space>
                  <Button 
                    icon={<ReloadOutlined />} 
                    onClick={loadNavigationData} 
                    loading={loading}
                    style={{ transition: 'all 0.3s ease' }}
                  >
                    刷新数据
                  </Button>
                  {activeView === 'inspiration' && (
                    <Button 
                      icon={<BulbOutlined />} 
                      onClick={() => handleGenerateInspiration('plot')} 
                      loading={loading}
                      type="primary"
                      style={{ transition: 'all 0.3s ease' }}
                    >
                      生成灵感
                    </Button>
                  )}
                  <Button 
                    icon={<SettingOutlined />}
                    style={{ transition: 'all 0.3s ease' }}
                  >
                    设置
                  </Button>
                </Space>
              </div>
              <Spin spinning={loading} tip="加载中...">
                {renderContent()}
              </Spin>
            </Content>
          </Layout>
        </Layout>
      ) : (
        <Layout style={{ padding: '16px' }}>
          <Content style={{ 
            background: '#fff', 
            padding: 16, 
            margin: 0, 
            minHeight: 400, 
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.09)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0, color: '#333', fontSize: '18px' }}>创作导航</h2>
            </div>
            <Menu
              mode="horizontal"
              selectedKeys={[activeView]}
              style={{ marginBottom: 16, overflowX: 'auto' }}
              onSelect={({ key }) => setActiveView(key)}
              items={[
                {
                  key: 'flow',
                  icon: <FileTextOutlined />,
                  label: '流程图',
                },
                {
                  key: 'tasks',
                  icon: <CheckCircleOutlined />,
                  label: '任务',
                },
                {
                  key: 'inspiration',
                  icon: <BulbOutlined />,
                  label: '灵感',
                },
              ]}
            />
            <Spin spinning={loading} tip="加载中...">
              {renderContent()}
            </Spin>
            <div style={{ marginTop: 16, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={loadNavigationData} 
                loading={loading}
                size="small"
                style={{ flex: 1, minWidth: '120px' }}
              >
                刷新数据
              </Button>
              {activeView === 'inspiration' && (
                <Button 
                  icon={<BulbOutlined />} 
                  onClick={() => handleGenerateInspiration('plot')} 
                  loading={loading}
                  type="primary"
                  size="small"
                  style={{ flex: 1, minWidth: '120px' }}
                >
                  生成灵感
                </Button>
              )}
            </div>
          </Content>
        </Layout>
      )}
    </Layout>
  );
};

export default NavigationPage;
import React, { useState, useEffect, lazy, Suspense, useRef } from 'react';
import { Layout, Menu, App, theme, Breadcrumb, Button, Modal, message, Spin, Drawer, Select, Space } from 'antd';
import {
  FileTextOutlined,
  SettingOutlined,
  EditOutlined,
  HomeOutlined,
  SaveOutlined,
  ReloadOutlined,
  DownloadOutlined,
  UploadOutlined,
  PieChartOutlined,
  MenuOutlined,
  CloseOutlined,
  CompassOutlined,
  LayoutOutlined,
  GlobalOutlined,
  UserOutlined,
  EnvironmentOutlined,
  ToolOutlined,
  TeamOutlined,
  DatabaseOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';

// 懒加载页面组件
const ProjectManagement = lazy(() => import('./pages/ProjectManagement'));
const SettingManagement = lazy(() => import('./pages/SettingManagement/index'));
const EditorPage = lazy(() => import('./pages/EditorPage'));
const SystemSetting = lazy(() => import('./pages/SystemSetting'));
const NavigationPage = lazy(() => import('./pages/NavigationPage'));
const BlueprintPage = lazy(() => import('./pages/BlueprintPage'));

import { saveToLocalStorage, loadFromLocalStorage, backupData, restoreData } from './services/exportService';
import DataVisualization from './components/DataVisualization';
import WorkAnalysis from './components/WorkAnalysis';
import { chapterApi, characterApi, worldApi, projectApi } from './services/api';
import './App.css';

const { Header, Content, Sider } = Layout;
const { Title } = theme;

function NovelEditorApp() {
  const [current, setCurrent] = useState('project');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedWorld, setSelectedWorld] = useState(null);
  const [worlds, setWorlds] = useState([]);
  const [worldsLoading, setWorldsLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [isBackupModalVisible, setIsBackupModalVisible] = useState(false);
  const [isRestoreModalVisible, setIsRestoreModalVisible] = useState(false);
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [isLoadModalVisible, setIsLoadModalVisible] = useState(false);
  const [backupName, setBackupName] = useState('');
  const [fileInputRef, setFileInputRef] = useState(null);
  // 数据可视化相关状态
  const [chapters, setChapters] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  // 响应式设计相关状态
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  // 侧边栏折叠状态
  const [collapsed, setCollapsed] = useState(false);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 菜单项
  const items = [
    {
      key: 'project',
      icon: <FileTextOutlined />,
      label: '项目管理',
    },
    {
      key: 'editor',
      icon: <EditOutlined />,
      label: '编辑器',
    },
    {
      key: 'blueprint',
      icon: <LayoutOutlined />,
      label: '故事蓝图',
    },
    {
      key: 'navigation',
      icon: <CompassOutlined />,
      label: '创作导航',
    },
    {
      key: 'setting',
      icon: <DatabaseOutlined />,
      label: '设定数据库',
    },
    {
      key: 'visualization',
      icon: <PieChartOutlined />,
      label: '数据可视化',
    },
    {
      key: 'analysis',
      icon: <PieChartOutlined />,
      label: '作品分析',
    },
    {
      key: 'system',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
  ];

  // 获取世界列表
  const fetchWorlds = async () => {
    setWorldsLoading(true);
    try {
      const response = await worldApi.getWorlds();
      if (response.data.code === 200) {
        setWorlds(response.data.data);
      }
    } catch (error) {
      console.error('获取世界列表失败:', error);
    } finally {
      setWorldsLoading(false);
    }
  };

  // 获取项目列表
  const fetchProjects = async () => {
    setProjectsLoading(true);
    try {
      const response = await projectApi.getProjects();
      console.log('获取项目列表响应:', response.data);
      if (response.data) {
        setProjects(response.data);
        console.log('设置项目列表:', response.data);
      }
    } catch (error) {
      console.error('获取项目列表失败:', error);
    } finally {
      setProjectsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorlds();
    fetchProjects();
  }, []);

  const handleMenuClick = (e) => {
    console.log('切换到页面:', e.key, '当前 selectedProjectId:', selectedProjectId);
    setCurrent(e.key);
  };

  const handleWorldChange = (worldId) => {
    const world = worlds.find(w => w.id === worldId);
    setSelectedWorld(world || null);
  };

  // 面包屑导航数据
  const getBreadcrumbItems = () => {
    const breadcrumbItems = [
      { title: <HomeOutlined /> },
    ];

    switch (current) {
      case 'project':
        breadcrumbItems.push({ title: '项目管理' });
        break;
      case 'editor':
        breadcrumbItems.push({ title: '编辑器' });
        break;
      case 'blueprint':
        breadcrumbItems.push({ title: '故事蓝图' });
        break;
      case 'navigation':
        breadcrumbItems.push({ title: '创作导航' });
        break;
      case 'setting':
        breadcrumbItems.push({ title: '设定数据库' });
        break;
      case 'visualization':
        breadcrumbItems.push({ title: '数据可视化' });
        break;
      case 'analysis':
        breadcrumbItems.push({ title: '作品分析' });
        break;
      case 'system':
        breadcrumbItems.push({ title: '系统设置' });
        break;
      default:
        break;
    }

    return breadcrumbItems;
  };

  // 保存数据到本地存储
  const handleSaveToLocal = () => {
    const appData = {
      current,
      selectedProjectId,
      selectedWorld
    };
    const success = saveToLocalStorage('novel_editor_app_data', appData);
    if (success) {
      message.success('数据已保存到本地存储');
    } else {
      message.error('保存到本地存储失败');
    }
    setIsSaveModalVisible(false);
  };

  // 从本地存储加载数据
  const handleLoadFromLocal = () => {
    const appData = loadFromLocalStorage('novel_editor_app_data');
    if (appData) {
      setCurrent(appData.current || 'project');
      setSelectedProjectId(appData.selectedProjectId || null);
      setSelectedWorld(appData.selectedWorld || null);
      message.success('已从本地存储加载数据');
    } else {
      message.error('从本地存储加载数据失败');
    }
    setIsLoadModalVisible(false);
  };

  // 备份数据到文件
  const handleBackupToFile = () => {
    const appData = {
      current,
      selectedProjectId,
      selectedWorld
    };
    backupData(appData, backupName || 'novel_editor_backup');
    message.success('数据已备份到文件');
    setIsBackupModalVisible(false);
  };

  // 从文件恢复数据
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const data = await restoreData(file);
        if (data) {
          setCurrent(data.current || 'project');
          setSelectedProjectId(data.selectedProjectId || null);
          setSelectedWorld(data.selectedWorld || null);
          message.success('已从文件恢复数据');
        } else {
          message.error('从文件恢复数据失败');
        }
      } catch (error) {
        message.error('文件格式错误');
      }
    }
    setIsRestoreModalVisible(false);
    // 重置文件输入
    if (e.target) {
      e.target.value = '';
    }
  };

  // 加载项目数据（用于可视化）
  const loadProjectData = async () => {
    if (!selectedProjectId) {
      // 当selectedProjectId为null时，不修改状态，避免不必要的渲染
      return;
    }

    setLoadingData(true);
    try {
      // 加载章节数据
      const chaptersResponse = await chapterApi.getChapters(selectedProjectId);
      setChapters(chaptersResponse.data || []);

      // 加载角色数据
      const charactersResponse = await characterApi.getCharacters(selectedProjectId);
      setCharacters(charactersResponse.data || []);
    } catch (error) {
      console.error('加载项目数据失败:', error);
      // 检查是否是404错误
      if (error.response && error.response.status === 404) {
        // 项目不存在，清除选中的项目ID
        setSelectedProjectId(null);
        // 导航到项目管理页面
        setCurrent('project');
      }
    } finally {
      setLoadingData(false);
    }
  };

  // 初始化时从本地存储加载数据
  useEffect(() => {
    const appData = loadFromLocalStorage('novel_editor_app_data');
    if (appData && appData.selectedProjectId) {
      // 确保项目ID是数字类型
      const projectId = typeof appData.selectedProjectId === 'string' ? parseInt(appData.selectedProjectId) : appData.selectedProjectId;
      setCurrent(appData.current || 'project');
      setSelectedProjectId(projectId);
      if (appData.selectedWorld) {
        setSelectedWorld(appData.selectedWorld);
      }
    }
  }, []);

  // 当项目ID变化时加载项目数据并保存到本地存储
  useEffect(() => {
    loadProjectData();
  }, [selectedProjectId]);

  // 当当前页面变化时保存到本地存储
  useEffect(() => {
    // 保存项目选择到本地存储，但只保存非null值
    if (selectedProjectId !== null && selectedProjectId !== undefined) {
      const appData = {
        current: current,
        selectedProjectId: selectedProjectId,
        selectedWorld: selectedWorld
      };
      saveToLocalStorage('novel_editor_app_data', appData);
    }
  }, [current, selectedProjectId, selectedWorld]);

  // 监听窗口大小变化，更新响应式状态
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenWidth(width);
      setIsMobile(width < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 选择项目
  const handleSelectProject = (event) => {
    const { projectId } = event.detail;
    console.log('通过事件选择项目:', projectId);
    setSelectedProjectId(projectId);
    // 保存项目选择到本地存储
    const appData = {
      current: current,
      selectedProjectId: projectId,
      selectedWorld: selectedWorld
    };
    saveToLocalStorage('novel_editor_app_data', appData);
  };

  // 监听导航事件
  useEffect(() => {
    const handleNavigateTo = (event) => {
      const { key } = event.detail;
      setCurrent(key);
    };

    const handleRefreshProjects = () => {
      fetchProjects();
    };

    window.addEventListener('navigateTo', handleNavigateTo);
    window.addEventListener('selectProject', handleSelectProject);
    window.addEventListener('refreshProjects', handleRefreshProjects);
    return () => {
      window.removeEventListener('navigateTo', handleNavigateTo);
      window.removeEventListener('selectProject', handleSelectProject);
      window.removeEventListener('refreshProjects', handleRefreshProjects);
    };
  }, []);

  // 渲染内容区域
  const renderContent = () => {
    return (
      <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}><Spin size="large" /></div>}>
        {current === 'project' && (
          <ProjectManagement onSelectProject={setSelectedProjectId} />
        )}
        {current === 'editor' && (
          <EditorPage projectId={selectedProjectId} />
        )}
        {current === 'blueprint' && (
          <BlueprintPage projectId={selectedProjectId} />
        )}
        {current === 'navigation' && (
          <NavigationPage projectId={selectedProjectId} />
        )}
        {current === 'setting' && (
          <SettingManagement projectId={selectedProjectId} />
        )}
        {current === 'visualization' && (
          <DataVisualization
            projectId={selectedProjectId}
            chapters={chapters}
            characters={characters}
          />
        )}
        {current === 'analysis' && (
          <WorkAnalysis
            projectId={selectedProjectId}
            chapters={chapters}
            characters={characters}
          />
        )}
        {current === 'system' && (
          <SystemSetting />
        )}
      </Suspense>
    );
  };

  return (
    <App
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        {!isMobile ? (
          // 桌面端布局 - 顶部导航栏
          <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '0 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff', marginRight: '24px' }}>
                创世之笔
              </div>
              <Menu
                mode="horizontal"
                selectedKeys={[current]}
                style={{ flex: 1, minWidth: 0 }}
                items={items}
                onClick={handleMenuClick}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {/* 项目选择器 */}
              <Space>
                <span style={{ color: '#666' }}>当前项目:</span>
                <Select
                  style={{ width: 180 }}
                  placeholder="选择项目"
                  value={selectedProjectId}
                  onChange={setSelectedProjectId}
                  allowClear
                  onClear={() => setSelectedProjectId(null)}
                  loading={projectsLoading}
                >
                  {projects.map(project => (
                    <Select.Option key={project.id} value={project.id}>
                      {project.title}
                    </Select.Option>
                  ))}
                </Select>
              </Space>
              <Button
                icon={<SaveOutlined />}
                onClick={() => setIsSaveModalVisible(true)}
                title="保存到本地存储"
                size="middle"
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={() => setIsLoadModalVisible(true)}
                title="从本地存储加载"
                size="middle"
              />
              <Button
                icon={<DownloadOutlined />}
                onClick={() => setIsBackupModalVisible(true)}
                title="备份到文件"
                size="middle"
              />
              <Button
                icon={<UploadOutlined />}
                onClick={() => setIsRestoreModalVisible(true)}
                title="从文件恢复"
                size="middle"
              />
            </div>
          </Header>
        ) : (
          // 移动端布局
          <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '0 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setIsMobileMenuOpen(true)}
                style={{ marginRight: '16px' }}
              />
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
                创世之笔
              </div>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <Button
                icon={<SaveOutlined />}
                onClick={() => setIsSaveModalVisible(true)}
                title="保存到本地存储"
                size="small"
              />
              <Button
                icon={<DownloadOutlined />}
                onClick={() => setIsBackupModalVisible(true)}
                title="备份到文件"
                size="small"
              />
            </div>
          </Header>
        )}

        {/* 主内容区域 */}
        <Layout>
          <Content style={{
            margin: isMobile ? '16px' : '24px',
            padding: isMobile ? 16 : 24,
            background: colorBgContainer,
            minHeight: 'calc(100vh - 112px)',
            borderRadius: borderRadiusLG,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            overflow: 'auto',
            width: '100%',
          }}>
            <Breadcrumb items={getBreadcrumbItems()} style={{ marginBottom: 16 }} />
            <div style={{ width: '100%', minHeight: '100%' }}>
              {renderContent()}
            </div>
          </Content>
        </Layout>

        {/* 移动端菜单抽屉 */}
        <Drawer
          title={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span>导航菜单</span>
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={() => setIsMobileMenuOpen(false)}
              />
            </div>
          }
          placement="left"
          onClose={() => setIsMobileMenuOpen(false)}
          open={isMobileMenuOpen}
          styles={{ body: { padding: 0 } }}
          size={240}
        >
          <Menu
            mode="inline"
            selectedKeys={[current]}
            style={{ height: '100%', borderRight: 0 }}
            items={items}
            onClick={(e) => {
              handleMenuClick(e);
              setIsMobileMenuOpen(false);
            }}
          />
          <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0' }}>
            {/* 移动端项目选择器 */}
            <div style={{ marginBottom: 16 }}>
              <span style={{ color: '#666', display: 'block', marginBottom: 8 }}>当前项目:</span>
              <Select
                style={{ width: '100%' }}
                placeholder="选择项目"
                value={selectedProjectId}
                onChange={setSelectedProjectId}
                allowClear
                onClear={() => setSelectedProjectId(null)}
                loading={projectsLoading}
              >
                {projects.map(project => (
                  <Select.Option key={project.id} value={project.id}>
                    {project.title}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setIsLoadModalVisible(true);
                setIsMobileMenuOpen(false);
              }}
              style={{ width: '100%', marginBottom: '8px' }}
            >
              从本地存储加载
            </Button>
            <Button
              icon={<UploadOutlined />}
              onClick={() => {
                setIsRestoreModalVisible(true);
                setIsMobileMenuOpen(false);
              }}
              style={{ width: '100%' }}
            >
              从文件恢复
            </Button>
          </div>
        </Drawer>

        {/* 保存到本地存储模态框 */}
        <Modal
          title="保存到本地存储"
          open={isSaveModalVisible}
          onCancel={() => setIsSaveModalVisible(false)}
          onOk={handleSaveToLocal}
          destroyOnHidden
        >
          <p>确定要将当前应用状态保存到本地存储吗？</p>
          <p style={{ color: '#666', fontSize: '14px' }}>这将保存当前的导航状态和选中的项目ID。</p>
        </Modal>

        {/* 从本地存储加载模态框 */}
        <Modal
          title="从本地存储加载"
          open={isLoadModalVisible}
          onCancel={() => setIsLoadModalVisible(false)}
          onOk={handleLoadFromLocal}
          destroyOnHidden
        >
          <p>确定要从本地存储加载应用状态吗？</p>
          <p style={{ color: '#666', fontSize: '14px' }}>这将覆盖当前的导航状态和选中的项目ID。</p>
        </Modal>

        {/* 备份到文件模态框 */}
        <Modal
          title="备份到文件"
          open={isBackupModalVisible}
          onCancel={() => setIsBackupModalVisible(false)}
          onOk={handleBackupToFile}
          destroyOnHidden
        >
          <p>请输入备份文件名：</p>
          <input
            type="text"
            value={backupName}
            onChange={(e) => setBackupName(e.target.value)}
            placeholder="默认：novel_editor_backup"
            style={{ width: '100%', padding: '8px', marginBottom: '16px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
          />
          <p style={{ color: '#666', fontSize: '14px' }}>这将创建一个包含当前应用状态的JSON文件。</p>
        </Modal>

        {/* 从文件恢复模态框 */}
        <Modal
          title="从文件恢复"
          open={isRestoreModalVisible}
          onCancel={() => setIsRestoreModalVisible(false)}
          footer={null}
          destroyOnHidden
        >
          <p>请选择要恢复的备份文件：</p>
          <input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            style={{ width: '100%', marginBottom: '16px' }}
          />
          <p style={{ color: '#666', fontSize: '14px' }}>这将从JSON文件中恢复应用状态，覆盖当前的导航状态和选中的项目ID。</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button onClick={() => setIsRestoreModalVisible(false)}>取消</Button>
          </div>
        </Modal>

      </Layout>
    </App>
  );
}

export default NovelEditorApp;

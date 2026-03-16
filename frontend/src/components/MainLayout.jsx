import React, { useState } from 'react';
import { Layout, Menu, Button, Select, Space, Typography, theme } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  GlobalOutlined,
  BookOutlined,
  UserOutlined,
  EnvironmentOutlined,
  ToolOutlined,
  TeamOutlined,
  SettingOutlined,
  HomeOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { useWorld } from '../contexts/WorldContext';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const MainLayout = ({ children, activeModule, onModuleChange }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { selectedWorld, worlds, selectWorld, loading } = useWorld();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: 'world',
      icon: <GlobalOutlined />,
      label: '世界管理',
    },
    {
      key: 'characters',
      icon: <UserOutlined />,
      label: '角色管理',
    },
    {
      key: 'locations',
      icon: <EnvironmentOutlined />,
      label: '地点管理',
    },
    {
      key: 'items',
      icon: <ToolOutlined />,
      label: '物品管理',
    },
    {
      key: 'factions',
      icon: <TeamOutlined />,
      label: '势力管理',
    },
    {
      key: 'settings',
      icon: <DatabaseOutlined />,
      label: '设定数据库',
    },
    {
      key: 'system',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
  ];

  const handleMenuClick = (e) => {
    onModuleChange(e.key);
  };

  const handleWorldChange = (worldId) => {
    const world = worlds.find(w => w.id === worldId);
    selectWorld(world || null);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        style={{
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <Title level={collapsed ? 5 : 4} style={{ margin: 0, color: '#1890ff' }}>
            {collapsed ? '创' : '创世之笔'}
          </Title>
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[activeModule]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Space>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
            <span style={{ fontSize: 16, fontWeight: 500 }}>
              {menuItems.find(item => item.key === activeModule)?.label || '首页'}
            </span>
          </Space>
          
          <Space>
            <span style={{ color: '#666' }}>当前世界:</span>
            <Select
              style={{ width: 200 }}
              placeholder="选择世界观"
              value={selectedWorld?.id}
              onChange={handleWorldChange}
              loading={loading}
              allowClear
              onClear={() => selectWorld(null)}
            >
              {worlds.map(world => (
                <Select.Option key={world.id} value={world.id}>
                  {world.name}
                </Select.Option>
              ))}
            </Select>
          </Space>
        </Header>
        <Content
          style={{
            margin: 24,
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 280,
            overflow: 'auto',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;

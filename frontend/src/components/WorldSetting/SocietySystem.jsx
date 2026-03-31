import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Statistic, Tabs
} from 'antd';
import {
  GlobalOutlined, TeamOutlined, SmileOutlined,
  DollarOutlined, CrownOutlined
} from '@ant-design/icons';
import { societyApi } from '../../services/api';
import CivilizationManagement from './SocietySystem/CivilizationManagement';
import SocialClassManagement from './SocietySystem/SocialClassManagement';
import CulturalCustomsManagement from './SocietySystem/CulturalCustomsManagement';
import EconomicSystemManagement from './SocietySystem/EconomicSystemManagement';
import PoliticalSystemManagement from './SocietySystem/PoliticalSystemManagement';

const SocietySystem = ({ worldId }) => {
  const [activeTab, setActiveTab] = useState('civilizations');
  const [civilizations, setCivilizations] = useState([]);
  const [stats, setStats] = useState({
    civilizations: 0,
    socialClasses: 0,
    culturalCustoms: 0,
    economicSystems: 0,
    politicalSystems: 0,
  });

  const loadStats = useCallback(() => {
    if (worldId) {
      Promise.all([
        societyApi.getCivilizations(worldId),
        societyApi.getSocialClasses(worldId),
        societyApi.getCulturalCustoms(worldId),
        societyApi.getEconomicSystems(worldId),
        societyApi.getPoliticalSystems(worldId),
      ]).then(([civs, classes, customs, economies, politics]) => {
        setStats({
          civilizations: civs.data.data?.length || 0,
          socialClasses: classes.data.data?.length || 0,
          culturalCustoms: customs.data.data?.length || 0,
          economicSystems: economies.data.data?.length || 0,
          politicalSystems: politics.data.data?.length || 0,
        });
      });
    }
  }, [worldId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleCivilizationsChange = useCallback((newCivilizations) => {
    setCivilizations(newCivilizations);
  }, []);

  const tabItems = [
    {
      key: 'civilizations',
      label: '文明',
      children: <CivilizationManagement worldId={worldId} civilizations={civilizations} onRefresh={loadStats} onCivilizationsChange={handleCivilizationsChange} />,
    },
    {
      key: 'socialClasses',
      label: '社会阶层',
      children: <SocialClassManagement worldId={worldId} civilizations={civilizations} onRefresh={loadStats} />,
    },
    {
      key: 'culturalCustoms',
      label: '文化习俗',
      children: <CulturalCustomsManagement worldId={worldId} civilizations={civilizations} onRefresh={loadStats} />,
    },
    {
      key: 'economicSystems',
      label: '经济体系',
      children: <EconomicSystemManagement worldId={worldId} civilizations={civilizations} onRefresh={loadStats} />,
    },
    {
      key: 'politicalSystems',
      label: '政治体系',
      children: <PoliticalSystemManagement worldId={worldId} civilizations={civilizations} onRefresh={loadStats} />,
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="文明数量"
              value={stats.civilizations}
              prefix={<GlobalOutlined />}
              styles={{ content: { color: '#1890ff' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="社会阶层"
              value={stats.socialClasses}
              prefix={<TeamOutlined />}
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="文化习俗"
              value={stats.culturalCustoms}
              prefix={<SmileOutlined />}
              styles={{ content: { color: '#faad14' } }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="经济体系"
              value={stats.economicSystems}
              prefix={<DollarOutlined />}
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="政治体系"
              value={stats.politicalSystems}
              prefix={<CrownOutlined />}
              styles={{ content: { color: '#faad14' } }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </div>
  );
};

export default SocietySystem;

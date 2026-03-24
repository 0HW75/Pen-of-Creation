import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Statistic, Tabs
} from 'antd';
import {
  GlobalOutlined, ApartmentOutlined, StarOutlined, ExperimentOutlined
} from '@ant-design/icons';
import { worldSettingApi } from '../../services/api';
import DimensionManagement from './WorldArchitecture/DimensionManagement';
import RegionManagement from './WorldArchitecture/RegionManagement';
import CelestialBodyManagement from './WorldArchitecture/CelestialBodyManagement';
import NaturalLawManagement from './WorldArchitecture/NaturalLawManagement';

const WorldArchitecture = ({ worldId }) => {
  const [activeTab, setActiveTab] = useState('dimensions');
  const [stats, setStats] = useState({
    dimensions: 0,
    regions: 0,
    celestialBodies: 0,
    naturalLaws: 0,
  });

  const loadStats = useCallback(() => {
    if (worldId) {
      Promise.all([
        worldSettingApi.getDimensions(worldId),
        worldSettingApi.getRegions(worldId),
        worldSettingApi.getCelestialBodies(worldId),
        worldSettingApi.getNaturalLaws(worldId),
      ]).then(([dims, regions, bodies, laws]) => {
        setStats({
          dimensions: dims.data.data?.length || 0,
          regions: regions.data.data?.length || 0,
          celestialBodies: bodies.data.data?.length || 0,
          naturalLaws: laws.data.data?.length || 0,
        });
      });
    }
  }, [worldId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const tabItems = [
    {
      key: 'dimensions',
      label: '维度/位面',
      children: <DimensionManagement worldId={worldId} onRefresh={loadStats} />,
    },
    {
      key: 'regions',
      label: '地理区域',
      children: <RegionManagement worldId={worldId} onRefresh={loadStats} />,
    },
    {
      key: 'celestial',
      label: '天体',
      children: <CelestialBodyManagement worldId={worldId} onRefresh={loadStats} />,
    },
    {
      key: 'laws',
      label: '自然法则',
      children: <NaturalLawManagement worldId={worldId} onRefresh={loadStats} />,
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="维度数量"
              value={stats.dimensions}
              prefix={<GlobalOutlined />}
              styles={{ content: { color: '#1890ff' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="区域数量"
              value={stats.regions}
              prefix={<ApartmentOutlined />}
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="天体数量"
              value={stats.celestialBodies}
              prefix={<StarOutlined />}
              styles={{ content: { color: '#faad14' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="自然法则"
              value={stats.naturalLaws}
              prefix={<ExperimentOutlined />}
              styles={{ content: { color: '#722ed1' } }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </div>
  );
};

export default WorldArchitecture;

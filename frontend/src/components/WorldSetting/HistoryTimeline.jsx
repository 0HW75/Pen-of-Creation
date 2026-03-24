import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Statistic, Tabs
} from 'antd';
import {
  CrownOutlined, FlagOutlined, TrophyOutlined
} from '@ant-design/icons';
import { historyTimelineApi } from '../../services/api';
import HistoricalEraManagement from './HistoryTimeline/HistoricalEraManagement';
import HistoryEventManagement from './HistoryTimeline/HistoryEventManagement';
import HistoricalFigureManagement from './HistoryTimeline/HistoricalFigureManagement';

const HistoryTimeline = ({ worldId, quickCreateTarget, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('eras');
  const [stats, setStats] = useState({
    eras: 0,
    events: 0,
    figures: 0,
  });

  useEffect(() => {
    if (quickCreateTarget) {
      setActiveTab('events');
    }
  }, [quickCreateTarget]);

  const loadStats = useCallback(() => {
    if (worldId) {
      Promise.all([
        historyTimelineApi.getHistoricalEras(worldId),
        historyTimelineApi.getHistoricalEvents(worldId),
        historyTimelineApi.getHistoricalFigures(worldId),
      ]).then(([erasRes, eventsRes, figuresRes]) => {
        setStats({
          eras: erasRes.data.data?.length || 0,
          events: eventsRes.data.data?.length || 0,
          figures: figuresRes.data.data?.length || 0,
        });
      }).catch(() => {
      });
    }
  }, [worldId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const tabItems = [
    {
      key: 'eras',
      label: '历史纪元',
      children: <HistoricalEraManagement worldId={worldId} />,
    },
    {
      key: 'events',
      label: '历史事件',
      children: <HistoryEventManagement worldId={worldId} quickCreateTarget={quickCreateTarget} onUpdate={onUpdate} onRefresh={loadStats} />,
    },
    {
      key: 'figures',
      label: '历史人物',
      children: <HistoricalFigureManagement worldId={worldId} />,
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="历史纪元"
              value={stats.eras}
              prefix={<CrownOutlined />}
              styles={{ content: { color: '#faad14' } }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="历史事件"
              value={stats.events}
              prefix={<FlagOutlined />}
              styles={{ content: { color: '#f5222d' } }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="历史人物"
              value={stats.figures}
              prefix={<TrophyOutlined />}
              styles={{ content: { color: '#1890ff' } }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </div>
  );
};

export default HistoryTimeline;

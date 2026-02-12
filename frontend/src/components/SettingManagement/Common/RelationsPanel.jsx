import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Empty, Space } from 'antd';
import {
  LinkOutlined, UserOutlined, EnvironmentOutlined,
  BankOutlined, ShoppingOutlined, TeamOutlined
} from '@ant-design/icons';
import {
  characterApi, locationApi, itemApi, factionApi
} from '../../../services/api';

// 关系网络面板（增强版）
const RelationsPanel = ({ worldId }) => {
  const [stats, setStats] = useState({
    characterRelations: 0,
    factionRelations: 0,
    locationRelations: 0,
    itemRelations: 0,
    totalRelations: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRelationStats();
  }, [worldId]);

  const loadRelationStats = async () => {
    setLoading(true);
    try {
      // 并行加载各类数据来计算关系统计
      const [charactersRes, factionsRes, locationsRes, itemsRes] = await Promise.all([
        characterApi.getCharacters(null, worldId).catch(() => ({ data: [] })),
        factionApi.getFactions(null, worldId).catch(() => ({ data: [] })),
        locationApi.getLocations(null, worldId).catch(() => ({ data: [] })),
        itemApi.getItems(null, worldId).catch(() => ({ data: [] }))
      ]);

      const characters = charactersRes.data || [];
      const factions = factionsRes.data || [];
      const locations = locationsRes.data || [];
      const items = itemsRes.data || [];

      // 计算关联数量（基于各实体间的引用关系）
      const characterWithFaction = characters.filter(c => c.faction).length;
      const characterWithLocation = characters.filter(c => c.current_location).length;
      const factionWithLocation = factions.filter(f => f.headquarters_location).length;
      const itemWithOwner = items.filter(i => i.current_owner).length;

      setStats({
        characterRelations: characterWithFaction + characterWithLocation,
        factionRelations: factionWithLocation,
        locationRelations: 0,
        itemRelations: itemWithOwner,
        totalRelations: characterWithFaction + characterWithLocation + factionWithLocation + itemWithOwner
      });
    } catch (error) {
      console.error('加载关系统计失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const relationTypes = [
    { name: '角色-势力', count: stats.characterRelations, color: '#1890ff', icon: <UserOutlined /> },
    { name: '角色-地点', count: stats.characterRelations, color: '#52c41a', icon: <EnvironmentOutlined /> },
    { name: '势力-地点', count: stats.factionRelations, color: '#722ed1', icon: <BankOutlined /> },
    { name: '物品-持有者', count: stats.itemRelations, color: '#faad14', icon: <ShoppingOutlined /> },
  ];

  return (
    <div className="relations-panel">
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card title="关系统计" loading={loading}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <div className="relation-stat-item" style={{ textAlign: 'center', padding: '20px', background: '#f6ffed', borderRadius: '8px' }}>
                  <div style={{ fontSize: '32px', color: '#52c41a', marginBottom: '8px' }}>
                    <LinkOutlined />
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>{stats.totalRelations}</div>
                  <div style={{ color: '#666' }}>总关联数</div>
                </div>
              </Col>
              {relationTypes.map((type, index) => (
                <Col xs={12} sm={6} key={index}>
                  <div className="relation-stat-item" style={{ textAlign: 'center', padding: '20px', background: `${type.color}10`, borderRadius: '8px' }}>
                    <div style={{ fontSize: '24px', color: type.color, marginBottom: '8px' }}>
                      {type.icon}
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: type.color }}>{type.count}</div>
                    <div style={{ color: '#666', fontSize: '12px' }}>{type.name}</div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        <Col lg={16}>
          <Card title="关系网络图" style={{ minHeight: '400px' }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="关系网络可视化功能开发中..."
            />
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <span style={{ color: '#999' }}>将展示角色、势力、地点之间的关联关系图</span>
            </div>
          </Card>
        </Col>

        <Col lg={8}>
          <Card title="快速关联" style={{ minHeight: '400px' }}>
            <div className="quick-relations">
              <div className="quick-relation-item" style={{ padding: '12px', marginBottom: '12px', background: '#f5f5f5', borderRadius: '6px', cursor: 'pointer' }}>
                <Space>
                  <UserOutlined style={{ color: '#1890ff' }} />
                  <span>角色加入势力</span>
                </Space>
              </div>
              <div className="quick-relation-item" style={{ padding: '12px', marginBottom: '12px', background: '#f5f5f5', borderRadius: '6px', cursor: 'pointer' }}>
                <Space>
                  <ShoppingOutlined style={{ color: '#faad14' }} />
                  <span>物品分配持有者</span>
                </Space>
              </div>
              <div className="quick-relation-item" style={{ padding: '12px', marginBottom: '12px', background: '#f5f5f5', borderRadius: '6px', cursor: 'pointer' }}>
                <Space>
                  <EnvironmentOutlined style={{ color: '#52c41a' }} />
                  <span>角色移动到地点</span>
                </Space>
              </div>
              <div className="quick-relation-item" style={{ padding: '12px', marginBottom: '12px', background: '#f5f5f5', borderRadius: '6px', cursor: 'pointer' }}>
                <Space>
                  <TeamOutlined style={{ color: '#722ed1' }} />
                  <span>势力占领地点</span>
                </Space>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RelationsPanel;

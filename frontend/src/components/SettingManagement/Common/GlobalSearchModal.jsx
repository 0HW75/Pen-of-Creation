import React, { useState, useEffect } from 'react';
import { Modal, Input, Space, Tag, Empty, List, message } from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  BankOutlined,
  EnvironmentOutlined,
  ShoppingOutlined,
  HistoryOutlined,
  FileSearchOutlined
} from '@ant-design/icons';
import {
  characterApi,
  factionApi,
  locationApi,
  itemApi,
  historyTimelineApi
} from '../../../services/api';

const GlobalSearchModal = ({ visible, onClose, worldId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (visible && searchTerm) {
      performSearch(searchTerm);
    }
  }, [visible, searchTerm, activeFilter]);

  const performSearch = async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const [charactersRes, factionsRes, locationsRes, itemsRes, eventsRes] = await Promise.all([
        characterApi.getCharacters(null, worldId).catch(() => ({ data: [] })),
        factionApi.getFactions(null, worldId).catch(() => ({ data: [] })),
        locationApi.getLocations(null, worldId).catch(() => ({ data: [] })),
        itemApi.getItems(null, worldId).catch(() => ({ data: [] })),
        historyTimelineApi.getHistoricalEvents(worldId).catch(() => ({ data: { data: [] } }))
      ]);

      const characters = (charactersRes.data || []).map(c => ({ ...c, type: 'character', typeName: '角色' }));
      const factions = (factionsRes.data || []).map(f => ({ ...f, type: 'faction', typeName: '势力' }));
      const locations = (locationsRes.data || []).map(l => ({ ...l, type: 'location', typeName: '地点' }));
      const items = (itemsRes.data || []).map(i => ({ ...i, type: 'item', typeName: '物品' }));
      const events = (eventsRes.data?.data || []).map(e => ({ ...e, type: 'event', typeName: '事件' }));

      const allResults = [...characters, ...factions, ...locations, ...items, ...events];

      const filtered = allResults.filter(item => {
        const matchType = activeFilter === 'all' || item.type === activeFilter;
        const matchSearch =
          (item.name && item.name.toLowerCase().includes(term.toLowerCase())) ||
          (item.description && item.description.toLowerCase().includes(term.toLowerCase())) ||
          (item.title && item.title.toLowerCase().includes(term.toLowerCase()));
        return matchType && matchSearch;
      });

      setSearchResults(filtered);
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      character: '#1890ff',
      faction: '#722ed1',
      location: '#52c41a',
      item: '#faad14',
      event: '#fa8c16'
    };
    return colors[type] || '#999';
  };

  const getTypeIcon = (type) => {
    const icons = {
      character: <UserOutlined />,
      faction: <BankOutlined />,
      location: <EnvironmentOutlined />,
      item: <ShoppingOutlined />,
      event: <HistoryOutlined />
    };
    return icons[type] || <FileSearchOutlined />;
  };

  return (
    <Modal
      title={
        <Space>
          <SearchOutlined />
          <span>全局搜索</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Input.Search
        placeholder="搜索角色、势力、地点、物品、事件..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onSearch={performSearch}
        loading={loading}
        style={{ marginBottom: 16 }}
        allowClear
      />

      <Space style={{ marginBottom: 16 }} wrap>
        <Tag color={activeFilter === 'all' ? 'blue' : 'default'} style={{ cursor: 'pointer' }} onClick={() => setActiveFilter('all')}>全部</Tag>
        <Tag color={activeFilter === 'character' ? 'blue' : 'default'} style={{ cursor: 'pointer' }} onClick={() => setActiveFilter('character')}><UserOutlined /> 角色</Tag>
        <Tag color={activeFilter === 'faction' ? 'purple' : 'default'} style={{ cursor: 'pointer' }} onClick={() => setActiveFilter('faction')}><BankOutlined /> 势力</Tag>
        <Tag color={activeFilter === 'location' ? 'green' : 'default'} style={{ cursor: 'pointer' }} onClick={() => setActiveFilter('location')}><EnvironmentOutlined /> 地点</Tag>
        <Tag color={activeFilter === 'item' ? 'gold' : 'default'} style={{ cursor: 'pointer' }} onClick={() => setActiveFilter('item')}><ShoppingOutlined /> 物品</Tag>
        <Tag color={activeFilter === 'event' ? 'orange' : 'default'} style={{ cursor: 'pointer' }} onClick={() => setActiveFilter('event')}><HistoryOutlined /> 事件</Tag>
      </Space>

      <div style={{ maxHeight: '400px', overflow: 'auto' }}>
        {searchResults.length === 0 ? (
          <Empty description={searchTerm ? '未找到匹配结果' : '输入关键词开始搜索'} />
        ) : (
          <List
            dataSource={searchResults}
            renderItem={item => (
              <List.Item style={{ cursor: 'pointer', padding: '12px', borderRadius: '6px' }} onClick={() => message.info(`查看 ${item.name} 详情`)}>
                <List.Item.Meta
                  avatar={
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${getTypeColor(item.type)}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: getTypeColor(item.type) }}>
                      {getTypeIcon(item.type)}
                    </div>
                  }
                  title={<Space><span>{item.name}</span><Tag color={getTypeColor(item.type)}>{item.typeName}</Tag></Space>}
                  description={item.description?.substring(0, 100) || '暂无描述'}
                />
              </List.Item>
            )}
          />
        )}
      </div>

      {searchResults.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: 16, color: '#999' }}>找到 {searchResults.length} 个结果</div>
      )}
    </Modal>
  );
};

export default GlobalSearchModal;

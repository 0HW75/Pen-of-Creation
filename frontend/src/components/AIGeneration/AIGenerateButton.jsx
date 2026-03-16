import React from 'react';
import { Button, Tooltip } from 'antd';
import { StarOutlined } from '@ant-design/icons';

const AIGenerateButton = ({ onClick, entityType, size = 'default', type = 'default' }) => {
  const ENTITY_TYPE_LABELS = {
    character: '角色',
    location: '地点',
    item: '物品',
    faction: '势力',
    energy_system: '能量体系',
    civilization: '文明文化',
    historical_event: '历史事件',
    region: '地理区域',
    dimension: '维度位面'
  };

  const label = ENTITY_TYPE_LABELS[entityType] || '设定';

  return (
    <Tooltip title={`AI智能生成${label}`}>
      <Button
        type={type}
        icon={<StarOutlined />}
        onClick={onClick}
        size={size}
        style={{ 
          background: type === 'primary' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : undefined,
          borderColor: '#667eea',
          color: type === 'primary' ? '#fff' : '#667eea'
        }}
      >
        AI生成
      </Button>
    </Tooltip>
  );
};

export default AIGenerateButton;

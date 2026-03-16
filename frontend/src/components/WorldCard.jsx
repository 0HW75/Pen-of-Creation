import React from 'react';
import { Card, Tag, Statistic, Button, Popconfirm, Tooltip } from 'antd';
import {
  GlobalOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  EnvironmentOutlined,
  FlagOutlined,
  ClockCircleOutlined,
  EnterOutlined,
  EyeOutlined
} from '@ant-design/icons';
import '../styles/WorldCard.css';

const WorldCard = ({
  world,
  stats = {},
  isSelected = false,
  onEnter,
  onEdit,
  onDelete,
  onView
}) => {
  const getWorldTypeColor = (type) => {
    const colors = {
      '单一世界': 'blue',
      '多元宇宙': 'purple',
      '位面世界': 'cyan',
      '虚拟世界': 'green',
      '梦境世界': 'pink',
      '其他': 'default'
    };
    return colors[type] || 'default';
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'success' : 'error';
  };

  return (
    <Card
      className={`world-card ${isSelected ? 'selected' : ''}`}
      hoverable
      cover={
        <div
          className="world-card-cover"
          style={{
            background: world.cover_image
              ? `url(${world.cover_image}) center/cover`
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          <div className="world-card-overlay">
            <div className="world-card-actions">
              <Tooltip title="进入世界">
                <Button
                  type="primary"
                  shape="circle"
                  icon={<EnterOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEnter?.(world);
                  }}
                />
              </Tooltip>
              <Tooltip title="查看详情">
                <Button
                  shape="circle"
                  icon={<EyeOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onView?.(world);
                  }}
                />
              </Tooltip>
              <Tooltip title="编辑">
                <Button
                  shape="circle"
                  icon={<EditOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(world);
                  }}
                />
              </Tooltip>
              <Popconfirm
                title="确定要删除这个世界吗？"
                description="删除后将无法恢复，该世界的所有设定数据也会被删除"
                onConfirm={(e) => {
                  e?.stopPropagation();
                  onDelete?.(world);
                }}
                okText="确定"
                cancelText="取消"
              >
                <Button
                  shape="circle"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => e.stopPropagation()}
                />
              </Popconfirm>
            </div>
          </div>
          {isSelected && (
            <div className="world-card-selected-badge">
              <span>当前选中</span>
            </div>
          )}
        </div>
      }
      onClick={() => onView?.(world)}
    >
      <div className="world-card-content">
        <div className="world-card-header">
          <h3 className="world-card-title">
            <GlobalOutlined className="world-icon" />
            {world.name}
          </h3>
          <div className="world-card-tags">
            <Tag color={getWorldTypeColor(world.world_type)}>
              {world.world_type}
            </Tag>
            <Tag color={getStatusColor(world.status)}>
              {world.status === 'active' ? '活跃' : '停用'}
            </Tag>
          </div>
        </div>

        <p className="world-card-concept" title={world.core_concept}>
          {world.core_concept || '暂无核心概念描述'}
        </p>

        <div className="world-card-stats">
          <Statistic
            title="角色"
            value={stats.character_count || 0}
            prefix={<UserOutlined />}
            styles={{ content: { fontSize: '16px'  } }}
          />
          <Statistic
            title="地点"
            value={stats.location_count || 0}
            prefix={<EnvironmentOutlined />}
            styles={{ content: { fontSize: '16px'  } }}
          />
          <Statistic
            title="势力"
            value={stats.faction_count || 0}
            prefix={<FlagOutlined />}
            styles={{ content: { fontSize: '16px'  } }}
          />
          <Statistic
            title="事件"
            value={stats.event_count || 0}
            prefix={<ClockCircleOutlined />}
            styles={{ content: { fontSize: '16px'  } }}
          />
        </div>

        <div className="world-card-footer">
          <span className="world-card-date">
            创建于 {new Date(world.created_at).toLocaleDateString()}
          </span>
          <span className="world-card-version">
            v{world.version || '1.0'}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default WorldCard;

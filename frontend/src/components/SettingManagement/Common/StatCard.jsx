import React from 'react';
import { Card } from 'antd';

// 统计卡片组件
const StatCard = ({ icon, title, value, color, trend }) => (
  <Card className="stat-card" variant="borderless">
    <div className="stat-card-content">
      <div className="stat-icon" style={{ backgroundColor: `${color}20`, color }}>
        {icon}
      </div>
      <div className="stat-info">
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
        {trend && <div className="stat-trend" style={{ color: trend > 0 ? '#52c41a' : '#ff4d4f' }}>
          {trend > 0 ? '+' : ''}{trend} 本周新增
        </div>}
      </div>
    </div>
  </Card>
);

export default StatCard;

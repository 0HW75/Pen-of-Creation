import React from 'react';
import { Tag } from 'antd';

// 实体卡片组件
const EntityCard = ({ title, subtitle, tags, icon, color, onClick, extra }) => (
  <div className="entity-card" onClick={onClick}>
    <div className="entity-card-header" style={{ background: `linear-gradient(135deg, ${color}20 0%, ${color}05 100%)` }}>
      <div className="entity-icon" style={{ color }}>
        {icon}
      </div>
      {extra && <div className="entity-extra">{extra}</div>}
    </div>
    <div className="entity-card-body">
      <h4 className="entity-title">{title}</h4>
      <p className="entity-subtitle">{subtitle}</p>
      <div className="entity-tags">
        {tags.map((tag, index) => (
          <Tag key={index} className="entity-tag">{tag}</Tag>
        ))}
      </div>
    </div>
  </div>
);

export default EntityCard;

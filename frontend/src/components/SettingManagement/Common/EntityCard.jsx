import React, { useState, useEffect } from 'react';
import { Tag, Tooltip, Badge } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import { chapterAppearanceApi } from '../../../services/api';

const EntityCard = ({ title, subtitle, tags, icon, color, onClick, extra, entityType, entityId, projectId, showChapterIndex = true }) => {
  const [chapterCount, setChapterCount] = useState(0);

  useEffect(() => {
    if (showChapterIndex && entityType && entityId) {
      loadChapterCount();
    }
  }, [entityType, entityId, showChapterIndex]);

  const loadChapterCount = async () => {
    try {
      const res = await chapterAppearanceApi.getEntityAppearances(entityType, entityId);
      if (res.data.code === 200) {
        setChapterCount(res.data.data?.length || 0);
      }
    } catch (error) {
      console.error('加载章节出现数量失败:', error);
    }
  };

  return (
    <div className="entity-card" onClick={onClick}>
      <div className="entity-card-header" style={{ background: `linear-gradient(135deg, ${color}20 0%, ${color}05 100%)` }}>
        <div className="entity-icon" style={{ color }}>
          {icon}
        </div>
        {extra && <div className="entity-extra">{extra}</div>}
        {showChapterIndex && chapterCount > 0 && (
          <Tooltip title={`在 ${chapterCount} 个章节中出现`}>
            <div className="entity-chapter-badge" onClick={(e) => e.stopPropagation()}>
              <Badge count={chapterCount} size="small" style={{ backgroundColor: color }}>
                <BookOutlined style={{ fontSize: 14, color: color }} />
              </Badge>
            </div>
          </Tooltip>
        )}
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
};

export default EntityCard;

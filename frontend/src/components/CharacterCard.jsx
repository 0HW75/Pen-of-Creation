import React from 'react';
import { Card, Tag, Avatar, Badge, Tooltip, Button, Popconfirm } from 'antd';
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  HeartOutlined,
  ThunderboltOutlined,
  CrownOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  StarOutlined,
  FireOutlined,
  SafetyOutlined,
  ExperimentOutlined,
  BookOutlined,
  ToolOutlined
} from '@ant-design/icons';
import '../styles/CharacterCard.css';

const CharacterCard = ({
  character,
  onView,
  onEdit,
  onDelete,
  viewMode = 'grid' // 'grid' | 'list'
}) => {
  // 获取角色类型颜色
  const getRoleColor = (role) => {
    const colors = {
      '主角': 'gold',
      '配角': 'blue',
      '反派': 'red',
      'NPC': 'default',
      '领袖': 'purple',
      '战士': 'orange',
      '法师': 'cyan',
      '治疗': 'green'
    };
    return colors[role] || 'default';
  };

  // 获取阵营颜色
  const getAlignmentColor = (alignment) => {
    if (!alignment) return 'default';
    if (alignment.includes('善良')) return 'green';
    if (alignment.includes('邪恶')) return 'red';
    if (alignment.includes('中立')) return 'blue';
    return 'default';
  };

  // 获取职业图标
  const getClassIcon = (characterClass) => {
    const iconMap = {
      '战士': <ThunderboltOutlined />,
      '法师': <FireOutlined />,
      '牧师': <HeartOutlined />,
      '盗贼': <ToolOutlined />,
      '猎人': <EnvironmentOutlined />,
      '骑士': <SafetyOutlined />,
      '术士': <ExperimentOutlined />,
      '德鲁伊': <BookOutlined />
    };
    return iconMap[characterClass] || <UserOutlined />;
  };

  // 渲染标签
  const renderTags = () => {
    const tags = [];
    if (character.role) {
      tags.push(<Tag key="role" color={getRoleColor(character.role)}>{character.role}</Tag>);
    }
    if (character.alignment) {
      tags.push(<Tag key="alignment" color={getAlignmentColor(character.alignment)}>{character.alignment}</Tag>);
    }
    if (character.faction_name) {
      tags.push(<Tag key="faction">{character.faction_name}</Tag>);
    }
    return tags;
  };

  // 网格视图
  if (viewMode === 'grid') {
    return (
      <Card
        className="character-card"
        hoverable
        cover={
          <div className="character-card-cover">
            <div 
              className="character-avatar-large"
              style={{
                background: character.avatar 
                  ? `url(${character.avatar}) center/cover` 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              {!character.avatar && getClassIcon(character.character_class)}
            </div>
            <div className="character-level-badge">
              Lv.{character.level || 1}
            </div>
            {character.is_important && (
              <div className="character-important-badge">
                <StarOutlined />
              </div>
            )}
          </div>
        }
        actions={[
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={(e) => {
                e.stopPropagation();
                onView?.(character);
              }}
            />
          </Tooltip>,
          <Tooltip title="编辑">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(character);
              }}
            />
          </Tooltip>,
          <Popconfirm
            title="确定要删除这个角色吗？"
            onConfirm={(e) => {
              e?.stopPropagation();
              onDelete?.(character);
            }}
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />}
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm>
        ]}
        onClick={() => onView?.(character)}
      >
        <div className="character-card-content">
          <h4 className="character-name" title={character.name}>
            {character.name}
          </h4>
          <p className="character-title" title={character.title}>
            {character.title || '无称号'}
          </p>
          
          <div className="character-info-row">
            <span className="character-class">
              {getClassIcon(character.character_class)}
              <span>{character.character_class || '未知职业'}</span>
            </span>
            <span className="character-race">
              {character.race || '未知种族'}
            </span>
          </div>

          <div className="character-tags">
            {renderTags()}
          </div>

          {character.location_name && (
            <div className="character-location">
              <EnvironmentOutlined />
              <span>{character.location_name}</span>
            </div>
          )}

          {character.status && (
            <div className={`character-status status-${character.status}`}>
              <Badge 
                status={character.status === 'alive' ? 'success' : 'error'} 
                text={character.status === 'alive' ? '存活' : '已死亡'}
              />
            </div>
          )}
        </div>
      </Card>
    );
  }

  // 列表视图
  return (
    <Card className="character-card-list" hoverable onClick={() => onView?.(character)}>
      <div className="character-list-content">
        <div className="character-list-avatar">
          <Avatar
            size={64}
            src={character.avatar}
            icon={getClassIcon(character.character_class)}
            style={{
              background: !character.avatar 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                : undefined
            }}
          />
          {character.is_important && (
            <div className="character-list-important">
              <StarOutlined />
            </div>
          )}
        </div>

        <div className="character-list-info">
          <div className="character-list-header">
            <h4 className="character-list-name">{character.name}</h4>
            <span className="character-list-level">Lv.{character.level || 1}</span>
          </div>
          
          <p className="character-list-title">{character.title || '无称号'}</p>
          
          <div className="character-list-details">
            <span><UserOutlined /> {character.race || '未知种族'}</span>
            <span>{getClassIcon(character.character_class)} {character.character_class || '未知职业'}</span>
            {character.location_name && (
              <span><EnvironmentOutlined /> {character.location_name}</span>
            )}
          </div>

          <div className="character-list-tags">
            {renderTags()}
          </div>
        </div>

        <div className="character-list-actions">
          <Button 
            type="primary" 
            icon={<EyeOutlined />} 
            onClick={(e) => {
              e.stopPropagation();
              onView?.(character);
            }}
          >
            查看
          </Button>
          <Button 
            icon={<EditOutlined />} 
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(character);
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个角色吗？"
            onConfirm={(e) => {
              e?.stopPropagation();
              onDelete?.(character);
            }}
          >
            <Button 
              danger 
              icon={<DeleteOutlined />}
              onClick={(e) => e.stopPropagation()}
            >
              删除
            </Button>
          </Popconfirm>
        </div>
      </div>
    </Card>
  );
};

export default CharacterCard;

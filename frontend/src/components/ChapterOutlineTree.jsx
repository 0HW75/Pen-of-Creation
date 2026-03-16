import React, { useState, useMemo, useEffect } from 'react';
import { Tree, Badge, Typography, Space, Tooltip, Empty } from 'antd';
import { 
  FileTextOutlined, 
  EditOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FolderOutlined,
  FolderOpenOutlined
} from '@ant-design/icons';

const { Text } = Typography;

/**
 * 章节大纲树组件
 * 
 * 功能：
 * 1. 树状结构展示章节
 * 2. 显示章节状态（未写/写作中/已完成/修改中）
 * 3. 支持点击切换章节
 * 4. 显示章节字数统计
 */
const ChapterOutlineTree = ({
  chapters = [],
  currentChapterId,
  onChapterSelect
}) => {
  const [expandedKeys, setExpandedKeys] = useState([]);

  // 调试信息
  console.log('ChapterOutlineTree - chapters:', chapters);
  console.log('ChapterOutlineTree - chapters.length:', chapters.length);
  
  // 按卷/篇分组章节
  const groupedChapters = useMemo(() => {
    const groups = {};

    chapters.forEach(chapter => {
      // 如果章节有 volume 或 group 字段，按此分组
      const groupKey = chapter.volume || chapter.group || '正文';

      if (!groups[groupKey]) {
        groups[groupKey] = {
          title: groupKey,
          chapters: [],
          key: `group-${groupKey}`
        };
      }
      groups[groupKey].chapters.push(chapter);
    });

    return Object.values(groups);
  }, [chapters]);

  // 自动展开所有分组
  useEffect(() => {
    const allGroupKeys = groupedChapters.map(g => g.key);
    setExpandedKeys(allGroupKeys);
  }, [groupedChapters]);
  
  // 构建树形数据
  const treeData = useMemo(() => {
    // 计算全局章节序号
    let globalChapterIndex = 0;

    return groupedChapters.map(group => ({
      title: (
        <Space>
          <Text strong>{group.title}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            ({group.chapters.length}章)
          </Text>
        </Space>
      ),
      key: group.key,
      icon: ({ expanded }) => expanded ? <FolderOpenOutlined /> : <FolderOutlined />,
      children: group.chapters.map(chapter => {
        globalChapterIndex++;
        return {
          title: (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%'
            }}>
              <Space size="small">
                {getStatusIcon(chapter.status)}
                <Text
                  style={{
                    fontSize: '13px',
                    color: chapter.id === currentChapterId ? '#1890ff' : undefined
                  }}
                >
                  第{globalChapterIndex}章 {chapter.title}
                </Text>
              </Space>
              {chapter.word_count > 0 && (
                <Text type="secondary" style={{ fontSize: '11px' }}>
                  {chapter.word_count}字
                </Text>
              )}
            </div>
          ),
          key: chapter.id.toString(),
          isLeaf: true,
          chapter: chapter
        };
      })
    }));
  }, [groupedChapters, currentChapterId]);
  
  // 获取状态图标
  function getStatusIcon(status) {
    switch (status) {
      case '已完成':
        return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '12px' }} />;
      case '写作中':
        return <EditOutlined style={{ color: '#1890ff', fontSize: '12px' }} />;
      case '修改中':
        return <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: '12px' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#d9d9d9', fontSize: '12px' }} />;
    }
  }
  
  // 处理节点选择
  const handleSelect = (selectedKeys, { node }) => {
    if (node?.chapter && onChapterSelect) {
      onChapterSelect(node.chapter);
    }
  };
  
  // 处理展开/收起
  const handleExpand = (expandedKeys) => {
    setExpandedKeys(expandedKeys);
  };
  
  if (chapters.length === 0) {
    return (
      <Empty 
        description="暂无章节" 
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        style={{ marginTop: '40px' }}
      />
    );
  }
  
  return (
    <div style={{ height: '100%' }}>
      {/* 统计信息 */}
      <div style={{ 
        padding: '8px 0', 
        borderBottom: '1px solid #f0f0f0',
        marginBottom: '8px'
      }}>
        <Space size="large">
          <Tooltip title="总章节数">
            <Space size="small">
              <FileTextOutlined style={{ color: '#1890ff' }} />
              <Text>{chapters.length}章</Text>
            </Space>
          </Tooltip>
          <Tooltip title="已完成">
            <Space size="small">
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <Text>{chapters.filter(c => c.status === '已完成').length}章</Text>
            </Space>
          </Tooltip>
        </Space>
      </div>
      
      {/* 章节树 */}
      <Tree
        treeData={treeData}
        selectedKeys={currentChapterId ? [currentChapterId.toString()] : []}
        expandedKeys={expandedKeys}
        onSelect={handleSelect}
        onExpand={handleExpand}
        blockNode
        showIcon
        style={{ 
          background: 'transparent',
          fontSize: '13px'
        }}
      />
    </div>
  );
};

export default ChapterOutlineTree;

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Layout, Card, Typography, Space, Divider, Button, Tooltip, Badge } from 'antd';
import { 
  MenuFoldOutlined, MenuUnfoldOutlined,
  BookOutlined, FileTextOutlined, AimOutlined,
  RiseOutlined, FallOutlined, MinusOutlined
} from '@ant-design/icons';
import TextEditor from './TextEditor';
import ChapterOutlineTree from './ChapterOutlineTree';
import WritingGoalPanel from './WritingGoalPanel';
import OutlineReferencePanel from './OutlineReferencePanel';

const { Sider, Content } = Layout;
const { Text } = Typography;

/**
 * 分屏编辑器组件
 * 
 * 功能：
 * 1. 左侧大纲树（可折叠）
 * 2. 中间编辑器区域
 * 3. 右侧大纲参考面板（可折叠）
 * 4. 可拖拽调整左右面板宽度
 * 5. 悬浮窗显示核心事件和情绪目标
 */
const SplitScreenEditor = ({
  projectId,
  chapterId,
  initialContent,
  onSave,
  chapters = [],
  currentChapter,
  onChapterSelect,
  projectGoals = {}
}) => {
  // 面板折叠状态
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  
  // 面板宽度
  const [leftPanelWidth, setLeftPanelWidth] = useState(250);
  const [rightPanelWidth, setRightPanelWidth] = useState(300);
  
  // 拖拽状态
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
  
  // 字数统计
  const [wordCount, setWordCount] = useState(0);
  const [dailyWordCount, setDailyWordCount] = useState(0);
  
  // 拖拽调整左侧面板宽度
  const handleLeftResizeStart = useCallback((e) => {
    setIsDraggingLeft(true);
    e.preventDefault();
  }, []);
  
  // 拖拽调整右侧面板宽度
  const handleRightResizeStart = useCallback((e) => {
    setIsDraggingRight(true);
    e.preventDefault();
  }, []);
  
  // 处理拖拽移动
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingLeft) {
        const newWidth = Math.max(200, Math.min(400, e.clientX));
        setLeftPanelWidth(newWidth);
      }
      if (isDraggingRight) {
        const windowWidth = window.innerWidth;
        const newWidth = Math.max(200, Math.min(400, windowWidth - e.clientX));
        setRightPanelWidth(newWidth);
      }
    };
    
    const handleMouseUp = () => {
      setIsDraggingLeft(false);
      setIsDraggingRight(false);
    };
    
    if (isDraggingLeft || isDraggingRight) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDraggingLeft, isDraggingRight]);
  
  // 处理字数变化
  const handleWordCountChange = useCallback((count) => {
    setWordCount(count);
  }, []);
  
  // 切换左侧面板
  const toggleLeftPanel = useCallback(() => {
    setLeftPanelCollapsed(prev => !prev);
  }, []);
  
  // 切换右侧面板
  const toggleRightPanel = useCallback(() => {
    setRightPanelCollapsed(prev => !prev);
  }, []);
  
  return (
    <Layout style={{ height: '100%', background: '#f0f2f5' }}>
      {/* 左侧大纲面板 */}
      {!leftPanelCollapsed && (
        <>
          <Sider
            width={leftPanelWidth}
            style={{
              background: '#fff',
              borderRight: '1px solid #e8e8e8',
              overflow: 'auto',
              height: '100%'
            }}
          >
            <Card
              title={
                <Space>
                  <BookOutlined />
                  <span>章节大纲</span>
                </Space>
              }
              extra={
                <Button
                  type="text"
                  size="small"
                  icon={<MenuFoldOutlined />}
                  onClick={toggleLeftPanel}
                />
              }
              bordered={false}
              style={{ height: '100%' }}
              bodyStyle={{ padding: '12px', height: 'calc(100% - 57px)', overflow: 'auto' }}
            >
              <ChapterOutlineTree
                chapters={chapters}
                currentChapterId={chapterId}
                onChapterSelect={onChapterSelect}
              />
            </Card>
          </Sider>
          
          {/* 左侧拖拽调整条 */}
          <div
            style={{
              width: '4px',
              background: isDraggingLeft ? '#1890ff' : '#e8e8e8',
              cursor: 'col-resize',
              transition: 'background 0.2s'
            }}
            onMouseDown={handleLeftResizeStart}
          />
        </>
      )}
      
      {/* 中间编辑器区域 */}
      <Content style={{ 
        background: '#fff', 
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* 顶部工具栏 */}
        <div style={{ 
          padding: '8px 16px', 
          borderBottom: '1px solid #e8e8e8',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Space>
            {leftPanelCollapsed && (
              <Tooltip title="展开章节大纲">
                <Button
                  type="text"
                  icon={<MenuUnfoldOutlined />}
                  onClick={toggleLeftPanel}
                />
              </Tooltip>
            )}
            <Text strong>{currentChapter?.title || '未选择章节'}</Text>
            {currentChapter?.status && (
              <Badge 
                status={
                  currentChapter.status === '已完成' ? 'success' :
                  currentChapter.status === '写作中' ? 'processing' :
                  currentChapter.status === '修改中' ? 'warning' : 'default'
                }
                text={currentChapter.status}
              />
            )}
          </Space>
          
          <Space>
            {/* 字数统计 */}
            <WritingGoalPanel
              wordCount={wordCount}
              dailyGoal={projectGoals.daily_word_goal || 2000}
              totalGoal={projectGoals.total_word_goal || 300000}
              dailyWordCount={dailyWordCount}
            />
            
            {rightPanelCollapsed && (
              <Tooltip title="展开大纲参考">
                <Button
                  type="text"
                  icon={<MenuUnfoldOutlined />}
                  onClick={toggleRightPanel}
                />
              </Tooltip>
            )}
          </Space>
        </div>
        
        {/* 编辑器主体 */}
        <div style={{ 
          flex: 1, 
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <TextEditor
            chapterId={chapterId}
            initialContent={initialContent}
            onSave={onSave}
            projectId={projectId}
            onWordCountChange={handleWordCountChange}
            showOutline={false} // 使用左侧大纲树，不显示内置大纲
          />
        </div>
      </Content>
      
      {/* 右侧大纲参考面板 */}
      {!rightPanelCollapsed && (
        <>
          {/* 右侧拖拽调整条 */}
          <div
            style={{
              width: '4px',
              background: isDraggingRight ? '#1890ff' : '#e8e8e8',
              cursor: 'col-resize',
              transition: 'background 0.2s'
            }}
            onMouseDown={handleRightResizeStart}
          />
          
          <Sider
            width={rightPanelWidth}
            style={{
              background: '#fff',
              borderLeft: '1px solid #e8e8e8',
              overflow: 'auto',
              height: '100%'
            }}
          >
            <Card
              title={
                <Space>
                  <AimOutlined />
                  <span>大纲参考</span>
                </Space>
              }
              extra={
                <Button
                  type="text"
                  size="small"
                  icon={<MenuFoldOutlined />}
                  onClick={toggleRightPanel}
                />
              }
              bordered={false}
              style={{ height: '100%' }}
              bodyStyle={{ padding: '12px', height: 'calc(100% - 57px)', overflow: 'auto' }}
            >
              <OutlineReferencePanel
                currentChapter={currentChapter}
                projectGoals={projectGoals}
              />
            </Card>
          </Sider>
        </>
      )}
    </Layout>
  );
};

export default SplitScreenEditor;

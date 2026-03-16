import React from 'react';
import { Progress, Space, Typography, Tooltip, Badge } from 'antd';
import { 
  EditOutlined, 
  TrophyOutlined,
  FireOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Text } = Typography;

/**
 * 写作目标面板组件
 * 
 * 功能：
 * 1. 显示当前章节字数
 * 2. 显示每日目标完成进度
 * 3. 显示总目标完成进度
 * 4. 实时更新字数统计
 */
const WritingGoalPanel = ({ 
  wordCount = 0, 
  dailyGoal = 2000, 
  totalGoal = 300000,
  dailyWordCount = 0
}) => {
  // 计算进度百分比
  const dailyProgress = Math.min(100, Math.round((dailyWordCount / dailyGoal) * 100));
  const totalProgress = Math.min(100, Math.round((wordCount / totalGoal) * 100));
  
  // 判断目标完成状态
  const isDailyGoalReached = dailyWordCount >= dailyGoal;
  const isTotalGoalReached = wordCount >= totalGoal;
  
  return (
    <Space size="large">
      {/* 当前章节字数 */}
      <Tooltip title="当前章节字数">
        <Space size="small">
          <EditOutlined style={{ color: '#1890ff' }} />
          <Text strong style={{ fontSize: '14px' }}>
            {wordCount.toLocaleString()}
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>字</Text>
        </Space>
      </Tooltip>
      
      {/* 每日目标 */}
      <Tooltip title={`今日目标: ${dailyGoal.toLocaleString()}字`}>
        <Space size="small">
          {isDailyGoalReached ? (
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
          ) : (
            <FireOutlined style={{ color: '#fa8c16' }} />
          )}
          <div style={{ width: '80px' }}>
            <Progress 
              percent={dailyProgress} 
              size="small" 
              showInfo={false}
              strokeColor={isDailyGoalReached ? '#52c41a' : '#fa8c16'}
            />
          </div>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {dailyProgress}%
          </Text>
        </Space>
      </Tooltip>
      
      {/* 总目标 */}
      <Tooltip title={`总目标: ${totalGoal.toLocaleString()}字`}>
        <Space size="small">
          <TrophyOutlined style={{ color: isTotalGoalReached ? '#ffd700' : '#8c8c8c' }} />
          <div style={{ width: '80px' }}>
            <Progress 
              percent={totalProgress} 
              size="small" 
              showInfo={false}
              strokeColor={isTotalGoalReached ? '#ffd700' : '#1890ff'}
            />
          </div>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {totalProgress}%
          </Text>
        </Space>
      </Tooltip>
      
      {/* 完成徽章 */}
      {isDailyGoalReached && (
        <Badge 
          count="今日完成" 
          style={{ 
            backgroundColor: '#52c41a',
            fontSize: '10px'
          }} 
        />
      )}
    </Space>
  );
};

export default WritingGoalPanel;

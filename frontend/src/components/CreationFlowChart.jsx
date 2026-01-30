import React from 'react';
import { Card, Progress, Button, Space, Tooltip } from 'antd';
import { CheckCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';

const CreationFlowChart = ({ flowData, onStageClick }) => {
  const defaultFlowData = {
    currentStage: 'project_creation',
    overallProgress: 0,
    stages: [
      {
        id: 'project_creation',
        name: '项目创建',
        description: '确定作品基本信息和方向',
        progress: 0,
        status: 'pending'
      },
      {
        id: 'setting_building',
        name: '设定构建',
        description: '创建世界观、角色、地点等设定',
        progress: 0,
        status: 'pending'
      },
      {
        id: 'outline_planning',
        name: '大纲规划',
        description: '制定故事大纲和章节结构',
        progress: 0,
        status: 'pending'
      },
      {
        id: 'chapter_creation',
        name: '章节创作',
        description: '撰写具体章节内容',
        progress: 0,
        status: 'pending'
      },
      {
        id: 'revision',
        name: '修改完善',
        description: '检查和修改作品内容',
        progress: 0,
        status: 'pending'
      },
      {
        id: 'export',
        name: '作品导出',
        description: '导出成品作品',
        progress: 0,
        status: 'pending'
      }
    ]
  };

  const data = flowData || defaultFlowData;

  const getStatusColor = (status, isCurrent) => {
    if (isCurrent) return '#1890ff';
    switch (status) {
      case 'completed':
        return '#52c41a';
      case 'in_progress':
        return '#1890ff';
      case 'pending':
        return '#d9d9d9';
      default:
        return '#d9d9d9';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined />;
      default:
        return null;
    }
  };

  const handleStageClick = (stageId) => {
    // 跳转到对应功能模块的逻辑
    console.log('Navigate to stage:', stageId);
    if (onStageClick) {
      onStageClick(stageId);
    }
  };

  return (
    <div>
      <Card title="创作流程图" style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 24 }}>
          <h3>整体进度</h3>
          <Progress percent={data.overallProgress} status="active" />
          <p style={{ textAlign: 'center', marginTop: 8, color: '#666' }}>
            当前阶段：{data.stages.find(s => s.id === data.currentStage)?.name}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {data.stages.map((stage, index) => {
            const isCurrent = stage.id === data.currentStage;
            const isCompleted = stage.status === 'completed';
            
            return (
              <div key={stage.id}>
                <Card
                  hoverable
                  onClick={() => handleStageClick(stage.id)}
                  style={{
                    borderLeft: `4px solid ${getStatusColor(stage.status, isCurrent)}`,
                    cursor: 'pointer',
                    boxShadow: isCurrent ? '0 2px 8px rgba(24, 144, 255, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.09)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Space>
                      <Tooltip title={stage.description}>
                        <h4 style={{ margin: 0, color: getStatusColor(stage.status, isCurrent) }}>
                          {stage.name}
                        </h4>
                      </Tooltip>
                      {isCompleted && (
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      )}
                      {isCurrent && (
                        <span style={{ color: '#1890ff', fontSize: '12px' }}>当前</span>
                      )}
                    </Space>
                    <Button 
                      type={isCurrent ? 'primary' : 'default'} 
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStageClick(stage.id);
                      }}
                    >
                      进入
                    </Button>
                  </div>
                  <Progress percent={stage.progress} size="small" />
                  <p style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                    {stage.description}
                  </p>
                </Card>
                
                {index < data.stages.length - 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
                    <ArrowRightOutlined style={{ fontSize: '16px', color: '#d9d9d9' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default CreationFlowChart;
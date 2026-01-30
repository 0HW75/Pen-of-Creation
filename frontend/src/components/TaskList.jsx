import React, { useState } from 'react';
import { Card, List, Button, Tag, Space, Progress, Input, Modal, Select } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const TaskList = ({ tasks, onUpdateTask }) => {
  const [editingTask, setEditingTask] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', type: 'chapter', priority: 1 });

  const defaultTasks = [
    {
      id: 1,
      title: '创建项目基本信息',
      description: '填写作品标题、类型、简介等基本信息',
      type: 'project',
      priority: 5,
      status: 'pending',
      due_date: new Date().toISOString().split('T')[0]
    },
    {
      id: 2,
      title: '构建世界观设定',
      description: '创建作品的世界观背景、规则和设定',
      type: 'setting',
      priority: 4,
      status: 'pending',
      due_date: new Date().toISOString().split('T')[0]
    },
    {
      id: 3,
      title: '设计主要角色',
      description: '创建至少3个主要角色，包括性格、背景和目标',
      type: 'character',
      priority: 4,
      status: 'pending',
      due_date: new Date().toISOString().split('T')[0]
    }
  ];

  const taskList = tasks.length > 0 ? tasks : defaultTasks;

  const getTaskTypeTag = (type) => {
    const typeConfig = {
      chapter: { color: 'blue', text: '待写章节' },
      setting: { color: 'green', text: '待完善设定' },
     伏笔: { color: 'purple', text: '待回收伏笔' },
      check: { color: 'orange', text: '待检查内容' },
      problem: { color: 'red', text: '待处理问题' },
      project: { color: 'cyan', text: '项目任务' },
      character: { color: 'pink', text: '角色设定' }
    };

    return typeConfig[type] || { color: 'default', text: '其他任务' };
  };

  const getPriorityIcon = (priority) => {
    if (priority >= 4) return <ExclamationCircleOutlined style={{ color: 'red' }} />;
    if (priority === 3) return <ClockCircleOutlined style={{ color: 'orange' }} />;
    return null;
  };

  const handleTaskStatusChange = (taskId, status) => {
    onUpdateTask(taskId, status);
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setTaskForm({ title: '', description: '', type: 'chapter', priority: 1 });
    setIsModalVisible(true);
  };

  const handleSaveTask = () => {
    // 保存任务的逻辑
    console.log('Save task:', taskForm);
    setIsModalVisible(false);
  };

  const completedTasks = taskList.filter(task => task.status === 'completed').length;
  const totalTasks = taskList.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div>
      <Card 
        title="今日任务" 
        extra={
          <Button type="primary" onClick={handleAddTask}>
            添加任务
          </Button>
        }
        style={{ marginBottom: 24 }}
      >
        <div style={{ marginBottom: 24 }}>
          <h3>任务完成情况</h3>
          <Progress percent={completionRate} status="active" />
          <p style={{ textAlign: 'center', marginTop: 8, color: '#666' }}>
            已完成 {completedTasks}/{totalTasks} 个任务
          </p>
        </div>

        <div className="task-list">
          {taskList.map(task => {
            const typeConfig = getTaskTypeTag(task.type);
            const isCompleted = task.status === 'completed';
            const isPending = task.status === 'pending';
            const isInProgress = task.status === 'in_progress';

            return (
              <div key={task.id} className="task-item" style={{ 
                padding: '16px', 
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                transition: 'all 0.3s ease',
                borderRadius: '8px',
                marginBottom: '8px',
                backgroundColor: isCompleted ? '#f6ffed' : '#ffffff'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <Space style={{ marginRight: '12px' }}>
                      {getPriorityIcon(task.priority)}
                      {isCompleted && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
                      {isInProgress && <ClockCircleOutlined style={{ color: '#1890ff' }} />}
                    </Space>
                    <Space>
                      <span style={{ 
                        textDecoration: isCompleted ? 'line-through' : 'none',
                        fontWeight: '500'
                      }}>
                        {task.title}
                      </span>
                      <Tag color={typeConfig.color}>{typeConfig.text}</Tag>
                      {task.priority >= 4 && <Tag color="red">高优先级</Tag>}
                    </Space>
                  </div>
                  <div style={{ marginLeft: '72px' }}>
                    <p style={{ margin: '8px 0', color: '#666' }}>{task.description}</p>
                    <p style={{ fontSize: '12px', color: '#999' }}>截止日期: {task.due_date}</p>
                  </div>
                </div>
                <div style={{ marginLeft: '16px' }}>
                  <Space>
                    {isPending && (
                      <Button 
                        type="primary" 
                        size="small"
                        onClick={() => handleTaskStatusChange(task.id, 'in_progress')}
                      >
                        开始
                      </Button>
                    )}
                    {(isInProgress || isPending) && (
                      <Button 
                        size="small"
                        onClick={() => handleTaskStatusChange(task.id, 'completed')}
                      >
                        完成
                      </Button>
                    )}
                    <Button 
                      danger 
                      size="small"
                      onClick={() => handleTaskStatusChange(task.id, 'skipped')}
                    >
                      跳过
                    </Button>
                  </Space>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Modal
        title={editingTask ? "编辑任务" : "添加任务"}
        open={isModalVisible}
        onOk={handleSaveTask}
        onCancel={() => setIsModalVisible(false)}
      >
        <Input
          placeholder="任务标题"
          value={taskForm.title}
          onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
          style={{ marginBottom: 16 }}
        />
        <TextArea
          placeholder="任务描述"
          value={taskForm.description}
          onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
          rows={4}
          style={{ marginBottom: 16 }}
        />
        <Select
          placeholder="任务类型"
          value={taskForm.type}
          onChange={(value) => setTaskForm({ ...taskForm, type: value })}
          style={{ width: '100%', marginBottom: 16 }}
        >
          <Option value="chapter">待写章节</Option>
          <Option value="setting">待完善设定</Option>
          <Option value="伏笔">待回收伏笔</Option>
          <Option value="check">待检查内容</Option>
          <Option value="problem">待处理问题</Option>
          <Option value="project">项目任务</Option>
          <Option value="character">角色设定</Option>
        </Select>
        <Select
          placeholder="优先级"
          value={taskForm.priority}
          onChange={(value) => setTaskForm({ ...taskForm, priority: value })}
          style={{ width: '100%' }}
        >
          <Option value={1}>低</Option>
          <Option value={2}>中低</Option>
          <Option value={3}>中</Option>
          <Option value={4}>中高</Option>
          <Option value={5}>高</Option>
        </Select>
      </Modal>
    </div>
  );
};

export default TaskList;
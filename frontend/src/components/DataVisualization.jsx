import React, { useState, useEffect, useRef } from 'react';
import { Card, Tabs, Spin, Button, Select, Space, message } from 'antd';
import { LineChartOutlined, LinkOutlined, PieChartOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import api from '../services/api';

const { Option } = Select;

const DataVisualization = ({ projectId, chapters = [], characters = [] }) => {
  const [activeTab, setActiveTab] = useState('relationship');
  const [loading, setLoading] = useState(false);
  const [analysisType, setAnalysisType] = useState('emotion');
  const [selectedChapter, setSelectedChapter] = useState(null);
  const isMountedRef = useRef(false);
  
  const relationshipChartRef = useRef(null);
  const emotionChartRef = useRef(null);
  const rhythmChartRef = useRef(null);
  
  const relationshipChart = useRef(null);
  const emotionChart = useRef(null);
  const rhythmChart = useRef(null);

  // 初始化关系图谱
  const initRelationshipChart = (data) => {
    if (!relationshipChartRef.current) return;
    
    if (relationshipChart.current) {
      relationshipChart.current.dispose();
    }
    
    relationshipChart.current = echarts.init(relationshipChartRef.current);
    
    const option = {
      title: {
        text: '角色关系图谱',
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      animationDurationUpdate: 1500,
      animationEasingUpdate: 'quinticInOut',
      series: [
        {
          type: 'graph',
          layout: 'force',
          data: data.nodes,
          links: data.links,
          lineStyle: {
            color: 'source',
            curveness: 0.3
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: {
              width: 4
            }
          },
          force: {
            repulsion: 1000,
            edgeLength: 120
          }
        }
      ]
    };
    
    relationshipChart.current.setOption(option);
  };

  // 初始化情绪曲线
  const initEmotionChart = (data) => {
    if (!emotionChartRef.current) return;
    
    if (emotionChart.current) {
      emotionChart.current.dispose();
    }
    
    emotionChart.current = echarts.init(emotionChartRef.current);
    
    // 使用API返回的情绪数据
    const emotionData = data.map(item => ({
      name: item.chapter_title,
      value: item.emotion_value
    }));
    
    const option = {
      title: {
        text: '章节情绪曲线',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        formatter: function(params) {
          const value = params[0].value;
          let emotion = '中性';
          if (value > 30) emotion = '非常积极';
          else if (value > 10) emotion = '积极';
          else if (value > -10) emotion = '中性';
          else if (value > -30) emotion = '消极';
          else emotion = '非常消极';
          return `${params[0].name}<br/>情绪值: ${value.toFixed(1)}<br/>情绪: ${emotion}`;
        }
      },
      xAxis: {
        type: 'category',
        data: emotionData.map(item => item.name),
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: '情绪值',
        min: -50,
        max: 50,
        axisLabel: {
          formatter: '{value}'
        }
      },
      series: [
        {
          data: emotionData.map(item => item.value),
          type: 'line',
          smooth: true,
          lineStyle: {
            color: '#1890ff'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(24, 144, 255, 0.5)'
              },
              {
                offset: 1,
                color: 'rgba(24, 144, 255, 0.1)'
              }
            ])
          },
          markLine: {
            data: [
              {
                yAxis: 0,
                lineStyle: {
                  color: '#999'
                },
                label: {
                  formatter: '中性'
                }
              }
            ]
          }
        }
      ]
    };
    
    emotionChart.current.setOption(option);
  };

  // 初始化节奏分析图表
  const initRhythmChart = (data) => {
    if (!rhythmChartRef.current) return;
    
    if (rhythmChart.current) {
      rhythmChart.current.dispose();
    }
    
    rhythmChart.current = echarts.init(rhythmChartRef.current);
    
    // 使用API返回的节奏数据
    const rhythmData = data.map(item => ({
      name: item.chapter_title,
      action: item.action,
      dialogue: item.dialogue,
      description: item.description
    }));
    
    const option = {
      title: {
        text: '章节节奏分析',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['动作', '对话', '描写'],
        top: 30
      },
      xAxis: {
        type: 'category',
        data: rhythmData.map(item => item.name),
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: '占比 (%)'
      },
      series: [
        {
          name: '动作',
          type: 'bar',
          stack: 'total',
          emphasis: {
            focus: 'series'
          },
          data: rhythmData.map(item => item.action),
          itemStyle: {
            color: '#ff7875'
          }
        },
        {
          name: '对话',
          type: 'bar',
          stack: 'total',
          emphasis: {
            focus: 'series'
          },
          data: rhythmData.map(item => item.dialogue),
          itemStyle: {
            color: '#13c2c2'
          }
        },
        {
          name: '描写',
          type: 'bar',
          stack: 'total',
          emphasis: {
            focus: 'series'
          },
          data: rhythmData.map(item => item.description),
          itemStyle: {
            color: '#722ed1'
          }
        }
      ]
    };
    
    rhythmChart.current.setOption(option);
  };

  // 处理图表大小变化
  const handleResize = () => {
    relationshipChart.current?.resize();
    emotionChart.current?.resize();
    rhythmChart.current?.resize();
  };

  // 分析数据
  const analyzeData = async () => {
    if (!projectId) {
      // 只有当组件真正挂载后才显示提示
      if (isMountedRef.current) {
        message.warning('请先选择一个项目');
      }
      return;
    }
    
    setLoading(true);
    
    try {
      // 根据当前标签调用对应API
      switch (activeTab) {
        case 'relationship':
          const relationshipResponse = await api.get(`/analysis/project/${projectId}/relationship`);
          if (relationshipResponse.data.success) {
            initRelationshipChart(relationshipResponse.data.data);
          } else {
            throw new Error(relationshipResponse.data.error || '获取关系数据失败');
          }
          break;
        case 'emotion':
          const emotionResponse = await api.get(`/analysis/project/${projectId}/emotion`);
          if (emotionResponse.data.success) {
            initEmotionChart(emotionResponse.data.data);
          } else {
            throw new Error(emotionResponse.data.error || '获取情绪数据失败');
          }
          break;
        case 'rhythm':
          const rhythmResponse = await api.get(`/analysis/project/${projectId}/rhythm`);
          if (rhythmResponse.data.success) {
            initRhythmChart(rhythmResponse.data.data);
          } else {
            throw new Error(rhythmResponse.data.error || '获取节奏数据失败');
          }
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('分析失败:', error);
      message.error('数据分析失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 设置组件已挂载
    isMountedRef.current = true;
    
    // 只有当projectId存在时才分析数据，避免在导航切换时重复显示提示
    if (projectId) {
      analyzeData();
    }
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      isMountedRef.current = false;
      window.removeEventListener('resize', handleResize);
      relationshipChart.current?.dispose();
      emotionChart.current?.dispose();
      rhythmChart.current?.dispose();
    };
  }, [activeTab, projectId, chapters, characters]);

  const tabItems = [
    {
      key: 'relationship',
      label: <><LinkOutlined /> 关系图谱</>,
      children: (
        <Card>
          <div style={{ marginBottom: '24px' }}>
            <Space>
              <Button type="primary" onClick={analyzeData} loading={loading}>
                分析关系网络
              </Button>
            </Space>
          </div>
          <div style={{ height: '500px', position: 'relative' }}>
            {loading ? (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <Spin size="large" />
              </div>
            ) : (
              <div ref={relationshipChartRef} style={{ width: '100%', height: '100%' }} />
            )}
          </div>
          <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
            <p>关系图谱展示了角色之间的关联关系，帮助您理解故事中的人物网络结构。</p>
          </div>
        </Card>
      )
    },
    {
      key: 'emotion',
      label: <><LineChartOutlined /> 情绪曲线</>,
      children: (
        <Card>
          <div style={{ marginBottom: '24px' }}>
            <Space>
              <Select
                value={analysisType}
                onChange={setAnalysisType}
                style={{ width: 150 }}
              >
                <Select.Option value="emotion">情绪曲线</Select.Option>
                <Select.Option value="tension">张力曲线</Select.Option>
              </Select>
              <Button type="primary" onClick={analyzeData} loading={loading}>
                分析情绪趋势
              </Button>
            </Space>
          </div>
          <div style={{ height: '400px', position: 'relative' }}>
            {loading ? (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <Spin size="large" />
              </div>
            ) : (
              <div ref={emotionChartRef} style={{ width: '100%', height: '100%' }} />
            )}
          </div>
          <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
            <p>情绪曲线展示了各章节的情绪变化趋势，帮助您把握故事的情感节奏。</p>
          </div>
        </Card>
      )
    },
    {
      key: 'rhythm',
      label: <><PieChartOutlined /> 节奏分析</>,
      children: (
        <Card>
          <div style={{ marginBottom: '24px' }}>
            <Space>
              <Select
                value={selectedChapter}
                onChange={setSelectedChapter}
                style={{ width: 200 }}
                placeholder="选择章节"
              >
                {chapters.map(chapter => (
                  <Select.Option key={chapter.id} value={chapter.id}>
                    {chapter.title}
                  </Select.Option>
                ))}
              </Select>
              <Button type="primary" onClick={analyzeData} loading={loading}>
                分析节奏结构
              </Button>
            </Space>
          </div>
          <div style={{ height: '400px', position: 'relative' }}>
            {loading ? (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <Spin size="large" />
              </div>
            ) : (
              <div ref={rhythmChartRef} style={{ width: '100%', height: '100%' }} />
            )}
          </div>
          <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
            <p>节奏分析展示了各章节中动作、对话和描写的比例分布，帮助您优化故事的节奏感。</p>
          </div>
        </Card>
      )
    }
  ];

  return (
    <div style={{ padding: '0' }}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
      />
    </div>
  );
};

export default DataVisualization;

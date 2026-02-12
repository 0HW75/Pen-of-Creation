import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Spin, Empty, Checkbox, Space, Tag, Tooltip, Button, message } from 'antd';
import { ReloadOutlined, FullscreenOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import { tagsRelationsApi } from '../../../services/api';

const RelationNetworkGraph = ({ worldId, height = 500 }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ nodes: [], edges: [], stats: {} });
  const [selectedEntityTypes, setSelectedEntityTypes] = useState(['character', 'location', 'item', 'faction']);
  
  const entityTypeOptions = [
    { label: '角色', value: 'character', color: '#1890ff', category: 'character', icon: 'user' },
    { label: '地点', value: 'location', color: '#52c41a', category: 'location', icon: 'location' },
    { label: '物品', value: 'item', color: '#faad14', category: 'item', icon: 'item' },
    { label: '势力', value: 'faction', color: '#722ed1', category: 'faction', icon: 'faction' },
  ];

  // 定义图标 SVG path
  const icons = {
    // 角色 - 人形图标
    user: 'path://M12,12c2.21,0,4-1.79,4-4s-1.79-4-4-4s-4,1.79-4,4S9.79,12,12,12z M12,14c-2.67,0-8,1.34-8,4v2h16v-2C20,15.34,14.67,14,12,14z',
    // 地点 - 定位图标
    location: 'path://M12,2C8.13,2,5,5.13,5,9c0,5.25,7,13,7,13s7-7.75,7-13C19,5.13,15.87,2,12,2z M12,11.5c-1.38,0-2.5-1.12-2.5-2.5s1.12-2.5,2.5-2.5s2.5,1.12,2.5,2.5S13.38,11.5,12,11.5z',
    // 物品 - 盒子/礼物图标
    item: 'path://M20,6h-2.18c0.11-0.31,0.18-0.65,0.18-1c0-1.66-1.34-3-3-3c-1.05,0-1.96,0.54-2.5,1.35l-0.5,0.67l-0.5-0.68C10.96,2.54,10.05,2,9,2C7.34,2,6,3.34,6,5c0,0.35,0.07,0.69,0.18,1H4C2.89,6,2.01,6.89,2.01,8L2,19c0,1.11,0.89,2,2,2h16c1.11,0,2-0.89,2-2V8C22,6.89,21.11,6,20,6z M12,6c-0.55,0-1-0.45-1-1s0.45-1,1-1s1,0.45,1,1S12.55,6,12,6z',
    // 势力 - 建筑/旗帜图标
    faction: 'path://M12,2L2,7v10h20V7L12,2z M12,4.5L18.5,8H5.5L12,4.5z M4,9h16v6H4V9z M6,17h12v2H6V17z'
  };

  const loadNetworkData = useCallback(async () => {
    if (!worldId) return;
    
    setLoading(true);
    try {
      const response = await tagsRelationsApi.getRelationNetwork(worldId, selectedEntityTypes);
      if (response.data?.code === 200) {
        setData(response.data.data);
      } else {
        message.error(response.data?.message || '获取关系网络数据失败');
      }
    } catch (error) {
      console.error('加载关系网络数据失败:', error);
      message.error('加载关系网络数据失败');
    } finally {
      setLoading(false);
    }
  }, [worldId, selectedEntityTypes]);

  const initChart = useCallback(() => {
    if (!chartRef.current || !data.nodes.length) return;

    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    chartInstance.current = echarts.init(chartRef.current);

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          if (params.dataType === 'node') {
            return `
              <div style="padding: 8px;">
                <strong>${params.data.name}</strong>
                <div style="margin-top: 4px; color: #666;">
                  类型: ${params.data.type_name}
                </div>
              </div>
            `;
          } else {
            const sourceNode = data.nodes.find(n => n.id === params.data.source);
            const targetNode = data.nodes.find(n => n.id === params.data.target);
            return `
              <div style="padding: 8px;">
                <strong>${params.data.relation_type}</strong>
                <div style="margin-top: 4px; color: #666;">
                  ${sourceNode?.name || ''} → ${targetNode?.name || ''}
                </div>
                <div style="margin-top: 4px; color: #999;">
                  强度: ${params.data.strength}/10
                </div>
                ${params.data.description ? `<div style="margin-top: 4px; color: #666;">${params.data.description}</div>` : ''}
              </div>
            `;
          }
        }
      },
      legend: {
        data: entityTypeOptions.map(opt => opt.category),
        top: 10,
        left: 10,
        itemGap: 20,
        textStyle: {
          fontSize: 13,
          fontWeight: 500
        },
        icon: 'circle',
        itemWidth: 14,
        itemHeight: 14,
        formatter: (name) => {
          const option = entityTypeOptions.find(opt => opt.category === name);
          const iconMap = {
            'character': '👤',
            'location': '📍',
            'item': '📦',
            'faction': '🏛️'
          };
          return option ? `${iconMap[option.category] || '●'} ${option.label}` : name;
        }
      },
      series: [
        {
          type: 'graph',
          layout: 'force',
          data: data.nodes.map(node => {
            const option = entityTypeOptions.find(opt => opt.category === node.category);
            const connectionCount = data.edges.filter(e => e.source === node.id || e.target === node.id).length;
            return {
              ...node,
              name: node.name,
              symbol: icons[option?.icon] || 'circle',
              symbolSize: 45 + (connectionCount * 4),
              label: {
                show: true,
                position: 'bottom',
                formatter: '{b}',
                fontSize: 12,
                color: '#333',
                distance: 8
              }
            };
          }),
          links: data.edges.map(edge => ({
            ...edge,
            label: {
              show: true,
              formatter: edge.relation_type,
              fontSize: 10,
              color: '#666'
            }
          })),
          categories: entityTypeOptions.map(opt => ({
            name: opt.category,
            label: { show: true },
            itemStyle: { 
              color: opt.color,
              borderColor: '#fff',
              borderWidth: 2,
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.3)'
            }
          })),
          roam: true,
          draggable: true,
          focusNodeAdjacency: true,
          force: {
            repulsion: 800,
            edgeLength: [80, 150],
            gravity: 0.1
          },
          lineStyle: {
            color: 'source',
            curveness: 0.2,
            opacity: 0.7
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: {
              width: 4,
              opacity: 1
            },
            label: {
              fontSize: 14,
              fontWeight: 'bold'
            },
            itemStyle: {
              shadowBlur: 20,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          edgeLabel: {
            show: true,
            fontSize: 10
          }
        }
      ]
    };

    chartInstance.current.setOption(option);

    // 添加点击事件
    chartInstance.current.on('click', (params) => {
      if (params.dataType === 'node') {
        console.log('点击节点:', params.data);
        // 可以在这里添加点击节点的处理逻辑，比如跳转到实体详情页
      }
    });

    // 处理窗口大小变化
    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data]);

  useEffect(() => {
    loadNetworkData();
  }, [loadNetworkData]);

  useEffect(() => {
    const cleanup = initChart();
    return () => {
      cleanup?.();
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [initChart]);

  const handleEntityTypeChange = (checkedValues) => {
    setSelectedEntityTypes(checkedValues);
  };

  const handleRefresh = () => {
    loadNetworkData();
  };

  const handleFullscreen = () => {
    if (chartRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        chartRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className="relation-network-graph">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <span style={{ fontWeight: 500 }}>实体类型筛选:</span>
          <Checkbox.Group
            options={entityTypeOptions.map(opt => ({
              label: <Tag color={opt.color}>{opt.label}</Tag>,
              value: opt.value
            }))}
            value={selectedEntityTypes}
            onChange={handleEntityTypeChange}
          />
        </Space>
        <Space>
          <Tooltip title="刷新">
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
            />
          </Tooltip>
          <Tooltip title="全屏">
            <Button
              icon={<FullscreenOutlined />}
              onClick={handleFullscreen}
            />
          </Tooltip>
        </Space>
      </div>

      {data.stats && (
        <div style={{ marginBottom: 16, padding: '8px 12px', background: '#f5f5f5', borderRadius: 4 }}>
          <Space size={24}>
            <span>节点数: <strong>{data.stats.total_nodes || 0}</strong></span>
            <span>关系数: <strong>{data.stats.total_edges || 0}</strong></span>
            {data.stats.relation_type_stats && Object.entries(data.stats.relation_type_stats).map(([type, count]) => (
              <span key={type}>{type}: <strong>{count}</strong></span>
            ))}
          </Space>
        </div>
      )}

      <div style={{ position: 'relative', height }}>
        {loading ? (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
            <Spin size="large" />
            <div style={{ marginTop: 8, color: '#999' }}>加载关系网络...</div>
          </div>
        ) : data.nodes.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无关系数据"
            style={{ marginTop: 80 }}
          />
        ) : (
          <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
        )}
      </div>
    </div>
  );
};

export default RelationNetworkGraph;

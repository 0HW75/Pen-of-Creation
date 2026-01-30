import React, { useState, useEffect, useMemo } from 'react';
import { Card, Tabs, Button, Spin, Space, Statistic, Progress, Table, Alert, message, Select } from 'antd';
import { FileTextOutlined, PieChartOutlined, DownloadOutlined, UserOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import api from '../services/api';

const { Option } = Select;

const WorkAnalysis = ({ projectId, chapters = [], characters = [] }) => {
  const [activeTab, setActiveTab] = useState('health');
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [healthData, setHealthData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  
  // 获取健康度数据
  const fetchHealthData = async () => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/analysis/project/${projectId}/health`);
      if (response.data.success) {
        setHealthData(response.data.data);
      } else {
        throw new Error(response.data.error || '获取健康度数据失败');
      }
    } catch (error) {
      console.error('获取健康度数据失败:', error);
      message.error('获取健康度数据失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 获取统计数据
  const fetchStatsData = async () => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/analysis/project/${projectId}/stats`);
      if (response.data.success) {
        setStatsData(response.data.data);
      } else {
        throw new Error(response.data.error || '获取统计数据失败');
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
      message.error('获取统计数据失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 计算作品统计数据
  const workStats = useMemo(() => {
    if (statsData) {
      return {
        totalChapters: statsData.basic_stats.total_chapters,
        totalWords: statsData.basic_stats.total_words,
        totalCharacters: statsData.basic_stats.total_characters,
        avgWordsPerChapter: statsData.basic_stats.avg_words_per_chapter,
        shortChapters: statsData.chapter_length_distribution.short_chapters,
        mediumChapters: statsData.chapter_length_distribution.medium_chapters,
        longChapters: statsData.chapter_length_distribution.long_chapters
      };
    }
    
    // 降级到本地数据
    const totalChapters = chapters.length;
    const totalWords = chapters.reduce((sum, chapter) => sum + (chapter.word_count || 0), 0);
    const totalCharacters = characters.length;
    const avgWordsPerChapter = totalChapters > 0 ? Math.round(totalWords / totalChapters) : 0;
    
    // 计算章节长度分布
    const chapterLengths = chapters.map(chapter => chapter.word_count || 0);
    const shortChapters = chapterLengths.filter(len => len < 1000).length;
    const mediumChapters = chapterLengths.filter(len => len >= 1000 && len < 3000).length;
    const longChapters = chapterLengths.filter(len => len >= 3000).length;
    
    return {
      totalChapters,
      totalWords,
      totalCharacters,
      avgWordsPerChapter,
      shortChapters,
      mediumChapters,
      longChapters
    };
  }, [chapters, characters, statsData]);

  // 计算健康度指标
  const healthMetrics = useMemo(() => {
    if (healthData) {
      return {
        overallHealth: healthData.overall_health,
        chapterHealth: healthData.metrics.chapter_health,
        wordHealth: healthData.metrics.word_health,
        avgLengthHealth: healthData.metrics.length_health
      };
    }
    
    // 降级到本地计算
    const { totalChapters, totalWords, avgWordsPerChapter } = workStats;
    
    // 章节数量健康度
    const chapterHealth = Math.min(100, Math.max(0, (totalChapters / 20) * 100));
    
    // 总字数健康度
    const wordHealth = Math.min(100, Math.max(0, (totalWords / 100000) * 100));
    
    // 章节平均长度健康度
    let lengthHealth;
    if (avgWordsPerChapter < 500) {
      lengthHealth = 0;
    } else if (avgWordsPerChapter > 5000) {
      lengthHealth = 100;
    } else {
      lengthHealth = ((avgWordsPerChapter - 500) / 4500) * 100;
    }
    
    // 整体健康度
    const overallHealth = Math.round((chapterHealth + wordHealth + lengthHealth) / 3);
    
    return {
      overallHealth,
      chapterHealth,
      wordHealth,
      avgLengthHealth: lengthHealth
    };
  }, [workStats, healthData]);
  
  // 组件挂载时获取数据
  useEffect(() => {
    fetchHealthData();
    fetchStatsData();
  }, [projectId]);

  // 生成分析报告
  const generateReport = async () => {
    setReportLoading(true);
    try {
      // 调用后端API生成报告
      const response = await api.get(`/analysis/project/${projectId}/report`);
      
      if (response.data.success) {
        const reportContent = response.data.data.report_content;
        
        // 下载报告
        const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `作品分析报告_${projectId || '未命名'}_${new Date().toISOString().split('T')[0]}.md`;
        link.click();
        URL.revokeObjectURL(url);
        
        message.success('报告生成成功');
      } else {
        throw new Error(response.data.error || '生成报告失败');
      }
    } catch (error) {
      console.error('报告生成失败:', error);
      message.error('报告生成失败');
    } finally {
      setReportLoading(false);
    }
  };

  // 健康度分析标签页
  const healthAnalysisTab = (
    <Card>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <Spin size="large" />
          <p style={{ marginTop: '16px' }}>加载健康度数据中...</p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '32px' }}>
            <Space orientation="vertical" size="large" style={{ width: '100%' }}>
              <Statistic
                title="整体健康度"
                value={healthMetrics.overallHealth}
                suffix="%"
                styles={{
                  content: {
                    color: healthMetrics.overallHealth >= 80 ? '#52c41a' : healthMetrics.overallHealth >= 60 ? '#faad14' : '#f5222d'
                  }
                }}
                prefix={<FileTextOutlined />}
              />
              <Progress
                percent={healthMetrics.overallHealth}
                status={healthMetrics.overallHealth >= 80 ? 'success' : healthMetrics.overallHealth >= 60 ? 'warning' : 'exception'}
                strokeColor={{
                  from: healthMetrics.overallHealth >= 80 ? '#52c41a' : healthMetrics.overallHealth >= 60 ? '#faad14' : '#f5222d',
                  to: healthMetrics.overallHealth >= 80 ? '#73d13d' : healthMetrics.overallHealth >= 60 ? '#ffc53d' : '#ff4d4f'
                }}
              />
            </Space>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            <Card title="章节数量健康度">
              <Statistic
                value={healthMetrics.chapterHealth}
                suffix="%"
                styles={{
                  content: {
                    color: healthMetrics.chapterHealth >= 80 ? '#52c41a' : healthMetrics.chapterHealth >= 60 ? '#faad14' : '#f5222d'
                  }
                }}
              />
              <Progress
                percent={healthMetrics.chapterHealth}
                status={healthMetrics.chapterHealth >= 80 ? 'success' : healthMetrics.chapterHealth >= 60 ? 'warning' : 'exception'}
                style={{ marginTop: '16px' }}
              />
              <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
                <p>理想章节数: 20+</p>
                <p>当前章节数: {workStats.totalChapters}</p>
              </div>
            </Card>
            
            <Card title="总字数健康度">
              <Statistic
                value={healthMetrics.wordHealth}
                suffix="%"
                styles={{
                  content: {
                    color: healthMetrics.wordHealth >= 80 ? '#52c41a' : healthMetrics.wordHealth >= 60 ? '#faad14' : '#f5222d'
                  }
                }}
              />
              <Progress
                percent={healthMetrics.wordHealth}
                status={healthMetrics.wordHealth >= 80 ? 'success' : healthMetrics.wordHealth >= 60 ? 'warning' : 'exception'}
                style={{ marginTop: '16px' }}
              />
              <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
                <p>理想总字数: 10万+</p>
                <p>当前总字数: {workStats.totalWords}</p>
              </div>
            </Card>
            
            <Card title="章节长度健康度">
              <Statistic
                value={healthMetrics.avgLengthHealth}
                suffix="%"
                styles={{
                  content: {
                    color: healthMetrics.avgLengthHealth >= 80 ? '#52c41a' : healthMetrics.avgLengthHealth >= 60 ? '#faad14' : '#f5222d'
                  }
                }}
              />
              <Progress
                percent={healthMetrics.avgLengthHealth}
                status={healthMetrics.avgLengthHealth >= 80 ? 'success' : healthMetrics.avgLengthHealth >= 60 ? 'warning' : 'exception'}
                style={{ marginTop: '16px' }}
              />
              <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
                <p>理想章节长度: 1000-3000字</p>
                <p>当前平均: {workStats.avgWordsPerChapter}字</p>
              </div>
            </Card>
          </div>
          
          <Alert
            title="健康度分析说明"
            description="健康度指标基于行业标准和最佳实践，仅供参考。不同类型的作品可能有不同的合理范围。"
            type="info"
            showIcon
          />
        </>
      )}
    </Card>
  );

  // 统计分析标签页
  const statsAnalysisTab = (
    <Card>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <Spin size="large" />
          <p style={{ marginTop: '16px' }}>加载统计数据中...</p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '32px' }}>
            <Space orientation="vertical" size="large" style={{ width: '100%' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                <Statistic title="总章节数" value={workStats.totalChapters} prefix={<FileTextOutlined />} />
                <Statistic title="总字数" value={workStats.totalWords} suffix="字" prefix={<PieChartOutlined />} />
                <Statistic title="总角色数" value={workStats.totalCharacters} prefix={<UserOutlined />} />
                <Statistic title="平均每章字数" value={workStats.avgWordsPerChapter} suffix="字" prefix={<PieChartOutlined />} />
              </div>
            </Space>
          </div>
          
          <Card title="章节长度分布" style={{ marginBottom: '32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
              <Statistic title="短章节 (< 1000字)" value={workStats.shortChapters} />
              <Statistic title="中等章节 (1000-3000字)" value={workStats.mediumChapters} />
              <Statistic title="长章节 (> 3000字)" value={workStats.longChapters} />
            </div>
          </Card>
          
          <Card title="章节字数排行榜" style={{ marginBottom: '32px' }}>
            <Table
              dataSource={statsData ? statsData.chapter_ranking.map((chapter, index) => ({
                key: chapter.chapter_id,
                title: chapter.title,
                wordCount: chapter.word_count,
                status: chapter.status
              })) : chapters
                .map(chapter => ({
                  key: chapter.id,
                  title: chapter.title,
                  wordCount: chapter.word_count || 0,
                  status: chapter.status
                }))
                .sort((a, b) => b.wordCount - a.wordCount)
                .slice(0, 10)}
              columns={[
                {
                  title: '排名',
                  dataIndex: 'index',
                  key: 'index',
                  render: (_, __, index) => index + 1
                },
                {
                  title: '章节标题',
                  dataIndex: 'title',
                  key: 'title'
                },
                {
                  title: '字数',
                  dataIndex: 'wordCount',
                  key: 'wordCount',
                  sorter: (a, b) => a.wordCount - b.wordCount
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status'
                }
              ]}
              pagination={false}
            />
          </Card>
        </>
      )}
    </Card>
  );

  // 报告生成标签页
  const reportTab = (
    <Card>
      <div style={{ textAlign: 'center', padding: '48px 0', marginBottom: '32px' }}>
        <FileTextOutlined style={{ fontSize: '64px', color: '#1890ff', marginBottom: '24px' }} />
        <h2 style={{ marginBottom: '16px' }}>作品分析报告</h2>
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '32px' }}>
          生成详细的作品分析报告，包括健康度评估、统计数据和改进建议
        </p>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          size="large"
          onClick={generateReport}
          loading={reportLoading}
        >
          生成并下载报告
        </Button>
      </div>
      
      <Alert
        title="报告内容说明"
        description="分析报告将包含以下内容：基本信息、统计概览、健康度分析、章节长度分布、改进建议和总结。报告以Markdown格式下载。"
        type="info"
        showIcon
      />
    </Card>
  );

  const tabItems = [
    {
      key: 'health',
      label: <><FileTextOutlined /> 健康度分析</>,
      children: healthAnalysisTab
    },
    {
      key: 'stats',
      label: <><PieChartOutlined /> 统计分析</>,
      children: statsAnalysisTab
    },
    {
      key: 'report',
      label: <><DownloadOutlined /> 报告生成</>,
      children: reportTab
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

export default WorkAnalysis;

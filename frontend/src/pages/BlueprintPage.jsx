import React, { useState, useEffect } from 'react';
import { blueprintApi, projectApi } from '../services/api';
import DataVisualization from '../components/DataVisualization';
import './BlueprintPage.css';

const BlueprintPage = ({ projectId }) => {
  const [activeView, setActiveView] = useState('outline'); // outline, volume, chapter
  const [outlines, setOutlines] = useState([]);
  const [volumes, setVolumes] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedOutline, setSelectedOutline] = useState(null);
  const [selectedVolume, setSelectedVolume] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 加载项目大纲
  useEffect(() => {
    if (projectId) {
      loadProjectOutline();
    }
  }, [projectId]);

  const loadProjectOutline = async () => {
    setIsLoading(true);
    try {
      const response = await blueprintApi.getProjectOutline(projectId);
      setOutlines(response.data);
      if (response.data.length > 0) {
        setSelectedOutline(response.data[0]);
      }
      setError(null);
    } catch (err) {
      setError('加载大纲失败');
      console.error('加载大纲失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 加载卷纲
  const loadVolumes = async () => {
    if (selectedOutline) {
      setIsLoading(true);
      try {
        // 这里应该有一个API来获取大纲对应的卷纲
        // 暂时使用模拟数据
        setVolumes([
          {
            id: 1,
            title: '第一卷：起源',
            core_conflict: '主角发现自己的特殊能力',
            order_index: 1
          },
          {
            id: 2,
            title: '第二卷：挑战',
            core_conflict: '主角面对第一个 major 挑战',
            order_index: 2
          }
        ]);
        setError(null);
      } catch (err) {
        setError('加载卷纲失败');
        console.error('加载卷纲失败:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 加载章纲
  const loadChapters = async () => {
    if (selectedVolume) {
      setIsLoading(true);
      try {
        // 这里应该有一个API来获取卷纲对应的章纲
        // 暂时使用模拟数据
        setChapters([
          {
            id: 1,
            title: '第一章：平凡的一天',
            core_event: '主角在平凡的生活中发现异常',
            emotional_goal: '建立主角的日常和性格',
            word_count_estimate: 2000,
            order_index: 1
          },
          {
            id: 2,
            title: '第二章：觉醒',
            core_event: '主角的特殊能力首次觉醒',
            emotional_goal: '创造惊奇和紧张感',
            word_count_estimate: 2500,
            order_index: 2
          }
        ]);
        setError(null);
      } catch (err) {
        setError('加载章纲失败');
        console.error('加载章纲失败:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 生成大纲
  const generateOutline = async () => {
    setIsLoading(true);
    try {
      const response = await blueprintApi.generateOutline({
        project_id: projectId,
        story_model: 'hero_journey',
        params: {
          detail_level: 'medium',
          style: 'epic'
        }
      });
      setOutlines([...outlines, response.data]);
      setSelectedOutline(response.data);
      setError(null);
    } catch (err) {
      setError('生成大纲失败');
      console.error('生成大纲失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 分解大纲为卷纲
  const decomposeOutlineToVolumes = async () => {
    if (selectedOutline) {
      setIsLoading(true);
      try {
        const response = await blueprintApi.decomposeOutline(selectedOutline.id);
        setVolumes(response.data);
        setActiveView('volume');
        setError(null);
      } catch (err) {
        setError('分解卷纲失败');
        console.error('分解卷纲失败:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 分解卷纲为章纲
  const decomposeVolumeToChapters = async () => {
    if (selectedVolume) {
      setIsLoading(true);
      try {
        const response = await blueprintApi.decomposeVolume(selectedVolume.id);
        setChapters(response.data);
        setActiveView('chapter');
        setError(null);
      } catch (err) {
        setError('分解章纲失败');
        console.error('分解章纲失败:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 切换视图
  const handleViewChange = (view) => {
    setActiveView(view);
    if (view === 'volume' && selectedOutline) {
      loadVolumes();
    } else if (view === 'chapter' && selectedVolume) {
      loadChapters();
    }
  };

  // 选择大纲
  const handleOutlineSelect = (outline) => {
    setSelectedOutline(outline);
    setVolumes([]);
    setChapters([]);
  };

  // 选择卷纲
  const handleVolumeSelect = (volume) => {
    setSelectedVolume(volume);
    setChapters([]);
  };

  // 选择章纲
  const handleChapterSelect = (chapter) => {
    setSelectedChapter(chapter);
  };

  return (
    <div className="blueprint-page">
      <div className="blueprint-header">
        <h1>故事蓝图</h1>
        <div className="header-actions">
          <button 
            className="btn btn-primary" 
            onClick={generateOutline}
            disabled={isLoading}
          >
            {isLoading ? '生成中...' : '生成大纲'}
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => console.log('导入大纲')}
          >
            导入大纲
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => console.log('导出大纲')}
          >
            导出大纲
          </button>
        </div>
        <div className="view-switcher">
          <button 
            className={`btn ${activeView === 'outline' ? 'active' : ''}`}
            onClick={() => handleViewChange('outline')}
          >
            大纲视图
          </button>
          <button 
            className={`btn ${activeView === 'volume' ? 'active' : ''}`}
            onClick={() => handleViewChange('volume')}
          >
            卷纲视图
          </button>
          <button 
            className={`btn ${activeView === 'chapter' ? 'active' : ''}`}
            onClick={() => handleViewChange('chapter')}
          >
            章纲视图
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="blueprint-content">
        <div className="sidebar">
          <h3>大纲结构</h3>
          <div className="outline-tree">
            {outlines.map(outline => (
              <div 
                key={outline.id}
                className={`outline-item ${selectedOutline?.id === outline.id ? 'selected' : ''}`}
                onClick={() => handleOutlineSelect(outline)}
              >
                <h4>{outline.title}</h4>
                <p>版本: {outline.version}</p>
                <p>模型: {outline.story_model}</p>
              </div>
            ))}
            {outlines.length === 0 && (
              <p className="empty-message">暂无大纲，请点击生成大纲</p>
            )}
          </div>
        </div>

        <div className="main-content">
          {activeView === 'outline' && (
            <div className="outline-view">
              <h2>大纲管理</h2>
              {selectedOutline ? (
                <div className="outline-details">
                  <h3>{selectedOutline.title}</h3>
                  <div className="outline-meta">
                    <p>故事模型: {selectedOutline.story_model}</p>
                    <p>版本: {selectedOutline.version}</p>
                  </div>
                  <div className="outline-content">
                    <pre>{selectedOutline.content}</pre>
                  </div>
                  <div className="outline-actions">
                    <button 
                      className="btn btn-primary" 
                      onClick={decomposeOutlineToVolumes}
                    >
                      分解为卷纲
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => console.log('编辑大纲')}
                    >
                      编辑大纲
                    </button>
                  </div>
                  <div className="visualization-section">
                    <h4>故事可视化</h4>
                    <DataVisualization 
                      type="emotion_curve"
                      data={[
                        { chapter: '1', emotion: 0.2 },
                        { chapter: '2', emotion: 0.3 },
                        { chapter: '3', emotion: 0.8 },
                        { chapter: '4', emotion: 0.6 },
                        { chapter: '5', emotion: 0.9 }
                      ]}
                    />
                  </div>
                </div>
              ) : (
                <p className="empty-message">请选择或生成一个大纲</p>
              )}
            </div>
          )}

          {activeView === 'volume' && (
            <div className="volume-view">
              <h2>卷纲管理</h2>
              <div className="volume-cards">
                {volumes.map(volume => (
                  <div 
                    key={volume.id}
                    className={`volume-card ${selectedVolume?.id === volume.id ? 'selected' : ''}`}
                    onClick={() => handleVolumeSelect(volume)}
                  >
                    <h3>第{volume.order_index}卷: {volume.title}</h3>
                    <div className="volume-info">
                      <p><strong>核心冲突:</strong> {volume.core_conflict}</p>
                      <p><strong>内容:</strong> {volume.content}</p>
                    </div>
                    <div className="volume-actions">
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVolumeSelect(volume);
                          decomposeVolumeToChapters();
                        }}
                      >
                        细化章纲
                      </button>
                    </div>
                  </div>
                ))}
                {volumes.length === 0 && (
                  <p className="empty-message">请先选择一个大纲并分解为卷纲</p>
                )}
              </div>
            </div>
          )}

          {activeView === 'chapter' && (
            <div className="chapter-view">
              <h2>章纲管理</h2>
              <div className="chapter-list">
                {chapters.map(chapter => (
                  <div 
                    key={chapter.id}
                    className={`chapter-item ${selectedChapter?.id === chapter.id ? 'selected' : ''}`}
                    onClick={() => handleChapterSelect(chapter)}
                  >
                    <div className="chapter-header">
                      <h3>第{chapter.order_index}章: {chapter.title}</h3>
                      <span className="word-count">约{chapter.word_count_estimate}字</span>
                    </div>
                    <div className="chapter-details">
                      <p><strong>核心事件:</strong> {chapter.core_event}</p>
                      <p><strong>情绪目标:</strong> {chapter.emotional_goal}</p>
                    </div>
                  </div>
                ))}
                {chapters.length === 0 && (
                  <p className="empty-message">请先选择一个卷纲并细化为章纲</p>
                )}
              </div>
              {selectedChapter && (
                <div className="chapter-evaluation">
                  <h3>章纲评估</h3>
                  <div className="evaluation-metrics">
                    <div className="metric">
                      <span className="metric-name">功能分布</span>
                      <div className="metric-value">
                        <div className="progress-bar">
                          <div className="progress" style={{ width: '70%' }}>主线推进 70%</div>
                        </div>
                        <div className="progress-bar">
                          <div className="progress" style={{ width: '20%' }}>人物塑造 20%</div>
                        </div>
                        <div className="progress-bar">
                          <div className="progress" style={{ width: '10%' }}>伏笔设置 10%</div>
                        </div>
                      </div>
                    </div>
                    <div className="metric">
                      <span className="metric-name">节奏评估</span>
                      <span className="metric-value good">合理</span>
                    </div>
                    <div className="metric">
                      <span className="metric-name">冲突密度</span>
                      <span className="metric-value medium">适中</span>
                    </div>
                    <div className="metric">
                      <span className="metric-name">角色出场</span>
                      <span className="metric-value good">均衡</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="right-sidebar">
          <div className="related-settings">
            <h3>相关设定</h3>
            <p>显示与当前选中元素相关的设定</p>
          </div>
          <div className="ai-suggestions">
            <h3>智能建议</h3>
            <p>基于当前大纲的AI建议</p>
          </div>
          <div className="history">
            <h3>操作历史</h3>
            <p>最近的操作记录</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlueprintPage;

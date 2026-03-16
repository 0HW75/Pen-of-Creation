import React, { useState, useEffect } from 'react';
import { Form, Select, Radio, Card, Typography, Alert, Spin, Button, Space } from 'antd';
import { BookOutlined, FileTextOutlined, ReadOutlined, AppstoreOutlined } from '@ant-design/icons';
import { projectApi, blueprintApi } from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

const Step1SelectBlueprint = ({ onComplete, initialData }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [outlines, setOutlines] = useState([]);
  const [volumes, setVolumes] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [contentScopeType, setContentScopeType] = useState('outline');
  const [selectedOutline, setSelectedOutline] = useState(null);
  const [selectedVolume, setSelectedVolume] = useState(null);
  const [estimatedWordCount, setEstimatedWordCount] = useState(0);

  // 加载项目列表
  useEffect(() => {
    loadProjects();
  }, []);

  // 恢复初始数据
  useEffect(() => {
    if (initialData.projectId) {
      setSelectedProject(initialData.projectId);
      form.setFieldsValue({ projectId: initialData.projectId });
      loadProjectOutlines(initialData.projectId);
    }
  }, [initialData]);

  const loadProjects = async () => {
    try {
      const response = await projectApi.getProjects();
      // 后端直接返回数组
      if (Array.isArray(response.data)) {
        setProjects(response.data);
      } else if (response.data.code === 200) {
        setProjects(response.data.data);
      }
    } catch (error) {
      console.error('加载项目列表失败:', error);
    }
  };

  const loadProjectOutlines = async (projectId) => {
    setLoading(true);
    try {
      const response = await blueprintApi.getProjectOutline(projectId);
      let outlineData = null;
      
      // 后端返回数组格式
      if (Array.isArray(response.data) && response.data.length > 0) {
        outlineData = response.data[0]; // 取第一个大纲
      } else if (response.data.code === 200 && response.data.data) {
        outlineData = response.data.data;
      }
      
      if (outlineData) {
        setOutlines([outlineData]);
        setSelectedOutline(outlineData.id);
        form.setFieldsValue({ outlineId: outlineData.id });
        
        // 加载卷纲
        loadOutlineVolumes(outlineData.id);
        
        // 估算字数
        estimateWordCount();
      } else {
        setOutlines([]);
        setVolumes([]);
        setChapters([]);
      }
    } catch (error) {
      console.error('加载大纲失败:', error);
      setOutlines([]);
    } finally {
      setLoading(false);
    }
  };

  const loadOutlineVolumes = async (outlineId) => {
    try {
      const response = await blueprintApi.getOutlineVolumes(outlineId);
      // 后端直接返回数组
      if (Array.isArray(response.data)) {
        setVolumes(response.data);
      } else if (response.data.code === 200) {
        setVolumes(response.data.data);
      }
    } catch (error) {
      console.error('加载卷纲失败:', error);
    }
  };

  const loadVolumeChapters = async (volumeId) => {
    try {
      const response = await blueprintApi.getVolumeChapters(volumeId);
      // 后端直接返回数组
      let loadedChapters = [];
      if (Array.isArray(response.data)) {
        loadedChapters = response.data;
        setChapters(response.data);
      } else if (response.data.code === 200) {
        loadedChapters = response.data.data;
        setChapters(response.data.data);
      }
      // 章纲加载完成后重新计算字数
      console.log('章纲加载完成:', loadedChapters.length, '个章纲');
      setTimeout(() => {
        estimateWordCount();
      }, 0);
    } catch (error) {
      console.error('加载章纲失败:', error);
    }
  };

  // 辅助函数：计算对象中所有字符串字段的总长度
  const calculateTextLength = (obj) => {
    let length = 0;
    if (!obj || typeof obj !== 'object') return length;
    
    Object.values(obj).forEach(value => {
      if (typeof value === 'string') {
        length += value.length;
      } else if (Array.isArray(value)) {
        // 如果是数组，递归计算每个元素
        value.forEach(item => {
          if (typeof item === 'string') {
            length += item.length;
          } else if (typeof item === 'object') {
            length += calculateTextLength(item);
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        // 如果是嵌套对象，递归计算
        length += calculateTextLength(value);
      }
    });
    return length;
  };

  const estimateWordCount = () => {
    let count = 0;
    
    switch (contentScopeType) {
      case 'full':
        // 整个故事蓝图：大纲+所有卷纲+所有章纲
        outlines.forEach(outline => {
          count += calculateTextLength(outline);
        });
        break;
        
      case 'outline':
        // 仅选定大纲的全部内容
        const selectedOutlineData = outlines.find(o => o.id === selectedOutline);
        if (selectedOutlineData) {
          count += calculateTextLength(selectedOutlineData);
        }
        break;
        
      case 'volume':
        // 仅选定卷纲的内容
        const selectedVolumeData = volumes.find(v => v.id === selectedVolume);
        if (selectedVolumeData) {
          count += calculateTextLength(selectedVolumeData);
          // 加上该卷纲下的所有章纲
          const volumeChapters = chapters.filter(c => c.volume_id === selectedVolume);
          console.log('卷纲字数计算:', {
            volumeData: selectedVolumeData,
            volumeTextLength: calculateTextLength(selectedVolumeData),
            chaptersCount: volumeChapters.length,
            chaptersTextLength: volumeChapters.reduce((sum, c) => sum + calculateTextLength(c), 0)
          });
          volumeChapters.forEach(chapter => {
            count += calculateTextLength(chapter);
          });
        }
        break;
        
      case 'chapter':
        // 仅选定章纲的内容
        const selectedChapterData = chapters.find(c => c.id === form.getFieldValue('chapterId'));
        if (selectedChapterData) {
          count += calculateTextLength(selectedChapterData);
        }
        break;
        
      default:
        break;
    }
    
    setEstimatedWordCount(Math.round(count * 0.5)); // 粗略估算中文字数
  };

  const handleProjectChange = (projectId) => {
    setSelectedProject(projectId);
    loadProjectOutlines(projectId);
    // 重置下级选择
    setSelectedOutline(null);
    setSelectedVolume(null);
    setVolumes([]);
    setChapters([]);
    form.setFieldsValue({
      outlineId: undefined,
      volumeId: undefined,
      chapterId: undefined,
    });
  };

  const handleOutlineChange = (outlineId) => {
    setSelectedOutline(outlineId);
    loadOutlineVolumes(outlineId);
    setSelectedVolume(null);
    setChapters([]);
    form.setFieldsValue({
      volumeId: undefined,
      chapterId: undefined,
    });
    // 重新计算字数
    setTimeout(() => {
      estimateWordCount();
    }, 0);
  };

  const handleVolumeChange = (volumeId) => {
    setSelectedVolume(volumeId);
    loadVolumeChapters(volumeId);
    form.setFieldsValue({
      chapterId: undefined,
    });
    // 重新计算字数
    setTimeout(() => {
      estimateWordCount();
    }, 0);
  };

  const handleContentScopeChange = (e) => {
    setContentScopeType(e.target.value);
    // 延迟计算字数，等待状态更新
    setTimeout(() => {
      estimateWordCount();
    }, 0);
  };

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const contentScope = {
        type: contentScopeType,
      };

      switch (contentScopeType) {
        case 'full':
          // 使用整个故事蓝图
          break;
        case 'outline':
          contentScope.outline_id = values.outlineId;
          break;
        case 'volume':
          contentScope.volume_id = values.volumeId;
          break;
        case 'chapter':
          contentScope.chapter_id = values.chapterId;
          break;
        default:
          break;
      }

      onComplete({
        projectId: values.projectId,
        contentScope,
      });
    });
  };

  const getScopeDescription = () => {
    switch (contentScopeType) {
      case 'full':
        return '使用整个故事蓝图（大纲+所有卷纲+所有章纲）';
      case 'outline':
        return selectedOutline ? `使用大纲《${outlines.find(o => o.id === selectedOutline)?.title || '未知'}》的全部内容` : '请选择大纲';
      case 'volume':
        return selectedVolume ? `使用卷纲《${volumes.find(v => v.id === selectedVolume)?.title || '未知'}》的全部内容` : '请选择卷纲';
      case 'chapter':
        return '使用选定章纲的内容';
      default:
        return '';
    }
  };

  return (
    <div style={{ padding: '20px 0' }}>
      <Title level={4} style={{ marginBottom: 24 }}>
        选择故事蓝图内容
      </Title>

      <Form
        form={form}
        layout="vertical"
        initialValues={{ contentScopeType: 'outline' }}
      >
        {/* 项目选择 */}
        <Form.Item
          name="projectId"
          label="选择项目"
          rules={[{ required: true, message: '请选择一个项目' }]}
        >
          <Select
            placeholder="请选择项目"
            onChange={handleProjectChange}
            style={{ width: '100%' }}
          >
            {projects.map(project => (
              <Option key={project.id} value={project.id}>
                <Space>
                  <BookOutlined />
                  {project.title || project.name || '未命名项目'}
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>

        {selectedProject && (
          <>
            <Form.Item label="内容范围">
              <Radio.Group value={contentScopeType} onChange={handleContentScopeChange}>
                <Space direction="vertical">
                  <Radio value="full">
                    <Space>
                      <AppstoreOutlined />
                      使用整个故事蓝图
                    </Space>
                  </Radio>
                  <Radio value="outline">
                    <Space>
                      <FileTextOutlined />
                      使用选定大纲的全部内容
                    </Space>
                  </Radio>
                  <Radio value="volume">
                    <Space>
                      <ReadOutlined />
                      使用选定卷纲的全部内容
                    </Space>
                  </Radio>
                  <Radio value="chapter">
                    <Space>
                      <BookOutlined />
                      使用选定章纲的内容
                    </Space>
                  </Radio>
                </Space>
              </Radio.Group>
            </Form.Item>

            {contentScopeType === 'outline' && (
              <Form.Item
                name="outlineId"
                label="选择大纲"
                rules={[{ required: true, message: '请选择大纲' }]}
              >
                <Select
                  placeholder="请选择大纲"
                  onChange={handleOutlineChange}
                  loading={loading}
                  disabled={outlines.length === 0}
                >
                  {outlines.map(outline => (
                    <Option key={outline.id} value={outline.id}>
                      {outline.title || '未命名大纲'}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            {contentScopeType === 'volume' && (
              <>
                <Form.Item
                  name="outlineId"
                  label="选择大纲"
                  rules={[{ required: true, message: '请选择大纲' }]}
                >
                  <Select
                    placeholder="请选择大纲"
                    onChange={handleOutlineChange}
                    loading={loading}
                  >
                    {outlines.map(outline => (
                      <Option key={outline.id} value={outline.id}>
                        {outline.title || '未命名大纲'}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="volumeId"
                  label="选择卷纲"
                  rules={[{ required: true, message: '请选择卷纲' }]}
                >
                  <Select
                    placeholder="请选择卷纲"
                    onChange={handleVolumeChange}
                    disabled={!selectedOutline || volumes.length === 0}
                  >
                    {volumes.map(volume => (
                      <Option key={volume.id} value={volume.id}>
                        {volume.title || '未命名卷纲'}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </>
            )}

            {contentScopeType === 'chapter' && (
              <>
                <Form.Item
                  name="outlineId"
                  label="选择大纲"
                  rules={[{ required: true, message: '请选择大纲' }]}
                >
                  <Select
                    placeholder="请选择大纲"
                    onChange={handleOutlineChange}
                    loading={loading}
                  >
                    {outlines.map(outline => (
                      <Option key={outline.id} value={outline.id}>
                        {outline.title || '未命名大纲'}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="volumeId"
                  label="选择卷纲"
                  rules={[{ required: true, message: '请选择卷纲' }]}
                >
                  <Select
                    placeholder="请选择卷纲"
                    onChange={handleVolumeChange}
                    disabled={!selectedOutline || volumes.length === 0}
                  >
                    {volumes.map(volume => (
                      <Option key={volume.id} value={volume.id}>
                        {volume.title || '未命名卷纲'}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="chapterId"
                  label="选择章纲"
                  rules={[{ required: true, message: '请选择章纲' }]}
                >
                  <Select
                    placeholder="请选择章纲"
                    disabled={!selectedVolume || chapters.length === 0}
                  >
                    {chapters.map(chapter => (
                      <Option key={chapter.id} value={chapter.id}>
                        {chapter.title || '未命名章纲'}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </>
            )}

            {/* 信息展示 */}
            <Card size="small" style={{ marginTop: 16, backgroundColor: '#f6ffed' }}>
              <Text strong>已选择：</Text>
              <Text>{getScopeDescription()}</Text>
              <br />
              <Text strong>预计分析字数：</Text>
              <Text>约 {estimatedWordCount.toLocaleString()} 字</Text>
            </Card>

            {outlines.length === 0 && !loading && (
              <Alert
                message="该项目暂无故事蓝图"
                description="请先创建故事大纲，或选择其他项目"
                type="warning"
                showIcon
                style={{ marginTop: 16 }}
              />
            )}
          </>
        )}

        <Form.Item style={{ marginTop: 32, textAlign: 'right' }}>
          <Button
            type="primary"
            size="large"
            onClick={handleSubmit}
            disabled={!selectedProject || (contentScopeType !== 'full' && !selectedOutline)}
          >
            下一步：提取设定清单
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Step1SelectBlueprint;

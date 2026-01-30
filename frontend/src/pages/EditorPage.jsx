import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layout, Tabs, message, Spin, Button, Modal, Select, Form, Card } from 'antd';
import { FileTextOutlined, EditOutlined, DownloadOutlined } from '@ant-design/icons';
import ChapterManagement from './ChapterManagement';
import TextEditor from '../components/TextEditor';
import { chapterApi } from '../services/api';
import { exportToWord, exportToPdf, exportToMarkdown, exportToText, exportAllChapters } from '../services/exportService';

const { Content } = Layout;

const EditorPage = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState('chapters');
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [chapterContent, setChapterContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapters, setChapters] = useState([]);
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [isBatchExportModalVisible, setIsBatchExportModalVisible] = useState(false);
  const [exportFormat, setExportFormat] = useState('word');
  const [batchExportFormat, setBatchExportFormat] = useState('word');
  const [form] = Form.useForm();
  const [exportProgress, setExportProgress] = useState(0);
  const [exportProgressText, setExportProgressText] = useState('');
  const [isProgressModalVisible, setIsProgressModalVisible] = useState(false);

  // 加载所有章节
  const loadChapters = useCallback(async () => {
    if (!projectId) return;
    
    try {
      const response = await chapterApi.getChapters(projectId);
      setChapters(response.data);
    } catch (error) {
      console.error('Error loading chapters:', error);
    }
  }, [projectId]);

  // 当选择章节时加载章节内容
  const handleChapterSelect = useCallback(async (chapterId) => {
    setSelectedChapterId(chapterId);
    setLoading(true);
    try {
      const response = await chapterApi.getChapter(chapterId);
      setChapterContent(response.data.content);
      setChapterTitle(response.data.title);
      setActiveTab('editor');
    } catch (error) {
      message.error('加载章节内容失败');
      console.error('Error loading chapter content:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 保存章节内容
  const handleSave = useCallback(async (content, isManual = false) => {
    if (!selectedChapterId) {
      message.error('请先选择章节');
      return;
    }

    try {
      await chapterApi.updateChapter(selectedChapterId, { content });
      // 只有手动保存时才显示成功提示
      if (isManual) {
        message.success('章节内容保存成功');
      }
    } catch (error) {
      message.error('保存章节内容失败');
      console.error('Error saving chapter content:', error);
    }
  }, [selectedChapterId]);

  // 显示导出模态框
  const showExportModal = useCallback(() => {
    setIsExportModalVisible(true);
  }, []);

  // 处理导出
  const handleExport = useCallback(async () => {
    try {
      setIsProgressModalVisible(true);
      setExportProgress(0);
      setExportProgressText('准备导出...');
      
      // 导出当前章节
      let result;
      switch (exportFormat) {
        case 'word':
          result = await exportToWord(chapterContent, chapterTitle, (progress, text) => {
            setExportProgress(progress);
            setExportProgressText(text);
          });
          break;
        case 'pdf':
          result = await exportToPdf(chapterContent, chapterTitle, (progress, text) => {
            setExportProgress(progress);
            setExportProgressText(text);
          });
          break;
        case 'markdown':
          result = exportToMarkdown(chapterContent, chapterTitle, (progress, text) => {
            setExportProgress(progress);
            setExportProgressText(text);
          });
          break;
        case 'text':
          result = exportToText(chapterContent, chapterTitle, (progress, text) => {
            setExportProgress(progress);
            setExportProgressText(text);
          });
          break;
        default:
          result = { success: false, message: '不支持的导出格式' };
          break;
      }
      
      if (result.success) {
        message.success(result.message);
      } else {
        message.error(result.message || '导出失败');
      }
      
      setIsExportModalVisible(false);
      setIsProgressModalVisible(false);
    } catch (error) {
      message.error('导出失败');
      console.error('Error exporting:', error);
      setIsProgressModalVisible(false);
    } finally {
      setLoading(false);
    }
  }, [exportFormat, chapterContent, chapterTitle]);

  // 显示批量导出模态框
  const showBatchExportModal = useCallback(() => {
    setIsBatchExportModalVisible(true);
  }, []);

  // 处理批量导出
  const handleBatchExport = useCallback(async () => {
    try {
      setIsProgressModalVisible(true);
      setExportProgress(0);
      setExportProgressText('准备批量导出...');
      
      // 确保章节列表已加载
      if (chapters.length === 0) {
        await loadChapters();
      }
      
      // 导出所有章节
      const result = await exportAllChapters(chapters, batchExportFormat, `项目_${projectId}`, (progress, text) => {
        setExportProgress(progress);
        setExportProgressText(text);
      });
      
      if (result.success) {
        message.success(result.message);
      } else {
        message.error(result.message || '批量导出失败');
      }
      
      setIsBatchExportModalVisible(false);
      setIsProgressModalVisible(false);
    } catch (error) {
      message.error('批量导出失败');
      console.error('Error in batch export:', error);
      setIsProgressModalVisible(false);
    } finally {
      setLoading(false);
    }
  }, [chapters, batchExportFormat, projectId, loadChapters]);

  // 当项目ID变化时加载章节
  useEffect(() => {
    loadChapters();
  }, [loadChapters]);

  // 生成Tabs配置
  const tabItems = useMemo(() => [
    {
      key: 'chapters',
      label: <><FileTextOutlined /> 章节管理</>,
      children: (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />} 
              onClick={showBatchExportModal}
              size="middle"
            >
              批量导出所有章节
            </Button>
          </div>
          <ChapterManagement projectId={projectId} onChapterSelect={handleChapterSelect} />
        </Card>
      ),
    },
    {
      key: 'editor',
      label: <><EditOutlined /> 文本编辑</>,
      children: (
        <Card>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
              <Spin size="large" />
            </div>
          ) : selectedChapterId ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ margin: 0 }}>编辑章节：{chapterTitle}</h2>
                <Button 
                  type="primary" 
                  icon={<DownloadOutlined />} 
                  onClick={showExportModal}
                  size="middle"
                >
                  导出
                </Button>
              </div>
              <TextEditor
                chapterId={selectedChapterId}
                initialContent={chapterContent}
                onSave={handleSave}
                projectId={projectId}
              />
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <p style={{ fontSize: '18px', color: '#999' }}>
                请从章节管理中选择一个章节进行编辑
              </p>
            </div>
          )}
        </Card>
      ),
    },
  ], [loading, selectedChapterId, chapterTitle, chapterContent, projectId, handleChapterSelect, showExportModal, showBatchExportModal, handleSave]);

  if (!projectId) {
    return (
      <Content style={{ padding: '24px' }}>
        <div style={{ textAlign: 'center', padding: '48px', backgroundColor: '#fff', borderRadius: '8px' }}>
          <p style={{ fontSize: '18px', color: '#ff4d4f' }}>
            请先选择一个项目，然后再进行编辑
          </p>
        </div>
      </Content>
    );
  }

  return (
    <div style={{ padding: '0' }}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
      />

      {/* 导出设置模态框 */}
      <Modal
        title="导出设置"
        open={isExportModalVisible}
        onCancel={() => setIsExportModalVisible(false)}
        onOk={handleExport}
        confirmLoading={loading}
        width={{ xs: '90%', sm: 500 }}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            label="导出格式"
            name="format"
            rules={[{ required: true, message: '请选择导出格式' }]}
          >
            <Select
              value={exportFormat}
              onChange={setExportFormat}
              placeholder="请选择导出格式"
              style={{ width: '100%' }}
            >
              <Select.Option value="word">Word (.docx)</Select.Option>
              <Select.Option value="pdf">PDF (.pdf)</Select.Option>
              <Select.Option value="markdown">Markdown (.md)</Select.Option>
              <Select.Option value="text">纯文本 (.txt)</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 批量导出设置模态框 */}
      <Modal
        title="批量导出设置"
        open={isBatchExportModalVisible}
        onCancel={() => setIsBatchExportModalVisible(false)}
        onOk={handleBatchExport}
        confirmLoading={loading}
        width={{ xs: '90%', sm: 500 }}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            label="导出格式"
            rules={[{ required: true, message: '请选择导出格式' }]}
          >
            <Select
              value={batchExportFormat}
              onChange={setBatchExportFormat}
              placeholder="请选择导出格式"
              style={{ width: '100%' }}
            >
              <Select.Option value="word">Word (.docx)</Select.Option>
              <Select.Option value="pdf">PDF (.pdf)</Select.Option>
              <Select.Option value="markdown">Markdown (.md)</Select.Option>
              <Select.Option value="text">纯文本 (.txt)</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 导出进度模态框 */}
      <Modal
        title="导出进度"
        open={isProgressModalVisible}
        onCancel={() => setIsProgressModalVisible(false)}
        footer={null}
        width={{ xs: '80%', sm: 400 }}
        closable={false}
        maskClosable={false}
      >
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <Spin size="large" style={{ marginBottom: '16px' }} />
          <div style={{ marginBottom: '16px' }}>{exportProgressText}</div>
          <div style={{ width: '100%', backgroundColor: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
            <div 
              style={{
                width: `${exportProgress}%`,
                height: '8px',
                backgroundColor: '#1890ff',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>{exportProgress}%</div>
        </div>
      </Modal>
    </div>
  );
};

export default EditorPage;
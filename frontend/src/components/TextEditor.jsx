import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Editor } from '@monaco-editor/react';
import { Card, Typography, Button, Alert, Space, Tooltip, Select, Switch, Divider, Modal, Input, InputNumber, Badge, message } from 'antd';
import { 
  SaveOutlined, FileTextOutlined, ClockCircleOutlined, 
  FullscreenOutlined, FullscreenExitOutlined, 
  SettingOutlined, MoonOutlined, SunOutlined, 
  FontSizeOutlined, AlignLeftOutlined, SearchOutlined, 
  CodeOutlined, OrderedListOutlined, UnorderedListOutlined, 
  BoldOutlined, ItalicOutlined, UnderlineOutlined, 
  LinkOutlined, FileImageOutlined, FileOutlined, 
  MenuOutlined, SwapOutlined, 
  RocketOutlined, EditOutlined, 
  CloseOutlined 
} from '@ant-design/icons';
import { aiApi } from '../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

const TextEditor = ({ chapterId, initialContent, onSave, projectId }) => {
  const [content, setContent] = useState(initialContent || '');
  const [wordCount, setWordCount] = useState(0);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editorTheme, setEditorTheme] = useState('vs');
  const [fontSize, setFontSize] = useState(14);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [showMinimap, setShowMinimap] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [autoSaveDelay, setAutoSaveDelay] = useState(3);
  const [editorRef, setEditorRef] = useState(null);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [showOutline, setShowOutline] = useState(false);
  const [outline, setOutline] = useState([]);
  const [isReplaceAll, setIsReplaceAll] = useState(false);
  // AI功能状态
  const [isAiModalVisible, setIsAiModalVisible] = useState(false);
  const [aiFunction, setAiFunction] = useState('opening');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenre, setAiGenre] = useState('玄幻');
  const [aiLength, setAiLength] = useState(300);
  const [aiDirection, setAiDirection] = useState('');
  const [aiStyle, setAiStyle] = useState('流畅自然');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const autoSaveTimer = useRef(null);
  const editorContainerRef = useRef(null);
  const searchMatchRef = useRef(null);

  // 计算字数
  const calculateWordCount = useCallback((text) => {
    // 去除空白字符后计算字数
    return text.replace(/\s/g, '').length;
  }, []);

  // 处理内容变化
  const handleEditorChange = useCallback((value) => {
    const newValue = value || '';
    // 只有当内容真正发生变化时才更新状态
    if (newValue !== content) {
      setContent(newValue);
    }
  }, [content]);

  // 处理编辑器实例获取
  const handleEditorDidMount = useCallback((editor) => {
    setEditorRef(editor);
  }, []);

  // 处理保存
  const handleSave = useCallback(async (isManual = false) => {
    if (!hasChanges || !onSave) return;

    setIsSaving(true);
    try {
      await onSave(content, isManual);
      setLastSaved(new Date());
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      setIsSaving(false);
    }
  }, [hasChanges, onSave, content]);

  // 处理全屏切换
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => {
      const newFullscreenState = !prev;
      
      if (newFullscreenState) {
        // 进入全屏
        if (editorContainerRef.current) {
          if (editorContainerRef.current.requestFullscreen) {
            editorContainerRef.current.requestFullscreen();
          } else if (editorContainerRef.current.webkitRequestFullscreen) {
            editorContainerRef.current.webkitRequestFullscreen();
          } else if (editorContainerRef.current.msRequestFullscreen) {
            editorContainerRef.current.msRequestFullscreen();
          }
        }
      } else {
        // 退出全屏
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
      return newFullscreenState;
    });
  }, []);

  // 处理主题切换
  const toggleTheme = useCallback(() => {
    setEditorTheme(prev => prev === 'vs' ? 'vs-dark' : 'vs');
  }, []);

  // 当内容变化时更新字数
  useEffect(() => {
    const count = calculateWordCount(content);
    setWordCount(count);
    // 只有当内容不是初始内容时才设置hasChanges为true
    if (content !== initialContent) {
      setHasChanges(true);
    }

    // 清除之前的定时器
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    // 设置自动保存定时器
    if (autoSaveEnabled && hasChanges) {
      autoSaveTimer.current = setTimeout(() => {
        handleSave(false); // 自动保存，不显示提示
      }, autoSaveDelay * 1000);
    }

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [content, initialContent, autoSaveEnabled, autoSaveDelay, calculateWordCount, handleSave, hasChanges]);

  // 编辑器配置
  const editorOptions = useMemo(() => ({
    selectOnLineNumbers: true,
    minimap: {
      enabled: showMinimap,
    },
    fontSize: fontSize,
    lineNumbers: showLineNumbers ? 'on' : 'off',
    wordWrap: 'on',
    scrollBeyondLastLine: false,
    theme: editorTheme,
    automaticLayout: true,
    scrollbar: {
      vertical: 'auto',
      horizontal: 'auto',
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10
    }
  }), [showMinimap, fontSize, showLineNumbers, editorTheme]);

  // 处理Markdown格式化
  const handleMarkdownFormat = useCallback((formatType) => {
    if (!editorRef) return;
    
    const selection = editorRef.getSelection();
    const selectedText = editorRef.getModel()?.getValueInRange(selection) || '';
    let formattedText = '';
    
    switch (formatType) {
      case 'bold':
        formattedText = `**${selectedText || '粗体文本'}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText || '斜体文本'}*`;
        break;
      case 'underline':
        formattedText = `<u>${selectedText || '下划线文本'}</u>`;
        break;
      case 'link':
        formattedText = `[${selectedText || '链接文本'}](https://example.com)`;
        break;
      case 'image':
        formattedText = `![${selectedText || '图片描述'}](https://example.com/image.jpg)`;
        break;
      case 'code':
        formattedText = `\`${selectedText || '代码'}\``;
        break;
      case 'codeBlock':
        formattedText = `\`\`\`\n${selectedText || '代码块'}\n\`\`\``;
        break;
      case 'orderedList':
        formattedText = `1. ${selectedText || '列表项1'}\n2. 列表项2\n3. 列表项3`;
        break;
      case 'unorderedList':
        formattedText = `- ${selectedText || '列表项1'}\n- 列表项2\n- 列表项3`;
        break;
      case 'heading1':
        formattedText = `# ${selectedText || '一级标题'}`;
        break;
      case 'heading2':
        formattedText = `## ${selectedText || '二级标题'}`;
        break;
      case 'heading3':
        formattedText = `### ${selectedText || '三级标题'}`;
        break;
      case 'quote':
        formattedText = `> ${selectedText || '引用文本'}`;
        break;
      default:
        return;
    }
    
    editorRef.executeEdits('format', [{
      range: selection,
      text: formattedText,
      forceMoveMarkers: true
    }]);
    
    // 聚焦编辑器
    editorRef.focus();
  }, [editorRef]);

  // 处理搜索功能
  const handleSearch = useCallback(() => {
    setIsSearchModalVisible(true);
  }, []);

  // 处理搜索和替换
  const handleSearchReplace = useCallback((replace = false) => {
    if (!editorRef || !searchTerm) return;
    
    if (replace) {
      editorRef.getAction('actions.findAndReplace').run();
    } else {
      editorRef.getAction('actions.find').run();
    }
    
    // 设置搜索框内容
    setTimeout(() => {
      const searchInput = document.querySelector('.monaco-findInput .input');
      if (searchInput) {
        searchInput.value = searchTerm;
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, 100);
  }, [editorRef, searchTerm]);

  // 生成内容大纲
  const generateOutline = useCallback((text) => {
    const lines = text.split('\n');
    const outlineItems = [];
    
    lines.forEach((line, index) => {
      const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const title = headingMatch[2];
        outlineItems.push({ level, title, line: index + 1 });
      }
    });
    
    setOutline(outlineItems);
  }, []);

  // 跳转到大纲项
  const jumpToOutlineItem = useCallback((line) => {
    if (!editorRef) return;
    
    const position = editorRef.getPosition();
    editorRef.revealPositionInCenter({
      lineNumber: line,
      column: 1
    });
    
    editorRef.setSelection({
      startLineNumber: line,
      startColumn: 1,
      endLineNumber: line,
      endColumn: 1
    });
    
    editorRef.focus();
  }, [editorRef]);

  // AI功能处理
  const handleAiGenerate = useCallback(async () => {
    // 表单验证
    if (aiFunction === 'opening' && !aiPrompt.trim()) {
      message.error('请输入故事创意');
      return;
    }
    
    if (aiFunction === 'continue' && !content.trim()) {
      message.error('请在编辑器中输入内容作为上下文');
      return;
    }
    
    if (aiFunction === 'rewrite' && !content.trim()) {
      message.error('请在编辑器中输入需要润色的内容');
      return;
    }
    
    setIsAiLoading(true);
    setAiResult('');
    
    try {
      let response;
      
      switch (aiFunction) {
        case 'opening':
          response = await aiApi.generateOpening({
            prompt: aiPrompt,
            genre: aiGenre,
            length: aiLength
          });
          setAiResult(response.data.opening);
          break;
        case 'continue':
          response = await aiApi.continueWriting({
            context: content,
            genre: aiGenre,
            length: aiLength,
            direction: aiDirection
          });
          setAiResult(response.data.continuation);
          break;
        case 'rewrite':
          const selectedText = editorRef?.getModel()?.getValueInRange(editorRef.getSelection()) || content;
          response = await aiApi.rewrite({
            text: selectedText,
            style: aiStyle
          });
          setAiResult(response.data.rewritten);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('AI生成失败:', error);
      if (error.response?.status === 400) {
        message.error('请求参数错误，请检查输入内容');
      } else if (error.response?.status === 500) {
        message.error('AI生成失败，请检查API密钥是否正确');
      } else {
        message.error('网络错误，请检查网络连接');
      }
    } finally {
      setIsAiLoading(false);
    }
  }, [aiFunction, aiPrompt, aiGenre, aiLength, aiDirection, aiStyle, content, editorRef]);

  // 应用AI结果到编辑器
  const applyAiResult = useCallback(() => {
    if (!aiResult || !editorRef) return;
    
    if (aiFunction === 'rewrite' && editorRef.getSelection().isEmpty()) {
      // 如果是润色且没有选中文本，替换整个内容
      setContent(aiResult);
    } else {
      // 否则插入到光标位置或替换选中内容
      editorRef.executeEdits('ai', [{
        range: editorRef.getSelection(),
        text: aiResult,
        forceMoveMarkers: true
      }]);
    }
    
    setIsAiModalVisible(false);
  }, [aiResult, aiFunction, editorRef]);

  // 处理代码格式化
  const handleFormatCode = useCallback(() => {
    if (!editorRef) return;
    
    editorRef.getAction('editor.action.formatDocument').run();
  }, [editorRef]);

  // 当内容变化时更新大纲
  useEffect(() => {
    generateOutline(content);
  }, [content, generateOutline]);

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Title level={3}>文本编辑器</Title>
          <Tooltip title={editorTheme === 'vs' ? '切换到深色主题' : '切换到浅色主题'}>
            <Button 
              icon={editorTheme === 'vs' ? <MoonOutlined /> : <SunOutlined />}
              onClick={toggleTheme}
              size="middle"
            />
          </Tooltip>
          <Tooltip title="编辑器设置">
            <Button 
              icon={<SettingOutlined />}
              onClick={() => setIsSettingsModalVisible(true)}
              size="middle"
            />
          </Tooltip>
        </div>
        <Space wrap>
          <Tooltip title="搜索和替换">
            <Button 
              icon={<SearchOutlined />}
              onClick={handleSearch}
              size="middle"
            />
          </Tooltip>
          <Tooltip title="代码格式化">
            <Button 
              icon={<CodeOutlined />}
              onClick={handleFormatCode}
              size="middle"
            />
          </Tooltip>
          <Tooltip title="内容大纲">
            <Button 
              icon={<MenuOutlined />}
              onClick={() => setShowOutline(!showOutline)}
              size="middle"
              badge={outline.length > 0 ? { count: outline.length } : null}
            />
          </Tooltip>
          <Tooltip title="AI辅助创作">
            <Button 
              icon={<RocketOutlined />}
              onClick={() => setIsAiModalVisible(true)}
              size="middle"
              type="dashed"
            >
              AI助手
            </Button>
          </Tooltip>
          <Tooltip title="自动保存已启用（3秒延迟）">
            <Text>
              <ClockCircleOutlined /> {lastSaved ? `上次保存: ${lastSaved.toLocaleTimeString()}` : '未保存'}
            </Text>
          </Tooltip>
          <Text strong>{wordCount} 字</Text>
          <Button 
            type="primary" 
            icon={<SaveOutlined />}
            onClick={() => handleSave(true)}
            loading={isSaving}
            disabled={!hasChanges}
            size="middle"
          >
            保存
          </Button>
          <Tooltip title={isFullscreen ? '退出全屏' : '进入全屏'}>
            <Button 
              icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              onClick={toggleFullscreen}
              size="middle"
            />
          </Tooltip>
        </Space>
      </div>

      {/* Markdown工具栏 */}
      <div style={{ 
        border: '1px solid #d9d9d9', 
        borderRadius: '4px', 
        padding: '8px', 
        marginBottom: '16px',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        alignItems: 'center'
      }}>
        <Text strong>Markdown工具栏:</Text>
        <Space wrap>
          <Tooltip title="一级标题">
            <Button 
              icon={<FileOutlined />}
              onClick={() => handleMarkdownFormat('heading1')}
              size="small"
            >
              H1
            </Button>
          </Tooltip>
          <Tooltip title="二级标题">
            <Button 
              icon={<FileOutlined />}
              onClick={() => handleMarkdownFormat('heading2')}
              size="small"
            >
              H2
            </Button>
          </Tooltip>
          <Tooltip title="三级标题">
            <Button 
              icon={<FileOutlined />}
              onClick={() => handleMarkdownFormat('heading3')}
              size="small"
            >
              H3
            </Button>
          </Tooltip>
          <Divider orientation="vertical" style={{ margin: 0 }} />
          <Tooltip title="粗体">
            <Button 
              icon={<BoldOutlined />}
              onClick={() => handleMarkdownFormat('bold')}
              size="small"
            />
          </Tooltip>
          <Tooltip title="斜体">
            <Button 
              icon={<ItalicOutlined />}
              onClick={() => handleMarkdownFormat('italic')}
              size="small"
            />
          </Tooltip>
          <Tooltip title="下划线">
            <Button 
              icon={<UnderlineOutlined />}
              onClick={() => handleMarkdownFormat('underline')}
              size="small"
            />
          </Tooltip>
          <Divider orientation="vertical" style={{ margin: 0 }} />
          <Tooltip title="链接">
            <Button 
              icon={<LinkOutlined />}
              onClick={() => handleMarkdownFormat('link')}
              size="small"
            />
          </Tooltip>
          <Tooltip title="图片">
            <Button 
              icon={<FileImageOutlined />}
              onClick={() => handleMarkdownFormat('image')}
              size="small"
            />
          </Tooltip>
          <Divider orientation="vertical" style={{ margin: 0 }} />
          <Tooltip title="行内代码">
            <Button 
              icon={<CodeOutlined />}
              onClick={() => handleMarkdownFormat('code')}
              size="small"
            />
          </Tooltip>
          <Tooltip title="代码块">
            <Button 
              icon={<CodeOutlined />}
              onClick={() => handleMarkdownFormat('codeBlock')}
              size="small"
              type="dashed"
            >
              代码块
            </Button>
          </Tooltip>
          <Divider orientation="vertical" style={{ margin: 0 }} />
          <Tooltip title="有序列表">
            <Button 
              icon={<OrderedListOutlined />}
              onClick={() => handleMarkdownFormat('orderedList')}
              size="small"
            />
          </Tooltip>
          <Tooltip title="无序列表">
            <Button 
              icon={<UnorderedListOutlined />}
              onClick={() => handleMarkdownFormat('unorderedList')}
              size="small"
            />
          </Tooltip>
          <Divider orientation="vertical" style={{ margin: 0 }} />
          <Tooltip title="引用">
            <Button 
              icon={<AlignLeftOutlined />}
              onClick={() => handleMarkdownFormat('quote')}
              size="small"
            >
              引用
            </Button>
          </Tooltip>
        </Space>
      </div>

      {hasChanges && (
        <Alert 
          title="有未保存的更改" 
          type="warning" 
          showIcon 
          style={{ marginBottom: '16px' }} 
          action={
            <Button size="small" type="primary" onClick={() => handleSave(true)} loading={isSaving}>
              立即保存
            </Button>
          }
        />
      )}

      <div style={{ display: 'flex', gap: '16px' }}>
        {/* 内容大纲 */}
        {showOutline && (
          <div style={{
            width: '250px',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            padding: '16px',
            backgroundColor: '#f9f9f9',
            maxHeight: '600px',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Title level={5}>内容大纲</Title>
              <Button 
                icon={<CloseOutlined />}
                onClick={() => setShowOutline(false)}
                size="small"
              />
            </div>
            {outline.length > 0 ? (
              <div>
                {outline.map((item, index) => (
                  <div 
                    key={index}
                    style={{
                      marginBottom: '8px',
                      paddingLeft: `${(item.level - 1) * 16}px`,
                      cursor: 'pointer'
                    }}
                    onClick={() => jumpToOutlineItem(item.line)}
                  >
                    <Text 
                      strong={item.level === 1}
                      style={{ 
                        fontSize: item.level === 1 ? '16px' : item.level === 2 ? '14px' : '13px'
                      }}
                    >
                      {item.title}
                    </Text>
                    <Text type="secondary" style={{ marginLeft: '8px', fontSize: '12px' }}>
                      {item.line}
                    </Text>
                  </div>
                ))}
              </div>
            ) : (
              <Text type="secondary">暂无大纲内容</Text>
            )}
          </div>
        )}
        
        {/* 编辑器 */}
        <div 
          ref={editorContainerRef}
          style={{
            flex: 1,
            border: '1px solid #d9d9d9', 
            borderRadius: '4px', 
            minHeight: '600px',
            position: 'relative'
          }}
        >
          <Editor
            height="600px"
            defaultLanguage="markdown"
            value={content}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            options={editorOptions}
          />
        </div>
      </div>

      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <Text type="secondary">
          <ClockCircleOutlined /> {autoSaveEnabled ? `自动保存已启用（${autoSaveDelay}秒延迟）` : '自动保存已禁用'}
        </Text>
        <Text type="secondary">
          <FileTextOutlined /> 支持Markdown语法
        </Text>
        <Text type="secondary">
          <FontSizeOutlined /> 字体大小: {fontSize}px
        </Text>
      </div>

      {/* 编辑器设置模态框 */}
      <Modal
        title="编辑器设置"
        open={isSettingsModalVisible}
        onCancel={() => setIsSettingsModalVisible(false)}
        onOk={() => setIsSettingsModalVisible(false)}
        width={500}
      >
        <div style={{ padding: '16px 0' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <Text strong>主题</Text>
              <Button 
                icon={editorTheme === 'vs' ? <MoonOutlined /> : <SunOutlined />}
                onClick={toggleTheme}
                size="small"
              >
                {editorTheme === 'vs' ? '深色' : '浅色'}
              </Button>
            </div>
          </div>

          <Divider />

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Text strong>字体大小</Text>
              <Select 
                value={fontSize}
                onChange={setFontSize}
                style={{ width: 100 }}
                size="small"
              >
                <Select.Option value={12}>12px</Select.Option>
                <Select.Option value={14}>14px</Select.Option>
                <Select.Option value={16}>16px</Select.Option>
                <Select.Option value={18}>18px</Select.Option>
                <Select.Option value={20}>20px</Select.Option>
              </Select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Text strong>显示行号</Text>
              <Switch checked={showLineNumbers} onChange={setShowLineNumbers} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Text strong>显示小地图</Text>
              <Switch checked={showMinimap} onChange={setShowMinimap} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Text strong>启用自动保存</Text>
              <Switch checked={autoSaveEnabled} onChange={setAutoSaveEnabled} />
            </div>

            {autoSaveEnabled && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Text strong>自动保存延迟（秒）</Text>
                <Select 
                  value={autoSaveDelay}
                  onChange={setAutoSaveDelay}
                  style={{ width: 100 }}
                  size="small"
                >
                  <Select.Option value={1}>1</Select.Option>
                  <Select.Option value={2}>2</Select.Option>
                  <Select.Option value={3}>3</Select.Option>
                  <Select.Option value={5}>5</Select.Option>
                  <Select.Option value={10}>10</Select.Option>
                </Select>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* 搜索和替换模态框 */}
      <Modal
        title="搜索和替换"
        open={isSearchModalVisible}
        onCancel={() => setIsSearchModalVisible(false)}
        onOk={() => handleSearchReplace(false)}
        width={500}
      >
        <div style={{ padding: '16px 0' }}>
          <div style={{ marginBottom: '16px' }}>
            <Text strong style={{ marginBottom: '8px', display: 'block' }}>搜索</Text>
            <Input
              placeholder="输入搜索内容"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <Text strong style={{ marginBottom: '8px', display: 'block' }}>替换</Text>
            <Input
              placeholder="输入替换内容"
              value={replaceTerm}
              onChange={(e) => setReplaceTerm(e.target.value)}
              prefix={<SwapOutlined />}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <Switch
              checked={isReplaceAll}
              onChange={setIsReplaceAll}
              checkedChildren="替换全部"
              unCheckedChildren="逐个替换"
            />
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button onClick={() => setIsSearchModalVisible(false)}>取消</Button>
            <Button type="primary" onClick={() => handleSearchReplace(false)}>
              搜索
            </Button>
            <Button type="primary" danger onClick={() => handleSearchReplace(true)}>
              替换
            </Button>
          </div>
        </div>
      </Modal>

      {/* AI辅助功能模态框 */}
      <Modal
        title="AI辅助创作"
        open={isAiModalVisible}
        onCancel={() => setIsAiModalVisible(false)}
        footer={null}
        width={700}
      >
        <div style={{ padding: '16px 0' }}>
          <div style={{ marginBottom: '24px' }}>
            <Text strong style={{ marginBottom: '8px', display: 'block' }}>功能选择</Text>
            <Select
              value={aiFunction}
              onChange={setAiFunction}
              style={{ width: '100%' }}
              size="large"
            >
              <Select.Option value="opening" icon={<RocketOutlined />}>智能开篇生成</Select.Option>
              <Select.Option value="continue" icon={<EditOutlined />}>AI续写</Select.Option>
              <Select.Option value="rewrite" icon={<EditOutlined />}>AI润色</Select.Option>
            </Select>
          </div>

          {aiFunction === 'opening' && (
            <div style={{ marginBottom: '16px' }}>
              <Text strong style={{ marginBottom: '8px', display: 'block' }}>故事创意</Text>
              <Input.TextArea
                placeholder="请输入故事创意或大纲"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={4}
                style={{ marginBottom: '16px' }}
              />
            </div>
          )}

          {aiFunction === 'continue' && (
            <div style={{ marginBottom: '16px' }}>
              <Text strong style={{ marginBottom: '8px', display: 'block' }}>续写方向（可选）</Text>
              <Input.TextArea
                placeholder="请输入续写的方向或要求"
                value={aiDirection}
                onChange={(e) => setAiDirection(e.target.value)}
                rows={2}
                style={{ marginBottom: '16px' }}
              />
            </div>
          )}

          {aiFunction === 'rewrite' && (
            <div style={{ marginBottom: '16px' }}>
              <Text strong style={{ marginBottom: '8px', display: 'block' }}>润色风格</Text>
              <Select
                value={aiStyle}
                onChange={setAiStyle}
                style={{ width: '100%', marginBottom: '16px' }}
                  size="middle"
              >
                <Select.Option value="流畅自然">流畅自然</Select.Option>
                <Select.Option value="华丽优美">华丽优美</Select.Option>
                <Select.Option value="简洁明快">简洁明快</Select.Option>
                <Select.Option value="深沉厚重">深沉厚重</Select.Option>
              </Select>
              <Alert
                title="提示"
                description="如果您在编辑器中选中文本，AI将只润色选中的部分；否则将润色整个内容。"
                type="info"
                style={{ marginBottom: '16px' }}
              />
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <Text strong>小说类型</Text>
              <Text strong>生成长度</Text>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Select
                value={aiGenre}
                onChange={setAiGenre}
                style={{ flex: 1 }}
                size="middle"
              >
                <Select.Option value="玄幻">玄幻</Select.Option>
                <Select.Option value="科幻">科幻</Select.Option>
                <Select.Option value="言情">言情</Select.Option>
                <Select.Option value="悬疑">悬疑</Select.Option>
                <Select.Option value="都市">都市</Select.Option>
                <Select.Option value="历史">历史</Select.Option>
                <Select.Option value="武侠">武侠</Select.Option>
              </Select>
              <InputNumber
                value={aiLength}
                onChange={setAiLength}
                min={100}
                max={2000}
                step={100}
                style={{ width: 120 }}
                size="middle"
              />
              <Text style={{ whiteSpace: 'nowrap' }}>字</Text>
            </div>
          </div>

          {aiResult && (
            <div style={{ marginBottom: '24px' }}>
              <Text strong style={{ marginBottom: '8px', display: 'block' }}>AI生成结果</Text>
              <div style={{ 
                border: '1px solid #d9d9d9', 
                borderRadius: '4px', 
                padding: '16px', 
                backgroundColor: '#f9f9f9',
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                <Text>{aiResult}</Text>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button onClick={() => setIsAiModalVisible(false)}>
              取消
            </Button>
            <Button 
              type="primary" 
              onClick={handleAiGenerate}
              loading={isAiLoading}
            >
              生成
            </Button>
            {aiResult && (
              <Button 
                type="primary" 
                danger
                onClick={applyAiResult}
              >
                应用到编辑器
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default TextEditor;
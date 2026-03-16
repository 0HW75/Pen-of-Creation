import React, { useState, useEffect, useRef, useCallback } from 'react';
import './AIChat.css';

const AIChat = ({
  isOpen,
  onClose,
  outlines,
  volumes,
  chapters: propChapters,
  selectedOutline,
  selectedVolume,
  selectedChapter,
  onSendMessage,
  onApplyChanges,
  onCreateVersion,
  isLoading,
  projectId
}) => {
  const [targetType, setTargetType] = useState('outline'); // outline, volume, chapter
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [pendingChanges, setPendingChanges] = useState(null); // 待采纳的修改
  const [isApplying, setIsApplying] = useState(false);
  const [showPreview, setShowPreview] = useState(true); // 是否显示预览
  const [allChapters, setAllChapters] = useState([]); // 所有章纲
  const [isLoadingChapters, setIsLoadingChapters] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false); // 批量修改模式
  const [selectedItems, setSelectedItems] = useState([]); // 批量选中的项目
  const [batchState, setBatchState] = useState({
    isProcessing: false,
    currentIndex: 0,
    totalCount: 0,
    results: [],
    globalStrategy: null,
    isPaused: false
  }); // 批量处理状态
  const messagesEndRef = useRef(null);

  // 加载所有章纲
  const loadAllChapters = useCallback(async () => {
    if (!projectId) return;
    setIsLoadingChapters(true);
    try {
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}/chapters`);
      if (response.ok) {
        const data = await response.json();
        setAllChapters(data || []);
      } else {
        console.error('加载所有章纲失败:', response.statusText);
      }
    } catch (error) {
      console.error('加载所有章纲失败:', error);
    } finally {
      setIsLoadingChapters(false);
    }
  }, [projectId]);

  // 当切换到章纲标签时，加载所有章纲
  useEffect(() => {
    if (isOpen && targetType === 'chapter' && allChapters.length === 0 && !isLoadingChapters) {
      loadAllChapters();
    }
  }, [isOpen, targetType, allChapters.length, isLoadingChapters, loadAllChapters]);

  // 初始化选中项
  useEffect(() => {
    if (isOpen) {
      if (selectedChapter) {
        setTargetType('chapter');
        setSelectedTarget({ type: 'chapter', data: selectedChapter });
      } else if (selectedVolume) {
        setTargetType('volume');
        setSelectedTarget({ type: 'volume', data: selectedVolume });
      } else if (selectedOutline) {
        setTargetType('outline');
        setSelectedTarget({ type: 'outline', data: selectedOutline });
      }

      // 初始化欢迎消息
      if (messages.length === 0) {
        setMessages([
          {
            role: 'assistant',
            content: '您好！我是您的AI大纲修改助手。\n\n📌 单条修改：直接点击左侧项目选择\n📌 批量修改：开启右上角"批量模式"，勾选多个项目一起修改',
            timestamp: new Date()
          }
        ]);
      }
    }
  }, [isOpen, selectedOutline, selectedVolume, selectedChapter]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 获取当前目标类型的数据
  const getTargetData = () => {
    switch (targetType) {
      case 'outline':
        return outlines || [];
      case 'volume':
        return volumes || [];
      case 'chapter':
        return allChapters.length > 0 ? allChapters : (propChapters || []);
      default:
        return [];
    }
  };

  // 切换展开/收起
  const toggleExpand = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // 选择目标（单条模式）
  const handleSelectTarget = (type, data) => {
    if (isBatchMode) {
      // 批量模式：切换选中状态
      const itemKey = `${type}-${data.id}`;
      const exists = selectedItems.find(item => item.key === itemKey);
      
      if (exists) {
        setSelectedItems(prev => prev.filter(item => item.key !== itemKey));
      } else {
        setSelectedItems(prev => [...prev, { key: itemKey, type, data }]);
      }
    } else {
      // 单条模式
      setSelectedTarget({ type, data });
      setPendingChanges(null);
      setShowPreview(true);
    }
  };

  // 判断是否选中（批量模式用）
  const isItemSelected = (type, id) => {
    return selectedItems.some(item => item.type === type && item.data.id === id);
  };

  // 获取目标内容（用于AI请求）
  const getTargetContent = () => {
    // 辅助函数：安全地获取数组字段
    const getArrayField = (data, fieldName) => {
      const value = data[fieldName];
      if (!value) return [];
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          return [];
        }
      }
      return [];
    };

    if (isBatchMode && selectedItems.length > 0) {
      // 批量模式：返回所有选中项目的内容
      return selectedItems.map((item, index) => {
        const { type, data } = item;
        let content = `\n【项目 ${index + 1}】\n`;
        
        switch (type) {
          case 'outline':
            content += `类型：大纲\n标题：${data.title}\n内容：${data.content || '暂无内容'}`;
            break;
          case 'volume':
            content += `类型：卷纲\n标题：${data.title}\n卷号：第${data.order_index}卷\n核心冲突：${data.core_conflict || '暂无'}\n主要内容：${data.content || '暂无内容'}\n关键事件：${getArrayField(data, 'key_events').join('、') || '暂无'}\n角色发展：${data.character_development || '暂无'}\n章节数量：${data.chapter_count || '暂无'}`;
            break;
          case 'chapter':
            content += `类型：章纲\n标题：${data.title}\n章节号：第${data.order_index}章\n核心事件：${data.core_event || '暂无'}\n主要内容：${data.content || '暂无内容'}\n场景：${getArrayField(data, 'scenes').join('、') || '暂无'}\n出场角色：${getArrayField(data, 'characters').join('、') || '暂无'}\n情感目标：${data.emotional_goal || '暂无'}\n关键词：${getArrayField(data, 'keywords').join('、') || '暂无'}\n预估字数：${data.word_count_estimate || '暂无'}`;
            break;
        }
        return content;
      }).join('\n');
    }

    if (!selectedTarget) return '';

    const { type, data } = selectedTarget;
    
    // 从最新数据源获取数据，确保显示的是修改后的内容
    let latestData = data;
    if (type === 'chapter') {
      // 优先从propChapters中查找（父组件会更新），其次从allChapters中查找
      const chapterId = data.id;
      const foundChapter = propChapters.find(c => c.id === chapterId) || 
                          allChapters.find(c => c.id === chapterId);
      if (foundChapter) {
        latestData = foundChapter;
      }
    } else if (type === 'volume') {
      const volumeId = data.id;
      const foundVolume = volumes.find(v => v.id === volumeId);
      if (foundVolume) {
        latestData = foundVolume;
      }
    } else if (type === 'outline') {
      const outlineId = data.id;
      const foundOutline = outlines.find(o => o.id === outlineId);
      if (foundOutline) {
        latestData = foundOutline;
      }
    }
    
    let content = '';

    switch (type) {
      case 'outline':
        content = `大纲标题：${latestData.title}\n\n大纲内容：\n${latestData.content || '暂无内容'}`;
        break;
      case 'volume':
        content = `卷纲标题：${latestData.title}\n卷号：第${latestData.order_index}卷\n\n核心冲突：${latestData.core_conflict || '暂无'}\n\n主要内容：\n${latestData.content || '暂无内容'}\n\n关键事件：\n${getArrayField(latestData, 'key_events').map((e, i) => `${i + 1}. ${e}`).join('\n') || '暂无'}\n\n角色发展：${latestData.character_development || '暂无'}\n\n章节数量：${latestData.chapter_count || '暂无'}`;
        break;
      case 'chapter':
        content = `章纲标题：${latestData.title}\n章节号：第${latestData.order_index}章\n\n核心事件：${latestData.core_event || '暂无'}\n\n主要内容：\n${latestData.content || '暂无内容'}\n\n场景：\n${getArrayField(latestData, 'scenes').map((s, i) => `${i + 1}. ${s}`).join('\n') || '暂无'}\n\n出场角色：\n${getArrayField(latestData, 'characters').map((c, i) => `${i + 1}. ${c}`).join('\n') || '暂无'}\n\n情感目标：${latestData.emotional_goal || '暂无'}\n\n关键词：\n${getArrayField(latestData, 'keywords').map((k, i) => `${i + 1}. ${k}`).join('\n') || '暂无'}\n\n预估字数：${latestData.word_count_estimate || '暂无'}`;
        break;
      default:
        content = '';
    }

    return content;
  };

  // 安全地解析数组字段（可能是JSON字符串或数组）
  const safeParseArray = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  // 获取预览内容（用于显示）
  const getPreviewContent = () => {
    if (isBatchMode && selectedItems.length > 0) {
      return {
        title: `批量选中 (${selectedItems.length} 项)`,
        fields: selectedItems.map((item, index) => ({
          label: `项目 ${index + 1}`,
          value: `${item.type === 'outline' ? '📋' : item.type === 'volume' ? '📚' : '📄'} ${item.data.title}`,
          type: 'text'
        }))
      };
    }

    if (!selectedTarget) return null;

    const { type, data } = selectedTarget;

    switch (type) {
      case 'outline':
        return {
          title: data.title,
          fields: [
            { label: '内容', value: data.content, type: 'text' }
          ]
        };
      case 'volume':
        return {
          title: `${data.title}（第${data.order_index}卷）`,
          fields: [
            { label: '核心冲突', value: data.core_conflict, type: 'text' },
            { label: '主要内容', value: data.content, type: 'text' },
            { label: '关键事件', value: safeParseArray(data.key_events), type: 'list' },
            { label: '角色发展', value: data.character_development, type: 'text' },
            { label: '章节数量', value: data.chapter_count?.toString(), type: 'text' }
          ]
        };
      case 'chapter':
        return {
          title: `${data.title}（第${data.order_index}章）`,
          fields: [
            { label: '核心事件', value: data.core_event, type: 'text' },
            { label: '主要内容', value: data.content, type: 'text' },
            { label: '场景', value: safeParseArray(data.scenes), type: 'list' },
            { label: '出场角色', value: safeParseArray(data.characters), type: 'list' },
            { label: '情感目标', value: data.emotional_goal, type: 'text' },
            { label: '关键词', value: safeParseArray(data.keywords), type: 'list' },
            { label: '预估字数', value: data.word_count_estimate?.toString(), type: 'text' }
          ]
        };
      default:
        return null;
    }
  };

  // 创建版本快照
  const createVersionSnapshot = async () => {
    if (!onCreateVersion) return true;
    
    try {
      let versionData;
      
      if (isBatchMode && selectedItems.length > 0) {
        // 批量模式：为每个选中的项目创建版本
        for (const item of selectedItems) {
          await onCreateVersion({
            type: item.type,
            data: item.data,
            description: `批量修改前的版本快照`
          });
        }
      } else if (selectedTarget) {
        // 单条模式
        await onCreateVersion({
          type: selectedTarget.type,
          data: selectedTarget.data,
          description: `修改前的版本快照`
        });
      }
      
      return true;
    } catch (error) {
      console.error('创建版本快照失败:', error);
      return false;
    }
  };

  // 发送消息
  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    // 检查是否有选中的目标
    if (isBatchMode) {
      if (selectedItems.length === 0) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '请先选择要修改的项目（在批量模式下勾选左侧项目）',
          timestamp: new Date()
        }]);
        return;
      }
    } else {
      if (!selectedTarget) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '请先选择要修改的项目',
          timestamp: new Date()
        }]);
        return;
      }
    }

    const userMessage = {
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setPendingChanges(null);

    // 构建上下文
    const context = getTargetContent();

    // 调用父组件的onSendMessage
    if (onSendMessage) {
      try {
        const targetType = isBatchMode ? 'batch' : selectedTarget?.type;
        const targetData = isBatchMode ? selectedItems : selectedTarget?.data;
        
        const response = await onSendMessage({
          message: inputValue,
          targetType: targetType,
          targetData: targetData,
          context: context,
          history: messages.filter(m => m.role !== 'system'),
          isBatchMode: isBatchMode
        });

        if (response) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: response,
            timestamp: new Date(),
            hasActions: true
          }]);
          
          setPendingChanges({
            type: isBatchMode ? 'batch' : selectedTarget?.type,
            data: isBatchMode ? selectedItems : selectedTarget?.data,
            modifiedContent: response,
            isBatchMode: isBatchMode
          });
        }
      } catch (error) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '抱歉，处理您的请求时出现了错误。请稍后重试。',
          timestamp: new Date()
        }]);
      }
    }
  };

  // 处理按键
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 采纳修改
  const handleApplyChanges = async () => {
    if (!pendingChanges || !onApplyChanges) return;

    setIsApplying(true);
    
    // 先创建版本快照
    const versionCreated = await createVersionSnapshot();
    if (!versionCreated) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ 创建版本快照失败，修改已取消。',
        timestamp: new Date()
      }]);
      setIsApplying(false);
      return;
    }
    
    try {
      const result = await onApplyChanges({
        type: pendingChanges.type,
        data: pendingChanges.data,
        modifiedContent: pendingChanges.modifiedContent,
        isBatchMode: pendingChanges.isBatchMode
      });

      // 处理新的返回格式
      if (result && result.success) {
        const totalCount = result.results.length;
        const successCount = result.results.filter(r => r).length;
        
        let message = '';
        if (isBatchMode) {
          message = `✅ 批量修改完成！\n成功：${successCount}/${totalCount} 项\n💾 已自动创建版本快照。`;
        } else {
          message = `✅ 修改已成功保存！\n💾 已自动创建版本快照，可在版本管理中查看历史记录。`;
        }
        
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: message,
          timestamp: new Date()
        }]);
        setPendingChanges(null);
        
        // 批量模式下清空选中
        if (isBatchMode) {
          setSelectedItems([]);
        }
      } else {
        // 部分失败的情况
        if (result && result.errors && result.errors.length > 0) {
          const failedCount = result.errors.length;
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `⚠️ 部分保存失败！\n失败项目数：${failedCount}\n请检查网络连接后重试。`,
            timestamp: new Date()
          }]);
        } else {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: '❌ 保存失败，请重试。',
            timestamp: new Date()
          }]);
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ 保存时发生错误：' + error.message,
        timestamp: new Date()
      }]);
    } finally {
      setIsApplying(false);
    }
  };

  // 放弃修改
  const handleDiscardChanges = () => {
    setPendingChanges(null);
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '已放弃本次修改。您还可以继续提出其他修改需求。',
      timestamp: new Date()
    }]);
  };

  // 继续修改
  const handleContinueEdit = () => {
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '请告诉我您还希望进行哪些调整？',
      timestamp: new Date()
    }]);
  };

  // 清空批量选择
  const handleClearBatchSelection = () => {
    setSelectedItems([]);
  };

  // 生成全局修改策略
  const generateGlobalStrategy = async () => {
    if (!inputValue.trim() || selectedItems.length === 0) return null;

    const itemNames = selectedItems.map((item, index) => `${index + 1}. ${item.data.title}`).join('\n');

    const strategyPrompt = `请根据用户的批量修改需求，生成一份全局修改策略文档。

待修改的项目列表：
${itemNames}

用户的修改需求：
${inputValue}

请生成一份全局策略，包含以下内容：
1. 修改目标：明确本次修改的核心目标
2. 命名规则：如有替换命名，说明替换规则和对应关系
3. 风格要求：保持什么样的风格一致性
4. 一致性约束：确保各项目之间保持一致的规则
5. 示例：给出1-2个具体的修改示例

重要：请直接返回纯文本格式的策略文档，不要返回JSON格式。用中文回复，策略要具体、可执行。`;

    try {
      const response = await onSendMessage({
        type: 'strategy',
        message: strategyPrompt,
        targetType: 'strategy',
        targetData: { items: selectedItems.map(i => i.data.title) },
        context: `待修改项目：\n${itemNames}`,
        isBatchMode: false
      });

      return response;
    } catch (error) {
      console.error('生成全局策略失败:', error);
      return null;
    }
  };

  // 获取最新的项目数据
  const getLatestItemData = (item) => {
    if (!item || !item.data) {
      console.error('getLatestItemData: item或item.data为空', item);
      return item?.data || {};
    }
    
    const { type, data } = item;
    const itemId = data.id;
    
    if (!itemId) {
      console.error('getLatestItemData: data.id为空', data);
      return data;
    }
    
    if (type === 'chapter') {
      // 优先从propChapters中查找（父组件会更新），其次从allChapters中查找
      const latestFromProps = propChapters.find(c => c.id === itemId);
      if (latestFromProps) {
        console.log('getLatestItemData: 从propChapters找到最新数据', latestFromProps);
        return latestFromProps;
      }
      const latestFromAll = allChapters.find(c => c.id === itemId);
      if (latestFromAll) {
        console.log('getLatestItemData: 从allChapters找到数据', latestFromAll);
        return latestFromAll;
      }
      console.log('getLatestItemData: 使用原始数据', data);
      return data;
    } else if (type === 'volume') {
      const latestVolume = volumes.find(v => v.id === itemId);
      if (latestVolume) {
        console.log('getLatestItemData: 从volumes找到最新数据', latestVolume);
        return latestVolume;
      }
      return data;
    } else if (type === 'outline') {
      const latestOutline = outlines.find(o => o.id === itemId);
      if (latestOutline) {
        console.log('getLatestItemData: 从outlines找到最新数据', latestOutline);
        return latestOutline;
      }
      return data;
    }
    return data;
  };

  // 串行逐个处理批量修改
  const processBatchSequentially = async () => {
    if (!inputValue.trim() || selectedItems.length === 0) return;

    // 初始化批量处理状态
    setBatchState({
      isProcessing: true,
      currentIndex: 0,
      totalCount: selectedItems.length,
      results: [],
      globalStrategy: null,
      isPaused: false
    });

    // 添加系统消息
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `开始批量修改，共 ${selectedItems.length} 个项目...\n第一步：生成全局修改策略`,
      timestamp: new Date()
    }]);

    // 1. 生成全局策略
    const globalStrategy = await generateGlobalStrategy();
    if (!globalStrategy) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ 生成全局策略失败，批量修改已取消。',
        timestamp: new Date()
      }]);
      setBatchState(prev => ({ ...prev, isProcessing: false }));
      return;
    }

    setBatchState(prev => ({ ...prev, globalStrategy }));
    
    // 确保globalStrategy是字符串
    const strategyText = typeof globalStrategy === 'string' ? globalStrategy : JSON.stringify(globalStrategy);
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `✅ 全局策略已生成\n\n${strategyText.substring(0, 300)}...\n\n开始逐个修改项目...`,
      timestamp: new Date()
    }]);

    // 2. 逐个处理
    const results = [];
    for (let i = 0; i < selectedItems.length; i++) {
      // 检查是否暂停
      if (batchState.isPaused) {
        setBatchState(prev => ({ ...prev, currentIndex: i }));
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `⏸️ 批量修改已暂停，已完成 ${i}/${selectedItems.length} 个项目。`,
          timestamp: new Date()
        }]);
        return;
      }

      // 更新当前索引
      setBatchState(prev => ({ ...prev, currentIndex: i + 1 }));

      // 获取最新的项目数据
      const latestItem = {
        ...selectedItems[i],
        data: getLatestItemData(selectedItems[i])
      };
      const itemContent = getSingleItemContent(latestItem);

      // 构建单条修改提示词
      // 确保globalStrategy是字符串
      const strategyContent = typeof globalStrategy === 'string' ? globalStrategy : JSON.stringify(globalStrategy, null, 2);
      const singlePrompt = `全局修改策略：
${strategyContent}

请根据以上策略，修改以下内容（项目 ${i + 1}/${selectedItems.length}）：

${itemContent}

要求：
1. 严格遵循全局策略
2. 保持字段完整性，返回所有字段
3. 使用固定格式返回`;

      let response = null;
      try {
        // 发送修改请求
        response = await onSendMessage({
          type: 'single',
          message: singlePrompt,
          targetType: latestItem.type,
          targetData: latestItem.data,
          context: itemContent,
          globalStrategy: globalStrategy,
          isBatchMode: false
        });

        if (response) {
          // 创建版本快照
          if (onCreateVersion) {
            await onCreateVersion({
              type: latestItem.type,
              data: latestItem.data,
              description: `批量修改第 ${i + 1} 项前的版本快照`
            });
          }

          // 应用修改
          const applyResult = await onApplyChanges({
            type: latestItem.type,
            data: latestItem.data,
            modifiedContent: response,
            isBatchMode: false
          });

          results.push({
            index: i,
            item: latestItem,
            success: applyResult && applyResult.success
          });

          // 添加进度消息（包含完整AI输出内容）
          const aiOutputSection = response ? `\n\n【AI输出内容】\n${response}` : '';
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `${applyResult && applyResult.success ? '✅' : '❌'} 项目 ${i + 1}/${selectedItems.length}：${latestItem.data.title} ${applyResult && applyResult.success ? '修改成功' : '修改失败'}${aiOutputSection}`,
            timestamp: new Date()
          }]);
        }
      } catch (error) {
        console.error(`处理项目 ${i + 1} 失败:`, error);
        results.push({
          index: i,
          item: latestItem,
          success: false,
          error: error.message
        });

        const aiOutputSection = response ? `\n\n【AI输出内容】\n${response}` : '';
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `❌ 项目 ${i + 1}/${selectedItems.length}：${latestItem.data.title} 处理失败 - ${error.message}${aiOutputSection}`,
          timestamp: new Date()
        }]);
      }

      // 添加延迟，避免请求过快
      if (i < selectedItems.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // 完成
    const successCount = results.filter(r => r.success).length;
    setBatchState(prev => ({
      ...prev,
      isProcessing: false,
      results: results
    }));

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `🎉 批量修改完成！\n成功：${successCount}/${selectedItems.length} 项\n💾 已自动创建版本快照。`,
      timestamp: new Date()
    }]);

    // 清空选中
    setSelectedItems([]);
  };

  // 暂停/继续批量处理
  const togglePauseBatch = () => {
    setBatchState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  // 取消批量处理
  const cancelBatch = () => {
    setBatchState({
      isProcessing: false,
      currentIndex: 0,
      totalCount: 0,
      results: [],
      globalStrategy: null,
      isPaused: false
    });
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '批量修改已取消。',
      timestamp: new Date()
    }]);
  };

  // 获取单个项目内容
  const getSingleItemContent = (item) => {
    if (!item || !item.data) {
      console.error('getSingleItemContent: item或item.data为空', item);
      return '';
    }
    
    const { type, data } = item;
    
    if (!data.id) {
      console.error('getSingleItemContent: data.id为空', data);
    }
    
    const getArrayField = (fieldName) => {
      const value = data[fieldName];
      if (!value) return [];
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          return [];
        }
      }
      return [];
    };

    let content = '';
    switch (type) {
      case 'outline':
        content = `类型：大纲\n标题：${data.title}\n内容：${data.content || '暂无内容'}`;
        break;
      case 'volume':
        content = `类型：卷纲\n标题：${data.title}\n卷号：第${data.order_index}卷\n核心冲突：${data.core_conflict || '暂无'}\n主要内容：${data.content || '暂无内容'}\n关键事件：\n${getArrayField('key_events').map((e, i) => `- ${e}`).join('\n') || '暂无'}\n角色发展：${data.character_development || '暂无'}\n章节数量：${data.chapter_count || '暂无'}`;
        break;
      case 'chapter':
        content = `类型：章纲\n标题：${data.title}\n章节号：第${data.order_index}章\n核心事件：${data.core_event || '暂无'}\n主要内容：${data.content || '暂无内容'}\n场景：\n${getArrayField('scenes').map((s, i) => `- ${s}`).join('\n') || '暂无'}\n出场角色：\n${getArrayField('characters').map((c, i) => `- ${c}`).join('\n') || '暂无'}\n情感目标：${data.emotional_goal || '暂无'}\n关键词：\n${getArrayField('keywords').map((k, i) => `- ${k}`).join('\n') || '暂无'}\n预估字数：${data.word_count_estimate || '暂无'}`;
        break;
    }
    return content;
  };

  // 渲染树形结构
  const renderTree = () => {
    const data = getTargetData();

    if (targetType === 'outline') {
      return (
        <div className="tree-list">
          {data.map(outline => (
            <div key={outline.id} className="tree-item">
              <div
                className={`tree-item-header ${selectedTarget?.data?.id === outline.id && !isBatchMode ? 'selected' : ''} ${isItemSelected('outline', outline.id) ? 'batch-selected' : ''}`}
                onClick={() => handleSelectTarget('outline', outline)}
              >
                {isBatchMode && (
                  <input
                    type="checkbox"
                    checked={isItemSelected('outline', outline.id)}
                    onChange={() => {}}
                    className="batch-checkbox"
                  />
                )}
                <span className="tree-item-icon">📋</span>
                <span className="tree-item-title">{outline.title}</span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (targetType === 'volume') {
      return (
        <div className="tree-list">
          {outlines?.map(outline => (
            <div key={outline.id} className="tree-item">
              <div
                className="tree-item-header"
                onClick={() => toggleExpand(outline.id)}
              >
                <span className="tree-item-expand">▶</span>
                <span className="tree-item-icon">📋</span>
                <span className="tree-item-title">{outline.title}</span>
              </div>
              {expandedItems.has(outline.id) && (
                <div className="tree-children">
                  {volumes
                    ?.filter(v => v.outline_id === outline.id)
                    .map(volume => (
                      <div
                        key={volume.id}
                        className={`tree-item-header ${selectedTarget?.data?.id === volume.id && !isBatchMode ? 'selected' : ''} ${isItemSelected('volume', volume.id) ? 'batch-selected' : ''}`}
                        onClick={() => handleSelectTarget('volume', volume)}
                      >
                        {isBatchMode && (
                          <input
                            type="checkbox"
                            checked={isItemSelected('volume', volume.id)}
                            onChange={() => {}}
                            className="batch-checkbox"
                          />
                        )}
                        <span className="tree-item-icon">📚</span>
                        <span className="tree-item-title">第{volume.order_index}卷 {volume.title}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (targetType === 'chapter') {
      const chaptersToUse = allChapters.length > 0 ? allChapters : (propChapters || []);

      return (
        <div className="tree-list">
          {isLoadingChapters ? (
            <div className="tree-loading">加载中...</div>
          ) : (
            volumes?.map(volume => (
              <div key={volume.id} className="tree-item">
                <div
                  className="tree-item-header"
                  onClick={() => toggleExpand(volume.id)}
                >
                  <span className={`tree-item-expand ${expandedItems.has(volume.id) ? 'expanded' : ''}`}>▶</span>
                  <span className="tree-item-icon">📚</span>
                  <span className="tree-item-title">第{volume.order_index}卷 {volume.title}</span>
                </div>
                {expandedItems.has(volume.id) && (
                  <div className="tree-children">
                    {chaptersToUse
                      ?.filter(c => c.volume_id === volume.id)
                      .map(chapter => (
                        <div
                          key={chapter.id}
                          className={`tree-item-header ${selectedTarget?.data?.id === chapter.id && !isBatchMode ? 'selected' : ''} ${isItemSelected('chapter', chapter.id) ? 'batch-selected' : ''}`}
                          onClick={() => handleSelectTarget('chapter', chapter)}
                        >
                          {isBatchMode && (
                            <input
                              type="checkbox"
                              checked={isItemSelected('chapter', chapter.id)}
                              onChange={() => {}}
                              className="batch-checkbox"
                            />
                          )}
                          <span className="tree-item-icon">📄</span>
                          <span className="tree-item-title">第{chapter.order_index}章 {chapter.title}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      );
    }
  };

  // 渲染预览内容
  const renderPreview = () => {
    const preview = getPreviewContent();
    if (!preview) return null;

    return (
      <div className="content-preview">
        <div className="preview-header" onClick={() => setShowPreview(!showPreview)}>
          <span className="preview-icon">👁️</span>
          <span className="preview-title">内容预览</span>
          <span className={`preview-toggle ${showPreview ? 'expanded' : ''}`}>▼</span>
        </div>
        {showPreview && (
          <div className="preview-body">
            <div className="preview-title-bar">{preview.title}</div>
            {preview.fields.map((field, index) => (
              <div key={index} className="preview-field">
                <div className="preview-field-label">{field.label}</div>
                <div className="preview-field-value">
                  {field.type === 'list' ? (
                    field.value && field.value.length > 0 ? (
                      <ul>
                        {field.value.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="preview-empty">暂无</span>
                    )
                  ) : (
                    field.value || <span className="preview-empty">暂无</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="ai-chat-modal-overlay" onClick={onClose}>
      <div className="ai-chat-modal" onClick={e => e.stopPropagation()}>
        {/* 头部 */}
        <div className="ai-chat-header">
          <h3>🤖 AI大纲修改助手</h3>
          <div className="ai-chat-header-actions">
            {/* 批量模式切换 */}
            <label className="batch-mode-toggle">
              <input
                type="checkbox"
                checked={isBatchMode}
                onChange={(e) => {
                  setIsBatchMode(e.target.checked);
                  setSelectedItems([]);
                  setSelectedTarget(null);
                }}
              />
              <span>批量模式</span>
            </label>
            <button className="ai-chat-close-btn" onClick={onClose}>×</button>
          </div>
        </div>

        {/* 主体 */}
        <div className="ai-chat-body">
          {/* 左侧选择区域 */}
          <div className="ai-chat-sidebar">
            <div className="sidebar-header">
              <h4>{isBatchMode ? '批量选择要修改的内容' : '选择要修改的内容'}</h4>
              
              {/* 批量模式下的选中统计 */}
              {isBatchMode && (
                <div className="batch-stats">
                  已选择 {selectedItems.length} 项
                  {selectedItems.length > 0 && (
                    <button className="clear-batch-btn" onClick={handleClearBatchSelection}>
                      清空
                    </button>
                  )}
                </div>
              )}
              
              <div className="target-type-selector">
                <button
                  className={`target-type-btn ${targetType === 'outline' ? 'active' : ''}`}
                  onClick={() => setTargetType('outline')}
                >
                  大纲
                </button>
                <button
                  className={`target-type-btn ${targetType === 'volume' ? 'active' : ''}`}
                  onClick={() => setTargetType('volume')}
                >
                  卷纲
                </button>
                <button
                  className={`target-type-btn ${targetType === 'chapter' ? 'active' : ''}`}
                  onClick={() => setTargetType('chapter')}
                >
                  章纲
                </button>
              </div>
            </div>

            <div className="sidebar-content">
              {renderTree()}
            </div>

            {/* 内容预览 */}
            {(selectedTarget || (isBatchMode && selectedItems.length > 0)) && renderPreview()}

            {selectedTarget && !isBatchMode && (
              <div className="selected-info">
                <div className="selected-info-label">当前选中：</div>
                <div className="selected-info-title">
                  {selectedTarget.type === 'outline' ? '📋' :
                   selectedTarget.type === 'volume' ? '📚' : '📄'}
                  {selectedTarget.data.title}
                </div>
              </div>
            )}
          </div>

          {/* 右侧聊天区域 */}
          <div className="ai-chat-main">
            <div className="ai-chat-messages">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`chat-message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
                >
                  <div className="message-avatar">
                    {message.role === 'user' ? '👤' : '🤖'}
                  </div>
                  <div className="message-content-wrapper">
                    <div className="message-header">
                      {message.role === 'user' ? '我' : 'AI助手'}
                    </div>
                    <div className="message-bubble">
                      {message.content}
                    </div>
                    {/* AI 回复的操作按钮 */}
                    {message.role === 'assistant' && message.hasActions && pendingChanges && (
                      <div className="message-actions">
                        <button
                          className="message-action-btn apply-btn"
                          onClick={handleApplyChanges}
                          disabled={isApplying}
                        >
                          {isApplying ? '保存中...' : '✅ 采纳修改'}
                        </button>
                        <button
                          className="message-action-btn continue-btn"
                          onClick={handleContinueEdit}
                          disabled={isApplying}
                        >
                          💬 继续调整
                        </button>
                        <button
                          className="message-action-btn discard-btn"
                          onClick={handleDiscardChanges}
                          disabled={isApplying}
                        >
                          ❌ 放弃
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="loading-indicator">
                  <div className="loading-dots">
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                  </div>
                  <span>AI正在思考...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="ai-chat-input-area">
              {/* 批量处理进度显示 */}
              {isBatchMode && batchState.isProcessing && (
                <div className="batch-progress">
                  <div className="batch-progress-header">
                    <span className="batch-progress-title">批量修改进度</span>
                    <span className="batch-progress-count">
                      {batchState.currentIndex}/{batchState.totalCount}
                    </span>
                  </div>
                  <div className="batch-progress-bar">
                    <div 
                      className="batch-progress-fill"
                      style={{ width: `${(batchState.currentIndex / batchState.totalCount) * 100}%` }}
                    />
                  </div>
                  <div className="batch-progress-controls">
                    {batchState.isPaused ? (
                      <button className="batch-control-btn continue" onClick={togglePauseBatch}>
                        ▶️ 继续
                      </button>
                    ) : (
                      <button className="batch-control-btn pause" onClick={togglePauseBatch}>
                        ⏸️ 暂停
                      </button>
                    )}
                    <button className="batch-control-btn cancel" onClick={cancelBatch}>
                      ⏹️ 取消
                    </button>
                  </div>
                </div>
              )}

              {!selectedTarget && !isBatchMode ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📋</div>
                  <div className="empty-state-text">
                    请先在左侧选择要修改的大纲、卷纲或章纲
                  </div>
                </div>
              ) : isBatchMode && selectedItems.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">☑️</div>
                  <div className="empty-state-text">
                    批量模式下，请勾选左侧要修改的项目
                  </div>
                </div>
              ) : isBatchMode && !batchState.isProcessing ? (
                <div className="ai-chat-input-wrapper">
                  <textarea
                    className="ai-chat-textarea"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`请输入批量修改要求，例如：\n• 将所有选中的章节主角名字改为"李明"\n• 统一调整场景描述风格\n• 批量添加情感描写...`}
                    disabled={isLoading}
                  />
                  <button
                    className="ai-chat-send-btn batch-start-btn"
                    onClick={processBatchSequentially}
                    disabled={!inputValue.trim() || isLoading}
                  >
                    🚀 开始批量修改 ({selectedItems.length}项)
                  </button>
                </div>
              ) : isBatchMode && batchState.isProcessing ? (
                <div className="batch-processing-info">
                  <div className="batch-current-item">
                    正在处理：{selectedItems[batchState.currentIndex - 1]?.data.title || '...'}
                  </div>
                </div>
              ) : (
                <div className="ai-chat-input-wrapper">
                  <textarea
                    className="ai-chat-textarea"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="请输入您的修改要求，例如：\n• 调整主线剧情，增加更多冲突\n• 修改角色设定，让主角更有个性\n• 优化章节结构，增强节奏感..."
                    disabled={isLoading}
                  />
                  <button
                    className="ai-chat-send-btn"
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isLoading}
                  >
                    {isLoading ? '发送中...' : '发送'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;

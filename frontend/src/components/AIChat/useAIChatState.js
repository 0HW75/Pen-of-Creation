import { useState, useEffect, useRef, useCallback } from 'react';

export const useAIChatState = ({
  projectId,
  outlines,
  volumes,
  chapters: propChapters,
  selectedOutline,
  selectedVolume,
  selectedChapter,
  onSendMessage,
  onApplyChanges,
  onCreateVersion
}) => {
  const [targetType, setTargetType] = useState('outline');
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [pendingChanges, setPendingChanges] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [allChapters, setAllChapters] = useState([]);
  const [isLoadingChapters, setIsLoadingChapters] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [batchState, setBatchState] = useState({
    isProcessing: false,
    currentIndex: 0,
    totalCount: 0,
    results: [],
    globalStrategy: null,
    isPaused: false
  });
  const messagesEndRef = useRef(null);

  const loadAllChapters = useCallback(async () => {
    if (!projectId) return;
    setIsLoadingChapters(true);
    try {
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}/chapters`);
      if (response.ok) {
        const data = await response.json();
        setAllChapters(data || []);
      }
    } catch (error) {
      console.error('加载所有章纲失败:', error);
    } finally {
      setIsLoadingChapters(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId && targetType === 'chapter' && allChapters.length === 0 && !isLoadingChapters) {
      loadAllChapters();
    }
  }, [projectId, targetType, allChapters.length, isLoadingChapters, loadAllChapters]);

  const getTargetData = useCallback(() => {
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
  }, [targetType, outlines, volumes, allChapters, propChapters]);

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

  const getSingleItemContent = useCallback((item) => {
    if (!item || !item.data) return '';

    const { type, data } = item;

    const getArrField = (fieldName) => {
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
        content = `类型：卷纲\n标题：${data.title}\n卷号：第${data.order_index}卷\n核心冲突：${data.core_conflict || '暂无'}\n主要内容：${data.content || '暂无内容'}\n关键事件：\n${getArrField('key_events').map((e, i) => `- ${e}`).join('\n') || '暂无'}\n角色发展：${data.character_development || '暂无'}\n章节数量：${data.chapter_count || '暂无'}`;
        break;
      case 'chapter':
        content = `类型：章纲\n标题：${data.title}\n章节号：第${data.order_index}章\n核心事件：${data.core_event || '暂无'}\n主要内容：${data.content || '暂无内容'}\n场景：\n${getArrField('scenes').map((s, i) => `- ${s}`).join('\n') || '暂无'}\n出场角色：\n${getArrField('characters').map((c, i) => `- ${c}`).join('\n') || '暂无'}\n情感目标：${data.emotional_goal || '暂无'}\n关键词：\n${getArrField('keywords').map((k, i) => `- ${k}`).join('\n') || '暂无'}\n预估字数：${data.word_count_estimate || '暂无'}`;
        break;
    }
    return content;
  }, []);

  const getTargetContent = useCallback(() => {
    if (isBatchMode && selectedItems.length > 0) {
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

    let latestData = data;
    if (type === 'chapter') {
      const chapterId = data.id;
      const foundChapter = propChapters?.find(c => c.id === chapterId) ||
        allChapters.find(c => c.id === chapterId);
      if (foundChapter) latestData = foundChapter;
    } else if (type === 'volume') {
      const volumeId = data.id;
      const foundVolume = volumes?.find(v => v.id === volumeId);
      if (foundVolume) latestData = foundVolume;
    } else if (type === 'outline') {
      const outlineId = data.id;
      const foundOutline = outlines?.find(o => o.id === outlineId);
      if (foundOutline) latestData = foundOutline;
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
  }, [isBatchMode, selectedItems, selectedTarget, propChapters, allChapters, volumes, outlines]);

  const getPreviewContent = useCallback(() => {
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
  }, [isBatchMode, selectedItems, selectedTarget]);

  const getLatestItemData = useCallback((item) => {
    if (!item || !item.data) return item?.data || {};

    const { type, data } = item;
    const itemId = data.id;

    if (!itemId) return data;

    if (type === 'chapter') {
      const latestFromProps = propChapters?.find(c => c.id === itemId);
      if (latestFromProps) return latestFromProps;
      const latestFromAll = allChapters.find(c => c.id === itemId);
      if (latestFromAll) return latestFromAll;
      return data;
    } else if (type === 'volume') {
      const latestVolume = volumes?.find(v => v.id === itemId);
      if (latestVolume) return latestVolume;
      return data;
    } else if (type === 'outline') {
      const latestOutline = outlines?.find(o => o.id === itemId);
      if (latestOutline) return latestOutline;
      return data;
    }
    return data;
  }, [propChapters, allChapters, volumes, outlines]);

  return {
    targetType,
    setTargetType,
    selectedTarget,
    setSelectedTarget,
    messages,
    setMessages,
    inputValue,
    setInputValue,
    expandedItems,
    setExpandedItems,
    pendingChanges,
    setPendingChanges,
    isApplying,
    setIsApplying,
    showPreview,
    setShowPreview,
    allChapters,
    isLoadingChapters,
    isBatchMode,
    setIsBatchMode,
    selectedItems,
    setSelectedItems,
    batchState,
    setBatchState,
    messagesEndRef,
    loadAllChapters,
    getTargetData,
    safeParseArray,
    getArrayField,
    getSingleItemContent,
    getTargetContent,
    getPreviewContent,
    getLatestItemData,
  };
};

export default useAIChatState;

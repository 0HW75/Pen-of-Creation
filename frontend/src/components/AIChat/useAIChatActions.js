import { useCallback } from 'react';

export const useAIChatActions = ({
  messages,
  setMessages,
  inputValue,
  setInputValue,
  pendingChanges,
  setPendingChanges,
  selectedTarget,
  selectedItems,
  isBatchMode,
  batchState,
  setBatchState,
  onSendMessage,
  onApplyChanges,
  onCreateVersion,
  getTargetContent,
  getSingleItemContent,
  getLatestItemData,
  isApplying,
  setIsApplying,
  allChapters,
  propChapters,
  volumes,
  outlines
}) => {

  const createVersionSnapshot = async () => {
    if (!onCreateVersion) return true;

    try {
      if (isBatchMode && selectedItems.length > 0) {
        for (const item of selectedItems) {
          await onCreateVersion({
            type: item.type,
            data: item.data,
            description: `批量修改前的版本快照`
          });
        }
      } else if (selectedTarget) {
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

  const handleSend = useCallback(async () => {
    if (!inputValue.trim()) return;

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

    const context = getTargetContent();

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
  }, [inputValue, isBatchMode, selectedItems, selectedTarget, messages, getTargetContent, onSendMessage, setMessages, setInputValue, setPendingChanges]);

  const handleApplyChanges = useCallback(async () => {
    if (!pendingChanges || !onApplyChanges) return;

    setIsApplying(true);

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

        if (isBatchMode) {
          setSelectedItems([]);
        }
      } else {
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
  }, [pendingChanges, onApplyChanges, createVersionSnapshot, isBatchMode, setMessages, setPendingChanges, setIsApplying, setSelectedItems]);

  const handleDiscardChanges = useCallback(() => {
    setPendingChanges(null);
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '已放弃本次修改。您还可以继续提出其他修改需求。',
      timestamp: new Date()
    }]);
  }, [setPendingChanges, setMessages]);

  const handleContinueEdit = useCallback(() => {
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '请告诉我您还希望进行哪些调整？',
      timestamp: new Date()
    }]);
  }, [setMessages]);

  const generateGlobalStrategy = useCallback(async () => {
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
  }, [inputValue, selectedItems, onSendMessage]);

  const processBatchSequentially = useCallback(async () => {
    if (!inputValue.trim() || selectedItems.length === 0) return;

    setBatchState({
      isProcessing: true,
      currentIndex: 0,
      totalCount: selectedItems.length,
      results: [],
      globalStrategy: null,
      isPaused: false
    });

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `开始批量修改，共 ${selectedItems.length} 个项目...\n第一步：生成全局修改策略`,
      timestamp: new Date()
    }]);

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

    const strategyText = typeof globalStrategy === 'string' ? globalStrategy : JSON.stringify(globalStrategy);
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `✅ 全局策略已生成\n\n${strategyText.substring(0, 300)}...\n\n开始逐个修改项目...`,
      timestamp: new Date()
    }]);

    const results = [];
    for (let i = 0; i < selectedItems.length; i++) {
      if (batchState.isPaused) {
        setBatchState(prev => ({ ...prev, currentIndex: i }));
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `⏸️ 批量修改已暂停，已完成 ${i}/${selectedItems.length} 个项目。`,
          timestamp: new Date()
        }]);
        return;
      }

      setBatchState(prev => ({ ...prev, currentIndex: i + 1 }));

      const latestItem = {
        ...selectedItems[i],
        data: getLatestItemData(selectedItems[i])
      };
      const itemContent = getSingleItemContent(latestItem);

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
          if (onCreateVersion) {
            await onCreateVersion({
              type: latestItem.type,
              data: latestItem.data,
              description: `批量修改第 ${i + 1} 项前的版本快照`
            });
          }

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

      if (i < selectedItems.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

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

    setSelectedItems([]);
  }, [inputValue, selectedItems, generateGlobalStrategy, batchState.isPaused, getLatestItemData, getSingleItemContent, onSendMessage, onCreateVersion, onApplyChanges, setBatchState, setMessages, setSelectedItems]);

  const togglePauseBatch = useCallback(() => {
    setBatchState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, [setBatchState]);

  const cancelBatch = useCallback(() => {
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
  }, [setBatchState, setMessages]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleClearBatchSelection = useCallback(() => {
    setSelectedItems([]);
  }, [setSelectedItems]);

  return {
    handleSend,
    handleApplyChanges,
    handleDiscardChanges,
    handleContinueEdit,
    handleKeyDown,
    handleClearBatchSelection,
    generateGlobalStrategy,
    processBatchSequentially,
    togglePauseBatch,
    cancelBatch,
  };
};

export default useAIChatActions;

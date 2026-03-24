import { useState, useCallback } from 'react';
import { projectApi } from '../services/api';

export const useBlueprintModals = (projectInfo) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isSystemPromptOpen, setIsSystemPromptOpen] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');

  const handleOpenEditModal = useCallback(() => {
    if (projectInfo) {
      setEditFormData({ ...projectInfo });
      setIsEditModalOpen(true);
    }
  }, [projectInfo]);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
  }, []);

  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleOpenAIChat = useCallback((selectedOutline) => {
    if (!selectedOutline) {
      console.log('请先选择一个大纲');
      return;
    }
    setChatMessages([
      {
        role: 'assistant',
        content: `您好！我是您的大纲修改助手。我可以帮助您修改当前大纲《${selectedOutline.title}》。请告诉我您希望如何修改大纲，例如：更改主线剧情、添加新的次要情节、调整关键事件顺序等。`
      }
    ]);
    setIsAIChatOpen(true);
  }, []);

  const handleCloseAIChat = useCallback(() => {
    setIsAIChatOpen(false);
  }, []);

  const handleOpenSystemPrompt = useCallback(() => {
    setSystemPrompt(`你是一个专业的故事大纲生成专家，擅长根据项目信息创建详细、有深度的故事大纲。你的输出必须严格遵循指定的格式，确保结构清晰、内容完整，并且格式一致性高。\n\n请按照以下固定格式生成大纲：\n1. 使用Markdown格式输出\n2. 标题层级必须清晰：# 一级标题，## 二级标题，### 三级标题\n3. 必须包含以下章节，且章节顺序不可更改：\n   - ## 1. 主线剧情\n   - ## 2. 次要情节\n   - ## 3. 关键事件\n   - ## 4. 角色弧线\n   - ## 5. 主题\n\n内容要求：\n1. 主线剧情：详细描述故事的主要情节发展，包含起承转合\n2. 次要情节：列出2-3个重要的次要情节，每个次要情节要有标题和简短描述\n3. 关键事件：列出5-7个推动故事发展的关键事件，按时间顺序排列\n4. 角色弧线：描述主要角色的成长和转变，至少包含主角的完整弧线\n5. 主题：深入探讨故事的核心主题，分析其在故事中的体现方式\n\n请确保大纲内容丰富、结构合理，符合所选的故事模型和小说类型。`);
    setIsSystemPromptOpen(true);
  }, []);

  const handleCloseSystemPrompt = useCallback(() => {
    setIsSystemPromptOpen(false);
  }, []);

  const handleSaveSystemPrompt = useCallback(() => {
    localStorage.setItem('outlineSystemPrompt', systemPrompt);
    console.log('保存系统提示词:', systemPrompt);
    setIsSystemPromptOpen(false);
  }, [systemPrompt]);

  return {
    isEditModalOpen,
    setIsEditModalOpen,
    editFormData,
    setEditFormData,
    isAIChatOpen,
    setIsAIChatOpen,
    chatMessages,
    setChatMessages,
    chatInput,
    setChatInput,
    isSystemPromptOpen,
    setIsSystemPromptOpen,
    systemPrompt,
    setSystemPrompt,
    handleOpenEditModal,
    handleCloseEditModal,
    handleFormChange,
    handleOpenAIChat,
    handleCloseAIChat,
    handleOpenSystemPrompt,
    handleCloseSystemPrompt,
    handleSaveSystemPrompt,
  };
};
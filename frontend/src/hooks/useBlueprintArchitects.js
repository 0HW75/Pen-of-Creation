import { useState, useCallback, useEffect } from 'react';

export const useBlueprintArchitects = () => {
  const [worldviewArchitects, setWorldviewArchitects] = useState([]);
  const [isArchitectManagerOpen, setIsArchitectManagerOpen] = useState(false);
  const [selectedArchitect, setSelectedArchitect] = useState(null);
  const [editingArchitect, setEditingArchitect] = useState(null);
  const [architectEditFormData, setArchitectEditFormData] = useState({
    name: '',
    description: '',
    prompt: ''
  });
  const [worldviewStructurePrompt, setWorldviewStructurePrompt] = useState('');
  const [isWorldviewStructureConfigOpen, setIsWorldviewStructureConfigOpen] = useState(false);

  const loadWorldviewArchitects = useCallback(() => {
    const savedArchitects = localStorage.getItem('worldviewArchitects');
    let architects = [];
    
    if (savedArchitects) {
      architects = JSON.parse(savedArchitects);
      
      const hasMaleFrequencyArchitect = architects.some(architect => architect.name === '男频爽文架构师');
      if (!hasMaleFrequencyArchitect) {
        const maleFrequencyArchitect = {
          id: Date.now(),
          name: '男频爽文架构师',
          description: '专注于创作热血、逆袭、打脸、升级的男频爽文大纲',
          prompt: `你是一位顶级男频爽文架构师，精通爽文创作的核心要素，擅长构建节奏紧凑、爽点密集、升级体系清晰的故事大纲。\n\n请按照以下原则生成男频爽文大纲：\n\n1. 主角设定：\n- 平凡起点，有逆袭潜力\n- 强大的金手指/系统/奇遇\n- 坚韧不拔，杀伐果断的性格\n- 明确的成长目标和复仇动机\n\n2. 爽点设计：\n- 逆袭打脸：前期压制主角的反派必须被狠狠打脸\n- 装逼场面：主角实力展示的关键时刻\n- 资源获取：稀有资源的获取过程\n- 地位提升：从底层到上层的身份转变\n- 爽点密度：每章节至少一个爽点\n\n3. 升级体系：\n- 清晰的境界/等级划分\n- 具体的升级条件和资源需求\n- 每个大境界的突破瓶颈\n- 升级后的能力提升和地位变化\n\n4. 剧情节奏：\n- 快节奏，避免拖沓\n- 每1-2万字一个小高潮\n- 每5-10万字一个大高潮\n- 不断引入新的挑战和机遇\n\n5. 角色体系：\n- 各层级的反派，从小喽啰到最终BOSS\n- 忠心耿耿的小弟和伙伴\n- 有魅力的女性角色，合理的感情线\n- 各大势力的实力对比和关系\n\n6. 世界观：\n- 宏大、有等级体系的世界设定\n- 清晰的势力分布\n- 独特的修炼体系或科技体系\n- 隐藏的秘密和宝藏\n\n请确保大纲内容详细、逻辑清晰、爽点密集，适合作为男频爽文的创作基础。`
        };
        architects.push(maleFrequencyArchitect);
        setWorldviewArchitects(architects);
        localStorage.setItem('worldviewArchitects', JSON.stringify(architects));
      } else {
        setWorldviewArchitects(architects);
      }
    } else {
      const defaultArchitects = [
        {
          id: 1,
          name: '经典三幕剧架构师',
          description: '擅长构建传统三幕剧结构的故事大纲',
          prompt: `你是一个经典三幕剧架构师，擅长创作结构严谨的传统故事大纲。\n\n请按照三幕结构生成故事大纲：\n1. 第一幕：介绍人物和世界观，建立冲突\n2. 第二幕：发展冲突，主角面临挑战\n3. 第三幕：高潮和解决\n\n每个部分要有详细的情节发展和角色弧线。`
        },
        {
          id: 2,
          name: '英雄之旅架构师',
          description: '基于约瑟夫·坎贝尔的英雄之旅模式构建故事大纲',
          prompt: `你是一个英雄之旅架构师，擅长基于约瑟夫·坎贝尔的英雄之旅模式构建故事大纲。\n\n请按照英雄之旅的12个阶段生成故事大纲：\n1. 普通世界\n2. 冒险召唤\n3. 拒绝召唤\n4. 遇见导师\n5. 越过第一道门槛\n6. 考验、伙伴、敌人\n7. 接近最深的洞穴\n8. 磨难\n9. 报酬\n10. 回返\n11. 复活\n12. 携万能药回归\n\n每个阶段要有详细的情节描述和角色发展。`
        },
        {
          id: 3,
          name: '类型小说专家',
          description: '专注于特定类型的故事大纲结构',
          prompt: `你是一个类型小说专家，擅长创作符合特定类型规则的故事大纲。\n\n请根据小说类型生成专业的类型故事大纲：\n- 明确类型元素和规则\n- 包含类型特有的情节结构\n- 符合目标读者的期待\n\n确保故事充满类型特色和吸引力。`
        },
        {
          id: 4,
          name: '角色驱动型架构师',
          description: '以角色发展为核心的故事大纲构建',
          prompt: `你是一个角色驱动型架构师，擅长创造以角色发展为核心的故事大纲。\n\n请生成以角色为核心的故事大纲：\n- 详细的角色背景和动机\n- 完整的角色成长弧线\n- 角色关系的发展变化\n- 通过角色的选择推动情节\n\n让角色成为故事的灵魂。`
        },
        {
          id: 5,
          name: '男频爽文架构师',
          description: '专注于创作热血、逆袭、打脸、升级的男频爽文大纲',
          prompt: `你是一位顶级男频爽文架构师，精通爽文创作的核心要素，擅长构建节奏紧凑、爽点密集、升级体系清晰的故事大纲。\n\n请按照以下原则生成男频爽文大纲：\n\n1. 主角设定：\n- 平凡起点，有逆袭潜力\n- 强大的金手指/系统/奇遇\n- 坚韧不拔，杀伐果断的性格\n- 明确的成长目标和复仇动机\n\n2. 爽点设计：\n- 逆袭打脸：前期压制主角的反派必须被狠狠打脸\n- 装逼场面：主角实力展示的关键时刻\n- 资源获取：稀有资源的获取过程\n- 地位提升：从底层到上层的身份转变\n- 爽点密度：每章节至少一个爽点\n\n3. 升级体系：\n- 清晰的境界/等级划分\n- 具体的升级条件和资源需求\n- 每个大境界的突破瓶颈\n- 升级后的能力提升和地位变化\n\n4. 剧情节奏：\n- 快节奏，避免拖沓\n- 每1-2万字一个小高潮\n- 每5-10万字一个大高潮\n- 不断引入新的挑战和机遇\n\n5. 角色体系：\n- 各层级的反派，从小喽啰到最终BOSS\n- 忠心耿耿的小弟和伙伴\n- 有魅力的女性角色，合理的感情线\n- 各大势力的实力对比和关系\n\n6. 世界观：\n- 宏大、有等级体系的世界设定\n- 清晰的势力分布\n- 独特的修炼体系或科技体系\n- 隐藏的秘密和宝藏\n\n请确保大纲内容详细、逻辑清晰、爽点密集，适合作为男频爽文的创作基础。`
        }
      ];
      setWorldviewArchitects(defaultArchitects);
      localStorage.setItem('worldviewArchitects', JSON.stringify(defaultArchitects));
      
      const savedArchitectId = localStorage.getItem('selectedArchitectId');
      if (savedArchitectId) {
        const savedArchitect = defaultArchitects.find(a => a.id === parseInt(savedArchitectId));
        if (savedArchitect) {
          setSelectedArchitect(savedArchitect);
        }
      }
    }
  }, []);

  const handleOpenArchitectManager = useCallback(() => {
    loadWorldviewArchitects();
    setIsArchitectManagerOpen(true);
  }, [loadWorldviewArchitects]);

  const handleCloseArchitectManager = useCallback(() => {
    setIsArchitectManagerOpen(false);
    setEditingArchitect(null);
  }, []);

  const handleSelectArchitect = useCallback((architect) => {
    setSelectedArchitect(architect);
    if (architect) {
      localStorage.setItem('selectedArchitectId', architect.id);
    } else {
      localStorage.removeItem('selectedArchitectId');
    }
  }, []);

  const handleEditArchitect = useCallback((architect) => {
    setEditingArchitect(architect);
    setArchitectEditFormData({
      name: architect.name,
      description: architect.description,
      prompt: architect.prompt
    });
  }, []);

  const handleSaveEditArchitect = useCallback(() => {
    if (!editingArchitect) return;
    
    const updatedArchitects = worldviewArchitects.map(architect => 
      architect.id === editingArchitect.id ? {
        ...architect,
        name: architectEditFormData.name,
        description: architectEditFormData.description,
        prompt: architectEditFormData.prompt
      } : architect
    );
    
    setWorldviewArchitects(updatedArchitects);
    localStorage.setItem('worldviewArchitects', JSON.stringify(updatedArchitects));
    setEditingArchitect(null);
  }, [editingArchitect, worldviewArchitects, architectEditFormData]);

  const handleCancelEditArchitect = useCallback(() => {
    setEditingArchitect(null);
  }, []);

  const handleAddArchitect = useCallback(() => {
    const newArchitect = {
      id: Date.now(),
      name: '新架构师',
      description: '请编辑架构师描述',
      prompt: '请编辑提示词内容'
    };
    const updatedArchitects = [...worldviewArchitects, newArchitect];
    setWorldviewArchitects(updatedArchitects);
    localStorage.setItem('worldviewArchitects', JSON.stringify(updatedArchitects));
  }, [worldviewArchitects]);

  const handleDeleteArchitect = useCallback((architectId) => {
    const updatedArchitects = worldviewArchitects.filter(architect => architect.id !== architectId);
    setWorldviewArchitects(updatedArchitects);
    localStorage.setItem('worldviewArchitects', JSON.stringify(updatedArchitects));
  }, [worldviewArchitects]);

  const handleOpenWorldviewStructureConfig = useCallback(() => {
    const maleFrequencyStructurePrompt = `你是一位精通男频爽文创作的顶级大纲架构师，擅长构建节奏紧凑、爽点密集、升级体系清晰的故事大纲。请按照以下结构为男频爽文生成详细大纲：\n\n## 1. 故事概述\n- 核心概念：明确的金手指/系统/奇遇设定\n- 世界观：宏大、有等级体系的世界设定\n- 爽文基调：热血、逆袭、打脸、升级\n- 目标读者：18-35岁男性读者\n\n## 2. 主角设定\n- 身份背景：平凡起点，有逆袭潜力\n- 金手指：详细的系统/奇遇/特殊能力设定\n- 性格特点：坚韧不拔，有底线，杀伐果断\n- 成长目标：明确的长期和短期目标\n\n## 3. 主线剧情\n- 起：平凡生活的打破，金手指觉醒\n- 承：初步成长，遭遇第一个挑战\n- 转：重大危机，突破瓶颈\n- 合：阶段性胜利，开启新的征程\n- 节奏要求：每1-2万字必须有一个爽点\n\n## 4. 升级体系\n- 等级划分：清晰的境界/等级设定\n- 升级条件：具体的升级要求和资源需求\n- 瓶颈设计：每个大境界的突破难点\n- 升级奖励：升级后的能力提升和地位变化\n\n## 5. 爽点设计\n- 逆袭打脸：具体的反派和打脸场景\n- 装逼场面：主角展示实力的关键时刻\n- 资源获取：稀有资源的获取过程\n- 地位提升：从底层到上层的身份转变\n- 爽点密度：确保每章节至少有一个爽点\n\n## 6. 角色体系\n- 反派设定：各层级的反派，从小喽啰到最终BOSS\n- 配角团队：忠心耿耿的小弟和伙伴\n- 女性角色：有魅力的女性角色，合理的感情线\n- 势力分布：各大势力的实力对比和关系\n\n## 7. 次要情节\n- 支线任务：与主线相关的支线剧情\n- 势力斗争：不同势力之间的冲突\n- 修炼秘境：特殊场景的探险情节\n- 宝物争夺：稀有资源的争夺过程\n\n## 8. 关键事件\n- 金手指觉醒：主角获得特殊能力的过程\n- 第一次打脸：主角首次展示实力\n- 重大危机：主角面临生死挑战\n- 境界突破：关键的等级提升\n- 势力崛起：主角建立自己的势力\n- 复仇情节：对仇人进行报复\n- 终极对决：与最终BOSS的战斗\n\n## 9. 风格与节奏\n- 叙述风格：简洁明快，重点突出爽点\n- 节奏把控：张弛有度，爽点密集\n- 场景转换：流畅自然，避免拖沓\n- 描写重点：战斗场景、装逼场面、升级过程\n\n## 10. 市场定位\n- 同类作品：参考当前热门男频爽文\n- 差异化：故事的独特卖点\n- 读者期待：满足男性读者的爽感需求\n- 连载规划：适合长期连载的剧情设计\n\n请确保大纲内容详细、逻辑清晰、爽点密集，适合作为男频爽文的创作基础。`;
    
    setWorldviewStructurePrompt(maleFrequencyStructurePrompt);
    localStorage.setItem('worldviewStructurePrompt', maleFrequencyStructurePrompt);
    setIsWorldviewStructureConfigOpen(true);
  }, []);

  const handleSaveWorldviewStructureConfig = useCallback(() => {
    localStorage.setItem('worldviewStructurePrompt', worldviewStructurePrompt);
    setIsWorldviewStructureConfigOpen(false);
  }, [worldviewStructurePrompt]);

  const handleCloseWorldviewStructureConfig = useCallback(() => {
    setIsWorldviewStructureConfigOpen(false);
  }, []);

  useEffect(() => {
    const savedStructurePrompt = localStorage.getItem('worldviewStructurePrompt');
    if (savedStructurePrompt) {
      setWorldviewStructurePrompt(savedStructurePrompt);
    }
  }, []);

  return {
    worldviewArchitects,
    setWorldviewArchitects,
    isArchitectManagerOpen,
    setIsArchitectManagerOpen,
    selectedArchitect,
    setSelectedArchitect,
    editingArchitect,
    setEditingArchitect,
    architectEditFormData,
    setArchitectEditFormData,
    worldviewStructurePrompt,
    setWorldviewStructurePrompt,
    isWorldviewStructureConfigOpen,
    setIsWorldviewStructureConfigOpen,
    loadWorldviewArchitects,
    handleOpenArchitectManager,
    handleCloseArchitectManager,
    handleSelectArchitect,
    handleEditArchitect,
    handleSaveEditArchitect,
    handleCancelEditArchitect,
    handleAddArchitect,
    handleDeleteArchitect,
    handleOpenWorldviewStructureConfig,
    handleSaveWorldviewStructureConfig,
    handleCloseWorldviewStructureConfig,
  };
};
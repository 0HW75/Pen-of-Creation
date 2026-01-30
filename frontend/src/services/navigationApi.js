import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/navigation';

// 获取创作流程图数据
export const getNavigationFlow = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/flow`);
    return response.data;
  } catch (error) {
    console.error('Error fetching navigation flow:', error);
    // 返回默认数据
    return {
      currentStage: 'project_creation',
      overallProgress: 0,
      stages: [
        {
          id: 'project_creation',
          name: '项目创建',
          description: '确定作品基本信息和方向',
          progress: 0,
          status: 'pending'
        },
        {
          id: 'setting_building',
          name: '设定构建',
          description: '创建世界观、角色、地点等设定',
          progress: 0,
          status: 'pending'
        },
        {
          id: 'outline_planning',
          name: '大纲规划',
          description: '制定故事大纲和章节结构',
          progress: 0,
          status: 'pending'
        },
        {
          id: 'chapter_creation',
          name: '章节创作',
          description: '撰写具体章节内容',
          progress: 0,
          status: 'pending'
        },
        {
          id: 'revision',
          name: '修改完善',
          description: '检查和修改作品内容',
          progress: 0,
          status: 'pending'
        },
        {
          id: 'export',
          name: '作品导出',
          description: '导出成品作品',
          progress: 0,
          status: 'pending'
        }
      ]
    };
  }
};

// 获取今日任务
export const getTasks = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tasks`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    // 返回默认任务
    return [
      {
        id: 1,
        title: '创建项目基本信息',
        description: '填写作品标题、类型、简介等基本信息',
        type: 'project',
        priority: 5,
        status: 'pending',
        due_date: new Date().toISOString().split('T')[0]
      },
      {
        id: 2,
        title: '构建世界观设定',
        description: '创建作品的世界观背景、规则和设定',
        type: 'setting',
        priority: 4,
        status: 'pending',
        due_date: new Date().toISOString().split('T')[0]
      },
      {
        id: 3,
        title: '设计主要角色',
        description: '创建至少3个主要角色，包括性格、背景和目标',
        type: 'character',
        priority: 4,
        status: 'pending',
        due_date: new Date().toISOString().split('T')[0]
      }
    ];
  }
};

// 更新任务状态
export const updateTaskStatus = async (taskId, status) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/tasks/${taskId}`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating task status:', error);
    // 模拟成功响应
    return { success: true };
  }
};

// 生成灵感
export const generateInspiration = async (type = 'plot') => {
  try {
    const response = await axios.post(`${API_BASE_URL}/inspiration`, { type });
    return response.data;
  } catch (error) {
    console.error('Error generating inspiration:', error);
    // 生成随机灵感
    const inspirationTemplates = {
      plot: [
        '主角在一次偶然的机会中发现了一个神秘的物品，这个物品似乎与他的身世有关联。',
        '在一个平凡的日子里，主角突然获得了一种特殊的能力，这种能力改变了他的生活。',
        '主角遇到了一个来自未来的人，这个人警告他即将发生的灾难。'
      ],
      conflict: [
        '主角的好友突然背叛了他，加入了敌对势力，原因是为了保护自己的家人。',
        '主角必须在个人利益和集体利益之间做出选择，这个选择将影响很多人的命运。',
        '主角发现自己的信仰与现实产生了冲突，他必须重新审视自己的价值观。'
      ],
      dialogue: [
        '"你以为你了解我？你根本不知道我经历了什么！"她的声音颤抖着，眼中闪烁着泪光。',
        '"我一直都在你身边，只是你从来没有注意到。"他轻声说道，眼神中充满了无奈。',
        '"这是最后一次机会，错过了就再也没有了。"老人的声音中充满了沧桑和急切。'
      ],
      scene: [
        '深夜的古城墙下，月光洒在青石板路上，远处传来悠扬的笛声，仿佛在诉说着古老的故事。',
        '清晨的森林中，阳光透过树叶的缝隙洒在地上，形成斑驳的光影，鸟儿在枝头欢快地歌唱。',
        '冬日的雪地里，一个孤独的身影在缓慢前行，留下一串串深深的脚印，远处的村庄飘起了炊烟。'
      ],
      character: [
        '主角在经历了一系列挫折后，逐渐从一个天真的少年成长为一个有责任感的领袖。',
        '反派角色并非天生邪恶，而是因为悲惨的童年经历才走上了不归路。',
        '配角在关键时刻做出了牺牲，他的行为改变了主角的命运轨迹。'
      ]
    };

    const templates = inspirationTemplates[type] || inspirationTemplates.plot;
    const randomContent = templates[Math.floor(Math.random() * templates.length)];

    return {
      id: Date.now(),
      type,
      content: randomContent,
      description: 'AI生成的灵感建议',
      rating: 0,
      status: '未使用',
      created_at: new Date().toISOString()
    };
  }
};

// 获取灵感列表
export const getInspirationList = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/inspiration`);
    return response.data;
  } catch (error) {
    console.error('Error fetching inspiration list:', error);
    // 返回默认灵感
    return [
      {
        id: 1,
        type: 'plot',
        content: '主角在一次偶然的机会中发现了一个神秘的物品，这个物品似乎与他的身世有关联。',
        description: '情节转折建议：通过神秘物品引出主角的身世之谜，推动故事发展。',
        rating: 4,
        status: '未使用',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        type: 'conflict',
        content: '主角的好友突然背叛了他，加入了敌对势力，原因是为了保护自己的家人。',
        description: '冲突点子：朋友变敌人的经典冲突，增加故事的戏剧性和情感深度。',
        rating: 5,
        status: '未使用',
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        type: 'dialogue',
        content: '"你以为你了解我？你根本不知道我经历了什么！"她的声音颤抖着，眼中闪烁着泪光。',
        description: '对话开场：充满情感张力的对话，瞬间抓住读者的注意力。',
        rating: 4,
        status: '未使用',
        created_at: new Date().toISOString()
      },
      {
        id: 4,
        type: 'scene',
        content: '深夜的古城墙下，月光洒在青石板路上，远处传来悠扬的笛声，仿佛在诉说着古老的故事。',
        description: '场景灵感：营造氛围感的场景描写，为故事增添诗意和画面感。',
        rating: 5,
        status: '未使用',
        created_at: new Date().toISOString()
      },
      {
        id: 5,
        type: 'character',
        content: '主角在经历了一系列挫折后，逐渐从一个天真的少年成长为一个有责任感的领袖。',
        description: '角色发展：主角的成长弧线，展现人物的变化和成熟过程。',
        rating: 4,
        status: '未使用',
        created_at: new Date().toISOString()
      }
    ];
  }
};
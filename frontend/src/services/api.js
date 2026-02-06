import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

// 请求缓存
const requestCache = new Map();

// 批量请求队列
const batchRequests = new Map();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 增加到120秒超时设置，AI生成需要更长时间
});

// 请求重试配置
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// 添加请求拦截器
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 添加响应拦截器
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 清除缓存的方法
export const clearCache = () => {
  requestCache.clear();
};

// 批量请求处理
export const batchRequest = async (requests) => {
  const results = [];
  for (const request of requests) {
    try {
      const response = await api(request);
      results.push({ success: true, data: response.data });
    } catch (error) {
      results.push({ success: false, error: error.message });
    }
  }
  return results;
};

// 项目相关API
export const projectApi = {
  getProjects: () => api.get('/projects'),
  getProject: (id) => api.get(`/projects/${id}`),
  createProject: async (data) => {
    const response = await api.post('/projects', data);
    clearCache(); // 清除缓存以确保下次获取最新数据
    return response;
  },
  updateProject: async (id, data) => {
    const response = await api.put(`/projects/${id}`, data);
    clearCache(); // 清除缓存以确保下次获取最新数据
    return response;
  },
  deleteProject: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    clearCache(); // 清除缓存以确保下次获取最新数据
    return response;
  },
  // 情绪板相关API
  getEmotionBoard: (projectId) => api.get(`/projects/${projectId}/emotion_board`),
  addEmotionBoardImage: async (projectId, formData) => {
    const response = await api.post(`/projects/${projectId}/emotion_board`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    clearCache();
    return response;
  },
  updateEmotionBoardImage: async (projectId, boardId, data) => {
    const response = await api.put(`/projects/${projectId}/emotion_board/${boardId}`, data);
    clearCache();
    return response;
  },
  deleteEmotionBoardImage: async (projectId, boardId) => {
    const response = await api.delete(`/projects/${projectId}/emotion_board/${boardId}`);
    clearCache();
    return response;
  },
};

// 章节相关API
export const chapterApi = {
  getChapters: (projectId) => api.get(`/projects/${projectId}/chapters`),
  getChapter: (id) => api.get(`/chapters/${id}`),
  createChapter: async (data) => {
    const response = await api.post('/chapters', data);
    clearCache(); // 清除缓存以确保下次获取最新数据
    return response;
  },
  updateChapter: async (id, data) => {
    const response = await api.put(`/chapters/${id}`, data);
    clearCache(); // 清除缓存以确保下次获取最新数据
    return response;
  },
  deleteChapter: async (id) => {
    const response = await api.delete(`/chapters/${id}`);
    clearCache(); // 清除缓存以确保下次获取最新数据
    return response;
  },
};

// 角色相关API
export const characterApi = {
  getCharacters: (projectId, worldId, cancelToken) => {
    const params = {};
    if (projectId) params.project_id = projectId;
    if (worldId) params.world_id = worldId;
    return api.get('/characters', { params, cancelToken: cancelToken });
  },
  getCharacter: (id, cancelToken) => api.get(`/characters/${id}`, { cancelToken: cancelToken }),
  createCharacter: async (data) => {
    const response = await api.post('/characters', data);
    clearCache(); // 清除缓存以确保下次获取最新数据
    return response;
  },
  updateCharacter: async (id, data) => {
    const response = await api.put(`/characters/${id}`, data);
    clearCache(); // 清除缓存以确保下次获取最新数据
    return response;
  },
  deleteCharacter: async (id) => {
    const response = await api.delete(`/characters/${id}`);
    clearCache(); // 清除缓存以确保下次获取最新数据
    return response;
  },
  // 角色背景故事
  getCharacterBackgrounds: (characterId) => api.get(`/characters/${characterId}/backgrounds`),
  addCharacterBackground: async (characterId, data) => {
    const response = await api.post(`/characters/${characterId}/backgrounds`, data);
    clearCache();
    return response;
  },
  // 角色能力详情
  getCharacterAbilities: (characterId) => api.get(`/characters/${characterId}/abilities`),
  addCharacterAbility: async (characterId, data) => {
    const response = await api.post(`/characters/${characterId}/abilities`, data);
    clearCache();
    return response;
  },
};

// 地点相关API
export const locationApi = {
  getLocations: (projectId, cancelToken) => api.get('/locations', { params: { project_id: projectId }, cancelToken: cancelToken }),
  getLocation: (id, cancelToken) => api.get(`/locations/${id}`, { cancelToken: cancelToken }),
  createLocation: async (data) => {
    const response = await api.post('/locations', data);
    clearCache(); // 清除缓存以确保下次获取最新数据
    return response;
  },
  updateLocation: async (id, data) => {
    const response = await api.put(`/locations/${id}`, data);
    clearCache(); // 清除缓存以确保下次获取最新数据
    return response;
  },
  deleteLocation: async (id) => {
    const response = await api.delete(`/locations/${id}`);
    clearCache(); // 清除缓存以确保下次获取最新数据
    return response;
  },
};

// 物品相关API
export const itemApi = {
  getItems: (projectId, cancelToken) => api.get('/items', { params: { project_id: projectId }, cancelToken: cancelToken }),
  getItem: (id, cancelToken) => api.get(`/items/${id}`, { cancelToken: cancelToken }),
  createItem: async (data) => {
    const response = await api.post('/items', data);
    clearCache(); // 清除缓存以确保下次获取最新数据
    return response;
  },
  updateItem: async (id, data) => {
    const response = await api.put(`/items/${id}`, data);
    clearCache(); // 清除缓存以确保下次获取最新数据
    return response;
  },
  deleteItem: async (id) => {
    const response = await api.delete(`/items/${id}`);
    clearCache(); // 清除缓存以确保下次获取最新数据
    return response;
  },
};

// 势力相关API
export const factionApi = {
  getFactions: (projectId, cancelToken) => api.get('/factions', { params: { project_id: projectId }, cancelToken: cancelToken }),
  getFaction: (id, cancelToken) => api.get(`/factions/${id}`, { cancelToken: cancelToken }),
  createFaction: async (data) => {
    const response = await api.post('/factions', data);
    clearCache(); // 清除缓存以确保下次获取最新数据
    return response;
  },
  updateFaction: async (id, data) => {
    const response = await api.put(`/factions/${id}`, data);
    clearCache(); // 清除缓存以确保下次获取最新数据
    return response;
  },
  deleteFaction: async (id) => {
    const response = await api.delete(`/factions/${id}`);
    clearCache(); // 清除缓存以确保下次获取最新数据
    return response;
  },
};

// 关系相关API
export const relationshipApi = {
  getRelationships: (projectId) => api.get('/relationships', { params: { project_id: projectId } }),
  getRelationship: (id) => api.get(`/relationships/${id}`),
  createRelationship: async (data) => {
    const response = await api.post('/relationships', data);
    clearCache(); // 清除缓存以确保下次获取最新数据
    return response;
  },
  updateRelationship: async (id, data) => {
    const response = await api.put(`/relationships/${id}`, data);
    clearCache(); // 清除缓存以确保下次获取最新数据
    return response;
  },
  deleteRelationship: async (id) => {
    const response = await api.delete(`/relationships/${id}`);
    clearCache(); // 清除缓存以确保下次获取最新数据
    return response;
  },
};

// 设定相关API
export const settingApi = {
  // 世界设定
  getWorldSettings: (projectId) => api.get('/settings/world', { params: { project_id: projectId } }),
  getWorldSetting: (id) => api.get(`/settings/world/${id}`),
  createWorldSetting: async (data) => {
    const response = await api.post('/settings/world', data);
    clearCache();
    return response;
  },
  updateWorldSetting: async (id, data) => {
    const response = await api.put(`/settings/world/${id}`, data);
    clearCache();
    return response;
  },
  deleteWorldSetting: async (id) => {
    const response = await api.delete(`/settings/world/${id}`);
    clearCache();
    return response;
  },
  
  // 能量体系
  getEnergySystems: (projectId) => api.get('/settings/energy', { params: { project_id: projectId } }),
  getEnergySystem: (id) => api.get(`/settings/energy/${id}`),
  createEnergySystem: async (data) => {
    const response = await api.post('/settings/energy', data);
    clearCache();
    return response;
  },
  updateEnergySystem: async (id, data) => {
    const response = await api.put(`/settings/energy/${id}`, data);
    clearCache();
    return response;
  },
  deleteEnergySystem: async (id) => {
    const response = await api.delete(`/settings/energy/${id}`);
    clearCache();
    return response;
  },
  
  // 社会文化
  getSocietyCultures: (projectId) => api.get('/settings/society', { params: { project_id: projectId } }),
  getSocietyCulture: (id) => api.get(`/settings/society/${id}`),
  createSocietyCulture: async (data) => {
    const response = await api.post('/settings/society', data);
    clearCache();
    return response;
  },
  updateSocietyCulture: async (id, data) => {
    const response = await api.put(`/settings/society/${id}`, data);
    clearCache();
    return response;
  },
  deleteSocietyCulture: async (id) => {
    const response = await api.delete(`/settings/society/${id}`);
    clearCache();
    return response;
  },
  
  // 历史
  getHistories: (projectId) => api.get('/settings/history', { params: { project_id: projectId } }),
  getHistory: (id) => api.get(`/settings/history/${id}`),
  createHistory: async (data) => {
    const response = await api.post('/settings/history', data);
    clearCache();
    return response;
  },
  updateHistory: async (id, data) => {
    const response = await api.put(`/settings/history/${id}`, data);
    clearCache();
    return response;
  },
  deleteHistory: async (id) => {
    const response = await api.delete(`/settings/history/${id}`);
    clearCache();
    return response;
  },
  
  // 能力
  getAbilities: (projectId) => api.get('/settings/abilities', { params: { project_id: projectId } }),
  getAbility: (id) => api.get(`/settings/abilities/${id}`),
  createAbility: async (data) => {
    const response = await api.post('/settings/abilities', data);
    clearCache();
    return response;
  },
  updateAbility: async (id, data) => {
    const response = await api.put(`/settings/abilities/${id}`, data);
    clearCache();
    return response;
  },
  deleteAbility: async (id) => {
    const response = await api.delete(`/settings/abilities/${id}`);
    clearCache();
    return response;
  },
  
  // 技能
  getSkills: (projectId) => api.get('/settings/skills', { params: { project_id: projectId } }),
  getSkill: (id) => api.get(`/settings/skills/${id}`),
  createSkill: async (data) => {
    const response = await api.post('/settings/skills', data);
    clearCache();
    return response;
  },
  updateSkill: async (id, data) => {
    const response = await api.put(`/settings/skills/${id}`, data);
    clearCache();
    return response;
  },
  deleteSkill: async (id) => {
    const response = await api.delete(`/settings/skills/${id}`);
    clearCache();
    return response;
  },
  
  // 天赋
  getTalents: (projectId) => api.get('/settings/talents', { params: { project_id: projectId } }),
  getTalent: (id) => api.get(`/settings/talents/${id}`),
  createTalent: async (data) => {
    const response = await api.post('/settings/talents', data);
    clearCache();
    return response;
  },
  updateTalent: async (id, data) => {
    const response = await api.put(`/settings/talents/${id}`, data);
    clearCache();
    return response;
  },
  deleteTalent: async (id) => {
    const response = await api.delete(`/settings/talents/${id}`);
    clearCache();
    return response;
  },
  
  // 种族
  getRaces: (projectId) => api.get('/settings/races', { params: { project_id: projectId } }),
  getRace: (id) => api.get(`/settings/races/${id}`),
  createRace: async (data) => {
    const response = await api.post('/settings/races', data);
    clearCache();
    return response;
  },
  updateRace: async (id, data) => {
    const response = await api.put(`/settings/races/${id}`, data);
    clearCache();
    return response;
  },
  deleteRace: async (id) => {
    const response = await api.delete(`/settings/races/${id}`);
    clearCache();
    return response;
  },
  
  // 生物
  getCreatures: (projectId) => api.get('/settings/creatures', { params: { project_id: projectId } }),
  getCreature: (id) => api.get(`/settings/creatures/${id}`),
  createCreature: async (data) => {
    const response = await api.post('/settings/creatures', data);
    clearCache();
    return response;
  },
  updateCreature: async (id, data) => {
    const response = await api.put(`/settings/creatures/${id}`, data);
    clearCache();
    return response;
  },
  deleteCreature: async (id) => {
    const response = await api.delete(`/settings/creatures/${id}`);
    clearCache();
    return response;
  },
  
  // 特殊生物
  getSpecialCreatures: (projectId) => api.get('/settings/special-creatures', { params: { project_id: projectId } }),
  getSpecialCreature: (id) => api.get(`/settings/special-creatures/${id}`),
  createSpecialCreature: async (data) => {
    const response = await api.post('/settings/special-creatures', data);
    clearCache();
    return response;
  },
  updateSpecialCreature: async (id, data) => {
    const response = await api.put(`/settings/special-creatures/${id}`, data);
    clearCache();
    return response;
  },
  deleteSpecialCreature: async (id) => {
    const response = await api.delete(`/settings/special-creatures/${id}`);
    clearCache();
    return response;
  },
  
  // 时间线
  getTimelines: (projectId) => api.get('/settings/timelines', { params: { project_id: projectId } }),
  getTimeline: (id) => api.get(`/settings/timelines/${id}`),
  createTimeline: async (data) => {
    const response = await api.post('/settings/timelines', data);
    clearCache();
    return response;
  },
  updateTimeline: async (id, data) => {
    const response = await api.put(`/settings/timelines/${id}`, data);
    clearCache();
    return response;
  },
  deleteTimeline: async (id) => {
    const response = await api.delete(`/settings/timelines/${id}`);
    clearCache();
    return response;
  },
  
  // 数据关联
  getDataAssociations: (projectId) => api.get('/settings/associations', { params: { project_id: projectId } }),
  getDataAssociation: (id) => api.get(`/settings/associations/${id}`),
  createDataAssociation: async (data) => {
    const response = await api.post('/settings/associations', data);
    clearCache();
    return response;
  },
  updateDataAssociation: async (id, data) => {
    const response = await api.put(`/settings/associations/${id}`, data);
    clearCache();
    return response;
  },
  deleteDataAssociation: async (id) => {
    const response = await api.delete(`/settings/associations/${id}`);
    clearCache();
    return response;
  },
  
  // 角色内在特质
  getCharacterTraits: (projectId) => api.get('/settings/character-trait', { params: { project_id: projectId } }),
  getCharacterTrait: (id) => api.get(`/settings/character-trait/${id}`),
  createCharacterTrait: async (data) => {
    const response = await api.post('/settings/character-trait', data);
    clearCache();
    return response;
  },
  updateCharacterTrait: async (id, data) => {
    const response = await api.put(`/settings/character-trait/${id}`, data);
    clearCache();
    return response;
  },
  deleteCharacterTrait: async (id) => {
    const response = await api.delete(`/settings/character-trait/${id}`);
    clearCache();
    return response;
  },
  
  // 角色能力装备
  getCharacterAbilities: (projectId) => api.get('/settings/character-ability', { params: { project_id: projectId } }),
  getCharacterAbility: (id) => api.get(`/settings/character-ability/${id}`),
  createCharacterAbility: async (data) => {
    const response = await api.post('/settings/character-ability', data);
    clearCache();
    return response;
  },
  updateCharacterAbility: async (id, data) => {
    const response = await api.put(`/settings/character-ability/${id}`, data);
    clearCache();
    return response;
  },
  deleteCharacterAbility: async (id) => {
    const response = await api.delete(`/settings/character-ability/${id}`);
    clearCache();
    return response;
  },
  
  // 角色关系发展
  getCharacterRelationships: (projectId) => api.get('/settings/character-relationship', { params: { project_id: projectId } }),
  getCharacterRelationship: (id) => api.get(`/settings/character-relationship/${id}`),
  createCharacterRelationship: async (data) => {
    const response = await api.post('/settings/character-relationship', data);
    clearCache();
    return response;
  },
  updateCharacterRelationship: async (id, data) => {
    const response = await api.put(`/settings/character-relationship/${id}`, data);
    clearCache();
    return response;
  },
  deleteCharacterRelationship: async (id) => {
    const response = await api.delete(`/settings/character-relationship/${id}`);
    clearCache();
    return response;
  },
  
  // 势力组织结构
  getFactionStructures: (projectId) => api.get('/settings/faction-structure', { params: { project_id: projectId } }),
  getFactionStructure: (id) => api.get(`/settings/faction-structure/${id}`),
  createFactionStructure: async (data) => {
    const response = await api.post('/settings/faction-structure', data);
    clearCache();
    return response;
  },
  updateFactionStructure: async (id, data) => {
    const response = await api.put(`/settings/faction-structure/${id}`, data);
    clearCache();
    return response;
  },
  deleteFactionStructure: async (id) => {
    const response = await api.delete(`/settings/faction-structure/${id}`);
    clearCache();
    return response;
  },
  
  // 势力能力目标
  getFactionGoals: (projectId) => api.get('/settings/faction-goal', { params: { project_id: projectId } }),
  getFactionGoal: (id) => api.get(`/settings/faction-goal/${id}`),
  createFactionGoal: async (data) => {
    const response = await api.post('/settings/faction-goal', data);
    clearCache();
    return response;
  },
  updateFactionGoal: async (id, data) => {
    const response = await api.put(`/settings/faction-goal/${id}`, data);
    clearCache();
    return response;
  },
  deleteFactionGoal: async (id) => {
    const response = await api.delete(`/settings/faction-goal/${id}`);
    clearCache();
    return response;
  },
  
  // 地点内部结构
  getLocationStructures: (projectId) => api.get('/settings/location-structure', { params: { project_id: projectId } }),
  getLocationStructure: (id) => api.get(`/settings/location-structure/${id}`),
  createLocationStructure: async (data) => {
    const response = await api.post('/settings/location-structure', data);
    clearCache();
    return response;
  },
  updateLocationStructure: async (id, data) => {
    const response = await api.put(`/settings/location-structure/${id}`, data);
    clearCache();
    return response;
  },
  deleteLocationStructure: async (id) => {
    const response = await api.delete(`/settings/location-structure/${id}`);
    clearCache();
    return response;
  },
  
  // 地点特殊地点
  getSpecialLocations: (projectId) => api.get('/settings/special-location', { params: { project_id: projectId } }),
  getSpecialLocation: (id) => api.get(`/settings/special-location/${id}`),
  createSpecialLocation: async (data) => {
    const response = await api.post('/settings/special-location', data);
    clearCache();
    return response;
  },
  updateSpecialLocation: async (id, data) => {
    const response = await api.put(`/settings/special-location/${id}`, data);
    clearCache();
    return response;
  },
  deleteSpecialLocation: async (id) => {
    const response = await api.delete(`/settings/special-location/${id}`);
    clearCache();
    return response;
  },
  
  // 物品装备系统
  getEquipmentSystems: (projectId) => api.get('/settings/equipment-system', { params: { project_id: projectId } }),
  getEquipmentSystem: (id) => api.get(`/settings/equipment-system/${id}`),
  createEquipmentSystem: async (data) => {
    const response = await api.post('/settings/equipment-system', data);
    clearCache();
    return response;
  },
  updateEquipmentSystem: async (id, data) => {
    const response = await api.put(`/settings/equipment-system/${id}`, data);
    clearCache();
    return response;
  },
  deleteEquipmentSystem: async (id) => {
    const response = await api.delete(`/settings/equipment-system/${id}`);
    clearCache();
    return response;
  },
  
  // 物品特殊物品
  getSpecialItems: (projectId) => api.get('/settings/special-item', { params: { project_id: projectId } }),
  getSpecialItem: (id) => api.get(`/settings/special-item/${id}`),
  createSpecialItem: async (data) => {
    const response = await api.post('/settings/special-item', data);
    clearCache();
    return response;
  },
  updateSpecialItem: async (id, data) => {
    const response = await api.put(`/settings/special-item/${id}`, data);
    clearCache();
    return response;
  },
  deleteSpecialItem: async (id) => {
    const response = await api.delete(`/settings/special-item/${id}`);
    clearCache();
    return response;
  },
};

// 世界管理API
export const worldApi = {
  getWorlds: () => api.get('/worlds'),
  getWorld: (id) => api.get(`/worlds/${id}`),
  createWorld: async (data) => {
    const response = await api.post('/worlds', data);
    clearCache();
    return response;
  },
  updateWorld: async (id, data) => {
    const response = await api.put(`/worlds/${id}`, data);
    clearCache();
    return response;
  },
  deleteWorld: async (id) => {
    const response = await api.delete(`/worlds/${id}`);
    clearCache();
    return response;
  },
};

// AI相关API
export const aiApi = {
  generateOpening: (data) => api.post('/ai/generate-opening', data),
  continueWriting: (data) => api.post('/ai/continue-writing', data),
  rewrite: (data) => api.post('/ai/rewrite', data),
  generateWorld: (data) => api.post('/ai/generate-world', data),
  generateCharacter: (data) => api.post('/ai/generate-character', data),
  // 流式输出API
  streamChatCompletion: (data) => api.post('/ai/stream', data, {
    responseType: 'stream'
  }),
  // AI配置相关API
  getConfig: () => api.get('/ai/config'),
  setDefaultProvider: (data) => api.put('/ai/config/provider', data),
  updateProviderConfig: (provider, data) => api.put(`/ai/config/provider/${provider}`, data),
  // 测试连接API
  testConnection: (provider) => api.post(`/ai/config/provider/${provider}/test`),
};

// 故事蓝图相关API
export const blueprintApi = {
  // 大纲相关API
  createOutline: async (data) => {
    const response = await api.post('/outlines', data);
    clearCache();
    return response;
  },
  getProjectOutline: (projectId) => api.get(`/projects/${projectId}/outline`),
  getOutline: (id) => api.get(`/outlines/${id}`),
  updateOutline: async (id, data) => {
    const response = await api.put(`/outlines/${id}`, data);
    clearCache();
    return response;
  },
  deleteOutline: async (id) => {
    const response = await api.delete(`/outlines/${id}`);
    clearCache();
    return response;
  },
  
  // AI生成大纲
  generateOutline: (data) => api.post('/ai/generate_outline', data),
  
  // 大纲分解为卷纲
  decomposeOutline: (outlineId) => api.post(`/outlines/${outlineId}/decompose`),
  
  // 卷纲相关API
  getVolume: (id) => api.get(`/volumes/${id}`),
  updateVolume: async (id, data) => {
    const response = await api.put(`/volumes/${id}`, data);
    clearCache();
    return response;
  },
  deleteVolume: async (id) => {
    const response = await api.delete(`/volumes/${id}`);
    clearCache();
    return response;
  },
  
  // 卷纲分解为章纲
  decomposeVolume: (volumeId) => api.post(`/volumes/${volumeId}/decompose`),
  
  // 章纲相关API
  updateChapterDetails: async (id, data) => {
    const response = await api.put(`/chapters/${id}`, data);
    clearCache();
    return response;
  },
  
  // 章纲评估
  evaluateChapter: (chapterId) => api.get(`/chapters/${chapterId}/evaluate`),
  
  // 故事模型相关API
  getStoryModels: () => api.get('/story-models'),
  getStoryModel: (id) => api.get(`/story-models/${id}`),
  createStoryModel: async (data) => {
    const response = await api.post('/story-models', data);
    clearCache();
    return response;
  },
  updateStoryModel: async (id, data) => {
    const response = await api.put(`/story-models/${id}`, data);
    clearCache();
    return response;
  },
  deleteStoryModel: async (id) => {
    const response = await api.delete(`/story-models/${id}`);
    clearCache();
    return response;
  },
  initStoryModels: () => api.post('/story-models/init'),
};

export default api;
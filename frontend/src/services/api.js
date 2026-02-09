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
    const config = { params };
    if (cancelToken) config.cancelToken = cancelToken;
    return api.get('/characters', config);
  },
  getCharacter: (id, cancelToken) => {
    const config = {};
    if (cancelToken) config.cancelToken = cancelToken;
    return api.get(`/characters/${id}`, config);
  },
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
  getLocations: (projectId, cancelToken) => {
    const config = { params: { project_id: projectId } };
    if (cancelToken) config.cancelToken = cancelToken;
    return api.get('/locations', config);
  },
  getLocation: (id, cancelToken) => {
    const config = {};
    if (cancelToken) config.cancelToken = cancelToken;
    return api.get(`/locations/${id}`, config);
  },
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
  getItems: (projectId, cancelToken) => {
    const config = { params: { project_id: projectId } };
    if (cancelToken) config.cancelToken = cancelToken;
    return api.get('/items', config);
  },
  getItem: (id, cancelToken) => {
    const config = {};
    if (cancelToken) config.cancelToken = cancelToken;
    return api.get(`/items/${id}`, config);
  },
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
  getFactions: (projectId, cancelToken) => {
    const config = { params: { project_id: projectId } };
    if (cancelToken) config.cancelToken = cancelToken;
    return api.get('/factions', config);
  },
  getFaction: (id, cancelToken) => {
    const config = {};
    if (cancelToken) config.cancelToken = cancelToken;
    return api.get(`/factions/${id}`, config);
  },
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
  getWorlds: () => api.get('/worlds/'),
  getWorld: (id) => api.get(`/worlds/${id}/`),
  createWorld: async (data) => {
    const response = await api.post('/worlds/', data);
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
  getWorldStats: (id) => api.get(`/worlds/${id}/stats`),
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

// 世界观设定API - 新的模块
export const worldSettingApi = {
  // 维度管理
  getDimensions: (worldId) => api.get('/world-setting/dimensions', { params: { world_id: worldId } }),
  createDimension: (data) => api.post('/world-setting/dimensions', data),
  updateDimension: (id, data) => api.put(`/world-setting/dimensions/${id}`, data),
  deleteDimension: (id) => api.delete(`/world-setting/dimensions/${id}`),
  
  // 区域管理
  getRegions: (worldId, parentId) => {
    const params = { world_id: worldId };
    if (parentId !== undefined) params.parent_id = parentId;
    return api.get('/world-setting/regions', { params });
  },
  createRegion: (data) => api.post('/world-setting/regions', data),
  updateRegion: (id, data) => api.put(`/world-setting/regions/${id}`, data),
  deleteRegion: (id) => api.delete(`/world-setting/regions/${id}`),
  
  // 天体管理
  getCelestialBodies: (worldId, dimensionId) => {
    const params = { world_id: worldId };
    if (dimensionId) params.dimension_id = dimensionId;
    return api.get('/world-setting/celestial-bodies', { params });
  },
  createCelestialBody: (data) => api.post('/world-setting/celestial-bodies', data),
  updateCelestialBody: (id, data) => api.put(`/world-setting/celestial-bodies/${id}`, data),
  deleteCelestialBody: (id) => api.delete(`/world-setting/celestial-bodies/${id}`),
  
  // 自然法则管理
  getNaturalLaws: (worldId) => api.get('/world-setting/natural-laws', { params: { world_id: worldId } }),
  createNaturalLaw: (data) => api.post('/world-setting/natural-laws', data),
  updateNaturalLaw: (id, data) => api.put(`/world-setting/natural-laws/${id}`, data),
  deleteNaturalLaw: (id) => api.delete(`/world-setting/natural-laws/${id}`),
};

// 能量与社会体系API
export const energySocietyApi = {
  // 能量体系
  getEnergySystems: (worldId) => api.get('/energy-society/energy-systems', { params: { world_id: worldId } }),
  createEnergySystem: (data) => api.post('/energy-society/energy-systems', data),
  updateEnergySystem: (id, data) => api.put(`/energy-society/energy-systems/${id}`, data),
  deleteEnergySystem: (id) => api.delete(`/energy-society/energy-systems/${id}`),
  
  // 能量形态
  getEnergyForms: (worldId, energySystemId) => {
    const params = { world_id: worldId };
    if (energySystemId) params.energy_system_id = energySystemId;
    return api.get('/energy-society/energy-forms', { params });
  },
  createEnergyForm: (data) => api.post('/energy-society/energy-forms', data),
  updateEnergyForm: (id, data) => api.put(`/energy-society/energy-forms/${id}`, data),
  deleteEnergyForm: (id) => api.delete(`/energy-society/energy-forms/${id}`),
  
  // 力量等级
  getPowerLevels: (worldId) => api.get('/energy-society/power-levels', { params: { world_id: worldId } }),
  createPowerLevel: (data) => api.post('/energy-society/power-levels', data),
  updatePowerLevel: (id, data) => api.put(`/energy-society/power-levels/${id}`, data),
  deletePowerLevel: (id) => api.delete(`/energy-society/power-levels/${id}`),
  
  // 力量代价
  getPowerCosts: (worldId) => api.get('/energy-society/power-costs', { params: { world_id: worldId } }),
  createPowerCost: (data) => api.post('/energy-society/power-costs', data),
  updatePowerCost: (id, data) => api.put(`/energy-society/power-costs/${id}`, data),
  deletePowerCost: (id) => api.delete(`/energy-society/power-costs/${id}`),
  
  // 通用技能
  getCommonSkills: (worldId) => api.get('/energy-society/common-skills', { params: { world_id: worldId } }),
  createCommonSkill: (data) => api.post('/energy-society/common-skills', data),
  updateCommonSkill: (id, data) => api.put(`/energy-society/common-skills/${id}`, data),
  deleteCommonSkill: (id) => api.delete(`/energy-society/common-skills/${id}`),
  
  // 文明管理
  getCivilizations: (worldId) => api.get('/energy-society/civilizations', { params: { world_id: worldId } }),
  createCivilization: (data) => api.post('/energy-society/civilizations', data),
  updateCivilization: (id, data) => api.put(`/energy-society/civilizations/${id}`, data),
  deleteCivilization: (id) => api.delete(`/energy-society/civilizations/${id}`),
  
  // 社会阶级
  getSocialClasses: (worldId, civilizationId) => {
    const params = { world_id: worldId };
    if (civilizationId) params.civilization_id = civilizationId;
    return api.get('/energy-society/social-classes', { params });
  },
  createSocialClass: (data) => api.post('/energy-society/social-classes', data),
  updateSocialClass: (id, data) => api.put(`/energy-society/social-classes/${id}`, data),
  deleteSocialClass: (id) => api.delete(`/energy-society/social-classes/${id}`),
  
  // 文化习俗
  getCulturalCustoms: (worldId, civilizationId) => {
    const params = { world_id: worldId };
    if (civilizationId) params.civilization_id = civilizationId;
    return api.get('/energy-society/cultural-customs', { params });
  },
  createCulturalCustom: (data) => api.post('/energy-society/cultural-customs', data),
  updateCulturalCustom: (id, data) => api.put(`/energy-society/cultural-customs/${id}`, data),
  deleteCulturalCustom: (id) => api.delete(`/energy-society/cultural-customs/${id}`),
  
  // 经济体系
  getEconomicSystems: (worldId, civilizationId) => {
    const params = { world_id: worldId };
    if (civilizationId) params.civilization_id = civilizationId;
    return api.get('/energy-society/economic-systems', { params });
  },
  createEconomicSystem: (data) => api.post('/energy-society/economic-systems', data),
  updateEconomicSystem: (id, data) => api.put(`/energy-society/economic-systems/${id}`, data),
  deleteEconomicSystem: (id) => api.delete(`/energy-society/economic-systems/${id}`),
  
  // 政治体系
  getPoliticalSystems: (worldId, civilizationId) => {
    const params = { world_id: worldId };
    if (civilizationId) params.civilization_id = civilizationId;
    return api.get('/energy-society/political-systems', { params });
  },
  createPoliticalSystem: (data) => api.post('/energy-society/political-systems', data),
  updatePoliticalSystem: (id, data) => api.put(`/energy-society/political-systems/${id}`, data),
  deletePoliticalSystem: (id) => api.delete(`/energy-society/political-systems/${id}`),
};

// 历史脉络API
export const historyTimelineApi = {
  // 历史纪元
  getHistoricalEras: (worldId) => api.get('/history-timeline/eras', { params: { world_id: worldId } }),
  createHistoricalEra: (data) => api.post('/history-timeline/eras', data),
  updateHistoricalEra: (id, data) => api.put(`/history-timeline/eras/${id}`, data),
  deleteHistoricalEra: (id) => api.delete(`/history-timeline/eras/${id}`),
  
  // 历史事件
  getHistoricalEvents: (worldId, eraId, eventType) => {
    const params = { world_id: worldId };
    if (eraId) params.era_id = eraId;
    if (eventType) params.event_type = eventType;
    return api.get('/history-timeline/events', { params });
  },
  createHistoricalEvent: (data) => api.post('/history-timeline/events', data),
  updateHistoricalEvent: (id, data) => api.put(`/history-timeline/events/${id}`, data),
  deleteHistoricalEvent: (id) => api.delete(`/history-timeline/events/${id}`),
  
  // 历史人物
  getHistoricalFigures: (worldId, civilizationId, primaryRole) => {
    const params = { world_id: worldId };
    if (civilizationId) params.civilization_id = civilizationId;
    if (primaryRole) params.primary_role = primaryRole;
    return api.get('/history-timeline/figures', { params });
  },
  createHistoricalFigure: (data) => api.post('/history-timeline/figures', data),
  updateHistoricalFigure: (id, data) => api.put(`/history-timeline/figures/${id}`, data),
  deleteHistoricalFigure: (id) => api.delete(`/history-timeline/figures/${id}`),
  
  // 事件参与者
  getEventParticipants: (eventId, figureId) => {
    const params = {};
    if (eventId) params.event_id = eventId;
    if (figureId) params.figure_id = figureId;
    return api.get('/history-timeline/event-participants', { params });
  },
  createEventParticipant: (data) => api.post('/history-timeline/event-participants', data),
  updateEventParticipant: (id, data) => api.put(`/history-timeline/event-participants/${id}`, data),
  deleteEventParticipant: (id) => api.delete(`/history-timeline/event-participants/${id}`),
};

// 标签与关系网络API
export const tagsRelationsApi = {
  // 标签管理
  getTags: (worldId, tagType) => {
    const params = { world_id: worldId };
    if (tagType) params.tag_type = tagType;
    return api.get('/tags-relations/tags', { params });
  },
  createTag: (data) => api.post('/tags-relations/tags', data),
  updateTag: (id, data) => api.put(`/tags-relations/tags/${id}`, data),
  deleteTag: (id) => api.delete(`/tags-relations/tags/${id}`),
  
  // 实体标签关联
  getEntityTags: (tagId, entityType, entityId) => {
    const params = {};
    if (tagId) params.tag_id = tagId;
    if (entityType) params.entity_type = entityType;
    if (entityId) params.entity_id = entityId;
    return api.get('/tags-relations/entity-tags', { params });
  },
  createEntityTag: (data) => api.post('/tags-relations/entity-tags', data),
  deleteEntityTag: (id) => api.delete(`/tags-relations/entity-tags/${id}`),
  getEntityTagsByEntity: (entityType, entityId) => 
    api.get(`/tags-relations/entities/${entityType}/${entityId}/tags`),
  
  // 实体关系
  getEntityRelations: (worldId, sourceType, sourceId, targetType, targetId, relationType) => {
    const params = { world_id: worldId };
    if (sourceType) params.source_type = sourceType;
    if (sourceId) params.source_id = sourceId;
    if (targetType) params.target_type = targetType;
    if (targetId) params.target_id = targetId;
    if (relationType) params.relation_type = relationType;
    return api.get('/tags-relations/relations', { params });
  },
  createEntityRelation: (data) => api.post('/tags-relations/relations', data),
  updateEntityRelation: (id, data) => api.put(`/tags-relations/relations/${id}`, data),
  deleteEntityRelation: (id) => api.delete(`/tags-relations/relations/${id}`),
  getEntityRelationsByEntity: (entityType, entityId) => 
    api.get(`/tags-relations/entities/${entityType}/${entityId}/relations`),
  
  // 关系网络数据（用于可视化）
  getRelationNetwork: (worldId) => api.get(`/tags-relations/network/${worldId}`),
};

export default api;
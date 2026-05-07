import axios from 'axios';

const API_BASE_URL = '/api';

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
  getLocations: (projectId, worldId, cancelToken) => {
    const params = {};
    if (projectId) params.project_id = projectId;
    if (worldId) params.world_id = worldId;
    const config = { params };
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
  getItems: (projectId, worldId, cancelToken) => {
    const params = {};
    if (projectId) params.project_id = projectId;
    if (worldId) params.world_id = worldId;
    const config = { params };
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
  getFactions: (projectId, worldId, cancelToken) => {
    const params = {};
    if (projectId) params.project_id = projectId;
    if (worldId) params.world_id = worldId;
    const config = { params };
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
  getEnergySystems: (worldId) => api.get('/settings/energy', { params: { world_id: worldId } }),
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
  getWorld: (id) => api.get(`/worlds/${id}`),
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
  getWorldActivities: (id) => api.get(`/worlds/${id}/activities`),
};

// AI相关API
export const aiApi = {
  generateOpening: (data) => api.post('/ai/generate-opening', data),
  continueWriting: (data) => api.post('/ai/continue-writing', data),
  rewrite: (data) => api.post('/ai/rewrite', data),
  generateWorld: (data) => api.post('/ai/generate-world', data),
  generateCharacter: (data) => api.post('/ai/generate-character', data),
  generateProjectProposal: (data) => api.post('/ai/generate-project-proposal', data),
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

// AI设定生成API
export const aiGenerationApi = {
  // 生成设定
  generateSetting: (data) => api.post('/ai-generation/generate-setting', data),
  // 批量生成
  generateBatch: (data) => api.post('/ai-generation/generate-setting/batch', data),
  // 保存生成的设定
  saveSetting: (data) => api.post('/ai-generation/generate-setting/save', data),
  // 获取生成策略列表
  getStrategies: () => api.get('/ai-generation/generation-strategies'),
  // 获取支持的实体类型
  getEntityTypes: () => api.get('/ai-generation/supported-entity-types'),
  // 预览提示词
  previewPrompt: (data) => api.post('/ai-generation/preview-prompt', data),

  // ========== 中止与恢复相关API ==========
  // 中止生成
  abortGeneration: (data) => api.post('/worldview/abort-generation', data),
  // 获取生成状态
  getGenerationStatus: (sessionId) => api.get(`/worldview/generation-status/${sessionId}`),
  // 获取检查点列表
  getCheckpoints: (params) => api.get('/worldview/checkpoints', { params }),
  // 获取单个检查点
  getCheckpoint: (checkpointId) => api.get(`/worldview/checkpoints/${checkpointId}`),
  // 从检查点恢复
  resumeGeneration: (data) => api.post('/worldview/resume-generation', data),
  // 删除检查点
  deleteCheckpoint: (checkpointId) => api.delete(`/worldview/checkpoints/${checkpointId}`),
  // 清理过期检查点
  cleanupExpiredCheckpoints: () => api.post('/worldview/cleanup-expired-checkpoints'),
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
  getOutlineVolumes: (outlineId) => api.get(`/outlines/${outlineId}/volumes`),
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
  
  // 根据卷纲ID获取章纲列表
  getVolumeChapters: (volumeId) => api.get(`/volumes/${volumeId}/chapters`),
  
  // 章纲相关API
  updateChapterDetails: async (id, data) => {
    const response = await api.put(`/chapters/${id}`, data);
    clearCache();
    return response;
  },
  deleteChapter: async (id) => {
    const response = await api.delete(`/chapters/${id}`);
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

// 能量体系API
export const energySystemApi = {
  // 能量体系
  getEnergySystems: (worldId) => api.get('/energy-system/energy-systems', { params: { world_id: worldId } }),
  createEnergySystem: (data) => api.post('/energy-system/energy-systems', data),
  updateEnergySystem: (id, data) => api.put(`/energy-system/energy-systems/${id}`, data),
  deleteEnergySystem: (id) => api.delete(`/energy-system/energy-systems/${id}`),
  
  // 能量形态
  getEnergyForms: (worldId, energySystemId) => {
    const params = { world_id: worldId };
    if (energySystemId) params.energy_system_id = energySystemId;
    return api.get('/energy-system/energy-forms', { params });
  },
  createEnergyForm: (data) => api.post('/energy-system/energy-forms', data),
  updateEnergyForm: (id, data) => api.put(`/energy-system/energy-forms/${id}`, data),
  deleteEnergyForm: (id) => api.delete(`/energy-system/energy-forms/${id}`),
  
  // 力量等级
  getPowerLevels: (worldId) => api.get('/society/power-levels', { params: { world_id: worldId } }),
  createPowerLevel: (data) => api.post('/society/power-levels', data),
  updatePowerLevel: (id, data) => api.put(`/society/power-levels/${id}`, data),
  deletePowerLevel: (id) => api.delete(`/society/power-levels/${id}`),
  
  // 力量代价
  getPowerCosts: (worldId) => api.get('/society/power-costs', { params: { world_id: worldId } }),
  createPowerCost: (data) => api.post('/society/power-costs', data),
  updatePowerCost: (id, data) => api.put(`/society/power-costs/${id}`, data),
  deletePowerCost: (id) => api.delete(`/society/power-costs/${id}`),
  
  // 通用技能
  getCommonSkills: (worldId) => api.get('/energy-system/common-skills', { params: { world_id: worldId } }),
  createCommonSkill: (data) => api.post('/energy-system/common-skills', data),
  updateCommonSkill: (id, data) => api.put(`/energy-system/common-skills/${id}`, data),
  deleteCommonSkill: (id) => api.delete(`/energy-system/common-skills/${id}`),
};

// 社会体系API
export const societyApi = {
  // 力量等级
  getPowerLevels: (worldId) => api.get('/society/power-levels', { params: { world_id: worldId } }),
  createPowerLevel: (data) => api.post('/society/power-levels', data),
  updatePowerLevel: (id, data) => api.put(`/society/power-levels/${id}`, data),
  deletePowerLevel: (id) => api.delete(`/society/power-levels/${id}`),
  
  // 力量代价
  getPowerCosts: (worldId) => api.get('/society/power-costs', { params: { world_id: worldId } }),
  createPowerCost: (data) => api.post('/society/power-costs', data),
  updatePowerCost: (id, data) => api.put(`/society/power-costs/${id}`, data),
  deletePowerCost: (id) => api.delete(`/society/power-costs/${id}`),
  
  // 通用技能
  getCommonSkills: (worldId) => api.get('/energy-system/common-skills', { params: { world_id: worldId } }),
  createCommonSkill: (data) => api.post('/energy-system/common-skills', data),
  updateCommonSkill: (id, data) => api.put(`/energy-system/common-skills/${id}`, data),
  deleteCommonSkill: (id) => api.delete(`/energy-system/common-skills/${id}`),
  
  // 文明管理
  getCivilizations: (worldId) => api.get('/society/civilizations', { params: { world_id: worldId } }),
  createCivilization: (data) => api.post('/society/civilizations', data),
  updateCivilization: (id, data) => api.put(`/society/civilizations/${id}`, data),
  deleteCivilization: (id) => api.delete(`/society/civilizations/${id}`),
  
  // 社会阶级
  getSocialClasses: (worldId, civilizationId) => {
    const params = { world_id: worldId };
    if (civilizationId) params.civilization_id = civilizationId;
    return api.get('/society/social-classes', { params });
  },
  createSocialClass: (data) => api.post('/society/social-classes', data),
  updateSocialClass: (id, data) => api.put(`/society/social-classes/${id}`, data),
  deleteSocialClass: (id) => api.delete(`/society/social-classes/${id}`),
  
  // 文化习俗
  getCulturalCustoms: (worldId, civilizationId) => {
    const params = { world_id: worldId };
    if (civilizationId) params.civilization_id = civilizationId;
    return api.get('/society/cultural-customs', { params });
  },
  createCulturalCustom: (data) => api.post('/society/cultural-customs', data),
  updateCulturalCustom: (id, data) => api.put(`/society/cultural-customs/${id}`, data),
  deleteCulturalCustom: (id) => api.delete(`/society/cultural-customs/${id}`),
  
  // 经济体系
  getEconomicSystems: (worldId, civilizationId) => {
    const params = { world_id: worldId };
    if (civilizationId) params.civilization_id = civilizationId;
    return api.get('/society/economic-systems', { params });
  },
  createEconomicSystem: (data) => api.post('/society/economic-systems', data),
  updateEconomicSystem: (id, data) => api.put(`/society/economic-systems/${id}`, data),
  deleteEconomicSystem: (id) => api.delete(`/society/economic-systems/${id}`),
  
  // 政治体系
  getPoliticalSystems: (worldId, civilizationId) => {
    const params = { world_id: worldId };
    if (civilizationId) params.civilization_id = civilizationId;
    return api.get('/society/political-systems', { params });
  },
  createPoliticalSystem: (data) => api.post('/society/political-systems', data),
  updatePoliticalSystem: (id, data) => api.put(`/society/political-systems/${id}`, data),
  deletePoliticalSystem: (id) => api.delete(`/society/political-systems/${id}`),
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
  getRelationNetwork: (worldId, entityTypes, relationTypes) => {
    const params = {};
    if (entityTypes) params.entity_type = entityTypes;
    if (relationTypes) params.relation_type = relationTypes;
    return api.get(`/tags-relations/network/${worldId}`, { params });
  },
  
  // 关系网络统计
  getRelationNetworkStats: (worldId) => api.get(`/tags-relations/network/stats/${worldId}`),
};

// AI生成版本管理API
export const aiVersionAPI = {
  // 创建版本
  createVersion: async (data) => {
    const response = await api.post('/ai-versions', data);
    clearCache();
    return response;
  },
  
  // 获取版本列表
  getVersions: (params) => api.get('/ai-versions', { params }),
  
  // 获取单个版本
  getVersion: (id) => api.get(`/ai-versions/${id}`),
  
  // 更新版本
  updateVersion: async (id, data) => {
    const response = await api.put(`/ai-versions/${id}`, data);
    clearCache();
    return response;
  },
  
  // 删除版本
  deleteVersion: async (id) => {
    const response = await api.delete(`/ai-versions/${id}`);
    clearCache();
    return response;
  },
  
  // 设置当前版本
  setCurrentVersion: (id) => api.post(`/ai-versions/${id}/set-current`),
  
  // 对比版本
  compareVersions: (data) => api.post('/ai-versions/compare', data),
  
  // 重新生成
  regenerateVersion: (id, data) => api.post(`/ai-versions/${id}/regenerate`, data),
  
  // 获取实体的当前版本
  getCurrentVersion: (entityType, entityId) => 
    api.get(`/ai-versions/entity/${entityType}/${entityId}/current`),
  
  // 应用版本到实体
  applyVersion: (entityType, entityId, versionId) => 
    api.post(`/ai-versions/entity/${entityType}/${entityId}/apply`, { version_id: versionId }),
};

// 世界观从蓝图生成API
export const worldviewGenerationApi = {
  // 阶段一：提取设定元素
  extractBlueprintElements: (data) => api.post('/worldview/extract-blueprint-elements', data),
  
  // 阶段一：流式提取设定元素
  extractBlueprintElementsStream: (data, signal) => {
    return fetch('/api/worldview/extract-blueprint-elements-stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal: signal, // 用于中止请求
    });
  },
  
  // 保存提取清单
  saveExtractionList: (data) => api.post('/worldview/save-extraction-list', data),
  
  // 阶段二：创建生成批次
  createGenerationBatches: (data) => api.post('/worldview/create-generation-batches', data),

  // 执行批次生成（同步版本）
  executeBatchGeneration: (data) => api.post('/worldview/execute-batch-generation', data),

  // 执行批次生成（流式版本）
  executeBatchGenerationStream: (data, signal) => {
    return fetch(`${API_BASE_URL}/worldview/execute-batch-generation-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal: signal, // 用于中止请求
    });
  },
  
  // 获取批次结果
  getBatchResults: (batchId) => api.get(`/worldview/batch-results/${batchId}`),
  
  // 应用批次结果
  applyBatchResults: (data) => api.post('/worldview/apply-batch-results', data),
  
  // 检查一致性
  checkConsistency: (data) => api.post('/worldview/check-consistency', data),
  
  // 从蓝图创建世界（完整流程）
  createWorldFromBlueprint: (data) => api.post('/worldview/create-world-from-blueprint', data),
  
  // 中止生成
  abortGeneration: (data) => api.post('/worldview/abort-generation', data),
  
  // 获取生成状态
  getGenerationStatus: (sessionId) => api.get(`/worldview/generation-status/${sessionId}`),
  
  // 获取检查点列表
  getCheckpoints: (params) => api.get('/worldview/checkpoints', { params }),
  
  // 获取单个检查点
  getCheckpoint: (id) => api.get(`/worldview/checkpoints/${id}`),
  
  // 从检查点恢复生成
  resumeGeneration: (data) => api.post('/worldview/resume-generation', data),
  
  // 删除检查点
  deleteCheckpoint: (id) => api.delete(`/worldview/checkpoints/${id}`),
  
  // 清理过期检查点
  cleanupExpiredCheckpoints: () => api.post('/worldview/cleanup-expired-checkpoints'),

  // 整合元素（合并相似条目）
  integrateElements: (elements) => api.post('/worldview/integrate-elements', { elements }),
  
  integrateElementsStream: (elements) => {
    return fetch(`${API_BASE_URL}/worldview/integrate-elements-stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ elements }),
    });
  },
};

// 章节出现索引API
export const chapterAppearanceApi = {
  // 获取出现类型列表
  getAppearanceTypes: () => api.get('/chapter-appearances/appearance-types'),
  
  // 获取支持的实体类型列表
  getEntityTypes: () => api.get('/chapter-appearances/entity-types'),
  
  // 获取章节出现记录列表
  getAppearances: (params) => api.get('/chapter-appearances/', { params }),
  
  // 获取实体在所有章节的出现记录
  getEntityAppearances: (entityType, entityId) => 
    api.get(`/chapter-appearances/entity/${entityType}/${entityId}`),
  
  // 获取章节中出现的所有实体
  getChapterEntities: (chapterId) => 
    api.get(`/chapter-appearances/chapter/${chapterId}`),
  
  // 创建章节出现记录
  createAppearance: async (data) => {
    const response = await api.post('/chapter-appearances/', data);
    clearCache();
    return response;
  },
  
  // 批量创建章节出现记录
  batchCreateAppearances: async (data) => {
    const response = await api.post('/chapter-appearances/batch', data);
    clearCache();
    return response;
  },
  
  // 更新章节出现记录
  updateAppearance: async (id, data) => {
    const response = await api.put(`/chapter-appearances/${id}`, data);
    clearCache();
    return response;
  },
  
  // 删除章节出现记录
  deleteAppearance: async (id) => {
    const response = await api.delete(`/chapter-appearances/${id}`);
    clearCache();
    return response;
  },
  
  // 删除实体的所有章节出现记录
  deleteEntityAppearances: async (entityType, entityId) => {
    const response = await api.delete(`/chapter-appearances/entity/${entityType}/${entityId}`);
    clearCache();
    return response;
  },
  
  // 删除章节的所有实体出现记录
  deleteChapterAppearances: async (chapterId) => {
    const response = await api.delete(`/chapter-appearances/chapter/${chapterId}`);
    clearCache();
    return response;
  },
  
  // 搜索实体（用于添加章节出现记录时选择实体）
  searchEntities: (projectId, entityType, keyword) => 
    api.get('/chapter-appearances/search-entities', { 
      params: { project_id: projectId, entity_type: entityType, keyword } 
    }),
  
  // 获取项目的章节出现统计
  getAppearanceStats: (projectId) => 
    api.get(`/chapter-appearances/stats/${projectId}`),
};

export default api;
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// 请求缓存
const requestCache = new Map();

// 批量请求队列
const batchRequests = new Map();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 添加60秒超时设置，AI生成需要更长时间
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
  getCharacters: (projectId, cancelToken) => api.get('/characters', { params: { project_id: projectId }, cancelToken }),
  getCharacter: (id, cancelToken) => api.get(`/characters/${id}`, { cancelToken }),
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
};

// 地点相关API
export const locationApi = {
  getLocations: (projectId, cancelToken) => api.get('/locations', { params: { project_id: projectId }, cancelToken }),
  getLocation: (id, cancelToken) => api.get(`/locations/${id}`, { cancelToken }),
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
  getItems: (projectId, cancelToken) => api.get('/items', { params: { project_id: projectId }, cancelToken }),
  getItem: (id, cancelToken) => api.get(`/items/${id}`, { cancelToken }),
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
  getFactions: (projectId, cancelToken) => api.get('/factions', { params: { project_id: projectId }, cancelToken }),
  getFaction: (id, cancelToken) => api.get(`/factions/${id}`, { cancelToken }),
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
};

export default api;
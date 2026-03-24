import { useState, useEffect, useCallback, useRef } from 'react';
import { blueprintApi, projectApi } from '../services/api';

export const useBlueprintBasicState = (projectId) => {
  const [activeView, setActiveView] = useState('outline');
  const [outlines, setOutlines] = useState([]);
  const [volumes, setVolumes] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedOutline, setSelectedOutline] = useState(null);
  const [selectedVolume, setSelectedVolume] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [projectInfo, setProjectInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const prevProjectIdRef = useRef(projectId);
  const isProjectIdValid = projectId !== null && projectId !== undefined && projectId !== '';

  const loadProjectInfo = useCallback(async () => {
    if (!isProjectIdValid) return;
    
    try {
      const response = await projectApi.getProject(projectId);
      setProjectInfo(response.data);
    } catch (error) {
      console.error('加载项目信息失败:', error);
      if (error.response && error.response.status === 404) {
        window.dispatchEvent(new CustomEvent('selectProject', { detail: { projectId: null } }));
        window.dispatchEvent(new CustomEvent('navigateTo', { detail: { key: 'project' } }));
      }
    }
  }, [projectId, isProjectIdValid]);

  const loadProjectOutline = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await blueprintApi.getProjectOutline(projectId);
      setOutlines(response.data);
      if (response.data.length > 0) {
        setSelectedOutline(response.data[0]);
      }
      setError(null);
    } catch (err) {
      setError('加载大纲失败');
      console.error('加载大纲失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const loadVolumes = useCallback(async () => {
    if (selectedOutline) {
      setIsLoading(true);
      try {
        const response = await blueprintApi.getOutlineVolumes(selectedOutline.id);
        setVolumes(response.data || []);
        setError(null);
      } catch (err) {
        setError('加载卷纲失败');
        console.error('加载卷纲失败:', err);
      } finally {
        setIsLoading(false);
      }
    }
  }, [selectedOutline]);

  const loadChapters = useCallback(async () => {
    if (selectedVolume) {
      setIsLoading(true);
      try {
        const response = await blueprintApi.getVolumeChapters(selectedVolume.id);
        setChapters(response.data || []);
        setError(null);
      } catch (err) {
        setError('加载章纲失败');
        console.error('加载章纲失败:', err);
      } finally {
        setIsLoading(false);
      }
    }
  }, [selectedVolume]);

  useEffect(() => {
    if (projectId !== null && projectId !== undefined && projectId !== '') {
      loadProjectOutline();
      loadProjectInfo();
    }
  }, [projectId, loadProjectOutline, loadProjectInfo]);

  useEffect(() => {
    if (selectedOutline) {
      loadVolumes();
    } else {
      setVolumes([]);
    }
  }, [selectedOutline, loadVolumes]);

  useEffect(() => {
    if (selectedVolume) {
      loadChapters();
    } else {
      setChapters([]);
    }
  }, [selectedVolume, loadChapters]);

  return {
    activeView, setActiveView,
    outlines, setOutlines,
    volumes, setVolumes,
    chapters, setChapters,
    selectedOutline, setSelectedOutline,
    selectedVolume, setSelectedVolume,
    selectedChapter, setSelectedChapter,
    projectInfo, setProjectInfo,
    isLoading, setIsLoading,
    error, setError,
    isProjectIdValid,
    loadProjectInfo,
    loadProjectOutline,
    loadVolumes,
    loadChapters,
  };
};
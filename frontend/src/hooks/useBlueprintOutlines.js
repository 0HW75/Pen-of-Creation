import { useState, useCallback } from 'react';
import { blueprintApi } from '../services/api';

export const useBlueprintOutlines = (outlines, volumes, chapters, selectedOutline, selectedVolume, selectedChapter, setOutlines, setVolumes, setChapters, setSelectedOutline, setSelectedVolume, setSelectedChapter, setActiveView, loadProjectOutline) => {
  const [isOutlineEditModalOpen, setIsOutlineEditModalOpen] = useState(false);
  const [outlineEditFormData, setOutlineEditFormData] = useState({});
  const [isVolumeEditModalOpen, setIsVolumeEditModalOpen] = useState(false);
  const [volumeEditFormData, setVolumeEditFormData] = useState({});

  const handleOutlineSelect = useCallback((outline) => {
    setSelectedOutline(outline);
    setSelectedVolume(null);
    setSelectedChapter(null);
    setVolumes([]);
    setChapters([]);
    setActiveView('outline');
  }, [setSelectedOutline, setSelectedVolume, setSelectedChapter, setVolumes, setChapters, setActiveView]);

  const handleVolumeSelect = useCallback((volume) => {
    setSelectedVolume(volume);
    setSelectedChapter(null);
    setChapters([]);
    setActiveView('volume');
  }, [setSelectedVolume, setSelectedChapter, setChapters, setActiveView]);

  const handleChapterSelect = useCallback((chapter) => {
    setSelectedChapter(chapter);
    setActiveView('chapter');
  }, [setSelectedChapter, setActiveView]);

  const handleDeleteOutline = useCallback(async (outlineId) => {
    try {
      await blueprintApi.deleteOutline(outlineId);
      loadProjectOutline();
      if (selectedOutline && selectedOutline.id === outlineId) {
        setSelectedOutline(null);
        setVolumes([]);
        setSelectedVolume(null);
        setChapters([]);
        setSelectedChapter(null);
      }
      console.log('大纲删除成功');
    } catch (error) {
      console.error('删除大纲失败:', error);
    }
  }, [selectedOutline, loadProjectOutline, setSelectedOutline, setVolumes, setSelectedVolume, setChapters, setSelectedChapter]);

  const handleDeleteVolume = useCallback(async (volumeId) => {
    try {
      await blueprintApi.deleteVolume(volumeId);
      if (selectedOutline) {
        const response = await blueprintApi.getOutlineVolumes(selectedOutline.id);
        setVolumes(response.data || []);
      }
      if (selectedVolume && selectedVolume.id === volumeId) {
        setSelectedVolume(null);
        setChapters([]);
        setSelectedChapter(null);
      }
      console.log('卷纲删除成功');
    } catch (error) {
      console.error('删除卷纲失败:', error);
    }
  }, [selectedOutline, selectedVolume, setVolumes, setSelectedVolume, setChapters, setSelectedChapter]);

  const handleDeleteChapter = useCallback(async (chapterId) => {
    try {
      await blueprintApi.deleteChapter(chapterId);
      if (selectedVolume) {
        const response = await blueprintApi.getVolumeChapters(selectedVolume.id);
        setChapters(response.data || []);
      }
      if (selectedChapter && selectedChapter.id === chapterId) {
        setSelectedChapter(null);
      }
      console.log('章纲删除成功');
    } catch (error) {
      console.error('删除章纲失败:', error);
    }
  }, [selectedVolume, selectedChapter, setChapters, setSelectedChapter]);

  const handleOpenOutlineEditModal = useCallback(() => {
    if (selectedOutline) {
      setOutlineEditFormData({ ...selectedOutline });
      setIsOutlineEditModalOpen(true);
    }
  }, [selectedOutline]);

  const handleSaveOutlineEdit = useCallback(async () => {
    if (!selectedOutline) return;
    
    try {
      const response = await blueprintApi.updateOutline(selectedOutline.id, outlineEditFormData);
      setOutlines(prev => prev.map(outline => 
        outline.id === selectedOutline.id ? response.data : outline
      ));
      setSelectedOutline(response.data);
      setIsOutlineEditModalOpen(false);
      console.log('大纲保存成功');
    } catch (error) {
      console.error('保存大纲失败:', error);
    }
  }, [selectedOutline, outlineEditFormData, setOutlines, setSelectedOutline]);

  const handleOpenVolumeEditModal = useCallback((volume) => {
    setSelectedVolume(volume);
    setVolumeEditFormData({ ...volume });
    setIsVolumeEditModalOpen(true);
  }, [setSelectedVolume]);

  const handleSaveVolumeEdit = useCallback(async () => {
    if (!selectedVolume) return;
    
    const updatedVolumes = volumes.map(volume => 
      volume.id === selectedVolume.id ? volumeEditFormData : volume
    );
    setVolumes(updatedVolumes);
    setIsVolumeEditModalOpen(false);
    console.log('卷纲保存成功');
  }, [selectedVolume, volumes, volumeEditFormData, setVolumes]);

  const handleCloseVolumeEditModal = useCallback(() => {
    setIsVolumeEditModalOpen(false);
  }, []);

  return {
    isOutlineEditModalOpen,
    setIsOutlineEditModalOpen,
    outlineEditFormData,
    setOutlineEditFormData,
    isVolumeEditModalOpen,
    setIsVolumeEditModalOpen,
    volumeEditFormData,
    setVolumeEditFormData,
    handleOutlineSelect,
    handleVolumeSelect,
    handleChapterSelect,
    handleDeleteOutline,
    handleDeleteVolume,
    handleDeleteChapter,
    handleOpenOutlineEditModal,
    handleSaveOutlineEdit,
    handleOpenVolumeEditModal,
    handleSaveVolumeEdit,
    handleCloseVolumeEditModal,
  };
};
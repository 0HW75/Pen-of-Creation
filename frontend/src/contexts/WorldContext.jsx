import React, { createContext, useContext, useState, useEffect } from 'react';
import { worldApi } from '../services/api';
import { message } from 'antd';

const WorldContext = createContext();

export const useWorld = () => {
  const context = useContext(WorldContext);
  if (!context) {
    throw new Error('useWorld must be used within a WorldProvider');
  }
  return context;
};

export const WorldProvider = ({ children }) => {
  const [worlds, setWorlds] = useState([]);
  const [selectedWorld, setSelectedWorld] = useState(null);
  const [loading, setLoading] = useState(false);

  // 加载世界列表
  const loadWorlds = async () => {
    setLoading(true);
    try {
      const response = await worldApi.getWorlds();
      setWorlds(response.data);
      
      // 从本地存储恢复选中的世界
      const savedWorldId = localStorage.getItem('selectedWorldId');
      if (savedWorldId) {
        const world = response.data.find(w => w.id === parseInt(savedWorldId));
        if (world) {
          setSelectedWorld(world);
        }
      }
    } catch (error) {
      console.error('加载世界列表失败:', error);
      message.error('加载世界列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 选择世界
  const selectWorld = (world) => {
    setSelectedWorld(world);
    if (world) {
      localStorage.setItem('selectedWorldId', world.id);
    } else {
      localStorage.removeItem('selectedWorldId');
    }
  };

  // 初始化时加载世界列表
  useEffect(() => {
    loadWorlds();
  }, []);

  const value = {
    worlds,
    selectedWorld,
    loading,
    loadWorlds,
    selectWorld,
  };

  return (
    <WorldContext.Provider value={value}>
      {children}
    </WorldContext.Provider>
  );
};

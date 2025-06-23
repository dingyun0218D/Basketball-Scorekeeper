import { useState, useEffect } from 'react';
import { Player } from '../types';

export const useSavedPlayers = () => {
  // 球员库状态管理 - 从localStorage加载初始数据
  const [savedPlayers, setSavedPlayers] = useState<Player[]>(() => {
    try {
      const saved = localStorage.getItem('basketball-saved-players');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('加载保存的球员数据失败:', error);
      return [];
    }
  });

  // 监听savedPlayers变化，自动保存到localStorage
  useEffect(() => {
    try {
      localStorage.setItem('basketball-saved-players', JSON.stringify(savedPlayers));
    } catch (error) {
      console.error('保存球员数据到本地存储失败:', error);
    }
  }, [savedPlayers]);

  // 处理删除已保存的球员
  const handleDeleteSavedPlayer = (playerId: string) => {
    setSavedPlayers(prev => prev.filter((p: Player) => p.id !== playerId));
  };

  return {
    savedPlayers,
    setSavedPlayers,
    handleDeleteSavedPlayer,
  };
}; 
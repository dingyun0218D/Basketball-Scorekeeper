import { useState } from 'react';
import { Player } from '../types';

// Tab类型
export type TabType = 'scoreboard' | 'players-stats' | 'history';

// 球员删除信息类型
export interface PlayerToDelete {
  teamId: string;
  playerId: string;
  playerInfo: Player;
}

// 球员同步信息类型
export interface PlayerSyncInfo {
  originalPlayer: Player;
  updatedPlayer: Player;
  conflictInfo?: {
    hasConflict: boolean;
    conflictingPlayers: Array<{
      teamName: string;
      player: Player;
    }>;
  };
}

export const useAppState = () => {
  // 标签页状态
  const [activeTab, setActiveTab] = useState<TabType>('scoreboard');
  
  // 添加球员模态框状态
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  
  // 删除球员确认模态框状态
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<PlayerToDelete | null>(null);
  
  // 重置游戏确认模态框状态
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  
  // 球员同步模态框状态
  const [showPlayerSyncModal, setShowPlayerSyncModal] = useState(false);
  const [playerSyncInfo, setPlayerSyncInfo] = useState<PlayerSyncInfo | null>(null);

  return {
    // 标签页相关
    activeTab,
    setActiveTab,
    
    // 添加球员模态框相关
    showAddPlayerModal,
    setShowAddPlayerModal,
    selectedTeamId,
    setSelectedTeamId,
    
    // 删除球员确认模态框相关
    showConfirmModal,
    setShowConfirmModal,
    playerToDelete,
    setPlayerToDelete,
    
    // 重置游戏确认模态框相关
    showResetConfirmModal,
    setShowResetConfirmModal,
    
    // 球员同步模态框相关
    showPlayerSyncModal,
    setShowPlayerSyncModal,
    playerSyncInfo,
    setPlayerSyncInfo,
  };
}; 
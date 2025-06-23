import { useGame } from './useGame';
import { Player } from '../types';
import { batchSyncPlayerInfo } from '../utils/playerSyncUtils';
import { PlayerSyncInfo } from './useAppState';

interface UsePlayerSyncProps {
  savedPlayers: Player[];
  setSavedPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  setPlayerSyncInfo: (info: PlayerSyncInfo | null) => void;
  setShowPlayerSyncModal: (show: boolean) => void;
}

export const usePlayerSync = ({
  savedPlayers,
  setSavedPlayers,
  setPlayerSyncInfo,
  setShowPlayerSyncModal
}: UsePlayerSyncProps) => {
  const { gameState, dispatch } = useGame();

  // 处理保存球员到球员库
  const handleSavePlayer = (player: Player) => {
    // 检查是否已存在相同ID的球员
    const existingIndex = savedPlayers.findIndex(p => p.id === player.id);
    if (existingIndex >= 0) {
      // 更新现有球员 - 需要检查是否要同步到队伍中
      const originalPlayer = savedPlayers[existingIndex];
      
      // 检查是否有基础信息变更
      const hasBasicInfoChange = 
        originalPlayer.name !== player.name ||
        originalPlayer.number !== player.number ||
        originalPlayer.position !== player.position;
      
      if (hasBasicInfoChange) {
        // 检查是否会产生号码冲突
        const teams = [gameState.homeTeam, gameState.awayTeam];
        const syncResult = batchSyncPlayerInfo(teams, originalPlayer, player);
        
        if (syncResult.allRemovedPlayers.length > 0) {
          // 有冲突，显示确认对话框
          setPlayerSyncInfo({
            originalPlayer,
            updatedPlayer: player,
            conflictInfo: {
              hasConflict: true,
              conflictingPlayers: syncResult.allRemovedPlayers.map(removed => ({
                teamName: removed.teamName,
                player: removed.player
              }))
            }
          });
          setShowPlayerSyncModal(true);
        } else if (syncResult.totalSyncedCount > 0) {
          // 无冲突但有需要同步的球员，直接同步
          dispatch({
            type: 'SYNC_PLAYER_INFO',
            payload: { originalPlayer, updatedPlayer: player }
          });
          setSavedPlayers(prev => prev.map((p: Player, index: number) => 
            index === existingIndex ? player : p
          ));
        } else {
          // 没有需要同步的球员，直接更新球员库
          setSavedPlayers(prev => prev.map((p: Player, index: number) => 
            index === existingIndex ? player : p
          ));
        }
      } else {
        // 没有基础信息变更，直接更新
        setSavedPlayers(prev => prev.map((p: Player, index: number) => 
          index === existingIndex ? player : p
        ));
      }
    } else {
      // 添加新球员
      setSavedPlayers(prev => [...prev, player]);
    }
  };

  // 确认球员同步
  const confirmPlayerSync = (playerSyncInfo: PlayerSyncInfo | null) => {
    if (playerSyncInfo) {
      // 执行同步
      dispatch({
        type: 'SYNC_PLAYER_INFO',
        payload: { 
          originalPlayer: playerSyncInfo.originalPlayer, 
          updatedPlayer: playerSyncInfo.updatedPlayer 
        }
      });
      
      // 更新球员库
      const existingIndex = savedPlayers.findIndex(p => p.id === playerSyncInfo.originalPlayer.id);
      if (existingIndex >= 0) {
        setSavedPlayers(prev => prev.map((p: Player, index: number) => 
          index === existingIndex ? playerSyncInfo.updatedPlayer : p
        ));
      }
    }
    
    setShowPlayerSyncModal(false);
    setPlayerSyncInfo(null);
  };

  // 取消球员同步
  const cancelPlayerSync = () => {
    setShowPlayerSyncModal(false);
    setPlayerSyncInfo(null);
  };

  return {
    handleSavePlayer,
    confirmPlayerSync,
    cancelPlayerSync,
  };
}; 
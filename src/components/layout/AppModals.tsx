import React from 'react';
import { PlayerSelectionModal } from '../PlayerManagement/PlayerSelectionModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { PlayerSyncConfirmModal } from '../common/PlayerSyncConfirmModal';
import { Player, GameState } from '../../types';
import { PlayerToDelete, PlayerSyncInfo } from '../../hooks/useAppState';

interface AppModalsProps {
  // 添加球员模态框
  showAddPlayerModal: boolean;
  setShowAddPlayerModal: (show: boolean) => void;
  selectedTeamId: string;
  savedPlayers: Player[];
  onAddPlayer: (teamId: string, player: Player) => void;
  onSavePlayer: (player: Player) => void;
  onDeleteSavedPlayer: (playerId: string) => void;
  
  // 删除确认模态框
  showConfirmModal: boolean;
  playerToDelete: PlayerToDelete | null;
  onConfirmRemovePlayer: (playerToDelete: PlayerToDelete | null) => void;
  onCancelRemovePlayer: () => void;
  
  // 重置游戏确认模态框
  showResetConfirmModal: boolean;
  onConfirmResetGame: () => void;
  onCancelResetGame: () => void;
  
  // 球员同步模态框
  showPlayerSyncModal: boolean;
  playerSyncInfo: PlayerSyncInfo | null;
  onConfirmPlayerSync: (playerSyncInfo: PlayerSyncInfo | null) => void;
  onCancelPlayerSync: () => void;
  
  // 游戏状态
  gameState: GameState;
}

export const AppModals: React.FC<AppModalsProps> = ({
  showAddPlayerModal,
  setShowAddPlayerModal,
  selectedTeamId,
  savedPlayers,
  onAddPlayer,
  onSavePlayer,
  onDeleteSavedPlayer,
  showConfirmModal,
  playerToDelete,
  onConfirmRemovePlayer,
  onCancelRemovePlayer,
  showResetConfirmModal,
  onConfirmResetGame,
  onCancelResetGame,
  showPlayerSyncModal,
  playerSyncInfo,
  onConfirmPlayerSync,
  onCancelPlayerSync,
  gameState
}) => {
  return (
    <>
      {/* 添加球员模态框 */}
      <PlayerSelectionModal
        isOpen={showAddPlayerModal}
        onClose={() => setShowAddPlayerModal(false)}
        team={
          selectedTeamId === gameState.homeTeam.id 
            ? gameState.homeTeam 
            : gameState.awayTeam
        }
        savedPlayers={savedPlayers}
        onSelectPlayer={(player) => onAddPlayer(selectedTeamId, player)}
        onAddNewPlayer={(player) => onAddPlayer(selectedTeamId, player)}
        onSavePlayer={onSavePlayer}
        onDeleteSavedPlayer={onDeleteSavedPlayer}
      />

      {/* 删除球员确认模态框 */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title="删除球员"
        message={
          playerToDelete 
            ? `确定要删除球员 #${playerToDelete.playerInfo.number} ${playerToDelete.playerInfo.name} 吗？`
            : ''
        }
        details={
          playerToDelete 
            ? [
                `得分：${playerToDelete.playerInfo.points}分`,
                `篮板：${playerToDelete.playerInfo.rebounds}个`,
                `助攻：${playerToDelete.playerInfo.assists}次`,
                `抢断：${playerToDelete.playerInfo.steals}次`,
                `盖帽：${playerToDelete.playerInfo.blocks}次`,
                `犯规：${playerToDelete.playerInfo.fouls}次`
              ]
            : []
        }
        onConfirm={() => onConfirmRemovePlayer(playerToDelete)}
        onCancel={onCancelRemovePlayer}
        confirmText="删除"
        cancelText="取消"
        type="danger"
      />

      {/* 重置比赛确认模态框 */}
      <ConfirmModal
        isOpen={showResetConfirmModal}
        title="重置比赛"
        message="确定要重置比赛吗？这将清除所有比赛数据。"
        details={[
          `当前比分：${gameState.homeTeam.name} ${gameState.homeTeam.score} - ${gameState.awayTeam.score} ${gameState.awayTeam.name}`,
          `比赛节数：第${gameState.quarter}节`,
          `比赛时间：${gameState.time}`,
          `球员总数：${gameState.homeTeam.players.length + gameState.awayTeam.players.length}人`
        ]}
        onConfirm={onConfirmResetGame}
        onCancel={onCancelResetGame}
        confirmText="重置"
        cancelText="取消"
        type="danger"
      />

      {/* 球员同步确认模态框 */}
      {showPlayerSyncModal && playerSyncInfo && (
        <PlayerSyncConfirmModal
          isOpen={showPlayerSyncModal}
          onClose={onCancelPlayerSync}
          onConfirm={() => onConfirmPlayerSync(playerSyncInfo)}
          originalPlayer={playerSyncInfo.originalPlayer}
          updatedPlayer={playerSyncInfo.updatedPlayer}
          conflictInfo={playerSyncInfo.conflictInfo}
        />
      )}
    </>
  );
};
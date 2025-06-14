import React, { useState } from 'react';
import { Team, Player } from '../../types';
import { SimplePlayerCard } from './SimplePlayerCard';
import { PlayerSelectionModal } from '../PlayerManagement';

interface TeamPlayerAreaProps {
  team: Team;
  maxPlayersToShow: number;
  savedPlayers: Player[];
  onAddPlayer: (teamId: string, player: Player) => void;
  onTogglePlayerCourtStatus: (teamId: string, playerId: string) => void;
  onRemovePlayer: (teamId: string, playerId: string) => void;
  onSavePlayer: (player: Player) => void;
  onDeleteSavedPlayer: (playerId: string) => void;
}

export const TeamPlayerArea: React.FC<TeamPlayerAreaProps> = ({
  team,
  maxPlayersToShow,
  savedPlayers,
  onAddPlayer,
  onTogglePlayerCourtStatus,
  onRemovePlayer,
  onSavePlayer,
  onDeleteSavedPlayer
}) => {
  const [showPlayerModal, setShowPlayerModal] = useState(false);

  const handleSelectPlayer = (player: Player) => {
    onAddPlayer(team.id, player);
  };

  const handleAddNewPlayer = (player: Player) => {
    onAddPlayer(team.id, player);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold" style={{ color: team.color }}>
            {team.name} 球员管理 ({team.players.length}/{maxPlayersToShow})
          </h3>
          <button
            onClick={() => setShowPlayerModal(true)}
            className={`${
              team.id.includes('home') ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600'
            } text-white px-3 py-1 rounded text-sm font-medium`}
            disabled={team.players.length >= maxPlayersToShow}
          >
            + 球员
          </button>
        </div>
        
        {/* 球员网格 - 响应式布局 */}
        {team.players.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>暂无球员</p>
            <p className="text-sm mt-1">点击上方按钮添加球员</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
            {team.players.slice(0, maxPlayersToShow).map(player => (
              <SimplePlayerCard
                key={player.id}
                player={player}
                teamColor={team.color}
                teamId={team.id}
                onToggleCourtStatus={() => onTogglePlayerCourtStatus(team.id, player.id)}
                onRemove={() => onRemovePlayer(team.id, player.id)}
              />
            ))}
          </div>
        )}
        
        {team.players.length > maxPlayersToShow && (
          <div className="mt-3 text-center text-sm text-gray-500">
            只显示前{maxPlayersToShow}名球员，共{team.players.length}名
          </div>
        )}
      </div>

      {/* 球员选择弹窗 */}
      <PlayerSelectionModal
        isOpen={showPlayerModal}
        onClose={() => setShowPlayerModal(false)}
        team={team}
        savedPlayers={savedPlayers}
        onSelectPlayer={handleSelectPlayer}
        onAddNewPlayer={handleAddNewPlayer}
        onSavePlayer={onSavePlayer}
        onDeleteSavedPlayer={onDeleteSavedPlayer}
      />
    </>
  );
}; 
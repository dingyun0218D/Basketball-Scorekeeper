import React, { useState } from 'react';
import { Player, Team } from '../../types';
import { PlayerList } from './PlayerList';
import { AddPlayerForm } from './AddPlayerForm';

interface PlayerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
  savedPlayers: Player[];
  onSelectPlayer: (player: Player) => void;
  onAddNewPlayer: (player: Player) => void;
  onSavePlayer: (player: Player) => void;
  onDeleteSavedPlayer: (playerId: string) => void;
}

export const PlayerSelectionModal: React.FC<PlayerSelectionModalProps> = ({
  isOpen,
  onClose,
  team,
  savedPlayers,
  onSelectPlayer,
  onAddNewPlayer,
  onSavePlayer,
  onDeleteSavedPlayer
}) => {
  const [activeTab, setActiveTab] = useState<'saved' | 'new'>('saved');

  if (!isOpen) return null;

  const handleSelectPlayer = (player: Player) => {
    // 检查球员号码是否已存在
    const existingNumbers = team.players.map(p => p.number);
    if (existingNumbers.includes(player.number)) {
      alert(`号码 ${player.number} 已被使用，请修改球员号码后再添加`);
      return;
    }
    
    onSelectPlayer(player);
    onClose();
  };

  const handleAddNewPlayer = (player: Player) => {
    // 检查球员号码是否已存在
    const existingNumbers = team.players.map(p => p.number);
    if (existingNumbers.includes(player.number)) {
      alert(`号码 ${player.number} 已被使用，请修改球员号码后再添加`);
      return;
    }
    
    onAddNewPlayer(player);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[800px] h-[600px] flex flex-col">
        {/* 弹窗头部 - 固定高度 */}
        <div className="flex justify-between items-center p-6 border-b flex-shrink-0">
          <h2 className="text-xl font-bold" style={{ color: team.color }}>
            为 {team.name} 选择球员
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* 标签页切换 - 固定高度 */}
        <div className="flex border-b flex-shrink-0">
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'saved'
                ? 'border-b-2 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            style={{
              borderBottomColor: activeTab === 'saved' ? team.color : 'transparent'
            }}
          >
            已保存球员 ({savedPlayers.length})
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'new'
                ? 'border-b-2 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            style={{
              borderBottomColor: activeTab === 'new' ? team.color : 'transparent'
            }}
          >
            新增球员
          </button>
        </div>

        {/* 内容区域 - 可滚动，占据剩余空间 */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'saved' ? (
            <PlayerList
              players={savedPlayers}
              teamColor={team.color}
              existingNumbers={team.players.map(p => p.number)}
              onSelectPlayer={handleSelectPlayer}
              onSavePlayer={onSavePlayer}
              onDeletePlayer={onDeleteSavedPlayer}
            />
          ) : (
            <AddPlayerForm
              teamColor={team.color}
              existingNumbers={team.players.map(p => p.number)}
              onAddPlayer={handleAddNewPlayer}
              onSavePlayer={onSavePlayer}
            />
          )}
        </div>
      </div>
    </div>
  );
}; 
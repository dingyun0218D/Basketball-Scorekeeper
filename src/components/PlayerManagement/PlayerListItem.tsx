import React, { useState } from 'react';
import { Player } from '../../types';

interface PlayerListItemProps {
  player: Player;
  teamColor: string;
  isNumberConflict: boolean;
  onSelect: () => void;
  onSave: (player: Player) => void;
  onDelete: () => void;
}

export const PlayerListItem: React.FC<PlayerListItemProps> = ({
  player,
  teamColor,
  isNumberConflict,
  onSelect,
  onSave,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlayer, setEditedPlayer] = useState(player);

  const handleEditStart = () => {
    setIsEditing(true);
    setEditedPlayer({ ...player });
  };

  const handleEditSave = () => {
    onSave(editedPlayer);
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditedPlayer(player);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="col-span-2 flex items-center justify-center">
          <input
            type="number"
            value={editedPlayer.number}
            onChange={(e) => setEditedPlayer({...editedPlayer, number: parseInt(e.target.value) || 0})}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-center"
            min="0"
            max="99"
          />
        </div>
        <div className="col-span-4 flex items-center">
          <input
            type="text"
            value={editedPlayer.name}
            onChange={(e) => setEditedPlayer({...editedPlayer, name: e.target.value})}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
          />
        </div>
        <div className="col-span-2 flex items-center justify-center">
          <select
            value={editedPlayer.position}
            onChange={(e) => setEditedPlayer({...editedPlayer, position: e.target.value})}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
          >
            <option value="PG">PG</option>
            <option value="SG">SG</option>
            <option value="SF">SF</option>
            <option value="PF">PF</option>
            <option value="C">C</option>
          </select>
        </div>
        <div className="col-span-2 flex items-center justify-center">
          <span className="text-xs text-blue-600">编辑中</span>
        </div>
        <div className="col-span-2 flex items-center justify-center space-x-1">
          <button
            onClick={handleEditSave}
            className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded"
          >
            保存
          </button>
          <button
            onClick={handleEditCancel}
            className="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded"
          >
            取消
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-12 gap-4 px-4 py-3 rounded-lg cursor-pointer transition-all hover:shadow-md ${
        isNumberConflict 
          ? 'bg-red-50 border border-red-200 hover:bg-red-100' 
          : 'bg-white border border-gray-200 hover:bg-gray-50 hover:border-blue-300'
      }`}
      onClick={onSelect}
    >
      <div className="col-span-2 flex items-center justify-center">
        <span className="font-bold text-lg" style={{ color: teamColor }}>
          #{player.number}
        </span>
      </div>
      <div className="col-span-4 flex items-center">
        <span className="font-medium text-gray-800 truncate">
          {player.name}
        </span>
      </div>
      <div className="col-span-2 flex items-center justify-center">
        <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
          {player.position}
        </span>
      </div>
      <div className="col-span-2 flex items-center justify-center">
        {isNumberConflict ? (
          <span className="text-xs text-red-600 font-medium">
            ⚠️ 号码冲突
          </span>
        ) : (
          <span className="text-xs text-green-600 font-medium">
            ✓ 可用
          </span>
        )}
      </div>
      <div className="col-span-2 flex items-center justify-center space-x-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleEditStart();
          }}
          className="text-blue-500 hover:text-blue-700 text-sm p-1"
          title="编辑球员"
        >
          ✏️
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`确定要删除球员 ${player.name} 吗？`)) {
              onDelete();
            }
          }}
          className="text-red-500 hover:text-red-700 text-sm p-1"
          title="删除球员"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}; 
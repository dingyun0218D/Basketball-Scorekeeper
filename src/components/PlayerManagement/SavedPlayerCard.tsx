import React, { useState } from 'react';
import { Player } from '../../types';

interface SavedPlayerCardProps {
  player: Player;
  teamColor: string;
  isNumberConflict: boolean;
  onSelect: () => void;
  onSave: (player: Player) => void;
  onDelete: () => void;
}

export const SavedPlayerCard: React.FC<SavedPlayerCardProps> = ({
  player,
  teamColor,
  isNumberConflict,
  onSelect,
  onSave,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlayer, setEditedPlayer] = useState(player);

  const handleSave = () => {
    onSave(editedPlayer);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedPlayer(player);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white border-2 border-blue-300 rounded-lg p-3 shadow-sm">
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">姓名</label>
            <input
              type="text"
              value={editedPlayer.name}
              onChange={(e) => setEditedPlayer({...editedPlayer, name: e.target.value})}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">号码</label>
            <input
              type="number"
              value={editedPlayer.number}
              onChange={(e) => setEditedPlayer({...editedPlayer, number: parseInt(e.target.value) || 0})}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              min="0"
              max="99"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">位置</label>
            <select
              value={editedPlayer.position}
              onChange={(e) => setEditedPlayer({...editedPlayer, position: e.target.value})}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="PG">控球后卫 (PG)</option>
              <option value="SG">得分后卫 (SG)</option>
              <option value="SF">小前锋 (SF)</option>
              <option value="PF">大前锋 (PF)</option>
              <option value="C">中锋 (C)</option>
            </select>
          </div>
          
          <div className="flex space-x-2 pt-1">
            <button
              onClick={handleSave}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded text-xs font-medium"
            >
              保存
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-1 px-2 rounded text-xs font-medium"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`bg-white rounded-lg p-3 shadow-sm border-2 transition-all cursor-pointer hover:shadow-md ${
        isNumberConflict 
          ? 'border-red-300 bg-red-50' 
          : 'border-gray-200 hover:border-blue-300'
      }`}
      onClick={onSelect}
    >
      {/* 操作按钮 */}
      <div className="flex justify-end space-x-1 mb-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="text-blue-500 hover:text-blue-700 text-xs p-1"
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
          className="text-red-500 hover:text-red-700 text-xs p-1"
          title="删除球员"
        >
          🗑️
        </button>
      </div>

      {/* 球员信息 - 更紧凑的布局 */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-1">
          <div className="text-lg font-bold" style={{ color: teamColor }}>
            #{player.number}
          </div>
          <div className="font-semibold text-gray-800 text-sm truncate">
            {player.name}
          </div>
        </div>
        <div className="text-xs text-gray-600">
          {player.position}
        </div>
        
        {isNumberConflict && (
          <div className="mt-1 text-xs text-red-600 font-medium">
            ⚠️ 号码冲突
          </div>
        )}
      </div>
    </div>
  );
}; 
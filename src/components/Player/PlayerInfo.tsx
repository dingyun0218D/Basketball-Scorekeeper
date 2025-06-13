import React from 'react';
import { Player } from '../../types';

interface PlayerInfoProps {
  player: Player;
  teamColor: string;
  onRemove: () => void;
}

export const PlayerInfo: React.FC<PlayerInfoProps> = ({ player, teamColor, onRemove }) => {
  return (
    <div className="relative">
      {/* 移除按钮 - 左上角小x */}
      <button
        onClick={onRemove}
        className="absolute top-0 left-0 w-4 h-4 bg-gray-400 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-xs leading-none transition-colors z-10"
        title="移除球员"
      >
        ×
      </button>

      {/* 球员基本信息 */}
      <div className="flex justify-between items-center mb-2 pt-1">
        <div className="flex-1 min-w-0 pl-2">
          <div className="text-sm font-bold text-gray-800 truncate">
            #{player.number} {player.name}
          </div>
          <div className="text-xs text-gray-500">{player.position}</div>
        </div>
        <div className="text-right ml-2">
          <div className="text-xl font-bold" style={{ color: teamColor }}>
            {player.points}
          </div>
        </div>
      </div>
    </div>
  );
}; 
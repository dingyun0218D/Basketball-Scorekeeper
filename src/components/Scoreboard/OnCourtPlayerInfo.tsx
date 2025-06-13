import React from 'react';
import { Player } from '../../types';

interface OnCourtPlayerInfoProps {
  player: Player;
  teamColor: string;
  onToggleCourtStatus: () => void;
}

export const OnCourtPlayerInfo: React.FC<OnCourtPlayerInfoProps> = ({ 
  player, 
  teamColor, 
  onToggleCourtStatus 
}) => {
  return (
    <div className="relative">
      {/* 下场按钮 - 右上角 */}
      <button
        onClick={onToggleCourtStatus}
        className="absolute top-0 right-0 w-4 h-4 bg-green-500 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-xs leading-none transition-colors z-10"
        title="点击下场"
      >
        ×
      </button>

      {/* 球员基本信息 */}
      <div className="flex justify-between items-center mb-2 pt-1 pr-5">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-gray-800 truncate flex items-center">
            #{player.number} {player.name}
            <span className="ml-2 inline-block w-2 h-2 bg-green-500 rounded-full" title="在场上"></span>
          </div>
          <div className="text-xs text-gray-500">{player.position}</div>
        </div>
        <div className="text-right mr-2">
          <div className="text-xl font-bold" style={{ color: teamColor }}>
            {player.points}
          </div>
        </div>
      </div>
    </div>
  );
}; 
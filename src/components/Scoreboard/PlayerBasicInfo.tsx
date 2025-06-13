import React from 'react';
import { Player } from '../../types';

interface PlayerBasicInfoProps {
  player: Player;
  teamColor: string;
  showRemoveButton?: boolean;
  onRemove?: () => void;
}

export const PlayerBasicInfo: React.FC<PlayerBasicInfoProps> = ({
  player,
  teamColor,
  showRemoveButton = false,
  onRemove
}) => {
  return (
    <div className={`relative flex items-center space-x-3 ${showRemoveButton ? 'pr-5' : ''}`}>
      {/* 移除按钮 - 可选 */}
      {showRemoveButton && onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-0 right-0 w-4 h-4 bg-gray-400 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-xs leading-none transition-colors z-10"
          title="移除球员"
        >
          ×
        </button>
      )}

      {/* 球员信息 - 使用和上场球员相同的布局 */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-gray-800 truncate flex items-center">
          #{player.number} {player.name}
          {player.isOnCourt && (
            <span className="ml-2 inline-block w-2 h-2 bg-green-500 rounded-full" title="在场上"></span>
          )}
        </div>
        <div className="text-xs text-gray-500">{player.position}</div>
      </div>
      
      {/* 得分显示 - 左移避免与删除按键重叠 */}
      <div className="text-right mr-2">
        <div className="text-lg font-bold" style={{ color: teamColor }}>
          {player.points}
        </div>
      </div>
    </div>
  );
}; 
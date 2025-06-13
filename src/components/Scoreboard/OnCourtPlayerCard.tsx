import React from 'react';
import { Player } from '../../types';
import { PlayerInfo, PlayerStats, PlayerActions } from '../Player';

interface OnCourtPlayerCardProps {
  player: Player;
  teamColor: string;
  teamId: string;
  onScoreUpdate: (points: number) => void;
  onStatUpdate: (stat: string, value: number) => void;
  onAddFoul: () => void;
  onShotAttempt: (shotType: 'field' | 'three' | 'free') => void;
  onUndoScore: (scoreType: '1' | '2' | '3') => void;
  onToggleCourtStatus: () => void;
}

export const OnCourtPlayerCard: React.FC<OnCourtPlayerCardProps> = ({
  player,
  teamColor,
  onScoreUpdate,
  onStatUpdate,
  onAddFoul,
  onShotAttempt,
  onUndoScore,
  onToggleCourtStatus
}) => {
  // 创建一个增强的 PlayerInfo 组件，包含下场功能
  const OnCourtPlayerInfo: React.FC<{ player: Player; teamColor: string; onToggleCourtStatus: () => void }> = ({ player, teamColor, onToggleCourtStatus }) => {
    return (
      <div className="relative">
        {/* 下场按钮 - 左上角 */}
        <button
          onClick={onToggleCourtStatus}
          className="absolute top-0 left-0 w-4 h-4 bg-green-500 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-xs leading-none transition-colors z-10"
          title="点击下场"
        >
          ×
        </button>

        {/* 球员基本信息 */}
        <div className="flex justify-between items-center mb-2 pt-1">
          <div className="flex-1 min-w-0 pl-2">
            <div className="text-sm font-bold text-gray-800 truncate flex items-center">
              #{player.number} {player.name}
              <span className="ml-2 inline-block w-2 h-2 bg-green-500 rounded-full" title="在场上"></span>
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

  return (
    <div className="border border-green-500 rounded-lg p-3 bg-green-50 hover:bg-white transition-colors">
      <OnCourtPlayerInfo 
        player={player} 
        teamColor={teamColor} 
        onToggleCourtStatus={onToggleCourtStatus} 
      />
      
      <PlayerStats player={player} />
      
      <PlayerActions
        player={player}
        onScoreUpdate={onScoreUpdate}
        onStatUpdate={onStatUpdate}
        onAddFoul={onAddFoul}
        onShotAttempt={onShotAttempt}
        onUndoScore={onUndoScore}
      />
    </div>
  );
}; 
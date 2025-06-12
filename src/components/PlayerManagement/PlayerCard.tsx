import React from 'react';
import { Player } from '../../types';

interface PlayerCardProps {
  player: Player;
  onStatUpdate: (stat: string, value: number) => void;
  onAddFoul: () => void;
  onRemove: () => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  onStatUpdate,
  onAddFoul,
  onRemove,
}) => {
  const fieldGoalPercentage = player.fieldGoalsAttempted > 0 
    ? Math.round((player.fieldGoalsMade / player.fieldGoalsAttempted) * 100) 
    : 0;

  const freeThrowPercentage = player.freeThrowsAttempted > 0 
    ? Math.round((player.freeThrowsMade / player.freeThrowsAttempted) * 100) 
    : 0;

  const StatButton: React.FC<{ 
    label: string; 
    value: number; 
    statKey: string; 
    increment?: number;
  }> = ({ label, value, statKey, increment = 1 }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">{label}:</span>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onStatUpdate(statKey, -increment)}
          className="btn btn-danger px-2 py-1 text-xs"
          disabled={value <= 0}
        >
          -
        </button>
        <span className="text-sm font-mono w-8 text-center">{value}</span>
        <button
          onClick={() => onStatUpdate(statKey, increment)}
          className="btn btn-success px-2 py-1 text-xs"
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <div className="player-card">
      {/* 球员基本信息 */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="player-number">#{player.number}</div>
          <div className="player-name">{player.name}</div>
          <div className="text-sm text-gray-500">{player.position}</div>
        </div>
        <button
          onClick={onRemove}
          className="btn btn-danger btn-sm"
          title="移除球员"
        >
          ×
        </button>
      </div>

      {/* 得分统计 */}
      <div className="mb-3 p-2 bg-blue-50 rounded">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">{player.points}</div>
          <div className="text-xs text-gray-600">总得分</div>
        </div>
      </div>

      {/* 详细统计 */}
      <div className="player-stats space-y-2">
        <StatButton label="篮板" value={player.rebounds} statKey="rebounds" />
        <StatButton label="助攻" value={player.assists} statKey="assists" />
        <StatButton label="抢断" value={player.steals} statKey="steals" />
        <StatButton label="盖帽" value={player.blocks} statKey="blocks" />
        
        {/* 投篮统计 */}
        <div className="border-t pt-2 mt-2">
          <div className="text-xs font-semibold text-gray-700 mb-1">投篮统计</div>
          <div className="text-xs space-y-1">
            <div>
              命中率: {player.fieldGoalsMade}/{player.fieldGoalsAttempted} ({fieldGoalPercentage}%)
            </div>
            <div>
              罚球: {player.freeThrowsMade}/{player.freeThrowsAttempted} ({freeThrowPercentage}%)
            </div>
            <div>
              3分: {player.threePointersMade}/{player.threePointersAttempted}
            </div>
          </div>
        </div>

        {/* 犯规 */}
        <div className="border-t pt-2 mt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">犯规:</span>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-mono w-8 text-center ${
                player.fouls >= 5 ? 'text-red-600 font-bold' : ''
              }`}>
                {player.fouls}
              </span>
              <button
                onClick={onAddFoul}
                className="btn btn-warning px-2 py-1 text-xs"
                disabled={player.fouls >= 6}
              >
                +犯规
              </button>
            </div>
          </div>
          {player.fouls >= 5 && (
            <div className="text-xs text-red-600 mt-1">
              {player.fouls === 5 ? '已达5次犯规' : '已被罚出场'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 
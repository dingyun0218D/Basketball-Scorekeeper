import React from 'react';
import { Team } from '../../types';
import { DraggablePlayerCard } from './DraggablePlayerCard';
import { OnCourtArea } from './OnCourtArea';

interface ScoreboardPlayerSectionProps {
  homeTeam: Team;
  awayTeam: Team;
  onScoreUpdate: (teamId: string, points: number, playerId?: string) => void;
  onPlayerStatUpdate: (teamId: string, playerId: string, stat: string, value: number) => void;
  onAddFoul: (teamId: string, playerId: string) => void;
  onShotAttempt: (teamId: string, playerId: string, shotType: 'field' | 'three' | 'free') => void;
  onUndoScore: (teamId: string, playerId: string, scoreType: '1' | '2' | '3') => void;
  onRemovePlayer: (teamId: string, playerId: string) => void;
  onAddPlayer: (teamId: string) => void;
  onTogglePlayerCourtStatus: (teamId: string, playerId: string) => void;
}

export const ScoreboardPlayerSection: React.FC<ScoreboardPlayerSectionProps> = ({
  homeTeam,
  awayTeam,
  onScoreUpdate,
  onPlayerStatUpdate,
  onAddFoul,
  onShotAttempt,
  onUndoScore,
  onRemovePlayer,
  onAddPlayer,
  onTogglePlayerCourtStatus
}) => {
  const maxPlayersToShow = 15; // 每队最多显示15个球员

  return (
    <div className="space-y-6">
      {/* 上场人员区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OnCourtArea
          team={homeTeam}
          onTogglePlayerStatus={(playerId) => onTogglePlayerCourtStatus(homeTeam.id, playerId)}
          onScoreUpdate={onScoreUpdate}
          onPlayerStatUpdate={onPlayerStatUpdate}
          onAddFoul={onAddFoul}
          onShotAttempt={onShotAttempt}
          onUndoScore={onUndoScore}
        />
        <OnCourtArea
          team={awayTeam}
          onTogglePlayerStatus={(playerId) => onTogglePlayerCourtStatus(awayTeam.id, playerId)}
          onScoreUpdate={onScoreUpdate}
          onPlayerStatUpdate={onPlayerStatUpdate}
          onAddFoul={onAddFoul}
          onShotAttempt={onShotAttempt}
          onUndoScore={onUndoScore}
        />
      </div>

      {/* 球员管理区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 主队球员区域 */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold" style={{ color: homeTeam.color }}>
              {homeTeam.name} 球员管理 ({homeTeam.players.length}/15)
            </h3>
            <button
              onClick={() => onAddPlayer(homeTeam.id)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium"
              disabled={homeTeam.players.length >= maxPlayersToShow}
            >
              + 球员
            </button>
          </div>
          
          {/* 球员网格 - 响应式布局 */}
          {homeTeam.players.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>暂无球员</p>
              <p className="text-sm mt-1">点击上方按钮添加球员</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
              {homeTeam.players.slice(0, maxPlayersToShow).map(player => (
                <DraggablePlayerCard
                  key={player.id}
                  player={player}
                  teamColor={homeTeam.color}
                  teamId={homeTeam.id}
                  onScoreUpdate={(points: number) => onScoreUpdate(homeTeam.id, points, player.id)}
                  onStatUpdate={(stat: string, value: number) => onPlayerStatUpdate(homeTeam.id, player.id, stat, value)}
                  onAddFoul={() => onAddFoul(homeTeam.id, player.id)}
                  onShotAttempt={(shotType: 'field' | 'three' | 'free') => onShotAttempt(homeTeam.id, player.id, shotType)}
                  onUndoScore={(scoreType: '1' | '2' | '3') => onUndoScore(homeTeam.id, player.id, scoreType)}
                  onToggleCourtStatus={() => onTogglePlayerCourtStatus(homeTeam.id, player.id)}
                  onRemove={() => onRemovePlayer(homeTeam.id, player.id)}
                />
              ))}
            </div>
          )}
          
          {homeTeam.players.length > maxPlayersToShow && (
            <div className="mt-3 text-center text-sm text-gray-500">
              只显示前{maxPlayersToShow}名球员，共{homeTeam.players.length}名
            </div>
          )}
        </div>

        {/* 客队球员区域 */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold" style={{ color: awayTeam.color }}>
              {awayTeam.name} 球员管理 ({awayTeam.players.length}/15)
            </h3>
            <button
              onClick={() => onAddPlayer(awayTeam.id)}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium"
              disabled={awayTeam.players.length >= maxPlayersToShow}
            >
              + 球员
            </button>
          </div>
          
          {/* 球员网格 - 响应式布局 */}
          {awayTeam.players.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>暂无球员</p>
              <p className="text-sm mt-1">点击上方按钮添加球员</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
              {awayTeam.players.slice(0, maxPlayersToShow).map(player => (
                <DraggablePlayerCard
                  key={player.id}
                  player={player}
                  teamColor={awayTeam.color}
                  teamId={awayTeam.id}
                  onScoreUpdate={(points: number) => onScoreUpdate(awayTeam.id, points, player.id)}
                  onStatUpdate={(stat: string, value: number) => onPlayerStatUpdate(awayTeam.id, player.id, stat, value)}
                  onAddFoul={() => onAddFoul(awayTeam.id, player.id)}
                  onShotAttempt={(shotType: 'field' | 'three' | 'free') => onShotAttempt(awayTeam.id, player.id, shotType)}
                  onUndoScore={(scoreType: '1' | '2' | '3') => onUndoScore(awayTeam.id, player.id, scoreType)}
                  onToggleCourtStatus={() => onTogglePlayerCourtStatus(awayTeam.id, player.id)}
                  onRemove={() => onRemovePlayer(awayTeam.id, player.id)}
                />
              ))}
            </div>
          )}
          
          {awayTeam.players.length > maxPlayersToShow && (
            <div className="mt-3 text-center text-sm text-gray-500">
              只显示前{maxPlayersToShow}名球员，共{awayTeam.players.length}名
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 
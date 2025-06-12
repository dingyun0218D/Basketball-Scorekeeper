import React, { useState } from 'react';
import { Team, Player } from '../../types';
import { TeamStats } from './TeamStats';
import { DetailedPlayerCard } from './DetailedPlayerCard';

interface PlayerStatsManagementProps {
  homeTeam: Team;
  awayTeam: Team;
  onScoreUpdate: (teamId: string, points: number, playerId?: string) => void;
  onPlayerStatUpdate: (teamId: string, playerId: string, stat: string, value: number) => void;
  onAddFoul: (teamId: string, playerId: string) => void;
  onShotAttempt?: (teamId: string, playerId: string, shotType: 'field' | 'three' | 'free') => void;
  onRemovePlayer: (teamId: string, playerId: string) => void;
  onAddPlayer: (teamId: string) => void;
}

export const PlayerStatsManagement: React.FC<PlayerStatsManagementProps> = ({
  homeTeam,
  awayTeam,
  onScoreUpdate,
  onPlayerStatUpdate,
  onAddFoul,
  onShotAttempt,
  onRemovePlayer,
  onAddPlayer
}) => {
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');
  const [activeTeam, setActiveTeam] = useState<'home' | 'away' | 'both'>('both');

  // 渲染团队概览
  const renderTeamOverview = () => (
    <div className="space-y-6">
      {/* 整体比较统计 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">比赛整体统计对比</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2" style={{ color: homeTeam.color }}>{homeTeam.name}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>总得分:</span>
                <span className="font-bold">{homeTeam.score}</span>
              </div>
              <div className="flex justify-between">
                <span>球员数:</span>
                <span className="font-bold">{homeTeam.players.length}</span>
              </div>
              <div className="flex justify-between">
                <span>总犯规:</span>
                <span className="font-bold">{homeTeam.fouls}</span>
              </div>
              <div className="flex justify-between">
                <span>剩余暂停:</span>
                <span className="font-bold">{homeTeam.timeouts}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2" style={{ color: awayTeam.color }}>{awayTeam.name}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>总得分:</span>
                <span className="font-bold">{awayTeam.score}</span>
              </div>
              <div className="flex justify-between">
                <span>球员数:</span>
                <span className="font-bold">{awayTeam.players.length}</span>
              </div>
              <div className="flex justify-between">
                <span>总犯规:</span>
                <span className="font-bold">{awayTeam.fouls}</span>
              </div>
              <div className="flex justify-between">
                <span>剩余暂停:</span>
                <span className="font-bold">{awayTeam.timeouts}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 团队详细统计 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TeamStats team={homeTeam} />
        <TeamStats team={awayTeam} />
      </div>
    </div>
  );

  // 渲染详细球员管理
  const renderDetailedManagement = () => {
    const teams = activeTeam === 'home' ? [homeTeam] : 
                  activeTeam === 'away' ? [awayTeam] : 
                  [homeTeam, awayTeam];

    return (
      <div className="space-y-6">
        {/* 团队选择器 */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">球员详细管理</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTeam('both')}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  activeTeam === 'both' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                两队
              </button>
              <button
                onClick={() => setActiveTeam('home')}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  activeTeam === 'home' 
                    ? 'text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                style={{ 
                  backgroundColor: activeTeam === 'home' ? homeTeam.color : undefined 
                }}
              >
                {homeTeam.name}
              </button>
              <button
                onClick={() => setActiveTeam('away')}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  activeTeam === 'away' 
                    ? 'text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                style={{ 
                  backgroundColor: activeTeam === 'away' ? awayTeam.color : undefined 
                }}
              >
                {awayTeam.name}
              </button>
            </div>
          </div>
        </div>

        {/* 球员卡片网格 */}
        {teams.map(team => (
          <div key={team.id} className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xl font-semibold" style={{ color: team.color }}>
                {team.name} 球员管理
              </h4>
              <button
                onClick={() => onAddPlayer(team.id)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium"
              >
                + 添加球员
              </button>
            </div>
            
            {team.players.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-500">暂无球员，点击上方按钮添加球员</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {team.players.map(player => (
                  <DetailedPlayerCard
                    key={player.id}
                    player={player}
                    teamColor={team.color}
                    onScoreUpdate={(points) => onScoreUpdate(team.id, points, player.id)}
                    onStatUpdate={(stat, value) => onPlayerStatUpdate(team.id, player.id, stat, value)}
                    onAddFoul={() => onAddFoul(team.id, player.id)}
                    onShotAttempt={onShotAttempt ? (shotType) => onShotAttempt(team.id, player.id, shotType) : undefined}
                    onRemove={() => onRemovePlayer(team.id, player.id)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 视图模式切换 */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">球员管理与数据统计</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-4 py-2 rounded font-medium ${
                viewMode === 'overview' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📊 统计概览
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-4 py-2 rounded font-medium ${
                viewMode === 'detailed' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              👥 详细管理
            </button>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      {viewMode === 'overview' ? renderTeamOverview() : renderDetailedManagement()}
    </div>
  );
}; 
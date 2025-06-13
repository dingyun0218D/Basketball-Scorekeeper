import React, { useState } from 'react';
import { Team } from '../../types';
import { OnCourtPlayerCard } from './OnCourtPlayerCard';

interface OnCourtAreaProps {
  team: Team;
  onTogglePlayerStatus: (playerId: string) => void;
  onScoreUpdate: (teamId: string, points: number, playerId?: string) => void;
  onPlayerStatUpdate: (teamId: string, playerId: string, stat: string, value: number) => void;
  onAddFoul: (teamId: string, playerId: string) => void;
  onShotAttempt: (teamId: string, playerId: string, shotType: 'field' | 'three' | 'free') => void;
  onUndoScore: (teamId: string, playerId: string, scoreType: '1' | '2' | '3') => void;
}

export const OnCourtArea: React.FC<OnCourtAreaProps> = ({
  team,
  onTogglePlayerStatus,
  onScoreUpdate,
  onPlayerStatUpdate,
  onAddFoul,
  onShotAttempt,
  onUndoScore
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  
  const playersOnCourt = team.players.filter(player => player.isOnCourt);
  const maxPlayersOnCourt = 5;

  // 处理拖拽悬停
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  // 处理拖拽离开
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  // 处理放置
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const { playerId, teamId } = data;
      
      // 检查是否是同一队伍的球员
      if (teamId !== team.id) {
        return;
      }
      
      // 检查球员是否存在
      const player = team.players.find(p => p.id === playerId);
      if (!player) {
        return;
      }
      
      // 如果球员要上场，检查是否超过最大人数
      if (!player.isOnCourt && playersOnCourt.length >= maxPlayersOnCourt) {
        alert(`场上最多只能有${maxPlayersOnCourt}名球员`);
        return;
      }
      
      onTogglePlayerStatus(playerId);
    } catch (error) {
      console.error('拖拽数据解析失败:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold" style={{ color: team.color }}>
          {team.name} 上场球员
        </h3>
        <span className="text-sm text-gray-600">
          {playersOnCourt.length}/{maxPlayersOnCourt}
        </span>
      </div>
      
      {/* 球员面板区域 - 移除虚线框，改为网格布局 */}
      <div
        className={`min-h-32 rounded-lg p-2 transition-colors ${
          isDragOver 
            ? 'bg-green-50' 
            : 'bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {playersOnCourt.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">拖拽球员到此区域上场</p>
            <p className="text-xs mt-1">最多{maxPlayersOnCourt}人</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {playersOnCourt.map(player => (
              <OnCourtPlayerCard
                key={player.id}
                player={player}
                teamColor={team.color}
                teamId={team.id}
                onScoreUpdate={(points: number) => onScoreUpdate(team.id, points, player.id)}
                onStatUpdate={(stat: string, value: number) => onPlayerStatUpdate(team.id, player.id, stat, value)}
                onAddFoul={() => onAddFoul(team.id, player.id)}
                onShotAttempt={(shotType: 'field' | 'three' | 'free') => onShotAttempt(team.id, player.id, shotType)}
                onUndoScore={(scoreType: '1' | '2' | '3') => onUndoScore(team.id, player.id, scoreType)}
                onToggleCourtStatus={() => onTogglePlayerStatus(player.id)}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* 提示信息 */}
      {playersOnCourt.length < maxPlayersOnCourt && (
      <div className="text-xs text-gray-500 mt-2">
          💡 拖拽球员卡片到此区域让球员上场，点击场上球员左上角×让其下场
      </div>
      )}
    </div>
  );
}; 
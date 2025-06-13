import React from 'react';
import { Player } from '../../types';
import { PlayerStats, PlayerActions } from '../Player';

interface DraggablePlayerCardProps {
  player: Player;
  teamColor: string;
  teamId: string;
  onScoreUpdate: (points: number) => void;
  onStatUpdate: (stat: string, value: number) => void;
  onAddFoul: () => void;
  onShotAttempt: (shotType: 'field' | 'three' | 'free') => void;
  onUndoScore: (scoreType: '1' | '2' | '3') => void;
  onToggleCourtStatus: () => void;
  onRemove: () => void;
}

export const DraggablePlayerCard: React.FC<DraggablePlayerCardProps> = ({
  player,
  teamColor,
  teamId,
  onScoreUpdate,
  onStatUpdate,
  onAddFoul,
  onShotAttempt,
  onUndoScore,
  onToggleCourtStatus,
  onRemove
}) => {
  // 拖拽开始事件
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      playerId: player.id,
      teamId: teamId,
      playerName: player.name,
      playerNumber: player.number
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  // 双击事件处理 - 只在双击非按钮区域时切换上场状态
  const handleDoubleClick = (e: React.MouseEvent) => {
    // 检查点击目标是否为按钮或按钮内的元素
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return; // 如果点击的是按钮区域，不执行上下场操作
    }
    
    // 阻止事件冒泡，避免触发其他点击事件
    e.preventDefault();
    e.stopPropagation();
    onToggleCourtStatus();
  };

  // 创建一个增强的 PlayerInfo 组件，包含拖拽和上场状态
  const DraggablePlayerInfo: React.FC<{ player: Player; teamColor: string; onRemove: () => void }> = ({ player, teamColor, onRemove }) => {
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
            <div className="text-sm font-bold text-gray-800 truncate flex items-center">
              #{player.number} {player.name}
              {player.isOnCourt && (
                <span className="ml-2 inline-block w-2 h-2 bg-green-500 rounded-full" title="在场上"></span>
              )}
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
    <div 
      className={`border border-gray-200 rounded-lg p-3 bg-gray-50 hover:bg-white transition-colors cursor-move ${
        player.isOnCourt ? 'border-green-500 bg-green-50' : ''
      }`}
      draggable
      onDragStart={handleDragStart}
      onDoubleClick={handleDoubleClick}
      title={player.isOnCourt ? "双击非按钮区域下场" : "双击非按钮区域上场"}
    >
      <DraggablePlayerInfo 
        player={player} 
        teamColor={teamColor} 
        onRemove={onRemove} 
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
import React from 'react';
import { Player } from '../../types';
import { SimplePlayerInfo } from './SimplePlayerInfo';

interface SimplePlayerCardProps {
  player: Player;
  teamColor: string;
  teamId: string;
  onToggleCourtStatus: () => void;
  onRemove: () => void;
}

export const SimplePlayerCard: React.FC<SimplePlayerCardProps> = ({
  player,
  teamColor,
  teamId,
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
      <SimplePlayerInfo
        player={player}
        teamColor={teamColor}
        onRemove={onRemove}
      />
    </div>
  );
}; 
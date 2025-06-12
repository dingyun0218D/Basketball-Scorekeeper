import React from 'react';
import { Player } from '../../types';

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

  return (
    <div 
      className={`relative border border-gray-200 rounded-lg p-3 bg-gray-50 hover:bg-white transition-colors cursor-move ${
        player.isOnCourt ? 'border-green-500 bg-green-50' : ''
      }`}
      draggable
      onDragStart={handleDragStart}
      onDoubleClick={handleDoubleClick}
      title={player.isOnCourt ? "双击非按钮区域下场" : "双击非按钮区域上场"}
    >
      {/* 移除按钮 - 左上角小x */}
      <button
        onClick={onRemove}
        className="absolute top-1 left-1 w-4 h-4 bg-gray-400 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-xs leading-none transition-colors"
        title="移除球员"
      >
        ×
      </button>
      {/* 球员基本信息 */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex-1 min-w-0">
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
          <div className="text-xs text-gray-500">分</div>
        </div>
      </div>

      {/* 1. 得分按钮 - 3列布局 */}
      <div className="grid grid-cols-3 gap-1 mb-1">
        <button
          onClick={() => onScoreUpdate(1)}
          className="bg-green-500 hover:bg-green-600 text-white py-0.5 px-1 rounded text-xs font-medium"
        >
          +1
        </button>
        <button
          onClick={() => onScoreUpdate(2)}
          className="bg-green-600 hover:bg-green-700 text-white py-0.5 px-1 rounded text-xs font-medium"
        >
          +2
        </button>
        <button
          onClick={() => onScoreUpdate(3)}
          className="bg-green-700 hover:bg-green-800 text-white py-0.5 px-1 rounded text-xs font-medium"
        >
          +3
        </button>
      </div>

      {/* 2. 出手不中按钮 - 3列布局 */}
      <div className="grid grid-cols-3 gap-1 mb-1">
        <button
          onClick={() => onShotAttempt('free')}
          className="bg-purple-500 hover:bg-purple-600 text-white py-0.5 px-1 rounded text-xs font-medium"
          title="罚球不中"
        >
          1mis
        </button>
        <button
          onClick={() => onShotAttempt('field')}
          className="bg-gray-500 hover:bg-gray-600 text-white py-0.5 px-1 rounded text-xs font-medium"
          title="2分投篮不中"
        >
          2mis
        </button>
        <button
          onClick={() => onShotAttempt('three')}
          className="bg-orange-500 hover:bg-orange-600 text-white py-0.5 px-1 rounded text-xs font-medium"
          title="3分投篮不中"
        >
          3mis
        </button>
      </div>

      {/* 3. 撤销按钮 - 3列布局 */}
      <div className="grid grid-cols-3 gap-1 mb-1">
        <button
          onClick={() => onUndoScore('1')}
          className="bg-red-500 hover:bg-red-600 text-white py-0.5 px-1 rounded text-xs font-medium"
          title="撤销1分"
        >
          -1
        </button>
        <button
          onClick={() => onUndoScore('2')}
          className="bg-red-600 hover:bg-red-700 text-white py-0.5 px-1 rounded text-xs font-medium"
          title="撤销2分"
        >
          -2
        </button>
        <button
          onClick={() => onUndoScore('3')}
          className="bg-red-700 hover:bg-red-800 text-white py-0.5 px-1 rounded text-xs font-medium"
          title="撤销3分"
        >
          -3
        </button>
      </div>

      {/* 4. 统计数据显示 - 合并投篮和基础统计 */}
      <div className="grid grid-cols-3 gap-1 text-xs mb-1">
        <div className="text-center p-0.5 bg-purple-50 rounded">
          <div className="font-bold text-purple-600 text-xs">{player.freeThrowsMade}/{player.freeThrowsAttempted}</div>
          <div className="text-gray-500 text-xs">罚球</div>
        </div>
        <div className="text-center p-0.5 bg-gray-50 rounded">
          <div className="font-bold text-gray-600 text-xs">{player.fieldGoalsMade - player.threePointersMade}/{player.fieldGoalsAttempted - player.threePointersAttempted}</div>
          <div className="text-gray-500 text-xs">2分</div>
        </div>
        <div className="text-center p-0.5 bg-orange-50 rounded">
          <div className="font-bold text-orange-600 text-xs">{player.threePointersMade}/{player.threePointersAttempted}</div>
          <div className="text-gray-500 text-xs">3分</div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1 text-xs mb-1">
        <div className="text-center">
          <div className="font-bold text-blue-600 text-xs">{player.rebounds}</div>
          <div className="text-gray-500 text-xs">板</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-purple-600 text-xs">{player.assists}</div>
          <div className="text-gray-500 text-xs">助</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-indigo-600 text-xs">{player.steals}</div>
          <div className="text-gray-500 text-xs">断</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-teal-600 text-xs">{player.blocks}</div>
          <div className="text-gray-500 text-xs">帽</div>
        </div>
      </div>

      {/* 5. 快捷统计按钮 - 5列布局，包含犯规 */}
      <div className="grid grid-cols-5 gap-1 mb-1">
        <button
          onClick={() => onStatUpdate('rebounds', 1)}
          className="bg-blue-500 hover:bg-blue-600 text-white py-0.5 px-0.5 rounded text-xs font-medium"
        >
          +板
        </button>
        <button
          onClick={() => onStatUpdate('assists', 1)}
          className="bg-purple-500 hover:bg-purple-600 text-white py-0.5 px-0.5 rounded text-xs font-medium"
        >
          +助
        </button>
        <button
          onClick={() => onStatUpdate('steals', 1)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white py-0.5 px-0.5 rounded text-xs font-medium"
        >
          +断
        </button>
        <button
          onClick={() => onStatUpdate('blocks', 1)}
          className="bg-teal-500 hover:bg-teal-600 text-white py-0.5 px-0.5 rounded text-xs font-medium"
        >
          +帽
        </button>
        <button
          onClick={onAddFoul}
          className={`py-0.5 px-0.5 rounded text-xs font-medium ${
            player.fouls >= 5 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-yellow-500 hover:bg-yellow-600 text-white'
          }`}
          title={`犯规 (${player.fouls})`}
        >
          +犯
        </button>
      </div>
    </div>
  );
}; 
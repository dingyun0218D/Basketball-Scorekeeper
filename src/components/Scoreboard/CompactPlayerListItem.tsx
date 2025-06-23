import React from 'react';
import { Player } from '../../types';

interface CompactPlayerListItemProps {
  player: Player;
  teamColor: string;
  teamId: string;
  onToggleCourtStatus: () => void;
  onRemove: () => void;
}

export const CompactPlayerListItem: React.FC<CompactPlayerListItemProps> = ({
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

  // 格式化正负值显示
  const formatPlusMinus = (value: number): string => {
    if (value > 0) return `+${value}`;
    return value.toString();
  };

  // 正负值颜色
  const getPlusMinusColor = (value: number): string => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // 计算投篮命中率
  const fieldGoalPercentage = player.fieldGoalsAttempted > 0 
    ? ((player.fieldGoalsMade / player.fieldGoalsAttempted) * 100).toFixed(0)
    : '0';

  // 计算真实命中率
  const trueShootingPercentage = (() => {
    const totalAttempts = player.fieldGoalsAttempted + 0.44 * player.freeThrowsAttempted;
    if (totalAttempts === 0) return '0';
    const totalPoints = player.fieldGoalsMade * 2 + player.threePointersMade + player.freeThrowsMade;
    return ((totalPoints / (2 * totalAttempts)) * 100).toFixed(0);
  })();

  // 计算效率值
  const efficiency = player.points + player.rebounds + player.assists + player.steals + player.blocks - 
    (player.fieldGoalsAttempted - player.fieldGoalsMade) - 
    (player.freeThrowsAttempted - player.freeThrowsMade) - player.turnovers;

  return (
    <div 
      className={`flex items-center px-2 py-1.5 border border-gray-200 rounded-lg bg-gray-50 hover:bg-white transition-colors cursor-move ${
        player.isOnCourt ? 'border-green-500 bg-green-50' : ''
      }`}
      draggable
      onDragStart={handleDragStart}
      onDoubleClick={handleDoubleClick}
      title={player.isOnCourt ? "双击非按钮区域下场" : "双击非按钮区域上场"}
    >
      {/* 左侧固定列区域 - 号码、姓名、位置 */}
      <div className="flex items-center flex-shrink-0">
        {/* 球员号码 */}
        <div className="w-10 text-center">
          <span className="text-sm font-bold" style={{ color: teamColor }}>
            #{player.number}
          </span>
        </div>

        {/* 球员姓名 */}
        <div className="w-20 px-1">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-800 truncate">
              {player.name}
            </span>
            {player.isOnCourt && (
              <span className="ml-1 inline-block w-2 h-2 bg-green-500 rounded-full flex-shrink-0" title="在场上"></span>
            )}
          </div>
        </div>

        {/* 球员位置 */}
        <div className="w-12 text-center">
          <span className="text-xs text-gray-500">{player.position}</span>
        </div>
      </div>

      {/* 中间空白区域 - 占用剩余空间 */}
      <div className="flex-1"></div>

      {/* 右侧固定列区域 - 从得分开始 */}
      <div className="flex items-center space-x-1 flex-shrink-0">
        {/* 得分 */}
        <div className="w-8 text-center">
          <div className="text-lg font-bold" style={{ color: teamColor }}>
            {player.points}
          </div>
        </div>

        {/* 篮板 */}
        <div className="w-6 text-center">
          <span className="text-xs font-medium text-blue-600">{player.rebounds}</span>
        </div>

        {/* 助攻 */}
        <div className="w-6 text-center">
          <span className="text-xs font-medium text-purple-600">{player.assists}</span>
        </div>

        {/* 失误 */}
        <div className="w-6 text-center hidden sm:block">
          <span className="text-xs font-medium text-red-600">{player.turnovers}</span>
        </div>

        {/* 犯规 */}
        <div className="w-6 text-center">
          <span className={`text-xs font-medium ${player.fouls >= 5 ? 'text-red-600' : 'text-yellow-600'}`}>
            {player.fouls}
          </span>
        </div>

        {/* 投篮命中率 */}
        <div className="w-10 text-center hidden md:block">
          <span className="text-xs font-medium text-gray-600">
            {fieldGoalPercentage}%
          </span>
        </div>

        {/* 真实命中率 */}
        <div className="w-10 text-center hidden lg:block">
          <span className="text-xs font-medium text-green-600">
            {trueShootingPercentage}%
          </span>
        </div>

        {/* 正负值 */}
        <div className="w-8 text-center hidden xl:block">
          <span className={`text-xs font-medium ${getPlusMinusColor(player.plusMinus)}`}>
            {formatPlusMinus(player.plusMinus)}
          </span>
        </div>

        {/* 效率值 */}
        <div className="w-8 text-center hidden xl:block">
          <span className="text-xs font-medium text-indigo-600">
            {efficiency}
          </span>
        </div>

        {/* 移除按钮 */}
        <button
          onClick={onRemove}
          className="w-4 h-4 bg-gray-400 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-xs leading-none transition-colors ml-1 flex-shrink-0"
          title="移除球员"
        >
          ×
        </button>
      </div>
    </div>
  );
}; 
import React, { useState } from 'react';
import { Player, Team } from '../../types';

interface OnCourtAreaProps {
  team: Team;
  onTogglePlayerStatus: (playerId: string) => void;
}

export const OnCourtArea: React.FC<OnCourtAreaProps> = ({
  team,
  onTogglePlayerStatus
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
    <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold" style={{ color: team.color }}>
          {team.name} 上场球员
        </h3>
        <span className="text-sm text-gray-600">
          {playersOnCourt.length}/{maxPlayersOnCourt}
        </span>
      </div>
      
      {/* 拖拽放置区域 */}
      <div
        className={`min-h-32 border-2 border-dashed rounded-lg p-4 transition-colors ${
          isDragOver 
            ? 'border-green-500 bg-green-50' 
            : playersOnCourt.length === 0 
            ? 'border-gray-300 bg-gray-50' 
            : 'border-gray-200 bg-white'
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
          <div className="grid grid-cols-5 gap-3">
            {playersOnCourt.map(player => (
              <div
                key={player.id}
                className="bg-green-100 border border-green-300 rounded-lg p-2 text-center cursor-pointer hover:bg-green-200 transition-colors"
                onClick={() => onTogglePlayerStatus(player.id)}
                title="点击下场"
              >
                <div className="text-sm font-bold text-green-800">
                  #{player.number}
                </div>
                <div className="text-xs text-green-600 truncate">
                  {player.name}
                </div>
                <div className="text-xs text-gray-500">
                  {player.position}
                </div>
                <div className="text-sm font-bold text-green-700 mt-1">
                  {player.points}分
                </div>
              </div>
            ))}
            
            {/* 空位占位符 */}
            {Array.from({ length: maxPlayersOnCourt - playersOnCourt.length }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="border-2 border-dashed border-gray-300 rounded-lg p-2 text-center"
              >
                <div className="text-gray-400 text-xs py-6">
                  空位
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 提示信息 */}
      <div className="text-xs text-gray-500 mt-2">
        💡 拖拽球员卡片到此区域让球员上场，点击场上球员让其下场
      </div>
    </div>
  );
}; 
import React from 'react';
import { Player } from '../../types';
import { getPlayerKeyStats } from '../../utils/playerStats';

interface PlayerKeyStatsProps {
  player: Player;
}

export const PlayerKeyStats: React.FC<PlayerKeyStatsProps> = ({ player }) => {
  const stats = getPlayerKeyStats(player);

  // 格式化显示函数
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

  // 效率值颜色 (标准: 5 10 15 20)
  const getEfficiencyColor = (value: number): string => {
    if (value >= 20) return 'text-purple-600';
    if (value >= 15) return 'text-green-600';
    if (value >= 10) return 'text-gray-600';
    if (value >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 投篮命中率颜色 (标准: 20 30 40 50)
  const getFieldGoalColor = (value: string): string => {
    const numValue = parseFloat(value);
    if (numValue >= 50) return 'text-purple-600';
    if (numValue >= 40) return 'text-green-600';
    if (numValue >= 30) return 'text-gray-600';
    if (numValue >= 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 真实命中率颜色 (标准: 25 35 45 55)
  const getTrueShootingColor = (value: string): string => {
    const numValue = parseFloat(value);
    if (numValue >= 55) return 'text-purple-600';
    if (numValue >= 45) return 'text-green-600';
    if (numValue >= 35) return 'text-gray-600';
    if (numValue >= 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="mt-2 space-y-1">
      {/* 第一行：正负值、效率值 */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center">
          <span className="text-gray-500 whitespace-nowrap">正负: </span>
          <span className={`font-semibold ${getPlusMinusColor(stats.plusMinus)}`}>
            {formatPlusMinus(stats.plusMinus)}
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-500 whitespace-nowrap">效率: </span>
          <span className={`font-semibold ${getEfficiencyColor(stats.efficiency)}`}>
            {stats.efficiency}
          </span>
        </div>
      </div>

      {/* 第二行：投篮命中率、真实命中率 */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center">
          <span className="text-gray-500 whitespace-nowrap">投篮: </span>
          <span className={`font-semibold ${getFieldGoalColor(stats.fieldGoalPercentage)}`}>
            {stats.fieldGoalPercentage}%
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-500 whitespace-nowrap">TS%: </span>
          <span className={`font-semibold ${getTrueShootingColor(stats.trueShootingPercentage)}`}>
            {stats.trueShootingPercentage}%
          </span>
        </div>
      </div>

      {/* 第三行：篮板、助攻、失误、犯规 - 使用与上场球员面板一致的颜色 */}
      <div className="grid grid-cols-4 gap-1 text-xs">
        <div className="flex items-center">
          <span className="text-gray-500 whitespace-nowrap">板: </span>
          <span className="font-semibold text-blue-600">{stats.rebounds}</span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-500 whitespace-nowrap">助: </span>
          <span className="font-semibold text-purple-600">{stats.assists}</span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-500 whitespace-nowrap">失: </span>
          <span className="font-semibold text-red-600">{stats.turnovers}</span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-500 whitespace-nowrap">犯: </span>
          <span className={`font-semibold ${stats.fouls >= 5 ? 'text-red-600' : 'text-yellow-600'}`}>
            {stats.fouls}
          </span>
        </div>
      </div>
    </div>
  );
}; 
import { Player } from '../types';

// 计算球员效率值 (Player Efficiency Rating - 简化版)
export const calculatePlayerEfficiency = (player: Player): number => {
  // 效率值 = 正面统计 - 负面统计
  // 正面: 得分 + 篮板 + 助攻 + 抢断 + 盖帽
  // 负面: 失误 + 犯规 + 投失 + 罚失
  const positiveStats = player.points + player.rebounds + player.assists + player.steals + player.blocks;
  const fieldGoalMisses = player.fieldGoalsAttempted - player.fieldGoalsMade;
  const freeThrowMisses = player.freeThrowsAttempted - player.freeThrowsMade;
  const negativeStats = player.turnovers + player.fouls + fieldGoalMisses + freeThrowMisses;
  
  return positiveStats - negativeStats;
};

// 计算真实命中率 (True Shooting Percentage)
export const calculateTrueShootingPercentage = (player: Player): string => {
  // TS% = 得分 / (2 × (投篮出手 + 0.44 × 罚球出手)) × 100
  const totalShots = player.fieldGoalsAttempted + (0.44 * player.freeThrowsAttempted);
  if (totalShots === 0) return '0.0';
  
  const tsPercentage = (player.points / (2 * totalShots)) * 100;
  return tsPercentage.toFixed(1);
};

// 计算投篮命中率
export const calculateFieldGoalPercentage = (player: Player): string => {
  if (player.fieldGoalsAttempted === 0) return '0.0';
  return ((player.fieldGoalsMade / player.fieldGoalsAttempted) * 100).toFixed(1);
};

// 计算三分命中率
export const calculateThreePointPercentage = (player: Player): string => {
  if (player.threePointersAttempted === 0) return '0.0';
  return ((player.threePointersMade / player.threePointersAttempted) * 100).toFixed(1);
};

// 计算罚球命中率
export const calculateFreeThrowPercentage = (player: Player): string => {
  if (player.freeThrowsAttempted === 0) return '0.0';
  return ((player.freeThrowsMade / player.freeThrowsAttempted) * 100).toFixed(1);
};

// 获取球员关键统计摘要
export interface PlayerKeyStats {
  plusMinus: number;
  efficiency: number;
  fieldGoalPercentage: string;
  trueShootingPercentage: string;
  rebounds: number;
  assists: number;
  turnovers: number;
  fouls: number;
}

export const getPlayerKeyStats = (player: Player): PlayerKeyStats => {
  return {
    plusMinus: player.plusMinus,
    efficiency: calculatePlayerEfficiency(player),
    fieldGoalPercentage: calculateFieldGoalPercentage(player),
    trueShootingPercentage: calculateTrueShootingPercentage(player),
    rebounds: player.rebounds,
    assists: player.assists,
    turnovers: player.turnovers,
    fouls: player.fouls
  };
}; 
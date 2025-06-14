import { GameEvent, Player } from '../types';
import { generateId } from './gameUtils';

// 统计类型映射
export const STAT_TYPE_MAP: Record<string, { type: GameEvent['type'], name: string, icon: string }> = {
  'rebounds': { type: 'rebound', name: '篮板', icon: '🏀' },
  'assists': { type: 'assist', name: '助攻', icon: '🤝' },
  'steals': { type: 'steal', name: '抢断', icon: '🔐' },
  'blocks': { type: 'block', name: '盖帽', icon: '🚫' },
  'turnovers': { type: 'turnover', name: '失误', icon: '💥' }
};

// 创建统计事件
export const createStatEvent = (
  teamId: string,
  playerId: string,
  player: Player,
  stat: string,
  value: number,
  quarter: number,
  time: string
): GameEvent | null => {
  if (value <= 0) return null;
  
  const statInfo = STAT_TYPE_MAP[stat];
  if (!statInfo) return null;

  return {
    id: generateId(),
    timestamp: Date.now(),
    quarter,
    time,
    type: statInfo.type,
    teamId,
    playerId,
    description: `${player.name}贡献${statInfo.name}`,
    stat,
    value
  };
};

// 创建撤销事件
export const createUndoEvent = (
  teamId: string,
  playerId: string,
  player: Player,
  points: number,
  quarter: number,
  time: string
): GameEvent => {
  return {
    id: generateId(),
    timestamp: Date.now(),
    quarter,
    time,
    type: 'undo',
    teamId,
    playerId,
    description: `${player.name} 撤销${points}分得分`,
    points: -points,
    stat: 'score',
    value: -points,
  };
};

// 检查是否为统计类型
export const isStatType = (stat: string): boolean => {
  return stat in STAT_TYPE_MAP;
};

// 获取统计类型信息
export const getStatTypeInfo = (stat: string) => {
  return STAT_TYPE_MAP[stat];
}; 
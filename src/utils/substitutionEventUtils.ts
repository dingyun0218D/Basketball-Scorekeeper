import { GameEvent, Team, Player } from '../types';
import { generateId } from './gameUtils';

// 创建换人事件
export const createSubstitutionEvent = (
  teamId: string,
  playerId: string,
  player: Player,
  quarter: number,
  time: string
): GameEvent => {
  return {
    id: generateId(),
    timestamp: Date.now(),
    quarter,
    time,
    type: 'substitution',
    teamId,
    playerId,
    description: `${player.name} ${player.isOnCourt ? '下场' : '上场'}`,
  };
};

// 切换球员上场状态
export const togglePlayerCourtStatus = (team: Team, playerId: string): Team => {
  return {
    ...team,
    players: team.players.map(p => {
      if (p.id === playerId) {
        // 只切换上场状态，不重置正负值（正负值应该累积计算）
        return { ...p, isOnCourt: !p.isOnCourt };
      }
      return p;
    }),
  };
};

// 检查是否可以上场（不超过5人）
export const canPlayerEnterCourt = (team: Team, playerId: string): boolean => {
  const player = team.players.find(p => p.id === playerId);
  if (!player) return false;
  
  const playersOnCourt = team.players.filter(p => p.isOnCourt);
  
  // 如果球员要上场，检查是否已有5人在场
  if (!player.isOnCourt && playersOnCourt.length >= 5) {
    return false; // 不允许超过5人在场
  }
  
  return true;
}; 
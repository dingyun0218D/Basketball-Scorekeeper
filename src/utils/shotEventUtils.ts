import { GameEvent, Team, Player } from '../types';
import { generateId } from './gameUtils';

// 创建投篮尝试事件
export const createShotAttemptEvent = (
  teamId: string,
  playerId: string,
  team: Team,
  shotType: 'field' | 'three' | 'free',
  quarter: number,
  time: string
): GameEvent => {
  const shotTypeMap = {
    'field': '投篮',
    'three': '3分',
    'free': '罚球'
  };

  return {
    id: generateId(),
    timestamp: Date.now(),
    quarter,
    time,
    type: 'other',
    teamId,
    playerId,
    description: `${team.name} ${shotTypeMap[shotType]}出手`,
  };
};

// 更新球员投篮统计
export const updatePlayerShotStats = (
  player: Player,
  shotType: 'field' | 'three' | 'free'
): Player => {
  const updatedPlayer = { ...player };
  
  switch (shotType) {
    case 'field':
      updatedPlayer.fieldGoalsAttempted += 1;
      break;
    case 'three':
      updatedPlayer.threePointersAttempted += 1;
      updatedPlayer.fieldGoalsAttempted += 1;
      break;
    case 'free':
      updatedPlayer.freeThrowsAttempted += 1;
      break;
  }
  
  return updatedPlayer;
};

// 更新队伍中球员的投篮统计
export const updateTeamPlayerShotStats = (
  team: Team,
  playerId: string,
  shotType: 'field' | 'three' | 'free'
): Team => {
  return {
    ...team,
    players: team.players.map(player => {
      if (player.id === playerId) {
        return updatePlayerShotStats(player, shotType);
      }
      return player;
    }),
  };
}; 
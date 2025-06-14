import { GameEvent, Team, Player, ScoreType } from '../types';
import { generateId } from './gameUtils';

// 创建得分事件
export const createScoreEvent = (
  teamId: string,
  playerId: string | undefined,
  team: Team,
  points: number,
  quarter: number,
  time: string
): GameEvent => {
  return {
    id: generateId(),
    timestamp: Date.now(),
    quarter,
    time,
    type: 'score',
    teamId,
    playerId,
    description: points > 0 ? `${team.name} 得${points}分` : `${team.name} 减${Math.abs(points)}分`,
    points,
  };
};

// 更新球员得分统计
export const updatePlayerScoreStats = (
  player: Player,
  points: number,
  scoreType: ScoreType
): Player => {
  const updatedPlayer = { ...player, points: Math.max(0, player.points + points) };
  
  // 根据得分类型更新相应统计（只在正分时更新）
  if (points > 0) {
    switch (scoreType) {
      case '1':
        updatedPlayer.freeThrowsMade += 1;
        updatedPlayer.freeThrowsAttempted += 1;
        break;
      case '2':
        updatedPlayer.fieldGoalsMade += 1;
        updatedPlayer.fieldGoalsAttempted += 1;
        break;
      case '3':
        updatedPlayer.threePointersMade += 1;
        updatedPlayer.threePointersAttempted += 1;
        updatedPlayer.fieldGoalsMade += 1;
        updatedPlayer.fieldGoalsAttempted += 1;
        break;
    }
  }
  
  return updatedPlayer;
};

// 更新球员正负值
export const updatePlayersPlusMinus = (
  players: Player[],
  points: number,
  isScoring: boolean = true
): Player[] => {
  return players.map(player => 
    player.isOnCourt 
      ? { ...player, plusMinus: player.plusMinus + (isScoring ? points : -points) } 
      : player
  );
}; 
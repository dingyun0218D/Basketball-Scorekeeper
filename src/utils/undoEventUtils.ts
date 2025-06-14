import { Player, ScoreType } from '../types';

// 检查是否可以撤销得分
export const canUndoScore = (player: Player, points: number, scoreType: ScoreType): boolean => {
  // 检查球员是否有足够的得分
  if (player.points < points) return false;
  
  // 检查是否有对应的统计数据可以撤销
  switch (scoreType) {
    case '1':
      return player.freeThrowsMade > 0;
    case '2':
      return player.fieldGoalsMade > 0 && (player.fieldGoalsMade - player.threePointersMade) > 0;
    case '3':
      return player.threePointersMade > 0;
    default:
      return false;
  }
};

// 撤销球员得分统计
export const undoPlayerScoreStats = (player: Player, points: number, scoreType: ScoreType): Player => {
  const updatedPlayer = { ...player, points: Math.max(0, player.points - points) };
  
  // 撤销相应的统计数据
  switch (scoreType) {
    case '1':
      updatedPlayer.freeThrowsMade = Math.max(0, updatedPlayer.freeThrowsMade - 1);
      updatedPlayer.freeThrowsAttempted = Math.max(0, updatedPlayer.freeThrowsAttempted - 1);
      break;
    case '2':
      updatedPlayer.fieldGoalsMade = Math.max(0, updatedPlayer.fieldGoalsMade - 1);
      updatedPlayer.fieldGoalsAttempted = Math.max(0, updatedPlayer.fieldGoalsAttempted - 1);
      break;
    case '3':
      updatedPlayer.threePointersMade = Math.max(0, updatedPlayer.threePointersMade - 1);
      updatedPlayer.threePointersAttempted = Math.max(0, updatedPlayer.threePointersAttempted - 1);
      updatedPlayer.fieldGoalsMade = Math.max(0, updatedPlayer.fieldGoalsMade - 1);
      updatedPlayer.fieldGoalsAttempted = Math.max(0, updatedPlayer.fieldGoalsAttempted - 1);
      break;
  }
  
  return updatedPlayer;
}; 
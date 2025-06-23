import { Team, Player } from '../types';
import { generateId } from './gameUtils';

/**
 * 创建新的球员实例
 * 从球员库添加球员到队伍时，创建独立的球员实例，避免引用共享问题
 * @param sourcePlayer 源球员对象（来自球员库）
 * @returns 新的球员实例
 */
export const createNewPlayerInstance = (sourcePlayer: Player): Player => {
  return {
    ...sourcePlayer,
    id: generateId(), // 生成新的唯一ID
    // 重置比赛相关的统计数据，保留基本信息
    points: 0,
    rebounds: 0,
    assists: 0,
    steals: 0,
    blocks: 0,
    fouls: 0,
    turnovers: 0,
    fieldGoalsMade: 0,
    fieldGoalsAttempted: 0,
    threePointersMade: 0,
    threePointersAttempted: 0,
    freeThrowsMade: 0,
    freeThrowsAttempted: 0,
    isOnCourt: false,
    plusMinus: 0,
    timeOnCourt: 0,
  };
};

/**
 * 添加球员到队伍
 * @param team 目标队伍
 * @param player 要添加的球员
 * @returns 更新后的队伍
 */
export const addPlayerToTeam = (team: Team, player: Player): Team => {
  // 创建球员的独立实例
  const newPlayer = createNewPlayerInstance(player);
  
  return {
    ...team,
    players: [...team.players, newPlayer],
  };
};

/**
 * 从队伍中移除球员
 * @param team 目标队伍
 * @param playerId 要移除的球员ID
 * @returns 更新后的队伍
 */
export const removePlayerFromTeam = (team: Team, playerId: string): Team => {
  return {
    ...team,
    players: team.players.filter(player => player.id !== playerId),
  };
};

/**
 * 检查球员号码是否在队伍中已存在
 * @param team 队伍
 * @param playerNumber 球员号码
 * @returns 是否存在冲突
 */
export const hasNumberConflict = (team: Team, playerNumber: number): boolean => {
  return team.players.some(player => player.number === playerNumber);
};

/**
 * 获取队伍中已使用的号码列表
 * @param team 队伍
 * @returns 已使用的号码数组
 */
export const getUsedNumbers = (team: Team): number[] => {
  return team.players.map(player => player.number);
}; 
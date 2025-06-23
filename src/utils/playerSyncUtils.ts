import { Team, Player } from '../types';
import { hasNumberConflict } from './playerManagementUtils';

/**
 * 查找队伍中具有指定源ID的球员
 * 用于识别从球员库添加的球员实例
 * @param team 队伍
 * @param sourcePlayerId 球员库中的球员ID
 * @returns 找到的球员数组（可能有多个实例）
 */
export const findPlayersBySourceId = (team: Team, sourcePlayerId: string): Player[] => {
  // 这里需要一个机制来追踪球员的源ID
  // 由于当前没有sourceId字段，我们先按姓名匹配
  // 在实际实现中，建议在Player接口中添加sourceId字段
  return team.players.filter(player => 
    // 临时方案：通过球员的某些基础信息来匹配
    // 后续应该添加sourceId字段来精确匹配
    player.name || player.number
  );
};

/**
 * 检查号码冲突情况
 * @param team 队伍
 * @param playerId 要检查的球员ID
 * @param newNumber 新号码
 * @returns 冲突信息
 */
export interface NumberConflictInfo {
  hasConflict: boolean;
  conflictingPlayer?: Player;
}

export const checkNumberConflictForSync = (
  team: Team, 
  playerId: string, 
  newNumber: number
): NumberConflictInfo => {
  const conflictingPlayer = team.players.find(
    player => player.id !== playerId && player.number === newNumber
  );
  
  return {
    hasConflict: !!conflictingPlayer,
    conflictingPlayer
  };
};

/**
 * 同步球员基础信息到队伍中的所有实例
 * @param team 队伍
 * @param sourcePlayerId 球员库中的球员ID（目前通过名称匹配）
 * @param updatedPlayerInfo 更新后的球员基础信息
 * @returns 更新后的队伍和移除的球员信息
 */
export interface SyncResult {
  updatedTeam: Team;
  removedPlayers: Array<{player: Player; reason: string}>;
  syncedCount: number;
}

export const syncPlayerBasicInfo = (
  team: Team,
  originalPlayerInfo: Player,
  updatedPlayerInfo: Player
): SyncResult => {
  const removedPlayers: Array<{player: Player; reason: string}> = [];
  let syncedCount = 0;
  
  // 找到需要同步的球员（通过姓名和原号码匹配）
  const playersToSync = team.players.filter(player => 
    player.name === originalPlayerInfo.name && 
    player.number === originalPlayerInfo.number
  );
  
  // 检查每个需要同步的球员是否有号码冲突
  const updatedPlayers = team.players.map(player => {
    const shouldSync = playersToSync.some(p => p.id === player.id);
    if (!shouldSync) return player;
    
    // 检查新号码是否与其他球员冲突
    const conflictInfo = checkNumberConflictForSync(team, player.id, updatedPlayerInfo.number);
    
    if (conflictInfo.hasConflict) {
      // 有冲突的球员需要被移除
      removedPlayers.push({
        player,
        reason: `号码 ${updatedPlayerInfo.number} 与球员 ${conflictInfo.conflictingPlayer?.name} 冲突`
      });
      return null; // 标记为需要移除
    }
    
    // 同步基础信息，保留比赛统计
    syncedCount++;
    return {
      ...player,
      name: updatedPlayerInfo.name,
      number: updatedPlayerInfo.number,
      position: updatedPlayerInfo.position,
    };
  }).filter(player => player !== null) as Player[];
  
  return {
    updatedTeam: {
      ...team,
      players: updatedPlayers
    },
    removedPlayers,
    syncedCount
  };
};

/**
 * 为Player接口添加源ID追踪的辅助函数
 * 用于将来的优化，当Player接口添加sourceId字段时使用
 */
export const createPlayerWithSourceId = (basePlayer: Player, sourceId: string): Player => {
  // 这是为将来扩展预留的函数
  // 当Player接口添加sourceId字段时，可以使用这个函数
  return {
    ...basePlayer,
    // sourceId: sourceId,  // 未来添加
  };
};

/**
 * 批量同步多个队伍中的球员信息
 * @param teams 队伍数组
 * @param originalPlayerInfo 原始球员信息
 * @param updatedPlayerInfo 更新后的球员信息
 * @returns 同步结果
 */
export interface BatchSyncResult {
  updatedTeams: Team[];
  allRemovedPlayers: Array<{teamId: string; teamName: string; player: Player; reason: string}>;
  totalSyncedCount: number;
}

export const batchSyncPlayerInfo = (
  teams: Team[],
  originalPlayerInfo: Player,
  updatedPlayerInfo: Player
): BatchSyncResult => {
  const updatedTeams: Team[] = [];
  const allRemovedPlayers: Array<{teamId: string; teamName: string; player: Player; reason: string}> = [];
  let totalSyncedCount = 0;
  
  teams.forEach(team => {
    const syncResult = syncPlayerBasicInfo(team, originalPlayerInfo, updatedPlayerInfo);
    
    updatedTeams.push(syncResult.updatedTeam);
    totalSyncedCount += syncResult.syncedCount;
    
    // 收集被移除的球员信息
    syncResult.removedPlayers.forEach(removed => {
      allRemovedPlayers.push({
        teamId: team.id,
        teamName: team.name,
        player: removed.player,
        reason: removed.reason
      });
    });
  });
  
  return {
    updatedTeams,
    allRemovedPlayers,
    totalSyncedCount
  };
}; 
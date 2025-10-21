import { GameState } from '../types';

/**
 * 协作同步工具函数
 */

/**
 * 统一时间戳格式转换
 * @param time 时间戳（可能是 number、Date 或 undefined）
 * @returns 统一的毫秒时间戳
 */
export const normalizeTimestamp = (time: number | Date | undefined): number => {
  if (typeof time === 'number') {
    return time;
  }
  if (time instanceof Date) {
    return time.getTime();
  }
  if (time && typeof time === 'object' && 'toDate' in time) {
    // Firestore Timestamp 对象
    return (time as { toDate: () => Date }).toDate().getTime();
  }
  return 0;
};

/**
 * 比较两个时间戳，判断是否需要同步
 * @param localTime 本地时间戳
 * @param remoteTime 远程时间戳
 * @param tolerance 容忍度（毫秒），默认1000ms
 * @returns 是否需要同步远程状态
 */
export const shouldSyncRemoteState = (
  localTime: number | Date | undefined,
  remoteTime: number | Date | undefined,
  tolerance: number = 1000
): boolean => {
  const localMs = normalizeTimestamp(localTime);
  const remoteMs = normalizeTimestamp(remoteTime);
  
  // 如果远程时间戳明显更新（超过容忍度），则同步
  return remoteMs > localMs + tolerance;
};

/**
 * 检查本地状态是否应该推送到远程
 * @param localTime 本地时间戳
 * @param remoteTime 远程时间戳
 * @param lastSyncTime 最后同步时间
 * @param tolerance 容忍度（毫秒）
 * @returns 是否应该推送本地状态
 */
export const shouldPushLocalState = (
  localTime: number | Date | undefined,
  remoteTime: number | Date | undefined,
  lastSyncTime: number,
  tolerance: number = 500
): boolean => {
  const localMs = normalizeTimestamp(localTime);
  const remoteMs = normalizeTimestamp(remoteTime);
  
  // 本地状态更新且超过最后同步时间，并且不是刚刚从远程同步过来的
  return localMs > lastSyncTime && localMs > remoteMs + tolerance;
};

/**
 * 合并游戏状态，保留会话相关信息
 * @param localState 本地状态
 * @param remoteState 远程状态
 * @returns 合并后的状态
 */
export const mergeGameStates = (localState: GameState, remoteState: GameState): GameState => {
  return {
    ...remoteState,
    // 保持本地的会话相关信息
    sessionId: localState.sessionId || remoteState.sessionId,
    activeUsers: localState.activeUsers || remoteState.activeUsers,
  };
};

/**
 * 创建带有服务器时间戳的状态
 * @param state 游戏状态
 * @param userId 用户ID
 * @returns 带有用户活动信息的状态
 */
export const createStateWithUserActivity = (state: GameState, userId: string): GameState => {
  return {
    ...state,
    updatedAt: Date.now(), // 使用本地时间戳，让服务器时间戳由Firestore设置
    activeUsers: {
      ...state.activeUsers,
      [userId]: new Date()
    }
  };
};

/**
 * 调试日志函数
 */
export const logSyncOperation = (
  operation: 'local-to-remote' | 'remote-to-local' | 'skip',
  localTime: number | Date | undefined,
  remoteTime: number | Date | undefined,
  reason?: string
) => {
  const localMs = normalizeTimestamp(localTime);
  const remoteMs = normalizeTimestamp(remoteTime);
  
  console.log(`[协作同步] ${operation}`, {
    local: new Date(localMs).toISOString(),
    remote: new Date(remoteMs).toISOString(),
    localMs,
    remoteMs,
    diff: localMs - remoteMs,
    reason
  });
}; 
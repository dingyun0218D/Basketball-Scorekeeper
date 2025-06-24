import { GameState } from '../types';

/**
 * 计时器工具函数
 * 专门处理计时器相关的状态更新，不会触发协作同步
 */

/**
 * 判断是否为纯计时器操作（不需要协作同步）
 * @param action action类型
 * @returns 是否为纯计时器操作
 */
export const isTimerOnlyAction = (actionType: string): boolean => {
  return actionType === 'UPDATE_TIMER_TIME';
};

/**
 * 检查是否应该在协作模式中忽略该更新
 * @param gameState 游戏状态
 * @param actionType action类型
 * @returns 是否应该忽略协作同步
 */
export const shouldSkipCollaborativeSync = (gameState: GameState, actionType: string): boolean => {
  // 如果是协作模式且是纯计时器操作，跳过同步
  return !!(gameState.sessionId && isTimerOnlyAction(actionType));
};

/**
 * 创建计时器状态更新（不更新updatedAt）
 * @param state 当前状态
 * @param newTime 新时间
 * @returns 更新后的状态
 */
export const updateTimerTime = (state: GameState, newTime: string): GameState => {
  return {
    ...state,
    time: newTime,
    // 注意：不更新updatedAt，避免触发协作同步
  };
};

/**
 * 创建计时器控制状态更新（需要同步）
 * @param state 当前状态
 * @param updates 要更新的字段
 * @returns 更新后的状态
 */
export const updateTimerControl = (state: GameState, updates: Partial<GameState>): GameState => {
  return {
    ...state,
    ...updates,
    updatedAt: Date.now(), // 计时器控制操作需要同步
  };
}; 
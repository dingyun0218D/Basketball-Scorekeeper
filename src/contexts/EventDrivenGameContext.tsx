import React, { ReactNode } from 'react';
import { GameState, User, ScoreType } from '../types';
import { useEventDrivenGame } from '../hooks/useEventDrivenGame';
import { EventDrivenCollaborativeService } from '../services/eventDrivenCollaborationService';
import { generateId } from '../utils/gameUtils';
import { EventDrivenGameContextType } from '../hooks/useEventDrivenGameContext';
import { EventDrivenGameContext } from './EventDrivenGameContextDefinition';

// 用户信息（可以从配置或认证系统获取）
const DEFAULT_USER: User = {
  id: generateId(),
  name: '本地用户'
};

// Provider属性
interface EventDrivenGameProviderProps {
  children: ReactNode;
  sessionId?: string;
  user?: User;
  initialGameState?: GameState;
  collaborationService: EventDrivenCollaborativeService;
}

// Provider组件
export const EventDrivenGameProvider: React.FC<EventDrivenGameProviderProps> = ({
  children,
  sessionId,
  user = DEFAULT_USER,
  initialGameState,
  collaborationService
}) => {
  const [currentSessionId, setCurrentSessionId] = React.useState<string | undefined>(sessionId);
  
  // 使用事件驱动游戏Hook
  const eventDrivenGame = useEventDrivenGame({
    sessionId: currentSessionId,
    user,
    initialGameState,
    service: collaborationService
  });

  // 创建高级操作方法
  const addScore = React.useCallback(async (
    teamId: string, 
    points: number, 
    playerId?: string, 
    scoreType?: ScoreType
  ): Promise<void> => {
    if (!eventDrivenGame.gameState) return;
    
    const actualScoreType = scoreType || (points === 1 ? 'free_throw' : points === 3 ? 'three_pointer' : 'field_goal');
    await eventDrivenGame.sendScoreEvent(
      teamId, 
      playerId || '', 
      points as (1 | 2 | 3), 
      actualScoreType as ('field_goal' | 'three_pointer' | 'free_throw')
    );
  }, [eventDrivenGame]);

  const addFoul = React.useCallback(async (
    teamId: string, 
    playerId?: string
  ): Promise<void> => {
    await eventDrivenGame.sendFoulEvent(teamId, playerId || '', 'personal');
  }, [eventDrivenGame]);

  // 创建上下文值
  const contextValue: EventDrivenGameContextType = {
    // 游戏状态
    gameState: eventDrivenGame.gameState,
    isConnected: eventDrivenGame.isConnected,
    lastSyncTime: eventDrivenGame.lastSyncTime,
    error: eventDrivenGame.error,
    
    // 事件操作方法
    addScore,
    undoScore: async () => { /* TODO: 实现撤销功能 */ },
    updatePlayerStat: async () => { /* TODO: 实现球员统计更新 */ },
    addShotAttempt: async () => { /* TODO: 实现投篮尝试 */ },
    addFoul,
    useTimeout: async () => { /* TODO: 实现暂停功能 */ },
    togglePlayerCourtStatus: async () => { /* TODO: 实现球员上下场 */ },
    setQuarterTime: async () => { /* TODO: 实现设置单节时间 */ },
    startTimer: async () => { /* TODO: 实现开始计时器 */ },
    pauseTimer: async () => { /* TODO: 实现暂停计时器 */ },
    resumeTimer: async () => { /* TODO: 实现恢复计时器 */ },
    stopTimer: async () => { /* TODO: 实现停止计时器 */ },
    updateTime: async () => { /* TODO: 实现更新时间 */ },
    nextQuarter: async () => { /* TODO: 实现下一节 */ },
    
    // 团队和球员管理
    updateTeam: async () => { /* TODO: 实现团队更新 */ },
    addPlayer: async () => { /* TODO: 实现添加球员 */ },
    removePlayer: async () => { /* TODO: 实现移除球员 */ },
    syncPlayerInfo: async () => { /* TODO: 实现球员信息同步 */ },
    
    // 游戏控制
    startNewGame: async () => { /* TODO: 实现开始新游戏 */ },
    resetGame: async () => { /* TODO: 实现重置游戏 */ },
    
    // 协作功能
    sessionId: currentSessionId,
    setSessionId: setCurrentSessionId,
    
    // 直接访问事件操作
    sendEvent: eventDrivenGame.sendEvent
  };

  return (
    <EventDrivenGameContext.Provider value={contextValue}>
      {children}
    </EventDrivenGameContext.Provider>
  );
}; 
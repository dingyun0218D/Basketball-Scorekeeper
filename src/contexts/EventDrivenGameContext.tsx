import React, { ReactNode } from 'react';
import { GameState, User, ScoreType, Player, Team } from '../types';
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
    
    const actualScoreType = scoreType || (points === 1 ? 'free-throw' : points === 3 ? '3' : '2');
    const mappedScoreType = actualScoreType === 'free-throw' ? 'free_throw' : 
                           actualScoreType === '3' ? 'three_pointer' : 'field_goal';
    
    await eventDrivenGame.sendScoreEvent(
      teamId, 
      playerId || '', 
      points as (1 | 2 | 3), 
      mappedScoreType as ('field_goal' | 'three_pointer' | 'free_throw')
    );
  }, [eventDrivenGame]);

  const addFoul = React.useCallback(async (
    teamId: string, 
    playerId?: string
  ): Promise<void> => {
    await eventDrivenGame.sendFoulEvent(teamId, playerId || '', 'personal');
  }, [eventDrivenGame]);

  // 实现撤销功能
  const undoScore = React.useCallback(async (
    teamId: string, 
    playerId: string, 
    scoreType: ScoreType
  ): Promise<void> => {
    // TODO: 实现撤销功能，需要在事件系统中添加撤销事件
    console.log('撤销得分:', { teamId, playerId, scoreType });
  }, []);

  // 实现球员统计更新
  const updatePlayerStat = React.useCallback(async (
    teamId: string, 
    playerId: string, 
    stat: string, 
    value: number
  ): Promise<void> => {
    // TODO: 实现球员统计更新事件
    console.log('更新球员统计:', { teamId, playerId, stat, value });
  }, []);

  // 实现投篮尝试
  const addShotAttempt = React.useCallback(async (
    teamId: string, 
    playerId: string, 
    shotType: 'field' | 'three' | 'free'
  ): Promise<void> => {
    // TODO: 实现投篮尝试事件
    console.log('投篮尝试:', { teamId, playerId, shotType });
  }, []);

  // 实现暂停功能
  const useTimeout = React.useCallback(async (teamId: string): Promise<void> => {
    // TODO: 实现暂停事件
    console.log('使用暂停:', { teamId });
  }, []);

  // 实现球员上下场
  const togglePlayerCourtStatus = React.useCallback(async (
    teamId: string, 
    playerId: string
  ): Promise<void> => {
    // TODO: 实现球员上下场事件
    console.log('切换球员上场状态:', { teamId, playerId });
  }, []);

  // 实现设置单节时间
  const setQuarterTime = React.useCallback(async (time: string): Promise<void> => {
    // TODO: 实现设置单节时间事件
    console.log('设置单节时间:', { time });
  }, []);

  // 实现计时器控制
  const startTimer = React.useCallback(async (): Promise<void> => {
    await eventDrivenGame.sendGameControlEvent('START');
  }, [eventDrivenGame]);

  const pauseTimer = React.useCallback(async (): Promise<void> => {
    await eventDrivenGame.sendGameControlEvent('PAUSE');
  }, [eventDrivenGame]);

  const resumeTimer = React.useCallback(async (): Promise<void> => {
    await eventDrivenGame.sendGameControlEvent('RESUME');
  }, [eventDrivenGame]);

  const stopTimer = React.useCallback(async (): Promise<void> => {
    await eventDrivenGame.sendGameControlEvent('STOP');
  }, [eventDrivenGame]);

  const updateTime = React.useCallback(async (time: string): Promise<void> => {
    // TODO: 实现更新时间事件
    console.log('更新时间:', { time });
  }, []);

  const nextQuarter = React.useCallback(async (): Promise<void> => {
    await eventDrivenGame.sendGameControlEvent('NEXT_QUARTER');
  }, [eventDrivenGame]);

  // 实现团队管理
  const updateTeam = React.useCallback(async (
    teamId: string, 
    updates: Partial<Team>
  ): Promise<void> => {
    // TODO: 实现团队更新事件
    console.log('更新团队:', { teamId, updates });
  }, []);

  const addPlayer = React.useCallback(async (
    teamId: string, 
    player: Player
  ): Promise<void> => {
    // TODO: 实现添加球员事件
    console.log('添加球员:', { teamId, player });
  }, []);

  const removePlayer = React.useCallback(async (
    teamId: string, 
    playerId: string
  ): Promise<void> => {
    // TODO: 实现移除球员事件
    console.log('移除球员:', { teamId, playerId });
  }, []);

  const syncPlayerInfo = React.useCallback(async (
    originalPlayer: Player, 
    updatedPlayer: Player
  ): Promise<void> => {
    // TODO: 实现球员信息同步事件
    console.log('同步球员信息:', { originalPlayer, updatedPlayer });
  }, []);

  // 实现游戏控制
  const startNewGame = React.useCallback(async (
    homeTeam: Team, 
    awayTeam: Team
  ): Promise<void> => {
    // TODO: 实现开始新游戏事件
    console.log('开始新游戏:', { homeTeam, awayTeam });
  }, []);

  const resetGame = React.useCallback(async (): Promise<void> => {
    await eventDrivenGame.sendGameControlEvent('RESET');
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
    undoScore,
    updatePlayerStat,
    addShotAttempt,
    addFoul,
    useTimeout,
    togglePlayerCourtStatus,
    setQuarterTime,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    updateTime,
    nextQuarter,
    
    // 团队和球员管理
    updateTeam,
    addPlayer,
    removePlayer,
    syncPlayerInfo,
    
    // 游戏控制
    startNewGame,
    resetGame,
    
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
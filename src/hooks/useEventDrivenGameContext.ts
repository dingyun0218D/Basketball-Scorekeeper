import { useContext } from 'react';
import { EventDrivenGameContext } from '../contexts/EventDrivenGameContextDefinition';
import { GameState, Team, Player, ScoreType } from '../types';
import { GameEvent } from '../types/events';

// 事件驱动游戏上下文类型
export interface EventDrivenGameContextType {
  // 游戏状态
  gameState: GameState | null;
  isConnected: boolean;
  lastSyncTime: number;
  error: string | null;
  
  // 事件操作方法
  addScore: (teamId: string, points: number, playerId?: string, scoreType?: ScoreType) => Promise<void>;
  undoScore: (teamId: string, playerId: string, scoreType: ScoreType) => Promise<void>;
  updatePlayerStat: (teamId: string, playerId: string, stat: string, value: number) => Promise<void>;
  addShotAttempt: (teamId: string, playerId: string, shotType: 'field' | 'three' | 'free') => Promise<void>;
  addFoul: (teamId: string, playerId?: string) => Promise<void>;
  useTimeout: (teamId: string) => Promise<void>;
  togglePlayerCourtStatus: (teamId: string, playerId: string) => Promise<void>;
  setQuarterTime: (time: string) => Promise<void>;
  startTimer: () => Promise<void>;
  pauseTimer: () => Promise<void>;
  resumeTimer: () => Promise<void>;
  stopTimer: () => Promise<void>;
  updateTime: (time: string) => Promise<void>;
  nextQuarter: () => Promise<void>;
  
  // 团队和球员管理
  updateTeam: (teamId: string, updates: Partial<Team>) => Promise<void>;
  addPlayer: (teamId: string, player: Player) => Promise<void>;
  removePlayer: (teamId: string, playerId: string) => Promise<void>;
  syncPlayerInfo: (originalPlayer: Player, updatedPlayer: Player) => Promise<void>;
  
  // 游戏控制
  startNewGame: (homeTeam: Team, awayTeam: Team) => Promise<void>;
  resetGame: () => Promise<void>;
  
  // 协作功能
  sessionId?: string;
  setSessionId: (sessionId: string) => void;
  
  // 直接访问事件操作
  sendEvent: (event: GameEvent) => Promise<void>;
}

// Hook来使用事件驱动游戏上下文
export const useEventDrivenGameContext = (): EventDrivenGameContextType => {
  const context = useContext(EventDrivenGameContext);
  if (!context) {
    throw new Error('useEventDrivenGameContext must be used within an EventDrivenGameProvider');
  }
  return context;
}; 
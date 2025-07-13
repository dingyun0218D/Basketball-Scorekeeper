import React, { ReactNode, useEffect, useState } from 'react';
import { EventDrivenGameProvider } from './EventDrivenGameContext';
import { GameState, User } from '../types';
import { GameEvent } from '../types/events';
import { EventDrivenCollaborativeService } from '../services/eventDrivenCollaborationService';
import { generateId, createDefaultTeam } from '../utils/gameUtils';
import { loadCurrentGame, saveCurrentGame } from '../utils/storage';

// 默认用户
const DEFAULT_USER: User = {
  id: generateId(),
  name: '本地用户'
};

// 默认游戏状态
const createDefaultGameState = (): GameState => ({
  id: generateId(),
  homeTeam: createDefaultTeam('主队', '#1E40AF'),
  awayTeam: createDefaultTeam('客队', '#DC2626'),
  quarter: 1,
  time: '15:00',
  quarterTime: '15:00',
  isRunning: false,
  isPaused: false,
  events: [],
  createdAt: Date.now(),
  updatedAt: Date.now()
});

// 模拟的事件驱动协作服务
class MockEventDrivenCollaborativeService implements EventDrivenCollaborativeService {
  async publishEvent(sessionId: string, event: GameEvent): Promise<{ sequence: number; timestamp: number }> {
    console.log('模拟发布事件:', { sessionId, event });
    return { sequence: Date.now(), timestamp: Date.now() };
  }

  subscribeToEvents(sessionId: string, _callback: (events: GameEvent[]) => void): () => void {
    console.log('模拟订阅事件:', sessionId);
    return () => {
      console.log('模拟取消订阅事件:', sessionId);
    };
  }

  async getLastSequence(sessionId: string): Promise<number> {
    console.log('模拟获取最后序列号:', sessionId);
    return 0;
  }

  async getEventsFromSequence(sessionId: string, fromSequence: number): Promise<GameEvent[]> {
    console.log('模拟获取事件序列:', { sessionId, fromSequence });
    return [];
  }

  async createEventSession(sessionId: string, initialState: GameState): Promise<void> {
    console.log('模拟创建事件会话:', { sessionId, initialState });
  }

  async joinEventSession(sessionId: string, userId: string): Promise<boolean> {
    console.log('模拟加入事件会话:', { sessionId, userId });
    return true;
  }

  async leaveEventSession(sessionId: string, userId: string): Promise<void> {
    console.log('模拟离开事件会话:', { sessionId, userId });
  }

  async updateUserActivity(sessionId: string, userId: string): Promise<void> {
    console.log('模拟更新用户活动:', { sessionId, userId });
  }

  async getActiveUsers(sessionId: string): Promise<string[]> {
    console.log('模拟获取活跃用户:', sessionId);
    return [];
  }

  getServiceName(): string {
    return 'MockEventDrivenService';
  }
}

// 应用级别的Provider属性
interface AppEventDrivenGameProviderProps {
  children: ReactNode;
}

// 应用级别的Provider组件
export const AppEventDrivenGameProvider: React.FC<AppEventDrivenGameProviderProps> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [collaborationService] = useState(() => new MockEventDrivenCollaborativeService());
  const [user] = useState<User>(DEFAULT_USER);
  const [sessionId] = useState<string | undefined>();

  // 加载保存的游戏状态
  useEffect(() => {
    console.log('🎮 AppEventDrivenGameProvider: 尝试加载保存的游戏状态');
    const savedGame = loadCurrentGame();
    if (savedGame) {
      console.log('✅ 加载已保存的游戏状态', savedGame);
      setGameState(savedGame);
    } else {
      console.log('📝 没有找到保存的游戏状态，使用默认状态');
      const defaultState = createDefaultGameState();
      setGameState(defaultState);
    }
  }, []);

  // 自动保存游戏状态
  useEffect(() => {
    if (gameState) {
      console.log('💾 自动保存游戏状态');
      saveCurrentGame(gameState);
    }
  }, [gameState]);

  // 调试输出
  useEffect(() => {
    console.log('🏀 AppEventDrivenGameProvider: 游戏状态更新', {
      hasGameState: !!gameState,
      hasHomeTeam: !!gameState?.homeTeam,
      hasAwayTeam: !!gameState?.awayTeam,
      homeTeamName: gameState?.homeTeam?.name,
      awayTeamName: gameState?.awayTeam?.name,
      quarter: gameState?.quarter,
      time: gameState?.time,
      sessionId
    });
  }, [gameState, sessionId]);

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载游戏状态...</p>
        </div>
      </div>
    );
  }

  return (
    <EventDrivenGameProvider
      sessionId={sessionId}
      user={user}
      initialGameState={gameState}
      collaborationService={collaborationService}
    >
      {children}
    </EventDrivenGameProvider>
  );
}; 
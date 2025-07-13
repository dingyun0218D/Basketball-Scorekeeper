import { useCallback, useEffect, useState, useRef } from 'react';
import { GameState, User } from '../types';
import { GameEvent } from '../types/events';
import { EventFactory, createEventFactory } from '../utils/eventFactory';
import { EventApplier } from '../utils/eventApplier';
import { EventSequenceManager } from '../services/eventSequenceManager';
import { EventDrivenCollaborativeService } from '../services/eventDrivenCollaborationService';

interface UseEventDrivenGameProps {
  sessionId?: string;
  user: User;
  initialGameState?: GameState;
  service: EventDrivenCollaborativeService;
}

export const useEventDrivenGame = (props: UseEventDrivenGameProps) => {
  const { sessionId, user, initialGameState, service } = props;
  
  // 游戏状态
  const [gameState, setGameState] = useState<GameState | null>(initialGameState || null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  
  // 事件管理
  const eventFactory = useRef<EventFactory | null>(null);
  const eventSequenceManager = useRef<EventSequenceManager | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const baseGameState = useRef<GameState | null>(null);

  // 初始化事件管理器
  useEffect(() => {
    if (sessionId && user.id) {
      eventFactory.current = createEventFactory(sessionId, user.id);
      eventSequenceManager.current = new EventSequenceManager(sessionId);
      baseGameState.current = initialGameState || null;
    }
  }, [sessionId, user.id, initialGameState]);

  // 重建游戏状态
  useEffect(() => {
    if (!eventSequenceManager.current || !baseGameState.current) return;

    const appliedEvents = eventSequenceManager.current.getAppliedEvents();
    const newGameState = EventApplier.applyEventSequence(baseGameState.current, appliedEvents);
    
    setGameState(newGameState);
  }, []);

  // 发送事件的通用方法
  const sendEvent = useCallback(async (event: GameEvent): Promise<void> => {
    if (!sessionId || !eventSequenceManager.current) {
      throw new Error('未连接到会话');
    }

    try {
      // 1. 记录事件到序列管理器
      await eventSequenceManager.current.addEvent(event);
      
      // 2. 立即应用到本地状态（乐观更新）
      if (gameState) {
        const newState = EventApplier.applyEvent(gameState, event);
        setGameState(newState);
      }
      
      // 3. 发送到远程服务
      await service.publishEvent(sessionId, event);
      
      setLastSyncTime(Date.now());
    } catch (error) {
      console.error('发送事件失败:', error);
      setError(error instanceof Error ? error.message : '发送事件失败');
      throw error;
    }
  }, [sessionId, gameState, service]);

  // 订阅远程事件
  useEffect(() => {
    if (!sessionId || !isConnected) return;

    const unsubscribe = service.subscribeToEvents(sessionId, (events: GameEvent[]) => {
      if (eventSequenceManager.current) {
        eventSequenceManager.current.addEvents(events);
        
        // 重建游戏状态
        if (baseGameState.current) {
          const appliedEvents = eventSequenceManager.current.getAppliedEvents();
          const newGameState = EventApplier.applyEventSequence(baseGameState.current, appliedEvents);
          setGameState(newGameState);
        }
      }
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [sessionId, isConnected, service]);

  // 通用事件创建和发送方法
  const createAndSendEvent = useCallback(async (
    eventType: string, 
    ...args: unknown[]
  ): Promise<void> => {
    if (!eventFactory.current || !gameState) {
      throw new Error('事件工厂未初始化或游戏状态不可用');
    }

    let event: GameEvent;
    
    switch (eventType) {
      case 'SCORE': {
        const [teamId, playerId, points, scoreType] = args;
        event = eventFactory.current.createScoreEvent(
          teamId as string, playerId as string, points as (1 | 2 | 3), scoreType as ('field_goal' | 'three_pointer' | 'free_throw'), 
          gameState.quarter, gameState.time
        );
        break;
      }
      
      case 'FOUL': {
        const [foulTeamId, foulPlayerId, foulType] = args;
        event = eventFactory.current.createFoulEvent(
          foulTeamId as string, foulPlayerId as string, foulType as ('personal' | 'technical' | 'flagrant' | 'offensive'),
          gameState.quarter, gameState.time
        );
        break;
      }
      
      default:
        throw new Error(`不支持的事件类型: ${eventType}`);
    }
    
    await sendEvent(event);
  }, [gameState, sendEvent]);

  // 具体的事件发送方法
  const sendScoreEvent = useCallback(async (
    teamId: string, 
    playerId: string, 
    points: 1 | 2 | 3, 
    scoreType: 'field_goal' | 'three_pointer' | 'free_throw'
  ): Promise<void> => {
    if (!eventFactory.current || !gameState) return;
    
    const event = eventFactory.current.createScoreEvent(
      teamId, playerId, points, scoreType,
      gameState.quarter, gameState.time
    );
    
    await sendEvent(event);
  }, [gameState, sendEvent]);

  const sendFoulEvent = useCallback(async (
    teamId: string, 
    playerId: string, 
    foulType: 'personal' | 'technical' | 'flagrant' | 'offensive'
  ): Promise<void> => {
    if (!eventFactory.current || !gameState) return;
    
    const event = eventFactory.current.createFoulEvent(
      teamId, playerId, foulType,
      gameState.quarter, gameState.time
    );
    
    await sendEvent(event);
  }, [gameState, sendEvent]);

  const sendGameControlEvent = useCallback(async (
    action: 'START' | 'PAUSE' | 'RESUME' | 'STOP' | 'NEXT_QUARTER' | 'RESET'
  ): Promise<void> => {
    if (!eventFactory.current || !gameState) return;
    
    const event = eventFactory.current.createGameControlEvent(
      action, gameState.quarter, gameState.time
    );
    
    await sendEvent(event);
  }, [gameState, sendEvent]);

  // 连接管理
  const connect = useCallback(async (): Promise<void> => {
    if (!sessionId) {
      throw new Error('会话ID不能为空');
    }

    try {
      setIsConnected(true);
      setError(null);
    } catch (error) {
      setIsConnected(false);
      setError(error instanceof Error ? error.message : '连接失败');
      throw error;
    }
  }, [sessionId]);

  const disconnect = useCallback(async (): Promise<void> => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    
    setIsConnected(false);
    setError(null);
  }, []);

  // 清理资源
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  return {
    // 状态
    gameState,
    isConnected,
    lastSyncTime,
    error,
    
    // 连接管理
    connect,
    disconnect,
    
    // 事件发送方法
    sendScoreEvent,
    sendFoulEvent,
    sendGameControlEvent,
    createAndSendEvent,
    
    // 低级方法
    sendEvent
  };
}; 
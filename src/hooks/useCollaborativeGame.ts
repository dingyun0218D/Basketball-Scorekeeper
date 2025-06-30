import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, GameEvent, User, ServiceType } from '../types';
import { collaborationServiceManager } from '../services/collaborationServiceManager';

interface UseCollaborativeGameProps {
  sessionId?: string;
  user: User;
  initialGameState?: GameState;
  serviceType?: ServiceType;
}

interface UseCollaborativeGameReturn {
  gameState: GameState | null;
  events: GameEvent[];
  connectedUsers: User[];
  isConnected: boolean;
  isHost: boolean;
  sessionId: string | null;
  serviceType: ServiceType;
  createSession: (initialState: GameState) => Promise<string>;
  joinSession: (sessionId: string) => Promise<boolean>;
  updateGameState: (newState: GameState) => Promise<void>;
  addEvent: (event: Omit<GameEvent, 'id' | 'timestamp' | 'sessionId'>) => Promise<void>;
  leaveSession: () => void;
  switchService: (newServiceType: ServiceType) => void;
  error: string | null;
}

export const useCollaborativeGame = ({
  sessionId: initialSessionId,
  user,
  initialGameState: _initialGameState,
  serviceType: initialServiceType = 'firebase'
}: UseCollaborativeGameProps): UseCollaborativeGameReturn => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null);
  const [serviceType, setServiceType] = useState<ServiceType>(initialServiceType);
  const [error, setError] = useState<string | null>(null);

  // 用于存储取消订阅函数
  const unsubscribeRefs = useRef<Array<() => void>>([]);

  // 获取当前服务
  const getCurrentService = useCallback(() => {
    collaborationServiceManager.switchService(serviceType);
    return collaborationServiceManager.getCurrentService();
  }, [serviceType]);

  // 清理所有订阅
  const cleanup = useCallback(() => {
    unsubscribeRefs.current.forEach(unsubscribe => unsubscribe());
    unsubscribeRefs.current = [];
    setIsConnected(false);
  }, []);

  // 创建新会话
  const createSession = useCallback(async (initialState: GameState): Promise<string> => {
    try {
      const service = getCurrentService();
      const newSessionId = service.generateSessionId();
      const stateWithSession = {
        ...initialState,
        sessionId: newSessionId,
        activeUsers: { [user.id]: new Date() }
      };

      await service.createGameSession(stateWithSession, newSessionId);
      setSessionId(newSessionId);
      setIsHost(true);
      setError(null);
      
      return newSessionId;
    } catch (err) {
      const errorMessage = '创建会话失败: ' + (err as Error).message;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [user.id, getCurrentService]);

  // 加入现有会话
  const joinSession = useCallback(async (targetSessionId: string): Promise<boolean> => {
    try {
      const service = getCurrentService();
      const exists = await service.checkSessionExists(targetSessionId);
      if (!exists) {
        setError('会话不存在');
        return false;
      }

      setSessionId(targetSessionId);
      setIsHost(false);
      setError(null);
      
      // 更新用户活动状态
      await service.updateUserActivity(targetSessionId, user.id);
      
      return true;
    } catch (err) {
      const errorMessage = '加入会话失败: ' + (err as Error).message;
      setError(errorMessage);
      return false;
    }
  }, [user.id, getCurrentService]);

  // 更新游戏状态
  const updateGameState = useCallback(async (newState: GameState): Promise<void> => {
    if (!sessionId) {
      setError('没有活跃的会话');
      return;
    }

    try {
      const service = getCurrentService();
      const stateWithUserActivity = {
        ...newState,
        sessionId,
        activeUsers: {
          ...newState.activeUsers,
          [user.id]: new Date()
        },
        // 移除本地时间戳，让服务器设置
        updatedAt: undefined as unknown as number
      };

      await service.updateGameState(sessionId, stateWithUserActivity);
      setError(null);
    } catch (err) {
      const errorMessage = '更新游戏状态失败: ' + (err as Error).message;
      setError(errorMessage);
    }
  }, [sessionId, user.id, getCurrentService]);

  // 添加游戏事件
  const addEvent = useCallback(async (eventData: Omit<GameEvent, 'id' | 'timestamp' | 'sessionId'>): Promise<void> => {
    if (!sessionId) {
      setError('没有活跃的会话');
      return;
    }

    try {
      const service = getCurrentService();
      const event: GameEvent = {
        ...eventData,
        id: '', // 将由服务生成
        timestamp: new Date(),
        sessionId
      };

      await service.addGameEvent(sessionId, event);
      setError(null);
    } catch (err) {
      const errorMessage = '添加事件失败: ' + (err as Error).message;
      setError(errorMessage);
    }
  }, [sessionId, getCurrentService]);

  // 离开会话
  const leaveSession = useCallback(() => {
    cleanup();
    setSessionId(null);
    setGameState(null);
    setEvents([]);
    setConnectedUsers([]);
    setIsHost(false);
    setError(null);
  }, [cleanup]);

  // 切换服务
  const switchService = useCallback((newServiceType: ServiceType) => {
    if (sessionId) {
      // 如果有活跃会话，先离开
      leaveSession();
    }
    setServiceType(newServiceType);
    setError(null);
  }, [sessionId, leaveSession]);

  // 监听游戏状态和事件
  useEffect(() => {
    if (!sessionId) return;

    let mounted = true;

    const startListening = async () => {
      try {
        const service = getCurrentService();
        
        // 订阅游戏状态变化
        const unsubscribeGameState = service.subscribeToGameState(sessionId, (state) => {
          if (!mounted) return;
          
          if (state) {
            setGameState(state);
            setIsConnected(true);
            
            // 更新连接用户列表
            if (state.activeUsers) {
              const now = new Date();
              const activeUsersList: User[] = Object.entries(state.activeUsers)
                .filter(([, lastSeen]) => {
                  const lastSeenDate = lastSeen instanceof Date ? lastSeen : new Date(lastSeen as string | number);
                  return (now.getTime() - lastSeenDate.getTime()) < 30000; // 30秒内活跃
                })
                .map(([userId]) => ({
                  id: userId,
                  name: userId === user.id ? user.name : `用户 ${userId.slice(-4)}`, // 简化用户名显示
                  isHost: userId === Object.keys(state.activeUsers!)[0] // 第一个用户为主机
                }));
              
              setConnectedUsers(activeUsersList);
            }
          } else {
            setGameState(null);
            setIsConnected(false);
            setConnectedUsers([]);
          }
        });

        // 订阅游戏事件变化
        const unsubscribeEvents = service.subscribeToGameEvents(sessionId, (eventsList) => {
          if (!mounted) return;
          setEvents(eventsList);
        });

        // 保存取消订阅函数
        unsubscribeRefs.current = [unsubscribeGameState, unsubscribeEvents];

      } catch (err) {
        if (mounted) {
          const errorMessage = '连接协作服务失败: ' + (err as Error).message;
          setError(errorMessage);
        }
      }
    };

    startListening();

    return () => {
      mounted = false;
      cleanup();
    };
  }, [sessionId, getCurrentService, user.id, user.name, cleanup]);

  return {
    gameState,
    events,
    connectedUsers,
    isConnected,
    isHost,
    sessionId,
    serviceType,
    createSession,
    joinSession,
    updateGameState,
    addEvent,
    leaveSession,
    switchService,
    error
  };
}; 
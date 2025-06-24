import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, GameEvent, User } from '../types';
import { firestoreService } from '../services/firestoreService';

interface UseCollaborativeGameProps {
  sessionId?: string;
  user: User;
  initialGameState?: GameState;
}

interface UseCollaborativeGameReturn {
  gameState: GameState | null;
  events: GameEvent[];
  connectedUsers: User[];
  isConnected: boolean;
  isHost: boolean;
  sessionId: string | null;
  createSession: (initialState: GameState) => Promise<string>;
  joinSession: (sessionId: string) => Promise<boolean>;
  updateGameState: (newState: GameState) => Promise<void>;
  addEvent: (event: Omit<GameEvent, 'id' | 'timestamp' | 'sessionId'>) => Promise<void>;
  leaveSession: () => void;
  error: string | null;
}

export const useCollaborativeGame = ({
  sessionId: initialSessionId,
  user,
  initialGameState: _initialGameState
}: UseCollaborativeGameProps): UseCollaborativeGameReturn => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null);
  const [error, setError] = useState<string | null>(null);

  // 用于存储取消订阅函数
  const unsubscribeRefs = useRef<Array<() => void>>([]);

  // 清理所有订阅
  const cleanup = useCallback(() => {
    unsubscribeRefs.current.forEach(unsubscribe => unsubscribe());
    unsubscribeRefs.current = [];
    setIsConnected(false);
  }, []);

  // 创建新会话
  const createSession = useCallback(async (initialState: GameState): Promise<string> => {
    try {
      const newSessionId = firestoreService.generateSessionId();
      const stateWithSession = {
        ...initialState,
        sessionId: newSessionId,
        activeUsers: { [user.id]: new Date() }
      };

      await firestoreService.createGameSession(stateWithSession, newSessionId);
      setSessionId(newSessionId);
      setIsHost(true);
      setError(null);
      
      return newSessionId;
    } catch (err) {
      const errorMessage = '创建会话失败: ' + (err as Error).message;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [user.id]);

  // 加入现有会话
  const joinSession = useCallback(async (targetSessionId: string): Promise<boolean> => {
    try {
      const exists = await firestoreService.checkSessionExists(targetSessionId);
      if (!exists) {
        setError('会话不存在');
        return false;
      }

      setSessionId(targetSessionId);
      setIsHost(false);
      setError(null);
      
      // 更新用户活动状态
      await firestoreService.updateUserActivity(targetSessionId, user.id);
      
      return true;
    } catch (err) {
      const errorMessage = '加入会话失败: ' + (err as Error).message;
      setError(errorMessage);
      return false;
    }
  }, [user.id]);

  // 更新游戏状态
  const updateGameState = useCallback(async (newState: GameState): Promise<void> => {
    if (!sessionId) {
      setError('没有活跃的会话');
      return;
    }

    try {
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

      await firestoreService.updateGameState(sessionId, stateWithUserActivity);
      setError(null);
    } catch (err) {
      const errorMessage = '更新游戏状态失败: ' + (err as Error).message;
      setError(errorMessage);
    }
  }, [sessionId, user.id]);

  // 添加游戏事件
  const addEvent = useCallback(async (eventData: Omit<GameEvent, 'id' | 'timestamp' | 'sessionId'>): Promise<void> => {
    if (!sessionId) {
      setError('没有活跃的会话');
      return;
    }

    try {
      const event: GameEvent = {
        ...eventData,
        id: '', // 将由 Firestore 生成
        timestamp: new Date(),
        sessionId
      };

      await firestoreService.addGameEvent(sessionId, event);
      setError(null);
    } catch (err) {
      const errorMessage = '添加事件失败: ' + (err as Error).message;
      setError(errorMessage);
    }
  }, [sessionId]);

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

  // 监听游戏状态和事件
  useEffect(() => {
    if (!sessionId) return;

    let mounted = true;

    const startListening = async () => {
      try {
        // 订阅游戏状态变化
        const unsubscribeGameState = firestoreService.subscribeToGameState(sessionId, (state) => {
          if (!mounted) return;
          
          if (state) {
            setGameState(state);
            setIsConnected(true);
            
            // 更新连接用户列表
            if (state.activeUsers) {
              const now = new Date();
              const activeUsersList: User[] = Object.entries(state.activeUsers)
                .filter(([, lastSeen]) => {
                  const lastSeenDate = lastSeen instanceof Date ? lastSeen : new Date(lastSeen);
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
        const unsubscribeEvents = firestoreService.subscribeToGameEvents(sessionId, (eventsList) => {
          if (!mounted) return;
          setEvents(eventsList);
        });

        unsubscribeRefs.current = [unsubscribeGameState, unsubscribeEvents];

        // 定期更新用户活动状态
        const activityInterval = setInterval(() => {
          if (mounted && sessionId) {
            firestoreService.updateUserActivity(sessionId, user.id).catch(console.error);
          }
        }, 15000); // 每15秒更新一次

        return () => {
          clearInterval(activityInterval);
        };

      } catch (err) {
        if (mounted) {
          setError('连接失败: ' + (err as Error).message);
          setIsConnected(false);
        }
      }
    };

    startListening();

    return () => {
      mounted = false;
      cleanup();
    };
  }, [sessionId, user.id, user.name, cleanup]);

  return {
    gameState,
    events,
    connectedUsers,
    isConnected,
    isHost,
    sessionId,
    createSession,
    joinSession,
    updateGameState,
    addEvent,
    leaveSession,
    error
  };
}; 
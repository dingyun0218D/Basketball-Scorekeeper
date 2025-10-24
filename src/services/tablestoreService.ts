import { CollaborativeService } from '../types';
import type { GameState, GameEvent } from '../types';
import { tablestoreConfig } from '../config/tablestore';
import { wsClient, WSMessageType } from './tablestoreWebSocketClient';

/**
 * TableStore协同服务
 * 通过后端API和WebSocket实现实时协同
 */
export class TableStoreService implements CollaborativeService {
  private isInitialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  /**
   * 初始化服务（支持并发调用）
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // 如果正在初始化，返回现有的 Promise，避免重复连接
    if (this.initPromise) {
      return this.initPromise;
    }

    // 创建新的初始化 Promise
    this.initPromise = wsClient.connect()
      .then(() => {
        this.isInitialized = true;
        this.initPromise = null;
        console.log('✅ TableStore Service initialized');
      })
      .catch((error) => {
        this.initPromise = null;
        console.error('❌ Failed to initialize TableStore Service:', error);
        throw error;
      });

    return this.initPromise;
  }

  /**
   * 服务名称
   */
  getServiceName(): string {
    return 'TableStore';
  }

  /**
   * 创建新游戏会话
   */
  async createGameSession(gameState: GameState, sessionId: string): Promise<void> {
    try {
      const response = await fetch(`${tablestoreConfig.apiBaseUrl}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          gameState,
          sessionId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create game session');
      }

      console.log(`✅ Created game session: ${sessionId}`);
    } catch (error) {
      console.error('❌ Error creating game session:', error);
      throw error;
    }
  }

  /**
   * 更新游戏状态
   */
  async updateGameState(sessionId: string, gameState: GameState): Promise<void> {
    try {
      const response = await fetch(`${tablestoreConfig.apiBaseUrl}/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gameState })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update game state');
      }

      console.log(`✅ Updated game session: ${sessionId}`);
    } catch (error) {
      console.error('❌ Error updating game state:', error);
      throw error;
    }
  }

  /**
   * 监听游戏状态变化
   */
  subscribeToGameState(
    sessionId: string,
    callback: (gameState: GameState | null) => void
  ): () => void {
    // 订阅WebSocket消息
    const unsubscribeWS = wsClient.on(
      WSMessageType.GAME_STATE_UPDATE,
      (payload) => {
        try {
          const data = payload as { sessionId: string; gameState: GameState };
          if (data.sessionId === sessionId) {
            // 简单验证：确保数据存在
            if (data.gameState && typeof data.gameState === 'object') {
              callback(data.gameState);
            } else {
              console.warn('⚠️ 收到无效的游戏状态数据');
              callback(null);
            }
          }
        } catch (error) {
          console.error('❌ 处理游戏状态更新失败:', error);
          callback(null);
        }
      }
    );

    // 等待连接成功后再发送订阅请求
    this.initialize()
      .then(() => {
        wsClient.send({
          type: WSMessageType.SUBSCRIBE_SESSION,
          payload: { sessionId }
        });
      })
      .catch((error) => {
        console.error('❌ 订阅游戏状态失败:', error);
        callback(null);
      });

    // 立即获取一次当前状态
    this.getGameState(sessionId)
      .then((state) => {
        if (state && typeof state === 'object') {
          callback(state);
        } else {
          callback(null);
        }
      })
      .catch((error) => {
        console.error('❌ 获取游戏状态失败:', error);
        callback(null);
      });

    // 返回取消订阅函数
    return () => {
      if (wsClient.isConnected()) {
        wsClient.send({
          type: WSMessageType.UNSUBSCRIBE_SESSION,
          payload: { sessionId }
        });
      }
      unsubscribeWS();
    };
  }

  /**
   * 添加游戏事件
   */
  async addGameEvent(sessionId: string, event: GameEvent): Promise<void> {
    try {
      const response = await fetch(
        `${tablestoreConfig.apiBaseUrl}/sessions/${sessionId}/events`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ event })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add game event');
      }

      console.log(`✅ Added game event for session: ${sessionId}`);
    } catch (error) {
      console.error('❌ Error adding game event:', error);
      throw error;
    }
  }

  /**
   * 监听游戏事件
   */
  subscribeToGameEvents(
    sessionId: string,
    callback: (events: GameEvent[]) => void
  ): () => void {
    // 本地事件缓存
    let localEvents: GameEvent[] = [];

    // 订阅WebSocket消息
    const unsubscribeWS = wsClient.on(
      WSMessageType.GAME_EVENTS_UPDATE,
      (payload) => {
        try {
          const data = payload as { sessionId: string; event: GameEvent };
          if (data.sessionId === sessionId && data.event) {
            // 添加新事件到本地缓存
            localEvents = [data.event, ...localEvents];
            callback([...localEvents]);
          }
        } catch (error) {
          console.error('❌ 处理游戏事件更新失败:', error);
          callback([]);
        }
      }
    );

    // 等待连接成功后再发送订阅请求
    this.initialize()
      .then(() => {
        wsClient.send({
          type: WSMessageType.SUBSCRIBE_EVENTS,
          payload: { sessionId }
        });
      })
      .catch((error) => {
        console.error('❌ 订阅游戏事件失败:', error);
      });

    // 立即获取一次当前事件列表
    this.getGameEvents(sessionId)
      .then((events) => {
        if (Array.isArray(events)) {
          localEvents = events;
          callback(events);
        } else {
          callback([]);
        }
      })
      .catch((error) => {
        console.error('❌ 获取游戏事件失败:', error);
        callback([]);
      });

    // 返回取消订阅函数
    return () => {
      if (wsClient.isConnected()) {
        wsClient.send({
          type: WSMessageType.UNSUBSCRIBE_EVENTS,
          payload: { sessionId }
        });
      }
      unsubscribeWS();
    };
  }

  /**
   * 检查会话是否存在
   */
  async checkSessionExists(sessionId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${tablestoreConfig.apiBaseUrl}/sessions/${sessionId}/exists`
      );

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.exists || false;
    } catch (error) {
      console.error('❌ Error checking session:', error);
      return false;
    }
  }

  /**
   * 删除游戏会话
   */
  async deleteGameSession(sessionId: string): Promise<void> {
    try {
      const response = await fetch(
        `${tablestoreConfig.apiBaseUrl}/sessions/${sessionId}`,
        {
          method: 'DELETE'
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete game session');
      }

      console.log(`✅ Deleted game session: ${sessionId}`);
    } catch (error) {
      console.error('❌ Error deleting game session:', error);
      throw error;
    }
  }

  /**
   * 更新用户活动时间
   */
  async updateUserActivity(sessionId: string, userId: string): Promise<void> {
    try {
      const response = await fetch(
        `${tablestoreConfig.apiBaseUrl}/sessions/${sessionId}/activity`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user activity');
      }
    } catch (error) {
      console.error('❌ Error updating user activity:', error);
      throw error;
    }
  }

  /**
   * 生成会话ID
   */
  generateSessionId(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  /**
   * 获取游戏状态（私有方法）
   */
  private async getGameState(sessionId: string): Promise<GameState | null> {
    try {
      const response = await fetch(
        `${tablestoreConfig.apiBaseUrl}/sessions/${sessionId}`
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.gameState || null;
    } catch (error) {
      console.error('❌ Error getting game state:', error);
      return null;
    }
  }

  /**
   * 获取游戏事件列表（私有方法）
   */
  private async getGameEvents(sessionId: string): Promise<GameEvent[]> {
    try {
      const response = await fetch(
        `${tablestoreConfig.apiBaseUrl}/sessions/${sessionId}/events?limit=100`
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.events || [];
    } catch (error) {
      console.error('❌ Error getting game events:', error);
      return [];
    }
  }
}

// 导出单例
export const tablestoreService = new TableStoreService();


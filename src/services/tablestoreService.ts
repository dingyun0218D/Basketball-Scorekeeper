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

  /**
   * 初始化服务
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      await wsClient.connect();
      this.isInitialized = true;
      console.log('✅ TableStore Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize TableStore Service:', error);
      throw error;
    }
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
    // 确保WebSocket已连接
    this.initialize().catch(console.error);

    // 订阅WebSocket消息
    const unsubscribeWS = wsClient.on(
      WSMessageType.GAME_STATE_UPDATE,
      (payload) => {
        const data = payload as { sessionId: string; gameState: GameState };
        if (data.sessionId === sessionId) {
          callback(data.gameState);
        }
      }
    );

    // 发送订阅请求
    wsClient.send({
      type: WSMessageType.SUBSCRIBE_SESSION,
      payload: { sessionId }
    });

    // 立即获取一次当前状态
    this.getGameState(sessionId).then(callback).catch(() => callback(null));

    // 返回取消订阅函数
    return () => {
      wsClient.send({
        type: WSMessageType.UNSUBSCRIBE_SESSION,
        payload: { sessionId }
      });
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
    // 确保WebSocket已连接
    this.initialize().catch(console.error);

    // 本地事件缓存
    let localEvents: GameEvent[] = [];

    // 订阅WebSocket消息
    const unsubscribeWS = wsClient.on(
      WSMessageType.GAME_EVENTS_UPDATE,
      (payload) => {
        const data = payload as { sessionId: string; event: GameEvent };
        if (data.sessionId === sessionId) {
          // 添加新事件到本地缓存
          localEvents = [data.event, ...localEvents];
          callback([...localEvents]);
        }
      }
    );

    // 发送订阅请求
    wsClient.send({
      type: WSMessageType.SUBSCRIBE_EVENTS,
      payload: { sessionId }
    });

    // 立即获取一次当前事件列表
    this.getGameEvents(sessionId).then((events) => {
      localEvents = events;
      callback(events);
    }).catch(() => callback([]));

    // 返回取消订阅函数
    return () => {
      wsClient.send({
        type: WSMessageType.UNSUBSCRIBE_EVENTS,
        payload: { sessionId }
      });
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


import { db } from '../config/cloudbase';
import { GameState, GameEvent } from '../types';

export class CloudbaseService {
  private gameCollection = 'games';
  private eventsCollection = 'events';

  // 检查CloudBase是否可用
  private checkAvailability(): boolean {
    if (!db) {
      console.warn('CloudBase 未初始化或不可用');
      return false;
    }
    return true;
  }

  // 创建新游戏会话
  async createGameSession(gameState: GameState, sessionId: string): Promise<void> {
    if (!this.checkAvailability()) {
      throw new Error('CloudBase 服务不可用');
    }

    try {
      await db.collection(this.gameCollection).doc(sessionId).set({
        ...gameState,
        sessionId,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastActiveAt: new Date()
      });
    } catch (error) {
      console.error('CloudBase 创建会话失败:', error);
      throw new Error('创建会话失败');
    }
  }

  // 更新游戏状态
  async updateGameState(sessionId: string, gameState: GameState): Promise<void> {
    if (!this.checkAvailability()) {
      throw new Error('CloudBase 服务不可用');
    }

    try {
      const { activeUsers, ...updateData } = gameState;
      
      await db.collection(this.gameCollection).doc(sessionId).update({
        ...updateData,
        activeUsers: activeUsers || {},
        updatedAt: new Date(),
        lastActiveAt: new Date()
      });
    } catch (error) {
      console.error('CloudBase 更新游戏状态失败:', error);
      throw new Error('更新游戏状态失败');
    }
  }

  // 监听游戏状态变化
  subscribeToGameState(sessionId: string, callback: (gameState: GameState | null) => void): () => void {
    if (!this.checkAvailability()) {
      callback(null);
      return () => {};
    }

    try {
      const watcher = db.collection(this.gameCollection).doc(sessionId).watch({
        onChange: (snapshot: any) => {
          if (snapshot.docs.length > 0) {
            const data = snapshot.docs[0].data;
            const gameState: GameState = {
              ...data,
              createdAt: data.createdAt || new Date(),
              updatedAt: data.updatedAt || new Date()
            };
            callback(gameState);
          } else {
            callback(null);
          }
        },
        onError: (error: any) => {
          console.error('CloudBase 监听游戏状态失败:', error);
          callback(null);
        }
      });

      return () => {
        watcher.close();
      };
    } catch (error) {
      console.error('CloudBase 订阅游戏状态失败:', error);
      callback(null);
      return () => {};
    }
  }

  // 添加游戏事件
  async addGameEvent(sessionId: string, event: GameEvent): Promise<void> {
    if (!this.checkAvailability()) {
      throw new Error('CloudBase 服务不可用');
    }

    try {
      const eventData = {
        ...event,
        timestamp: new Date(),
        sessionId
      };

      await db.collection(this.gameCollection).doc(sessionId)
        .collection(this.eventsCollection).add(eventData);
    } catch (error) {
      console.error('CloudBase 添加游戏事件失败:', error);
      throw new Error('添加游戏事件失败');
    }
  }

  // 监听游戏事件
  subscribeToGameEvents(sessionId: string, callback: (events: GameEvent[]) => void): () => void {
    if (!this.checkAvailability()) {
      callback([]);
      return () => {};
    }

    try {
      const watcher = db.collection(this.gameCollection).doc(sessionId)
        .collection(this.eventsCollection)
        .orderBy('timestamp', 'desc')
        .watch({
          onChange: (snapshot: any) => {
            const events: GameEvent[] = [];
            snapshot.docs.forEach((doc: any) => {
              const data = doc.data;
              events.push({
                ...data,
                id: doc.id,
                timestamp: data.timestamp || new Date()
              });
            });
            callback(events);
          },
          onError: (error: any) => {
            console.error('CloudBase 监听游戏事件失败:', error);
            callback([]);
          }
        });

      return () => {
        watcher.close();
      };
    } catch (error) {
      console.error('CloudBase 订阅游戏事件失败:', error);
      callback([]);
      return () => {};
    }
  }

  // 检查会话是否存在
  async checkSessionExists(sessionId: string): Promise<boolean> {
    if (!this.checkAvailability()) {
      return false;
    }

    try {
      const result = await db.collection(this.gameCollection).doc(sessionId).get();
      return result.data !== undefined;
    } catch (error) {
      console.error('CloudBase 检查会话失败:', error);
      return false;
    }
  }

  // 删除游戏会话
  async deleteGameSession(sessionId: string): Promise<void> {
    if (!this.checkAvailability()) {
      throw new Error('CloudBase 服务不可用');
    }

    try {
      await db.collection(this.gameCollection).doc(sessionId).remove();
    } catch (error) {
      console.error('CloudBase 删除游戏会话失败:', error);
      throw new Error('删除游戏会话失败');
    }
  }

  // 更新用户活动时间
  async updateUserActivity(sessionId: string, userId: string): Promise<void> {
    if (!this.checkAvailability()) {
      throw new Error('CloudBase 服务不可用');
    }

    try {
      await db.collection(this.gameCollection).doc(sessionId).update({
        [`activeUsers.${userId}`]: new Date()
      });
    } catch (error) {
      console.error('CloudBase 更新用户活动时间失败:', error);
      throw new Error('更新用户活动时间失败');
    }
  }

  // 生成会话ID
  generateSessionId(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // 检查服务是否可用
  isAvailable(): boolean {
    return this.checkAvailability();
  }
}

export const cloudbaseService = new CloudbaseService(); 
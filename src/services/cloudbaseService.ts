import { app, db } from '../config/cloudbase';
import { GameState, GameEvent } from '../types';

// CloudBase 数据库类型定义
interface CloudBaseDB {
  collection(name: string): CloudBaseCollection;
}

interface CloudBaseCollection {
  doc(id: string): CloudBaseDocument;
  add(data: Record<string, unknown>): Promise<CloudBaseAddResult>;
  orderBy(field: string, order: 'asc' | 'desc'): CloudBaseQuery;
}

interface CloudBaseDocument {
  set(data: Record<string, unknown>): Promise<void>;
  update(data: Record<string, unknown>): Promise<void>;
  get(): Promise<CloudBaseGetResult>;
  remove(): Promise<void>;
  collection(name: string): CloudBaseCollection;
  watch(options: CloudBaseWatchOptions): CloudBaseWatcher;
}

interface CloudBaseQuery {
  watch(options: CloudBaseWatchOptions): CloudBaseWatcher;
}

interface CloudBaseAddResult {
  id: string;
}

interface CloudBaseGetResult {
  data?: Record<string, unknown>;
}

interface CloudBaseWatchOptions {
  onChange: (snapshot: CloudBaseSnapshot) => void;
  onError: (error: Error) => void;
}

interface CloudBaseSnapshot {
  docs: CloudBaseDoc[];
}

interface CloudBaseDoc {
  id: string;
  data: Record<string, unknown>;
}

interface CloudBaseWatcher {
  close(): void;
}

export class CloudbaseService {
  private gameCollection = 'games';
  private eventsCollection = 'events';

  // 检查CloudBase是否可用
  private checkAvailability(): boolean {
    return !!app && !!db;
  }

  // 获取数据库实例（带类型断言）
  private getDB(): CloudBaseDB {
    return db as CloudBaseDB;
  }

  // 创建新游戏会话
  async createGameSession(gameState: GameState, sessionId: string): Promise<void> {
    if (!this.checkAvailability()) {
      throw new Error('CloudBase 服务不可用');
    }

    try {
      await this.getDB().collection(this.gameCollection).doc(sessionId).set({
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
      
      await this.getDB().collection(this.gameCollection).doc(sessionId).update({
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
      const watcher: CloudBaseWatcher = this.getDB().collection(this.gameCollection).doc(sessionId).watch({
        onChange: (snapshot: CloudBaseSnapshot) => {
          if (snapshot.docs.length > 0) {
            const data = snapshot.docs[0].data;
            const gameState: GameState = {
              ...data,
              createdAt: data.createdAt || new Date(),
              updatedAt: data.updatedAt || new Date()
            } as GameState;
            callback(gameState);
          } else {
            callback(null);
          }
        },
        onError: (error: Error) => {
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

      await this.getDB().collection(this.gameCollection).doc(sessionId)
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
      const watcher: CloudBaseWatcher = this.getDB().collection(this.gameCollection).doc(sessionId)
        .collection(this.eventsCollection)
        .orderBy('timestamp', 'desc')
        .watch({
          onChange: (snapshot: CloudBaseSnapshot) => {
            const events: GameEvent[] = [];
            snapshot.docs.forEach((doc: CloudBaseDoc) => {
              const data = doc.data;
              events.push({
                ...data,
                id: doc.id,
                timestamp: data.timestamp || new Date()
              } as GameEvent);
            });
            callback(events);
          },
          onError: (error: Error) => {
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
      const result = await this.getDB().collection(this.gameCollection).doc(sessionId).get();
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
      await this.getDB().collection(this.gameCollection).doc(sessionId).remove();
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
      await this.getDB().collection(this.gameCollection).doc(sessionId).update({
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
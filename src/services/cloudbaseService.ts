import { app, db, isAuthenticated, waitForAuth } from '../config/cloudbase';
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

  // 检查CloudBase是否可用并已认证
  private async checkAvailabilityAndAuth(): Promise<boolean> {
    const basicAvailability = !!app && !!db;
    console.log('CloudBase 基础可用性检查:', {
      app: !!app,
      db: !!db,
      isAuthenticated,
      envId: import.meta.env.VITE_CLOUDBASE_ENV_ID,
      region: import.meta.env.VITE_CLOUDBASE_REGION,
      basicAvailability
    });
    
    if (!basicAvailability) {
      console.warn('CloudBase 不可用，详细信息:', {
        app: app ? 'initialized' : 'null/undefined',
        db: db ? 'initialized' : 'null/undefined',
        envIdExists: !!import.meta.env.VITE_CLOUDBASE_ENV_ID,
        envIdValue: import.meta.env.VITE_CLOUDBASE_ENV_ID ? 'configured' : 'not set',
        regionExists: !!import.meta.env.VITE_CLOUDBASE_REGION,
        regionValue: import.meta.env.VITE_CLOUDBASE_REGION || 'not set'
      });
      return false;
    }

    // 如果还没有认证，等待认证完成
    if (!isAuthenticated) {
      console.log('CloudBase 需要等待认证完成...');
      const authSuccess = await waitForAuth();
      if (!authSuccess) {
        console.error('CloudBase 认证失败，无法使用数据库服务');
        return false;
      }
    }

    console.log('CloudBase 可用性和认证检查通过');
    return true;
  }

  // 检查CloudBase是否可用（同步版本，用于向后兼容）
  private checkAvailability(): boolean {
    const isAvailable = !!app && !!db;
    console.log('CloudBase 可用性检查:', {
      app: !!app,
      db: !!db,
      isAuthenticated,
      envId: import.meta.env.VITE_CLOUDBASE_ENV_ID,
      region: import.meta.env.VITE_CLOUDBASE_REGION,
      isAvailable
    });
    
    if (!isAvailable) {
      console.warn('CloudBase 不可用，详细信息:', {
        app: app ? 'initialized' : 'null/undefined',
        db: db ? 'initialized' : 'null/undefined',
        envIdExists: !!import.meta.env.VITE_CLOUDBASE_ENV_ID,
        envIdValue: import.meta.env.VITE_CLOUDBASE_ENV_ID ? 'configured' : 'not set',
        regionExists: !!import.meta.env.VITE_CLOUDBASE_REGION,
        regionValue: import.meta.env.VITE_CLOUDBASE_REGION || 'not set'
      });
    }
    return isAvailable;
  }

  // 获取数据库实例（带类型断言）
  private getDB(): CloudBaseDB {
    if (!this.checkAvailability()) {
      throw new Error('CloudBase 数据库不可用');
    }
    return db as CloudBaseDB;
  }

  // 创建新游戏会话
  async createGameSession(gameState: GameState, sessionId: string): Promise<void> {
    console.log('CloudBase createGameSession 开始:', {
      sessionId,
      hasGameState: !!gameState,
      basicAvailable: this.checkAvailability()
    });

    // 等待认证完成
    const isReady = await this.checkAvailabilityAndAuth();
    if (!isReady) {
      const error = `CloudBase 服务不可用或认证失败: app=${!!app}, db=${!!db}, auth=${isAuthenticated}, envId=${!!import.meta.env.VITE_CLOUDBASE_ENV_ID}`;
      console.error('CloudBase 不可用:', error);
      throw new Error(error);
    }

    try {
      console.log('CloudBase 开始创建会话:', sessionId);
      
      const sessionData = {
        ...gameState,
        sessionId,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastActiveAt: new Date()
      };
      
      console.log('CloudBase 准备写入数据:', {
        sessionId,
        dataKeys: Object.keys(sessionData),
        dataSize: JSON.stringify(sessionData).length,
        authenticated: isAuthenticated
      });

      await this.getDB().collection(this.gameCollection).doc(sessionId).set(sessionData);
      console.log('CloudBase 会话创建成功:', sessionId);
    } catch (error) {
      console.error('CloudBase 创建会话详细错误:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : 'No stack trace',
        errorType: typeof error,
        errorConstructor: error?.constructor?.name,
        sessionId,
        authenticated: isAuthenticated
      });
      
      if (error instanceof Error) {
        // 提取更多错误信息
        const errorMessage = `CloudBase创建会话失败: ${error.message}`;
        if (error.stack) {
          console.error('错误堆栈:', error.stack);
        }
        throw new Error(errorMessage);
      } else {
        // 处理非Error类型的错误
        const unknownError = JSON.stringify(error) || String(error) || '完全未知的错误类型';
        console.error('非标准错误对象:', unknownError);
        throw new Error(`CloudBase创建会话失败: 非标准错误 - ${unknownError}`);
      }
    }
  }

  // 更新游戏状态
  async updateGameState(sessionId: string, gameState: GameState): Promise<void> {
    // 等待认证完成
    const isReady = await this.checkAvailabilityAndAuth();
    if (!isReady) {
      throw new Error('CloudBase 服务不可用或认证失败');
    }

    try {
      const { activeUsers, ...updateData } = gameState;
      
      await this.getDB().collection(this.gameCollection).doc(sessionId).update({
        ...updateData,
        activeUsers: activeUsers || {},
        updatedAt: new Date(),
        lastActiveAt: new Date()
      });
      console.log('CloudBase 游戏状态更新成功');
    } catch (error) {
      console.error('CloudBase 更新游戏状态失败:', error);
      throw new Error('更新游戏状态失败');
    }
  }

  // 监听游戏状态变化
  subscribeToGameState(sessionId: string, callback: (gameState: GameState | null) => void): () => void {
    if (!this.checkAvailability()) {
      console.warn('CloudBase 不可用，无法监听游戏状态');
      callback(null);
      return () => {};
    }

    console.log('开始监听 CloudBase 游戏状态:', sessionId);
    
    let watcher: CloudBaseWatcher | null = null;
    let mounted = true;

    // 异步等待认证并开始监听
    this.checkAvailabilityAndAuth().then((isReady) => {
      if (!mounted) return; // 如果已经取消订阅，不再继续
      
      if (!isReady) {
        console.warn('CloudBase 认证失败，无法监听游戏状态');
        callback(null);
        return;
      }

      try {
        watcher = this.getDB().collection(this.gameCollection).doc(sessionId).watch({
          onChange: (snapshot: CloudBaseSnapshot) => {
            if (!mounted) return; // 检查是否还在监听
            
            console.log('CloudBase 游戏状态变化:', snapshot);
            if (snapshot.docs && snapshot.docs.length > 0) {
              const data = snapshot.docs[0].data;
              console.log('CloudBase 接收到游戏状态:', data);
              const gameState: GameState = {
                ...data,
                createdAt: data.createdAt || new Date(),
                updatedAt: data.updatedAt || new Date()
              } as GameState;
              callback(gameState);
            } else {
              console.log('CloudBase 游戏状态为空');
              callback(null);
            }
          },
          onError: (error: Error) => {
            if (!mounted) return;
            console.error('CloudBase 监听游戏状态失败:', error);
            callback(null);
          }
        });
      } catch (error) {
        if (!mounted) return;
        console.error('CloudBase 订阅游戏状态失败:', error);
        callback(null);
      }
    }).catch((error) => {
      if (!mounted) return;
      console.error('CloudBase 认证等待失败:', error);
      callback(null);
    });

    // 返回清理函数
    return () => {
      console.log('停止监听 CloudBase 游戏状态');
      mounted = false;
      if (watcher) {
        watcher.close();
      }
    };
  }

  // 添加游戏事件
  async addGameEvent(sessionId: string, event: GameEvent): Promise<void> {
    // 等待认证完成
    const isReady = await this.checkAvailabilityAndAuth();
    if (!isReady) {
      throw new Error('CloudBase 服务不可用或认证失败');
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

    let watcher: CloudBaseWatcher | null = null;
    let mounted = true;

    // 异步等待认证并开始监听
    this.checkAvailabilityAndAuth().then((isReady) => {
      if (!mounted) return; // 如果已经取消订阅，不再继续
      
      if (!isReady) {
        console.warn('CloudBase 认证失败，无法监听游戏事件');
        callback([]);
        return;
      }

      try {
        watcher = this.getDB().collection(this.gameCollection).doc(sessionId)
          .collection(this.eventsCollection)
          .orderBy('timestamp', 'desc')
          .watch({
            onChange: (snapshot: CloudBaseSnapshot) => {
              if (!mounted) return; // 检查是否还在监听
              
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
              if (!mounted) return;
              console.error('CloudBase 监听游戏事件失败:', error);
              callback([]);
            }
          });
      } catch (error) {
        if (!mounted) return;
        console.error('CloudBase 订阅游戏事件失败:', error);
        callback([]);
      }
    }).catch((error) => {
      if (!mounted) return;
      console.error('CloudBase 认证等待失败:', error);
      callback([]);
    });

    // 返回清理函数
    return () => {
      console.log('停止监听 CloudBase 游戏事件');
      mounted = false;
      if (watcher) {
        watcher.close();
      }
    };
  }

  // 检查会话是否存在
  async checkSessionExists(sessionId: string): Promise<boolean> {
    // 等待认证完成
    const isReady = await this.checkAvailabilityAndAuth();
    if (!isReady) {
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
    // 等待认证完成
    const isReady = await this.checkAvailabilityAndAuth();
    if (!isReady) {
      throw new Error('CloudBase 服务不可用或认证失败');
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
    // 等待认证完成
    const isReady = await this.checkAvailabilityAndAuth();
    if (!isReady) {
      throw new Error('CloudBase 服务不可用或认证失败');
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
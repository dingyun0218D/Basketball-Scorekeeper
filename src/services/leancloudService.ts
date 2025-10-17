import { AV } from '../config/leancloud';
import { GameState, GameEvent, CollaborativeService } from '../types';

export class LeanCloudService implements CollaborativeService {
  private gameClassName = 'GameSession';
  private eventClassName = 'GameEvent';
  private subscriptions: Map<string, (() => void)[]> = new Map();
  private initializedClasses = new Set<string>();

  // 服务名称
  getServiceName(): string {
    return 'LeanCloud';
  }

  // 确保类存在
  private async ensureClassExists(className: string): Promise<void> {
    if (this.initializedClasses.has(className)) {
      return;
    }

    try {
      // 尝试查询类是否存在
      const query = new AV.Query(className);
      query.limit(1);
      await query.find();
      this.initializedClasses.add(className);
    } catch (error: unknown) {
      const err = error as { code?: number; message?: string };
      if (err.code === 101 || err.message?.includes("doesn't exists")) {
        // 类不存在，创建一个示例对象来初始化类
        console.log(`正在初始化 LeanCloud 类: ${className}`);
        try {
          const ObjectClass = AV.Object.extend(className);
          const obj = new ObjectClass();
          
          if (className === this.gameClassName) {
            // 初始化GameSession类
            obj.set('sessionId', 'init-temp');
            obj.set('gameState', {});
            obj.set('activeUsers', {});
            obj.set('gameCreatedAt', new Date());
            obj.set('gameUpdatedAt', new Date());
            obj.set('lastActiveAt', new Date());
          } else if (className === this.eventClassName) {
            // 初始化GameEvent类
            obj.set('sessionId', 'init-temp');
            obj.set('eventData', {});
            obj.set('eventTimestamp', new Date());
            obj.set('gameEventType', 'init');
            obj.set('playerId', 'init-temp');
          }
          
          const saved = await obj.save();
          // 立即删除初始化对象
          await saved.destroy();
          this.initializedClasses.add(className);
          console.log(`成功初始化 LeanCloud 类: ${className}`);
        } catch (initError) {
          console.error(`初始化 LeanCloud 类失败: ${className}`, initError);
          throw initError;
        }
      } else {
        throw error;
      }
    }
  }

  // 创建新游戏会话
  async createGameSession(gameState: GameState, sessionId: string): Promise<void> {
    await this.ensureClassExists(this.gameClassName);
    
    const GameSession = AV.Object.extend(this.gameClassName);
    const gameSession = new GameSession();
    
    gameSession.set('sessionId', sessionId);
    gameSession.set('gameState', gameState);
    gameSession.set('activeUsers', gameState.activeUsers || {});
    gameSession.set('gameCreatedAt', new Date());
    gameSession.set('gameUpdatedAt', new Date());
    gameSession.set('lastActiveAt', new Date());
    
    await gameSession.save();
  }

  // 更新游戏状态
  async updateGameState(sessionId: string, gameState: GameState): Promise<void> {
    const query = new AV.Query(this.gameClassName);
    query.equalTo('sessionId', sessionId);
    
    const gameSession = await query.first();
    if (!gameSession) {
      throw new Error('会话不存在');
    }

    // 移除可能存在的特殊字段
    const { activeUsers, ...updateData } = gameState;
    
    gameSession.set('gameState', updateData);
    gameSession.set('activeUsers', activeUsers || {});
    gameSession.set('gameUpdatedAt', new Date());
    gameSession.set('lastActiveAt', new Date());
    
    await gameSession.save();
  }

  // 监听游戏状态变化
  subscribeToGameState(sessionId: string, callback: (gameState: GameState | null) => void): () => void {
    const query = new AV.Query(this.gameClassName);
    query.equalTo('sessionId', sessionId);
    
    let isSubscribed = true;
    
    // 轮询实现实时更新（LeanCloud的LiveQuery需要额外配置）
    // 优化：从2000ms降低到500ms，显著减少延迟
    const pollInterval = setInterval(async () => {
      if (!isSubscribed) return;
      
      try {
        const gameSession = await query.first();
        if (gameSession) {
          const gameState = gameSession.get('gameState') as GameState;
          const activeUsers = gameSession.get('activeUsers') || {};
          const updatedAt = gameSession.get('gameUpdatedAt') || new Date();
          
          const fullState: GameState = {
            ...gameState,
            activeUsers,
            updatedAt: updatedAt instanceof Date ? updatedAt.getTime() : new Date(updatedAt).getTime(),
            sessionId
          };
          
          callback(fullState);
        } else {
          callback(null);
        }
      } catch (error) {
        console.error('LeanCloud 监听游戏状态失败:', error);
        callback(null);
      }
    }, 500); // 优化：每500毫秒轮询一次，提升响应速度

    const unsubscribe = () => {
      isSubscribed = false;
      clearInterval(pollInterval);
    };

    // 记录订阅以便清理
    if (!this.subscriptions.has(sessionId)) {
      this.subscriptions.set(sessionId, []);
    }
    this.subscriptions.get(sessionId)!.push(unsubscribe);

    return unsubscribe;
  }

  // 添加游戏事件
  async addGameEvent(sessionId: string, event: GameEvent): Promise<void> {
    await this.ensureClassExists(this.eventClassName);
    
    const GameEventClass = AV.Object.extend(this.eventClassName);
    const gameEvent = new GameEventClass();
    
    gameEvent.set('sessionId', sessionId);
    gameEvent.set('eventData', event);
    gameEvent.set('eventTimestamp', new Date());
    gameEvent.set('gameEventType', event.type);
    gameEvent.set('playerId', event.playerId);
    
    await gameEvent.save();
  }

  // 监听游戏事件
  subscribeToGameEvents(sessionId: string, callback: (events: GameEvent[]) => void): () => void {
    // 异步初始化类，但不阻塞订阅
    this.ensureClassExists(this.eventClassName).catch(console.error);
    
    const query = new AV.Query(this.eventClassName);
    query.equalTo('sessionId', sessionId);
    query.descending('eventTimestamp');
    
    let isSubscribed = true;
    
    // 轮询实现事件更新
    // 优化：从3000ms降低到800ms，更快捕获事件更新
    const pollInterval = setInterval(async () => {
      if (!isSubscribed) return;
      
      try {
        // 确保类存在后再查询
        await this.ensureClassExists(this.eventClassName);
        const results = await query.find();
        const events: GameEvent[] = results.map(result => {
          const eventData = result.get('eventData') as GameEvent;
          const timestamp = result.get('eventTimestamp') || new Date();
          
          return {
            ...eventData,
            id: result.id || '',
            timestamp: timestamp instanceof Date ? timestamp : new Date(timestamp),
            sessionId
          };
        });
        
        callback(events);
      } catch (error) {
        console.error('LeanCloud 监听游戏事件失败:', error);
        callback([]);
      }
    }, 800); // 优化：每800毫秒轮询一次，减少事件同步延迟

    const unsubscribe = () => {
      isSubscribed = false;
      clearInterval(pollInterval);
    };

    // 记录订阅以便清理
    if (!this.subscriptions.has(sessionId)) {
      this.subscriptions.set(sessionId, []);
    }
    this.subscriptions.get(sessionId)!.push(unsubscribe);

    return unsubscribe;
  }

  // 检查会话是否存在
  async checkSessionExists(sessionId: string): Promise<boolean> {
    try {
      const query = new AV.Query(this.gameClassName);
      query.equalTo('sessionId', sessionId);
      const result = await query.first();
      return !!result;
    } catch (error) {
      console.error('LeanCloud 检查会话失败:', error);
      return false;
    }
  }

  // 删除游戏会话
  async deleteGameSession(sessionId: string): Promise<void> {
    const query = new AV.Query(this.gameClassName);
    query.equalTo('sessionId', sessionId);
    
    const gameSession = await query.first();
    if (gameSession) {
      await gameSession.destroy();
    }

    // 清理相关订阅
    const subscriptions = this.subscriptions.get(sessionId);
    if (subscriptions) {
      subscriptions.forEach(unsubscribe => unsubscribe());
      this.subscriptions.delete(sessionId);
    }
  }

  // 更新用户活动时间
  async updateUserActivity(sessionId: string, userId: string): Promise<void> {
    const query = new AV.Query(this.gameClassName);
    query.equalTo('sessionId', sessionId);
    
    const gameSession = await query.first();
    if (gameSession) {
      const activeUsers = gameSession.get('activeUsers') || {};
      activeUsers[userId] = new Date();
      
      gameSession.set('activeUsers', activeUsers);
      gameSession.set('lastActiveAt', new Date());
      
      await gameSession.save();
    }
  }

  // 生成会话ID
  generateSessionId(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}

export const leancloudService = new LeanCloudService(); 
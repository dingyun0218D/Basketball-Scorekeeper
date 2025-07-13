import { GameEvent } from '../types/events';
import { GameState } from '../types';

/**
 * 事件驱动的协作服务接口
 * 与原有的CollaborativeService不同，这个接口专注于事件的传输和同步
 */
export interface EventDrivenCollaborativeService {
  // 事件相关操作
  publishEvent(sessionId: string, event: GameEvent): Promise<{ sequence: number; timestamp: number }>;
  subscribeToEvents(sessionId: string, callback: (events: GameEvent[]) => void): () => void;
  
  // 序列号管理
  getLastSequence(sessionId: string): Promise<number>;
  getEventsFromSequence(sessionId: string, fromSequence: number): Promise<GameEvent[]>;
  
  // 会话管理
  createEventSession(sessionId: string, initialState: GameState): Promise<void>;
  joinEventSession(sessionId: string, userId: string): Promise<boolean>;
  leaveEventSession(sessionId: string, userId: string): Promise<void>;
  
  // 用户管理
  updateUserActivity(sessionId: string, userId: string): Promise<void>;
  getActiveUsers(sessionId: string): Promise<string[]>;
  
  // 服务信息
  getServiceName(): string;
}

/**
 * 事件驱动协作服务的抽象基类
 * 提供通用的事件处理逻辑
 */
export abstract class BaseEventDrivenService implements EventDrivenCollaborativeService {
  protected serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  // 抽象方法，由具体实现类提供
  abstract publishEvent(sessionId: string, event: GameEvent): Promise<{ sequence: number; timestamp: number }>;
  abstract subscribeToEvents(sessionId: string, callback: (events: GameEvent[]) => void): () => void;
  abstract getLastSequence(sessionId: string): Promise<number>;
  abstract getEventsFromSequence(sessionId: string, fromSequence: number): Promise<GameEvent[]>;
  abstract createEventSession(sessionId: string, initialState: GameState): Promise<void>;
  abstract joinEventSession(sessionId: string, userId: string): Promise<boolean>;
  abstract leaveEventSession(sessionId: string, userId: string): Promise<void>;
  abstract updateUserActivity(sessionId: string, userId: string): Promise<void>;
  abstract getActiveUsers(sessionId: string): Promise<string[]>;

  getServiceName(): string {
    return this.serviceName;
  }

  /**
   * 验证事件格式
   */
  protected validateEvent(event: GameEvent): boolean {
    return !!(
      event.id &&
      event.sessionId &&
      event.authorId &&
      event.type &&
      event.payload &&
      typeof event.clientTimestamp === 'number'
    );
  }
} 
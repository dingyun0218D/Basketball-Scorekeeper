import { 
  GameEvent, 
  GameEventWithState, 
  EventSequence, 
  EventConflict, 
  EventSyncStatus 
} from '../types/events';

/**
 * 事件序列管理器
 * 负责事件的排序、去重、冲突检测和解决
 */
export class EventSequenceManager {
  private eventSequence: EventSequence;
  private eventMap: Map<string, GameEventWithState> = new Map();

  constructor(sessionId: string) {
    this.eventSequence = {
      sessionId,
      events: [],
      lastSequence: 0,
      lastUpdated: Date.now()
    };
  }

  /**
   * 添加新事件到序列
   */
  addEvent(event: GameEvent): void {
    const eventWithState: GameEventWithState = {
      ...event,
      state: {
        status: 'pending',
        appliedAt: undefined,
        undoneAt: undefined
      }
    };

    // 检查是否已存在相同ID的事件
    if (this.eventMap.has(event.id)) {
      console.warn('事件ID重复，跳过添加:', event.id);
      return;
    }

    this.eventMap.set(event.id, eventWithState);
    this.eventSequence.events.push(eventWithState);
    this.eventSequence.lastUpdated = Date.now();
    
    // 重新排序事件
    this.sortEvents();
  }

  /**
   * 批量添加事件
   */
  addEvents(events: GameEvent[]): void {
    events.forEach(event => this.addEvent(event));
  }

  /**
   * 更新事件序列号（由服务器返回）
   */
  updateEventSequence(eventId: string, sequence: number, timestamp: number): void {
    const event = this.eventMap.get(eventId);
    if (event) {
      event.sequence = sequence;
      event.timestamp = timestamp;
      event.state.status = 'applied';
      event.state.appliedAt = timestamp;
      
      this.eventSequence.lastSequence = Math.max(this.eventSequence.lastSequence, sequence);
      this.eventSequence.lastUpdated = Date.now();
      
      // 重新排序
      this.sortEvents();
    }
  }

  /**
   * 标记事件为已撤销
   */
  undoEvent(eventId: string): void {
    const event = this.eventMap.get(eventId);
    if (event) {
      event.state.status = 'undone';
      event.state.undoneAt = Date.now();
      this.eventSequence.lastUpdated = Date.now();
    }
  }

  /**
   * 获取已应用的事件
   */
  getAppliedEvents(): GameEvent[] {
    return this.eventSequence.events
      .filter(event => event.state.status === 'applied')
      .sort((a, b) => a.sequence - b.sequence)
      .map(({ state: _state, ...gameEvent }) => gameEvent as GameEvent);
  }

  /**
   * 获取待处理的事件
   */
  getPendingEvents(): GameEvent[] {
    return this.eventSequence.events
      .filter(event => event.state.status === 'pending')
      .map(({ state: _state, ...gameEvent }) => gameEvent as GameEvent);
  }

  /**
   * 检测事件冲突
   */
  detectConflicts(): EventConflict[] {
    const conflicts: EventConflict[] = [];
    const events = this.eventSequence.events;

    for (let i = 0; i < events.length - 1; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const conflict = this.checkEventConflict(events[i], events[j]);
        if (conflict) {
          conflicts.push(conflict);
        }
      }
    }

    return conflicts;
  }

  /**
   * 检查两个事件是否冲突
   */
  private checkEventConflict(event1: GameEventWithState, event2: GameEventWithState): EventConflict | null {
    // 序列号冲突
    if (event1.sequence === event2.sequence && event1.sequence > 0) {
      return {
        eventId: event2.id,
        conflictType: 'sequence',
        description: `事件序列号冲突: ${event1.id} 和 ${event2.id} 都有序列号 ${event1.sequence}`,
        suggestedResolution: 'retry'
      };
    }

    // 时间戳冲突（同一用户在相同时间的操作）
    if (event1.authorId === event2.authorId && 
        Math.abs(event1.clientTimestamp - event2.clientTimestamp) < 100) {
      return {
        eventId: event2.id,
        conflictType: 'timestamp',
        description: `时间戳冲突: 用户 ${event1.authorId} 在相近时间内的多个操作`,
        suggestedResolution: 'merge'
      };
    }

    // 数据冲突（例如：同时对同一球员进行不同操作）
    if (this.hasDataConflict(event1, event2)) {
      return {
        eventId: event2.id,
        conflictType: 'data',
        description: `数据冲突: 对相同资源的并发操作`,
        suggestedResolution: 'skip'
      };
    }

    return null;
  }

  /**
   * 检查数据冲突
   */
  private hasDataConflict(event1: GameEventWithState, event2: GameEventWithState): boolean {
    // 检查是否有数据冲突（如同一球员同时执行不同操作）
    const getPlayerId = (event: GameEventWithState): string | undefined => {
      const payload = event.payload as Record<string, unknown>;
      return (payload.playerId as string) || (payload.playerInId as string) || (payload.playerOutId as string);
    };

    const getTeamId = (event: GameEventWithState): string | undefined => {
      const payload = event.payload as Record<string, unknown>;
      return payload.teamId as string;
    };

    const event1PlayerId = getPlayerId(event1);
    const event2PlayerId = getPlayerId(event2);

    // 如果两个事件涉及同一个球员且类型不同，可能存在冲突
    if (event1PlayerId && event2PlayerId && event1PlayerId === event2PlayerId) {
      return event1.type !== event2.type;
    }

    // 如果两个事件涉及同一个队伍的得分变化，可能存在冲突
    const event1TeamId = getTeamId(event1);
    const event2TeamId = getTeamId(event2);
    if (event1TeamId && event2TeamId && event1TeamId === event2TeamId) {
      return (event1.type === 'SCORE' && event2.type === 'SCORE') ||
             (event1.type === 'FOUL' && event2.type === 'FOUL');
    }

    return false;
  }

  /**
   * 按序列号和时间戳排序事件
   */
  private sortEvents(): void {
    this.eventSequence.events.sort((a, b) => {
      // 首先按序列号排序（已分配序列号的优先）
      if (a.sequence > 0 && b.sequence > 0) {
        return a.sequence - b.sequence;
      }
      if (a.sequence > 0) return -1;
      if (b.sequence > 0) return 1;
      
      // 然后按服务器时间戳排序
      if (a.timestamp > 0 && b.timestamp > 0) {
        return a.timestamp - b.timestamp;
      }
      if (a.timestamp > 0) return -1;
      if (b.timestamp > 0) return 1;
      
      // 最后按客户端时间戳排序
      return a.clientTimestamp - b.clientTimestamp;
    });
  }

  /**
   * 清理过期事件
   */
  cleanupOldEvents(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoffTime = Date.now() - maxAge;
    
    this.eventSequence.events = this.eventSequence.events.filter(event => {
      const eventTime = event.timestamp > 0 ? event.timestamp : event.clientTimestamp;
      const shouldKeep = eventTime > cutoffTime;
      
      if (!shouldKeep) {
        this.eventMap.delete(event.id);
      }
      
      return shouldKeep;
    });
    
    this.eventSequence.lastUpdated = Date.now();
  }

  /**
   * 获取同步状态
   */
  getSyncStatus(): EventSyncStatus {
    return {
      lastSyncedSequence: this.eventSequence.lastSequence,
      pendingEvents: this.getPendingEvents(),
      conflicts: this.detectConflicts(),
      isOnline: true // 这个值应该由网络状态管理器提供
    };
  }

  /**
   * 重置事件序列
   */
  reset(): void {
    this.eventSequence.events = [];
    this.eventSequence.lastSequence = 0;
    this.eventSequence.lastUpdated = Date.now();
    this.eventMap.clear();
  }

  /**
   * 获取事件统计信息
   */
  getStats(): Record<string, unknown> {
    return {
      totalEvents: this.eventSequence.events.length,
      appliedEvents: this.eventSequence.events.filter(e => e.state.status === 'applied').length,
      pendingEvents: this.eventSequence.events.filter(e => e.state.status === 'pending').length,
      conflicts: this.detectConflicts().length,
      lastSequence: this.eventSequence.lastSequence,
      sessionId: this.eventSequence.sessionId
    };
  }
} 
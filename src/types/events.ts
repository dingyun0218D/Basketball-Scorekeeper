// 事件驱动架构的类型定义

// 基础事件接口
export interface BaseGameEvent {
  id: string;                    // 全局唯一事件ID
  sessionId: string;             // 会话ID
  authorId: string;              // 操作者ID
  sequence: number;              // 事件序列号（服务器分配）
  timestamp: number;             // 服务器时间戳
  clientTimestamp: number;       // 客户端时间戳
  quarter: number;               // 当前节次
  gameTime: string;              // 比赛时间 MM:SS
}

// 得分事件
export interface ScoreEvent extends BaseGameEvent {
  type: 'SCORE';
  payload: {
    teamId: string;
    playerId: string;
    points: 1 | 2 | 3;
    scoreType: 'field_goal' | 'three_pointer' | 'free_throw';
    assistPlayerId?: string;     // 助攻球员ID
  };
}

// 犯规事件
export interface FoulEvent extends BaseGameEvent {
  type: 'FOUL';
  payload: {
    teamId: string;
    playerId: string;
    foulType: 'personal' | 'technical' | 'flagrant' | 'offensive';
    description?: string;
  };
}

// 篮板事件
export interface ReboundEvent extends BaseGameEvent {
  type: 'REBOUND';
  payload: {
    teamId: string;
    playerId: string;
    reboundType: 'offensive' | 'defensive';
  };
}

// 助攻事件
export interface AssistEvent extends BaseGameEvent {
  type: 'ASSIST';
  payload: {
    teamId: string;
    playerId: string;
    assistedPlayerId: string;    // 被助攻的球员ID
  };
}

// 抢断事件
export interface StealEvent extends BaseGameEvent {
  type: 'STEAL';
  payload: {
    teamId: string;
    playerId: string;
    fromTeamId: string;          // 被抢断的队伍ID
    fromPlayerId?: string;       // 被抢断的球员ID
  };
}

// 盖帽事件
export interface BlockEvent extends BaseGameEvent {
  type: 'BLOCK';
  payload: {
    teamId: string;
    playerId: string;
    blockedTeamId: string;       // 被盖帽的队伍ID
    blockedPlayerId?: string;    // 被盖帽的球员ID
  };
}

// 失误事件
export interface TurnoverEvent extends BaseGameEvent {
  type: 'TURNOVER';
  payload: {
    teamId: string;
    playerId: string;
    turnoverType: 'bad_pass' | 'lost_ball' | 'travel' | 'double_dribble' | 'offensive_foul' | 'other';
    description?: string;
  };
}

// 出手不中事件
export interface MissedShotEvent extends BaseGameEvent {
  type: 'MISSED_SHOT';
  payload: {
    teamId: string;
    playerId: string;
    shotType: 'field_goal' | 'three_pointer' | 'free_throw';
  };
}

// 换人事件
export interface SubstitutionEvent extends BaseGameEvent {
  type: 'SUBSTITUTION';
  payload: {
    teamId: string;
    playerInId: string;          // 上场球员ID
    playerOutId: string;         // 下场球员ID
  };
}

// 暂停事件
export interface TimeoutEvent extends BaseGameEvent {
  type: 'TIMEOUT';
  payload: {
    teamId: string;
    timeoutType: 'regular' | 'technical' | 'official';
    duration: number;            // 暂停时长（秒）
  };
}

// 比赛控制事件
export interface GameControlEvent extends BaseGameEvent {
  type: 'GAME_CONTROL';
  payload: {
    action: 'START' | 'PAUSE' | 'RESUME' | 'STOP' | 'NEXT_QUARTER' | 'RESET';
    previousTime?: string;       // 之前的时间（用于暂停/恢复）
  };
}

// 球员管理事件
export interface PlayerManagementEvent extends BaseGameEvent {
  type: 'PLAYER_MANAGEMENT';
  payload: {
    action: 'ADD' | 'REMOVE' | 'UPDATE';
    teamId: string;
    playerId: string;
    playerData?: Partial<{
      name: string;
      number: number;
      position: string;
    }>;
  };
}

// 撤销事件
export interface UndoEvent extends BaseGameEvent {
  type: 'UNDO';
  payload: {
    targetEventId: string;       // 要撤销的事件ID
    reason?: string;             // 撤销原因
  };
}

// 系统事件（用户加入/离开等）
export interface SystemEvent extends BaseGameEvent {
  type: 'SYSTEM';
  payload: {
    action: 'USER_JOINED' | 'USER_LEFT' | 'SESSION_CREATED' | 'SESSION_ENDED';
    userId?: string;
    data?: Record<string, unknown>;
  };
}

// 联合事件类型
export type GameEvent = 
  | ScoreEvent
  | FoulEvent
  | ReboundEvent
  | AssistEvent
  | StealEvent
  | BlockEvent
  | TurnoverEvent
  | MissedShotEvent
  | SubstitutionEvent
  | TimeoutEvent
  | GameControlEvent
  | PlayerManagementEvent
  | UndoEvent
  | SystemEvent;

// 事件状态
export interface EventState {
  status: 'pending' | 'applied' | 'undone' | 'failed';
  appliedAt?: number;
  undoneAt?: number;
  error?: string;
}

// 带状态的事件
export type GameEventWithState = GameEvent & {
  state: EventState;
};

// 事件序列
export interface EventSequence {
  sessionId: string;
  events: GameEventWithState[];
  lastSequence: number;
  lastUpdated: number;
}

// 事件冲突信息
export interface EventConflict {
  eventId: string;
  conflictType: 'sequence' | 'timestamp' | 'data';
  description: string;
  suggestedResolution: 'retry' | 'skip' | 'merge';
}

// 事件同步状态
export interface EventSyncStatus {
  lastSyncedSequence: number;
  pendingEvents: GameEvent[];
  conflicts: EventConflict[];
  isOnline: boolean;
} 
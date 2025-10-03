/**
 * 共享类型定义 - 与前端保持一致
 */

export interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  fouls: number;
  turnovers: number;
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  threePointersMade: number;
  threePointersAttempted: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
  isOnCourt: boolean;
  plusMinus: number;
  timeOnCourt: number;
}

export interface Team {
  id: string;
  name: string;
  score: number;
  fouls: number;
  timeouts: number;
  players: Player[];
  color: string;
}

export interface GameEvent {
  id: string;
  timestamp: Date | number;
  quarter: number;
  time: string;
  type: 'score' | 'foul' | 'timeout' | 'substitution' | 'rebound' | 'assist' | 'steal' | 'block' | 'turnover' | 'undo' | 'other';
  teamId: string;
  playerId?: string;
  description: string;
  points?: number;
  stat?: string;
  value?: number;
  sessionId?: string;
}

export interface GameState {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  quarter: number;
  time: string;
  quarterTime: string;
  isRunning: boolean;
  isPaused: boolean;
  events: GameEvent[];
  createdAt: Date | number;
  updatedAt: Date | number;
  lastScoreSnapshot?: {
    homeScore: number;
    awayScore: number;
    timestamp: number;
  };
  sessionId?: string;
  activeUsers?: { [userId: string]: Date | number };
  lastActiveAt?: Date | number;
}

/**
 * WebSocket消息类型
 */
export enum WSMessageType {
  // 客户端 -> 服务器
  SUBSCRIBE_SESSION = 'subscribe_session',
  UNSUBSCRIBE_SESSION = 'unsubscribe_session',
  SUBSCRIBE_EVENTS = 'subscribe_events',
  UNSUBSCRIBE_EVENTS = 'unsubscribe_events',
  PING = 'ping',
  
  // 服务器 -> 客户端
  GAME_STATE_UPDATE = 'game_state_update',
  GAME_EVENTS_UPDATE = 'game_events_update',
  ERROR = 'error',
  PONG = 'pong',
  CONNECTED = 'connected'
}

export interface WSMessage {
  type: WSMessageType;
  payload?: unknown;
  error?: string;
}

/**
 * Tunnel记录类型
 */
export enum TunnelRecordType {
  PUT = 'PUT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE'
}

export interface TunnelRecord {
  type: TunnelRecordType;
  sessionId: string;
  data?: unknown;
}


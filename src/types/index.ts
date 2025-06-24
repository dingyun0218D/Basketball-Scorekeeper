// 球员数据接口
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
  turnovers: number; // 失误
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  threePointersMade: number;
  threePointersAttempted: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
  isOnCourt: boolean; // 是否在场上
  plusMinus: number; // 正负值
  timeOnCourt: number; // 上场时间（秒）
}

// 队伍数据接口
export interface Team {
  id: string;
  name: string;
  score: number;
  fouls: number;
  timeouts: number;
  players: Player[];
  color: string;
}

// 比赛事件接口
export interface GameEvent {
  id: string;
  timestamp: Date | number; // 支持 Date 和 number 类型
  quarter: number;
  time: string;
  type: 'score' | 'foul' | 'timeout' | 'substitution' | 'rebound' | 'assist' | 'steal' | 'block' | 'turnover' | 'undo' | 'other';
  teamId: string;
  playerId?: string;
  description: string;
  points?: number;
  stat?: string; // 用于记录统计类型（rebounds, assists, steals, blocks, turnovers）
  value?: number; // 用于记录统计变化值
  sessionId?: string; // 会话ID，用于实时协作
}

// 比赛状态接口
export interface GameState {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  quarter: number;
  time: string; // MM:SS格式
  quarterTime: string; // 单节时间设置，默认12:00
  isRunning: boolean;
  isPaused: boolean;
  events: GameEvent[];
  createdAt: Date | number;
  updatedAt: Date | number;
  lastScoreSnapshot?: { // 用于计算正负值的得分快照
    homeScore: number;
    awayScore: number;
    timestamp: number;
  };
  // 实时协作相关字段
  sessionId?: string; // 会话ID
  activeUsers?: { [userId: string]: Date | number }; // 活跃用户及其最后活动时间
  lastActiveAt?: Date | number; // 最后活动时间
}

// 计分按钮类型
export type ScoreType = '1' | '2' | '3' | 'free-throw';

// 游戏控制动作类型
export type GameAction = 
  | 'start'
  | 'pause'
  | 'resume'
  | 'stop'
  | 'next-quarter'
  | 'timeout'
  | 'substitution';

// 统计数据接口
export interface GameStats {
  team: Team;
  fieldGoalPercentage: number;
  threePointPercentage: number;
  freeThrowPercentage: number;
  totalRebounds: number;
  totalAssists: number;
  totalSteals: number;
  totalBlocks: number;
  totalFouls: number;
  averagePoints: number;
}

// 历史比赛记录接口（简化版本）
export interface HistoryGame {
  id: string;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  date: string;
  duration: string;
  quarters: number;
  isCompleted: boolean; // 是否已完成
}

// 完整的历史比赛存档接口
export interface GameArchive {
  id: string;
  gameState: GameState;
  savedAt: number;
  isCompleted: boolean;
  name?: string; // 可选的存档名称
}

// 实时协作相关接口
export interface CollaborativeSession {
  sessionId: string;
  gameState: GameState;
  connectedUsers: Array<{
    userId: string;
    userName: string;
    lastSeen: Date;
    isActive: boolean;
  }>;
  createdAt: Date;
  lastActivity: Date;
}

// 用户信息接口
export interface User {
  id: string;
  name: string;
  isHost?: boolean; // 是否为主机
} 
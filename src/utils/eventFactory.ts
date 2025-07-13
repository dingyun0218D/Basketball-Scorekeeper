import { 
  ScoreEvent, 
  FoulEvent, 
  ReboundEvent, 
  AssistEvent, 
  StealEvent, 
  BlockEvent, 
  TurnoverEvent,
  MissedShotEvent,
  SubstitutionEvent,
  TimeoutEvent,
  GameControlEvent,
  PlayerManagementEvent,
  UndoEvent,
  SystemEvent 
} from '../types/events';
import { generateUniqueId } from './idUtils';

// 事件工厂类
export class EventFactory {
  private sessionId: string;
  private authorId: string;

  constructor(sessionId: string, authorId: string) {
    this.sessionId = sessionId;
    this.authorId = authorId;
  }

  // 创建基础事件属性
  private createBaseEvent(quarter: number, gameTime: string) {
    return {
      id: generateUniqueId(),
      sessionId: this.sessionId,
      authorId: this.authorId,
      sequence: 0, // 将由服务器分配
      timestamp: 0, // 将由服务器分配
      clientTimestamp: Date.now(),
      quarter,
      gameTime
    };
  }

  // 创建得分事件
  createScoreEvent(
    teamId: string,
    playerId: string,
    points: 1 | 2 | 3,
    scoreType: 'field_goal' | 'three_pointer' | 'free_throw',
    quarter: number,
    gameTime: string,
    assistPlayerId?: string
  ): ScoreEvent {
    return {
      ...this.createBaseEvent(quarter, gameTime),
      type: 'SCORE',
      payload: {
        teamId,
        playerId,
        points,
        scoreType,
        assistPlayerId
      }
    };
  }

  // 创建犯规事件
  createFoulEvent(
    teamId: string,
    playerId: string,
    foulType: 'personal' | 'technical' | 'flagrant' | 'offensive',
    quarter: number,
    gameTime: string,
    description?: string
  ): FoulEvent {
    return {
      ...this.createBaseEvent(quarter, gameTime),
      type: 'FOUL',
      payload: {
        teamId,
        playerId,
        foulType,
        description
      }
    };
  }

  // 创建篮板事件
  createReboundEvent(
    teamId: string,
    playerId: string,
    reboundType: 'offensive' | 'defensive',
    quarter: number,
    gameTime: string
  ): ReboundEvent {
    return {
      ...this.createBaseEvent(quarter, gameTime),
      type: 'REBOUND',
      payload: {
        teamId,
        playerId,
        reboundType
      }
    };
  }

  // 创建助攻事件
  createAssistEvent(
    teamId: string,
    playerId: string,
    assistedPlayerId: string,
    quarter: number,
    gameTime: string
  ): AssistEvent {
    return {
      ...this.createBaseEvent(quarter, gameTime),
      type: 'ASSIST',
      payload: {
        teamId,
        playerId,
        assistedPlayerId
      }
    };
  }

  // 创建抢断事件
  createStealEvent(
    teamId: string,
    playerId: string,
    fromTeamId: string,
    quarter: number,
    gameTime: string,
    fromPlayerId?: string
  ): StealEvent {
    return {
      ...this.createBaseEvent(quarter, gameTime),
      type: 'STEAL',
      payload: {
        teamId,
        playerId,
        fromTeamId,
        fromPlayerId
      }
    };
  }

  // 创建盖帽事件
  createBlockEvent(
    teamId: string,
    playerId: string,
    blockedTeamId: string,
    quarter: number,
    gameTime: string,
    blockedPlayerId?: string
  ): BlockEvent {
    return {
      ...this.createBaseEvent(quarter, gameTime),
      type: 'BLOCK',
      payload: {
        teamId,
        playerId,
        blockedTeamId,
        blockedPlayerId
      }
    };
  }

  // 创建失误事件
  createTurnoverEvent(
    teamId: string,
    playerId: string,
    turnoverType: 'bad_pass' | 'lost_ball' | 'travel' | 'double_dribble' | 'offensive_foul' | 'other',
    quarter: number,
    gameTime: string,
    description?: string
  ): TurnoverEvent {
    return {
      ...this.createBaseEvent(quarter, gameTime),
      type: 'TURNOVER',
      payload: {
        teamId,
        playerId,
        turnoverType,
        description
      }
    };
  }

  // 创建出手不中事件
  createMissedShotEvent(
    teamId: string,
    playerId: string,
    shotType: 'field_goal' | 'three_pointer' | 'free_throw',
    quarter: number,
    gameTime: string
  ): MissedShotEvent {
    return {
      ...this.createBaseEvent(quarter, gameTime),
      type: 'MISSED_SHOT',
      payload: {
        teamId,
        playerId,
        shotType
      }
    };
  }

  // 创建换人事件
  createSubstitutionEvent(
    teamId: string,
    playerInId: string,
    playerOutId: string,
    quarter: number,
    gameTime: string
  ): SubstitutionEvent {
    return {
      ...this.createBaseEvent(quarter, gameTime),
      type: 'SUBSTITUTION',
      payload: {
        teamId,
        playerInId,
        playerOutId
      }
    };
  }

  // 创建暂停事件
  createTimeoutEvent(
    teamId: string,
    timeoutType: 'regular' | 'technical' | 'official',
    duration: number,
    quarter: number,
    gameTime: string
  ): TimeoutEvent {
    return {
      ...this.createBaseEvent(quarter, gameTime),
      type: 'TIMEOUT',
      payload: {
        teamId,
        timeoutType,
        duration
      }
    };
  }

  // 创建比赛控制事件
  createGameControlEvent(
    action: 'START' | 'PAUSE' | 'RESUME' | 'STOP' | 'NEXT_QUARTER' | 'RESET',
    quarter: number,
    gameTime: string,
    previousTime?: string
  ): GameControlEvent {
    return {
      ...this.createBaseEvent(quarter, gameTime),
      type: 'GAME_CONTROL',
      payload: {
        action,
        previousTime
      }
    };
  }

  // 创建球员管理事件
  createPlayerManagementEvent(
    action: 'ADD' | 'REMOVE' | 'UPDATE',
    teamId: string,
    playerId: string,
    quarter: number,
    gameTime: string,
    playerData?: Partial<{
      name: string;
      number: number;
      position: string;
    }>
  ): PlayerManagementEvent {
    return {
      ...this.createBaseEvent(quarter, gameTime),
      type: 'PLAYER_MANAGEMENT',
      payload: {
        action,
        teamId,
        playerId,
        playerData
      }
    };
  }

  // 创建撤销事件
  createUndoEvent(
    targetEventId: string,
    quarter: number,
    gameTime: string,
    reason?: string
  ): UndoEvent {
    return {
      ...this.createBaseEvent(quarter, gameTime),
      type: 'UNDO',
      payload: {
        targetEventId,
        reason
      }
    };
  }

  // 创建系统事件
  createSystemEvent(
    action: 'USER_JOINED' | 'USER_LEFT' | 'SESSION_CREATED' | 'SESSION_ENDED',
    quarter: number,
    gameTime: string,
    userId?: string,
    data?: Record<string, unknown>
  ): SystemEvent {
    return {
      ...this.createBaseEvent(quarter, gameTime),
      type: 'SYSTEM',
      payload: {
        action,
        userId,
        data
      }
    };
  }
}

// 创建事件工厂实例的便捷函数
export const createEventFactory = (sessionId: string, authorId: string): EventFactory => {
  return new EventFactory(sessionId, authorId);
}; 
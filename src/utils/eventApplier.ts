import { GameState, Team, Player } from '../types';
import { GameEvent, GameControlEvent } from '../types/events';

/**
 * 事件应用器 - 将事件应用到游戏状态
 * 这是事件驱动架构的核心，所有状态变化都通过事件来驱动
 */
export class EventApplier {
  
  /**
   * 应用单个事件到游戏状态
   */
  static applyEvent(gameState: GameState, event: GameEvent): GameState {
    // 创建新的状态副本，确保不可变性
    const newState = { ...gameState };
    
    switch (event.type) {
      case 'SCORE':
        return this.applyScoreEvent(newState, event);
      
      case 'FOUL':
        return this.applyFoulEvent(newState, event);
      
      case 'REBOUND':
        return this.applyReboundEvent(newState, event);
      
      case 'ASSIST':
        return this.applyAssistEvent(newState, event);
      
      case 'STEAL':
        return this.applyStealEvent(newState, event);
      
      case 'BLOCK':
        return this.applyBlockEvent(newState, event);
      
      case 'TURNOVER':
        return this.applyTurnoverEvent(newState, event);
      
      case 'MISSED_SHOT':
        return this.applyMissedShotEvent(newState, event);
      
      case 'SUBSTITUTION':
        return this.applySubstitutionEvent(newState, event);
      
      case 'TIMEOUT':
        return this.applyTimeoutEvent(newState, event);
      
      case 'GAME_CONTROL':
        return this.applyGameControlEvent(newState, event);
      
      case 'PLAYER_MANAGEMENT':
        return this.applyPlayerManagementEvent(newState, event);
      
      case 'UNDO':
        // 撤销事件需要特殊处理，在事件序列级别处理
        return newState;
      
      case 'SYSTEM':
        return this.applySystemEvent(newState, event);
      
      default:
        console.warn('未知事件类型:', (event as { type: string }).type);
        return newState;
    }
  }

  /**
   * 应用事件序列到游戏状态
   */
  static applyEventSequence(initialState: GameState, events: GameEvent[]): GameState {
    let currentState = initialState;
    
    for (const event of events) {
      currentState = this.applyEvent(currentState, event);
    }
    
    return currentState;
  }

  /**
   * 应用得分事件
   */
  private static applyScoreEvent(gameState: GameState, event: GameEvent): GameState {
    if (event.type !== 'SCORE') return gameState;

    const { teamId, playerId, points, scoreType } = event.payload;
    
    // 更新队伍得分
    const newState = this.updateTeamScore(gameState, teamId, points);
    
    // 更新球员统计
    return this.updatePlayerStats(newState, teamId, playerId, (player) => ({
      ...player,
      points: player.points + points,
      fieldGoalsMade: scoreType === 'field_goal' || scoreType === 'three_pointer' 
        ? player.fieldGoalsMade + 1 : player.fieldGoalsMade,
      threePointersMade: scoreType === 'three_pointer' 
        ? player.threePointersMade + 1 : player.threePointersMade,
      freeThrowsMade: scoreType === 'free_throw' 
        ? player.freeThrowsMade + 1 : player.freeThrowsMade
    }));
  }

  /**
   * 应用犯规事件
   */
  private static applyFoulEvent(gameState: GameState, event: GameEvent): GameState {
    if (event.type !== 'FOUL') return gameState;

    const { teamId, playerId } = event.payload;
    
    // 更新队伍犯规数
    const newState = this.updateTeamFouls(gameState, teamId, 1);
    
    // 更新球员犯规数
    return this.updatePlayerStats(newState, teamId, playerId, (player) => ({
      ...player,
      fouls: player.fouls + 1
    }));
  }

  /**
   * 应用篮板事件
   */
  private static applyReboundEvent(gameState: GameState, event: GameEvent): GameState {
    if (event.type !== 'REBOUND') return gameState;

    const { teamId, playerId } = event.payload;
    
    return this.updatePlayerStats(gameState, teamId, playerId, (player) => ({
      ...player,
      rebounds: player.rebounds + 1
    }));
  }

  /**
   * 应用助攻事件
   */
  private static applyAssistEvent(gameState: GameState, event: GameEvent): GameState {
    if (event.type !== 'ASSIST') return gameState;

    const { teamId, playerId } = event.payload;
    
    return this.updatePlayerStats(gameState, teamId, playerId, (player) => ({
      ...player,
      assists: player.assists + 1
    }));
  }

  /**
   * 应用抢断事件
   */
  private static applyStealEvent(gameState: GameState, event: GameEvent): GameState {
    if (event.type !== 'STEAL') return gameState;

    const { teamId, playerId } = event.payload;
    
    return this.updatePlayerStats(gameState, teamId, playerId, (player) => ({
      ...player,
      steals: player.steals + 1
    }));
  }

  /**
   * 应用盖帽事件
   */
  private static applyBlockEvent(gameState: GameState, event: GameEvent): GameState {
    if (event.type !== 'BLOCK') return gameState;

    const { teamId, playerId } = event.payload;
    
    return this.updatePlayerStats(gameState, teamId, playerId, (player) => ({
      ...player,
      blocks: player.blocks + 1
    }));
  }

  /**
   * 应用失误事件
   */
  private static applyTurnoverEvent(gameState: GameState, event: GameEvent): GameState {
    if (event.type !== 'TURNOVER') return gameState;

    const { teamId, playerId } = event.payload;
    
    return this.updatePlayerStats(gameState, teamId, playerId, (player) => ({
      ...player,
      turnovers: player.turnovers + 1
    }));
  }

  /**
   * 应用出手不中事件
   */
  private static applyMissedShotEvent(gameState: GameState, event: GameEvent): GameState {
    if (event.type !== 'MISSED_SHOT') return gameState;

    const { teamId, playerId, shotType } = event.payload;
    
    return this.updatePlayerStats(gameState, teamId, playerId, (player) => ({
      ...player,
      fieldGoalsAttempted: shotType === 'field_goal' || shotType === 'three_pointer'
        ? player.fieldGoalsAttempted + 1 : player.fieldGoalsAttempted,
      threePointersAttempted: shotType === 'three_pointer'
        ? player.threePointersAttempted + 1 : player.threePointersAttempted,
      freeThrowsAttempted: shotType === 'free_throw'
        ? player.freeThrowsAttempted + 1 : player.freeThrowsAttempted
    }));
  }

  /**
   * 应用换人事件
   */
  private static applySubstitutionEvent(gameState: GameState, event: GameEvent): GameState {
    if (event.type !== 'SUBSTITUTION') return gameState;

    const { teamId, playerInId, playerOutId } = event.payload;
    
    // 更新球员上场状态
    let newState = this.updatePlayerStats(gameState, teamId, playerInId, (player) => ({
      ...player,
      isOnCourt: true
    }));
    
    newState = this.updatePlayerStats(newState, teamId, playerOutId, (player) => ({
      ...player,
      isOnCourt: false
    }));
    
    return newState;
  }

  /**
   * 应用暂停事件
   */
  private static applyTimeoutEvent(gameState: GameState, event: GameEvent): GameState {
    if (event.type !== 'TIMEOUT') return gameState;

    const { teamId } = event.payload;
    
    return this.updateTeamTimeouts(gameState, teamId, -1);
  }

  /**
   * 应用比赛控制事件
   */
  private static applyGameControlEvent(gameState: GameState, event: GameEvent): GameState {
    const controlEvent = event as GameControlEvent;
    const { action } = controlEvent.payload;
    
    switch (action) {
      case 'START':
        return {
          ...gameState,
          isRunning: true,
          isPaused: false
        };
      
      case 'PAUSE':
        return {
          ...gameState,
          isRunning: false,
          isPaused: true
        };
      
      case 'RESUME':
        return {
          ...gameState,
          isRunning: true,
          isPaused: false
        };
      
      case 'STOP':
        return {
          ...gameState,
          isRunning: false,
          isPaused: false
        };
      
      case 'NEXT_QUARTER':
        return {
          ...gameState,
          quarter: gameState.quarter + 1,
          time: gameState.quarterTime || '15:00'
        };
      
      case 'RESET':
        return {
          ...gameState,
          homeTeam: { ...gameState.homeTeam, score: 0, fouls: 0 },
          awayTeam: { ...gameState.awayTeam, score: 0, fouls: 0 },
          quarter: 1,
          time: gameState.quarterTime || '15:00',
          isRunning: false,
          isPaused: false,
          events: []
        };
      
      default:
        return gameState;
    }
  }

  /**
   * 应用球员管理事件
   */
  private static applyPlayerManagementEvent(gameState: GameState, event: GameEvent): GameState {
    if (event.type !== 'PLAYER_MANAGEMENT') return gameState;

    const { action, teamId, playerId, playerData } = event.payload;
    
    switch (action) {
      case 'ADD':
        return this.addPlayerToTeam(gameState, teamId, playerId, playerData);
      
      case 'REMOVE':
        return this.removePlayerFromTeam(gameState, teamId, playerId);
      
      case 'UPDATE':
        return this.updatePlayerData(gameState, teamId, playerId, playerData);
      
      default:
        return gameState;
    }
  }

  /**
   * 应用系统事件
   */
  private static applySystemEvent(gameState: GameState, event: GameEvent): GameState {
    if (event.type !== 'SYSTEM') return gameState;

    // 系统事件通常不直接影响游戏状态，主要用于日志和通知
    return gameState;
  }

  // 辅助方法

  private static updateTeamScore(gameState: GameState, teamId: string, points: number): GameState {
    if (gameState.homeTeam.id === teamId) {
      return {
        ...gameState,
        homeTeam: {
          ...gameState.homeTeam,
          score: gameState.homeTeam.score + points
        }
      };
    } else if (gameState.awayTeam.id === teamId) {
      return {
        ...gameState,
        awayTeam: {
          ...gameState.awayTeam,
          score: gameState.awayTeam.score + points
        }
      };
    }
    return gameState;
  }

  private static updateTeamFouls(gameState: GameState, teamId: string, fouls: number): GameState {
    if (gameState.homeTeam.id === teamId) {
      return {
        ...gameState,
        homeTeam: {
          ...gameState.homeTeam,
          fouls: gameState.homeTeam.fouls + fouls
        }
      };
    } else if (gameState.awayTeam.id === teamId) {
      return {
        ...gameState,
        awayTeam: {
          ...gameState.awayTeam,
          fouls: gameState.awayTeam.fouls + fouls
        }
      };
    }
    return gameState;
  }

  private static updateTeamTimeouts(gameState: GameState, teamId: string, timeouts: number): GameState {
    if (gameState.homeTeam.id === teamId) {
      return {
        ...gameState,
        homeTeam: {
          ...gameState.homeTeam,
          timeouts: Math.max(0, gameState.homeTeam.timeouts + timeouts)
        }
      };
    } else if (gameState.awayTeam.id === teamId) {
      return {
        ...gameState,
        awayTeam: {
          ...gameState.awayTeam,
          timeouts: Math.max(0, gameState.awayTeam.timeouts + timeouts)
        }
      };
    }
    return gameState;
  }

  private static updatePlayerStats(
    gameState: GameState, 
    teamId: string, 
    playerId: string, 
    updater: (player: Player) => Player
  ): GameState {
    const updateTeam = (team: Team): Team => {
      return {
        ...team,
        players: team.players.map(player =>
          player.id === playerId ? updater(player) : player
        )
      };
    };

    if (gameState.homeTeam.id === teamId) {
      return {
        ...gameState,
        homeTeam: updateTeam(gameState.homeTeam)
      };
    } else if (gameState.awayTeam.id === teamId) {
      return {
        ...gameState,
        awayTeam: updateTeam(gameState.awayTeam)
      };
    }
    
    return gameState;
  }

  private static addPlayerToTeam(
    gameState: GameState, 
    _teamId: string, 
    _playerId: string, 
    _playerData?: Record<string, unknown>
  ): GameState {
    // Implementation for adding player to team
    return gameState;
  }

  private static removePlayerFromTeam(
    gameState: GameState, 
    teamId: string, 
    playerId: string
  ): GameState {
    const updateTeam = (team: Team): Team => {
      return {
        ...team,
        players: team.players.filter(player => player.id !== playerId)
      };
    };

    if (gameState.homeTeam.id === teamId) {
      return {
        ...gameState,
        homeTeam: updateTeam(gameState.homeTeam)
      };
    } else if (gameState.awayTeam.id === teamId) {
      return {
        ...gameState,
        awayTeam: updateTeam(gameState.awayTeam)
      };
    }
    
    return gameState;
  }

  private static updatePlayerData(
    gameState: GameState, 
    _teamId: string, 
    _playerId: string, 
    _playerData?: Record<string, unknown>
  ): GameState {
    // Implementation for updating player data
    return gameState;
  }
} 
import React, { createContext } from 'react';
import { GameState, Team, Player, GameEvent, ScoreType } from '../types';
import { generateId, createDefaultTeam } from '../utils/gameUtils';
import { clearCurrentGame } from '../utils/storage';
import { createStatEvent, createUndoEvent } from '../utils/statisticsEventUtils';
import { createScoreEvent, updatePlayerScoreStats, updatePlayersPlusMinus } from '../utils/scoreEventUtils';
import { createFoulEvent, updateTeamFouls, updatePlayerFouls } from '../utils/foulEventUtils';
import { createTimeoutEvent, updateTeamTimeouts, hasTimeoutsRemaining } from '../utils/timeoutEventUtils';
import { createSubstitutionEvent, togglePlayerCourtStatus, canPlayerEnterCourt } from '../utils/substitutionEventUtils';
import { createQuarterEndEvent } from '../utils/quarterEventUtils';
import { createShotAttemptEvent, updateTeamPlayerShotStats } from '../utils/shotEventUtils';
import { canUndoScore, undoPlayerScoreStats } from '../utils/undoEventUtils';
import { addPlayerToTeam, removePlayerFromTeam } from '../utils/playerManagementUtils';
import { batchSyncPlayerInfo } from '../utils/playerSyncUtils';

// Action types
type GameAction =
  | { type: 'LOAD_GAME'; payload: GameState }
  | { type: 'LOAD_ARCHIVE'; payload: GameState }
  | { type: 'SYNC_COLLABORATIVE_STATE'; payload: GameState }
  | { type: 'START_NEW_GAME'; payload: { homeTeam: Team; awayTeam: Team } }
  | { type: 'UPDATE_SCORE'; payload: { teamId: string; points: number; playerId?: string; scoreType: ScoreType } }
  | { type: 'UNDO_SCORE'; payload: { teamId: string; playerId: string; scoreType: ScoreType } }
  | { type: 'UPDATE_PLAYER_STAT'; payload: { teamId: string; playerId: string; stat: string; value: number } }
  | { type: 'ADD_SHOT_ATTEMPT'; payload: { teamId: string; playerId: string; shotType: 'field' | 'three' | 'free' } }
  | { type: 'ADD_FOUL'; payload: { teamId: string; playerId?: string } }
  | { type: 'USE_TIMEOUT'; payload: { teamId: string } }
  | { type: 'TOGGLE_PLAYER_COURT_STATUS'; payload: { teamId: string; playerId: string } }
  | { type: 'SET_QUARTER_TIME'; payload: { time: string } }
  | { type: 'START_TIMER' }
  | { type: 'PAUSE_TIMER' }
  | { type: 'RESUME_TIMER' }
  | { type: 'STOP_TIMER' }
  | { type: 'UPDATE_TIME'; payload: { time: string } }
  | { type: 'NEXT_QUARTER' }
  | { type: 'ADD_EVENT'; payload: GameEvent }
  | { type: 'UPDATE_TEAM'; payload: { teamId: string; updates: Partial<Team> } }
  | { type: 'ADD_PLAYER'; payload: { teamId: string; player: Player } }
  | { type: 'REMOVE_PLAYER'; payload: { teamId: string; playerId: string } }
  | { type: 'SYNC_PLAYER_INFO'; payload: { originalPlayer: Player; updatedPlayer: Player } }
  | { type: 'RESET_GAME' };

// Initial state
export const initialGameState: GameState = {
  id: generateId(),
  homeTeam: createDefaultTeam('主队', '#1E40AF'),
  awayTeam: createDefaultTeam('客队', '#DC2626'),
  quarter: 1,
  time: '12:00',
  quarterTime: '12:00', // 默认单节12分钟
  isRunning: false,
  isPaused: false,
  events: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

// Game reducer
export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'LOAD_GAME': {
      // 验证加载的数据格式
      const loadedState = action.payload;
      
      // 确保关键字段存在且格式正确
      const validatedState = {
        ...loadedState,
        time: loadedState.time || '12:00',
        quarterTime: loadedState.quarterTime || '12:00',
        quarter: loadedState.quarter || 1,
        homeTeam: loadedState.homeTeam || createDefaultTeam('主队', '#1E40AF'),
        awayTeam: loadedState.awayTeam || createDefaultTeam('客队', '#DC2626'),
        events: loadedState.events || [],
        isRunning: loadedState.isRunning || false,
        isPaused: loadedState.isPaused || false,
      };
      
      console.log('GameContext: 加载验证后的游戏状态', validatedState);
      return validatedState;
    }

    case 'LOAD_ARCHIVE':
      return {
        ...action.payload,
        updatedAt: Date.now(), // 更新时间戳以触发自动保存
      };

    case 'SYNC_COLLABORATIVE_STATE': {
      // 同步协作状态，使用改进的时间戳比较逻辑
      return {
        ...action.payload,
        // 保持会话相关信息
        sessionId: action.payload.sessionId || state.sessionId,
        activeUsers: action.payload.activeUsers || state.activeUsers,
      };
    }

    case 'START_NEW_GAME':
      return {
        ...initialGameState,
        id: generateId(),
        homeTeam: action.payload.homeTeam,
        awayTeam: action.payload.awayTeam,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

    case 'UPDATE_SCORE': {
      const { teamId, points, playerId, scoreType } = action.payload;
      const isHomeTeam = teamId === state.homeTeam.id;
      const team = isHomeTeam ? state.homeTeam : state.awayTeam;
      const oppositeTeam = isHomeTeam ? state.awayTeam : state.homeTeam;
      
      // 更新队伍得分
      // eslint-disable-next-line prefer-const
      let updatedTeam = { ...team, score: Math.max(0, team.score + points) };
      // eslint-disable-next-line prefer-const
      let updatedOppositeTeam = { ...oppositeTeam };
      
      // 更新在场球员的正负值
      if (points !== 0) {
        updatedTeam.players = updatePlayersPlusMinus(updatedTeam.players, points, true);
        updatedOppositeTeam.players = updatePlayersPlusMinus(updatedOppositeTeam.players, points, false);
      }
      
      // 更新球员数据
      if (playerId) {
        updatedTeam.players = updatedTeam.players.map(player => {
          if (player.id === playerId) {
            return updatePlayerScoreStats(player, points, scoreType);
          }
          return player;
        });
      }

      const event = createScoreEvent(teamId, playerId, team, points, state.quarter, state.time);

      return {
        ...state,
        homeTeam: isHomeTeam ? updatedTeam : updatedOppositeTeam,
        awayTeam: isHomeTeam ? updatedOppositeTeam : updatedTeam,
        events: [event, ...state.events],
        updatedAt: Date.now(),
      };
    }

    case 'UNDO_SCORE': {
      const { teamId, playerId, scoreType } = action.payload;
      const isHomeTeam = teamId === state.homeTeam.id;
      const team = isHomeTeam ? state.homeTeam : state.awayTeam;
      const oppositeTeam = isHomeTeam ? state.awayTeam : state.homeTeam;
      
      const player = team.players.find(p => p.id === playerId);
      if (!player) return state;
      
      const points = parseInt(scoreType);
      
      // 检查是否可以撤销
      if (!canUndoScore(player, points, scoreType)) return state;
      
      // 更新队伍得分
      // eslint-disable-next-line prefer-const
      let updatedTeam = { ...team, score: Math.max(0, team.score - points) };
      // eslint-disable-next-line prefer-const
      let updatedOppositeTeam = { ...oppositeTeam };
      
      // 撤销在场球员的正负值
      updatedTeam.players = updatePlayersPlusMinus(updatedTeam.players, -points, true);
      updatedOppositeTeam.players = updatePlayersPlusMinus(updatedOppositeTeam.players, -points, false);
      
      // 撤销球员统计
      updatedTeam.players = updatedTeam.players.map(p => {
        if (p.id === playerId) {
          return undoPlayerScoreStats(p, points, scoreType);
        }
        return p;
      });

      const event = createUndoEvent(teamId, playerId, player, points, state.quarter, state.time);

      return {
        ...state,
        homeTeam: isHomeTeam ? updatedTeam : updatedOppositeTeam,
        awayTeam: isHomeTeam ? updatedOppositeTeam : updatedTeam,
        events: [event, ...state.events],
        updatedAt: Date.now(),
      };
    }

    case 'UPDATE_PLAYER_STAT': {
      const { teamId, playerId, stat, value } = action.payload;
      const isHomeTeam = teamId === state.homeTeam.id;
      const team = isHomeTeam ? state.homeTeam : state.awayTeam;
      
      const updatedTeam = {
        ...team,
        players: team.players.map(player =>
          player.id === playerId
            ? { ...player, [stat]: Math.max(0, player[stat as keyof Player] as number + value) }
            : player
        ),
      };

      // 为特定统计类型创建事件记录
      const player = team.players.find(p => p.id === playerId);
      const event = player ? createStatEvent(teamId, playerId, player, stat, value, state.quarter, state.time) : null;

      return {
        ...state,
        homeTeam: isHomeTeam ? updatedTeam : state.homeTeam,
        awayTeam: isHomeTeam ? state.awayTeam : updatedTeam,
        events: event ? [event, ...state.events] : state.events,
        updatedAt: Date.now(),
      };
    }

    case 'ADD_SHOT_ATTEMPT': {
      const { teamId, playerId, shotType } = action.payload;
      const isHomeTeam = teamId === state.homeTeam.id;
      const team = isHomeTeam ? state.homeTeam : state.awayTeam;
      
      const updatedTeam = updateTeamPlayerShotStats(team, playerId, shotType);
      const event = createShotAttemptEvent(teamId, playerId, team, shotType, state.quarter, state.time);

      return {
        ...state,
        homeTeam: isHomeTeam ? updatedTeam : state.homeTeam,
        awayTeam: isHomeTeam ? state.awayTeam : updatedTeam,
        events: [event, ...state.events],
        updatedAt: Date.now(),
      };
    }

    case 'ADD_FOUL': {
      const { teamId, playerId } = action.payload;
      const isHomeTeam = teamId === state.homeTeam.id;
      const team = isHomeTeam ? state.homeTeam : state.awayTeam;
      
      // 更新队伍犯规数
      let updatedTeam = updateTeamFouls(team);
      
      // 如果指定了球员，更新球员犯规数
      if (playerId) {
        updatedTeam = updatePlayerFouls(updatedTeam, playerId);
      }

      const event = createFoulEvent(teamId, playerId, team, state.quarter, state.time);

      return {
        ...state,
        homeTeam: isHomeTeam ? updatedTeam : state.homeTeam,
        awayTeam: isHomeTeam ? state.awayTeam : updatedTeam,
        events: [event, ...state.events],
        updatedAt: Date.now(),
      };
    }

    case 'USE_TIMEOUT': {
      const { teamId } = action.payload;
      const isHomeTeam = teamId === state.homeTeam.id;
      const team = isHomeTeam ? state.homeTeam : state.awayTeam;
      
      // 检查是否还有暂停次数
      if (!hasTimeoutsRemaining(team)) return state;
      
      const updatedTeam = updateTeamTimeouts(team);
      const event = createTimeoutEvent(teamId, team, state.quarter, state.time);

      return {
        ...state,
        homeTeam: isHomeTeam ? updatedTeam : state.homeTeam,
        awayTeam: isHomeTeam ? state.awayTeam : updatedTeam,
        events: [event, ...state.events],
        isPaused: true,
        updatedAt: Date.now(),
      };
    }

    case 'TOGGLE_PLAYER_COURT_STATUS': {
      const { teamId, playerId } = action.payload;
      const isHomeTeam = teamId === state.homeTeam.id;
      const team = isHomeTeam ? state.homeTeam : state.awayTeam;
      
      const player = team.players.find(p => p.id === playerId);
      if (!player) return state;
      
      // 检查是否可以上场
      if (!canPlayerEnterCourt(team, playerId)) {
        return state; // 不允许超过5人在场
      }
      
      const updatedTeam = togglePlayerCourtStatus(team, playerId);
      const event = createSubstitutionEvent(teamId, playerId, player, state.quarter, state.time);

      return {
        ...state,
        homeTeam: isHomeTeam ? updatedTeam : state.homeTeam,
        awayTeam: isHomeTeam ? state.awayTeam : updatedTeam,
        events: [event, ...state.events],
        updatedAt: Date.now(),
      };
    }

    case 'SET_QUARTER_TIME':
      return { 
        ...state, 
        quarterTime: action.payload.time,
        time: action.payload.time, // 同时更新当前时间
        updatedAt: Date.now() 
      };

    case 'START_TIMER':
      return { ...state, isRunning: true, isPaused: false };

    case 'PAUSE_TIMER':
      return { ...state, isRunning: false, isPaused: true };

    case 'RESUME_TIMER':
      return { ...state, isRunning: true, isPaused: false };

    case 'STOP_TIMER':
      return { 
        ...state, 
        isRunning: false, 
        isPaused: false,
        time: state.quarterTime, // 重置时间到设置的每节时长
        updatedAt: Date.now()
      };

    case 'UPDATE_TIME':
      return { ...state, time: action.payload.time, updatedAt: Date.now() };

    case 'NEXT_QUARTER': {
      const event = createQuarterEndEvent(state.quarter, state.time);

      return {
        ...state,
        quarter: state.quarter + 1,
        time: state.quarterTime, // 使用设置的单节时间
        isRunning: false,
        isPaused: false,
        events: [event, ...state.events],
        updatedAt: Date.now(),
      };
    }

    case 'ADD_EVENT':
      return {
        ...state,
        events: [action.payload, ...state.events],
        updatedAt: Date.now(),
      };

    case 'UPDATE_TEAM': {
      const { teamId, updates } = action.payload;
      const isHomeTeam = teamId === state.homeTeam.id;
      
      return {
        ...state,
        homeTeam: isHomeTeam ? { ...state.homeTeam, ...updates } : state.homeTeam,
        awayTeam: isHomeTeam ? state.awayTeam : { ...state.awayTeam, ...updates },
        updatedAt: Date.now(),
      };
    }

    case 'ADD_PLAYER': {
      const { teamId, player } = action.payload;
      const isHomeTeam = teamId === state.homeTeam.id;
      const team = isHomeTeam ? state.homeTeam : state.awayTeam;
      
      const updatedTeam = addPlayerToTeam(team, player);

      return {
        ...state,
        homeTeam: isHomeTeam ? updatedTeam : state.homeTeam,
        awayTeam: isHomeTeam ? state.awayTeam : updatedTeam,
        updatedAt: Date.now(),
      };
    }

    case 'REMOVE_PLAYER': {
      const { teamId, playerId } = action.payload;
      const isHomeTeam = teamId === state.homeTeam.id;
      const team = isHomeTeam ? state.homeTeam : state.awayTeam;
      
      const updatedTeam = removePlayerFromTeam(team, playerId);

      return {
        ...state,
        homeTeam: isHomeTeam ? updatedTeam : state.homeTeam,
        awayTeam: isHomeTeam ? state.awayTeam : updatedTeam,
        updatedAt: Date.now(),
      };
    }

    case 'SYNC_PLAYER_INFO': {
      const { originalPlayer, updatedPlayer } = action.payload;
      
      // 批量同步两个队伍中的球员信息
      const teams = [state.homeTeam, state.awayTeam];
      const syncResult = batchSyncPlayerInfo(teams, originalPlayer, updatedPlayer);
      
      // 如果有球员因为号码冲突被移除，在控制台记录信息
      if (syncResult.allRemovedPlayers.length > 0) {
        console.warn('球员同步过程中发现号码冲突，以下球员已被移除：', syncResult.allRemovedPlayers);
      }
      
      // 如果有球员被同步，在控制台记录信息
      if (syncResult.totalSyncedCount > 0) {
        console.log(`球员信息同步完成，共更新了 ${syncResult.totalSyncedCount} 个球员实例`);
      }

      return {
        ...state,
        homeTeam: syncResult.updatedTeams[0] || state.homeTeam,
        awayTeam: syncResult.updatedTeams[1] || state.awayTeam,
        updatedAt: Date.now(),
      };
    }

    case 'RESET_GAME':
      clearCurrentGame();
      return {
        ...initialGameState,
        id: generateId(),
        quarterTime: state.quarterTime, // 保持时间设置
        time: state.quarterTime, // 重置为设置的时间
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

    default:
      return state;
  }
};

// Context
interface GameContextType {
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider is now in separate file to fix React Fast Refresh warning

// Hook is now in separate file to fix React Fast Refresh warning 
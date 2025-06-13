import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { GameState, Team, Player, GameEvent, ScoreType } from '../types';
import { generateId, createDefaultTeam } from '../utils/gameUtils';
import { saveCurrentGame, loadCurrentGame, clearCurrentGame } from '../utils/storage';

// Action types
type GameAction =
  | { type: 'LOAD_GAME'; payload: GameState }
  | { type: 'LOAD_ARCHIVE'; payload: GameState }
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
  | { type: 'RESET_GAME' };

// Initial state
const initialGameState: GameState = {
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
const gameReducer = (state: GameState, action: GameAction): GameState => {
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
      
      // eslint-disable-next-line prefer-const
      let updatedTeam = { ...team, score: Math.max(0, team.score + points) };
      // eslint-disable-next-line prefer-const
      let updatedOppositeTeam = { ...oppositeTeam };
      
      // 更新在场球员的正负值
      if (points !== 0) {
        updatedTeam.players = updatedTeam.players.map(player => 
          player.isOnCourt ? { ...player, plusMinus: player.plusMinus + points } : player
        );
        updatedOppositeTeam.players = updatedOppositeTeam.players.map(player => 
          player.isOnCourt ? { ...player, plusMinus: player.plusMinus - points } : player
        );
      }
      
      // 更新球员数据
      if (playerId) {
        updatedTeam.players = updatedTeam.players.map(player => {
          if (player.id === playerId) {
            const updatedPlayer = { ...player, points: Math.max(0, player.points + points) };
            
            // 根据得分类型更新相应统计（只在正分时更新）
            if (points > 0) {
              switch (scoreType) {
                case '1':
                  updatedPlayer.freeThrowsMade += 1;
                  updatedPlayer.freeThrowsAttempted += 1;
                  break;
                case '2':
                  updatedPlayer.fieldGoalsMade += 1;
                  updatedPlayer.fieldGoalsAttempted += 1;
                  break;
                case '3':
                  updatedPlayer.threePointersMade += 1;
                  updatedPlayer.threePointersAttempted += 1;
                  updatedPlayer.fieldGoalsMade += 1;
                  updatedPlayer.fieldGoalsAttempted += 1;
                  break;
              }
            }
            
            return updatedPlayer;
          }
          return player;
        });
      }

      const event: GameEvent = {
        id: generateId(),
        timestamp: Date.now(),
        quarter: state.quarter,
        time: state.time,
        type: 'score',
        teamId,
        playerId,
        description: points > 0 ? `${team.name} 得${points}分` : `${team.name} 减${Math.abs(points)}分`,
        points,
      };

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
      
      // 检查球员是否有足够的得分和统计数据可以撤销
      if (player.points < points) return state;
      
      let canUndo = false;
      switch (scoreType) {
        case '1':
          canUndo = player.freeThrowsMade > 0;
          break;
        case '2':
          canUndo = player.fieldGoalsMade > 0 && (player.fieldGoalsMade - player.threePointersMade) > 0;
          break;
        case '3':
          canUndo = player.threePointersMade > 0;
          break;
      }
      
      if (!canUndo) return state;
      
      // eslint-disable-next-line prefer-const
      let updatedTeam = { ...team, score: Math.max(0, team.score - points) };
      // eslint-disable-next-line prefer-const
      let updatedOppositeTeam = { ...oppositeTeam };
      
      // 撤销在场球员的正负值
      updatedTeam.players = updatedTeam.players.map(p => 
        p.isOnCourt ? { ...p, plusMinus: p.plusMinus - points } : p
      );
      updatedOppositeTeam.players = updatedOppositeTeam.players.map(p => 
        p.isOnCourt ? { ...p, plusMinus: p.plusMinus + points } : p
      );
      
      updatedTeam.players = updatedTeam.players.map(p => {
        if (p.id === playerId) {
          const updatedPlayer = { ...p, points: Math.max(0, p.points - points) };
          
          // 撤销相应的统计数据
          switch (scoreType) {
            case '1':
              updatedPlayer.freeThrowsMade = Math.max(0, updatedPlayer.freeThrowsMade - 1);
              updatedPlayer.freeThrowsAttempted = Math.max(0, updatedPlayer.freeThrowsAttempted - 1);
              break;
            case '2':
              updatedPlayer.fieldGoalsMade = Math.max(0, updatedPlayer.fieldGoalsMade - 1);
              updatedPlayer.fieldGoalsAttempted = Math.max(0, updatedPlayer.fieldGoalsAttempted - 1);
              break;
            case '3':
              updatedPlayer.threePointersMade = Math.max(0, updatedPlayer.threePointersMade - 1);
              updatedPlayer.threePointersAttempted = Math.max(0, updatedPlayer.threePointersAttempted - 1);
              updatedPlayer.fieldGoalsMade = Math.max(0, updatedPlayer.fieldGoalsMade - 1);
              updatedPlayer.fieldGoalsAttempted = Math.max(0, updatedPlayer.fieldGoalsAttempted - 1);
              break;
          }
          
          return updatedPlayer;
        }
        return p;
      });

      const event: GameEvent = {
        id: generateId(),
        timestamp: Date.now(),
        quarter: state.quarter,
        time: state.time,
        type: 'score',
        teamId,
        playerId,
        description: `${team.name} 撤销${points}分`,
        points: -points,
      };

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

      return {
        ...state,
        homeTeam: isHomeTeam ? updatedTeam : state.homeTeam,
        awayTeam: isHomeTeam ? state.awayTeam : updatedTeam,
        updatedAt: Date.now(),
      };
    }

    case 'ADD_SHOT_ATTEMPT': {
      const { teamId, playerId, shotType } = action.payload;
      const isHomeTeam = teamId === state.homeTeam.id;
      const team = isHomeTeam ? state.homeTeam : state.awayTeam;
      
      const updatedTeam = {
        ...team,
        players: team.players.map(player => {
          if (player.id === playerId) {
            const updatedPlayer = { ...player };
            
            switch (shotType) {
              case 'field':
                updatedPlayer.fieldGoalsAttempted += 1;
                break;
              case 'three':
                updatedPlayer.threePointersAttempted += 1;
                updatedPlayer.fieldGoalsAttempted += 1;
                break;
              case 'free':
                updatedPlayer.freeThrowsAttempted += 1;
                break;
            }
            
            return updatedPlayer;
          }
          return player;
        }),
      };

      const event: GameEvent = {
        id: generateId(),
        timestamp: Date.now(),
        quarter: state.quarter,
        time: state.time,
        type: 'other',
        teamId,
        playerId,
        description: `${team.name} ${shotType === 'field' ? '投篮' : shotType === 'three' ? '3分' : '罚球'}出手`,
      };

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
      
      // eslint-disable-next-line prefer-const
      let updatedTeam = { ...team, fouls: team.fouls + 1 };
      
      if (playerId) {
        updatedTeam.players = team.players.map(player =>
          player.id === playerId
            ? { ...player, fouls: player.fouls + 1 }
            : player
        );
      }

      const event: GameEvent = {
        id: generateId(),
        timestamp: Date.now(),
        quarter: state.quarter,
        time: state.time,
        type: 'foul',
        teamId,
        playerId,
        description: `${team.name} 犯规`,
      };

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
      
      if (team.timeouts <= 0) return state;
      
      const updatedTeam = { ...team, timeouts: team.timeouts - 1 };

      const event: GameEvent = {
        id: generateId(),
        timestamp: Date.now(),
        quarter: state.quarter,
        time: state.time,
        type: 'timeout',
        teamId,
        description: `${team.name} 请求暂停`,
      };

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
      
      const playersOnCourt = team.players.filter(p => p.isOnCourt);
      
      // 如果球员要上场，检查是否已有5人在场
      if (!player.isOnCourt && playersOnCourt.length >= 5) {
        return state; // 不允许超过5人在场
      }
      
      const updatedTeam = {
        ...team,
        players: team.players.map(p => {
          if (p.id === playerId) {
            // 只切换上场状态，不重置正负值（正负值应该累积计算）
            return { ...p, isOnCourt: !p.isOnCourt };
          }
          return p;
        }),
      };

      const event: GameEvent = {
        id: generateId(),
        timestamp: Date.now(),
        quarter: state.quarter,
        time: state.time,
        type: 'substitution',
        teamId,
        playerId,
        description: `${player.name} ${player.isOnCourt ? '下场' : '上场'}`,
      };

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
      const event: GameEvent = {
        id: generateId(),
        timestamp: Date.now(),
        quarter: state.quarter,
        time: state.time,
        type: 'other',
        teamId: '',
        description: `第${state.quarter}节结束`,
      };

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
      
      const updatedTeam = {
        ...team,
        players: [...team.players, player],
      };

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
      
      const updatedTeam = {
        ...team,
        players: team.players.filter(player => player.id !== playerId),
      };

      return {
        ...state,
        homeTeam: isHomeTeam ? updatedTeam : state.homeTeam,
        awayTeam: isHomeTeam ? state.awayTeam : updatedTeam,
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

const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider
interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);

  // 加载保存的游戏状态
  useEffect(() => {
    console.log('GameProvider: 尝试加载保存的游戏状态');
    const savedGame = loadCurrentGame();
    if (savedGame) {
      console.log('GameProvider: 加载已保存的游戏状态', savedGame);
      dispatch({ type: 'LOAD_GAME', payload: savedGame });
    } else {
      console.log('GameProvider: 没有找到保存的游戏状态，使用初始状态');
    }
  }, []);

  // 调试输出当前状态
  useEffect(() => {
    console.log('GameProvider: 游戏状态更新', {
      hasHomeTeam: !!gameState?.homeTeam,
      hasAwayTeam: !!gameState?.awayTeam,
      homeTeamName: gameState?.homeTeam?.name,
      awayTeamName: gameState?.awayTeam?.name,
      quarter: gameState?.quarter,
      time: gameState?.time
    });
  }, [gameState]);

  // 自动保存游戏状态
  useEffect(() => {
    if (gameState.id !== initialGameState.id) {
      saveCurrentGame(gameState);
    }
  }, [gameState]);

  return (
    <GameContext.Provider value={{ gameState, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

// Hook
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}; 
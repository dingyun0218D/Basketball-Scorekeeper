import { useEventDrivenGameContext } from './useEventDrivenGameContext';
import { GameState, Player, Team, ScoreType } from '../types';

export const useGame = () => {
  const context = useEventDrivenGameContext();
  
  // 提供完整的游戏操作方法
  const loadArchive = async (gameState: GameState) => {
    // 在事件驱动架构中，我们需要重新初始化游戏状态
    // 这里应该通过重置游戏并应用存档状态来实现
    console.log('加载存档:', gameState);
    // TODO: 实现通过事件重建存档状态
  };

  const loadGame = async (gameState: GameState) => {
    // 加载保存的游戏状态
    console.log('加载游戏:', gameState);
    // TODO: 实现通过事件重建游戏状态
  };

  const syncCollaborativeState = async (gameState: GameState) => {
    // 同步协作状态
    console.log('同步协作状态:', gameState);
    // TODO: 实现协作状态同步
  };

  // 为了向后兼容，我们保留dispatch方法，但引导用户使用新的方法
  const dispatch = async (action: any) => {
    console.warn('dispatch方法已弃用，请使用具体的事件方法');
    
    // 尝试将旧的action转换为新的方法调用
    switch (action.type) {
      case 'LOAD_ARCHIVE':
        await loadArchive(action.payload);
        break;
      case 'LOAD_GAME':
        await loadGame(action.payload);
        break;
      case 'SYNC_COLLABORATIVE_STATE':
        await syncCollaborativeState(action.payload);
        break;
      case 'UPDATE_SCORE':
        await context.addScore(
          action.payload.teamId, 
          action.payload.points, 
          action.payload.playerId, 
          action.payload.scoreType as ScoreType
        );
        break;
      case 'ADD_FOUL':
        await context.addFoul(action.payload.teamId, action.payload.playerId);
        break;
      case 'ADD_PLAYER':
        await context.addPlayer(action.payload.teamId, action.payload.player);
        break;
      case 'REMOVE_PLAYER':
        await context.removePlayer(action.payload.teamId, action.payload.playerId);
        break;
      case 'UPDATE_TEAM':
        await context.updateTeam(action.payload.teamId, action.payload.updates);
        break;
      case 'START_TIMER':
        await context.startTimer();
        break;
      case 'PAUSE_TIMER':
        await context.pauseTimer();
        break;
      case 'RESUME_TIMER':
        await context.resumeTimer();
        break;
      case 'STOP_TIMER':
        await context.stopTimer();
        break;
      case 'NEXT_QUARTER':
        await context.nextQuarter();
        break;
      case 'RESET_GAME':
        await context.resetGame();
        break;
      case 'UPDATE_TIME':
        await context.updateTime(action.payload.time);
        break;
      case 'SET_QUARTER_TIME':
        await context.setQuarterTime(action.payload.time);
        break;
      case 'TOGGLE_PLAYER_COURT_STATUS':
        await context.togglePlayerCourtStatus(action.payload.teamId, action.payload.playerId);
        break;
      case 'UPDATE_PLAYER_STAT':
        await context.updatePlayerStat(action.payload.teamId, action.payload.playerId, action.payload.stat, action.payload.value);
        break;
      case 'UNDO_SCORE':
        await context.undoScore(action.payload.teamId, action.payload.playerId, action.payload.scoreType);
        break;
      case 'ADD_SHOT_ATTEMPT':
        await context.addShotAttempt(action.payload.teamId, action.payload.playerId, action.payload.shotType);
        break;
      case 'USE_TIMEOUT':
        await context.useTimeout(action.payload.teamId);
        break;
      case 'SYNC_PLAYER_INFO':
        await context.syncPlayerInfo(action.payload.originalPlayer, action.payload.updatedPlayer);
        break;
      default:
        console.warn('不支持的action类型:', action.type);
    }
  };
  
  return {
    ...context,
    dispatch, // 保持向后兼容
    loadArchive,
    loadGame,
    syncCollaborativeState
  };
}; 
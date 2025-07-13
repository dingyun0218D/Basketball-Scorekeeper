import { useGame } from './useGame';
import { Player } from '../types';
import { PlayerToDelete } from './useAppState';

interface UseGameEventsProps {
  setPlayerToDelete: (player: PlayerToDelete | null) => void;
  setShowConfirmModal: (show: boolean) => void;
  setShowResetConfirmModal: (show: boolean) => void;
}

export const useGameEvents = ({ 
  setPlayerToDelete, 
  setShowConfirmModal, 
  setShowResetConfirmModal 
}: UseGameEventsProps) => {
  const { gameState, dispatch } = useGame();

  // 处理得分更新
  const handleScoreUpdate = (teamId: string, points: number, playerId?: string) => {
    dispatch({
      type: 'UPDATE_SCORE',
      payload: { 
        teamId, 
        points, 
        playerId,
        scoreType: points === 1 ? '1' : points === 2 ? '2' : '3'
      }
    });
  };

  // 处理球员统计更新
  const handlePlayerStatUpdate = (teamId: string, playerId: string, stat: string, value: number) => {
    dispatch({
      type: 'UPDATE_PLAYER_STAT',
      payload: { teamId, playerId, stat, value }
    });
  };

  // 处理犯规
  const handleAddFoul = (teamId: string, playerId: string) => {
    dispatch({
      type: 'ADD_FOUL',
      payload: { teamId, playerId }
    });
  };

  // 处理球员移除
  const handleRemovePlayer = (teamId: string, playerId: string) => {
    if (!gameState) return;
    
    // 找到要删除的球员信息
    const team = teamId === gameState.homeTeam.id ? gameState.homeTeam : gameState.awayTeam;
    const player = team.players.find(p => p.id === playerId);
    
    if (!player) {
      console.warn('未找到要删除的球员');
      return;
    }
    
    // 设置要删除的球员信息并显示确认模态框
    setPlayerToDelete({ teamId, playerId, playerInfo: player });
    setShowConfirmModal(true);
  };

  // 确认删除球员
  const confirmRemovePlayer = (playerToDelete: PlayerToDelete | null) => {
    if (playerToDelete) {
      dispatch({
        type: 'REMOVE_PLAYER',
        payload: { teamId: playerToDelete.teamId, playerId: playerToDelete.playerId }
      });
    }
    setShowConfirmModal(false);
    setPlayerToDelete(null);
  };

  // 取消删除球员
  const cancelRemovePlayer = () => {
    setShowConfirmModal(false);
    setPlayerToDelete(null);
  };

  // 处理添加球员
  const handleAddPlayer = (teamId: string, player: Player) => {
    dispatch({
      type: 'ADD_PLAYER',
      payload: { teamId, player }
    });
  };

  // 处理出手统计
  const handleShotAttempt = (teamId: string, playerId: string, shotType: 'field' | 'three' | 'free') => {
    dispatch({
      type: 'ADD_SHOT_ATTEMPT',
      payload: { teamId, playerId, shotType }
    });
  };

  // 处理撤销得分
  const handleUndoScore = (teamId: string, playerId: string, scoreType: '1' | '2' | '3') => {
    dispatch({
      type: 'UNDO_SCORE',
      payload: { teamId, playerId, scoreType }
    });
  };

  // 处理球员上场状态切换
  const handleTogglePlayerCourtStatus = (teamId: string, playerId: string) => {
    dispatch({
      type: 'TOGGLE_PLAYER_COURT_STATUS',
      payload: { teamId, playerId }
    });
  };

  // 计时器控制函数
  const handleStartTimer = () => dispatch({ type: 'START_TIMER' });
  const handlePauseTimer = () => dispatch({ type: 'PAUSE_TIMER' });
  const handleResumeTimer = () => dispatch({ type: 'RESUME_TIMER' });
  const handleStopTimer = () => dispatch({ type: 'STOP_TIMER' });
  const handleNextQuarter = () => dispatch({ type: 'NEXT_QUARTER' });
  const handleTimeChange = (time: string) => {
    dispatch({ type: 'UPDATE_TIME', payload: { time } });
  };
  const handleQuarterTimeChange = (time: string) => {
    dispatch({ type: 'SET_QUARTER_TIME', payload: { time } });
  };

  // 处理重置游戏
  const handleResetGame = () => {
    setShowResetConfirmModal(true);
  };

  // 确认重置比赛
  const confirmResetGame = () => {
    dispatch({ type: 'RESET_GAME' });
    setShowResetConfirmModal(false);
  };

  // 取消重置比赛
  const cancelResetGame = () => {
    setShowResetConfirmModal(false);
  };

  // 处理队名更新
  const handleTeamNameUpdate = (teamId: string, newName: string) => {
    dispatch({
      type: 'UPDATE_TEAM',
      payload: { teamId, updates: { name: newName } }
    });
  };

  return {
    handleScoreUpdate,
    handlePlayerStatUpdate,
    handleAddFoul,
    handleRemovePlayer,
    confirmRemovePlayer,
    cancelRemovePlayer,
    handleAddPlayer,
    handleShotAttempt,
    handleUndoScore,
    handleTogglePlayerCourtStatus,
    handleStartTimer,
    handlePauseTimer,
    handleResumeTimer,
    handleStopTimer,
    handleNextQuarter,
    handleTimeChange,
    handleQuarterTimeChange,
    handleResetGame,
    confirmResetGame,
    cancelResetGame,
    handleTeamNameUpdate,
  };
}; 
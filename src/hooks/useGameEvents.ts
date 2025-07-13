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
  const { 
    gameState, 
    addScore, 
    addFoul, 
    addPlayer, 
    removePlayer, 
    updatePlayerStat, 
    addShotAttempt, 
    undoScore, 
    togglePlayerCourtStatus, 
    startTimer, 
    pauseTimer, 
    resumeTimer, 
    stopTimer, 
    nextQuarter, 
    updateTime, 
    setQuarterTime, 
    resetGame, 
    updateTeam 
  } = useGame();

  // 处理得分更新
  const handleScoreUpdate = async (teamId: string, points: number, playerId?: string) => {
    const scoreType = points === 1 ? 'free-throw' : points === 2 ? '2' : '3';
    await addScore(teamId, points, playerId, scoreType);
  };

  // 处理球员统计更新
  const handlePlayerStatUpdate = async (teamId: string, playerId: string, stat: string, value: number) => {
    await updatePlayerStat(teamId, playerId, stat, value);
  };

  // 处理犯规
  const handleAddFoul = async (teamId: string, playerId: string) => {
    await addFoul(teamId, playerId);
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
  const confirmRemovePlayer = async (playerToDelete: PlayerToDelete | null) => {
    if (playerToDelete) {
      await removePlayer(playerToDelete.teamId, playerToDelete.playerId);
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
  const handleAddPlayer = async (teamId: string, player: Player) => {
    await addPlayer(teamId, player);
  };

  // 处理出手统计
  const handleShotAttempt = async (teamId: string, playerId: string, shotType: 'field' | 'three' | 'free') => {
    await addShotAttempt(teamId, playerId, shotType);
  };

  // 处理撤销得分
  const handleUndoScore = async (teamId: string, playerId: string, scoreType: '1' | '2' | '3') => {
    const actualScoreType = scoreType === '1' ? 'free-throw' : scoreType === '2' ? '2' : '3';
    await undoScore(teamId, playerId, actualScoreType);
  };

  // 处理球员上场状态切换
  const handleTogglePlayerCourtStatus = async (teamId: string, playerId: string) => {
    await togglePlayerCourtStatus(teamId, playerId);
  };

  // 计时器控制函数
  const handleStartTimer = async () => await startTimer();
  const handlePauseTimer = async () => await pauseTimer();
  const handleResumeTimer = async () => await resumeTimer();
  const handleStopTimer = async () => await stopTimer();
  const handleNextQuarter = async () => await nextQuarter();
  const handleTimeChange = async (time: string) => {
    await updateTime(time);
  };
  const handleQuarterTimeChange = async (time: string) => {
    await setQuarterTime(time);
  };

  // 处理重置游戏
  const handleResetGame = () => {
    setShowResetConfirmModal(true);
  };

  // 确认重置比赛
  const confirmResetGame = async () => {
    await resetGame();
    setShowResetConfirmModal(false);
  };

  // 取消重置比赛
  const cancelResetGame = () => {
    setShowResetConfirmModal(false);
  };

  // 处理团队名称更新
  const handleTeamNameUpdate = async (teamId: string, newName: string) => {
    await updateTeam(teamId, { name: newName });
  };

  return {
    // 得分相关
    handleScoreUpdate,
    handleUndoScore,
    handleShotAttempt,
    
    // 球员相关
    handlePlayerStatUpdate,
    handleAddFoul,
    handleRemovePlayer,
    confirmRemovePlayer,
    cancelRemovePlayer,
    handleAddPlayer,
    handleTogglePlayerCourtStatus,
    
    // 计时器相关
    handleStartTimer,
    handlePauseTimer,
    handleResumeTimer,
    handleStopTimer,
    handleNextQuarter,
    handleTimeChange,
    handleQuarterTimeChange,
    
    // 游戏控制
    handleResetGame,
    confirmResetGame,
    cancelResetGame,
    
    // 团队管理
    handleTeamNameUpdate
  };
}; 
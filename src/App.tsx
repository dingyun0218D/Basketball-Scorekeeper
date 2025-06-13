import React, { useState } from 'react';
import { ScoreboardPlayerSection } from './components/Scoreboard';
import { TimerControls } from './components/GameControls';
import { StatisticsAnalysis } from './components/Statistics';
import { GameHistory } from './components/History/GameHistory';
import { TeamNameEditor } from './components/Team/TeamNameEditor';
import { ConfirmModal } from './components/common/ConfirmModal';
import { useGame } from './hooks/useGame';
import { useGameTimer } from './hooks/useGameTimer';
import { createDefaultPlayer, validatePlayerNumber } from './utils/gameUtils';
import { Player } from './types';
import './index.css';

// Tab类型
type TabType = 'scoreboard' | 'players-stats' | 'history';

const App: React.FC = () => {
  const { gameState, dispatch } = useGame();
  useGameTimer(); // 启用计时器功能
  const [activeTab, setActiveTab] = useState<TabType>('scoreboard');
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<{teamId: string; playerId: string; playerInfo: Player} | null>(null);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

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
  const confirmRemovePlayer = () => {
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

  // 添加球员模态框组件
  const AddPlayerModal: React.FC = () => {
    const [name, setName] = useState('');
    const [number, setNumber] = useState('');
    const [position, setPosition] = useState('PG');

    const team = selectedTeamId === gameState.homeTeam.id ? gameState.homeTeam : gameState.awayTeam;
    const existingNumbers = team.players.map(p => p.number);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const playerNumber = parseInt(number);
      if (!name.trim()) {
        alert('请输入球员姓名');
        return;
      }
      
      if (!validatePlayerNumber(playerNumber, existingNumbers)) {
        alert('球员号码无效或已存在');
        return;
      }

      const newPlayer = createDefaultPlayer(name.trim(), playerNumber, position);
      dispatch({
        type: 'ADD_PLAYER',
        payload: { teamId: selectedTeamId, player: newPlayer }
      });

      setName('');
      setNumber('');
      setPosition('PG');
      setShowAddPlayerModal(false);
    };

    return (
      <div className="modal-overlay" onClick={() => setShowAddPlayerModal(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <h3 className="text-lg font-semibold mb-4">添加球员</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">姓名</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                placeholder="请输入球员姓名"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">号码</label>
              <input
                type="number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="form-input"
                placeholder="0-99"
                min="0"
                max="99"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">位置</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="form-select"
              >
                <option value="PG">控球后卫 (PG)</option>
                <option value="SG">得分后卫 (SG)</option>
                <option value="SF">小前锋 (SF)</option>
                <option value="PF">大前锋 (PF)</option>
                <option value="C">中锋 (C)</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddPlayerModal(false)}
                className="btn btn-secondary btn-md"
              >
                取消
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-md"
              >
                添加
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // 渲染标签页内容
  const renderTabContent = () => {
    switch (activeTab) {
      case 'scoreboard':
        // 添加调试输出
        console.log('渲染计分板页面', {
          activeTab,
          gameState: gameState ? {
            homeTeam: gameState.homeTeam?.name,
            awayTeam: gameState.awayTeam?.name,
            quarter: gameState.quarter,
            time: gameState.time
          } : null,
          hasGameState: !!gameState
        });
        
        // 检查gameState是否存在
        if (!gameState) {
          return <div className="text-center py-8">游戏状态加载中...</div>;
        }
        
        // 检查teams是否存在
        if (!gameState.homeTeam || !gameState.awayTeam) {
          return <div className="text-center py-8">队伍信息加载中...</div>;
        }
        
        return (
          <div className="space-y-4">
            {/* 顶部：计分板和计时器 */}
            <div className="bg-gradient-to-r from-blue-600 to-red-600 rounded-lg p-4 text-white">
              <div className="grid grid-cols-3 gap-8 items-center">
                {/* 主队得分 */}
                <div className="text-center">
                  <TeamNameEditor 
                    team={gameState.homeTeam}
                    onTeamNameUpdate={handleTeamNameUpdate}
                    side="home"
                  />
                  <div className="text-5xl font-bold my-2">{gameState.homeTeam.score}</div>
                  <div className="text-sm opacity-75">犯规:{gameState.homeTeam.fouls} 暂停:{gameState.homeTeam.timeouts}</div>
                </div>

                {/* 中间：计时器和控制 */}
                <TimerControls
                  quarter={gameState.quarter}
                  time={gameState.time}
                  quarterTime={gameState.quarterTime}
                  isRunning={gameState.isRunning}
                  isPaused={gameState.isPaused}
                  onStart={handleStartTimer}
                  onPause={handlePauseTimer}
                  onResume={handleResumeTimer}
                  onStop={handleStopTimer}
                  onNextQuarter={handleNextQuarter}
                  onReset={handleResetGame}
                  onTimeChange={handleTimeChange}
                  onQuarterTimeChange={handleQuarterTimeChange}
                />

                {/* 客队得分 */}
                <div className="text-center">
                  <TeamNameEditor 
                    team={gameState.awayTeam}
                    onTeamNameUpdate={handleTeamNameUpdate}
                    side="away"
                  />
                  <div className="text-5xl font-bold my-2">{gameState.awayTeam.score}</div>
                  <div className="text-xs opacity-75">犯规:{gameState.awayTeam.fouls} 暂停:{gameState.awayTeam.timeouts}</div>
                </div>
              </div>
            </div>

            {/* 底部：球员管理区域 */}
            <ScoreboardPlayerSection
              homeTeam={gameState.homeTeam}
              awayTeam={gameState.awayTeam}
              onScoreUpdate={handleScoreUpdate}
              onPlayerStatUpdate={handlePlayerStatUpdate}
              onAddFoul={handleAddFoul}
              onShotAttempt={handleShotAttempt}
              onUndoScore={handleUndoScore}
              onRemovePlayer={handleRemovePlayer}
              onAddPlayer={(teamId) => {
                setSelectedTeamId(teamId);
                setShowAddPlayerModal(true);
              }}
              onTogglePlayerCourtStatus={handleTogglePlayerCourtStatus}
            />
          </div>
        );

      case 'players-stats':
        return (
          <StatisticsAnalysis
            gameState={gameState}
            onScoreUpdate={handleScoreUpdate}
            onPlayerStatUpdate={handlePlayerStatUpdate}
            onAddFoul={handleAddFoul}
            onShotAttempt={handleShotAttempt}
            onUndoScore={handleUndoScore}
            onRemovePlayer={handleRemovePlayer}
            onAddPlayer={(teamId: string) => {
              setSelectedTeamId(teamId);
              setShowAddPlayerModal(true);
            }}
          />
        );

      case 'history':
        return <GameHistory currentGame={gameState} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              🏀 篮球计分器
            </h1>
            <div className="text-sm text-gray-600">
              {gameState.homeTeam.score} - {gameState.awayTeam.score}
            </div>
          </div>
        </div>
      </header>

      {/* 标签页导航 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="nav-tabs">
            <button
              className={`nav-tab ${activeTab === 'scoreboard' ? 'nav-tab-active' : ''}`}
              onClick={() => setActiveTab('scoreboard')}
            >
              计分板
            </button>
            <button
              className={`nav-tab ${activeTab === 'players-stats' ? 'nav-tab-active' : ''}`}
              onClick={() => setActiveTab('players-stats')}
            >
              统计分析
            </button>
            <button
              className={`nav-tab ${activeTab === 'history' ? 'nav-tab-active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              历史记录
            </button>
          </nav>
        </div>
      </div>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </main>

      {/* 添加球员模态框 */}
      {showAddPlayerModal && <AddPlayerModal />}

      {/* 删除球员确认模态框 */}
      {playerToDelete && (
        <ConfirmModal
          isOpen={showConfirmModal}
          title="删除球员"
          message={`确定要删除球员 #${playerToDelete.playerInfo.number} ${playerToDelete.playerInfo.name} 吗？`}
          details={[
            `得分：${playerToDelete.playerInfo.points}分`,
            `篮板：${playerToDelete.playerInfo.rebounds}个`,
            `助攻：${playerToDelete.playerInfo.assists}次`,
            `抢断：${playerToDelete.playerInfo.steals}次`,
            `盖帽：${playerToDelete.playerInfo.blocks}次`,
            `犯规：${playerToDelete.playerInfo.fouls}次`
          ]}
          confirmText="删除"
          cancelText="取消"
          type="danger"
          onConfirm={confirmRemovePlayer}
          onCancel={cancelRemovePlayer}
        />
      )}

      {/* 重置比赛确认模态框 */}
      <ConfirmModal
        isOpen={showResetConfirmModal}
        title="重置比赛"
        message="确定要重置比赛吗？这将清除所有比赛数据。"
        details={[
          `当前比分：${gameState.homeTeam.name} ${gameState.homeTeam.score} - ${gameState.awayTeam.score} ${gameState.awayTeam.name}`,
          `比赛节数：第${gameState.quarter}节`,
          `比赛时间：${gameState.time}`,
          `球员总数：${gameState.homeTeam.players.length + gameState.awayTeam.players.length}人`
        ]}
        confirmText="重置"
        cancelText="取消"
        type="danger"
        onConfirm={confirmResetGame}
        onCancel={cancelResetGame}
      />
    </div>
  );
};

export default App; 
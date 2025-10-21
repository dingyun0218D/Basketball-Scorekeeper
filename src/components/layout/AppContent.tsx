import React from 'react';
import { TabType } from '../../hooks/useAppState';
import { GameState, Player, User } from '../../types';
import { ScoreboardPlayerSection } from '../Scoreboard';
import { TimerControls } from '../GameControls';
import { StatisticsAnalysis } from '../Statistics';
import { GameHistory } from '../History/GameHistory';
import { TeamNameEditor } from '../Team/TeamNameEditor';
import CollaborativeGameManager from '../Collaborative/CollaborativeGameManager';

interface AppContentProps {
  activeTab: TabType;
  gameState: GameState;
  savedPlayers: Player[];
  selectedTeamId: string;
  setSelectedTeamId: (teamId: string) => void;
  setShowAddPlayerModal: (show: boolean) => void;
  // 协作功能
  showCollaborativePanel: boolean;
  user: User;
  collaborativeSessionId: string | null;
  onSessionChange: (sessionId: string | null) => void;
  // 游戏事件处理函数
  onScoreUpdate: (teamId: string, points: number, playerId?: string) => void;
  onPlayerStatUpdate: (teamId: string, playerId: string, stat: string, value: number) => void;
  onAddFoul: (teamId: string, playerId: string) => void;
  onShotAttempt: (teamId: string, playerId: string, shotType: 'field' | 'three' | 'free') => void;
  onUndoScore: (teamId: string, playerId: string, scoreType: '1' | '2' | '3') => void;
  onRemovePlayer: (teamId: string, playerId: string) => void;
  onAddPlayer: (teamId: string, player: Player) => void;
  onTogglePlayerCourtStatus: (teamId: string, playerId: string) => void;
  onSavePlayer: (player: Player) => void;
  onDeleteSavedPlayer: (playerId: string) => void;
  // 计时器控制函数
  onStartTimer: () => void;
  onPauseTimer: () => void;
  onResumeTimer: () => void;
  onStopTimer: () => void;
  onNextQuarter: () => void;
  onResetGame: () => void;
  onTimeChange: (time: string) => void;
  onQuarterTimeChange: (time: string) => void;
  onTeamNameUpdate: (teamId: string, newName: string) => void;
}

export const AppContent: React.FC<AppContentProps> = ({
  activeTab,
  gameState,
  savedPlayers,
  selectedTeamId: _selectedTeamId,
  setSelectedTeamId,
  setShowAddPlayerModal,
  showCollaborativePanel,
  user,
  collaborativeSessionId: _collaborativeSessionId,
  onSessionChange,
  onScoreUpdate,
  onPlayerStatUpdate,
  onAddFoul,
  onShotAttempt,
  onUndoScore,
  onRemovePlayer,
  onAddPlayer,
  onTogglePlayerCourtStatus,
  onSavePlayer,
  onDeleteSavedPlayer,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onStopTimer,
  onNextQuarter,
  onResetGame,
  onTimeChange,
  onQuarterTimeChange,
  onTeamNameUpdate
}) => {
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
        
        // 检查teams是否存在并且数据完整
        if (!gameState.homeTeam || !gameState.awayTeam || 
            gameState.homeTeam.score === undefined || 
            gameState.awayTeam.score === undefined) {
          console.error('❌ 游戏状态数据不完整', {
            hasHomeTeam: !!gameState.homeTeam,
            hasAwayTeam: !!gameState.awayTeam,
            homeTeamScore: gameState.homeTeam?.score,
            awayTeamScore: gameState.awayTeam?.score
          });
          return (
            <div className="text-center py-8">
              <p className="text-red-600 font-semibold">队伍数据加载失败</p>
              <p className="text-sm text-gray-600 mt-2">请刷新页面或重新创建会话</p>
            </div>
          );
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
                    onTeamNameUpdate={onTeamNameUpdate}
                    side="home"
                  />
                  <div className="text-5xl font-bold my-2">{gameState.homeTeam.score ?? 0}</div>
                  <div className="text-sm opacity-75">犯规:{gameState.homeTeam.fouls ?? 0} 暂停:{gameState.homeTeam.timeouts ?? 3}</div>
                </div>

                {/* 中间：计时器和控制 */}
                <TimerControls
                  quarter={gameState.quarter}
                  time={gameState.time}
                  quarterTime={gameState.quarterTime}
                  isRunning={gameState.isRunning}
                  isPaused={gameState.isPaused}
                  onStart={onStartTimer}
                  onPause={onPauseTimer}
                  onResume={onResumeTimer}
                  onStop={onStopTimer}
                  onNextQuarter={onNextQuarter}
                  onReset={onResetGame}
                  onTimeChange={onTimeChange}
                  onQuarterTimeChange={onQuarterTimeChange}
                />

                {/* 客队得分 */}
                <div className="text-center">
                  <TeamNameEditor 
                    team={gameState.awayTeam}
                    onTeamNameUpdate={onTeamNameUpdate}
                    side="away"
                  />
                  <div className="text-5xl font-bold my-2">{gameState.awayTeam.score ?? 0}</div>
                  <div className="text-sm opacity-75">犯规:{gameState.awayTeam.fouls ?? 0} 暂停:{gameState.awayTeam.timeouts ?? 3}</div>
                </div>
              </div>
            </div>

            {/* 底部：球员管理区域 */}
            <ScoreboardPlayerSection
              homeTeam={gameState.homeTeam}
              awayTeam={gameState.awayTeam}
              savedPlayers={savedPlayers}
              onScoreUpdate={onScoreUpdate}
              onPlayerStatUpdate={onPlayerStatUpdate}
              onAddFoul={onAddFoul}
              onShotAttempt={onShotAttempt}
              onUndoScore={onUndoScore}
              onRemovePlayer={onRemovePlayer}
              onAddPlayer={onAddPlayer}
              onTogglePlayerCourtStatus={onTogglePlayerCourtStatus}
              onSavePlayer={onSavePlayer}
              onDeleteSavedPlayer={onDeleteSavedPlayer}
            />
          </div>
        );

      case 'players-stats':
        return (
          <StatisticsAnalysis
            gameState={gameState}
            onScoreUpdate={onScoreUpdate}
            onPlayerStatUpdate={onPlayerStatUpdate}
            onAddFoul={onAddFoul}
            onShotAttempt={onShotAttempt}
            onUndoScore={onUndoScore}
            onRemovePlayer={onRemovePlayer}
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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 协作面板 - 在所有页面顶部显示 */}
      {showCollaborativePanel && (
        <div className="bg-white rounded-lg shadow-sm border mb-4">
          <CollaborativeGameManager
            user={user}
            initialGameState={gameState}
            onSessionChange={onSessionChange}
          />
        </div>
      )}
      
      {renderTabContent()}
    </main>
  );
}; 
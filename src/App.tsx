import React from 'react';
import { useGame } from './hooks/useGame';
import { useGameTimer } from './hooks/useGameTimer';
import { useAppState } from './hooks/useAppState';
import { useSavedPlayers } from './hooks/useSavedPlayers';
import { useGameEvents } from './hooks/useGameEvents';
import { usePlayerSync } from './hooks/usePlayerSync';
import { useEventDrivenCollaboration } from './hooks/useEventDrivenCollaboration';
import { AppHeader, TabNavigation, AppContent, AppModals } from './components/layout';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

const App: React.FC = () => {
  const { gameState } = useGame();
  useGameTimer(); // 启用计时器功能
  
  // 使用各种hooks（必须在条件返回之前调用）
  const appState = useAppState();
  const savedPlayersState = useSavedPlayers();
  const collaboration = useEventDrivenCollaboration();
  
  // 游戏事件处理
  const gameEvents = useGameEvents({
    setPlayerToDelete: appState.setPlayerToDelete,
    setShowConfirmModal: appState.setShowConfirmModal,
    setShowResetConfirmModal: appState.setShowResetConfirmModal
  });
  
  // 球员同步处理
  const playerSync = usePlayerSync({
    savedPlayers: savedPlayersState.savedPlayers,
    setSavedPlayers: savedPlayersState.setSavedPlayers,
    setPlayerSyncInfo: appState.setPlayerSyncInfo,
    setShowPlayerSyncModal: appState.setShowPlayerSyncModal
  });
  
  // 如果游戏状态还没有加载，显示加载界面
  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载游戏状态...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-gray-100">
        {/* 应用头部 */}
        <AppHeader
          collaborativeSessionId={collaboration.collaborativeSessionId || null}
          homeTeamScore={gameState.homeTeam.score}
          awayTeamScore={gameState.awayTeam.score}
          onToggleCollaborativePanel={collaboration.toggleCollaborativePanel}
        />

      {/* 标签页导航 */}
        <TabNavigation
          activeTab={appState.activeTab}
          onTabChange={appState.setActiveTab}
        />

        {/* 主要内容区域 */}
        <AppContent
          activeTab={appState.activeTab}
          gameState={gameState}
          savedPlayers={savedPlayersState.savedPlayers}
          selectedTeamId={appState.selectedTeamId}
          setSelectedTeamId={appState.setSelectedTeamId}
          setShowAddPlayerModal={appState.setShowAddPlayerModal}
          showCollaborativePanel={collaboration.showCollaborativePanel}
          user={collaboration.user}
          collaborativeSessionId={collaboration.collaborativeSessionId || null}
          onSessionChange={collaboration.handleSessionChange}
          onScoreUpdate={gameEvents.handleScoreUpdate}
          onPlayerStatUpdate={gameEvents.handlePlayerStatUpdate}
          onAddFoul={gameEvents.handleAddFoul}
          onShotAttempt={gameEvents.handleShotAttempt}
          onUndoScore={gameEvents.handleUndoScore}
          onRemovePlayer={gameEvents.handleRemovePlayer}
          onAddPlayer={gameEvents.handleAddPlayer}
          onTogglePlayerCourtStatus={gameEvents.handleTogglePlayerCourtStatus}
          onSavePlayer={playerSync.handleSavePlayer}
          onDeleteSavedPlayer={savedPlayersState.handleDeleteSavedPlayer}
          onStartTimer={gameEvents.handleStartTimer}
          onPauseTimer={gameEvents.handlePauseTimer}
          onResumeTimer={gameEvents.handleResumeTimer}
          onStopTimer={gameEvents.handleStopTimer}
          onNextQuarter={gameEvents.handleNextQuarter}
          onTimeChange={gameEvents.handleTimeChange}
          onQuarterTimeChange={gameEvents.handleQuarterTimeChange}
          onResetGame={gameEvents.handleResetGame}
          onTeamNameUpdate={gameEvents.handleTeamNameUpdate}
        />

        {/* 模态框组件 */}
        <AppModals
          showAddPlayerModal={appState.showAddPlayerModal}
          setShowAddPlayerModal={appState.setShowAddPlayerModal}
          selectedTeamId={appState.selectedTeamId}
          savedPlayers={savedPlayersState.savedPlayers}
          onAddPlayer={gameEvents.handleAddPlayer}
          onSavePlayer={playerSync.handleSavePlayer}
          onDeleteSavedPlayer={savedPlayersState.handleDeleteSavedPlayer}
          showConfirmModal={appState.showConfirmModal}
          playerToDelete={appState.playerToDelete}
          onConfirmRemovePlayer={gameEvents.confirmRemovePlayer}
          onCancelRemovePlayer={gameEvents.cancelRemovePlayer}
          showResetConfirmModal={appState.showResetConfirmModal}
          onConfirmResetGame={gameEvents.confirmResetGame}
          onCancelResetGame={gameEvents.cancelResetGame}
          showPlayerSyncModal={appState.showPlayerSyncModal}
          playerSyncInfo={appState.playerSyncInfo}
          onConfirmPlayerSync={playerSync.confirmPlayerSync}
          onCancelPlayerSync={playerSync.cancelPlayerSync}
          gameState={gameState}
      />
    </div>
    </ErrorBoundary>
  );
};

export default App; 
import React from 'react';
import { useGame } from './hooks/useGame';
import { useGameTimer } from './hooks/useGameTimer';
import { useAppState } from './hooks/useAppState';
import { useSavedPlayers } from './hooks/useSavedPlayers';
import { useGameEvents } from './hooks/useGameEvents';
import { usePlayerSync } from './hooks/usePlayerSync';
import { useCollaboration } from './hooks/useCollaboration';
import { AppHeader, TabNavigation, AppContent, AppModals } from './components/layout';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

const App: React.FC = () => {
  const { gameState } = useGame();
  useGameTimer(); // 启用计时器功能
  
  // 使用各种hooks
  const appState = useAppState();
  const savedPlayersState = useSavedPlayers();
  const collaboration = useCollaboration();
  
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

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-gray-100">
        {/* 应用头部 */}
        <AppHeader
          collaborativeSessionId={collaboration.collaborativeSessionId}
          homeTeamScore={gameState.homeTeam?.score ?? 0}
          awayTeamScore={gameState.awayTeam?.score ?? 0}
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
          collaborativeSessionId={collaboration.collaborativeSessionId}
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
          onResetGame={gameEvents.handleResetGame}
          onTimeChange={gameEvents.handleTimeChange}
          onQuarterTimeChange={gameEvents.handleQuarterTimeChange}
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
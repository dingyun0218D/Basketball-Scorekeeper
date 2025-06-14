import React from 'react';
import { Team, Player } from '../../types';
import { TeamPlayerArea } from './TeamPlayerArea';
import { OnCourtArea } from './OnCourtArea';

interface ScoreboardPlayerSectionProps {
  homeTeam: Team;
  awayTeam: Team;
  savedPlayers: Player[];
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
}

export const ScoreboardPlayerSection: React.FC<ScoreboardPlayerSectionProps> = ({
  homeTeam,
  awayTeam,
  savedPlayers,
  onScoreUpdate,
  onPlayerStatUpdate,
  onAddFoul,
  onShotAttempt,
  onUndoScore,
  onRemovePlayer,
  onAddPlayer,
  onTogglePlayerCourtStatus,
  onSavePlayer,
  onDeleteSavedPlayer
}) => {
  const maxPlayersToShow = 15; // 每队最多显示15个球员

  return (
    <div className="space-y-6">
      {/* 上场人员区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OnCourtArea
          team={homeTeam}
          onTogglePlayerStatus={(playerId) => onTogglePlayerCourtStatus(homeTeam.id, playerId)}
          onScoreUpdate={onScoreUpdate}
          onPlayerStatUpdate={onPlayerStatUpdate}
          onAddFoul={onAddFoul}
          onShotAttempt={onShotAttempt}
          onUndoScore={onUndoScore}
        />
        <OnCourtArea
          team={awayTeam}
          onTogglePlayerStatus={(playerId) => onTogglePlayerCourtStatus(awayTeam.id, playerId)}
          onScoreUpdate={onScoreUpdate}
          onPlayerStatUpdate={onPlayerStatUpdate}
          onAddFoul={onAddFoul}
          onShotAttempt={onShotAttempt}
          onUndoScore={onUndoScore}
        />
      </div>

      {/* 球员管理区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TeamPlayerArea
          team={homeTeam}
          maxPlayersToShow={maxPlayersToShow}
          savedPlayers={savedPlayers}
          onAddPlayer={onAddPlayer}
          onTogglePlayerCourtStatus={onTogglePlayerCourtStatus}
          onRemovePlayer={onRemovePlayer}
          onSavePlayer={onSavePlayer}
          onDeleteSavedPlayer={onDeleteSavedPlayer}
        />
        <TeamPlayerArea
          team={awayTeam}
          maxPlayersToShow={maxPlayersToShow}
          savedPlayers={savedPlayers}
          onAddPlayer={onAddPlayer}
          onTogglePlayerCourtStatus={onTogglePlayerCourtStatus}
          onRemovePlayer={onRemovePlayer}
          onSavePlayer={onSavePlayer}
          onDeleteSavedPlayer={onDeleteSavedPlayer}
        />
      </div>
    </div>
  );
}; 
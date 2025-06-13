import React from 'react';
import { Player } from '../../types';
import { PlayerStats, PlayerActions } from '../Player';
import { OnCourtPlayerInfo } from './OnCourtPlayerInfo';

interface OnCourtPlayerCardProps {
  player: Player;
  teamColor: string;
  teamId: string;
  onScoreUpdate: (points: number) => void;
  onStatUpdate: (stat: string, value: number) => void;
  onAddFoul: () => void;
  onShotAttempt: (shotType: 'field' | 'three' | 'free') => void;
  onUndoScore: (scoreType: '1' | '2' | '3') => void;
  onToggleCourtStatus: () => void;
}

export const OnCourtPlayerCard: React.FC<OnCourtPlayerCardProps> = ({
  player,
  teamColor,
  onScoreUpdate,
  onStatUpdate,
  onAddFoul,
  onShotAttempt,
  onUndoScore,
  onToggleCourtStatus
}) => {
  return (
    <div className="border border-green-500 rounded-lg p-3 bg-green-50 hover:bg-white transition-colors">
      <OnCourtPlayerInfo 
        player={player} 
        teamColor={teamColor} 
        onToggleCourtStatus={onToggleCourtStatus} 
      />
      
      <PlayerStats player={player} />
      
      <PlayerActions
        player={player}
        onScoreUpdate={onScoreUpdate}
        onStatUpdate={onStatUpdate}
        onAddFoul={onAddFoul}
        onShotAttempt={onShotAttempt}
        onUndoScore={onUndoScore}
      />
    </div>
  );
}; 
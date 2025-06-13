import React from 'react';
import { Player } from '../../types';
import { PlayerInfo, PlayerStats, PlayerActions } from '../Player';

interface CompactPlayerCardProps {
  player: Player;
  teamColor: string;
  onScoreUpdate: (points: number) => void;
  onStatUpdate: (stat: string, value: number) => void;
  onAddFoul: () => void;
  onShotAttempt: (shotType: 'field' | 'three' | 'free') => void;
  onUndoScore: (scoreType: '1' | '2' | '3') => void;
  onRemove: () => void;
}

export const CompactPlayerCard: React.FC<CompactPlayerCardProps> = ({
  player,
  teamColor,
  onScoreUpdate,
  onStatUpdate,
  onAddFoul,
  onShotAttempt,
  onUndoScore,
  onRemove
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 hover:bg-white transition-colors">
      <PlayerInfo 
        player={player} 
        teamColor={teamColor} 
        onRemove={onRemove} 
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
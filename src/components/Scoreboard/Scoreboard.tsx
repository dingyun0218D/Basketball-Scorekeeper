import React from 'react';
import { Team } from '../../types';

interface ScoreboardProps {
  homeTeam: Team;
  awayTeam: Team;
  quarter: number;
  time: string;
  onScoreUpdate: (teamId: string, points: number) => void;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  homeTeam,
  awayTeam,
  quarter,
  time,
  onScoreUpdate,
}) => {
  const TeamSection: React.FC<{ team: Team; isHome: boolean }> = ({ team, isHome }) => (
    <div className={`team-section ${isHome ? 'order-1' : 'order-3'}`} style={{ backgroundColor: team.color + '20' }}>
      <div className="team-name" style={{ color: team.color }}>
        {team.name}
      </div>
      <div className="score-display" style={{ color: team.color }}>
        {team.score.toString().padStart(3, '0')}
      </div>
      <div className="flex justify-center space-x-2 mb-4">
        <button
          onClick={() => onScoreUpdate(team.id, 1)}
          className="btn btn-success btn-sm"
        >
          +1
        </button>
        <button
          onClick={() => onScoreUpdate(team.id, 2)}
          className="btn btn-success btn-md"
        >
          +2
        </button>
        <button
          onClick={() => onScoreUpdate(team.id, 3)}
          className="btn btn-success btn-lg"
        >
          +3
        </button>
      </div>
      <div className="text-center space-y-1">
        <div className="text-sm text-gray-600">
          犯规: {team.fouls}
        </div>
        <div className="text-sm text-gray-600">
          暂停: {team.timeouts}
        </div>
      </div>
    </div>
  );

  return (
    <div className="scoreboard">
      <div className="grid grid-cols-3 gap-4 p-6">
        <TeamSection team={homeTeam} isHome={true} />
        
        {/* 中央信息区域 */}
        <div className="order-2 flex flex-col justify-center items-center space-y-4">
          <div className="game-info">
            <div className="quarter-display">
              第 {quarter} 节
            </div>
            <div className="timer-display">
              {time}
            </div>
          </div>
          <div className="text-center text-sm text-gray-400">
            vs
          </div>
        </div>
        
        <TeamSection team={awayTeam} isHome={false} />
      </div>
    </div>
  );
}; 
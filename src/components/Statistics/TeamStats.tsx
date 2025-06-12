import React from 'react';
import { Team, Player } from '../../types';

interface TeamStatsProps {
  team: Team;
}

export const TeamStats: React.FC<TeamStatsProps> = ({ team }) => {
  // 计算团队统计数据
  const totalPoints = team.players.reduce((sum, player) => sum + player.points, 0);
  const totalRebounds = team.players.reduce((sum, player) => sum + player.rebounds, 0);
  const totalAssists = team.players.reduce((sum, player) => sum + player.assists, 0);
  const totalSteals = team.players.reduce((sum, player) => sum + player.steals, 0);
  const totalBlocks = team.players.reduce((sum, player) => sum + player.blocks, 0);
  const totalFouls = team.players.reduce((sum, player) => sum + player.fouls, 0);
  
  const totalFieldGoalAttempts = team.players.reduce((sum, player) => sum + player.fieldGoalsAttempted, 0);
  const totalFieldGoalMade = team.players.reduce((sum, player) => sum + player.fieldGoalsMade, 0);
  const totalThreePointAttempts = team.players.reduce((sum, player) => sum + player.threePointersAttempted, 0);
  const totalThreePointMade = team.players.reduce((sum, player) => sum + player.threePointersMade, 0);
  const totalFreeThrowAttempts = team.players.reduce((sum, player) => sum + player.freeThrowsAttempted, 0);
  const totalFreeThrowMade = team.players.reduce((sum, player) => sum + player.freeThrowsMade, 0);

  const fieldGoalPercentage = totalFieldGoalAttempts > 0 ? (totalFieldGoalMade / totalFieldGoalAttempts * 100).toFixed(1) : '0.0';
  const threePointPercentage = totalThreePointAttempts > 0 ? (totalThreePointMade / totalThreePointAttempts * 100).toFixed(1) : '0.0';
  const freeThrowPercentage = totalFreeThrowAttempts > 0 ? (totalFreeThrowMade / totalFreeThrowAttempts * 100).toFixed(1) : '0.0';

  // 找出表现最佳的球员
  const topScorer = team.players.reduce((prev, current) => 
    (current.points > prev.points) ? current : prev, team.players[0] || {} as Player
  );
  
  const topRebounder = team.players.reduce((prev, current) => 
    (current.rebounds > prev.rebounds) ? current : prev, team.players[0] || {} as Player
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4" style={{ color: team.color }}>
        {team.name} 团队统计
      </h3>
      
      {/* 基础统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="text-2xl font-bold text-blue-600">{totalPoints}</div>
          <div className="text-sm text-gray-600">总得分</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="text-2xl font-bold text-green-600">{totalRebounds}</div>
          <div className="text-sm text-gray-600">总篮板</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="text-2xl font-bold text-purple-600">{totalAssists}</div>
          <div className="text-sm text-gray-600">总助攻</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="text-2xl font-bold text-red-600">{totalFouls}</div>
          <div className="text-sm text-gray-600">总犯规</div>
        </div>
      </div>

      {/* 投篮统计 */}
      <div className="mb-6">
        <h4 className="text-md font-semibold mb-3">投篮统计</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">投篮命中率</div>
            <div className="text-lg font-bold">{fieldGoalPercentage}%</div>
            <div className="text-xs text-gray-500">{totalFieldGoalMade}/{totalFieldGoalAttempts}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded">
                            <div className="text-sm text-gray-600">3分命中率</div>
            <div className="text-lg font-bold">{threePointPercentage}%</div>
            <div className="text-xs text-gray-500">{totalThreePointMade}/{totalThreePointAttempts}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">罚球命中率</div>
            <div className="text-lg font-bold">{freeThrowPercentage}%</div>
            <div className="text-xs text-gray-500">{totalFreeThrowMade}/{totalFreeThrowAttempts}</div>
          </div>
        </div>
      </div>

      {/* 明星球员 */}
      {team.players.length > 0 && (
        <div>
          <h4 className="text-md font-semibold mb-3">明星球员</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
              <div className="text-sm text-yellow-700">得分王</div>
              <div className="text-lg font-bold">#{topScorer.number} {topScorer.name}</div>
              <div className="text-sm text-gray-600">{topScorer.points} 分</div>
            </div>
            <div className="p-3 bg-green-50 rounded border border-green-200">
              <div className="text-sm text-green-700">篮板王</div>
              <div className="text-lg font-bold">#{topRebounder.number} {topRebounder.name}</div>
              <div className="text-sm text-gray-600">{topRebounder.rebounds} 篮板</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 
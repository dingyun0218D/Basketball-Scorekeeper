import React, { useState } from 'react';
import { Team, Player, GameState } from '../../types';
import { GameEventsLog } from './GameEventsLog';

interface StatisticsAnalysisProps {
  gameState: GameState;
  onScoreUpdate: (teamId: string, points: number, playerId?: string) => void;
  onPlayerStatUpdate: (teamId: string, playerId: string, stat: string, value: number) => void;
  onAddFoul: (teamId: string, playerId: string) => void;
  onShotAttempt: (teamId: string, playerId: string, shotType: 'field' | 'three' | 'free') => void;
  onUndoScore: (teamId: string, playerId: string, scoreType: '1' | '2' | '3') => void;
  onRemovePlayer: (teamId: string, playerId: string) => void;
  onAddPlayer: (teamId: string) => void;
}

type ViewMode = 'overview' | 'players' | 'events';

export const StatisticsAnalysis: React.FC<StatisticsAnalysisProps> = ({
  gameState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onScoreUpdate,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onPlayerStatUpdate,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onAddFoul,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onShotAttempt,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onUndoScore,
  onRemovePlayer,
  onAddPlayer
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  
  const { homeTeam, awayTeam } = gameState;

  // 计算球队整体统计
  const calculateTeamStats = (team: Team) => {
    const onCourtPlayers = team.players.filter(p => p.isOnCourt);
    const allPlayers = team.players;
    
    const stats = allPlayers.reduce((acc, player) => {
      acc.totalPoints += player.points;
      acc.totalRebounds += player.rebounds;
      acc.totalAssists += player.assists;
      acc.totalSteals += player.steals;
      acc.totalBlocks += player.blocks;
      acc.totalFouls += player.fouls;
      acc.totalTurnovers += player.turnovers;
      acc.freeThrowsMade += player.freeThrowsMade;
      acc.freeThrowsAttempted += player.freeThrowsAttempted;
      acc.fieldGoalsMade += player.fieldGoalsMade;
      acc.fieldGoalsAttempted += player.fieldGoalsAttempted;
      acc.threePointersMade += player.threePointersMade;
      acc.threePointersAttempted += player.threePointersAttempted;
      // 计算2分投篮统计
      acc.twoPointersMade += (player.fieldGoalsMade - player.threePointersMade);
      acc.twoPointersAttempted += (player.fieldGoalsAttempted - player.threePointersAttempted);
      acc.totalPlusMinus += player.plusMinus;
      return acc;
    }, {
      totalPoints: 0,
      totalRebounds: 0,
      totalAssists: 0,
      totalSteals: 0,
      totalBlocks: 0,
      totalFouls: 0,
      totalTurnovers: 0,
      freeThrowsMade: 0,
      freeThrowsAttempted: 0,
      fieldGoalsMade: 0,
      fieldGoalsAttempted: 0,
      threePointersMade: 0,
      threePointersAttempted: 0,
      twoPointersMade: 0,
      twoPointersAttempted: 0,
      totalPlusMinus: 0
    });

    const onCourtPlusMinus = onCourtPlayers.reduce((sum, p) => sum + p.plusMinus, 0);

    // 计算球队真实命中率
    const teamTotalShots = stats.fieldGoalsAttempted + (0.44 * stats.freeThrowsAttempted);
    const teamTrueShootingPercentage = teamTotalShots > 0 ? 
      ((stats.totalPoints / (2 * teamTotalShots)) * 100).toFixed(1) : '0.0';

    return {
      ...stats,
      freeThrowPercentage: stats.freeThrowsAttempted > 0 ? (stats.freeThrowsMade / stats.freeThrowsAttempted * 100).toFixed(1) : '0.0',
      fieldGoalPercentage: stats.fieldGoalsAttempted > 0 ? (stats.fieldGoalsMade / stats.fieldGoalsAttempted * 100).toFixed(1) : '0.0',
      twoPointPercentage: stats.twoPointersAttempted > 0 ? (stats.twoPointersMade / stats.twoPointersAttempted * 100).toFixed(1) : '0.0',
      threePointPercentage: stats.threePointersAttempted > 0 ? (stats.threePointersMade / stats.threePointersAttempted * 100).toFixed(1) : '0.0',
      trueShootingPercentage: teamTrueShootingPercentage,
      onCourtPlayers: onCourtPlayers.length,
      currentPlusMinus: onCourtPlusMinus,
      averagePlusMinus: allPlayers.length > 0 ? (stats.totalPlusMinus / allPlayers.length).toFixed(1) : '0.0'
    };
  };

  // 计算球员效率值 (标准篮球统计)
  const calculatePlayerEfficiency = (player: Player) => {
    // 效率值 = 正面统计 - 负面统计
    // 正面: 得分 + 篮板 + 助攻 + 抢断 + 盖帽
    // 负面: 失误 + 犯规 + 投失 + 罚失
    const positiveStats = player.points + player.rebounds + player.assists + player.steals + player.blocks;
    const fieldGoalMisses = player.fieldGoalsAttempted - player.fieldGoalsMade;
    const freeThrowMisses = player.freeThrowsAttempted - player.freeThrowsMade;
    const negativeStats = player.turnovers + player.fouls + fieldGoalMisses + freeThrowMisses;
    
    return positiveStats - negativeStats;
  };

  // 计算真实命中率 (True Shooting Percentage)
  const calculateTrueShootingPercentage = (player: Player) => {
    // TS% = 得分 / (2 × (投篮出手 + 0.44 × 罚球出手)) × 100
    const totalShots = player.fieldGoalsAttempted + (0.44 * player.freeThrowsAttempted);
    if (totalShots === 0) return '0.0';
    
    const tsPercentage = (player.points / (2 * totalShots)) * 100;
    return tsPercentage.toFixed(1);
  };

  // 计算球员命中率
  const calculatePlayerPercentages = (player: Player) => {
    const twoPointersMade = player.fieldGoalsMade - player.threePointersMade;
    const twoPointersAttempted = player.fieldGoalsAttempted - player.threePointersAttempted;
    
    return {
      freeThrowPercentage: player.freeThrowsAttempted > 0 ? (player.freeThrowsMade / player.freeThrowsAttempted * 100).toFixed(1) : '0.0',
      fieldGoalPercentage: player.fieldGoalsAttempted > 0 ? (player.fieldGoalsMade / player.fieldGoalsAttempted * 100).toFixed(1) : '0.0',
      twoPointPercentage: twoPointersAttempted > 0 ? (twoPointersMade / twoPointersAttempted * 100).toFixed(1) : '0.0',
      threePointPercentage: player.threePointersAttempted > 0 ? (player.threePointersMade / player.threePointersAttempted * 100).toFixed(1) : '0.0',
      trueShootingPercentage: calculateTrueShootingPercentage(player)
    };
  };

  const homeStats = calculateTeamStats(homeTeam);
  const awayStats = calculateTeamStats(awayTeam);

  // 渲染整体统计概览
  const renderOverview = () => (
    <div className="space-y-6">
      {/* 比赛概况 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800">比赛概况</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 主队统计 */}
          <div className="text-center">
            <h4 className="text-lg font-semibold mb-3" style={{ color: homeTeam.color }}>
              {homeTeam.name}
            </h4>
            <div className="text-4xl font-bold mb-2" style={{ color: homeTeam.color }}>
              {homeTeam.score}
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div>犯规: {homeTeam.fouls}</div>
              <div>暂停: {homeTeam.timeouts}</div>
              <div>球员: {homeTeam.players.length}</div>
              <div>在场: {homeStats.onCourtPlayers}/5</div>
              <div className={`${homeStats.currentPlusMinus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                当前正负值: {homeStats.currentPlusMinus >= 0 ? '+' : ''}{homeStats.currentPlusMinus}
              </div>
            </div>
          </div>

          {/* 比分差距和胜负状态 */}
          <div className="text-center">
            <div className="text-lg font-medium text-gray-600 mb-2">比分差距</div>
            <div className="text-2xl font-bold text-gray-800 mb-2">
              {Math.abs(homeTeam.score - awayTeam.score)}
            </div>
            <div className="text-sm text-gray-600">
              {homeTeam.score > awayTeam.score ? 
                `${homeTeam.name} 领先` : 
                homeTeam.score < awayTeam.score ? 
                  `${awayTeam.name} 领先` : 
                  '比分平局'
              }
            </div>
          </div>

          {/* 客队统计 */}
          <div className="text-center">
            <h4 className="text-lg font-semibold mb-3" style={{ color: awayTeam.color }}>
              {awayTeam.name}
            </h4>
            <div className="text-4xl font-bold mb-2" style={{ color: awayTeam.color }}>
              {awayTeam.score}
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div>犯规: {awayTeam.fouls}</div>
              <div>暂停: {awayTeam.timeouts}</div>
              <div>球员: {awayTeam.players.length}</div>
              <div>在场: {awayStats.onCourtPlayers}/5</div>
              <div className={`${awayStats.currentPlusMinus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                当前正负值: {awayStats.currentPlusMinus >= 0 ? '+' : ''}{awayStats.currentPlusMinus}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 球队技术统计对比 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800">球队技术统计</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 主队统计 */}
          <div>
            <h4 className="text-lg font-semibold mb-3" style={{ color: homeTeam.color }}>
              {homeTeam.name}
            </h4>
            <div className="space-y-3">
              {/* 投篮效率统计 */}
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">投篮效率</h5>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                    <div className="font-medium text-gray-600">投篮命中率</div>
                    <div className="text-lg font-bold text-blue-700">{homeStats.fieldGoalPercentage}%</div>
                    <div className="text-xs text-gray-500">{homeStats.fieldGoalsMade}/{homeStats.fieldGoalsAttempted}</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded border-l-4 border-green-500">
                    <div className="font-medium text-gray-600">真实命中率</div>
                    <div className="text-lg font-bold text-green-700">{homeStats.trueShootingPercentage}%</div>
                    <div className="text-xs text-gray-500">TS%</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded border-l-4 border-purple-500">
                    <div className="font-medium text-gray-600">罚球命中率</div>
                    <div className="text-lg font-bold text-purple-700">{homeStats.freeThrowPercentage}%</div>
                    <div className="text-xs text-gray-500">{homeStats.freeThrowsMade}/{homeStats.freeThrowsAttempted}</div>
                  </div>
                </div>
              </div>
              
              {/* 分类投篮统计 */}
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">分类投篮</h5>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="font-medium text-gray-600">2分命中率</div>
                    <div className="text-lg font-bold">{homeStats.twoPointPercentage}%</div>
                    <div className="text-xs text-gray-500">{homeStats.twoPointersMade}/{homeStats.twoPointersAttempted}</div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded">
                    <div className="font-medium text-gray-600">3分命中率</div>
                    <div className="text-lg font-bold text-orange-700">{homeStats.threePointPercentage}%</div>
                    <div className="text-xs text-gray-500">{homeStats.threePointersMade}/{homeStats.threePointersAttempted}</div>
                  </div>
                </div>
              </div>
              
              {/* 基础数据统计 */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">基础数据</h5>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="font-bold text-blue-600">{homeStats.totalRebounds}</div>
                    <div className="text-xs text-gray-600">篮板</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="font-bold text-purple-600">{homeStats.totalAssists}</div>
                    <div className="text-xs text-gray-600">助攻</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="font-bold text-indigo-600">{homeStats.totalSteals}</div>
                    <div className="text-xs text-gray-600">抢断</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="font-bold text-teal-600">{homeStats.totalBlocks}</div>
                    <div className="text-xs text-gray-600">盖帽</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="font-bold text-red-600">{homeStats.totalTurnovers}</div>
                    <div className="text-xs text-gray-600">失误</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className={`font-bold ${homeStats.totalFouls >= 20 ? 'text-red-600' : 'text-yellow-600'}`}>{homeStats.totalFouls}</div>
                    <div className="text-xs text-gray-600">犯规</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="font-bold text-gray-600">{homeStats.totalPoints}</div>
                    <div className="text-xs text-gray-600">总得分</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 客队统计 */}
          <div>
            <h4 className="text-lg font-semibold mb-3" style={{ color: awayTeam.color }}>
              {awayTeam.name}
            </h4>
            <div className="space-y-3">
              {/* 投篮效率统计 */}
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">投篮效率</h5>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                    <div className="font-medium text-gray-600">投篮命中率</div>
                    <div className="text-lg font-bold text-blue-700">{awayStats.fieldGoalPercentage}%</div>
                    <div className="text-xs text-gray-500">{awayStats.fieldGoalsMade}/{awayStats.fieldGoalsAttempted}</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded border-l-4 border-green-500">
                    <div className="font-medium text-gray-600">真实命中率</div>
                    <div className="text-lg font-bold text-green-700">{awayStats.trueShootingPercentage}%</div>
                    <div className="text-xs text-gray-500">TS%</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded border-l-4 border-purple-500">
                    <div className="font-medium text-gray-600">罚球命中率</div>
                    <div className="text-lg font-bold text-purple-700">{awayStats.freeThrowPercentage}%</div>
                    <div className="text-xs text-gray-500">{awayStats.freeThrowsMade}/{awayStats.freeThrowsAttempted}</div>
                  </div>
                </div>
              </div>
              
              {/* 分类投篮统计 */}
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">分类投篮</h5>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="font-medium text-gray-600">2分命中率</div>
                    <div className="text-lg font-bold">{awayStats.twoPointPercentage}%</div>
                    <div className="text-xs text-gray-500">{awayStats.twoPointersMade}/{awayStats.twoPointersAttempted}</div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded">
                    <div className="font-medium text-gray-600">3分命中率</div>
                    <div className="text-lg font-bold text-orange-700">{awayStats.threePointPercentage}%</div>
                    <div className="text-xs text-gray-500">{awayStats.threePointersMade}/{awayStats.threePointersAttempted}</div>
                  </div>
                </div>
              </div>
              
              {/* 基础数据统计 */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">基础数据</h5>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="font-bold text-blue-600">{awayStats.totalRebounds}</div>
                    <div className="text-xs text-gray-600">篮板</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="font-bold text-purple-600">{awayStats.totalAssists}</div>
                    <div className="text-xs text-gray-600">助攻</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="font-bold text-indigo-600">{awayStats.totalSteals}</div>
                    <div className="text-xs text-gray-600">抢断</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="font-bold text-teal-600">{awayStats.totalBlocks}</div>
                    <div className="text-xs text-gray-600">盖帽</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="font-bold text-red-600">{awayStats.totalTurnovers}</div>
                    <div className="text-xs text-gray-600">失误</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className={`font-bold ${awayStats.totalFouls >= 20 ? 'text-red-600' : 'text-yellow-600'}`}>{awayStats.totalFouls}</div>
                    <div className="text-xs text-gray-600">犯规</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="font-bold text-gray-600">{awayStats.totalPoints}</div>
                    <div className="text-xs text-gray-600">总得分</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染单个球队的球员统计表格
  const renderTeamPlayerStats = (team: Team) => {
    const sortedPlayers = [...team.players].sort((a, b) => b.points - a.points);

    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* 球员管理 */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold" style={{ color: team.color }}>
            {team.name} - 球员统计 ({team.players.length}名球员)
          </h3>
          <button
            onClick={() => onAddPlayer(team.id)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium"
            disabled={team.players.length >= 15}
          >
            + 添加球员
          </button>
        </div>

        {/* 球员统计表格 */}
        {sortedPlayers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>暂无球员数据</p>
            <p className="text-sm mt-1">点击上方按钮添加球员</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 font-medium text-gray-600">球员</th>
                  <th className="text-center p-3 font-medium text-gray-600">得分</th>
                  <th className="text-center p-3 font-medium text-gray-600">篮板</th>
                  <th className="text-center p-3 font-medium text-gray-600">助攻</th>
                  <th className="text-center p-3 font-medium text-gray-600">抢断</th>
                  <th className="text-center p-3 font-medium text-gray-600">盖帽</th>
                  <th className="text-center p-3 font-medium text-gray-600">失误</th>
                  <th className="text-center p-3 font-medium text-gray-600">犯规</th>
                  <th className="text-center p-3 font-medium text-gray-600">投篮%</th>
                  <th className="text-center p-3 font-medium text-gray-600">真实%</th>
                  <th className="text-center p-3 font-medium text-gray-600">2分%</th>
                  <th className="text-center p-3 font-medium text-gray-600">3分%</th>
                  <th className="text-center p-3 font-medium text-gray-600">罚球%</th>
                  <th className="text-center p-3 font-medium text-gray-600">正负值</th>
                  <th className="text-center p-3 font-medium text-gray-600">效率值</th>
                  <th className="text-center p-3 font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {sortedPlayers.map((player, index) => {
                  const percentages = calculatePlayerPercentages(player);
                  const efficiency = calculatePlayerEfficiency(player);
                  const twoPointersMade = player.fieldGoalsMade - player.threePointersMade;
                  const twoPointersAttempted = player.fieldGoalsAttempted - player.threePointersAttempted;
                  return (
                    <tr key={player.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3">
                        <div className="flex items-center">
                          <div>
                            <div className="font-medium text-gray-800">
                              #{player.number} {player.name}
                              {player.isOnCourt && (
                                <span className="ml-1 inline-block w-2 h-2 bg-green-500 rounded-full" title="在场上"></span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">{player.position}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center p-3 font-bold" style={{ color: team.color }}>
                        {player.points}
                      </td>
                      <td className="text-center p-3">{player.rebounds}</td>
                      <td className="text-center p-3">{player.assists}</td>
                      <td className="text-center p-3">{player.steals}</td>
                      <td className="text-center p-3">{player.blocks}</td>
                      <td className="text-center p-3">
                        <span className={player.turnovers >= 5 ? 'text-red-600 font-bold' : ''}>
                          {player.turnovers}
                        </span>
                      </td>
                      <td className="text-center p-3">
                        <span className={player.fouls >= 5 ? 'text-red-600 font-bold' : ''}>
                          {player.fouls}
                        </span>
                      </td>
                      <td className="text-center p-3">
                        <div>{percentages.fieldGoalPercentage}%</div>
                        <div className="text-xs text-gray-500">
                          {player.fieldGoalsMade}/{player.fieldGoalsAttempted}
                        </div>
                      </td>
                      <td className="text-center p-3">
                        <div className="font-medium text-green-700">{percentages.trueShootingPercentage}%</div>
                        <div className="text-xs text-gray-500">TS%</div>
                      </td>
                      <td className="text-center p-3">
                        <div>{percentages.twoPointPercentage}%</div>
                        <div className="text-xs text-gray-500">
                          {twoPointersMade}/{twoPointersAttempted}
                        </div>
                      </td>
                      <td className="text-center p-3">
                        <div>{percentages.threePointPercentage}%</div>
                        <div className="text-xs text-gray-500">
                          {player.threePointersMade}/{player.threePointersAttempted}
                        </div>
                      </td>
                      <td className="text-center p-3">
                        <div>{percentages.freeThrowPercentage}%</div>
                        <div className="text-xs text-gray-500">
                          {player.freeThrowsMade}/{player.freeThrowsAttempted}
                        </div>
                      </td>
                      <td className="text-center p-3">
                        <span className={`font-medium ${
                          player.plusMinus > 0 ? 'text-green-600' : 
                          player.plusMinus < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {player.plusMinus > 0 ? '+' : ''}{player.plusMinus}
                        </span>
                        {player.isOnCourt && (
                          <div className="text-xs text-blue-500">在场</div>
                        )}
                      </td>
                      <td className="text-center p-3">
                        <span className={`font-medium ${
                          efficiency >= 15 ? 'text-green-600' : 
                          efficiency >= 10 ? 'text-blue-600' : 
                          efficiency >= 5 ? 'text-yellow-600' : 
                          efficiency >= 0 ? 'text-gray-600' : 'text-red-600'
                        }`}>
                          {efficiency}
                        </span>
                      </td>
                      <td className="text-center p-3">
                        <button
                          onClick={() => onRemovePlayer(team.id, player.id)}
                          className="text-red-500 hover:text-red-700 text-xs"
                          title="移除球员"
                        >
                          移除
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // 渲染球员详细统计（包含主客队）
  const renderPlayerStats = () => {
    return (
      <div className="space-y-6">
        {/* 主队球员统计 */}
        {renderTeamPlayerStats(homeTeam)}
        
        {/* 客队球员统计 */}
        {renderTeamPlayerStats(awayTeam)}
      </div>
    );
  };

  // 渲染事件记录
  const renderEvents = () => {
    return <GameEventsLog gameState={gameState} />;
  };

  return (
    <div className="space-y-6">
      {/* 视图切换 */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex space-x-4">
          <button
            onClick={() => setViewMode('overview')}
            className={`px-6 py-2 rounded font-medium transition-colors ${
              viewMode === 'overview'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            整体统计
          </button>
          <button
            onClick={() => setViewMode('players')}
            className={`px-6 py-2 rounded font-medium transition-colors ${
              viewMode === 'players'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            球员统计
          </button>
          <button
            onClick={() => setViewMode('events')}
            className={`px-6 py-2 rounded font-medium transition-colors ${
              viewMode === 'events'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            比赛记录
          </button>
        </div>
      </div>

      {/* 渲染对应内容 */}
      {viewMode === 'overview' && renderOverview()}
      {viewMode === 'players' && renderPlayerStats()}
      {viewMode === 'events' && renderEvents()}
    </div>
  );
}; 
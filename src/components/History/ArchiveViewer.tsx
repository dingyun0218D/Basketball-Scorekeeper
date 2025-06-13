import React from 'react';
import { GameState } from '../../types';
import { StatisticsAnalysis } from '../Statistics/StatisticsAnalysis';

interface ArchiveViewerProps {
  gameState: GameState;
  archiveName: string;
  onClose: () => void;
}

export const ArchiveViewer: React.FC<ArchiveViewerProps> = ({
  gameState,
  archiveName,
  onClose
}) => {
  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  const getTotalStats = (team: any) => {
    return team.players.reduce((acc: any, player: any) => {
      acc.points += player.points;
      acc.rebounds += player.rebounds;
      acc.assists += player.assists;
      acc.steals += player.steals;
      acc.blocks += player.blocks;
      acc.fouls += player.fouls;
      acc.turnovers += player.turnovers;
      return acc;
    }, {
      points: 0,
      rebounds: 0,
      assists: 0,
      steals: 0,
      blocks: 0,
      fouls: 0,
      turnovers: 0
    });
  };

  const homeStats = getTotalStats(gameState.homeTeam);
  const awayStats = getTotalStats(gameState.awayTeam);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-blue-600 to-red-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">{archiveName}</h2>
              <div className="text-sm opacity-90 space-x-4">
                <span>保存时间：{formatDateTime(gameState.updatedAt)}</span>
                <span>比赛状态：第{gameState.quarter}节 {gameState.time}</span>
                <span>事件数量：{gameState.events.length}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 比分概览 */}
          <div className="grid grid-cols-3 gap-8 items-center mt-6">
            <div className="text-center">
              <div className="text-lg opacity-90 font-medium">{gameState.homeTeam.name}</div>
              <div className="text-5xl font-bold my-2">{gameState.homeTeam.score}</div>
              <div className="text-sm opacity-75">犯规:{gameState.homeTeam.fouls} 暂停:{gameState.homeTeam.timeouts}</div>
            </div>

            <div className="text-center">
              <div className="text-lg font-medium opacity-75">VS</div>
              <div className="text-xl font-bold">
                {gameState.homeTeam.score > gameState.awayTeam.score ? 
                  `${gameState.homeTeam.name} 胜` : 
                  gameState.homeTeam.score < gameState.awayTeam.score ? 
                    `${gameState.awayTeam.name} 胜` : 
                    '平局'
                }
              </div>
              <div className="text-sm opacity-75">
                比分差距: {Math.abs(gameState.homeTeam.score - gameState.awayTeam.score)}
              </div>
            </div>

            <div className="text-center">
              <div className="text-lg opacity-90 font-medium">{gameState.awayTeam.name}</div>
              <div className="text-5xl font-bold my-2">{gameState.awayTeam.score}</div>
              <div className="text-sm opacity-75">犯规:{gameState.awayTeam.fouls} 暂停:{gameState.awayTeam.timeouts}</div>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-auto p-6">
          <StatisticsAnalysis
            gameState={gameState}
            onScoreUpdate={() => {}} // 只读模式，禁用所有操作
            onPlayerStatUpdate={() => {}}
            onAddFoul={() => {}}
            onShotAttempt={() => {}}
            onUndoScore={() => {}}
            onRemovePlayer={() => {}}
            onAddPlayer={() => {}}
          />
        </div>

        {/* 底部操作栏 */}
        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              这是一个只读的比赛存档，无法进行编辑操作
            </div>
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 
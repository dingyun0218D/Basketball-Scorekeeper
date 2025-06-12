import React from 'react';
import { Player } from '../../types';

interface DetailedPlayerCardProps {
  player: Player;
  teamColor: string;
  onScoreUpdate: (points: number) => void;
  onStatUpdate: (stat: string, value: number) => void;
  onAddFoul: () => void;
  onShotAttempt?: (shotType: 'field' | 'three' | 'free') => void;
  onRemove: () => void;
}

export const DetailedPlayerCard: React.FC<DetailedPlayerCardProps> = ({
  player,
  teamColor,
  onScoreUpdate,
  onStatUpdate,
  onAddFoul,
  onShotAttempt,
  onRemove
}) => {
  // 计算命中率
  const fieldGoalPercentage = player.fieldGoalsAttempted > 0 
    ? (player.fieldGoalsMade / player.fieldGoalsAttempted * 100).toFixed(1) 
    : '0.0';
  
  const threePointPercentage = player.threePointersAttempted > 0 
    ? (player.threePointersMade / player.threePointersAttempted * 100).toFixed(1) 
    : '0.0';
  
  const freeThrowPercentage = player.freeThrowsAttempted > 0 
    ? (player.freeThrowsMade / player.freeThrowsAttempted * 100).toFixed(1) 
    : '0.0';

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 border-l-4" style={{ borderLeftColor: teamColor }}>
      {/* 球员基本信息 */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold" style={{ color: teamColor }}>
            #{player.number} {player.name}
          </h3>
          <p className="text-sm text-gray-600">{player.position}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-800">{player.points}</div>
          <div className="text-xs text-gray-500">得分</div>
        </div>
      </div>

      {/* 得分快捷按钮 */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">得分操作</div>
        <div className="grid grid-cols-5 gap-2">
          <button
            onClick={() => onScoreUpdate(-1)}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-sm font-medium"
          >
            -1
          </button>
          {onShotAttempt && (
            <button
              onClick={() => onShotAttempt('field')}
              className="bg-gray-400 hover:bg-gray-500 text-white py-2 px-3 rounded text-sm font-medium"
              title="投篮不中"
            >
              +0
            </button>
          )}
          <button
            onClick={() => onScoreUpdate(1)}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded text-sm font-medium"
          >
            +1
          </button>
          <button
            onClick={() => onScoreUpdate(2)}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm font-medium"
          >
            +2
          </button>
          <button
            onClick={() => onScoreUpdate(3)}
            className="bg-green-700 hover:bg-green-800 text-white py-2 px-3 rounded text-sm font-medium"
          >
            +3
          </button>
        </div>
      </div>

      {/* 出手统计按钮 */}
      {onShotAttempt && (
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-2">出手统计</div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onShotAttempt('three')}
              className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-3 rounded text-sm font-medium"
            >
              3分不中
            </button>
            <button
              onClick={() => onShotAttempt('free')}
              className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 rounded text-sm font-medium"
            >
              罚球不中
            </button>
            <div className="text-center py-2 px-3 bg-gray-100 rounded text-sm">
              出手: {player.fieldGoalsAttempted}
            </div>
          </div>
        </div>
      )}

      {/* 基础统计 */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">基础统计</div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="font-bold text-blue-600">{player.rebounds}</div>
            <div className="text-gray-600">篮板</div>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded">
            <div className="font-bold text-purple-600">{player.assists}</div>
            <div className="text-gray-600">助攻</div>
          </div>
          <div className="text-center p-2 bg-indigo-50 rounded">
            <div className="font-bold text-indigo-600">{player.steals}</div>
            <div className="text-gray-600">抢断</div>
          </div>
          <div className="text-center p-2 bg-teal-50 rounded">
            <div className="font-bold text-teal-600">{player.blocks}</div>
            <div className="text-gray-600">盖帽</div>
          </div>
          <div className="text-center p-2 bg-yellow-50 rounded">
            <div className={`font-bold ${player.fouls >= 5 ? 'text-red-600' : 'text-yellow-600'}`}>
              {player.fouls}
            </div>
            <div className="text-gray-600">犯规</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-bold text-gray-600">
              {player.fieldGoalsMade + player.threePointersMade + player.freeThrowsMade}
            </div>
            <div className="text-gray-600">总命中</div>
          </div>
        </div>
      </div>

      {/* 投篮统计 */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">投篮统计</div>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span>投篮命中率</span>
            <span className="font-bold">{fieldGoalPercentage}%</span>
            <span className="text-gray-500">{player.fieldGoalsMade}/{player.fieldGoalsAttempted}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span>3分命中率</span>
            <span className="font-bold">{threePointPercentage}%</span>
            <span className="text-gray-500">{player.threePointersMade}/{player.threePointersAttempted}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span>罚球命中率</span>
            <span className="font-bold">{freeThrowPercentage}%</span>
            <span className="text-gray-500">{player.freeThrowsMade}/{player.freeThrowsAttempted}</span>
          </div>
        </div>
      </div>

      {/* 统计操作按钮 */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => onStatUpdate('rebounds', 1)}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-xs font-medium"
        >
          +篮板
        </button>
        <button
          onClick={() => onStatUpdate('assists', 1)}
          className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 rounded text-xs font-medium"
        >
          +助攻
        </button>
        <button
          onClick={() => onStatUpdate('steals', 1)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-3 rounded text-xs font-medium"
        >
          +抢断
        </button>
        <button
          onClick={() => onStatUpdate('blocks', 1)}
          className="bg-teal-500 hover:bg-teal-600 text-white py-2 px-3 rounded text-xs font-medium"
        >
          +盖帽
        </button>
      </div>

      {/* 其他操作 */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onAddFoul}
          className={`py-2 px-3 rounded text-xs font-medium ${
            player.fouls >= 5 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-yellow-500 hover:bg-yellow-600 text-white'
          }`}
        >
          +犯规 {player.fouls >= 5 && '(犯满)'}
        </button>
        <button
          onClick={onRemove}
          className="bg-gray-400 hover:bg-gray-500 text-white py-2 px-3 rounded text-xs font-medium"
        >
          移除球员
        </button>
      </div>
    </div>
  );
}; 
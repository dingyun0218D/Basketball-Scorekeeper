import React from 'react';
import { Player } from '../../types';

interface PlayerActionsProps {
  player: Player;
  onScoreUpdate: (points: number) => void;
  onStatUpdate: (stat: string, value: number) => void;
  onAddFoul: () => void;
  onShotAttempt: (shotType: 'field' | 'three' | 'free') => void;
  onUndoScore: (scoreType: '1' | '2' | '3') => void;
}

export const PlayerActions: React.FC<PlayerActionsProps> = ({
  player,
  onScoreUpdate,
  onStatUpdate,
  onAddFoul,
  onShotAttempt,
  onUndoScore,
}) => {
  return (
    <>
      {/* 得分按钮 */}
      <div className="grid grid-cols-3 gap-1 mb-1">
        <button
          onClick={() => onScoreUpdate(1)}
          className="bg-green-500 hover:bg-green-600 text-white py-0.5 px-1 rounded text-xs font-medium"
          title="罚球得分"
        >
          +1
        </button>
        <button
          onClick={() => onScoreUpdate(2)}
          className="bg-green-600 hover:bg-green-700 text-white py-0.5 px-1 rounded text-xs font-medium"
          title="2分得分"
        >
          +2
        </button>
        <button
          onClick={() => onScoreUpdate(3)}
          className="bg-green-700 hover:bg-green-800 text-white py-0.5 px-1 rounded text-xs font-medium"
          title="3分得分"
        >
          +3
        </button>
      </div>

      {/* 出手不中按钮 */}
      <div className="grid grid-cols-3 gap-1 mb-1">
        <button
          onClick={() => onShotAttempt('free')}
          className="bg-purple-500 hover:bg-purple-600 text-white py-0.5 px-1 rounded text-xs font-medium"
          title="罚球不中"
        >
          罚失
        </button>
        <button
          onClick={() => onShotAttempt('field')}
          className="bg-gray-500 hover:bg-gray-600 text-white py-0.5 px-1 rounded text-xs font-medium"
          title="2分投篮不中"
        >
          2失
        </button>
        <button
          onClick={() => onShotAttempt('three')}
          className="bg-orange-500 hover:bg-orange-600 text-white py-0.5 px-1 rounded text-xs font-medium"
          title="3分投篮不中"
        >
          3失
        </button>
      </div>

      {/* 撤销按钮和对应统计数据 */}
      <div className="grid grid-cols-3 gap-1 mb-2">
        <div className="text-center">
          <button
            onClick={() => onUndoScore('1')}
            className="bg-red-500 hover:bg-red-600 text-white py-0.5 px-1 rounded text-xs font-medium w-full"
            title="撤销1分"
          >
            -1
          </button>
          <div className="text-xs text-purple-600 font-bold mt-1">
            {player.freeThrowsMade}/{player.freeThrowsAttempted}
          </div>
        </div>
        <div className="text-center">
          <button
            onClick={() => onUndoScore('2')}
            className="bg-red-600 hover:bg-red-700 text-white py-0.5 px-1 rounded text-xs font-medium w-full"
            title="撤销2分"
          >
            -2
          </button>
          <div className="text-xs text-gray-600 font-bold mt-1">
            {player.fieldGoalsMade - player.threePointersMade}/{player.fieldGoalsAttempted - player.threePointersAttempted}
          </div>
        </div>
        <div className="text-center">
          <button
            onClick={() => onUndoScore('3')}
            className="bg-red-700 hover:bg-red-800 text-white py-0.5 px-1 rounded text-xs font-medium w-full"
            title="撤销3分"
          >
            -3
          </button>
          <div className="text-xs text-orange-600 font-bold mt-1">
            {player.threePointersMade}/{player.threePointersAttempted}
          </div>
        </div>
      </div>

      {/* 统计按钮和对应统计数据 - 6列布局，包含失误和犯规 */}
      <div className="grid grid-cols-6 gap-1 mb-1">
        <div className="text-center">
          <button
            onClick={() => onStatUpdate('rebounds', 1)}
            className="bg-blue-500 hover:bg-blue-600 text-white py-0.5 px-0.5 rounded text-xs font-medium w-full"
            title="篮板"
          >
            板
          </button>
          <div className="text-xs text-blue-600 font-bold mt-1">
            {player.rebounds}
          </div>
        </div>
        <div className="text-center">
          <button
            onClick={() => onStatUpdate('assists', 1)}
            className="bg-purple-500 hover:bg-purple-600 text-white py-0.5 px-0.5 rounded text-xs font-medium w-full"
            title="助攻"
          >
            助
          </button>
          <div className="text-xs text-purple-600 font-bold mt-1">
            {player.assists}
          </div>
        </div>
        <div className="text-center">
          <button
            onClick={() => onStatUpdate('steals', 1)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white py-0.5 px-0.5 rounded text-xs font-medium w-full"
            title="抢断"
          >
            断
          </button>
          <div className="text-xs text-indigo-600 font-bold mt-1">
            {player.steals}
          </div>
        </div>
        <div className="text-center">
          <button
            onClick={() => onStatUpdate('blocks', 1)}
            className="bg-teal-500 hover:bg-teal-600 text-white py-0.5 px-0.5 rounded text-xs font-medium w-full"
            title="盖帽"
          >
            帽
          </button>
          <div className="text-xs text-teal-600 font-bold mt-1">
            {player.blocks}
          </div>
        </div>
        <div className="text-center">
          <button
            onClick={() => onStatUpdate('turnovers', 1)}
            className="bg-red-500 hover:bg-red-600 text-white py-0.5 px-0.5 rounded text-xs font-medium w-full"
            title="失误"
          >
            失
          </button>
          <div className="text-xs text-red-600 font-bold mt-1">
            {player.turnovers}
          </div>
        </div>
        <div className="text-center">
          <button
            onClick={onAddFoul}
            className={`py-0.5 px-0.5 rounded text-xs font-medium w-full ${
              player.fouls >= 5 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-yellow-500 hover:bg-yellow-600 text-white'
            }`}
            title={`犯规`}
          >
            犯
          </button>
          <div className={`text-xs font-bold mt-1 ${
            player.fouls >= 5 ? 'text-red-600' : 'text-yellow-600'
          }`}>
            {player.fouls}
          </div>
        </div>
      </div>
    </>
  );
}; 
import React from 'react';
import { Player } from '../../types';

interface PlayerSyncConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  originalPlayer: Player;
  updatedPlayer: Player;
  conflictInfo?: {
    hasConflict: boolean;
    conflictingPlayers: Array<{
      teamName: string;
      player: Player;
    }>;
  };
}

export const PlayerSyncConfirmModal: React.FC<PlayerSyncConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  originalPlayer,
  updatedPlayer,
  conflictInfo
}) => {
  if (!isOpen) return null;

  const hasNumberChange = originalPlayer.number !== updatedPlayer.number;
  const hasNameChange = originalPlayer.name !== updatedPlayer.name;
  const hasPositionChange = originalPlayer.position !== updatedPlayer.position;
  const hasConflict = conflictInfo?.hasConflict || false;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            确认同步球员信息
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* 显示变更信息 */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">球员库信息已修改</h4>
            <div className="text-sm space-y-1">
              {hasNameChange && (
                <div>
                  <span className="text-gray-600">姓名：</span>
                  <span className="line-through text-gray-400">{originalPlayer.name}</span>
                  <span className="mx-2">→</span>
                  <span className="text-blue-600 font-medium">{updatedPlayer.name}</span>
                </div>
              )}
              {hasNumberChange && (
                <div>
                  <span className="text-gray-600">号码：</span>
                  <span className="line-through text-gray-400">#{originalPlayer.number}</span>
                  <span className="mx-2">→</span>
                  <span className="text-blue-600 font-medium">#{updatedPlayer.number}</span>
                </div>
              )}
              {hasPositionChange && (
                <div>
                  <span className="text-gray-600">位置：</span>
                  <span className="line-through text-gray-400">{originalPlayer.position}</span>
                  <span className="mx-2">→</span>
                  <span className="text-blue-600 font-medium">{updatedPlayer.position}</span>
                </div>
              )}
            </div>
          </div>

          {/* 冲突警告 */}
          {hasConflict && conflictInfo && (
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <h4 className="font-medium text-red-800 mb-2 flex items-center">
                <span className="mr-2">⚠️</span>
                号码冲突警告
              </h4>
              <p className="text-sm text-red-700 mb-2">
                新号码 #{updatedPlayer.number} 与同队球员冲突
              </p>
              <div className="space-y-1">
                {conflictInfo.conflictingPlayers.map((conflict, index) => (
                  <div key={index} className="text-sm bg-red-100 p-2 rounded">
                    <span className="font-medium">{conflict.teamName}</span>：
                    #{conflict.player.number} {conflict.player.name} ({conflict.player.position})
                  </div>
                ))}
              </div>
              <p className="text-sm text-red-700 mt-2 font-medium">
                这些球员将被自动移除以避免号码冲突。
              </p>
            </div>
          )}

          {/* 操作说明 */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">将执行以下操作：</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 同步队伍中所有相关球员的基础信息</li>
              <li>• 保留球员的比赛统计数据</li>
              {hasConflict && (
                <li className="text-red-600">• 移除有号码冲突的球员</li>
              )}
            </ul>
          </div>
        </div>

        {/* 按钮组 */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 text-white rounded-md transition-colors ${
              hasConflict 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {hasConflict ? '确认并移除冲突球员' : '确认同步'}
          </button>
        </div>
      </div>
    </div>
  );
}; 
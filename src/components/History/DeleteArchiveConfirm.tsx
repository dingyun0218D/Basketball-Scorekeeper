import React from 'react';
import { GameArchive } from '../../types';

interface DeleteArchiveConfirmProps {
  archive: GameArchive | null;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteArchiveConfirm: React.FC<DeleteArchiveConfirmProps> = ({
  archive,
  isOpen,
  onConfirm,
  onCancel
}) => {
  if (!isOpen || !archive) return null;

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  const gameState = archive.gameState;
  const isCompleted = archive.isCompleted;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* 头部 */}
        <div className="bg-red-500 text-white p-4 rounded-t-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-semibold">删除比赛存档</h3>
          </div>
        </div>

        {/* 内容 */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-800 mb-3">
              确定要删除存档 <span className="font-bold text-red-600">"{archive.name}"</span> 吗？
            </p>
            <p className="text-sm text-gray-600 mb-4">
              此操作不可恢复，存档中的所有比赛数据将永久丢失。
            </p>
          </div>

          {/* 存档详情 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-800 mb-3">存档详情</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">比赛队伍：</span>
                <span className="font-medium">
                  {gameState.homeTeam.name} vs {gameState.awayTeam.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">最终比分：</span>
                <span className="font-bold text-lg">
                  {gameState.homeTeam.score} - {gameState.awayTeam.score}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">比赛状态：</span>
                <span className={`font-medium ${isCompleted ? 'text-green-600' : 'text-yellow-600'}`}>
                  {isCompleted ? '已完成' : '进行中'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">比赛进度：</span>
                <span>第{gameState.quarter}节 {gameState.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">事件数量：</span>
                <span>{gameState.events.length} 个</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">保存时间：</span>
                <span>{formatDateTime(archive.savedAt)}</span>
              </div>
            </div>
          </div>

          {/* 警告信息 */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="text-sm text-red-700">
                <p className="font-medium">注意：</p>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  <li>删除后无法恢复存档数据</li>
                  <li>所有球员统计和比赛事件将丢失</li>
                  {!isCompleted && <li>如果比赛还在进行中，建议先完成比赛</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
}; 
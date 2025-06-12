import React, { useState } from 'react';
import { GameState, GameArchive } from '../../types';
import { useGame } from '../../contexts/GameContext';
import { 
  saveGameArchive, 
  getGameArchives, 
  loadGameArchive, 
  deleteGameArchive, 
  saveGameToHistory,
  getGameHistory 
} from '../../utils/storage';

interface GameHistoryProps {
  currentGame: GameState;
}

export const GameHistory: React.FC<GameHistoryProps> = ({ currentGame }) => {
  const { dispatch } = useGame();
  const [archives, setArchives] = useState<GameArchive[]>(getGameArchives());
  const [historyGames] = useState(getGameHistory());
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveGameName, setSaveGameName] = useState('');

  // 刷新存档列表
  const refreshArchives = () => {
    setArchives(getGameArchives());
  };

  // 保存当前比赛到存档
  const handleSaveGame = () => {
    if (currentGame.homeTeam.score === 0 && currentGame.awayTeam.score === 0 && currentGame.events.length === 0) {
      alert('比赛还未开始，无法保存到存档');
      return;
    }
    setShowSaveDialog(true);
    setSaveGameName(`${currentGame.homeTeam.name} vs ${currentGame.awayTeam.name}`);
  };

  // 确认保存
  const confirmSave = () => {
    try {
      saveGameArchive(currentGame, saveGameName);
      // 同时保存到历史记录
      saveGameToHistory(currentGame);
      refreshArchives();
      setShowSaveDialog(false);
      setSaveGameName('');
      alert('比赛已成功保存！');
    } catch (error) {
      alert('保存失败：' + (error as Error).message);
    }
  };

  // 加载存档继续比赛
  const handleLoadArchive = (archiveId: string) => {
    if (confirm('加载此存档将覆盖当前比赛数据，确定继续吗？')) {
      const gameState = loadGameArchive(archiveId);
      if (gameState) {
        dispatch({ type: 'LOAD_ARCHIVE', payload: gameState });
        alert('存档已加载，可以继续比赛！');
      } else {
        alert('加载存档失败');
      }
    }
  };

  // 删除存档
  const handleDeleteArchive = (archiveId: string, archiveName: string) => {
    if (confirm(`确定要删除存档"${archiveName}"吗？此操作不可恢复。`)) {
      deleteGameArchive(archiveId);
      refreshArchives();
      alert('存档已删除');
    }
  };

  // 格式化时间显示
  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('zh-CN'),
      time: date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="space-y-6">
      {/* 保存对话框 */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">保存比赛</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                存档名称
              </label>
              <input
                type="text"
                value={saveGameName}
                onChange={(e) => setSaveGameName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入存档名称"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={confirmSave}
                disabled={!saveGameName.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">比赛存档管理</h3>
          <button
            onClick={handleSaveGame}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>保存当前比赛</span>
          </button>
        </div>

        {/* 当前比赛信息 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold mb-3 text-gray-800">当前比赛状态</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">主队：</span>
              <span className="font-medium text-blue-600">{currentGame.homeTeam.name}</span>
            </div>
            <div>
              <span className="text-gray-600">客队：</span>
              <span className="font-medium text-red-600">{currentGame.awayTeam.name}</span>
            </div>
            <div>
              <span className="text-gray-600">比分：</span>
              <span className="font-bold text-lg">{currentGame.homeTeam.score} - {currentGame.awayTeam.score}</span>
            </div>
            <div>
              <span className="text-gray-600">状态：</span>
              <span className="font-medium">
                第{currentGame.quarter}节 {currentGame.time}
                {currentGame.isRunning && <span className="text-green-600 ml-1">● 进行中</span>}
                {currentGame.isPaused && <span className="text-yellow-600 ml-1">⏸ 暂停</span>}
                {!currentGame.isRunning && !currentGame.isPaused && <span className="text-gray-600 ml-1">⏹ 停止</span>}
              </span>
            </div>
          </div>
        </div>

        {/* 存档列表 */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-gray-800">
              已保存的比赛存档 ({archives.length})
            </h4>
            <button
              onClick={refreshArchives}
              className="text-blue-500 hover:text-blue-600 text-sm flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>刷新</span>
            </button>
          </div>

          {archives.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 text-lg">暂无保存的比赛存档</p>
              <p className="text-sm text-gray-400 mt-2">点击"保存当前比赛"来创建第一个存档</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {archives.map((archive) => {
                const { date, time } = formatDateTime(archive.savedAt);
                const gameState = archive.gameState;
                const isCompleted = archive.isCompleted;
                
                return (
                  <div key={archive.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h5 className="font-medium text-lg">{archive.name}</h5>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            isCompleted 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            {isCompleted ? '已完成' : '进行中'}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-6 mb-3">
                          <span className="font-medium text-blue-600">{gameState.homeTeam.name}</span>
                          <span className="text-2xl font-bold px-4 py-1 bg-gray-100 rounded">
                            {gameState.homeTeam.score} - {gameState.awayTeam.score}
                          </span>
                          <span className="font-medium text-red-600">{gameState.awayTeam.name}</span>
                        </div>
                        
                        <div className="text-sm text-gray-600 flex items-center space-x-4">
                          <span>📅 {date}</span>
                          <span>🕒 {time}</span>
                          <span>🏀 第{gameState.quarter}节 {gameState.time}</span>
                          <span>📊 {gameState.events.length}个事件</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleLoadArchive(archive.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm font-medium flex items-center space-x-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>继续比赛</span>
                        </button>
                        <button
                          onClick={() => handleDeleteArchive(archive.id, archive.name || '')}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm font-medium"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 历史记录（只读） */}
        {historyGames.length > 0 && (
          <div className="mt-8 pt-6 border-t">
            <h4 className="font-semibold text-gray-800 mb-4">
              历史比赛记录 ({historyGames.length})
            </h4>
            <div className="grid gap-3">
              {historyGames.slice(0, 10).map((game, index) => (
                <div key={game.id || index} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <span className="font-medium">{game.homeTeamName}</span>
                      <span className="font-bold text-lg">
                        {game.homeScore} - {game.awayScore}
                      </span>
                      <span className="font-medium">{game.awayTeamName}</span>
                    </div>
                    <div className="text-sm text-gray-600 flex items-center space-x-3">
                      <span>{game.date}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        game.isCompleted 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {game.isCompleted ? '已完成' : '未完成'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 
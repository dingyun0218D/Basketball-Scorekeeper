import React from 'react';

interface AppHeaderProps {
  collaborativeSessionId: string | null;
  homeTeamScore: number;
  awayTeamScore: number;
  onToggleCollaborativePanel: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  collaborativeSessionId,
  homeTeamScore,
  awayTeamScore,
  onToggleCollaborativePanel
}) => {
  // 处理协作按钮点击
  const handleCollaborativeButtonClick = () => {
    // 如果已连接，则不允许点击
    if (collaborativeSessionId) {
      return;
    }
    onToggleCollaborativePanel();
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            🏀 篮球计分器
          </h1>
          
          <div className="flex items-center space-x-4">
            {/* 协作状态指示器 */}
            {collaborativeSessionId && (
              <div className="flex items-center space-x-2 text-green-600 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>协作模式</span>
                <span className="font-mono text-xs">{collaborativeSessionId}</span>
              </div>
            )}
            
            {/* 协作按钮 */}
            <button
              onClick={handleCollaborativeButtonClick}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                collaborativeSessionId 
                  ? 'bg-green-100 text-green-700 cursor-default' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
              disabled={!!collaborativeSessionId}
            >
              {collaborativeSessionId ? '🔗 已连接' : '🔗 协作'}
            </button>
            
            {/* 比分显示 */}
            <div className="text-sm text-gray-600">
              {homeTeamScore} - {awayTeamScore}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}; 
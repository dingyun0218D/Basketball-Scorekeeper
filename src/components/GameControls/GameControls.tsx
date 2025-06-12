import React from 'react';

interface GameControlsProps {
  time: string;
  quarter: number;
  isRunning: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onNextQuarter: () => void;
  onReset: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  time,
  quarter,
  isRunning,
  isPaused,
  onStart,
  onPause,
  onResume,
  onStop,
  onNextQuarter,
  onReset,
}) => {
  const getTimerButtonText = () => {
    if (!isRunning && !isPaused) return '开始';
    if (isRunning) return '暂停';
    if (isPaused) return '继续';
    return '开始';
  };

  const handleTimerClick = () => {
    if (!isRunning && !isPaused) {
      onStart();
    } else if (isRunning) {
      onPause();
    } else if (isPaused) {
      onResume();
    }
  };

  return (
    <div className="control-panel">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">比赛控制</h3>
        
        {/* 时间和节次显示 */}
        <div className="mb-6">
          <div className="quarter-display">
            第 {quarter} 节
          </div>
          <div className="timer-display text-blue-600">
            {time}
          </div>
        </div>

        {/* 计时器控制按钮 */}
        <div className="flex justify-center space-x-3 mb-6">
          <button
            onClick={handleTimerClick}
            className={`btn ${isRunning ? 'btn-warning' : 'btn-success'} btn-lg`}
          >
            {getTimerButtonText()}
          </button>
          
          <button
            onClick={onStop}
            className="btn btn-danger btn-lg"
            disabled={!isRunning && !isPaused}
          >
            停止
          </button>
        </div>

        {/* 其他控制按钮 */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onNextQuarter}
            className="btn btn-primary btn-md"
            disabled={quarter >= 4}
          >
            下一节
          </button>
          
          <button
            onClick={onReset}
            className="btn btn-secondary btn-md"
          >
            重置比赛
          </button>
        </div>

        {/* 比赛状态指示 */}
        <div className="mt-4 text-sm text-gray-600">
          状态: {
            isRunning ? '进行中' : 
            isPaused ? '暂停' : 
            '未开始'
          }
        </div>
      </div>
    </div>
  );
}; 
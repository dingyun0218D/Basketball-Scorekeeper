import React from 'react';

interface TimerButtonsProps {
  isRunning: boolean;
  isPaused: boolean;
  quarter: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onNextQuarter: () => void;
  onReset: () => void;
}

export const TimerButtons: React.FC<TimerButtonsProps> = ({
  isRunning,
  isPaused,
  quarter,
  onStart,
  onPause,
  onResume,
  onStop,
  onNextQuarter,
  onReset
}) => {
  return (
    <div className="space-y-2">
      {/* 主要控制按钮 */}
      <div className="flex justify-center space-x-2">
        {/* 开始/暂停/继续按钮 */}
        <button
          onClick={isRunning ? onPause : isPaused ? onResume : onStart}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded text-sm font-medium text-white transition-colors"
        >
          {isRunning ? '⏸️ 暂停' : isPaused ? '▶️ 继续' : '▶️ 开始'}
        </button>
        
        {/* 停止按钮 - 重置时间到节时间 */}
        <button
          onClick={onStop}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded text-sm font-medium text-white transition-colors"
          disabled={!isRunning && !isPaused}
          title="停止计时并重置时间到每节时长"
        >
          ⏹️ 停止
        </button>
        
        {/* 下一节按钮 */}
        <button
          onClick={onNextQuarter}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded text-sm font-medium text-white transition-colors"
          disabled={quarter >= 4}
          title="进入下一节"
        >
          ⏭️ 下节
        </button>
      </div>
      
      {/* 重置按钮 - 单独一行，更醒目 */}
      <div className="flex justify-center">
        <button
          onClick={onReset}
          className="bg-red-500 bg-opacity-80 hover:bg-opacity-90 px-6 py-2 rounded text-sm font-medium text-white transition-colors border border-red-400"
          title="重置整场比赛"
        >
          🔄 重置比赛
        </button>
      </div>
    </div>
  );
}; 
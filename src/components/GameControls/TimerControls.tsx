import React from 'react';
import { TimeSettings } from './TimeSettings';

interface TimerControlsProps {
  quarter: number;
  time: string;
  quarterTime: string;
  isRunning: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onNextQuarter: () => void;
  onReset: () => void;
  onTimeChange: (time: string) => void;
  onQuarterTimeChange: (time: string) => void;
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  quarter,
  time,
  quarterTime,
  isRunning,
  isPaused,
  onStart,
  onPause,
  onResume,
  onStop,
  onNextQuarter,
  onReset,
  onTimeChange,
  onQuarterTimeChange
}) => {
  return (
    <div className="text-center">
      {/* 节数显示 */}
      <div className="text-lg opacity-90 font-medium mb-2">第 {quarter} 节</div>
      
      {/* 时间显示和设置 */}
      <div className="mb-3">
        <TimeSettings
          currentTime={time}
          quarterTime={quarterTime}
          isRunning={isRunning}
          onTimeChange={onTimeChange}
          onQuarterTimeChange={onQuarterTimeChange}
        />
      </div>
      
      {/* 控制按钮 */}
      <div className="flex justify-center space-x-2">
        {/* 开始/暂停/继续按钮 */}
        <button
          onClick={isRunning ? onPause : isPaused ? onResume : onStart}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded text-sm font-medium text-white transition-colors"
        >
          {isRunning ? '⏸️ 暂停' : isPaused ? '▶️ 继续' : '▶️ 开始'}
        </button>
        
        {/* 停止按钮 */}
        <button
          onClick={onStop}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded text-sm font-medium text-white transition-colors"
          disabled={!isRunning && !isPaused}
        >
          ⏹️ 停止
        </button>
        
        {/* 下一节按钮 */}
        <button
          onClick={onNextQuarter}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded text-sm font-medium text-white transition-colors"
          disabled={quarter >= 4}
        >
          ⏭️ 下节
        </button>
        
        {/* 重置按钮 */}
        <button
          onClick={onReset}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded text-sm font-medium text-white transition-colors"
        >
          🔄 重置
        </button>
      </div>
      
      {/* 状态提示 */}
      <div className="mt-2 text-xs opacity-75">
        {isRunning ? '⏱️ 计时进行中' : isPaused ? '⏸️ 已暂停' : '⏹️ 已停止'}
        {quarter > 4 && ' | 比赛结束'}
      </div>
    </div>
  );
}; 
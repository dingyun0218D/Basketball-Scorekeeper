import React from 'react';
import { TimeSettings } from './TimeSettings';
import { TimerButtons } from './TimerButtons';
import { TimerStatus } from './TimerStatus';

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
      <TimerButtons
        isRunning={isRunning}
        isPaused={isPaused}
        quarter={quarter}
        onStart={onStart}
        onPause={onPause}
        onResume={onResume}
        onStop={onStop}
        onNextQuarter={onNextQuarter}
        onReset={onReset}
      />
      
      {/* 状态提示和说明 */}
      <TimerStatus
        isRunning={isRunning}
        isPaused={isPaused}
        quarter={quarter}
      />
    </div>
  );
}; 
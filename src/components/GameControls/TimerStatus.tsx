import React from 'react';

interface TimerStatusProps {
  isRunning: boolean;
  isPaused: boolean;
  quarter: number;
}

export const TimerStatus: React.FC<TimerStatusProps> = ({
  isRunning,
  isPaused,
  quarter
}) => {
  return (
    <div className="mt-3 space-y-1">
      <div className="text-xs opacity-75">
        {isRunning ? '⏱️ 计时进行中' : isPaused ? '⏸️ 已暂停' : '⏹️ 已停止'}
        {quarter > 4 && ' | 比赛结束'}
      </div>
      <div className="text-xs opacity-60 text-center">
        <div>暂停：暂停计时 | 停止：重置到每节时长</div>
        <div>重置比赛：清空所有数据</div>
      </div>
    </div>
  );
}; 
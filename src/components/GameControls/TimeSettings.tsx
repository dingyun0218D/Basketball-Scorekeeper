import React, { useState } from 'react';
import { formatTime, parseTime } from '../../utils/gameUtils';

interface TimeSettingsProps {
  currentTime: string;
  quarterTime: string;
  isRunning: boolean;
  onTimeChange: (time: string) => void;
  onQuarterTimeChange: (time: string) => void;
}

export const TimeSettings: React.FC<TimeSettingsProps> = ({
  currentTime,
  quarterTime,
  isRunning,
  onTimeChange,
  onQuarterTimeChange
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [minutes, setMinutes] = useState(() => {
    const totalSeconds = parseTime(currentTime);
    return Math.floor(totalSeconds / 60);
  });
  const [seconds, setSeconds] = useState(() => {
    const totalSeconds = parseTime(currentTime);
    return totalSeconds % 60;
  });

  // 预设时间选项
  const presetTimes = [
    { label: '5分钟', value: '05:00' },
    { label: '10分钟', value: '10:00' },
    { label: '12分钟', value: '12:00' },
    { label: '15分钟', value: '15:00' },
    { label: '20分钟', value: '20:00' },
  ];

  const handlePresetTime = (time: string) => {
    onQuarterTimeChange(time); // 设置单节时间，这会同时更新当前时间
    const totalSeconds = parseTime(time);
    setMinutes(Math.floor(totalSeconds / 60));
    setSeconds(totalSeconds % 60);
    setShowSettings(false);
  };

  const handleCustomTime = () => {
    const totalSeconds = minutes * 60 + seconds;
    if (totalSeconds >= 0 && totalSeconds <= 60 * 60) { // 最多60分钟
      const newTime = formatTime(totalSeconds);
      onQuarterTimeChange(newTime); // 设置单节时间，这会同时更新当前时间
      setShowSettings(false);
    } else {
      alert('时间设置无效，请输入0-60分钟的范围');
    }
  };

  const handleMinutesChange = (value: number) => {
    if (value >= 0 && value <= 60) {
      setMinutes(value);
    }
  };

  const handleSecondsChange = (value: number) => {
    if (value >= 0 && value <= 59) {
      setSeconds(value);
    }
  };

  return (
    <div className="relative flex justify-center">
      {/* 时间显示和设置按钮 - 居中显示 */}
      <div className="flex items-center space-x-2">
        <div className="text-4xl font-mono font-bold text-white">
          {currentTime}
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          disabled={isRunning}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 disabled:bg-opacity-10 disabled:cursor-not-allowed px-3 py-1 rounded text-sm font-medium text-white transition-colors"
          title={isRunning ? '计时器运行时无法调整' : '调整时间'}
        >
          ⚙️
        </button>
      </div>

      {/* 设置面板 */}
      {showSettings && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-lg p-4 min-w-80 z-10">
          <div className="text-lg font-semibold text-gray-800 mb-3">时间设置</div>
          
          {/* 预设时间 */}
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700 mb-2">快速设置</div>
            <div className="grid grid-cols-3 gap-2">
              {presetTimes.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handlePresetTime(preset.value)}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* 自定义时间 */}
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700 mb-2">自定义时间</div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  value={minutes}
                  onChange={(e) => handleMinutesChange(parseInt(e.target.value) || 0)}
                  min="0"
                  max="60"
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                />
                <span className="text-gray-600">分</span>
              </div>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  value={seconds}
                  onChange={(e) => handleSecondsChange(parseInt(e.target.value) || 0)}
                  min="0"
                  max="59"
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                />
                <span className="text-gray-600">秒</span>
              </div>
              <button
                onClick={handleCustomTime}
                className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-sm font-medium transition-colors"
              >
                设置
              </button>
            </div>
          </div>

          {/* 当前设置显示 */}
          <div className="border-t pt-3">
            <div className="text-xs text-gray-500 space-y-1">
              <div>预览: {formatTime(minutes * 60 + seconds)}</div>
              <div>当前单节时间: {quarterTime}</div>
              <div className="text-blue-600">💡 设置后对每一节都生效</div>
            </div>
          </div>

          {/* 关闭按钮 */}
          <button
            onClick={() => setShowSettings(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-lg"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}; 
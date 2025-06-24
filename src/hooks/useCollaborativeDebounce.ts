import { useState, useEffect, useRef } from 'react';
import { GameState } from '../types';

/**
 * 协作专用的防抖hook
 * 可以过滤掉纯计时器更新，只对实际的游戏操作进行防抖
 */
export const useCollaborativeDebounce = (
  value: GameState | null, 
  delay: number,
  shouldSkipUpdate: (current: GameState | null, previous: GameState | null) => boolean = () => false
) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const previousValue = useRef<GameState | null>(value);

  useEffect(() => {
    // 如果应该跳过这次更新（比如纯计时器更新），则不进行防抖
    if (shouldSkipUpdate(value, previousValue.current)) {
      previousValue.current = value;
      return;
    }

    const handler = setTimeout(() => {
      setDebouncedValue(value);
      previousValue.current = value;
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay, shouldSkipUpdate]);

  return debouncedValue;
};

/**
 * 判断是否为纯计时器更新（只有时间字段变化）
 * @param current 当前状态
 * @param previous 前一个状态
 * @returns 是否为纯计时器更新
 */
export const isTimerOnlyUpdate = (current: GameState | null, previous: GameState | null): boolean => {
  if (!current || !previous) return false;

  // 创建不包含时间字段的状态对象进行比较
  const { time: currentTime, ...currentWithoutTime } = current;
  const { time: previousTime, ...previousWithoutTime } = previous;

  // 如果除了时间以外的所有字段都相同，则认为是纯计时器更新
  return (
    currentTime !== previousTime && 
    JSON.stringify(currentWithoutTime) === JSON.stringify(previousWithoutTime)
  );
}; 
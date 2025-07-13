import { useEffect, useRef } from 'react';
import { useGame } from './useGame';
import { parseTime, formatTime } from '../utils/gameUtils';

export const useGameTimer = () => {
  const { gameState, dispatch } = useGame();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (gameState && gameState.isRunning && !gameState.isPaused) {
      intervalRef.current = setInterval(() => {
        const currentSeconds = parseTime(gameState.time);
        
        if (currentSeconds > 0) {
          const newTime = formatTime(currentSeconds - 1);
          dispatch({ type: 'UPDATE_TIMER_TIME', payload: { time: newTime } });
        } else {
          // 时间到，自动暂停
          dispatch({ type: 'PAUSE_TIMER' });
          
          // 如果不是第4节，可以考虑自动进入下一节
          if (gameState.quarter < 4) {
            // 这里可以添加自动进入下一节的逻辑
            // 或者触发一个事件提醒用户
          }
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [gameState, gameState?.isRunning, gameState?.isPaused, gameState?.time, gameState?.quarter, dispatch]);

  const startTimer = () => {
    dispatch({ type: 'START_TIMER' });
  };

  const pauseTimer = () => {
    dispatch({ type: 'PAUSE_TIMER' });
  };

  const resumeTimer = () => {
    dispatch({ type: 'RESUME_TIMER' });
  };

  const stopTimer = () => {
    dispatch({ type: 'STOP_TIMER' });
  };

  const nextQuarter = () => {
    dispatch({ type: 'NEXT_QUARTER' });
  };

  const setTime = (time: string) => {
    dispatch({ type: 'UPDATE_TIME', payload: { time } });
  };

  return {
    time: gameState?.time || '15:00',
    quarter: gameState?.quarter || 1,
    isRunning: gameState?.isRunning || false,
    isPaused: gameState?.isPaused || false,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    nextQuarter,
    setTime,
  };
}; 
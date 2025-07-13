import React, { useReducer, useEffect, ReactNode } from 'react';
import { GameContext } from './GameContext';
import { gameReducer, initialGameState } from './GameContext';
import { saveCurrentGame } from '../utils/storage';

// Provider
interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);

  // 在事件驱动架构中，游戏状态的加载由EventDrivenGameProvider处理
  // 这里只保留基本的GameContext功能，主要用于向后兼容
  useEffect(() => {
    console.log('GameProvider: 初始化传统游戏上下文（仅用于向后兼容）');
    // 不再自动加载游戏状态，因为这会与事件驱动架构冲突
  }, []);

  // 调试输出当前状态
  useEffect(() => {
    console.log('GameProvider: 游戏状态更新', {
      hasHomeTeam: !!gameState?.homeTeam,
      hasAwayTeam: !!gameState?.awayTeam,
      homeTeamName: gameState?.homeTeam?.name,
      awayTeamName: gameState?.awayTeam?.name,
      quarter: gameState?.quarter,
      time: gameState?.time
    });
  }, [gameState]);

  // 自动保存游戏状态
  useEffect(() => {
    if (gameState.id !== initialGameState.id) {
      saveCurrentGame(gameState);
    }
  }, [gameState]);

  return (
    <GameContext.Provider value={{ gameState, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}; 
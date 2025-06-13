import React, { useReducer, useEffect, ReactNode } from 'react';
import { GameContext } from './GameContext';
import { gameReducer, initialGameState } from './GameContext';
import { saveCurrentGame, loadCurrentGame } from '../utils/storage';

// Provider
interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);

  // 加载保存的游戏状态
  useEffect(() => {
    console.log('GameProvider: 尝试加载保存的游戏状态');
    const savedGame = loadCurrentGame();
    if (savedGame) {
      console.log('GameProvider: 加载已保存的游戏状态', savedGame);
      dispatch({ type: 'LOAD_GAME', payload: savedGame });
    } else {
      console.log('GameProvider: 没有找到保存的游戏状态，使用初始状态');
    }
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
import { GameState, HistoryGame, GameArchive } from '../types';

const STORAGE_KEYS = {
  CURRENT_GAME: 'basketball-scorekeeper-current-game',
  GAME_HISTORY: 'basketball-scorekeeper-game-history',
  GAME_ARCHIVES: 'basketball-scorekeeper-game-archives',
  SETTINGS: 'basketball-scorekeeper-settings',
} as const;

// 保存当前比赛状态
export const saveCurrentGame = (gameState: GameState): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_GAME, JSON.stringify(gameState));
  } catch (error) {
    console.error('保存比赛状态失败:', error);
  }
};

// 加载当前比赛状态
export const loadCurrentGame = (): GameState | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_GAME);
    if (!saved) {
      return null;
    }
    
    const parsed = JSON.parse(saved);
    
    // 基本数据验证
    if (!parsed || typeof parsed !== 'object') {
      console.warn('loadCurrentGame: 保存的数据格式不正确');
      return null;
    }
    
    // 确保必要的字段存在
    if (!parsed.homeTeam || !parsed.awayTeam) {
      console.warn('loadCurrentGame: 缺少队伍信息');
      return null;
    }
    
    // 验证时间字段
    if (!parsed.time || typeof parsed.time !== 'string') {
      console.warn('loadCurrentGame: 时间字段不正确，使用默认值');
      parsed.time = '12:00';
    }
    
    if (!parsed.quarterTime || typeof parsed.quarterTime !== 'string') {
      console.warn('loadCurrentGame: 单节时间字段不正确，使用默认值');
      parsed.quarterTime = '12:00';
    }
    
    console.log('loadCurrentGame: 成功加载游戏状态', {
      id: parsed.id,
      time: parsed.time,
      quarterTime: parsed.quarterTime,
      quarter: parsed.quarter
    });
    
    return parsed;
  } catch (error) {
    console.error('加载比赛状态失败:', error);
    // 清除损坏的数据
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_GAME);
    } catch (e) {
      console.error('清除损坏数据失败:', e);
    }
    return null;
  }
};

// 清除当前比赛状态
export const clearCurrentGame = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_GAME);
  } catch (error) {
    console.error('清除比赛状态失败:', error);
  }
};

// 保存比赛到历史记录
export const saveGameToHistory = (gameState: GameState): void => {
  try {
    const historyGame: HistoryGame = {
      id: gameState.id,
      homeTeamName: gameState.homeTeam.name,
      awayTeamName: gameState.awayTeam.name,
      homeScore: gameState.homeTeam.score,
      awayScore: gameState.awayTeam.score,
      date: new Date(gameState.createdAt).toLocaleDateString('zh-CN'),
      duration: calculateGameDuration(gameState.createdAt, gameState.updatedAt),
      quarters: gameState.quarter,
      isCompleted: gameState.quarter >= 4 && !gameState.isRunning,
    };

    const history = getGameHistory();
    
    // 检查是否已存在相同ID的记录
    const existingIndex = history.findIndex(h => h.id === historyGame.id);
    if (existingIndex >= 0) {
      history[existingIndex] = historyGame; // 更新现有记录
    } else {
      history.unshift(historyGame); // 添加新记录到开头
    }
    
    // 只保留最近50场比赛
    const limitedHistory = history.slice(0, 50);
    
    localStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error('保存历史记录失败:', error);
  }
};

// 获取比赛历史记录
export const getGameHistory = (): HistoryGame[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.GAME_HISTORY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('加载历史记录失败:', error);
    return [];
  }
};

// 清除比赛历史记录
export const clearGameHistory = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.GAME_HISTORY);
  } catch (error) {
    console.error('清除历史记录失败:', error);
  }
};

// 保存完整的比赛存档
export const saveGameArchive = (gameState: GameState, name?: string): string => {
  try {
    const archive: GameArchive = {
      id: gameState.id,
      gameState: { ...gameState },
      savedAt: Date.now(),
      isCompleted: gameState.quarter >= 4 && !gameState.isRunning,
      name: name || `${gameState.homeTeam.name} vs ${gameState.awayTeam.name}`,
    };

    const archives = getGameArchives();
    
    // 检查是否已存在相同ID的存档
    const existingIndex = archives.findIndex(a => a.id === archive.id);
    if (existingIndex >= 0) {
      archives[existingIndex] = archive; // 更新现有存档
    } else {
      archives.unshift(archive); // 添加新存档到开头
    }
    
    // 只保留最近100个存档
    const limitedArchives = archives.slice(0, 100);
    
    localStorage.setItem(STORAGE_KEYS.GAME_ARCHIVES, JSON.stringify(limitedArchives));
    
    return archive.id;
  } catch (error) {
    console.error('保存比赛存档失败:', error);
    throw new Error('保存失败');
  }
};

// 获取所有比赛存档
export const getGameArchives = (): GameArchive[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.GAME_ARCHIVES);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('加载比赛存档失败:', error);
    return [];
  }
};

// 加载指定的比赛存档
export const loadGameArchive = (archiveId: string): GameState | null => {
  try {
    const archives = getGameArchives();
    const archive = archives.find(a => a.id === archiveId);
    return archive ? archive.gameState : null;
  } catch (error) {
    console.error('加载比赛存档失败:', error);
    return null;
  }
};

// 删除指定的比赛存档
export const deleteGameArchive = (archiveId: string): void => {
  try {
    const archives = getGameArchives();
    const filteredArchives = archives.filter(a => a.id !== archiveId);
    localStorage.setItem(STORAGE_KEYS.GAME_ARCHIVES, JSON.stringify(filteredArchives));
  } catch (error) {
    console.error('删除比赛存档失败:', error);
  }
};

// 设置接口
interface AppSettings {
  quarterDuration: number; // 单节时间（分钟）
  shotClockDuration: number; // 24秒规则
  soundEnabled: boolean;
  autoSave: boolean;
}

// 默认设置
const DEFAULT_SETTINGS: AppSettings = {
  quarterDuration: 12,
  shotClockDuration: 24,
  soundEnabled: true,
  autoSave: true,
};

// 保存设置
export const saveSettings = (settings: Partial<AppSettings>): void => {
  try {
    const currentSettings = getSettings();
    const newSettings = { ...currentSettings, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
  } catch (error) {
    console.error('保存设置失败:', error);
  }
};

// 获取设置
export const getSettings = (): AppSettings => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('加载设置失败:', error);
    return DEFAULT_SETTINGS;
  }
};

// 重置所有数据
export const resetAllData = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('重置数据失败:', error);
  }
};

// 导出数据为JSON
export const exportData = (): string => {
  const data = {
    currentGame: loadCurrentGame(),
    gameHistory: getGameHistory(),
    gameArchives: getGameArchives(),
    settings: getSettings(),
    exportTime: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
};

// 导入数据
export const importData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.currentGame) {
      saveCurrentGame(data.currentGame);
    }
    
    if (data.gameHistory && Array.isArray(data.gameHistory)) {
      localStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify(data.gameHistory));
    }
    
    if (data.gameArchives && Array.isArray(data.gameArchives)) {
      localStorage.setItem(STORAGE_KEYS.GAME_ARCHIVES, JSON.stringify(data.gameArchives));
    }
    
    if (data.settings) {
      saveSettings(data.settings);
    }
    
    return true;
  } catch (error) {
    console.error('导入数据失败:', error);
    return false;
  }
};

// 计算游戏持续时间的辅助函数
function calculateGameDuration(startTime: number, endTime: number): string {
  const duration = endTime - startTime;
  const totalMinutes = Math.floor(duration / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  }
  return `${minutes}分钟`;
} 
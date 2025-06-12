import { Player, Team, GameStats } from '../types';

// 生成唯一ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 格式化时间显示
export const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// 解析时间字符串为秒数
export const parseTime = (timeString: string): number => {
  // 参数验证
  if (!timeString || typeof timeString !== 'string') {
    console.warn('parseTime: 无效的时间字符串:', timeString);
    return 720; // 默认返回12分钟（720秒）
  }
  
  try {
    const parts = timeString.split(':');
    if (parts.length !== 2) {
      console.warn('parseTime: 时间格式不正确:', timeString);
      return 720; // 默认返回12分钟（720秒）
    }
    
    const [minutes, seconds] = parts.map(Number);
    
    // 验证数字是否有效
    if (isNaN(minutes) || isNaN(seconds)) {
      console.warn('parseTime: 时间包含非数字:', timeString);
      return 720; // 默认返回12分钟（720秒）
    }
    
    return minutes * 60 + seconds;
  } catch (error) {
    console.error('parseTime: 解析时间时出错:', error, timeString);
    return 720; // 默认返回12分钟（720秒）
  }
};

// 创建默认球员
export const createDefaultPlayer = (name: string, number: number, position: string): Player => ({
  id: generateId(),
  name,
  number,
  position,
  points: 0,
  rebounds: 0,
  assists: 0,
  steals: 0,
  blocks: 0,
  fouls: 0,
  fieldGoalsMade: 0,
  fieldGoalsAttempted: 0,
  threePointersMade: 0,
  threePointersAttempted: 0,
  freeThrowsMade: 0,
  freeThrowsAttempted: 0,
  isOnCourt: false, // 默认不在场上
  plusMinus: 0, // 正负值初始化为0
  timeOnCourt: 0, // 上场时间初始化为0
});

// 创建默认队伍
export const createDefaultTeam = (name: string, color: string): Team => ({
  id: generateId(),
  name,
  score: 0,
  fouls: 0,
  timeouts: 3,
  players: [],
  color,
});

// 计算球员投篮命中率
export const calculateFieldGoalPercentage = (made: number, attempted: number): number => {
  if (attempted === 0) return 0;
  return Math.round((made / attempted) * 100);
};

// 计算队伍统计数据
export const calculateTeamStats = (team: Team): GameStats => {
  const players = team.players;
  
  const totalFieldGoalsMade = players.reduce((sum, p) => sum + p.fieldGoalsMade, 0);
  const totalFieldGoalsAttempted = players.reduce((sum, p) => sum + p.fieldGoalsAttempted, 0);
  const totalThreePointersMade = players.reduce((sum, p) => sum + p.threePointersMade, 0);
  const totalThreePointersAttempted = players.reduce((sum, p) => sum + p.threePointersAttempted, 0);
  const totalFreeThrowsMade = players.reduce((sum, p) => sum + p.freeThrowsMade, 0);
  const totalFreeThrowsAttempted = players.reduce((sum, p) => sum + p.freeThrowsAttempted, 0);
  
  return {
    team,
    fieldGoalPercentage: calculateFieldGoalPercentage(totalFieldGoalsMade, totalFieldGoalsAttempted),
    threePointPercentage: calculateFieldGoalPercentage(totalThreePointersMade, totalThreePointersAttempted),
    freeThrowPercentage: calculateFieldGoalPercentage(totalFreeThrowsMade, totalFreeThrowsAttempted),
    totalRebounds: players.reduce((sum, p) => sum + p.rebounds, 0),
    totalAssists: players.reduce((sum, p) => sum + p.assists, 0),
    totalSteals: players.reduce((sum, p) => sum + p.steals, 0),
    totalBlocks: players.reduce((sum, p) => sum + p.blocks, 0),
    totalFouls: players.reduce((sum, p) => sum + p.fouls, 0),
    averagePoints: players.length > 0 ? Math.round(team.score / players.length * 10) / 10 : 0,
  };
};

// 验证队伍名称
export const validateTeamName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 20;
};

// 验证球员号码
export const validatePlayerNumber = (number: number, existingNumbers: number[]): boolean => {
  return number >= 0 && number <= 99 && !existingNumbers.includes(number);
};

// 格式化得分显示
export const formatScore = (score: number): string => {
  return score.toString().padStart(2, '0');
};

// 获取位置的中文名称
export const getPositionName = (position: string): string => {
  const positionMap: Record<string, string> = {
    'PG': '控球后卫',
    'SG': '得分后卫',
    'SF': '小前锋',
    'PF': '大前锋',
    'C': '中锋',
  };
  return positionMap[position] || position;
};

// 计算比赛进行时间
export const calculateGameDuration = (startTime: number, endTime?: number): string => {
  const duration = (endTime || Date.now()) - startTime;
  const totalMinutes = Math.floor(duration / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  }
  return `${minutes}分钟`;
}; 
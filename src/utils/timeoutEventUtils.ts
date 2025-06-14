import { GameEvent, Team } from '../types';
import { generateId } from './gameUtils';

// 创建暂停事件
export const createTimeoutEvent = (
  teamId: string,
  team: Team,
  quarter: number,
  time: string
): GameEvent => {
  return {
    id: generateId(),
    timestamp: Date.now(),
    quarter,
    time,
    type: 'timeout',
    teamId,
    description: `${team.name} 请求暂停`,
  };
};

// 更新队伍暂停数
export const updateTeamTimeouts = (team: Team): Team => {
  return { ...team, timeouts: team.timeouts - 1 };
};

// 检查是否还有暂停次数
export const hasTimeoutsRemaining = (team: Team): boolean => {
  return team.timeouts > 0;
}; 
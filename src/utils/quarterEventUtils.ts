import { GameEvent } from '../types';
import { generateId } from './gameUtils';

// 创建节次结束事件
export const createQuarterEndEvent = (
  quarter: number,
  time: string
): GameEvent => {
  return {
    id: generateId(),
    timestamp: Date.now(),
    quarter,
    time,
    type: 'other',
    teamId: '',
    description: `第${quarter}节结束`,
  };
}; 
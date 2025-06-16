import { GameEvent } from '../types';

export type EventFilter = 'all' | 'score' | 'foul' | 'timeout' | 'substitution' | 'rebound' | 'assist' | 'steal' | 'block' | 'turnover' | 'undo' | 'other';

// 事件过滤器选项配置
export const EVENT_FILTER_OPTIONS = [
  { value: 'all', label: '📊 全部事件', priority: 1 },
  { value: 'score', label: '🏀 得分事件', priority: 2 },
  { value: 'rebound', label: '🏀 篮板事件', priority: 3 },
  { value: 'assist', label: '🤝 助攻事件', priority: 4 },
  { value: 'steal', label: '🔐 抢断事件', priority: 5 },
  { value: 'block', label: '🚫 盖帽事件', priority: 6 },
  { value: 'turnover', label: '💥 失误事件', priority: 7 },
  { value: 'foul', label: '⚠️ 犯规事件', priority: 8 },
  { value: 'undo', label: '↩️ 撤销事件', priority: 9 },
  { value: 'timeout', label: '⏸️ 暂停事件', priority: 10 },
  { value: 'substitution', label: '🔄 换人事件', priority: 11 },
  { value: 'other', label: '📝 其他事件', priority: 12 }
] as const;

// 事件统计卡片配置
export const EVENT_STAT_CARDS = [
  { type: 'all', icon: '📊', name: '全部', bgColor: 'bg-gray-50', textColor: 'text-gray-800' },
  { type: 'score', icon: '🏀', name: '得分', bgColor: 'bg-green-50', textColor: 'text-green-600' },
  { type: 'rebound', icon: '🏀', name: '篮板', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
  { type: 'assist', icon: '🤝', name: '助攻', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
  { type: 'steal', icon: '🔐', name: '抢断', bgColor: 'bg-indigo-50', textColor: 'text-indigo-600' },
  { type: 'block', icon: '🚫', name: '盖帽', bgColor: 'bg-teal-50', textColor: 'text-teal-600' },
  { type: 'turnover', icon: '💥', name: '失误', bgColor: 'bg-orange-50', textColor: 'text-orange-600' },
  { type: 'foul', icon: '⚠️', name: '犯规', bgColor: 'bg-yellow-50', textColor: 'text-yellow-600' },
  { type: 'undo', icon: '↩️', name: '撤销', bgColor: 'bg-red-50', textColor: 'text-red-600' },
  { type: 'timeout', icon: '⏸️', name: '暂停', bgColor: 'bg-pink-50', textColor: 'text-pink-600' },
  { type: 'substitution', icon: '🔄', name: '换人', bgColor: 'bg-cyan-50', textColor: 'text-cyan-600' },
  { type: 'other', icon: '📝', name: '其他', bgColor: 'bg-gray-50', textColor: 'text-gray-600' }
] as const;

// 获取事件类型显示名称
export const getEventTypeName = (type: string): string => {
  const option = EVENT_FILTER_OPTIONS.find(opt => opt.value === type);
  return option ? option.label.split(' ')[1] : '其他';
};

// 过滤事件
export const filterEvents = (events: GameEvent[], filter: EventFilter): GameEvent[] => {
  if (filter === 'all') return events;
  return events.filter(event => event.type === filter);
};

// 排序事件
export const sortEvents = (events: GameEvent[], sortOrder: 'asc' | 'desc'): GameEvent[] => {
  return [...events].sort((a, b) => {
    const aTime = typeof a.timestamp === 'number' ? a.timestamp : a.timestamp.getTime();
    const bTime = typeof b.timestamp === 'number' ? b.timestamp : b.timestamp.getTime();
    
    return sortOrder === 'desc' 
      ? bTime - aTime 
      : aTime - bTime;
  });
};

// 获取事件统计数据
export const getEventStats = (events: GameEvent[]) => {
  return EVENT_STAT_CARDS.reduce((stats, card) => {
    stats[card.type] = card.type === 'all' 
      ? events.length 
      : events.filter(e => e.type === card.type).length;
    return stats;
  }, {} as Record<string, number>);
}; 
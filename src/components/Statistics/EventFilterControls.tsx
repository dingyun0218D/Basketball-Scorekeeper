import React from 'react';
import { GameEvent } from '../../types';

export type EventFilter = 'all' | 'score' | 'foul' | 'timeout' | 'substitution' | 'rebound' | 'assist' | 'steal' | 'block' | 'turnover' | 'undo' | 'other';

interface EventFilterControlsProps {
  filter: EventFilter;
  sortOrder: 'asc' | 'desc';
  onFilterChange: (filter: EventFilter) => void;
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  filteredEventsCount: number;
  totalEventsCount: number;
}

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

export const EventFilterControls: React.FC<EventFilterControlsProps> = ({
  filter,
  sortOrder,
  onFilterChange,
  onSortOrderChange,
  filteredEventsCount,
  totalEventsCount
}) => {
  return (
    <div className="flex flex-wrap gap-3 items-center justify-between">
      <div className="flex items-center gap-3">
        <select
          value={filter}
          onChange={(e) => onFilterChange(e.target.value as EventFilter)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {EVENT_FILTER_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={sortOrder}
          onChange={(e) => onSortOrderChange(e.target.value as 'asc' | 'desc')}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="desc">⬇️ 最新在前</option>
          <option value="asc">⬆️ 最旧在前</option>
        </select>
      </div>

      <div className="bg-blue-50 px-3 py-1.5 rounded-lg">
        <span className="text-sm text-blue-700 font-medium">
          {filteredEventsCount} / {totalEventsCount} 条记录
        </span>
      </div>
    </div>
  );
};

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
    return sortOrder === 'desc' 
      ? b.timestamp - a.timestamp 
      : a.timestamp - b.timestamp;
  });
}; 
import React from 'react';
import { GameEvent } from '../../types';

interface EventStatsCardsProps {
  events: GameEvent[];
}

// 事件统计卡片配置
const EVENT_STAT_CARDS = [
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

export const EventStatsCards: React.FC<EventStatsCardsProps> = ({ events }) => {
  // 计算各类型事件数量
  const getEventCount = (type: string) => {
    if (type === 'all') return events.length;
    return events.filter(e => e.type === type).length;
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {EVENT_STAT_CARDS.map(card => {
        const count = getEventCount(card.type);
        
        return (
          <div 
            key={card.type}
            className={`flex items-center space-x-2 ${card.bgColor} px-2 py-1.5 rounded-lg min-w-0`}
          >
            <span className="text-xs flex-shrink-0">{card.icon}</span>
            <span className={`text-sm font-medium ${card.textColor} flex-shrink-0`}>
              {count}
            </span>
            <span className="text-xs text-gray-600 truncate">
              {card.name}
            </span>
          </div>
        );
      })}
    </div>
  );
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
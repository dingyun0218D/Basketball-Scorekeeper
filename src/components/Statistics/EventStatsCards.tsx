import React from 'react';
import { GameEvent } from '../../types';
import { EVENT_STAT_CARDS } from '../../utils/eventFilterUtils';

interface EventStatsCardsProps {
  events: GameEvent[];
}

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
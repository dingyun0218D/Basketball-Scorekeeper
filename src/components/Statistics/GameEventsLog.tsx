import React, { useState } from 'react';
import { GameState } from '../../types';
import { EventFilterControls } from './EventFilterControls';
import { EventFilter, filterEvents, sortEvents, getEventTypeName } from '../../utils/eventFilterUtils';
import { EventStatsCards } from './EventStatsCards';
import { EventTextList } from './EventTextList';

interface GameEventsLogProps {
  gameState: GameState;
}

export const GameEventsLog: React.FC<GameEventsLogProps> = ({ gameState }) => {
  const [filter, setFilter] = useState<EventFilter>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 过滤和排序事件
  const filteredEvents = filterEvents(gameState.events, filter);
  const sortedEvents = sortEvents(filteredEvents, sortOrder);

  return (
    <div className="space-y-6">
      {/* 标题和统计 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">比赛事件记录</h3>
          <div className="text-sm text-gray-600">
            共 {gameState.events.length} 个事件
          </div>
        </div>

        {/* 事件统计概览 */}
        <EventStatsCards events={gameState.events} />

        {/* 过滤和排序控件 */}
        <EventFilterControls
          filter={filter}
          sortOrder={sortOrder}
          onFilterChange={setFilter}
          onSortOrderChange={setSortOrder}
          filteredEventsCount={filteredEvents.length}
          totalEventsCount={gameState.events.length}
        />
      </div>

      {/* 事件列表 - 使用新的文本框风格组件 */}
      {sortedEvents.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center text-gray-500">
          <div className="text-4xl mb-4">📝</div>
          <p>暂无{filter === 'all' ? '' : getEventTypeName(filter)}事件记录</p>
          <p className="text-sm text-gray-400 mt-2">比赛开始后，精彩瞬间将在这里实时显示</p>
        </div>
      ) : (
        <EventTextList events={sortedEvents} gameState={gameState} />
      )}
    </div>
  );
}; 
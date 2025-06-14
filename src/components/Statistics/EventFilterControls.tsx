import React from 'react';
import { EventFilter, EVENT_FILTER_OPTIONS } from '../../utils/eventFilterUtils';

interface EventFilterControlsProps {
  filter: EventFilter;
  sortOrder: 'asc' | 'desc';
  onFilterChange: (filter: EventFilter) => void;
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  filteredEventsCount: number;
  totalEventsCount: number;
}

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
import React, { useState } from 'react';
import { GameState } from '../../types';
import { EventTextList } from './EventTextList';

interface GameEventsLogProps {
  gameState: GameState;
}

type EventFilter = 'all' | 'score' | 'foul' | 'timeout' | 'substitution' | 'other';

export const GameEventsLog: React.FC<GameEventsLogProps> = ({ gameState }) => {
  const [filter, setFilter] = useState<EventFilter>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 过滤事件
  const filteredEvents = gameState.events.filter(event => {
    if (filter === 'all') return true;
    return event.type === filter;
  });

  // 排序事件
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    return sortOrder === 'desc' 
      ? b.timestamp - a.timestamp 
      : a.timestamp - b.timestamp;
  });

  // 获取事件类型显示名称
  const getEventTypeName = (type: string) => {
    switch (type) {
      case 'score': return '得分';
      case 'foul': return '犯规';
      case 'timeout': return '暂停';
      case 'substitution': return '换人';
      default: return '其他';
    }
  };

  // 统计不同类型事件的数量
  const eventStats = {
    all: gameState.events.length,
    score: gameState.events.filter(e => e.type === 'score').length,
    foul: gameState.events.filter(e => e.type === 'foul').length,
    timeout: gameState.events.filter(e => e.type === 'timeout').length,
    substitution: gameState.events.filter(e => e.type === 'substitution').length,
    other: gameState.events.filter(e => e.type === 'other').length,
  };

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

        {/* 事件统计概览 - 紧凑布局 */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
            <span className="text-xs">📊</span>
            <span className="text-sm font-medium text-gray-800">{eventStats.all}</span>
            <span className="text-xs text-gray-600">全部</span>
          </div>
          <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
            <span className="text-xs">🏀</span>
            <span className="text-sm font-medium text-green-600">{eventStats.score}</span>
            <span className="text-xs text-gray-600">得分</span>
          </div>
          <div className="flex items-center space-x-2 bg-yellow-50 px-3 py-2 rounded-lg">
            <span className="text-xs">⚠️</span>
            <span className="text-sm font-medium text-yellow-600">{eventStats.foul}</span>
            <span className="text-xs text-gray-600">犯规</span>
          </div>
          <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
            <span className="text-xs">⏸️</span>
            <span className="text-sm font-medium text-blue-600">{eventStats.timeout}</span>
            <span className="text-xs text-gray-600">暂停</span>
          </div>
          <div className="flex items-center space-x-2 bg-purple-50 px-3 py-2 rounded-lg">
            <span className="text-xs">🔄</span>
            <span className="text-sm font-medium text-purple-600">{eventStats.substitution}</span>
            <span className="text-xs text-gray-600">换人</span>
          </div>
          <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
            <span className="text-xs">📝</span>
            <span className="text-sm font-medium text-gray-600">{eventStats.other}</span>
            <span className="text-xs text-gray-600">其他</span>
          </div>
        </div>

        {/* 过滤和排序控件 - 紧凑布局 */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as EventFilter)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">📊 全部事件</option>
              <option value="score">🏀 得分事件</option>
              <option value="foul">⚠️ 犯规事件</option>
              <option value="timeout">⏸️ 暂停事件</option>
              <option value="substitution">🔄 换人事件</option>
              <option value="other">📝 其他事件</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="desc">⬇️ 最新在前</option>
              <option value="asc">⬆️ 最旧在前</option>
            </select>
          </div>

          <div className="bg-blue-50 px-3 py-1.5 rounded-lg">
            <span className="text-sm text-blue-700 font-medium">
              {filteredEvents.length} / {gameState.events.length} 条记录
            </span>
          </div>
        </div>
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
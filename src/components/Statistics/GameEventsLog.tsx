import React, { useState } from 'react';
import { GameEvent, GameState } from '../../types';

interface GameEventsLogProps {
  gameState: GameState;
}

type EventFilter = 'all' | 'score' | 'foul' | 'timeout' | 'substitution' | 'other';

export const GameEventsLog: React.FC<GameEventsLogProps> = ({ gameState }) => {
  const [filter, setFilter] = useState<EventFilter>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 获取球员名称
  const getPlayerName = (playerId: string, teamId: string) => {
    const team = teamId === gameState.homeTeam.id ? gameState.homeTeam : gameState.awayTeam;
    const player = team.players.find(p => p.id === playerId);
    return player ? `#${player.number} ${player.name}` : '未知球员';
  };

  // 获取队伍名称
  const getTeamName = (teamId: string) => {
    return teamId === gameState.homeTeam.id ? gameState.homeTeam.name : gameState.awayTeam.name;
  };

  // 获取队伍颜色
  const getTeamColor = (teamId: string) => {
    return teamId === gameState.homeTeam.id ? gameState.homeTeam.color : gameState.awayTeam.color;
  };

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

  // 格式化时间戳
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // 获取事件图标
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'score': return '🏀';
      case 'foul': return '⚠️';
      case 'timeout': return '⏸️';
      case 'substitution': return '🔄';
      default: return '📝';
    }
  };

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

  // 获取事件类型颜色
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'score': return 'text-green-600 bg-green-50';
      case 'foul': return 'text-yellow-600 bg-yellow-50';
      case 'timeout': return 'text-blue-600 bg-blue-50';
      case 'substitution': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
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

      {/* 事件列表 - 紧凑布局 */}
      <div className="bg-white rounded-lg shadow-lg">
        {sortedEvents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>暂无{filter === 'all' ? '' : getEventTypeName(filter)}事件记录</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            {/* 表头 */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-600">
                <div className="col-span-1">类型</div>
                <div className="col-span-2">时间</div>
                <div className="col-span-2">队伍</div>
                <div className="col-span-2">球员</div>
                <div className="col-span-4">事件描述</div>
                <div className="col-span-1 text-right">分数</div>
              </div>
            </div>
            
                         {/* 事件列表 */}
             <div className="max-h-[600px] overflow-y-auto">
              {sortedEvents.map((event, index) => (
                                 <div 
                   key={event.id} 
                   className={`px-4 py-2 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                     index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                   }`}
                 >
                  <div className="grid grid-cols-12 gap-2 items-center text-sm">
                    {/* 事件类型图标 */}
                    <div className="col-span-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getEventTypeColor(event.type)}`}>
                        <span className="text-xs">{getEventIcon(event.type)}</span>
                      </div>
                    </div>
                    
                    {/* 时间信息 */}
                    <div className="col-span-2 text-xs text-gray-600">
                      <div>第{event.quarter}节</div>
                      <div className="text-gray-500">{event.time}</div>
                    </div>
                    
                    {/* 队伍信息 */}
                    <div className="col-span-2">
                      <span 
                        className="inline-block px-2 py-1 rounded text-xs font-medium"
                        style={{ 
                          backgroundColor: getTeamColor(event.teamId) + '15',
                          color: getTeamColor(event.teamId),
                          border: `1px solid ${getTeamColor(event.teamId)}30`
                        }}
                      >
                        {getTeamName(event.teamId)}
                      </span>
                    </div>
                    
                    {/* 球员信息 */}
                    <div className="col-span-2 text-xs">
                      {event.playerId ? (
                        <span className="text-gray-700 font-medium">
                          {getPlayerName(event.playerId, event.teamId)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                    
                                         {/* 事件描述 */}
                     <div className="col-span-4 text-sm text-gray-900">
                       <span className="truncate block">{event.description}</span>
                     </div>
                    
                    {/* 分数变化 */}
                    <div className="col-span-1 text-right">
                      {event.points !== undefined ? (
                        <span className={`text-sm font-bold ${
                          event.points > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {event.points > 0 ? '+' : ''}{event.points}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* 底部统计信息 */}
            <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
              <div className="flex justify-between items-center text-xs text-gray-600">
                <span>共显示 {filteredEvents.length} 条记录</span>
                <span>实际发生时间：{formatTimestamp(Date.now())}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 
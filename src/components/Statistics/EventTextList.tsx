import React from 'react';
import { GameEvent, GameState } from '../../types';
import { generateFunEventDescription, generateTimeDescription } from '../../utils/eventDescriptions';

interface EventTextListProps {
  events: GameEvent[];
  gameState: GameState;
}

export const EventTextList: React.FC<EventTextListProps> = ({ events, gameState }) => {
  // 获取队伍颜色
  const getTeamColor = (teamId: string) => {
    return teamId === gameState.homeTeam.id ? gameState.homeTeam.color : gameState.awayTeam.color;
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

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="text-gray-400 text-4xl mb-4">📝</div>
        <p className="text-gray-500 text-lg">暂无比赛记录</p>
        <p className="text-gray-400 text-sm mt-2">比赛开始后，精彩瞬间将在这里实时显示</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* 标题栏 */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700 flex items-center">
            <span className="mr-2">📋</span>
            比赛实况记录
          </h4>
          <span className="text-xs text-gray-500">
            共 {events.length} 条记录
          </span>
        </div>
      </div>

      {/* 事件列表 */}
      <div className="p-4 max-h-[500px] overflow-y-auto">
        <div className="space-y-2 font-mono text-sm leading-relaxed">
          {events.map((event, index) => {
            const timeDesc = generateTimeDescription(event.quarter, event.time);
            const funDescription = generateFunEventDescription(event, gameState);
            const teamColor = getTeamColor(event.teamId);
            const icon = getEventIcon(event.type);
            
            return (
              <div
                key={event.id}
                className="flex items-start space-x-3 py-2 px-3 rounded-md hover:bg-gray-50 transition-colors"
              >
                {/* 序号 */}
                <span className="text-xs text-gray-400 font-normal w-6 text-right flex-shrink-0 mt-0.5">
                  {events.length - index}
                </span>
                
                {/* 图标 */}
                <span className="text-base flex-shrink-0 mt-0.5">
                  {icon}
                </span>
                
                {/* 时间 */}
                <span className="text-xs text-gray-500 w-20 flex-shrink-0 mt-0.5">
                  {timeDesc}
                </span>
                
                {/* 事件描述 */}
                <div className="flex-1 min-w-0">
                  <span className="text-gray-800">
                    {funDescription}
                  </span>
                  
                  {/* 分数变化 */}
                  {event.points !== undefined && event.points !== 0 && (
                    <span 
                      className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${
                        event.points > 0 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {event.points > 0 ? '+' : ''}{event.points}
                    </span>
                  )}
                  
                  {/* 队伍标识 */}
                  <span 
                    className="ml-2 px-2 py-0.5 rounded text-xs font-medium"
                    style={{ 
                      backgroundColor: teamColor + '15',
                      color: teamColor,
                      border: `1px solid ${teamColor}30`
                    }}
                  >
                    {gameState.homeTeam.id === event.teamId ? gameState.homeTeam.name : gameState.awayTeam.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 底部统计 */}
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 rounded-b-lg">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>
            最新记录：{events.length > 0 ? generateTimeDescription(events[0].quarter, events[0].time) : '-'}
          </span>
          <span>
            {events.filter(e => e.type === 'score').length} 次得分 · 
            {events.filter(e => e.type === 'foul').length} 次犯规 · 
            {events.filter(e => e.type === 'substitution').length} 次换人
          </span>
        </div>
      </div>
    </div>
  );
}; 
import React, { useState, useMemo } from 'react';
import { Player } from '../../types';
import { PlayerSearchBar } from './PlayerSearchBar';
import { PlayerListHeader } from './PlayerListHeader';
import { PlayerListItem } from './PlayerListItem';

interface PlayerListProps {
  players: Player[];
  teamColor: string;
  existingNumbers: number[];
  onSelectPlayer: (player: Player) => void;
  onSavePlayer: (player: Player) => void;
  onDeletePlayer: (playerId: string) => void;
}

export const PlayerList: React.FC<PlayerListProps> = ({
  players,
  teamColor,
  existingNumbers,
  onSelectPlayer,
  onSavePlayer,
  onDeletePlayer
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // 过滤球员列表
  const filteredPlayers = useMemo(() => {
    if (!searchTerm.trim()) {
      return players;
    }

    const term = searchTerm.toLowerCase().trim();
    return players.filter(player => 
      player.name.toLowerCase().includes(term) ||
      player.number.toString().includes(term) ||
      player.position.toLowerCase().includes(term)
    );
  }, [players, searchTerm]);

  if (players.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">👥</div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">暂无已保存的球员</h3>
        <p className="text-gray-500">
          点击"新增球员"标签页创建球员，并选择保存到球员库
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">
          选择球员加入队伍
        </h3>
        <p className="text-sm text-gray-500">
          点击球员行将其添加到队伍中
        </p>
      </div>
      
      {/* 搜索栏 */}
      <PlayerSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      {/* 搜索结果统计 */}
      {searchTerm && (
        <div className="text-sm text-gray-600">
          找到 {filteredPlayers.length} 个球员
          {filteredPlayers.length !== players.length && ` (共 ${players.length} 个)`}
        </div>
      )}
      
      {/* 表头 */}
      <PlayerListHeader />
      
      {/* 球员列表 */}
      <div className="space-y-2">
        {filteredPlayers.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">🔍</div>
            <p className="text-gray-500">没有找到匹配的球员</p>
            <p className="text-sm text-gray-400 mt-1">
              尝试搜索球员姓名、号码或位置
            </p>
          </div>
        ) : (
          filteredPlayers.map(player => (
            <PlayerListItem
              key={player.id}
              player={player}
              teamColor={teamColor}
              isNumberConflict={existingNumbers.includes(player.number)}
              onSelect={() => onSelectPlayer(player)}
              onSave={onSavePlayer}
              onDelete={() => onDeletePlayer(player.id)}
            />
          ))
        )}
      </div>
      
      {players.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">💡 使用提示</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 点击球员行可将球员添加到当前队伍</li>
            <li>• 使用搜索框快速查找球员</li>
            <li>• 红色背景表示号码冲突，需要修改球员号码或选择其他球员</li>
            <li>• 球员库中允许存在相同号码的不同球员</li>
            <li>• 同一队伍中不能有相同号码的球员</li>
            <li>• 可以编辑球员信息后重新保存</li>
          </ul>
        </div>
      )}
    </div>
  );
}; 
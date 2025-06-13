import React, { useState } from 'react';
import { Team } from '../../types';

interface TeamNameEditorProps {
  team: Team;
  onTeamNameUpdate: (teamId: string, newName: string) => void;
  side: 'home' | 'away';
}

export const TeamNameEditor: React.FC<TeamNameEditorProps> = ({
  team,
  onTeamNameUpdate,
  side: _side
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(team.name);

  const handleSave = () => {
    if (tempName.trim() && tempName.trim() !== team.name) {
      onTeamNameUpdate(team.id, tempName.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempName(team.name);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="text-center">
      {isEditing ? (
        <div className="space-y-2">
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onKeyDown={handleKeyPress}
            className="text-lg font-medium text-center bg-white/20 border border-white/30 rounded px-3 py-1 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
            placeholder="输入队名"
            maxLength={20}
            autoFocus
          />
          <div className="flex justify-center space-x-2">
            <button
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium"
            >
              保存
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs font-medium"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <div 
          className="cursor-pointer group"
          onClick={() => setIsEditing(true)}
        >
          <div className="text-lg opacity-90 font-medium group-hover:opacity-100 transition-opacity">
            {team.name}
            <span className="ml-1 text-xs opacity-0 group-hover:opacity-50 transition-opacity">
              ✏️
            </span>
          </div>
        </div>
      )}
    </div>
  );
}; 
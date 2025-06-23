import React, { useState } from 'react';
import { Player } from '../../types';
import { createDefaultPlayer, validatePlayerNumber, validatePlayerNumberForLibrary } from '../../utils/gameUtils';

interface AddPlayerFormProps {
  teamColor: string;
  existingNumbers: number[];
  onAddPlayer: (player: Player) => void;
  onSavePlayer: (player: Player) => void;
}

export const AddPlayerForm: React.FC<AddPlayerFormProps> = ({
  teamColor,
  existingNumbers,
  onAddPlayer,
  onSavePlayer
}) => {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [position, setPosition] = useState('PG');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = (isForLibrary: boolean = false) => {
    const newErrors: {[key: string]: string} = {};
    
    if (!name.trim()) {
      newErrors.name = '请输入球员姓名';
    }
    
    const playerNumber = parseInt(number);
    if (!number || isNaN(playerNumber)) {
      newErrors.number = '请输入有效的号码';
    } else if (isForLibrary) {
      // 保存到球员库时，只验证号码范围，允许重复
      if (!validatePlayerNumberForLibrary(playerNumber)) {
        newErrors.number = '号码必须在0-99之间';
      }
    } else {
      // 加入队伍时，验证号码范围和重复性
      if (!validatePlayerNumber(playerNumber, existingNumbers)) {
        newErrors.number = '号码无效或已存在';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddToTeam = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(false)) return;
    
    const newPlayer = createDefaultPlayer(name.trim(), parseInt(number), position);
    onAddPlayer(newPlayer);
    
    // 清空表单
    setName('');
    setNumber('');
    setPosition('PG');
    setErrors({});
  };

  const handleSaveToLibrary = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(true)) return;
    
    const newPlayer = createDefaultPlayer(name.trim(), parseInt(number), position);
    onSavePlayer(newPlayer);
    
    // 清空表单
    setName('');
    setNumber('');
    setPosition('PG');
    setErrors({});
    
    alert('球员已保存到球员库');
  };

  return (
    <div className="max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4" style={{ color: teamColor }}>
        新增球员
      </h3>
      
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            球员姓名 *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="请输入球员姓名"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            球员号码 *
          </label>
          <input
            type="number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.number ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0-99"
            min="0"
            max="99"
          />
          {errors.number && (
            <p className="mt-1 text-sm text-red-600">{errors.number}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            球员位置
          </label>
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="PG">控球后卫 (PG)</option>
            <option value="SG">得分后卫 (SG)</option>
            <option value="SF">小前锋 (SF)</option>
            <option value="PF">大前锋 (PF)</option>
            <option value="C">中锋 (C)</option>
          </select>
        </div>
        
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={handleAddToTeam}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md font-medium transition-colors"
            style={{ backgroundColor: teamColor }}
          >
            直接加入队伍
          </button>
          <button
            type="button"
            onClick={handleSaveToLibrary}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md font-medium transition-colors"
          >
            保存到球员库
          </button>
        </div>
      </form>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">💡 操作说明</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>直接加入队伍</strong>：创建球员并立即添加到当前队伍</li>
          <li>• <strong>保存到球员库</strong>：将球员保存到球员库，可在其他比赛中重复使用</li>
          <li>• <strong>号码规则</strong>：球员号码必须在0-99之间</li>
          <li>• <strong>队伍管理</strong>：同一队伍中不能有重复号码</li>
          <li>• <strong>球员库</strong>：球员库中允许存在相同号码的不同球员</li>
        </ul>
      </div>
    </div>
  );
}; 
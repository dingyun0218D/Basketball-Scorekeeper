import React, { useState } from 'react';
import { User, GameState, ServiceType } from '../../types';
import { useEventDrivenGameContext } from '../../hooks/useEventDrivenGameContext';

interface EventDrivenCollaborativeGameManagerProps {
  user: User;
  _initialGameState?: GameState;
  onSessionChange?: (sessionId: string | null) => void;
}

const EventDrivenCollaborativeGameManager: React.FC<EventDrivenCollaborativeGameManagerProps> = ({
  user,
  _initialGameState,
  onSessionChange
}) => {
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showServiceSwitchConfirm, setShowServiceSwitchConfirm] = useState(false);
  const [pendingServiceType, setPendingServiceType] = useState<ServiceType | null>(null);
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType>('leancloud');
  
  // 使用事件驱动游戏上下文
  const {
    sessionId,
    isConnected,
    error,
    setSessionId
  } = useEventDrivenGameContext();
  
  const handleServiceChange = (newServiceType: ServiceType) => {
    if (isConnected) {
      setPendingServiceType(newServiceType);
      setShowServiceSwitchConfirm(true);
    } else {
      setSelectedServiceType(newServiceType);
    }
  };

  const confirmServiceSwitch = () => {
    if (pendingServiceType) {
      setSelectedServiceType(pendingServiceType);
      setPendingServiceType(null);
    }
    setShowServiceSwitchConfirm(false);
  };

  const cancelServiceSwitch = () => {
    setPendingServiceType(null);
    setShowServiceSwitchConfirm(false);
  };

  const handleCreateSession = async () => {
    try {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      setSessionId(newSessionId);
      onSessionChange?.(newSessionId);
      console.log('✅ 创建事件驱动协作会话:', newSessionId);
    } catch (error) {
      console.error('❌ 创建会话失败:', error);
    }
  };

  const handleJoinSession = async () => {
    const inputSessionId = prompt('请输入会话ID:');
    if (inputSessionId?.trim()) {
      try {
        setSessionId(inputSessionId.trim());
        onSessionChange?.(inputSessionId.trim());
        console.log('✅ 加入事件驱动协作会话:', inputSessionId.trim());
      } catch (error) {
        console.error('❌ 加入会话失败:', error);
      }
    }
  };

  const handleLeaveSession = () => {
    setShowLeaveConfirm(true);
  };

  const confirmLeaveSession = () => {
    setSessionId('');
    onSessionChange?.(null);
    setShowLeaveConfirm(false);
    console.log('📤 离开事件驱动协作会话');
  };

  const cancelLeaveSession = () => {
    setShowLeaveConfirm(false);
  };

  return (
    <div className="collaborative-game-manager">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">🎯 事件驱动协作模式</h2>
        
        {/* 连接状态 */}
        <div className="mb-4">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            isConnected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isConnected ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
            {isConnected ? '已连接' : '未连接'}
          </div>
          
          {sessionId && (
            <div className="mt-2 text-sm text-gray-600">
              会话ID: <code className="bg-gray-100 px-2 py-1 rounded">{sessionId}</code>
            </div>
          )}
        </div>

        {/* 错误信息 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="text-red-600 text-sm">{error}</div>
          </div>
        )}

        {/* 服务选择 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            协作服务类型
          </label>
          <select
            value={selectedServiceType}
            onChange={(e) => handleServiceChange(e.target.value as ServiceType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isConnected}
          >
            <option value="leancloud">LeanCloud (推荐)</option>
            <option value="firebase">Firebase</option>
          </select>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-3">
          {!isConnected ? (
            <>
              <button
                onClick={handleCreateSession}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                创建新会话
              </button>
              <button
                onClick={handleJoinSession}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                加入现有会话
              </button>
            </>
          ) : (
            <button
              onClick={handleLeaveSession}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
            >
              离开会话
            </button>
          )}
        </div>

        {/* 用户信息 */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            当前用户: <span className="font-medium">{user.name}</span>
          </div>
        </div>
      </div>

      {/* 确认对话框 */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">确认离开</h3>
            <p className="text-gray-600 mb-4">确定要离开当前协作会话吗？</p>
            <div className="flex space-x-3">
              <button
                onClick={confirmLeaveSession}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
              >
                确认离开
              </button>
              <button
                onClick={cancelLeaveSession}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 服务切换确认对话框 */}
      {showServiceSwitchConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">切换服务</h3>
            <p className="text-gray-600 mb-4">
              切换服务将断开当前连接，确定要继续吗？
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmServiceSwitch}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                确认切换
              </button>
              <button
                onClick={cancelServiceSwitch}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDrivenCollaborativeGameManager; 
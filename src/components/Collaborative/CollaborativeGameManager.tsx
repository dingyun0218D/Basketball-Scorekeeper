import React, { useState, useEffect, useContext, useRef } from 'react';
import { useCollaborativeGame } from '../../hooks/useCollaborativeGame';
import { GameState, User } from '../../types';
import { GameContext } from '../../contexts/GameContext';
import { ConfirmModal } from '../common/ConfirmModal';
import { ServiceSelector } from './ServiceSelector';
import { 
  shouldSyncRemoteState, 
  shouldPushLocalState, 
  mergeGameStates, 
  logSyncOperation,
  normalizeTimestamp
} from '../../utils/collaborationSyncUtils';
import { useCollaborativeDebounce, isTimerOnlyUpdate } from '../../hooks/useCollaborativeDebounce';

interface CollaborativeGameManagerProps {
  user: User;
  initialGameState?: GameState;
  onSessionChange?: (sessionId: string | null) => void;
}

const CollaborativeGameManager: React.FC<CollaborativeGameManagerProps> = ({
  user,
  initialGameState,
  onSessionChange
}) => {
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
  const [joinSessionId, setJoinSessionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const lastSyncTime = useRef<number>(0);
  
  const gameContext = useContext(GameContext);
  if (!gameContext) {
    throw new Error('CollaborativeGameManager 必须在 GameProvider 内使用');
  }
  const { gameState: localGameState, dispatch } = gameContext;
  
  // 使用智能防抖处理，过滤纯计时器更新
  const debouncedLocalGameState = useCollaborativeDebounce(localGameState, 500, isTimerOnlyUpdate);
  
  const {
    gameState: collaborativeGameState,
    connectedUsers,
    isConnected,
    isHost,
    sessionId,
    createSession,
    joinSession,
    updateGameState,
    leaveSession,
    error,
    currentServiceType,
    availableServices,
    switchService
  } = useCollaborativeGame({
    user,
    initialGameState: initialGameState || localGameState
  });

  // 当会话ID变化时通知父组件
  useEffect(() => {
    onSessionChange?.(sessionId);
  }, [sessionId, onSessionChange]);

  // 同步协作状态到本地状态
  useEffect(() => {
    if (collaborativeGameState && isConnected && localGameState) {
      const collaborativeTime = normalizeTimestamp(collaborativeGameState.updatedAt);
      
      // 使用改进的时间戳比较逻辑
      if (shouldSyncRemoteState(localGameState.updatedAt, collaborativeGameState.updatedAt) && 
          collaborativeTime > lastSyncTime.current) {
        
        logSyncOperation('remote-to-local', localGameState.updatedAt, collaborativeGameState.updatedAt, '远程状态更新');
        
        lastSyncTime.current = collaborativeTime;
        const mergedState = mergeGameStates(localGameState, collaborativeGameState);
        dispatch({ type: 'SYNC_COLLABORATIVE_STATE', payload: mergedState });
      } else {
        logSyncOperation('skip', localGameState.updatedAt, collaborativeGameState.updatedAt, '无需同步远程状态');
      }
    }
  }, [collaborativeGameState, isConnected, dispatch, localGameState]);

  // 同步本地状态到协作状态（使用智能防抖后的状态）
  useEffect(() => {
    if (isConnected && sessionId && debouncedLocalGameState) {
      const localTime = normalizeTimestamp(debouncedLocalGameState.updatedAt);
      
      // 使用改进的推送逻辑
      if (shouldPushLocalState(
        debouncedLocalGameState.updatedAt, 
        collaborativeGameState?.updatedAt, 
        lastSyncTime.current
      )) {
        logSyncOperation('local-to-remote', debouncedLocalGameState.updatedAt, collaborativeGameState?.updatedAt, '推送本地状态');
        
        lastSyncTime.current = localTime;
        updateGameState(debouncedLocalGameState);
      } else {
        logSyncOperation('skip', debouncedLocalGameState.updatedAt, collaborativeGameState?.updatedAt, '无需推送本地状态');
      }
    }
  }, [debouncedLocalGameState, isConnected, sessionId, updateGameState, collaborativeGameState]);

  // 处理创建新会话
  const handleCreateSession = async () => {
    setIsLoading(true);
    try {
      const newSessionId = await createSession(localGameState);
      console.log('Created session:', newSessionId);
      setMode('select');
    } catch (err) {
      console.error('Failed to create session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理加入会话
  const handleJoinSession = async () => {
    if (!joinSessionId.trim()) return;
    
    setIsLoading(true);
    try {
      const success = await joinSession(joinSessionId.trim().toUpperCase());
      if (success) {
        setMode('select');
        setJoinSessionId('');
      }
    } catch (err) {
      console.error('Failed to join session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理离开会话
  const handleLeaveSession = () => {
    setShowLeaveConfirm(true);
  };

  // 确认离开会话
  const confirmLeaveSession = () => {
    leaveSession();
    setMode('select');
    setShowLeaveConfirm(false);
  };

  // 取消离开会话
  const cancelLeaveSession = () => {
    setShowLeaveConfirm(false);
  };

  // 如果已连接，显示连接状态
  if (isConnected && sessionId) {
    return (
      <>
        <div className="collaborative-game-manager p-4 border rounded-lg bg-green-50">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-800">
                实时协作模式 {isHost && '(主机)'}
              </h3>
              <p className="text-green-600">会话ID: {sessionId}</p>
            </div>
            
            {/* 右上角：服务选择器和离开按钮 */}
            <div className="flex items-start space-x-3">
              <div className="min-w-0">
                <ServiceSelector
                  currentService={currentServiceType}
                  availableServices={availableServices}
                  onServiceChange={switchService}
                  disabled={true} // 连接时禁用切换
                />
              </div>
              <button
                onClick={handleLeaveSession}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 whitespace-nowrap"
              >
                离开会话
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700">已连接</span>
            </div>
            
            <div className="text-sm text-gray-600">
              在线用户: {connectedUsers.map(u => u.name).join(', ')}
            </div>
          </div>

          {error && (
            <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* 离开会话确认弹窗 */}
        <ConfirmModal
          isOpen={showLeaveConfirm}
          title="离开协作会话"
          message="您确定要离开当前的协作会话吗？"
          details={[
            `会话ID：${sessionId}`,
            `在线用户：${connectedUsers.length}人`,
            `您的角色：${isHost ? '主机' : '参与者'}`
          ]}
          confirmText="离开会话"
          cancelText="取消"
          onConfirm={confirmLeaveSession}
          onCancel={cancelLeaveSession}
          type="warning"
        />
      </>
    );
  }

  // 未连接时显示模式选择界面
  return (
    <div className="collaborative-game-manager p-4 border rounded-lg bg-gray-50">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold flex-1">实时协作计分</h3>
        
        {/* 右上角：服务选择器 */}
        <div className="min-w-0">
          <ServiceSelector
            currentService={currentServiceType}
            availableServices={availableServices}
            onServiceChange={switchService}
            disabled={isLoading}
          />
        </div>
      </div>
      
      {mode === 'select' && (
        <div className="space-y-3">
          <p className="text-gray-600 text-sm">
            选择协作模式，与其他计分员实时同步比赛状态
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMode('create')}
              className="p-3 border border-blue-300 rounded-lg hover:bg-blue-50 text-center"
              disabled={isLoading}
            >
              <div className="text-blue-600 font-medium">创建新会话</div>
              <div className="text-xs text-gray-500 mt-1">
                成为主机，生成会话码
              </div>
            </button>
            
            <button
              onClick={() => setMode('join')}
              className="p-3 border border-green-300 rounded-lg hover:bg-green-50 text-center"
              disabled={isLoading}
            >
              <div className="text-green-600 font-medium">加入会话</div>
              <div className="text-xs text-gray-500 mt-1">
                输入会话码参与计分
              </div>
            </button>
          </div>
        </div>
      )}

      {mode === 'create' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">创建新会话</h4>
            <button
              onClick={() => setMode('select')}
              className="text-gray-500 hover:text-gray-700"
            >
              返回
            </button>
          </div>
          
          <p className="text-sm text-gray-600">
            将使用当前比赛状态创建新的协作会话
          </p>
          
          <button
            onClick={handleCreateSession}
            disabled={isLoading}
            className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? '创建中...' : '创建会话'}
          </button>
        </div>
      )}

      {mode === 'join' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">加入会话</h4>
            <button
              onClick={() => setMode('select')}
              className="text-gray-500 hover:text-gray-700"
            >
              返回
            </button>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              会话ID
            </label>
            <input
              type="text"
              value={joinSessionId}
              onChange={(e) => setJoinSessionId(e.target.value.toUpperCase())}
              placeholder="输入6位会话码 (如: ABC123)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              maxLength={6}
            />
          </div>
          
          <button
            onClick={handleJoinSession}
            disabled={isLoading || !joinSessionId.trim()}
            className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {isLoading ? '加入中...' : '加入会话'}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default CollaborativeGameManager; 
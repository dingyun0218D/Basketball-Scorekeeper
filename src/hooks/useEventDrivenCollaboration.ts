import { useState, useCallback } from 'react';
import { User } from '../types';
import { useEventDrivenGameContext } from './useEventDrivenGameContext';

export const useEventDrivenCollaboration = () => {
  const { sessionId, setSessionId, isConnected, error } = useEventDrivenGameContext();
  
  // 协作面板状态
  const [showCollaborativePanel, setShowCollaborativePanel] = useState(false);
  
  // 用户信息（从上下文中获取或生成）
  const [user] = useState<User>(() => ({
    id: `user_${Math.random().toString(36).substring(2, 10)}`,
    name: `计分员${Math.random().toString(36).substring(2, 4).toUpperCase()}`
  }));

  // 处理协作会话变化
  const handleSessionChange = useCallback((newSessionId: string | null) => {
    if (newSessionId) {
      console.log('🔗 加入协作会话:', newSessionId);
      setSessionId(newSessionId);
    } else {
      console.log('📤 离开协作会话');
      setSessionId('');
    }
  }, [setSessionId]);

  // 切换协作面板显示
  const toggleCollaborativePanel = useCallback(() => {
    setShowCollaborativePanel(!showCollaborativePanel);
  }, [showCollaborativePanel]);

  // 创建新的协作会话
  const createSession = useCallback(() => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    handleSessionChange(newSessionId);
    return newSessionId;
  }, [handleSessionChange]);

  // 加入现有会话
  const joinSession = useCallback((sessionIdToJoin: string) => {
    handleSessionChange(sessionIdToJoin);
  }, [handleSessionChange]);

  // 离开当前会话
  const leaveSession = useCallback(() => {
    handleSessionChange(null);
  }, [handleSessionChange]);

  return {
    // 用户信息
    user,
    
    // 会话状态
    collaborativeSessionId: sessionId,
    isConnected,
    error,
    
    // 面板状态
    showCollaborativePanel,
    setShowCollaborativePanel,
    
    // 操作方法
    handleSessionChange,
    toggleCollaborativePanel,
    createSession,
    joinSession,
    leaveSession,
  };
}; 
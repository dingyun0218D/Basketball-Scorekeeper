import { useState } from 'react';
import { User } from '../types';

export const useCollaboration = () => {
  // 实时协作相关状态
  const [user] = useState<User>(() => ({
    id: `user_${Math.random().toString(36).substring(2, 10)}`,
    name: `计分员${Math.random().toString(36).substring(2, 4).toUpperCase()}`
  }));
  const [collaborativeSessionId, setCollaborativeSessionId] = useState<string | null>(null);
  const [showCollaborativePanel, setShowCollaborativePanel] = useState(false);

  // 处理协作会话变化
  const handleSessionChange = (sessionId: string | null) => {
    setCollaborativeSessionId(sessionId);
    if (sessionId) {
      console.log('已加入协作会话:', sessionId);
    } else {
      console.log('已离开协作会话');
    }
  };

  // 切换协作面板显示
  const toggleCollaborativePanel = () => {
    setShowCollaborativePanel(!showCollaborativePanel);
  };

  return {
    user,
    collaborativeSessionId,
    showCollaborativePanel,
    setShowCollaborativePanel,
    handleSessionChange,
    toggleCollaborativePanel,
  };
}; 
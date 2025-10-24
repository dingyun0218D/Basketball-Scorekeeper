import { CollaborativeService } from '../types';
import type { GameState, GameEvent, Team, Player } from '../types';
import { tablestoreConfig } from '../config/tablestore';
import { wsClient, WSMessageType } from './tablestoreWebSocketClient';

/**
 * 创建默认球员数据
 */
const createDefaultPlayer = (id: string, name: string, number: number): Player => ({
  id,
  name,
  number,
  position: '',
  points: 0,
  rebounds: 0,
  assists: 0,
  steals: 0,
  blocks: 0,
  fouls: 0,
  turnovers: 0,
  fieldGoalsMade: 0,
  fieldGoalsAttempted: 0,
  threePointersMade: 0,
  threePointersAttempted: 0,
  freeThrowsMade: 0,
  freeThrowsAttempted: 0,
  isOnCourt: false,
  plusMinus: 0,
  timeOnCourt: 0
});

/**
 * 创建默认队伍数据
 */
const createDefaultTeam = (id: string, name: string, color: string): Team => ({
  id,
  name,
  score: 0,
  fouls: 0,
  timeouts: 3,
  players: [],
  color
});

/**
 * 验证并修复游戏状态
 * 确保所有必需字段都存在且类型正确
 */
const validateAndFixGameState = (state: GameState | null): GameState | null => {
  if (!state) {
    console.warn('⚠️ 游戏状态为空');
    return null;
  }

  try {
    // 深拷贝，避免修改原对象
    const fixedState: GameState = { ...state };
    let hasChanges = false;

    // 修复缺失的基本字段
    if (!fixedState.id) {
      fixedState.id = `game_${Date.now()}`;
      hasChanges = true;
      console.warn('⚠️ 修复缺失的游戏ID');
    }

    // 修复主队数据
    if (!fixedState.homeTeam || typeof fixedState.homeTeam.score !== 'number') {
      const teamName = fixedState.homeTeam?.name || '主队';
      const teamId = fixedState.homeTeam?.id || 'home';
      const teamColor = fixedState.homeTeam?.color || '#ef4444';
      fixedState.homeTeam = createDefaultTeam(teamId, teamName, teamColor);
      
      // 尝试恢复原有的球员数据
      if (state.homeTeam?.players && Array.isArray(state.homeTeam.players)) {
        fixedState.homeTeam.players = state.homeTeam.players;
      }
      
      hasChanges = true;
      console.warn('⚠️ 修复缺失的主队数据');
    } else {
      // 确保球员数组存在
      if (!Array.isArray(fixedState.homeTeam.players)) {
        fixedState.homeTeam.players = [];
        hasChanges = true;
      }
    }

    // 修复客队数据
    if (!fixedState.awayTeam || typeof fixedState.awayTeam.score !== 'number') {
      const teamName = fixedState.awayTeam?.name || '客队';
      const teamId = fixedState.awayTeam?.id || 'away';
      const teamColor = fixedState.awayTeam?.color || '#3b82f6';
      fixedState.awayTeam = createDefaultTeam(teamId, teamName, teamColor);
      
      // 尝试恢复原有的球员数据
      if (state.awayTeam?.players && Array.isArray(state.awayTeam.players)) {
        fixedState.awayTeam.players = state.awayTeam.players;
      }
      
      hasChanges = true;
      console.warn('⚠️ 修复缺失的客队数据');
    } else {
      // 确保球员数组存在
      if (!Array.isArray(fixedState.awayTeam.players)) {
        fixedState.awayTeam.players = [];
        hasChanges = true;
      }
    }

    // 修复比赛进度相关字段
    if (typeof fixedState.quarter !== 'number' || fixedState.quarter < 1) {
      fixedState.quarter = 1;
      hasChanges = true;
      console.warn('⚠️ 修复缺失的节数');
    }

    if (typeof fixedState.time !== 'string') {
      fixedState.time = '12:00';
      hasChanges = true;
      console.warn('⚠️ 修复缺失的比赛时间');
    }

    if (typeof fixedState.quarterTime !== 'string') {
      fixedState.quarterTime = '12:00';
      hasChanges = true;
      console.warn('⚠️ 修复缺失的单节时间设置');
    }

    if (typeof fixedState.isRunning !== 'boolean') {
      fixedState.isRunning = false;
      hasChanges = true;
      console.warn('⚠️ 修复缺失的运行状态');
    }

    if (typeof fixedState.isPaused !== 'boolean') {
      fixedState.isPaused = false;
      hasChanges = true;
      console.warn('⚠️ 修复缺失的暂停状态');
    }

    // 修复事件数组
    if (!Array.isArray(fixedState.events)) {
      fixedState.events = [];
      hasChanges = true;
      console.warn('⚠️ 修复缺失的事件数组');
    }

    // 修复时间戳
    if (!fixedState.createdAt) {
      fixedState.createdAt = Date.now();
      hasChanges = true;
    }

    if (!fixedState.updatedAt) {
      fixedState.updatedAt = Date.now();
      hasChanges = true;
    }

    // 如果有修改，记录日志
    if (hasChanges) {
      console.log('✅ 游戏状态已自动修复:', {
        sessionId: fixedState.sessionId,
        homeTeam: fixedState.homeTeam.name,
        awayTeam: fixedState.awayTeam.name
      });
    }

    return fixedState;
  } catch (error) {
    console.error('❌ 无法修复游戏状态:', error, state);
    return null;
  }
};

/**
 * TableStore协同服务
 * 通过后端API和WebSocket实现实时协同
 */
export class TableStoreService implements CollaborativeService {
  private isInitialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  /**
   * 初始化服务（支持并发调用）
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // 如果正在初始化，返回现有的 Promise，避免重复连接
    if (this.initPromise) {
      return this.initPromise;
    }

    // 创建新的初始化 Promise
    this.initPromise = wsClient.connect()
      .then(() => {
        this.isInitialized = true;
        this.initPromise = null;
        console.log('✅ TableStore Service initialized');
      })
      .catch((error) => {
        this.initPromise = null;
        console.error('❌ Failed to initialize TableStore Service:', error);
        throw error;
      });

    return this.initPromise;
  }

  /**
   * 服务名称
   */
  getServiceName(): string {
    return 'TableStore';
  }

  /**
   * 创建新游戏会话
   */
  async createGameSession(gameState: GameState, sessionId: string): Promise<void> {
    try {
      const response = await fetch(`${tablestoreConfig.apiBaseUrl}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          gameState,
          sessionId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create game session');
      }

      console.log(`✅ Created game session: ${sessionId}`);
    } catch (error) {
      console.error('❌ Error creating game session:', error);
      throw error;
    }
  }

  /**
   * 更新游戏状态
   */
  async updateGameState(sessionId: string, gameState: GameState): Promise<void> {
    try {
      const response = await fetch(`${tablestoreConfig.apiBaseUrl}/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gameState })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update game state');
      }

      console.log(`✅ Updated game session: ${sessionId}`);
    } catch (error) {
      console.error('❌ Error updating game state:', error);
      throw error;
    }
  }

  /**
   * 监听游戏状态变化
   */
  subscribeToGameState(
    sessionId: string,
    callback: (gameState: GameState | null) => void
  ): () => void {
    // 订阅WebSocket消息
    const unsubscribeWS = wsClient.on(
      WSMessageType.GAME_STATE_UPDATE,
      (payload) => {
        const data = payload as { sessionId: string; gameState: GameState };
        if (data.sessionId === sessionId) {
          // 验证并修复游戏状态
          const validState = validateAndFixGameState(data.gameState);
          if (validState) {
            callback(validState);
          } else {
            console.error('❌ 收到无效的游戏状态，已忽略', {
              sessionId: data.sessionId,
              rawData: data.gameState
            });
            // 仍然调用回调，但传入 null
            callback(null);
          }
        }
      }
    );

    // 等待连接成功后再发送订阅请求
    this.initialize()
      .then(() => {
        wsClient.send({
          type: WSMessageType.SUBSCRIBE_SESSION,
          payload: { sessionId }
        });
      })
      .catch(console.error);

    // 立即获取一次当前状态（已包含验证）
    this.getGameState(sessionId).then(callback).catch(() => callback(null));

    // 返回取消订阅函数
    return () => {
      if (wsClient.isConnected()) {
        wsClient.send({
          type: WSMessageType.UNSUBSCRIBE_SESSION,
          payload: { sessionId }
        });
      }
      unsubscribeWS();
    };
  }

  /**
   * 添加游戏事件
   */
  async addGameEvent(sessionId: string, event: GameEvent): Promise<void> {
    try {
      const response = await fetch(
        `${tablestoreConfig.apiBaseUrl}/sessions/${sessionId}/events`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ event })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add game event');
      }

      console.log(`✅ Added game event for session: ${sessionId}`);
    } catch (error) {
      console.error('❌ Error adding game event:', error);
      throw error;
    }
  }

  /**
   * 监听游戏事件
   */
  subscribeToGameEvents(
    sessionId: string,
    callback: (events: GameEvent[]) => void
  ): () => void {
    // 本地事件缓存
    let localEvents: GameEvent[] = [];

    // 订阅WebSocket消息
    const unsubscribeWS = wsClient.on(
      WSMessageType.GAME_EVENTS_UPDATE,
      (payload) => {
        const data = payload as { sessionId: string; event: GameEvent };
        if (data.sessionId === sessionId) {
          // 添加新事件到本地缓存
          localEvents = [data.event, ...localEvents];
          callback([...localEvents]);
        }
      }
    );

    // 等待连接成功后再发送订阅请求
    this.initialize()
      .then(() => {
        wsClient.send({
          type: WSMessageType.SUBSCRIBE_EVENTS,
          payload: { sessionId }
        });
      })
      .catch(console.error);

    // 立即获取一次当前事件列表
    this.getGameEvents(sessionId).then((events) => {
      localEvents = events;
      callback(events);
    }).catch(() => callback([]));

    // 返回取消订阅函数
    return () => {
      if (wsClient.isConnected()) {
        wsClient.send({
          type: WSMessageType.UNSUBSCRIBE_EVENTS,
          payload: { sessionId }
        });
      }
      unsubscribeWS();
    };
  }

  /**
   * 检查会话是否存在
   */
  async checkSessionExists(sessionId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${tablestoreConfig.apiBaseUrl}/sessions/${sessionId}/exists`
      );

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.exists || false;
    } catch (error) {
      console.error('❌ Error checking session:', error);
      return false;
    }
  }

  /**
   * 删除游戏会话
   */
  async deleteGameSession(sessionId: string): Promise<void> {
    try {
      const response = await fetch(
        `${tablestoreConfig.apiBaseUrl}/sessions/${sessionId}`,
        {
          method: 'DELETE'
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete game session');
      }

      console.log(`✅ Deleted game session: ${sessionId}`);
    } catch (error) {
      console.error('❌ Error deleting game session:', error);
      throw error;
    }
  }

  /**
   * 更新用户活动时间
   */
  async updateUserActivity(sessionId: string, userId: string): Promise<void> {
    try {
      const response = await fetch(
        `${tablestoreConfig.apiBaseUrl}/sessions/${sessionId}/activity`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user activity');
      }
    } catch (error) {
      console.error('❌ Error updating user activity:', error);
      throw error;
    }
  }

  /**
   * 生成会话ID
   */
  generateSessionId(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  /**
   * 修复并更新损坏的游戏状态（手动修复工具）
   * 可用于修复远程数据库中的损坏数据
   */
  async repairGameSession(sessionId: string): Promise<boolean> {
    try {
      console.log(`🔧 开始修复会话: ${sessionId}`);
      
      // 获取当前状态
      const currentState = await this.getGameState(sessionId);
      
      if (!currentState) {
        console.error('❌ 无法获取游戏状态，修复失败');
        return false;
      }

      // 验证并修复
      const fixedState = validateAndFixGameState(currentState);
      
      if (!fixedState) {
        console.error('❌ 无法修复游戏状态');
        return false;
      }

      // 更新到远程
      await this.updateGameState(sessionId, fixedState);
      
      console.log(`✅ 会话修复完成: ${sessionId}`);
      return true;
    } catch (error) {
      console.error('❌ 修复会话失败:', error);
      return false;
    }
  }

  /**
   * 获取游戏状态（私有方法）
   */
  private async getGameState(sessionId: string): Promise<GameState | null> {
    try {
      const response = await fetch(
        `${tablestoreConfig.apiBaseUrl}/sessions/${sessionId}`
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const rawState = data.gameState || null;
      
      // 验证并修复游戏状态
      if (rawState) {
        const validState = validateAndFixGameState(rawState);
        if (!validState) {
          console.error('❌ 获取到无效的游戏状态', {
            sessionId,
            rawData: rawState
          });
        }
        return validState;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error getting game state:', error);
      return null;
    }
  }

  /**
   * 获取游戏事件列表（私有方法）
   */
  private async getGameEvents(sessionId: string): Promise<GameEvent[]> {
    try {
      const response = await fetch(
        `${tablestoreConfig.apiBaseUrl}/sessions/${sessionId}/events?limit=100`
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.events || [];
    } catch (error) {
      console.error('❌ Error getting game events:', error);
      return [];
    }
  }
}

// 导出单例
export const tablestoreService = new TableStoreService();


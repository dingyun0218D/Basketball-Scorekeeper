import * as TableStore from 'tablestore';
import { tablestoreConfig, tableConfig } from '../config/tablestore';
import { GameState, GameEvent } from '../types';

/**
 * TableStore客户端封装
 * 负责所有数据库读写操作
 */
export class TableStoreClient {
  private client: TableStore.Client;
  private readonly tableGameSessions: string;
  private readonly tableGameEvents: string;

  constructor() {
    // 初始化TableStore客户端
    this.client = new TableStore.Client({
      accessKeyId: tablestoreConfig.accessKeyId,
      secretAccessKey: tablestoreConfig.accessKeySecret,
      endpoint: tablestoreConfig.endpoint,
      instancename: tablestoreConfig.instanceName
    });

    this.tableGameSessions = tableConfig.gameSessions;
    this.tableGameEvents = tableConfig.gameEvents;

    console.log('✅ TableStore Client initialized');
  }

  /**
   * 创建新游戏会话
   */
  async createGameSession(gameState: GameState, sessionId: string): Promise<void> {
    const params = {
      tableName: this.tableGameSessions,
      condition: new TableStore.Condition(TableStore.RowExistenceExpectation.EXPECT_NOT_EXIST, null),
      primaryKey: [{ sessionId }],
      attributeColumns: [
        { gameState: JSON.stringify(gameState) },
        { activeUsers: JSON.stringify(gameState.activeUsers || {}) },
        { createdAt: Date.now() },
        { updatedAt: Date.now() },
        { lastActiveAt: Date.now() }
      ]
    };

    try {
      await this.client.putRow(params);
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
    const { activeUsers, ...stateData } = gameState;

    const params = {
      tableName: this.tableGameSessions,
      condition: new TableStore.Condition(TableStore.RowExistenceExpectation.EXPECT_EXIST, null),
      primaryKey: [{ sessionId }],
      updateOfAttributeColumns: [
        { PUT: [
          { gameState: JSON.stringify(stateData) },
          { activeUsers: JSON.stringify(activeUsers || {}) },
          { updatedAt: Date.now() },
          { lastActiveAt: Date.now() }
        ]}
      ]
    };

    try {
      await this.client.updateRow(params);
      console.log(`✅ Updated game session: ${sessionId}`);
    } catch (error) {
      console.error('❌ Error updating game session:', error);
      throw error;
    }
  }

  /**
   * 获取游戏状态
   */
  async getGameState(sessionId: string): Promise<GameState | null> {
    const params = {
      tableName: this.tableGameSessions,
      primaryKey: [{ sessionId }]
    };

    try {
      const result = await this.client.getRow(params);
      
      console.log('🔍 [DEBUG] getGameState called for sessionId:', sessionId);
      console.log('🔍 [DEBUG] Raw result:', JSON.stringify(result, null, 2));
      
      if (!result.row || result.row.length === 0) {
        console.log('⚠️ [DEBUG] No row found for sessionId:', sessionId);
        return null;
      }

      console.log('🔍 [DEBUG] result.row structure:', result.row);
      
      const attributes = this.parseAttributes(result.row);
      console.log('🔍 [DEBUG] Parsed attributes:', attributes);
      
      const gameState = JSON.parse((attributes.gameState as string) || '{}');
      const activeUsers = JSON.parse((attributes.activeUsers as string) || '{}');

      return {
        ...gameState,
        sessionId,
        activeUsers,
        updatedAt: attributes.updatedAt || Date.now()
      };
    } catch (error) {
      console.error('❌ Error getting game state:', error);
      console.error('❌ Error details:', error);
      throw error;
    }
  }

  /**
   * 添加游戏事件
   */
  async addGameEvent(sessionId: string, event: GameEvent): Promise<void> {
    const eventId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const params = {
      tableName: this.tableGameEvents,
      condition: new TableStore.Condition(TableStore.RowExistenceExpectation.EXPECT_NOT_EXIST, null),
      primaryKey: [
        { sessionId },
        { eventId }
      ],
      attributeColumns: [
        { eventData: JSON.stringify(event) },
        { eventType: event.type },
        { playerId: event.playerId || '' },
        { timestamp: typeof event.timestamp === 'number' ? event.timestamp : event.timestamp.getTime() },
        { quarter: event.quarter }
      ]
    };

    try {
      await this.client.putRow(params);
      console.log(`✅ Added game event: ${eventId} for session ${sessionId}`);
    } catch (error) {
      console.error('❌ Error adding game event:', error);
      throw error;
    }
  }

  /**
   * 获取游戏事件列表
   */
  async getGameEvents(sessionId: string, limit: number = 100): Promise<GameEvent[]> {
    const params = {
      tableName: this.tableGameEvents,
      direction: TableStore.Direction.BACKWARD,
      inclusiveStartPrimaryKey: [
        { sessionId },
        { eventId: TableStore.INF_MAX }
      ],
      exclusiveEndPrimaryKey: [
        { sessionId },
        { eventId: TableStore.INF_MIN }
      ],
      limit
    };

    try {
      const result = await this.client.getRange(params);
      const events: GameEvent[] = [];

      if (result.rows) {
        for (const row of result.rows) {
          const attributes = this.parseAttributes(row);
          const eventData = JSON.parse((attributes.eventData as string) || '{}');
          
          events.push({
            ...eventData,
            timestamp: attributes.timestamp || Date.now(),
            sessionId
          });
        }
      }

      return events;
    } catch (error) {
      console.error('❌ Error getting game events:', error);
      throw error;
    }
  }

  /**
   * 检查会话是否存在
   */
  async checkSessionExists(sessionId: string): Promise<boolean> {
    try {
      const gameState = await this.getGameState(sessionId);
      return gameState !== null;
    } catch (error) {
      console.error('❌ Error checking session:', error);
      return false;
    }
  }

  /**
   * 删除游戏会话
   */
  async deleteGameSession(sessionId: string): Promise<void> {
    const params = {
      tableName: this.tableGameSessions,
      condition: new TableStore.Condition(TableStore.RowExistenceExpectation.IGNORE, null),
      primaryKey: [{ sessionId }]
    };

    try {
      await this.client.deleteRow(params);
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
      const gameState = await this.getGameState(sessionId);
      if (!gameState) {
        throw new Error('Session not found');
      }

      const activeUsers = gameState.activeUsers || {};
      activeUsers[userId] = Date.now();

      const params = {
        tableName: this.tableGameSessions,
        condition: new TableStore.Condition(TableStore.RowExistenceExpectation.EXPECT_EXIST, null),
        primaryKey: [{ sessionId }],
        updateOfAttributeColumns: [
          { PUT: [
            { activeUsers: JSON.stringify(activeUsers) },
            { lastActiveAt: Date.now() }
          ]}
        ]
      };

      await this.client.updateRow(params);
      console.log(`✅ Updated user activity: ${userId} in session ${sessionId}`);
    } catch (error) {
      console.error('❌ Error updating user activity:', error);
      throw error;
    }
  }

  /**
   * 解析TableStore返回的属性列
   */
  private parseAttributes(row: unknown[]): Record<string, unknown> {
    const attributes: Record<string, unknown> = {};
    
    console.log('🔍 [DEBUG] parseAttributes input:', row);
    console.log('🔍 [DEBUG] parseAttributes row length:', row.length);
    
    if (row && row.length > 0) {
      // TableStore返回的row数组格式：
      // [主键对象数组, 属性对象数组]
      // 例如: [[{sessionId: 'XXX'}], [{gameState: '...'}, {activeUsers: '...'}, ...]]
      
      // 如果row是两个元素的数组，第一个是主键，第二个是属性
      if (row.length === 2 && Array.isArray(row[0]) && Array.isArray(row[1])) {
        console.log('🔍 [DEBUG] Standard format: [primaryKeys, attributes]');
        const attributeColumns = row[1] as unknown[];
        for (const item of attributeColumns) {
          if (item && typeof item === 'object' && !Array.isArray(item)) {
            const key = Object.keys(item as Record<string, unknown>)[0];
            attributes[key] = (item as Record<string, unknown>)[key];
          }
        }
      } else {
        // 备用解析：尝试直接解析整个数组
        console.log('🔍 [DEBUG] Alternative format: parsing all items');
        for (const item of row) {
          if (item && typeof item === 'object' && !Array.isArray(item)) {
            const key = Object.keys(item as Record<string, unknown>)[0];
            // 跳过主键字段（sessionId, eventId等）
            if (key !== 'sessionId' && key !== 'eventId') {
              attributes[key] = (item as Record<string, unknown>)[key];
            }
          }
        }
      }
    }

    console.log('🔍 [DEBUG] parseAttributes output:', attributes);
    return attributes;
  }

  /**
   * 获取客户端实例（用于Tunnel）
   */
  getClient(): TableStore.Client {
    return this.client;
  }
}

// 导出单例
export const tablestoreClient = new TableStoreClient();


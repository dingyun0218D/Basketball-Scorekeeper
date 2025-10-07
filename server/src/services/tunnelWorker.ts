import * as TableStore from 'tablestore';
import { tablestoreConfig, tunnelConfig, tableConfig } from '../config/tablestore';
import { GameState, GameEvent } from '../types';

/**
 * Tunnel数据变更回调函数类型
 */
export type GameStateChangeCallback = (sessionId: string, gameState: GameState) => void;
export type GameEventChangeCallback = (sessionId: string, event: GameEvent) => void;

/**
 * Tunnel处理器完成回调类型
 */
type ProcessorDoneCallback = (error?: Error) => void;

/**
 * Tunnel Worker服务
 * 监听TableStore数据变更并触发回调
 */
export class TunnelWorker {
  private tunnelClient: TableStore.TunnelClient;
  private gameSessionsTunnel?: { shutdown: () => Promise<void> };
  private gameEventsTunnel?: { shutdown: () => Promise<void> };
  private gameStateCallbacks: Set<GameStateChangeCallback> = new Set();
  private gameEventCallbacks: Set<GameEventChangeCallback> = new Set();
  private isRunning: boolean = false;

  constructor() {
    // 初始化Tunnel客户端
    this.tunnelClient = new TableStore.TunnelClient({
      accessKeyId: tablestoreConfig.accessKeyId,
      secretAccessKey: tablestoreConfig.accessKeySecret,
      endpoint: tablestoreConfig.endpoint,
      instancename: tablestoreConfig.instanceName
    });

    console.log('✅ Tunnel Worker initialized');
  }

  /**
   * 启动Tunnel Worker
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ Tunnel Worker is already running');
      return;
    }

    try {
      // 启动GameSessions Tunnel
      await this.startGameSessionsTunnel();
      
      // 启动GameEvents Tunnel
      await this.startGameEventsTunnel();

      this.isRunning = true;
      console.log('✅ Tunnel Worker started successfully');
    } catch (error) {
      console.error('❌ Error starting Tunnel Worker:', error);
      throw error;
    }
  }

  /**
   * 停止Tunnel Worker
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      if (this.gameSessionsTunnel) {
        await this.gameSessionsTunnel.shutdown();
      }
      if (this.gameEventsTunnel) {
        await this.gameEventsTunnel.shutdown();
      }

      this.isRunning = false;
      console.log('✅ Tunnel Worker stopped');
    } catch (error) {
      console.error('❌ Error stopping Tunnel Worker:', error);
    }
  }

  /**
   * 注册游戏状态变更回调
   */
  onGameStateChange(callback: GameStateChangeCallback): () => void {
    this.gameStateCallbacks.add(callback);
    return () => {
      this.gameStateCallbacks.delete(callback);
    };
  }

  /**
   * 注册游戏事件变更回调
   */
  onGameEventChange(callback: GameEventChangeCallback): () => void {
    this.gameEventCallbacks.add(callback);
    return () => {
      this.gameEventCallbacks.delete(callback);
    };
  }

  /**
   * 启动GameSessions Tunnel
   */
  private async startGameSessionsTunnel(): Promise<void> {
    const params = {
      tableName: tableConfig.gameSessions,
      tunnelName: tunnelConfig.gameSessionsTunnelId,
      processorFactory: this.createGameSessionsProcessor.bind(this)
    };

    this.gameSessionsTunnel = await this.tunnelClient.connectTunnel(params);
    console.log('✅ GameSessions Tunnel connected');
  }

  /**
   * 启动GameEvents Tunnel
   */
  private async startGameEventsTunnel(): Promise<void> {
    const params = {
      tableName: tableConfig.gameEvents,
      tunnelName: tunnelConfig.gameEventsTunnelId,
      processorFactory: this.createGameEventsProcessor.bind(this)
    };

    this.gameEventsTunnel = await this.tunnelClient.connectTunnel(params);
    console.log('✅ GameEvents Tunnel connected');
  }

  /**
   * 创建GameSessions数据处理器
   */
  private createGameSessionsProcessor() {
    return {
      process: (records: unknown[], done: ProcessorDoneCallback) => {
        try {
          for (const record of records) {
            this.handleGameSessionRecord(record as Record<string, unknown>);
          }
          done();
        } catch (error) {
          console.error('❌ Error processing GameSessions records:', error);
          done(error instanceof Error ? error : new Error(String(error)));
        }
      },
      shutdown: () => {
        console.log('🔄 GameSessions processor shutdown');
      }
    };
  }

  /**
   * 创建GameEvents数据处理器
   */
  private createGameEventsProcessor() {
    return {
      process: (records: unknown[], done: ProcessorDoneCallback) => {
        try {
          for (const record of records) {
            this.handleGameEventRecord(record as Record<string, unknown>);
          }
          done();
        } catch (error) {
          console.error('❌ Error processing GameEvents records:', error);
          done(error instanceof Error ? error : new Error(String(error)));
        }
      },
      shutdown: () => {
        console.log('🔄 GameEvents processor shutdown');
      }
    };
  }

  /**
   * 处理GameSession记录变更
   */
  private handleGameSessionRecord(record: Record<string, unknown>): void {
    try {
      const actionType = record.type;
      
      // 只处理PUT和UPDATE操作
      if (actionType !== 'PUT' && actionType !== 'UPDATE') {
        return;
      }

      // 提取sessionId
      const primaryKey = (record.primaryKey as Record<string, unknown>[]) || [];
      const sessionIdObj = primaryKey.find((pk) => 'sessionId' in pk);
      if (!sessionIdObj || !sessionIdObj.sessionId) {
        return;
      }
      const sessionId = sessionIdObj.sessionId as string;

      // 提取gameState
      const columns = (record.columns as Array<{ columnName: string; columnValue: string }>) || [];
      const gameStateCol = columns.find((col) => col.columnName === 'gameState');
      const activeUsersCol = columns.find((col) => col.columnName === 'activeUsers');
      const updatedAtCol = columns.find((col) => col.columnName === 'updatedAt');

      if (!gameStateCol) {
        return;
      }

      const gameState = JSON.parse(gameStateCol.columnValue || '{}');
      const activeUsers = activeUsersCol ? JSON.parse(activeUsersCol.columnValue || '{}') : {};
      const updatedAt = updatedAtCol ? updatedAtCol.columnValue : Date.now();

      const fullState: GameState = {
        ...gameState,
        sessionId,
        activeUsers,
        updatedAt
      };

      // 触发所有回调
      this.gameStateCallbacks.forEach(callback => {
        try {
          callback(sessionId, fullState);
        } catch (error) {
          console.error('❌ Error in game state callback:', error);
        }
      });

      console.log(`📡 GameState updated: ${sessionId}`);
    } catch (error) {
      console.error('❌ Error handling GameSession record:', error);
    }
  }

  /**
   * 处理GameEvent记录变更
   */
  private handleGameEventRecord(record: Record<string, unknown>): void {
    try {
      const actionType = record.type;
      
      // 只处理PUT操作（新事件）
      if (actionType !== 'PUT') {
        return;
      }

      // 提取sessionId
      const primaryKey = (record.primaryKey as Record<string, unknown>[]) || [];
      const sessionIdObj = primaryKey.find((pk) => 'sessionId' in pk);
      if (!sessionIdObj || !sessionIdObj.sessionId) {
        return;
      }
      const sessionId = sessionIdObj.sessionId as string;

      // 提取事件数据
      const columns = (record.columns as Array<{ columnName: string; columnValue: string }>) || [];
      const eventDataCol = columns.find((col) => col.columnName === 'eventData');
      
      if (!eventDataCol) {
        return;
      }

      const event = JSON.parse(eventDataCol.columnValue || '{}');
      event.sessionId = sessionId;

      // 触发所有回调
      this.gameEventCallbacks.forEach(callback => {
        try {
          callback(sessionId, event);
        } catch (error) {
          console.error('❌ Error in game event callback:', error);
        }
      });

      console.log(`📡 GameEvent added: ${event.id} for session ${sessionId}`);
    } catch (error) {
      console.error('❌ Error handling GameEvent record:', error);
    }
  }
}

// 导出单例
export const tunnelWorker = new TunnelWorker();


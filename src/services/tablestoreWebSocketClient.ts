import { tablestoreConfig } from '../config/tablestore';

/**
 * WebSocket消息类型（与后端保持一致）
 */
export enum WSMessageType {
  // 客户端 -> 服务器
  SUBSCRIBE_SESSION = 'subscribe_session',
  UNSUBSCRIBE_SESSION = 'unsubscribe_session',
  SUBSCRIBE_EVENTS = 'subscribe_events',
  UNSUBSCRIBE_EVENTS = 'unsubscribe_events',
  PING = 'ping',
  
  // 服务器 -> 客户端
  GAME_STATE_UPDATE = 'game_state_update',
  GAME_EVENTS_UPDATE = 'game_events_update',
  ERROR = 'error',
  PONG = 'pong',
  CONNECTED = 'connected'
}

export interface WSMessage {
  type: WSMessageType;
  payload?: unknown;
  error?: string;
}

/**
 * WebSocket客户端
 * 管理与后端的WebSocket连接
 */
export class TableStoreWebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pingTimer: NodeJS.Timeout | null = null;
  private messageHandlers: Map<WSMessageType, Set<(payload: unknown) => void>> = new Map();
  private isConnecting: boolean = false;
  private connectPromise: Promise<void> | null = null;
  private shouldReconnect: boolean = true;
  private readonly RECONNECT_INTERVAL = 3000;
  private readonly PING_INTERVAL = 25000;

  /**
   * 连接到WebSocket服务器
   */
  connect(): Promise<void> {
    // 如果已经连接，直接返回
    if (this.ws?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    // 如果正在连接，返回同一个Promise
    if (this.connectPromise) {
      return this.connectPromise;
    }

    // 创建新的连接Promise
    this.connectPromise = new Promise((resolve, reject) => {
      this.isConnecting = true;

      try {
        this.ws = new WebSocket(tablestoreConfig.wsBaseUrl);

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected');
          this.isConnecting = false;
          this.connectPromise = null;
          this.startPing();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          this.isConnecting = false;
          this.connectPromise = null;
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('❌ WebSocket disconnected');
          this.isConnecting = false;
          this.connectPromise = null;
          this.stopPing();
          
          if (this.shouldReconnect) {
            this.scheduleReconnect();
          }
        };
      } catch (error) {
        this.isConnecting = false;
        this.connectPromise = null;
        reject(error);
      }
    });

    return this.connectPromise;
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    this.shouldReconnect = false;
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.stopPing();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * 发送消息
   */
  send(message: WSMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('⚠️ WebSocket not connected, message not sent');
    }
  }

  /**
   * 订阅消息类型
   */
  on(type: WSMessageType, handler: (payload: unknown) => void): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    
    this.messageHandlers.get(type)!.add(handler);

    // 返回取消订阅函数
    return () => {
      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(data: string): void {
    try {
      const message: WSMessage = JSON.parse(data);
      const handlers = this.messageHandlers.get(message.type);

      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(message.payload);
          } catch (error) {
            console.error('❌ Error in message handler:', error);
          }
        });
      }
    } catch (error) {
      console.error('❌ Error parsing WebSocket message:', error);
    }
  }

  /**
   * 计划重连
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    console.log(`🔄 Reconnecting in ${this.RECONNECT_INTERVAL}ms...`);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect().catch((error) => {
        console.error('❌ Reconnect failed:', error);
      });
    }, this.RECONNECT_INTERVAL);
  }

  /**
   * 启动心跳
   */
  private startPing(): void {
    this.stopPing();
    
    this.pingTimer = setInterval(() => {
      this.send({ type: WSMessageType.PING });
    }, this.PING_INTERVAL);
  }

  /**
   * 停止心跳
   */
  private stopPing(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  /**
   * 检查连接状态
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// 导出单例
export const wsClient = new TableStoreWebSocketClient();


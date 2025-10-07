import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { WSMessage, WSMessageType, GameState, GameEvent } from '../types';
import { tunnelWorker } from './tunnelWorker';

/**
 * 客户端连接信息
 */
interface ClientConnection {
  ws: WebSocket;
  subscribedSessions: Set<string>; // 订阅的游戏会话
  subscribedEvents: Set<string>; // 订阅的事件流
  clientId: string;
  lastPing: number;
}

/**
 * WebSocket服务
 * 管理客户端连接和消息推送
 */
export class WebSocketService {
  private wss?: WebSocketServer;
  private clients: Map<WebSocket, ClientConnection> = new Map();
  private pingInterval?: NodeJS.Timeout;
  private readonly PING_INTERVAL = 30000; // 30秒心跳

  /**
   * 初始化WebSocket服务器
   */
  initialize(server: unknown): void {
    this.wss = new WebSocketServer({ server: server as any });

    this.wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
      this.handleConnection(ws, request);
    });

    // 注册Tunnel Worker回调
    this.registerTunnelCallbacks();

    // 启动心跳检测
    this.startPingInterval();

    console.log('✅ WebSocket Service initialized');
  }

  /**
   * 处理新的客户端连接
   */
  private handleConnection(ws: WebSocket, _request: IncomingMessage): void {
    const clientId = this.generateClientId();
    const clientInfo: ClientConnection = {
      ws,
      subscribedSessions: new Set(),
      subscribedEvents: new Set(),
      clientId,
      lastPing: Date.now()
    };

    this.clients.set(ws, clientInfo);
    console.log(`✅ Client connected: ${clientId}, Total clients: ${this.clients.size}`);

    // 发送连接成功消息
    this.sendMessage(ws, {
      type: WSMessageType.CONNECTED,
      payload: { clientId }
    });

    // 监听消息
    ws.on('message', (data: Buffer) => {
      this.handleMessage(ws, data);
    });

    // 监听连接关闭
    ws.on('close', () => {
      this.handleDisconnect(ws);
    });

    // 监听错误
    ws.on('error', (error) => {
      console.error(`❌ WebSocket error for client ${clientId}:`, error);
    });
  }

  /**
   * 处理客户端消息
   */
  private handleMessage(ws: WebSocket, data: Buffer): void {
    try {
      const message: WSMessage = JSON.parse(data.toString());
      const clientInfo = this.clients.get(ws);

      if (!clientInfo) {
        return;
      }

      switch (message.type) {
        case WSMessageType.SUBSCRIBE_SESSION:
          this.handleSubscribeSession(clientInfo, (message.payload as any)?.sessionId);
          break;

        case WSMessageType.UNSUBSCRIBE_SESSION:
          this.handleUnsubscribeSession(clientInfo, (message.payload as any)?.sessionId);
          break;

        case WSMessageType.SUBSCRIBE_EVENTS:
          this.handleSubscribeEvents(clientInfo, (message.payload as any)?.sessionId);
          break;

        case WSMessageType.UNSUBSCRIBE_EVENTS:
          this.handleUnsubscribeEvents(clientInfo, (message.payload as any)?.sessionId);
          break;

        case WSMessageType.PING:
          clientInfo.lastPing = Date.now();
          this.sendMessage(ws, { type: WSMessageType.PONG });
          break;

        default:
          console.warn(`⚠️ Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('❌ Error handling message:', error);
      this.sendMessage(ws, {
        type: WSMessageType.ERROR,
        error: 'Invalid message format'
      });
    }
  }

  /**
   * 订阅游戏会话
   */
  private handleSubscribeSession(clientInfo: ClientConnection, sessionId: string): void {
    if (!sessionId) {
      this.sendMessage(clientInfo.ws, {
        type: WSMessageType.ERROR,
        error: 'Missing sessionId'
      });
      return;
    }

    clientInfo.subscribedSessions.add(sessionId);
    console.log(`📡 Client ${clientInfo.clientId} subscribed to session: ${sessionId}`);
  }

  /**
   * 取消订阅游戏会话
   */
  private handleUnsubscribeSession(clientInfo: ClientConnection, sessionId: string): void {
    if (!sessionId) {
      return;
    }

    clientInfo.subscribedSessions.delete(sessionId);
    console.log(`📡 Client ${clientInfo.clientId} unsubscribed from session: ${sessionId}`);
  }

  /**
   * 订阅游戏事件
   */
  private handleSubscribeEvents(clientInfo: ClientConnection, sessionId: string): void {
    if (!sessionId) {
      this.sendMessage(clientInfo.ws, {
        type: WSMessageType.ERROR,
        error: 'Missing sessionId'
      });
      return;
    }

    clientInfo.subscribedEvents.add(sessionId);
    console.log(`📡 Client ${clientInfo.clientId} subscribed to events: ${sessionId}`);
  }

  /**
   * 取消订阅游戏事件
   */
  private handleUnsubscribeEvents(clientInfo: ClientConnection, sessionId: string): void {
    if (!sessionId) {
      return;
    }

    clientInfo.subscribedEvents.delete(sessionId);
    console.log(`📡 Client ${clientInfo.clientId} unsubscribed from events: ${sessionId}`);
  }

  /**
   * 处理客户端断开连接
   */
  private handleDisconnect(ws: WebSocket): void {
    const clientInfo = this.clients.get(ws);
    if (clientInfo) {
      console.log(`❌ Client disconnected: ${clientInfo.clientId}, Total clients: ${this.clients.size - 1}`);
      this.clients.delete(ws);
    }
  }

  /**
   * 注册Tunnel Worker回调
   */
  private registerTunnelCallbacks(): void {
    // 监听游戏状态变更
    tunnelWorker.onGameStateChange((sessionId: string, gameState: GameState) => {
      this.broadcastGameStateUpdate(sessionId, gameState);
    });

    // 监听游戏事件变更
    tunnelWorker.onGameEventChange((sessionId: string, event: GameEvent) => {
      this.broadcastGameEventUpdate(sessionId, event);
    });

    console.log('✅ Tunnel callbacks registered');
  }

  /**
   * 广播游戏状态更新
   */
  private broadcastGameStateUpdate(sessionId: string, gameState: GameState): void {
    const message: WSMessage = {
      type: WSMessageType.GAME_STATE_UPDATE,
      payload: { sessionId, gameState }
    };

    let sentCount = 0;
    this.clients.forEach((clientInfo) => {
      if (clientInfo.subscribedSessions.has(sessionId)) {
        this.sendMessage(clientInfo.ws, message);
        sentCount++;
      }
    });

    if (sentCount > 0) {
      console.log(`📤 Broadcasted game state update to ${sentCount} clients for session: ${sessionId}`);
    }
  }

  /**
   * 广播游戏事件更新
   */
  private broadcastGameEventUpdate(sessionId: string, event: GameEvent): void {
    const message: WSMessage = {
      type: WSMessageType.GAME_EVENTS_UPDATE,
      payload: { sessionId, event }
    };

    let sentCount = 0;
    this.clients.forEach((clientInfo) => {
      if (clientInfo.subscribedEvents.has(sessionId)) {
        this.sendMessage(clientInfo.ws, message);
        sentCount++;
      }
    });

    if (sentCount > 0) {
      console.log(`📤 Broadcasted game event to ${sentCount} clients for session: ${sessionId}`);
    }
  }

  /**
   * 发送消息给客户端
   */
  private sendMessage(ws: WebSocket, message: WSMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  /**
   * 启动心跳检测
   */
  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      const now = Date.now();
      const timeout = 60000; // 60秒超时

      this.clients.forEach((clientInfo, ws) => {
        if (now - clientInfo.lastPing > timeout) {
          console.log(`⏰ Client ${clientInfo.clientId} timeout, closing connection`);
          ws.close();
        }
      });
    }, this.PING_INTERVAL);
  }

  /**
   * 生成客户端ID
   */
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 关闭WebSocket服务
   */
  shutdown(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    this.clients.forEach((clientInfo, ws) => {
      ws.close();
    });

    if (this.wss) {
      this.wss.close();
    }

    console.log('✅ WebSocket Service shutdown');
  }
}

// 导出单例
export const websocketService = new WebSocketService();


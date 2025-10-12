import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage, Server as HTTPServer } from 'http';
import { Server as HTTPSServer } from 'https';
import { WSMessage, WSMessageType, GameState, GameEvent } from '../types';
// import { tunnelWorker } from './tunnelWorker'; // 已禁用：使用Java服务处理Tunnel

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
  initialize(server: HTTPServer | HTTPSServer): void {
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
      this.handleConnection(ws, request);
    });

    // 注册Tunnel Worker回调 - 已禁用：使用Java服务通过HTTP回调
    // this.registerTunnelCallbacks();

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
          if (message.payload && typeof message.payload === 'object' && 'sessionId' in message.payload) {
            this.handleSubscribeSession(clientInfo, message.payload.sessionId as string);
          }
          break;

        case WSMessageType.UNSUBSCRIBE_SESSION:
          if (message.payload && typeof message.payload === 'object' && 'sessionId' in message.payload) {
            this.handleUnsubscribeSession(clientInfo, message.payload.sessionId as string);
          }
          break;

        case WSMessageType.SUBSCRIBE_EVENTS:
          if (message.payload && typeof message.payload === 'object' && 'sessionId' in message.payload) {
            this.handleSubscribeEvents(clientInfo, message.payload.sessionId as string);
          }
          break;

        case WSMessageType.UNSUBSCRIBE_EVENTS:
          if (message.payload && typeof message.payload === 'object' && 'sessionId' in message.payload) {
            this.handleUnsubscribeEvents(clientInfo, message.payload.sessionId as string);
          }
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
   * 已禁用：使用Java服务通过HTTP回调（/api/tunnel/callback）
   */
  private registerTunnelCallbacks(): void {
    // 已禁用：Java服务会直接调用 broadcastGameStateUpdate/broadcastGameEventUpdate
    // tunnelWorker.onGameStateChange((sessionId: string, gameState: GameState) => {
    //   this.broadcastGameStateUpdate(sessionId, gameState);
    // });

    // tunnelWorker.onGameEventChange((sessionId: string, event: GameEvent) => {
    //   this.broadcastGameEventUpdate(sessionId, event);
    // });

    console.log('✅ Tunnel callbacks disabled (using Java service)');
  }

  /**
   * 广播游戏状态更新
   */
  public broadcastGameStateUpdate(sessionId: string, gameState: GameState): void {
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
  public broadcastGameEventUpdate(sessionId: string, event: GameEvent): void {
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


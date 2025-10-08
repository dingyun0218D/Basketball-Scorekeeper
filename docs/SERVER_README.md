# Node.js后端服务 - API文档

## 📖 简介

Node.js后端服务提供REST API和WebSocket接口，负责：
- TableStore数据操作（CRUD）
- WebSocket实时通信
- 接收Java Tunnel Service的回调
- 广播数据变更给前端

## 🛠 技术栈

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **WebSocket**: ws
- **Database**: 阿里云TableStore
- **Process Manager**: PM2
- **Language**: TypeScript

## ⚙️ 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `TABLESTORE_INSTANCE_NAME` | TableStore实例名 | - |
| `TABLESTORE_ENDPOINT` | TableStore端点 | - |
| `TABLESTORE_ACCESS_KEY_ID` | AccessKey ID | - |
| `TABLESTORE_ACCESS_KEY_SECRET` | AccessKey Secret | - |
| `TABLE_GAME_SESSIONS` | 游戏会话表名 | `GameSessions` |
| `TABLE_GAME_EVENTS` | 游戏事件表名 | `GameEvents` |
| `PORT` | 服务端口 | `3001` |
| `NODE_ENV` | 运行环境 | `development` |
| `ALLOWED_ORIGINS` | CORS允许的源 | `*` |

## 🚀 快速开始

### 本地开发

```bash
cd server
npm install
npm run dev
```

### 生产部署

见 [快速部署指南](DEPLOYMENT_QUICK_GUIDE.md)

## 📡 REST API

### 基础接口

#### 健康检查
```http
GET /api/health
```

**响应**：
```json
{
  "status": "ok",
  "timestamp": 1696742400000,
  "service": "Basketball Scorekeeper API"
}
```

#### 生成会话ID
```http
GET /api/generate-session-id
```

**响应**：
```json
{
  "success": true,
  "sessionId": "ABC123"
}
```

### 游戏会话

#### 创建会话
```http
POST /api/sessions
Content-Type: application/json

{
  "sessionId": "ABC123",
  "gameState": {
    "teamA": {...},
    "teamB": {...},
    ...
  }
}
```

**响应**：
```json
{
  "success": true,
  "sessionId": "ABC123",
  "message": "Game session created successfully"
}
```

#### 获取会话
```http
GET /api/sessions/:sessionId
```

**响应**：
```json
{
  "success": true,
  "gameState": {
    "sessionId": "ABC123",
    "teamA": {...},
    "teamB": {...},
    "activeUsers": {...},
    "updatedAt": 1696742400000
  }
}
```

#### 更新会话
```http
PUT /api/sessions/:sessionId
Content-Type: application/json

{
  "gameState": {
    "teamA": {...},
    "teamB": {...},
    ...
  }
}
```

**响应**：
```json
{
  "success": true,
  "message": "Game state updated successfully"
}
```

#### 删除会话
```http
DELETE /api/sessions/:sessionId
```

**响应**：
```json
{
  "success": true,
  "message": "Game session deleted successfully"
}
```

#### 检查会话是否存在
```http
GET /api/sessions/:sessionId/exists
```

**响应**：
```json
{
  "success": true,
  "exists": true
}
```

### 游戏事件

#### 添加事件
```http
POST /api/sessions/:sessionId/events
Content-Type: application/json

{
  "event": {
    "type": "score",
    "playerId": "player-1",
    "points": 2,
    "quarter": 1,
    "timestamp": 1696742400000
  }
}
```

**响应**：
```json
{
  "success": true,
  "message": "Game event added successfully"
}
```

#### 获取事件列表
```http
GET /api/sessions/:sessionId/events?limit=100
```

**响应**：
```json
{
  "success": true,
  "events": [
    {
      "type": "score",
      "playerId": "player-1",
      "points": 2,
      "timestamp": 1696742400000,
      ...
    }
  ],
  "count": 10
}
```

### 用户活动

#### 更新用户活动时间
```http
POST /api/sessions/:sessionId/activity
Content-Type: application/json

{
  "userId": "user-123"
}
```

**响应**：
```json
{
  "success": true,
  "message": "User activity updated successfully"
}
```

### Tunnel回调接口

#### 接收Tunnel推送（由Java服务调用）
```http
POST /api/tunnel/callback
Content-Type: application/json

{
  "type": "gameState",     // 或 "gameEvent"
  "sessionId": "ABC123",
  "data": "{...}",         // JSON字符串
  "timestamp": 1696742400000
}
```

**响应**：
```json
{
  "success": true,
  "message": "Callback processed successfully",
  "timestamp": 1696742400000
}
```

## 🔌 WebSocket API

### 连接
```
ws://localhost:3001
```

### 消息格式

所有消息使用JSON格式：

```typescript
interface WSMessage {
  type: WSMessageType;
  payload?: unknown;
}

enum WSMessageType {
  // 客户端 → 服务器
  SUBSCRIBE_GAME_STATE = 'subscribe_game_state',
  UNSUBSCRIBE_GAME_STATE = 'unsubscribe_game_state',
  SUBSCRIBE_GAME_EVENTS = 'subscribe_game_events',
  UNSUBSCRIBE_GAME_EVENTS = 'unsubscribe_game_events',
  
  // 服务器 → 客户端
  GAME_STATE_UPDATE = 'game_state_update',
  GAME_EVENTS_UPDATE = 'game_events_update',
  CONNECTION_ACK = 'connection_ack',
  ERROR = 'error',
  PING = 'ping',
  PONG = 'pong'
}
```

### 订阅游戏状态

**客户端发送**：
```json
{
  "type": "subscribe_game_state",
  "payload": {
    "sessionId": "ABC123"
  }
}
```

**服务器推送（当数据变更时）**：
```json
{
  "type": "game_state_update",
  "payload": {
    "sessionId": "ABC123",
    "gameState": {
      "teamA": {...},
      "teamB": {...},
      ...
    }
  }
}
```

### 订阅游戏事件

**客户端发送**：
```json
{
  "type": "subscribe_game_events",
  "payload": {
    "sessionId": "ABC123"
  }
}
```

**服务器推送（当有新事件时）**：
```json
{
  "type": "game_events_update",
  "payload": {
    "sessionId": "ABC123",
    "event": {
      "type": "score",
      "playerId": "player-1",
      "points": 2,
      ...
    }
  }
}
```

### 取消订阅

```json
{
  "type": "unsubscribe_game_state",
  "payload": {
    "sessionId": "ABC123"
  }
}
```

```json
{
  "type": "unsubscribe_game_events",
  "payload": {
    "sessionId": "ABC123"
  }
}
```

### 心跳

服务器每30秒发送一次心跳：
```json
{
  "type": "ping"
}
```

客户端应响应：
```json
{
  "type": "pong"
}
```

## 📊 错误处理

### HTTP错误

所有错误响应格式：
```json
{
  "error": "错误描述",
  "details": "详细错误信息"
}
```

常见HTTP状态码：
- `400` - 请求参数错误
- `404` - 资源不存在
- `500` - 服务器内部错误

### WebSocket错误

错误消息格式：
```json
{
  "type": "error",
  "payload": {
    "message": "错误描述"
  }
}
```

## 🔍 开发调试

### 查看日志

```bash
# PM2日志
pm2 logs basketball-scorekeeper

# 指定行数
pm2 logs basketball-scorekeeper --lines 100

# 错误日志
pm2 logs basketball-scorekeeper --err
```

### 健康检查

```bash
curl http://localhost:3001/api/health
```

### WebSocket测试

使用 `wscat` 工具：

```bash
npm install -g wscat
wscat -c ws://localhost:3001

# 发送订阅消息
> {"type":"subscribe_game_state","payload":{"sessionId":"ABC123"}}
```

## 📁 项目结构

```
server/
├── src/
│   ├── config/
│   │   └── tablestore.ts          # TableStore配置
│   ├── types/
│   │   └── index.ts               # 类型定义
│   ├── services/
│   │   ├── tablestoreClient.ts    # TableStore数据操作
│   │   └── websocketService.ts    # WebSocket服务
│   ├── routes/
│   │   └── api.ts                 # REST API路由
│   └── server.ts                  # 主服务入口
├── package.json
├── tsconfig.json
└── ecosystem.config.js            # PM2配置
```

## 📚 相关文档

- [快速部署指南](DEPLOYMENT_QUICK_GUIDE.md) - 完整部署流程
- [Java Tunnel服务](JAVA_TUNNEL_SERVICE.md) - Tunnel监听服务
- [实现总结](TABLESTORE_IMPLEMENTATION_SUMMARY.md) - 架构说明
- [环境变量模板](SERVER_ENV_TEMPLATE.md) - 配置参考

---

更多详情见 [DEPLOYMENT_QUICK_GUIDE.md](DEPLOYMENT_QUICK_GUIDE.md)

# Basketball Scorekeeper - 后端服务

基于阿里云TableStore和Tunnel Service的实时协同后端服务。

## 📋 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [环境要求](#环境要求)
- [本地开发](#本地开发)
- [生产部署](#生产部署)
- [环境变量配置](#环境变量配置)
- [API文档](#api文档)

## ✨ 功能特性

- ✅ TableStore数据存储和查询
- ✅ Tunnel Service实时数据推送
- ✅ WebSocket实时通信
- ✅ RESTful API接口
- ✅ PM2进程管理
- ✅ 自动重连和心跳检测

## 🛠 技术栈

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **WebSocket**: ws
- **Database**: 阿里云TableStore
- **Real-time**: Tunnel Service
- **Process Manager**: PM2
- **Language**: TypeScript

## 📦 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- PM2 (生产环境)

## 🚀 本地开发

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 配置环境变量

创建 `.env` 文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的配置：

```env
TABLESTORE_INSTANCE_NAME=your_instance_name
TABLESTORE_ENDPOINT=https://your-instance.cn-region.vpc.tablestore.aliyuncs.com
TABLESTORE_ACCESS_KEY_ID=your_access_key_id
TABLESTORE_ACCESS_KEY_SECRET=your_access_key_secret
TABLESTORE_REGION=cn-hangzhou

TUNNEL_GAME_SESSIONS_ID=your_tunnel_id_1
TUNNEL_GAME_EVENTS_ID=your_tunnel_id_2

TABLE_GAME_SESSIONS=GameSessions
TABLE_GAME_EVENTS=GameEvents

PORT=3001
NODE_ENV=development

ALLOWED_ORIGINS=http://localhost:5173
```

### 3. 启动开发服务器

```bash
npm run dev
```

服务将在 `http://localhost:3001` 启动。

### 4. 测试API

```bash
# 健康检查
curl http://localhost:3001/api/health

# 生成会话ID
curl http://localhost:3001/api/generate-session-id
```

## 🌐 生产部署

### 方式一：使用PM2部署（推荐）

#### 1. 构建项目

```bash
npm run build
```

#### 2. 安装PM2

```bash
npm install -g pm2
```

#### 3. 启动服务

```bash
npm run pm2:start
```

#### 4. 其他PM2命令

```bash
# 查看状态
pm2 status

# 查看日志
npm run pm2:logs

# 重启服务
npm run pm2:restart

# 停止服务
npm run pm2:stop

# 设置开机自启
pm2 startup
pm2 save
```

### 方式二：使用GitHub Actions自动部署

配置GitHub Secrets后，推送代码到main分支自动部署。

详见[GitHub Actions配置文档](./TABLESTORE_DEPLOYMENT_GUIDE.md#5-github-actions配置)。

## 🔑 环境变量配置

### 必需的环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `TABLESTORE_INSTANCE_NAME` | TableStore实例名称 | `your-instance` |
| `TABLESTORE_ENDPOINT` | TableStore endpoint地址 | `https://your-instance.cn-region.vpc.tablestore.aliyuncs.com` |
| `TABLESTORE_ACCESS_KEY_ID` | 阿里云AccessKey ID | `LTAI5t...` |
| `TABLESTORE_ACCESS_KEY_SECRET` | 阿里云AccessKey Secret | `********` |
| `TABLESTORE_REGION` | 地域 | `cn-hangzhou` |
| `TUNNEL_GAME_SESSIONS_ID` | GameSessions Tunnel ID | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `TUNNEL_GAME_EVENTS_ID` | GameEvents Tunnel ID | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |

### 可选的环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `PORT` | 服务端口 | `3001` |
| `NODE_ENV` | 运行环境 | `production` |
| `ALLOWED_ORIGINS` | 允许的CORS源（逗号分隔） | `http://localhost:5173` |
| `TABLE_GAME_SESSIONS` | 游戏会话表名 | `GameSessions` |
| `TABLE_GAME_EVENTS` | 游戏事件表名 | `GameEvents` |

## 📡 API文档

### 基础信息

- **Base URL**: `http://your-server:3001/api`
- **Content-Type**: `application/json`

### 端点列表

#### 1. 健康检查

```
GET /health
```

**响应示例**:
```json
{
  "status": "ok",
  "timestamp": 1234567890,
  "service": "Basketball Scorekeeper API"
}
```

#### 2. 创建游戏会话

```
POST /sessions
```

**请求体**:
```json
{
  "gameState": { ... },
  "sessionId": "ABC123"
}
```

#### 3. 获取游戏会话

```
GET /sessions/:sessionId
```

#### 4. 更新游戏状态

```
PUT /sessions/:sessionId
```

**请求体**:
```json
{
  "gameState": { ... }
}
```

#### 5. 删除游戏会话

```
DELETE /sessions/:sessionId
```

#### 6. 检查会话是否存在

```
GET /sessions/:sessionId/exists
```

#### 7. 添加游戏事件

```
POST /sessions/:sessionId/events
```

**请求体**:
```json
{
  "event": { ... }
}
```

#### 8. 获取游戏事件列表

```
GET /sessions/:sessionId/events?limit=100
```

#### 9. 更新用户活动时间

```
POST /sessions/:sessionId/activity
```

**请求体**:
```json
{
  "userId": "user123"
}
```

#### 10. 生成会话ID

```
GET /generate-session-id
```

## 🔌 WebSocket协议

### 连接

```javascript
const ws = new WebSocket('ws://your-server:3001');
```

### 消息格式

所有消息使用JSON格式：

```json
{
  "type": "message_type",
  "payload": { ... }
}
```

### 客户端 → 服务器

- `subscribe_session` - 订阅游戏会话
- `unsubscribe_session` - 取消订阅游戏会话
- `subscribe_events` - 订阅游戏事件
- `unsubscribe_events` - 取消订阅游戏事件
- `ping` - 心跳检测

### 服务器 → 客户端

- `connected` - 连接成功
- `game_state_update` - 游戏状态更新
- `game_events_update` - 游戏事件更新
- `pong` - 心跳响应
- `error` - 错误消息

## 📝 GitHub Actions配置

### 需要配置的Secrets

在GitHub仓库设置中添加以下Secrets：

**ECS部署相关**:
- `ECS_HOST` - ECS公网IP地址
- `ECS_USERNAME` - SSH用户名（通常是root）
- `ECS_SSH_KEY` - SSH私钥（完整内容）

**TableStore配置**:
- `TABLESTORE_INSTANCE_NAME`
- `TABLESTORE_ENDPOINT`
- `TABLESTORE_ACCESS_KEY_ID`
- `TABLESTORE_ACCESS_KEY_SECRET`
- `TABLESTORE_REGION`
- `TUNNEL_GAME_SESSIONS_ID`
- `TUNNEL_GAME_EVENTS_ID`

**其他配置**:
- `ALLOWED_ORIGINS` - 允许的前端域名，如 `https://yourdomain.com`

### 部署流程

1. 推送代码到main分支
2. GitHub Actions自动构建
3. 部署到ECS服务器
4. 自动重启PM2服务

## 🐛 故障排查

### 1. TableStore连接失败

- 检查Endpoint是否正确（VPC地址需要在VPC内访问）
- 验证AccessKey是否有效
- 确认安全组规则允许访问

### 2. Tunnel无法启动

- 确认Tunnel ID正确
- 检查Tunnel是否处于启用状态
- 查看TableStore控制台中的Tunnel状态

### 3. WebSocket连接失败

- 检查防火墙规则
- 确认端口3001已开放
- 验证CORS配置

### 4. 查看日志

```bash
# PM2日志
pm2 logs basketball-scorekeeper

# 错误日志
tail -f logs/error.log

# 输出日志
tail -f logs/out.log
```

## 📄 License

MIT


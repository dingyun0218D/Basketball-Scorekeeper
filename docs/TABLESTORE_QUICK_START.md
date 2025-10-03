# TableStore快速开始指南

本指南帮助你快速在本地启动和测试TableStore协同功能。

## 🚀 快速开始（5分钟）

### 前提条件

- ✅ 已完成阿里云TableStore的配置（参考部署指南）
- ✅ 已安装Node.js 18+
- ✅ 已获取所有必要的配置信息

### 步骤1: 克隆项目

```bash
git clone https://github.com/your-repo/Basketball-Scorekeeper.git
cd Basketball-Scorekeeper
```

### 步骤2: 配置后端

```bash
# 进入后端目录
cd server

# 安装依赖
npm install

# 创建环境变量文件
cat > .env << 'EOF'
TABLESTORE_INSTANCE_NAME=your_instance_name
TABLESTORE_ENDPOINT=https://your-instance.cn-region.vpc.tablestore.aliyuncs.com
TABLESTORE_ACCESS_KEY_ID=your_access_key_id
TABLESTORE_ACCESS_KEY_SECRET=your_access_key_secret
TABLESTORE_REGION=cn-hangzhou

TUNNEL_GAME_SESSIONS_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
TUNNEL_GAME_EVENTS_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

TABLE_GAME_SESSIONS=GameSessions
TABLE_GAME_EVENTS=GameEvents

PORT=3001
NODE_ENV=development

ALLOWED_ORIGINS=http://localhost:5173
EOF

# 启动后端服务
npm run dev
```

### 步骤3: 配置前端

打开新终端：

```bash
# 回到项目根目录
cd ..

# 安装依赖
npm install

# 创建环境变量文件
cat > .env << 'EOF'
VITE_TABLESTORE_API_URL=http://localhost:3001/api
VITE_TABLESTORE_WS_URL=ws://localhost:3001
EOF

# 启动前端服务
npm run dev
```

### 步骤4: 测试功能

1. 打开浏览器访问 `http://localhost:5173`
2. 点击"协同模式"标签
3. 选择"阿里云TableStore"服务
4. 点击"创建新会话"
5. 复制会话ID
6. 在另一个浏览器窗口/无痕模式打开同样的页面
7. 点击"加入会话"，输入会话ID
8. 现在你可以在两个窗口中看到实时同步！

## ✅ 验证检查清单

### 后端服务检查

```bash
# 检查后端健康状态
curl http://localhost:3001/api/health

# 应该返回：
# {
#   "status": "ok",
#   "timestamp": ...,
#   "service": "Basketball Scorekeeper API"
# }

# 检查生成会话ID
curl http://localhost:3001/api/generate-session-id

# 应该返回：
# {
#   "success": true,
#   "sessionId": "ABC123"
# }
```

### 前端服务检查

1. 打开浏览器开发者工具（F12）
2. 查看Console标签，应该看到：
   ```
   ✅ TableStore config validated
   📡 API: http://localhost:3001/api
   🔌 WebSocket: ws://localhost:3001
   ✅ WebSocket connected
   ```

### WebSocket连接测试

在浏览器Console中运行：

```javascript
const ws = new WebSocket('ws://localhost:3001');
ws.onopen = () => console.log('✅ Connected');
ws.onmessage = (e) => console.log('📨 Message:', JSON.parse(e.data));
```

## 🐛 常见问题

### 1. 后端无法启动

**错误**: `Missing required environment variables`

**解决**: 检查 `server/.env` 文件是否正确配置所有必需的环境变量。

---

**错误**: `TableStore连接失败`

**解决**: 
- 确认Endpoint是否正确
- 如果使用VPC endpoint，确保在VPC网络内运行
- 验证AccessKey是否有效

---

### 2. WebSocket连接失败

**错误**: `WebSocket connection failed`

**解决**:
- 确认后端服务已启动（http://localhost:3001）
- 检查防火墙是否阻止3001端口
- 查看浏览器Console的具体错误信息

---

### 3. CORS错误

**错误**: `Access to fetch blocked by CORS policy`

**解决**:
- 检查后端 `ALLOWED_ORIGINS` 配置
- 确保包含 `http://localhost:5173`
- 重启后端服务

---

### 4. Tunnel无法启动

**错误**: `Failed to start Tunnel Worker`

**解决**:
- 确认Tunnel ID是否正确
- 检查TableStore控制台中Tunnel状态是否为"启用"
- 查看后端日志获取详细错误

---

## 📊 查看日志

### 后端日志

```bash
# 开发模式下直接在终端查看
cd server
npm run dev

# 生产模式使用PM2
pm2 logs basketball-scorekeeper
```

### 前端日志

打开浏览器开发者工具 → Console标签

### 网络请求

开发者工具 → Network标签
- 查看API请求
- 查看WebSocket连接

---

## 🧪 功能测试

### 测试1: 创建会话

1. 在页面上点击"创建新会话"
2. 检查Console，应该看到：
   ```
   ✅ Created game session: ABC123
   ```

### 测试2: 实时同步

1. 打开两个浏览器窗口
2. 窗口1创建会话
3. 窗口2加入会话
4. 在窗口1中添加球员或更新比分
5. 窗口2应该立即看到更新

### 测试3: 事件记录

1. 在比赛中记录得分、犯规等事件
2. 切换到"统计"标签
3. 查看事件日志是否正确记录

---

## 📈 性能测试

### 测试延迟

在浏览器Console中：

```javascript
// 测试API延迟
const start = Date.now();
fetch('http://localhost:3001/api/health')
  .then(() => {
    console.log(`API延迟: ${Date.now() - start}ms`);
  });

// 测试WebSocket延迟
const ws = new WebSocket('ws://localhost:3001');
const pingStart = Date.now();
ws.onopen = () => {
  ws.send(JSON.stringify({ type: 'ping' }));
};
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.type === 'pong') {
    console.log(`WebSocket延迟: ${Date.now() - pingStart}ms`);
  }
};
```

### 预期性能指标

- API响应时间: < 100ms（本地）
- WebSocket延迟: < 50ms（本地）
- 数据同步延迟: < 500ms（包含TableStore往返）

---

## 🔧 开发技巧

### 1. 热重载

- 前端：修改代码自动刷新
- 后端：使用 `npm run dev` 自动重启

### 2. 调试

**后端调试**:
```bash
# 使用Node.js调试器
node --inspect dist/server.js
```

**前端调试**:
- 使用浏览器开发者工具
- 安装Vue DevTools扩展

### 3. 环境切换

```bash
# 开发环境
npm run dev

# 生产环境预览
npm run build
npm run preview
```

---

## 📚 下一步

- ✅ 完成基本功能测试
- 📖 阅读[完整部署指南](./TABLESTORE_DEPLOYMENT_GUIDE.md)
- 🚀 部署到生产环境
- 📊 配置监控和日志
- 🔒 设置安全规则

---

## 🆘 获取帮助

- 📖 查看[后端README](../server/README.md)
- 📖 查看[部署指南](./TABLESTORE_DEPLOYMENT_GUIDE.md)
- 🐛 提交[Issues](https://github.com/your-repo/issues)
- 📧 联系开发者

---

祝你使用愉快！🎉


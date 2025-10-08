# Java Tunnel Service使用指南

## 📖 简介

Java Tunnel Service监听阿里云TableStore的数据变更，通过HTTP回调通知Node.js服务，实现实时数据同步。

**为什么需要Java？** TableStore的Tunnel Service只有Java SDK支持。

## 🏗️ 架构

```
TableStore Tunnel → Java Service → HTTP回调 → Node.js → WebSocket → 前端
```

## 🚀 快速开始

### 本地开发

```bash
cd server-java

# 构建
mvn clean package

# 配置环境变量（创建.env文件或export）
export TABLESTORE_ENDPOINT=https://your-instance.cn-hangzhou.ots.aliyuncs.com
export TABLESTORE_INSTANCE_NAME=basketball-sk
export TABLESTORE_ACCESS_KEY_ID=LTAI***
export TABLESTORE_ACCESS_KEY_SECRET=***
export TUNNEL_GAME_SESSIONS_ID=6177***
export TUNNEL_GAME_EVENTS_ID=0fa1***
export NODEJS_CALLBACK_URL=http://localhost:3001
export PORT=8080

# 启动
java -jar target/tunnel-service.jar

# 查看日志
tail -f logs/application.log
```

### 生产部署

```bash
# 使用启动脚本
cd /opt/basketball-tunnel
./start.sh

# 查看状态
cat /var/run/tunnel-service.pid
ps aux | grep tunnel-service

# 停止/重启
./stop.sh
./restart.sh
```

## ⚙️ 配置说明

### 必需环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `TABLESTORE_ENDPOINT` | TableStore端点 | `https://your-instance.cn-hangzhou.ots.aliyuncs.com` |
| `TABLESTORE_INSTANCE_NAME` | 实例名称 | `basketball-sk` |
| `TABLESTORE_ACCESS_KEY_ID` | AccessKey ID | `LTAI***` |
| `TABLESTORE_ACCESS_KEY_SECRET` | AccessKey Secret | `***` |
| `TUNNEL_GAME_SESSIONS_ID` | GameSessions的Tunnel ID | `6177***` |
| `TUNNEL_GAME_EVENTS_ID` | GameEvents的Tunnel ID | `0fa1***` |
| `NODEJS_CALLBACK_URL` | Node.js回调地址 | `http://localhost:3001` |

### 可选配置

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `PORT` | `8080` | 服务端口 |

## 📁 项目结构

```
server-java/
├── src/main/java/com/basketball/
│   ├── TunnelApplication.java              # 主入口
│   ├── config/TableStoreConfig.java        # 配置类
│   ├── controller/HealthController.java    # 健康检查
│   ├── model/                              # 数据模型
│   ├── service/
│   │   ├── TunnelService.java              # Tunnel监听
│   │   ├── NotificationService.java        # HTTP回调
│   │   ├── GameSessionsProcessor.java      # 会话处理器
│   │   └── GameEventsProcessor.java        # 事件处理器
│   └── util/RecordParser.java              # 解析工具
├── src/main/resources/application.properties
├── pom.xml
├── start.sh
├── stop.sh
└── restart.sh
```

## 🔌 API端点

### 健康检查

```bash
curl http://localhost:8080/api/health
```

响应：
```json
{
  "status": "ok",
  "service": "basketball-tunnel-service",
  "timestamp": 1696742400000
}
```

### 服务信息

```bash
curl http://localhost:8080/api/info
```

## 🔄 工作流程

1. **启动时** → 连接GameSessions和GameEvents两个Tunnel
2. **数据变更** → TableStore推送变更记录
3. **解析处理** → Processor解析sessionId和数据
4. **HTTP回调** → POST到`http://localhost:3001/api/tunnel/callback`
5. **广播** → Node.js通过WebSocket广播给前端

## 🐛 常见问题

### 服务无法启动

```bash
# 检查Java版本（需要11+）
java -version

# 查看日志
cat logs/application.log

# 检查端口占用
lsof -i :8080
```

### Tunnel连接失败

**常见原因**：
- Tunnel ID不正确
- AccessKey权限不足
- 网络无法访问TableStore

**解决方法**：
```bash
# 检查配置
cat .env

# 查看连接日志
grep "Tunnel connected" logs/application.log
```

### 回调失败

```bash
# 确认Node.js服务运行
curl http://localhost:3001/api/health

# 查看回调日志
grep "callback" logs/application.log

# 手动测试回调接口
curl -X POST http://localhost:3001/api/tunnel/callback \
  -H "Content-Type: application/json" \
  -d '{"type":"gameState","sessionId":"TEST","data":"{}","timestamp":1696742400000}'
```

## 🔧 性能调优

### JVM参数

在`start.sh`中添加：

```bash
java -Xms256m -Xmx512m -XX:+UseG1GC -jar target/tunnel-service.jar
```

### 日志级别

在`application.properties`中调整：

```properties
# 生产环境
logging.level.com.basketball=INFO

# 开发/调试
logging.level.com.basketball=DEBUG
```

## 📊 监控

### 查看运行状态

```bash
# 检查进程
ps aux | grep tunnel-service

# 检查PID
cat /var/run/tunnel-service.pid

# 健康检查
curl http://localhost:8080/api/health
```

### 查看日志

```bash
# 实时日志
tail -f logs/application.log

# 搜索错误
grep "ERROR" logs/application.log

# 搜索Tunnel连接
grep "Tunnel" logs/application.log
```

## 📦 依赖说明

- **Spring Boot 2.7.14** - 应用框架
- **TableStore SDK 5.13.10** - TableStore客户端
- **Tunnel Client 1.2.6** - Tunnel监听
- **OkHttp 4.11.0** - HTTP回调
- **Jackson 2.15.2** - JSON处理

## 🔐 安全建议

1. **不要提交敏感信息** - `.env`已加入`.gitignore`
2. **使用RAM子账号** - 只授予TableStore读权限
3. **限制网络访问** - 配置安全组规则
4. **定期更新依赖** - `mvn versions:display-dependency-updates`

## ❓ FAQ

**Q: 为什么不直接在Node.js中使用Tunnel？**

A: TableStore的Tunnel Service只有Java SDK支持。

**Q: Java服务和Node.js必须在同一服务器吗？**

A: 不必须，但建议在同一内网以降低延迟。配置`NODEJS_CALLBACK_URL`指向Node.js服务地址即可。

**Q: 可以启动多个Java服务实例吗？**

A: 可以。Tunnel会自动负载均衡，分配不同的Channel给不同实例。

**Q: 数据延迟有多大？**

A: 通常100-500ms，包括：
- Tunnel推送延迟（~100ms）
- HTTP回调延迟（~10ms）
- WebSocket广播（~10ms）

## 📚 相关文档

- [快速部署指南](DEPLOYMENT_QUICK_GUIDE.md) - 完整部署流程
- [Node.js API文档](SERVER_README.md) - REST API说明
- [实现总结](TABLESTORE_IMPLEMENTATION_SUMMARY.md) - 架构和技术选型
- [协作测试](COLLABORATION_TEST_GUIDE.md) - 功能测试

---

详细的开发文档见 `server-java/` 目录。

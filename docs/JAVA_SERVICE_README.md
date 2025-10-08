# Basketball Scorekeeper - Java Tunnel Service

## 📖 简介

Java Tunnel Service是Basketball Scorekeeper的实时数据同步核心组件，负责监听阿里云TableStore的Tunnel Service推送的数据变更，并通过HTTP回调通知Node.js后端服务。

## 🏗️ 架构

```
TableStore Tunnel → Java Service → Node.js API → WebSocket → 前端客户端
```

## 🚀 快速开始

### 前置要求

- Java 11或更高版本
- Maven 3.6+
- 阿里云TableStore实例及Tunnel配置

### 构建

```bash
# 安装依赖并构建
mvn clean package

# 跳过测试构建
mvn clean package -DskipTests
```

构建产物：`target/tunnel-service.jar`

### 配置

创建配置文件或设置环境变量：

```bash
# 方式1：环境变量
export TABLESTORE_ENDPOINT=https://your-instance.cn-hangzhou.ots.aliyuncs.com
export TABLESTORE_INSTANCE_NAME=basketball-sk
export TABLESTORE_ACCESS_KEY_ID=LTAI***
export TABLESTORE_ACCESS_KEY_SECRET=***
export TUNNEL_GAME_SESSIONS_ID=6177***
export TUNNEL_GAME_EVENTS_ID=0fa1***
export NODEJS_CALLBACK_URL=http://localhost:3001
export PORT=8080

# 方式2：创建.env文件（需要配合环境变量加载工具）
```

### 运行

```bash
# 直接运行
java -jar target/tunnel-service.jar

# 或使用启动脚本
./start.sh

# 查看日志
tail -f logs/application.log

# 停止服务
./stop.sh

# 重启服务
./restart.sh
```

## 📁 项目结构

```
server-java/
├── src/main/java/com/basketball/
│   ├── TunnelApplication.java              # Spring Boot主入口
│   ├── config/
│   │   └── TableStoreConfig.java           # TableStore客户端配置
│   ├── controller/
│   │   └── HealthController.java           # 健康检查API
│   ├── model/
│   │   ├── TunnelRecord.java               # Tunnel数据记录
│   │   └── CallbackRequest.java            # 回调请求模型
│   ├── service/
│   │   ├── TunnelService.java              # Tunnel监听主服务
│   │   ├── NotificationService.java        # HTTP回调通知服务
│   │   ├── RecordProcessor.java            # 记录处理器接口
│   │   ├── GameSessionsProcessor.java      # GameSessions表处理器
│   │   └── GameEventsProcessor.java        # GameEvents表处理器
│   └── util/
│       └── RecordParser.java               # TableStore记录解析工具
├── src/main/resources/
│   └── application.properties              # Spring Boot配置
├── pom.xml                                 # Maven依赖配置
├── start.sh                                # 启动脚本
├── stop.sh                                 # 停止脚本
└── restart.sh                              # 重启脚本
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

响应：
```json
{
  "service": "Basketball Scorekeeper Tunnel Service",
  "version": "1.0.0",
  "description": "TableStore Tunnel Service for real-time data sync"
}
```

## 🔄 工作流程

1. **启动时** - 连接到TableStore的两个Tunnel（GameSessions和GameEvents）
2. **数据变更** - TableStore推送变更记录到Java服务
3. **解析处理** - 对应的Processor解析主键和属性列
4. **HTTP回调** - 通过NotificationService发送回调到Node.js服务
5. **WebSocket广播** - Node.js服务接收后广播给前端客户端

## 🛠️ 开发

### 本地开发

```bash
# 启动开发服务器（热重载）
mvn spring-boot:run

# 或使用IDE（IntelliJ IDEA推荐）
# Run > Edit Configurations > Spring Boot > TunnelApplication
```

### 测试

```bash
# 运行测试
mvn test

# 生成测试报告
mvn surefire-report:report
```

### 代码检查

```bash
# Maven checkstyle（如果配置了）
mvn checkstyle:check

# 或使用IDE的代码检查功能
```

## 📦 部署

### Docker部署（可选）

创建 `Dockerfile`:

```dockerfile
FROM openjdk:11-jre-slim
WORKDIR /app
COPY target/tunnel-service.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

构建和运行：

```bash
docker build -t basketball-tunnel-service .
docker run -d -p 8080:8080 \
  -e TABLESTORE_ENDPOINT=... \
  -e TABLESTORE_INSTANCE_NAME=... \
  basketball-tunnel-service
```

### GitHub Actions自动部署

项目已配置 `.github/workflows/deploy-java-tunnel.yml`，推送代码后自动部署到ECS。

## 🔍 故障排查

### 服务无法启动

```bash
# 检查Java版本
java -version  # 需要11+

# 检查端口占用
lsof -i :8080

# 查看详细日志
cat logs/application.log
```

### Tunnel连接失败

常见原因：
- Tunnel ID不正确
- AccessKey权限不足
- 网络无法访问TableStore（检查防火墙/安全组）

```bash
# 检查配置
cat .env

# 测试TableStore连接
curl -v https://your-instance.cn-hangzhou.ots.aliyuncs.com
```

### 回调失败

```bash
# 确认Node.js服务运行
curl http://localhost:3001/api/health

# 查看回调日志
grep "callback" logs/application.log

# 手动测试回调
curl -X POST http://localhost:3001/api/tunnel/callback \
  -H "Content-Type: application/json" \
  -d '{"type":"gameState","sessionId":"TEST","data":"{}","timestamp":1696742400000}'
```

## 📊 性能调优

### JVM参数

在 `start.sh` 中添加：

```bash
java -Xms256m -Xmx512m \
     -XX:+UseG1GC \
     -XX:MaxGCPauseMillis=200 \
     -jar target/tunnel-service.jar
```

### 日志级别

在 `application.properties` 中调整：

```properties
# 生产环境建议使用INFO
logging.level.com.basketball=INFO

# 开发/调试使用DEBUG
logging.level.com.basketball=DEBUG
```

## 📚 依赖说明

主要依赖：

- **Spring Boot 2.7.14** - 应用框架
- **TableStore SDK 5.13.10** - TableStore Java客户端
- **TableStore Tunnel Client 1.2.6** - Tunnel监听客户端
- **OkHttp 4.11.0** - HTTP客户端（用于回调）
- **Jackson 2.15.2** - JSON序列化
- **Lombok 1.18.28** - 代码简化

完整依赖列表见 `pom.xml`。

## 🔐 安全建议

1. **不要提交敏感信息** - `.env`文件已加入`.gitignore`
2. **使用RAM子账号** - 创建专用的AccessKey，只授予TableStore读权限
3. **限制网络访问** - 配置安全组，只允许必要的端口
4. **定期更新依赖** - 使用`mvn versions:display-dependency-updates`检查更新

## 📄 许可证

MIT License

## 🔗 相关链接

- [完整文档](../docs/JAVA_TUNNEL_SERVICE.md)
- [部署指南](../docs/DEPLOYMENT_QUICK_GUIDE.md)
- [TableStore文档](https://help.aliyun.com/product/27278.html)
- [Tunnel Service指南](https://help.aliyun.com/document_detail/102373.html)


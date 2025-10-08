# Java Tunnel Service 实现总结

## 🎯 项目概述

成功实现了基于阿里云TableStore Tunnel Service的实时数据同步Java微服务。

## 📦 技术栈

- **Java 17**
- **Spring Boot 2.7.14**
- **TableStore SDK 5.13.10**（包含Tunnel功能）
- **OkHttp 4.11.0**（HTTP回调）
- **Jackson 2.15.2**（JSON序列化）
- **SLF4J + Logback**（日志）

## 🏗️ 架构设计

```
TableStore数据变更
    ↓
Java Tunnel Service（监听）
    ↓ HTTP回调
Node.js后端（/api/tunnel/callback）
    ↓ WebSocket广播
前端（实时更新）
```

## 📁 项目结构

```
server-java/
├── src/main/java/com/basketball/
│   ├── TunnelApplication.java         # 主入口
│   ├── config/
│   │   └── TableStoreConfig.java      # 配置类
│   ├── controller/
│   │   └── HealthController.java      # 健康检查
│   ├── model/
│   │   └── CallbackRequest.java       # 回调请求模型
│   ├── service/
│   │   ├── TunnelService.java         # Tunnel主服务
│   │   ├── GameSessionsProcessor.java # GameSessions处理器
│   │   ├── GameEventsProcessor.java   # GameEvents处理器
│   │   └── NotificationService.java   # HTTP通知服务
│   └── util/
│       └── RecordParser.java          # 记录解析工具
└── src/main/resources/
    └── application.properties         # 应用配置
```

## 🔑 核心API使用

### 1. Tunnel Client 初始化

```java
@Bean
public TunnelClient tunnelClient() {
    return new TunnelClient(
        endpoint,
        accessKeyId,
        accessKeySecret,
        instanceName
    );
}
```

### 2. 实现 IChannelProcessor

```java
@Component
public class GameSessionsProcessor implements IChannelProcessor {
    
    @Override
    public void process(ProcessRecordsInput input) {
        List<StreamRecord> records = input.getRecords();
        
        for (StreamRecord record : records) {
            if (record.getRecordType() != StreamRecord.RecordType.PUT) {
                continue;
            }
            
            // 解析主键
            Map<String, Object> primaryKey = RecordParser.parsePrimaryKey(
                record.getPrimaryKey()
            );
            
            // 解析属性列
            Map<String, Object> columns = RecordParser.parseColumns(
                record.getColumns()
            );
            
            // 发送HTTP回调
            notificationService.notifyGameStateChange(sessionId, gameStateJson);
        }
    }
    
    @Override
    public void shutdown() {
        // 清理资源
    }
}
```

### 3. Tunnel Worker 启动

```java
TunnelWorkerConfig workerConfig = new TunnelWorkerConfig(processor);
TunnelWorker worker = new TunnelWorker(tunnelId, tunnelClient, workerConfig);
worker.connectAndWorking();
```

### 4. 数据解析

```java
// 主键解析
public static Map<String, Object> parsePrimaryKey(PrimaryKey primaryKey) {
    Map<String, Object> result = new HashMap<>();
    for (PrimaryKeyColumn column : primaryKey.getPrimaryKeyColumns()) {
        String name = column.getName();
        Object value = column.getValue().asString();
        result.put(name, value);
    }
    return result;
}

// 列值解析
private static Object parseColumnValue(ColumnValue value) {
    ColumnType type = value.getType();
    switch (type) {
        case STRING: return value.asString();
        case INTEGER: return value.asLong();
        case DOUBLE: return value.asDouble();
        case BOOLEAN: return value.asBoolean();
        case BINARY: return value.asBinary();
        default: return value.toString();
    }
}
```

## ⚙️ 配置说明

### application.properties

```properties
# TableStore配置
tablestore.endpoint=${TABLESTORE_ENDPOINT}
tablestore.instance-name=${TABLESTORE_INSTANCE_NAME}
tablestore.access-key-id=${TABLESTORE_ACCESS_KEY_ID}
tablestore.access-key-secret=${TABLESTORE_ACCESS_KEY_SECRET}

# Tunnel配置
tunnel.game-sessions-id=${TUNNEL_GAME_SESSIONS_ID}
tunnel.game-events-id=${TUNNEL_GAME_EVENTS_ID}

# 回调配置
callback.nodejs-url=${NODEJS_CALLBACK_URL}

# 服务器配置
server.port=${SERVER_PORT:8080}
```

### 环境变量

- `TABLESTORE_ENDPOINT`: TableStore实例Endpoint
- `TABLESTORE_INSTANCE_NAME`: 实例名称
- `TABLESTORE_ACCESS_KEY_ID`: AccessKey ID
- `TABLESTORE_ACCESS_KEY_SECRET`: AccessKey Secret
- `TUNNEL_GAME_SESSIONS_ID`: GameSessions Tunnel ID
- `TUNNEL_GAME_EVENTS_ID`: GameEvents Tunnel ID
- `NODEJS_CALLBACK_URL`: Node.js回调地址
- `SERVER_PORT`: 服务端口（默认8080）

## 🚀 部署方式

### 1. 本地运行

```bash
# 编译
mvn clean package

# 运行
java -jar target/tunnel-service.jar
```

### 2. ECS部署（使用systemd）

创建服务文件 `/etc/systemd/system/basketball-tunnel.service`:

```ini
[Unit]
Description=Basketball Scorekeeper Tunnel Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/basketball-tunnel-service
EnvironmentFile=/opt/basketball-tunnel-service/.env
ExecStart=/usr/bin/java -jar /opt/basketball-tunnel-service/tunnel-service.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
sudo systemctl daemon-reload
sudo systemctl enable basketball-tunnel
sudo systemctl start basketball-tunnel
sudo systemctl status basketball-tunnel
```

### 3. GitHub Actions自动部署

配置文件：`.github/workflows/deploy-java-tunnel.yml`

触发条件：推送到main分支且修改了`server-java/**`

## 🔧 关键问题解决

### 1. Tunnel SDK问题

❌ **问题**：Node.js SDK不支持Tunnel Service
✅ **解决**：使用Java SDK实现Tunnel监听

### 2. Lombok兼容性问题

❌ **问题**：`TypeTag.UNKNOWN` 编译错误
✅ **解决**：移除Lombok，手动实现getter/setter/builder

### 3. API使用问题

❌ **问题**：找不到`tunnel.Record`、`tunnel.RecordType`
✅ **解决**：使用`StreamRecord`和`StreamRecord.RecordType`

### 4. 类型解析问题

❌ **问题**：`PrimaryKey`不是`List<PrimaryKeyColumn>`
✅ **解决**：使用`primaryKey.getPrimaryKeyColumns()`

❌ **问题**：`ColumnValue`没有`isString()`等方法
✅ **解决**：使用`value.getType()`和`switch`语句

## 📊 API端点

### 健康检查

```bash
GET http://localhost:8080/api/health
```

响应：
```json
{
  "status": "ok",
  "service": "basketball-tunnel-service",
  "timestamp": 1696723200000
}
```

### 服务信息

```bash
GET http://localhost:8080/api/info
```

响应：
```json
{
  "service": "Basketball Scorekeeper Tunnel Service",
  "version": "1.0.0",
  "description": "TableStore Tunnel Service for real-time data sync"
}
```

## 🔍 故障排查

### 查看日志

```bash
# systemd服务日志
journalctl -u basketball-tunnel -f

# 应用日志（如果配置了文件输出）
tail -f /var/log/basketball-tunnel/application.log
```

### 常见问题

1. **连接TableStore失败**
   - 检查Endpoint是否正确（VPC还是公网）
   - 检查AccessKey ID和Secret
   - 检查网络安全组配置

2. **Tunnel无法启动**
   - 检查Tunnel ID是否正确
   - 检查表是否开启了Stream功能
   - 检查Tunnel状态（在TableStore控制台）

3. **HTTP回调失败**
   - 检查Node.js服务是否运行
   - 检查回调URL是否正确
   - 检查网络连通性

## 📝 开发注意事项

1. **Stream过期时间**：默认7天，需要在创建表时设置
2. **Tunnel类型**：
   - `BaseData`：全量数据
   - `Stream`：增量数据
   - `BaseAndStream`：全量+增量
3. **数据解析**：JSON字符串需要先从TableStore读取，再反序列化
4. **异常处理**：Tunnel Worker会自动重试，但需要记录日志

## 🎉 总结

成功实现了完整的TableStore Tunnel实时数据同步功能，解决了多个SDK和API使用问题，提供了生产级的Java微服务实现。


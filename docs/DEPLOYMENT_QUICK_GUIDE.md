# 🚀 快速部署指南

本指南帮助您快速部署Basketball Scorekeeper的完整系统（前端 + Node.js后端 + Java Tunnel服务）。

## 📋 前置要求

### 阿里云资源
- ✅ **TableStore实例** - 已创建GameSessions和GameEvents表
- ✅ **Tunnel服务** - 已为两个表创建Tunnel
- ✅ **ECS实例** - 用于部署后端服务（推荐2核4G，Debian/Ubuntu系统）
- ✅ **AccessKey** - 有TableStore读写权限

### GitHub配置
- ✅ **GitHub仓库** - 代码已推送
- ✅ **GitHub Pages** - 已启用（用于前端部署）
- ✅ **Secrets配置** - 见下文

## 🔑 GitHub Secrets配置

在GitHub仓库的 `Settings > Secrets and variables > Actions` 中添加以下Secrets：

### 通用配置
| Secret名称 | 说明 | 示例 |
|-----------|------|------|
| `ECS_HOST` | ECS公网IP | `123.56.78.90` |
| `ECS_USERNAME` | SSH用户名 | `root` |
| `ECS_SSH_KEY` | SSH私钥内容 | `-----BEGIN RSA PRIVATE KEY-----...` |

### TableStore配置
| Secret名称 | 说明 |
|-----------|------|
| `TABLESTORE_ENDPOINT` | TableStore端点（**使用公网地址**） |
| `TABLESTORE_INSTANCE_NAME` | 实例名称 |
| `TABLESTORE_ACCESS_KEY_ID` | AccessKey ID |
| `TABLESTORE_ACCESS_KEY_SECRET` | AccessKey Secret |
| `TUNNEL_GAME_SESSIONS_ID` | GameSessions的Tunnel ID |
| `TUNNEL_GAME_EVENTS_ID` | GameEvents的Tunnel ID |

### 前端环境变量（构建时使用）
| Secret名称 | 说明 |
|-----------|------|
| `VITE_TABLESTORE_API_URL` | Node.js API地址，如 `http://your-ip:3001` |
| `VITE_TABLESTORE_WS_URL` | WebSocket地址，如 `ws://your-ip:3001` |

### Firebase配置（可选）
如果使用Firebase，添加：
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- 等（参考FIREBASE_SETUP_GUIDE.md）

### LeanCloud配置（可选）
如果使用LeanCloud，添加：
- `VITE_LEANCLOUD_APP_ID`
- `VITE_LEANCLOUD_APP_KEY`
- `VITE_LEANCLOUD_SERVER_URL`

## 📦 部署步骤

### 步骤1：配置ECS安全组

在阿里云ECS控制台，配置安全组规则：

| 端口 | 协议 | 说明 |
|-----|------|------|
| `22` | TCP | SSH访问 |
| `3001` | TCP | Node.js API和WebSocket |
| `8080` | TCP | Java Tunnel服务（可选，仅健康检查） |

### 步骤2：首次手动初始化ECS

SSH登录ECS，创建部署目录：

```bash
# 创建Node.js服务目录
sudo mkdir -p /opt/basketball-scorekeeper
sudo chown $USER:$USER /opt/basketball-scorekeeper

# 创建Java服务目录
sudo mkdir -p /opt/basketball-tunnel
sudo chown $USER:$USER /opt/basketball-tunnel
```

### 步骤3：推送代码触发部署

```bash
git add .
git commit -m "feat: add java tunnel service"
git push origin main
```

GitHub Actions会自动执行三个workflow：
1. ✅ **deploy-frontend.yml** - 部署前端到GitHub Pages
2. ✅ **deploy-backend.yml** - 部署Node.js服务到ECS
3. ✅ **deploy-java-tunnel.yml** - 部署Java服务到ECS

### 步骤4：验证部署

**前端验证：**
```bash
# 访问GitHub Pages地址
https://your-username.github.io/Basketball-Scorekeeper/
```

**Node.js服务验证：**
```bash
# 在ECS上检查
ssh user@your-ecs-ip
pm2 status
pm2 logs basketball-scorekeeper

# 外部测试
curl http://your-ecs-ip:3001/api/health
```

**Java服务验证：**
```bash
# 在ECS上检查
ssh user@your-ecs-ip
cat /var/run/tunnel-service.pid
ps aux | grep tunnel-service
tail -f /opt/basketball-tunnel/logs/application.log

# 外部测试（如果开放了8080端口）
curl http://your-ecs-ip:8080/api/health
```

## 🔍 故障排查

### 前端部署失败
```bash
# 检查GitHub Actions日志
# 常见问题：环境变量未配置、构建错误
```

### Node.js服务无法启动
```bash
ssh user@your-ecs-ip
cd /opt/basketball-scorekeeper

# 查看日志
pm2 logs basketball-scorekeeper --lines 50

# 常见问题：
# 1. 环境变量缺失 - 检查 cat .env
# 2. 端口被占用 - lsof -i :3001
# 3. 依赖安装失败 - 重新运行 npm ci
```

### Java服务无法启动
```bash
ssh user@your-ecs-ip
cd /opt/basketball-tunnel

# 查看日志
cat logs/application.log

# 常见问题：
# 1. Java未安装 - java -version
# 2. 环境变量缺失 - cat .env
# 3. Tunnel连接失败 - 检查AccessKey和Tunnel ID
# 4. 回调失败 - 检查Node.js服务是否运行
```

### Tunnel不推送数据
```bash
# 1. 检查Java服务是否连接成功
grep "Tunnel connected" /opt/basketball-tunnel/logs/application.log

# 2. 手动触发数据变更
# 在前端创建新会话或修改数据

# 3. 检查回调是否发送
grep "Callback sent" /opt/basketball-tunnel/logs/application.log

# 4. 检查Node.js是否接收
grep "tunnel/callback" /opt/basketball-scorekeeper/logs/out-0.log
```

### WebSocket连接失败
```bash
# 1. 检查防火墙/安全组是否开放3001端口

# 2. 检查Node.js服务是否运行
pm2 status

# 3. 在浏览器控制台查看错误
# F12 > Console > 查看WebSocket连接错误

# 4. 确认环境变量配置正确
# VITE_TABLESTORE_WS_URL=ws://your-ip:3001（注意是ws://不是wss://）
```

## 🔄 更新部署

代码更新后，只需推送到GitHub：

```bash
git add .
git commit -m "feat: new feature"
git push origin main
```

GitHub Actions会自动：
1. 重新构建前端（如果前端代码变更）
2. 重新部署Node.js服务（自动重启PM2）
3. 重新部署Java服务（自动重启进程）

## 📊 监控和维护

### 查看服务状态
```bash
# Node.js服务
pm2 status
pm2 monit  # 实时监控

# Java服务
ps aux | grep tunnel-service
cat /var/run/tunnel-service.pid
```

### 查看日志
```bash
# Node.js服务
pm2 logs basketball-scorekeeper
pm2 logs basketball-scorekeeper --lines 100

# Java服务
tail -f /opt/basketball-tunnel/logs/application.log
```

### 手动重启服务
```bash
# Node.js服务
pm2 restart basketball-scorekeeper

# Java服务
cd /opt/basketball-tunnel
./restart.sh
```

## 🎯 性能优化建议

1. **使用TableStore内网地址**
   - 如果ECS和TableStore在同一区域，使用VPC内网地址
   - 降低延迟，节省流量费用

2. **配置PM2集群模式**
   ```bash
   # 编辑 ecosystem.config.js
   instances: 2,  # 改为2个实例
   exec_mode: 'cluster'
   ```

3. **启用前端CDN**
   - GitHub Pages已默认使用CDN
   - 或考虑部署到阿里云OSS + CDN

4. **监控告警**
   - 配置阿里云监控告警
   - ECS CPU/内存/磁盘使用率
   - TableStore读写QPS

## 📚 相关文档

- [TableStore完整部署指南](TABLESTORE_DEPLOYMENT_GUIDE.md)
- [Java Tunnel服务文档](JAVA_TUNNEL_SERVICE.md)
- [Node.js后端文档](SERVER_README.md)
- [协作功能测试](COLLABORATION_TEST_GUIDE.md)

## ❓ 常见问题

**Q: 必须使用ECS吗？**

A: 不一定。任何支持Node.js和Java的服务器都可以，但建议使用阿里云ECS以获得更好的内网连接性能。

**Q: 可以分别部署到不同服务器吗？**

A: 可以。Node.js和Java服务可以部署在不同机器上，只需：
1. Java服务的`NODEJS_CALLBACK_URL`指向Node.js服务的地址
2. 前端的`VITE_TABLESTORE_API_URL`指向Node.js服务的地址

**Q: 成本大概是多少？**

A: 以最低配置估算（按量付费）：
- ECS 2核4G：~0.3元/小时
- TableStore：~0.01元/万次读写
- 流量：~0.8元/GB
- **月成本约200-300元**

**Q: 如何备份数据？**

A: TableStore数据自动备份，也可以：
1. 导出历史数据（前端"历史记录"页面）
2. 定时备份TableStore表（使用阿里云备份服务）

---

部署完成！🎉 如有问题，请查看详细文档或提issue。

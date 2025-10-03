# 阿里云TableStore部署指南

本指南将帮助你完成Basketball Scorekeeper使用阿里云TableStore的完整部署流程。

## 📋 目录

1. [阿里云准备工作](#1-阿里云准备工作)
2. [ECS服务器购买和配置](#2-ecs服务器购买和配置)
3. [后端服务部署](#3-后端服务部署)
4. [前端配置和部署](#4-前端配置和部署)
5. [GitHub Actions配置](#5-github-actions配置)
6. [验证和测试](#6-验证和测试)

---

## 1. 阿里云准备工作

### 1.1 开通TableStore服务

1. 登录[阿里云控制台](https://home.console.aliyun.com/)
2. 搜索"表格存储"或访问 https://ots.console.aliyun.com/
3. 点击"立即开通"

### 1.2 创建TableStore实例

1. 进入表格存储控制台
2. 点击"创建实例"
3. 配置：
   - **实例名称**: `your-instance-name`（自定义）
   - **地域**: 华东1（杭州）或其他地域
   - **实例类型**: 高性能实例
   - **网络类型**: VPC网络
4. 等待实例创建完成

### 1.3 创建数据表

#### 创建GameSessions表
1. 进入实例详情页
2. 点击"创建数据表"
3. 填写：
   - **表名**: `GameSessions`
   - **主键**: `sessionId` (String类型)
   - **数据生命周期**: `604800` (7天)
   - **最大版本数**: `1`
   - **允许更新**: ✅ 勾选
4. 点击确定

#### 创建GameEvents表
1. 再次点击"创建数据表"
2. 填写：
   - **表名**: `GameEvents`
   - **主键1**: `sessionId` (String类型)
   - **主键2**: `eventId` (String类型)
   - **数据生命周期**: `604800` (7天)
   - **最大版本数**: `1`
   - **允许更新**: ✅ 勾选
3. 点击确定

#### 为GameEvents创建索引
1. 进入GameEvents表详情
2. 点击"索引管理"标签
3. 点击"创建索引"
4. 配置：
   - **索引名称**: `timestamp_index`
   - **索引类型**: 全局二级索引
   - **预定义列**: `timestamp` (Integer类型)
   - **索引主键**:
     - 第一主键: `timestamp`
     - 第二主键: `sessionId`
     - 第三主键: `eventId`
5. 点击确定

### 1.4 创建Tunnel通道

#### GameSessions通道
1. 进入GameSessions表详情
2. 点击"通道管理"标签
3. 点击"创建通道"
4. 配置：
   - **通道名称**: `GameSessionsTunnel`
   - **通道类型**: 增量
5. 记录生成的Tunnel ID

#### GameEvents通道
1. 进入GameEvents表详情
2. 点击"通道管理"标签
3. 点击"创建通道"
4. 配置：
   - **通道名称**: `GameEventsTunnel`
   - **通道类型**: 增量
5. 记录生成的Tunnel ID

### 1.5 获取访问凭证

1. 点击右上角头像 → "AccessKey管理"
2. 创建AccessKey（如果没有）
3. 记录：
   - AccessKey ID
   - AccessKey Secret

### 1.6 记录配置信息

将以下信息记录下来（后续需要用到）：

```
实例信息：
- 实例名称: your_instance_name
- Endpoint: https://your-instance.cn-region.vpc.tablestore.aliyuncs.com
- 地域: cn-hangzhou（或你选择的地域）

访问凭证：
- AccessKey ID: LTAI5txxxxxxxxxx（从阿里云控制台获取）
- AccessKey Secret: ********（从阿里云控制台获取）

Tunnel信息：
- GameSessions Tunnel ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
- GameEvents Tunnel ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

## 2. ECS服务器购买和配置

### 2.1 购买ECS实例

1. 访问[ECS控制台](https://ecs.console.aliyun.com/)
2. 点击"创建实例"
3. 选择配置：
   - **计费方式**: 按量付费（测试）或包年包月（生产）
   - **地域**: 华东1（杭州）- 与TableStore同地域
   - **实例规格**: ecs.t6-c1m1.large（1核2GB）
   - **镜像**: Ubuntu 22.04 64位
   - **存储**: 系统盘 20GB 高效云盘
   - **网络**: 
     - 专有网络VPC: 选择与TableStore相同的VPC
     - 公网IP: 分配
     - 带宽: 1Mbps按使用流量
   - **安全组**: 
     - 开放 22 (SSH)
     - 开放 80 (HTTP)
     - 开放 443 (HTTPS)
     - 开放 3001 (后端API)

4. 设置root密码或SSH密钥
5. 完成购买

### 2.2 记录ECS信息

```
ECS信息：
- 公网IP: xxx.xxx.xxx.xxx
- 内网IP: 192.168.x.x
- SSH用户名: root
- SSH密码/密钥: ******
```

### 2.3 配置ECS服务器

#### 连接到ECS

```bash
ssh root@your-ecs-ip
```

#### 安装Node.js

```bash
# 更新系统
apt update && apt upgrade -y

# 安装Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# 验证安装
node --version
npm --version
```

#### 安装PM2

```bash
npm install -g pm2
```

#### 创建应用目录

```bash
mkdir -p /opt/basketball-scorekeeper
```

---

## 3. 后端服务部署

### 3.1 手动部署（首次）

#### 1. 在本地构建

```bash
cd server
npm install
npm run build
```

#### 2. 上传到ECS

```bash
# 上传文件（在本地执行）
scp -r dist package.json package-lock.json ecosystem.config.js root@your-ecs-ip:/opt/basketball-scorekeeper/
```

#### 3. 在ECS上配置

```bash
# SSH到ECS
ssh root@your-ecs-ip

# 进入目录
cd /opt/basketball-scorekeeper

# 创建.env文件
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
NODE_ENV=production

ALLOWED_ORIGINS=https://your-frontend-domain.com
EOF

# 安装依赖
npm ci --production

# 创建日志目录
mkdir -p logs

# 启动服务
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 4. 验证服务

```bash
# 检查服务状态
pm2 status

# 查看日志
pm2 logs basketball-scorekeeper

# 测试API
curl http://localhost:3001/api/health
```

### 3.2 配置防火墙（如果需要）

```bash
# 开放3001端口
ufw allow 3001
ufw reload
```

---

## 4. 前端配置和部署

### 4.1 配置环境变量

在项目根目录创建 `.env.production` 文件：

```env
VITE_TABLESTORE_API_URL=http://your-ecs-ip:3001/api
VITE_TABLESTORE_WS_URL=ws://your-ecs-ip:3001
```

### 4.2 本地构建测试

```bash
npm run build
npm run preview
```

### 4.3 部署到GitHub Pages

前端会通过GitHub Actions自动部署到GitHub Pages。

---

## 5. GitHub Actions配置

### 5.1 配置GitHub Secrets

在GitHub仓库设置中（Settings → Secrets and variables → Actions），添加以下Secrets：

#### 后端部署相关
```
ECS_HOST = xxx.xxx.xxx.xxx
ECS_USERNAME = root
ECS_SSH_KEY = -----BEGIN OPENSSH PRIVATE KEY-----
...你的SSH私钥...
-----END OPENSSH PRIVATE KEY-----
```

#### TableStore配置
```
TABLESTORE_INSTANCE_NAME = your_instance_name
TABLESTORE_ENDPOINT = https://your-instance.cn-region.vpc.tablestore.aliyuncs.com
TABLESTORE_ACCESS_KEY_ID = LTAI5txxxxxxxxxx
TABLESTORE_ACCESS_KEY_SECRET = ********
TABLESTORE_REGION = cn-hangzhou
TUNNEL_GAME_SESSIONS_ID = xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
TUNNEL_GAME_EVENTS_ID = xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

#### 其他配置
```
ALLOWED_ORIGINS = https://yourusername.github.io
VITE_TABLESTORE_API_URL = http://your-ecs-ip:3001/api
VITE_TABLESTORE_WS_URL = ws://your-ecs-ip:3001
```

### 5.2 获取SSH私钥

在本地生成（如果没有）：

```bash
# 生成新的SSH密钥对
ssh-keygen -t rsa -b 4096 -f ~/.ssh/ecs_deploy

# 复制公钥到ECS
ssh-copy-id -i ~/.ssh/ecs_deploy.pub root@your-ecs-ip

# 复制私钥内容（用于GitHub Secret）
cat ~/.ssh/ecs_deploy
```

### 5.3 启用GitHub Pages

1. 进入仓库Settings → Pages
2. Source选择"GitHub Actions"
3. 保存

### 5.4 触发部署

```bash
# 推送代码触发部署
git add .
git commit -m "Configure TableStore deployment"
git push origin main
```

---

## 6. 验证和测试

### 6.1 检查后端服务

```bash
# 在ECS上检查
pm2 status
pm2 logs basketball-scorekeeper

# 测试API（本地）
curl http://your-ecs-ip:3001/api/health
```

预期响应：
```json
{
  "status": "ok",
  "timestamp": 1234567890,
  "service": "Basketball Scorekeeper API"
}
```

### 6.2 检查WebSocket

使用浏览器控制台测试：

```javascript
const ws = new WebSocket('ws://your-ecs-ip:3001');
ws.onopen = () => console.log('✅ WebSocket connected');
ws.onerror = (e) => console.error('❌ WebSocket error:', e);
```

### 6.3 测试完整流程

1. 访问前端页面
2. 切换到"协同模式"标签
3. 选择"阿里云TableStore"服务
4. 创建新会话
5. 在另一个浏览器/设备加入会话
6. 测试实时同步功能

### 6.4 监控和日志

```bash
# 查看PM2日志
pm2 logs basketball-scorekeeper --lines 100

# 查看错误日志
tail -f /opt/basketball-scorekeeper/logs/error.log

# 查看输出日志
tail -f /opt/basketball-scorekeeper/logs/out.log
```

---

## 🎉 部署完成

现在你的Basketball Scorekeeper已经完全配置好阿里云TableStore协同功能！

### 下一步

- 配置域名和SSL证书（可选）
- 设置监控和告警
- 定期备份数据
- 优化性能

### 常见问题

#### Q: WebSocket连接失败？
A: 检查ECS安全组是否开放3001端口，防火墙规则是否正确。

#### Q: Tunnel无法启动？
A: 确认Tunnel ID正确，检查TableStore控制台中Tunnel状态。

#### Q: CORS错误？
A: 检查后端的ALLOWED_ORIGINS配置是否包含前端域名。

#### Q: 如何更新服务？
A: 推送代码到main分支，GitHub Actions会自动部署。或手动：
```bash
cd /opt/basketball-scorekeeper
git pull
npm run build
pm2 restart basketball-scorekeeper
```

---

## 📞 技术支持

如遇问题，请查看：
- [后端README](../server/README.md)
- [阿里云TableStore文档](https://help.aliyun.com/product/27278.html)
- [项目Issues](https://github.com/your-repo/issues)


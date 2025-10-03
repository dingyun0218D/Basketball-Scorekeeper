# 后端环境变量配置模板

在 `server/` 目录下创建 `.env` 文件，并填入以下内容：

```env
# ========================================
# TableStore 配置
# ========================================

# 实例名称（从阿里云TableStore控制台获取）
TABLESTORE_INSTANCE_NAME=your_instance_name

# Endpoint地址（根据你的实例地域）
# VPC内网地址示例（推荐，延迟更低）:
TABLESTORE_ENDPOINT=https://your-instance.cn-region.vpc.tablestore.aliyuncs.com
# 公网地址示例（如果不在VPC内）:
# TABLESTORE_ENDPOINT=https://your-instance.cn-region.ots.aliyuncs.com

# 阿里云访问凭证（从阿里云AccessKey管理获取）
TABLESTORE_ACCESS_KEY_ID=LTAI5txxxxxxxxxx
TABLESTORE_ACCESS_KEY_SECRET=your_access_key_secret_here

# 地域（根据你的实例所在地域）
TABLESTORE_REGION=cn-hangzhou

# ========================================
# Tunnel 配置
# ========================================

# GameSessions表的Tunnel ID（从TableStore控制台获取）
TUNNEL_GAME_SESSIONS_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# GameEvents表的Tunnel ID（从TableStore控制台获取）
TUNNEL_GAME_EVENTS_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# ========================================
# 表名配置
# ========================================

TABLE_GAME_SESSIONS=GameSessions
TABLE_GAME_EVENTS=GameEvents

# ========================================
# 服务器配置
# ========================================

# 服务端口
PORT=3001

# 运行环境 (development | production)
NODE_ENV=development

# ========================================
# CORS 配置
# ========================================

# 允许的前端域名（逗号分隔，无空格）
# 开发环境:
ALLOWED_ORIGINS=http://localhost:5173
# 生产环境示例:
# ALLOWED_ORIGINS=https://yourusername.github.io,https://your-domain.com
```

## 📝 配置说明

### TABLESTORE_INSTANCE_NAME

你在阿里云TableStore控制台创建的实例名称。

### TABLESTORE_ENDPOINT 选择

**VPC内网地址**（推荐）:
- 格式: `https://实例名.地域.vpc.tablestore.aliyuncs.com`
- 优点: 延迟低，安全，不占用公网带宽
- 缺点: 必须在阿里云VPC内访问（ECS、容器服务等）

**公网地址**:
- 格式: `https://实例名.地域.ots.aliyuncs.com`
- 优点: 任何地方都可访问
- 缺点: 延迟高，占用公网带宽

### 地域代码对照表

| 地域 | Region ID | VPC Endpoint 格式 |
|------|-----------|------------------|
| 华东1（杭州） | cn-hangzhou | xxx.cn-hangzhou.vpc.tablestore.aliyuncs.com |
| 华东2（上海） | cn-shanghai | xxx.cn-shanghai.vpc.tablestore.aliyuncs.com |
| 华北2（北京） | cn-beijing | xxx.cn-beijing.vpc.tablestore.aliyuncs.com |
| 华南1（深圳） | cn-shenzhen | xxx.cn-shenzhen.vpc.tablestore.aliyuncs.com |

### TABLESTORE_ACCESS_KEY_ID 和 SECRET

从阿里云控制台获取：
1. 点击右上角头像
2. 选择"AccessKey管理"
3. 创建或查看AccessKey

⚠️ **安全提示**：建议创建RAM子账号，只授予TableStore权限。

### TUNNEL IDs

从TableStore控制台获取：
1. 进入表格存储控制台
2. 选择你的实例
3. 进入对应的表
4. 点击"通道管理"标签
5. 复制Tunnel ID

### PORT 端口选择

- 开发环境: `3001`（默认）
- 生产环境: 可以使用 `80`, `443`（需要root权限）或其他端口

### NODE_ENV 环境

- `development` - 开发环境，详细日志，热重载
- `production` - 生产环境，优化性能，精简日志

### ALLOWED_ORIGINS 配置

**开发环境**：
```
ALLOWED_ORIGINS=http://localhost:5173
```

**生产环境**（多个域名用逗号分隔，无空格）：
```
ALLOWED_ORIGINS=https://yourusername.github.io,https://your-custom-domain.com
```

## 🔒 安全提示

1. ⚠️ **不要将 `.env` 文件提交到Git**
   - 已添加到 `.gitignore`
   - 确认：`git status` 不应显示 `.env`

2. 🔑 **AccessKey安全**
   - 定期轮换AccessKey
   - 使用RAM子账号（推荐）
   - 限制AccessKey权限范围（只授予TableStore权限）
   - 不要在代码中硬编码
   - 不要分享给他人

3. 📂 **文件权限**
   ```bash
   chmod 600 .env  # 只有所有者可读写
   ```

4. 🚫 **不要在公共场合暴露**
   - 不要截图包含密钥的内容
   - 不要上传到公开的文档或代码仓库
   - 如果不慎泄露，立即在阿里云控制台禁用该AccessKey

## ✅ 验证配置

启动服务后，应该看到：

```
🔍 Validating configuration...
✅ Configuration validated successfully
📦 Instance: your_instance_name
🌍 Region: cn-hangzhou
🚀 Server will run on port 3001
```

如果看到错误，检查对应的环境变量配置。

## 🔍 配置检查清单

- [ ] 已创建TableStore实例
- [ ] 已创建GameSessions和GameEvents表
- [ ] 已为两个表创建Tunnel通道
- [ ] 已获取AccessKey ID和Secret
- [ ] 已复制正确的Endpoint地址
- [ ] 已复制两个Tunnel ID
- [ ] `.env`文件权限设置为600
- [ ] 已将`.env`添加到`.gitignore`

## 📚 相关文档

- [完整部署指南](./TABLESTORE_DEPLOYMENT_GUIDE.md)
- [快速开始指南](./TABLESTORE_QUICK_START.md)
- [后端README](./SERVER_README.md)


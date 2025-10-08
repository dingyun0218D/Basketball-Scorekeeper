# 🏀 篮球计分器

一个功能完善的现代化篮球计分器应用程序，支持实时比赛记录、多人协作、球员数据管理和统计分析。

## ✨ 核心功能

### 📊 比赛管理
- **实时计分** - 支持1分、2分、3分得分记录，即时更新比分
- **精确计时** - 比赛计时器，支持开始、暂停、继续、停止等操作
- **节次管理** - 自动管理比赛节次（1-4节）
- **球员管理** - 完整的球员信息和统计数据管理

### 📈 数据统计
- **球员统计** - 得分、篮板、助攻、抢断、盖帽、犯规、投篮命中率等
- **队伍统计** - 团队得分、犯规数、暂停次数等
- **比赛事件** - 详细的比赛事件日志记录
- **历史记录** - 保存和查看历史比赛数据

### 🤝 协作功能
- **多服务支持** - 支持Firebase、LeanCloud和阿里云TableStore三种协作服务
- **实时同步** - 多设备间实时同步比赛数据（Tunnel Service推送）
- **会话管理** - 创建或加入协作会话，支持多人同时计分
- **在线状态** - 显示当前在线用户和连接状态

### 🎨 用户体验
- **响应式设计** - 适配桌面、平板和移动设备
- **现代化界面** - 美观直观的用户界面
- **操作便捷** - 一键操作，快速记录比赛数据
- **数据持久化** - 自动保存，防止数据丢失

## 🛠️ 技术栈

### 前端
```
React 18 + TypeScript              # 前端框架与类型安全
Vite                               # 构建工具
Tailwind CSS                       # 样式框架
React Context                      # 状态管理
Lucide React                       # 图标库
```

### 后端
```
Node.js 18 + Express               # REST API服务
WebSocket                          # 实时通信
Java 11 + Spring Boot              # Tunnel监听服务
TypeScript                         # 类型安全
```

### 协作服务
```
Firebase Firestore                 # Google云数据库
LeanCloud                          # 国内云服务
阿里云TableStore + Tunnel          # 分布式NoSQL + 实时推送
```

## 🚀 快速开始

### 环境要求
- Node.js 16.0+
- npm 或 yarn

### 安装运行

```bash
# 克隆项目
git clone <repository-url>
cd basketball-scorekeeper

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问应用
# http://localhost:5173
```

### 构建部署

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 代码检查
npm run lint
```

## 📱 使用说明

### 1. 基础计分
- 点击 **计分板** 页面的得分按钮（+1、+2、+3）为队伍加分
- 使用计时器控制比赛时间
- 记录犯规、暂停等比赛事件

### 2. 球员管理
- 在 **球员管理与统计** 页面添加球员信息
- 实时更新球员的各项统计数据
- 查看球员详细表现和投篮命中率

### 3. 实时协作
- 点击顶部 **🔗 协作** 按钮
- 选择协作服务（Firebase/LeanCloud）
- 创建新会话或加入现有会话
- 多人实时同步计分数据

### 4. 历史记录
- 查看过往比赛记录
- 分析比赛数据和统计信息
- 归档和管理历史数据

## 🔧 配置说明

### 协作服务配置

#### Firebase配置
在 `src/config/firebase.ts` 中配置您的Firebase项目信息：
```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  // ...其他配置
};
```

#### LeanCloud配置  
在 `src/config/leancloud.ts` 中配置您的LeanCloud项目信息：
```typescript
AV.init({
  appId: "your-app-id",
  appKey: "your-app-key",
  serverURL: "your-server-url"
});
```

#### TableStore配置（推荐）
TableStore使用独立的后端服务，提供最佳性能：

**前端配置** - 在环境变量或构建时配置：
```bash
VITE_TABLESTORE_API_URL=http://your-server-ip:3001
VITE_TABLESTORE_WS_URL=ws://your-server-ip:3001
```

**后端部署** - 需要部署两个服务：
1. **Node.js API服务**（端口3001）- 提供REST API和WebSocket
2. **Java Tunnel服务**（端口8080）- 监听TableStore数据变更

详细配置说明请参考 `docs/` 目录中的相关文档。

## 📚 文档

详细文档位于 `docs/` 目录，查看 **[文档索引](docs/README.md)**

### 快速导航
- 🚀 **[快速部署](docs/DEPLOYMENT_QUICK_GUIDE.md)** - 完整部署指南（推荐）
- 📖 **[项目总览](docs/PROJECT_SUMMARY.md)** - 功能和架构说明
- 🔧 **[API文档](docs/SERVER_README.md)** - Node.js REST API接口
- ☕ **[Java服务](docs/JAVA_TUNNEL_SERVICE.md)** - Tunnel监听服务

### 协作服务选择
- **TableStore** ⭐推荐 - [部署指南](docs/DEPLOYMENT_QUICK_GUIDE.md)
- **Firebase** - [配置指南](docs/FIREBASE_SETUP_GUIDE.md)
- **LeanCloud** - [实现说明](docs/LEANCLOUD_COLLABORATION_IMPLEMENTATION.md)

## 🎯 项目特色

- **🚀 高性能** - 基于Vite构建，快速启动和热更新
- **💪 类型安全** - 完整的TypeScript类型定义
- **📱 响应式** - 适配各种设备和屏幕尺寸
- **🔄 实时同步** - 多设备协作，数据实时同步
- **🎨 现代UI** - 美观的界面设计和流畅的用户体验
- **📊 数据丰富** - 详细的统计分析和历史记录

## 📄 许可证

本项目采用 MIT 许可证。

---

开发团队 | 2024

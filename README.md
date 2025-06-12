# 🏀 篮球计分器

一个功能完善的现代化篮球计分器应用程序，支持实时比赛记录、球员数据管理、统计分析等功能。

## ✨ 功能特性

### 核心功能
- **实时计分** - 支持1分、2分、3分得分记录，即时更新比分
- **计时管理** - 精确的比赛计时器，支持开始、暂停、继续、停止操作
- **节次管理** - 自动管理比赛节次，支持手动切换
- **球员管理** - 完整的球员信息管理，包括姓名、号码、位置等

### 数据统计
- **球员个人统计** - 得分、篮板、助攻、抢断、盖帽、犯规等
- **投篮统计** - 投篮命中率、三分命中率、罚球命中率
- **队伍统计** - 总犯规数、暂停次数等
- **比赛事件** - 详细的比赛事件日志记录

### 界面特色
- **响应式设计** - 适配桌面和移动设备
- **现代化UI** - 使用Tailwind CSS构建的美观界面
- **实时更新** - 数据变化即时反映在界面上
- **用户友好** - 直观的操作界面和清晰的信息展示

### 数据管理
- **本地存储** - 自动保存比赛数据到浏览器本地存储
- **历史记录** - 保存历史比赛记录
- **数据导出** - 支持比赛数据导出
- **设置管理** - 可自定义比赛时长等设置

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式框架**: Tailwind CSS
- **状态管理**: React Context + useReducer
- **图标库**: Lucide React
- **类型定义**: 完整的TypeScript类型支持

## 📁 项目结构

```
basketball-scorekeeper/
├── public/
│   └── basketball-icon.svg
├── src/
│   ├── components/           # React组件
│   │   ├── common/          # 通用组件
│   │   ├── Scoreboard/      # 计分板组件
│   │   ├── GameControls/    # 游戏控制组件
│   │   └── PlayerManagement/ # 球员管理组件
│   ├── contexts/            # React Context
│   │   └── GameContext.tsx  # 游戏状态管理
│   ├── hooks/               # 自定义Hooks
│   │   └── useGameTimer.ts  # 计时器Hook
│   ├── types/               # TypeScript类型定义
│   │   └── index.ts
│   ├── utils/               # 工具函数
│   │   ├── gameUtils.ts     # 游戏相关工具
│   │   └── storage.ts       # 本地存储工具
│   ├── App.tsx             # 主应用组件
│   ├── main.tsx            # 应用入口
│   └── index.css           # 全局样式
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 🚀 快速开始

### 环境要求
- Node.js 16.0+
- npm 或 yarn

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd basketball-scorekeeper
```

2. **安装依赖**
```bash
npm install
```

3. **启动开发服务器**
```bash
npm run dev
```

4. **打开浏览器访问**
```
http://localhost:3000
```

### 构建生产版本
```bash
npm run build
```

## 📱 使用说明

### 1. 计分板页面
- **得分更新**: 点击+1、+2、+3按钮为相应队伍加分
- **查看信息**: 显示当前比分、节次、剩余时间
- **队伍信息**: 显示犯规数和剩余暂停次数

### 2. 游戏控制
- **开始/暂停**: 控制比赛计时器
- **下一节**: 手动进入下一节比赛
- **重置比赛**: 清空所有数据重新开始

### 3. 球员管理
- **添加球员**: 为每支队伍添加球员信息
- **更新统计**: 实时更新球员的各项数据
- **犯规管理**: 记录球员犯规情况
- **移除球员**: 从队伍中移除球员

### 4. 数据统计
- 查看详细的比赛和球员统计数据
- 分析投篮命中率等关键指标

### 5. 历史记录
- 查看过往比赛记录
- 数据导出功能

## 🎯 核心组件说明

### GameContext
- 全局状态管理，使用useReducer管理比赛状态
- 自动保存数据到本地存储
- 提供统一的状态更新接口

### Scoreboard
- 显示比赛基本信息和比分
- 提供快速得分按钮
- 实时显示比赛状态

### PlayerCard
- 显示球员详细信息和统计数据
- 支持实时更新球员数据
- 犯规管理和球员移除功能

### GameControls
- 比赛计时器控制
- 节次管理
- 比赛重置功能

## 🔧 自定义配置

### 修改比赛时长
在 `src/utils/storage.ts` 中修改默认设置：
```typescript
const DEFAULT_SETTINGS: AppSettings = {
  quarterDuration: 12, // 单节时间（分钟）
  shotClockDuration: 24, // 24秒规则
  soundEnabled: true,
  autoSave: true,
};
```

### 修改队伍颜色
在 `src/contexts/GameContext.tsx` 中修改默认队伍配置：
```typescript
const initialGameState: GameState = {
  homeTeam: createDefaultTeam('主队', '#1E40AF'),
  awayTeam: createDefaultTeam('客队', '#DC2626'),
  // ...
};
```

## 🎨 样式自定义

项目使用Tailwind CSS，可以在以下文件中自定义样式：
- `tailwind.config.js` - Tailwind配置
- `src/index.css` - 全局样式和自定义组件样式

## 📊 数据结构

### 比赛状态 (GameState)
```typescript
interface GameState {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  quarter: number;
  time: string;
  isRunning: boolean;
  isPaused: boolean;
  events: GameEvent[];
  createdAt: number;
  updatedAt: number;
}
```

### 球员数据 (Player)
```typescript
interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  fouls: number;
  // 投篮统计
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  threePointersMade: number;
  threePointersAttempted: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
}
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/新功能`)
3. 提交修改 (`git commit -am '添加新功能'`)
4. 推送到分支 (`git push origin feature/新功能`)
5. 创建 Pull Request

## 📄 许可证

MIT License

## 🐛 问题反馈

如果您发现任何问题或有改进建议，请在 Issues 页面提交。

## 🔮 未来规划

- [ ] 音效支持
- [ ] 数据可视化图表
- [ ] 多语言支持
- [ ] 打印功能
- [ ] 云端数据同步
- [ ] 更多统计指标
- [ ] 比赛录像功能
- [ ] 战术板功能

---

**Made with ❤️ for basketball enthusiasts**

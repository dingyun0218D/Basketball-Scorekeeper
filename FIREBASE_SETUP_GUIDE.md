# Firebase 实时协作配置指南

## 🚀 快速开始

### 第一步：更新 Firebase 配置

1. 打开 `src/config/firebase.ts` 文件
2. 将您从 Firebase 控制台获取的配置信息替换到以下位置：

```typescript
const firebaseConfig = {
  apiKey: "your-api-key-here",                    // 替换为您的 API Key
  authDomain: "your-project-id.firebaseapp.com", // 替换为您的项目域名
  projectId: "your-project-id",                  // 替换为您的项目ID
  storageBucket: "your-project-id.appspot.com",  // 替换为您的存储桶
  messagingSenderId: "your-sender-id",           // 替换为您的发送者ID
  appId: "your-app-id"                          // 替换为您的应用ID
};
```

### 第二步：验证连接

1. 运行项目：`npm start`
2. 查看浏览器控制台是否有 Firebase 连接错误
3. 如果配置正确，应该能看到正常启动信息

## 📱 使用方法

### 创建协作会话

1. 在主计分界面找到"实时协作计分"区域
2. 点击"创建新会话"
3. 系统会生成一个6位的会话码（如：ABC123）
4. 将此会话码分享给其他计分员

### 加入协作会话

1. 点击"加入会话"
2. 输入6位会话码
3. 点击"加入会话"按钮
4. 成功后会显示连接状态和在线用户

### 实时协作功能

- ✅ **实时得分同步**：任何人更新得分，所有设备立即同步
- ✅ **事件记录同步**：犯规、暂停、换人等操作实时同步
- ✅ **统计数据同步**：篮板、助攻、抢断、盖帽、失误同步
- ✅ **在线状态显示**：查看当前有哪些用户在线
- ✅ **撤销操作同步**：任何撤销操作都会同步到所有设备

## 🔧 技术原理

### 数据结构

```
games/{sessionId}
├── gameState (游戏主状态)
├── events/{eventId} (游戏事件集合)
└── activeUsers (活跃用户列表)
```

### 实时同步机制

1. **状态同步**：使用 Firestore 实时监听器
2. **冲突解决**：服务端时间戳优先
3. **离线处理**：Firestore 自动缓存和同步
4. **用户状态**：15秒心跳检测在线状态

## 🛠️ 故障排除

### 常见问题

**1. 无法创建会话**
- 检查 Firebase 配置是否正确
- 确认网络连接正常
- 查看浏览器控制台错误信息

**2. 无法加入会话**
- 确认会话码正确（区分大小写）
- 检查会话是否已过期（24小时自动清理）
- 确认创建者的会话仍然活跃

**3. 同步延迟问题**
- 正常同步延迟在1-3秒内
- 网络不稳定可能造成延迟
- 可以尝试刷新页面重新连接

**4. 权限错误**
- 确认 Firestore 安全规则已设置为测试模式
- 检查 Firebase 项目配置是否正确

## 🔒 安全考虑

### 开发环境（当前配置）

```javascript
// Firestore 安全规则 - 测试模式
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 生产环境建议

```javascript
// 生产环境安全规则示例
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /games/{gameId} {
      allow read, write: if request.time < resource.data.createdAt + duration.P1D;
    }
  }
}
```

## 📊 性能优化

### 已实现的优化

1. **数据结构优化**：分离事件和状态，减少传输量
2. **订阅管理**：组件卸载时自动清理订阅
3. **心跳优化**：15秒间隔，避免频繁更新
4. **错误处理**：完善的错误捕获和用户提示

### 推荐设置

- **会话时长**：建议单场比赛使用，结束后清理
- **并发用户**：建议不超过10个用户同时操作
- **网络要求**：稳定的4G或WiFi连接

## 🎯 下一步功能规划

- [ ] 用户身份验证
- [ ] 会话密码保护
- [ ] 操作权限控制
- [ ] 历史会话查看
- [ ] 数据导出功能 
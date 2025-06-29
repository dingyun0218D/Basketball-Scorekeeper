# 协作功能故障排除指南

## 问题1: GitHub线上服务创建会话失败

### 问题描述
在GitHub Pages部署的线上版本中，即使配置了环境变量，仍然提示"创建会话失败: 创建会话失败"。

### 原因分析
1. **环境变量未正确配置**: GitHub Secrets可能缺少或配置错误
2. **CloudBase初始化失败**: 环境ID或地域配置有误
3. **网络访问问题**: 无法访问腾讯云服务
4. **CloudBase权限问题**: 数据库安全规则阻止了访问

### 解决方案

#### 步骤1: 验证GitHub Secrets配置
在GitHub仓库中检查以下Secrets是否正确配置：

| Secret名称 | 示例值 | 说明 |
|-----------|-------|------|
| `VITE_CLOUDBASE_ENV_ID` | `your-env-123abc` | CloudBase环境ID |
| `VITE_CLOUDBASE_REGION` | `ap-shanghai` | 地域代码 |

**验证方法**:
1. 进入GitHub仓库 → Settings → Secrets and variables → Actions
2. 确认两个secrets都存在且值正确
3. 重新触发部署查看构建日志

#### 步骤2: 检查CloudBase配置
在腾讯云控制台验证：
1. **环境ID**: 进入CloudBase控制台 → 设置 → 环境信息
2. **数据库权限**: 数据库 → 安全规则，确保规则允许读写：
   ```javascript
   {
     "read": true,
     "write": true
   }
   ```
3. **地域设置**: 确认地域代码正确

#### 步骤3: 调试线上环境
访问线上应用，打开浏览器开发者工具，检查控制台输出：
- 查找"CloudBase 不可用"的警告信息
- 检查环境变量是否正确加载
- 查看网络请求是否被阻止

### 常见错误信息和解决方案

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `CloudBase 服务不可用: app=false` | 初始化失败 | 检查环境ID配置 |
| `CloudBase 服务不可用: db=false` | 数据库未初始化 | 检查CloudBase数据库服务是否开通 |
| `envId=undefined` | 环境变量未配置 | 确认GitHub Secrets配置 |
| 网络超时 | 访问受限 | 检查网络连接或使用VPN |

## 问题2: 本地Cloudbase连接后界面跳转又变回去

### 问题描述
在本地开发环境中使用Cloudbase服务时，创建会话后"实时协作计分"界面跳转到连接状态，但约1秒后又变回选择模式。

### 原因分析
监听回调中收到null状态导致连接状态被重置。这通常是因为：
1. CloudBase实时监听的初始化延迟
2. 状态同步机制的时序问题
3. useEffect依赖导致的循环更新

### 解决方案
**已修复**: 通过以下改进解决了该问题：
1. 使用`useRef`跟踪连接状态，避免依赖循环
2. 只在从未连接过时才设置为断开状态
3. 增强了连接状态的稳定性

### 本地调试步骤
1. **检查环境变量**: 确认`.env.local`文件配置正确
2. **查看控制台日志**: 观察连接过程的详细日志
3. **测试步骤**:
   ```bash
   # 重启开发服务器
   npm run dev
   
   # 打开浏览器控制台查看日志
   # 创建会话并观察状态变化
   ```

## 环境配置指南

### 本地开发环境
创建`.env.local`文件：
```bash
# 腾讯云 CloudBase 配置（必需）
VITE_CLOUDBASE_ENV_ID=your-env-123abc
VITE_CLOUDBASE_REGION=ap-shanghai

# Firebase 配置（可选，用于服务切换）
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 生产环境（GitHub Pages）
在GitHub仓库中配置Secrets：
1. 进入仓库 → Settings → Secrets and variables → Actions
2. 添加所需的环境变量（参考上述配置）

### 地域代码对照表
| 地域名称 | 代码 | 适用场景 |
|---------|------|---------|
| 上海 | `ap-shanghai` | 华东地区推荐 |
| 广州 | `ap-guangzhou` | 华南地区推荐 |
| 北京 | `ap-beijing` | 华北地区推荐 |
| 成都 | `ap-chengdu` | 西南地区推荐 |

## 验证方法

### 功能测试清单
- [ ] 本地环境显示两个服务选项
- [ ] 线上环境显示两个服务选项
- [ ] CloudBase创建会话成功
- [ ] Firebase创建会话成功（如果配置）
- [ ] 连接状态界面稳定显示
- [ ] 实时状态同步正常

### 调试技巧
1. **启用详细日志**: 查看浏览器控制台的详细输出
2. **网络面板**: 检查网络请求是否成功
3. **逐步测试**: 先测试服务可用性，再测试连接功能

## 常见问题FAQ

### Q: 为什么本地可以但线上不行？
A: 通常是环境变量配置问题。本地使用`.env.local`，线上使用GitHub Secrets。

### Q: CloudBase和Firebase哪个更稳定？
A: 对于国内用户，CloudBase更稳定；对于海外用户，Firebase更稳定。

### Q: 如何切换服务？
A: 在协作界面的服务选择器中切换，或者只配置一种服务。

### Q: 连接后数据会同步吗？
A: 是的，所有操作都会实时同步到所有连接的设备。

## 技术支持

如果问题仍然存在，请提供以下信息：
1. 浏览器控制台的完整错误日志
2. 网络面板中的请求状态
3. 使用的服务类型（CloudBase/Firebase）
4. 环境（本地/线上）

修复后的版本特性：
- ✅ 本地连接状态稳定，不会出现跳转后又变回的问题
- ✅ 线上环境错误信息更详细，便于排查问题
- ✅ 增强的调试日志帮助快速定位问题
- ✅ 完整的配置验证和错误处理机制 
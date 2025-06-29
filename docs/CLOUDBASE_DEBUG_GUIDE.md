# CloudBase 线上环境调试指南

## 问题描述
线上环境出现"创建会话失败: CloudBase创建会话失败: 未知错误"错误。

## 🔍 调试步骤

### 第一步：检查浏览器控制台
访问线上应用，打开浏览器开发者工具（F12），查看控制台输出。

#### 期望看到的日志信息：
```
CloudBase 环境配置检查: {
  NODE_ENV: "production",
  PROD: true,
  DEV: false,
  envId: "configured" 或 "not set",
  region: "ap-shanghai",
  envVars: ["VITE_CLOUDBASE_ENV_ID", "VITE_CLOUDBASE_REGION"]
}
```

#### 可能的错误情况：

**情况1: 环境变量未配置**
```
CloudBase 环境配置检查: {
  envId: "not set",
  envVars: []
}
缺少必要的 CloudBase 环境变量: ["VITE_CLOUDBASE_ENV_ID"]
```
**解决方案**: 检查 GitHub Secrets 配置

**情况2: CloudBase 初始化失败**
```
CloudBase 初始化失败，详细错误信息: {
  error: ...,
  message: "具体错误信息",
  config: { env: "...", region: "..." }
}
```
**解决方案**: 检查环境ID和地域配置

**情况3: 数据库权限问题**
```
CloudBase 创建会话详细错误: {
  errorMessage: "permission denied" 或 "unauthorized"
}
```
**解决方案**: 检查 CloudBase 数据库安全规则

### 第二步：验证 GitHub Secrets 配置

1. **检查 Secrets 是否存在**
   - 进入 GitHub 仓库
   - Settings → Secrets and variables → Actions
   - 确认存在以下 Secrets：
     - `VITE_CLOUDBASE_ENV_ID`
     - `VITE_CLOUDBASE_REGION`

2. **验证 Secrets 值是否正确**
   - 环境ID格式：通常是类似 `your-env-123abc` 的字符串
   - 地域格式：`ap-shanghai`、`ap-guangzhou`、`ap-beijing` 等

3. **检查构建日志**
   - 进入 Actions 页面
   - 查看最新的构建日志
   - 确认环境变量被正确传递

### 第三步：验证 CloudBase 配置

在腾讯云控制台检查：

1. **环境ID是否正确**
   - 进入 [CloudBase 控制台](https://console.cloud.tencent.com/tcb)
   - 找到您的环境
   - 复制正确的环境ID

2. **数据库服务是否开通**
   - 进入您的环境
   - 点击左侧"数据库"
   - 确认数据库服务已开通

3. **安全规则是否正确**
   - 在数据库页面，点击"安全规则"
   - 确认规则为：
   ```javascript
   {
     "read": true,
     "write": true
   }
   ```

4. **地域是否匹配**
   - 在环境信息中查看地域
   - 确保与 `VITE_CLOUDBASE_REGION` 值匹配

### 第四步：网络连接测试

1. **检查网络请求**
   - 在浏览器开发者工具的 Network 面板
   - 查看是否有被阻止的请求
   - 检查是否有 CORS 错误

2. **测试访问权限**
   - 尝试在不同网络环境下访问
   - 检查是否需要特殊的网络配置

## 🛠️ 常见解决方案

### 方案1：重新配置 GitHub Secrets

```bash
# 确保 Secrets 正确配置
VITE_CLOUDBASE_ENV_ID=your-real-env-id
VITE_CLOUDBASE_REGION=ap-shanghai  # 或其他正确的地域
```

### 方案2：更新安全规则

在 CloudBase 控制台 → 数据库 → 安全规则，设置为：
```javascript
{
  "read": true,
  "write": true
}
```

### 方案3：检查环境状态

确保 CloudBase 环境：
- 状态为"正常"
- 数据库服务已开通
- 没有欠费或配额限制

## 📊 调试检查清单

- [ ] GitHub Secrets 已正确配置
- [ ] CloudBase 环境ID正确
- [ ] 地域代码正确
- [ ] 数据库服务已开通
- [ ] 安全规则允许读写
- [ ] 浏览器控制台显示初始化成功
- [ ] 网络请求没有被阻止
- [ ] 没有 CORS 错误

## 🚨 紧急排查

如果问题紧急，可以采用以下快速排查方法：

1. **临时使用 Firebase**
   - 如果已配置 Firebase，可以临时切换到 Firebase 服务
   - 在协作界面选择 Firebase 选项

2. **本地测试**
   - 在本地环境测试 CloudBase 连接
   - 确认配置文件和服务是否正常

3. **联系技术支持**
   - 如果问题持续存在，可以联系腾讯云技术支持
   - 提供错误日志和环境信息

## 📝 提交 Bug 报告时请包含

如果需要技术支持，请提供以下信息：

1. **控制台完整日志**
   - CloudBase 环境配置检查的输出
   - 详细的错误信息
   - 网络请求状态

2. **环境信息**
   - 使用的浏览器和版本
   - 网络环境（国内/海外）
   - 访问时间

3. **配置信息**
   - GitHub Secrets 是否已配置（不要提供实际值）
   - CloudBase 环境ID格式是否正确
   - 地域设置

修复后的版本将提供：
- ✅ 详细的错误日志和调试信息
- ✅ 完整的配置验证流程
- ✅ 清晰的问题定位步骤
- ✅ 多种解决方案选择 
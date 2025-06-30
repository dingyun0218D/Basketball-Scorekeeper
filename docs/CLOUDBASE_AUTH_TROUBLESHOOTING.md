# CloudBase 认证问题故障排除指南

## 🎯 当前问题分析

### 错误信息解读
```
创建会话失败: CloudBase 服务不可用或认证失败: app=true, db=true, auth=false, envId=true
```

**状态分析**:
- ✅ `app=true`: CloudBase SDK 初始化成功
- ✅ `db=true`: 数据库实例创建成功
- ❌ `auth=false`: 匿名登录认证失败
- ✅ `envId=true`: 环境变量配置正确

**结论**: 问题出在 CloudBase 匿名登录认证环节

## 🔍 故障排除步骤

### 第一步：检查 CloudBase 控制台设置

1. **登录 CloudBase 控制台**
   - 访问：https://console.cloud.tencent.com/tcb
   - 确认环境状态为 "运行中"

2. **检查匿名登录配置**
   ```
   环境 -> 用户管理 -> 登录授权 -> 匿名登录
   ```
   - ✅ 确认 "匿名登录" 开关已启用
   - ✅ 确认没有其他登录限制

3. **检查数据库安全规则**
   ```
   环境 -> 数据库 -> 安全规则
   ```
   - 推荐临时使用全开放规则进行测试：
   ```javascript
   {
     "read": true,
     "write": true
   }
   ```

### 第二步：本地环境检查

1. **确认环境变量**
   ```bash
   # 检查 .env.local 文件
   cat .env.local
   ```
   应该包含：
   ```
   VITE_CLOUDBASE_ENV_ID=your-env-id
   VITE_CLOUDBASE_REGION=ap-shanghai
   ```

2. **重启开发服务器**
   ```bash
   npm run dev
   ```

3. **清理浏览器缓存**
   - 打开开发者工具
   - Application -> Storage -> Clear storage

### 第三步：详细调试

1. **查看浏览器控制台**
   打开开发者工具，查找以下关键日志：

   **成功的认证流程应该显示**:
   ```
   CloudBase 环境配置检查: {...}
   开始初始化 CloudBase...
   CloudBase app 初始化成功
   CloudBase database 初始化成功
   开始等待 CloudBase 认证完成...
   CloudBase 匿名登录成功
   CloudBase 认证等待完成，最终状态: { isAuthenticated: true }
   ```

   **失败时可能看到**:
   ```
   ❌ CloudBase 匿名登录权限被拒绝 - 请检查 CloudBase 控制台是否启用了匿名登录
   ❌ CloudBase 匿名登录网络错误 - 请检查网络连接
   ❌ CloudBase 匿名登录配置无效 - 请检查环境ID和区域配置
   ❌ CloudBase 匿名登录未知错误
   ```

### 第四步：网络连接检查

1. **测试网络连接**
   ```bash
   ping tcb-api.tencentcloudapi.com
   ```

2. **检查防火墙/代理设置**
   - 确认没有阻挡 `*.tencentcloudapi.com` 域名
   - 如使用代理，确认代理配置正确

3. **尝试切换网络**
   - 手机热点测试
   - 不同 WiFi 网络测试

### 第五步：CloudBase 环境验证

1. **验证环境ID正确性**
   ```bash
   # 在控制台中检查环境ID是否与配置一致
   ```

2. **检查环境状态**
   - 确认环境未欠费
   - 确认环境未被冻结
   - 确认环境资源充足

3. **检查地域配置**
   - 确认 `VITE_CLOUDBASE_REGION` 与实际环境地域一致
   - 常用地域：`ap-shanghai`, `ap-beijing`, `ap-guangzhou`

## 🛠️ 常见解决方案

### 方案一：重新启用匿名登录
1. 进入 CloudBase 控制台
2. 关闭匿名登录
3. 等待 1-2 分钟
4. 重新启用匿名登录
5. 测试应用

### 方案二：创建新的 CloudBase 环境
1. 在 CloudBase 控制台创建新环境
2. 启用匿名登录
3. 设置数据库安全规则
4. 更新环境变量
5. 重启应用测试

### 方案三：检查账户状态
1. 确认腾讯云账户正常
2. 确认 CloudBase 服务未欠费
3. 确认实名认证状态

### 方案四：降级到仅 Firebase
如果 CloudBase 问题暂时无法解决，可以临时禁用：
```javascript
// 在 .env.local 中注释掉 CloudBase 配置
// VITE_CLOUDBASE_ENV_ID=your-env-id
// VITE_CLOUDBASE_REGION=ap-shanghai
```

## 🔧 高级调试技巧

### 启用详细日志
在浏览器控制台执行：
```javascript
// 设置 CloudBase SDK 详细日志
localStorage.setItem('tcb-log-level', 'debug');
```

### 手动测试认证
在浏览器控制台执行：
```javascript
// 手动测试 CloudBase 认证
import('./src/config/cloudbase').then(module => {
  module.retryAuth().then(success => {
    console.log('手动认证结果:', success);
  });
});
```

### 检查 SDK 版本兼容性
```bash
npm list @cloudbase/js-sdk
```

## 📋 问题报告模板

如果以上步骤都无法解决问题，请收集以下信息：

```
**环境信息**:
- 操作系统: 
- 浏览器版本: 
- 网络环境: 

**CloudBase 配置**:
- 环境ID: 
- 地域: 
- 匿名登录状态: 
- 数据库安全规则: 

**错误日志**:
```控制台错误信息```

**重现步骤**:
1. 
2. 
3. 

**已尝试的解决方案**:
- [ ] 重启开发服务器
- [ ] 清理浏览器缓存
- [ ] 检查 CloudBase 控制台配置
- [ ] 测试网络连接
- [ ] 重新启用匿名登录
```

## 🎯 预期结果

修复后，您应该看到：
```
CloudBase 匿名登录成功
CloudBase 认证等待完成，最终状态: { isAuthenticated: true, hasError: false }
CloudBase 可用性和认证检查通过
CloudBase 会话创建成功: [sessionId]
```

## 📞 获取帮助

如果问题持续存在：
1. 提交详细的问题报告
2. 考虑联系腾讯云技术支持
3. 检查 CloudBase 官方文档最新变更 
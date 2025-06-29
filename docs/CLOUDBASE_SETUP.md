# 腾讯云 CloudBase 配置指南

## 概述

本应用现在支持两种协作后端服务：
- **Firebase (海外)**: 适合海外用户使用
- **腾讯云 CloudBase (国内)**: 适合国内用户使用，无需VPN

用户可以在协作界面中选择使用哪种服务。

## CloudBase 配置步骤

### 1. 创建 CloudBase 环境

1. 访问 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 搜索并进入"云开发 CloudBase"
3. 点击"新建环境"
4. 选择"按量计费"模式（有免费额度）
5. 选择地域（推荐：上海、广州、北京）
6. 输入环境名称，完成创建

### 2. 开通数据库服务

1. 在 CloudBase 控制台中，进入你创建的环境
2. 点击左侧菜单"数据库"
3. 点击"开通"按钮开通数据库服务
4. 选择"按量计费"模式

### 3. 配置安全规则

在数据库页面，点击"安全规则"，添加以下规则：

```javascript
{
  "read": true,
  "write": true
}
```

**注意**: 这是简化的规则，生产环境中应该配置更严格的安全规则。

### 4. 获取环境配置

1. 在 CloudBase 控制台，点击"设置"
2. 在"环境信息"中找到"环境ID"
3. 记录环境ID和所选地域

### 5. 配置环境变量

在项目根目录创建 `.env.local` 文件，添加以下配置：

```bash
# 腾讯云 CloudBase 配置
VITE_CLOUDBASE_ENV_ID=your_env_id_here
VITE_CLOUDBASE_REGION=ap-shanghai

# 如果同时配置了 Firebase，用户可以在界面中切换
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 6. 地域选择

可选的地域值：
- `ap-shanghai` - 上海
- `ap-guangzhou` - 广州  
- `ap-beijing` - 北京
- `ap-chengdu` - 成都

选择距离用户最近的地域以获得最佳性能。

## 使用说明

### 服务切换

1. 在协作界面右上角可以看到"协作服务"下拉框
2. 如果同时配置了 Firebase 和 CloudBase，可以选择使用哪个服务
3. 只有在未连接会话时才能切换服务
4. 不同服务的会话是独立的，无法互通

### 费用说明

CloudBase 提供免费额度：
- 数据库读写：每月 5万次
- 数据库存储：1GB
- 云函数调用：100万次

对于中小型应用来说，免费额度通常足够使用。

### 故障排除

**问题1**: 提示"CloudBase 未初始化"
- 检查环境变量是否正确配置
- 确认环境ID是否有效
- 检查网络连接

**问题2**: 无法创建会话
- 确认数据库服务已开通
- 检查安全规则配置
- 查看浏览器控制台错误信息

**问题3**: 连接不稳定
- 尝试切换到其他地域
- 检查网络环境
- 确认环境状态正常

## API 限制

CloudBase 有以下限制：
- 单次写入文档大小：1MB
- 单次查询返回文档数量：1000个
- 并发连接数：100个

这些限制对于篮球记分应用来说完全够用。

## 安全建议

1. 生产环境中配置严格的数据库安全规则
2. 定期检查访问日志
3. 设置合理的费用预警
4. 备份重要数据

## 相关链接

- [CloudBase 官方文档](https://cloud.tencent.com/document/product/876)
- [CloudBase 控制台](https://console.cloud.tencent.com/tcb)
- [CloudBase 定价](https://cloud.tencent.com/document/product/876/18864) 
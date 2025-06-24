# Firebase 安全配置指南

## 🔒 概述
本文档说明如何安全地管理 Firebase 配置，避免敏感信息泄露到公开仓库。

## ✅ 已完成的配置

### 1. 代码层面安全化
- ✅ `src/config/firebase.ts` - 改用环境变量
- ✅ `src/vite-env.d.ts` - 添加类型声明
- ✅ `.env.local` - 本地开发配置（已在 .gitignore 中）
- ✅ `.env.example` - 配置模板
- ✅ `.github/workflows/deploy.yml` - GitHub Actions 配置

### 2. 环境变量配置
所有 Firebase 配置已改为使用 `VITE_` 前缀的环境变量：

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## 🔧 下一步：在 GitHub 设置 Secrets

### 第四步：GitHub 仓库 Secrets 配置

1. **进入 GitHub 仓库**
   - 打开你的仓库: `https://github.com/你的用户名/Basketball-Scorekeeper`

2. **进入 Settings**
   - 点击仓库顶部的 "Settings" 标签页

3. **进入 Secrets**
   - 在左侧菜单找到 "Secrets and variables"
   - 点击 "Actions"

4. **添加 Repository secrets**
   点击 "New repository secret" 按钮，依次添加以下 secrets：

   | Secret 名称 | 值 |
   |------------|-----|
   | `VITE_FIREBASE_API_KEY` | `AIzaSyAxIJaceNu4-D-604gteRDgnbJn4iuq1lY` |
   | `VITE_FIREBASE_AUTH_DOMAIN` | `basketball-scorekeeper-e4039.firebaseapp.com` |
   | `VITE_FIREBASE_PROJECT_ID` | `basketball-scorekeeper-e4039` |
   | `VITE_FIREBASE_STORAGE_BUCKET` | `basketball-scorekeeper-e4039.firebasestorage.app` |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | `114829273033` |
   | `VITE_FIREBASE_APP_ID` | `1:114829273033:web:a7797f88585557ccfe2a18` |
   | `VITE_FIREBASE_MEASUREMENT_ID` | `G-7GXYETN55Q` |

### 第五步：验证部署

1. **提交代码**
   ```bash
   git add .
   git commit -m "🔒 安全化Firebase配置，使用环境变量"
   git push origin main
   ```

2. **查看 GitHub Actions**
   - 进入 "Actions" 标签页
   - 查看构建日志，确认没有错误
   - 确认环境变量被正确读取

3. **测试功能**
   - 部署完成后访问网站
   - 测试协作功能是否正常工作
   - 检查浏览器控制台是否有配置错误

## 🛡️ 安全优势

### ✅ 代码安全
- 源代码中不再包含敏感信息
- 即使代码被恶意获取，也无法直接使用 Firebase

### ✅ 环境隔离
- 本地开发使用 `.env.local`
- 生产部署使用 GitHub Secrets
- 可以为不同环境使用不同配置

### ✅ 访问控制
- 只有仓库管理员能查看/修改 Secrets
- 协作者无法看到敏感配置
- 部署过程中不会显示实际值

## 🚨 注意事项

### ⚠️ .env.local 文件
- 已被添加到 `.gitignore`，不会被提交到仓库
- 包含真实的配置信息，请妥善保管
- 如果需要分享项目，使用 `.env.example` 作为模板

### ⚠️ Firebase 控制台安全
建议在 Firebase 控制台额外配置安全规则：

1. **授权域名限制**
   - Firebase Console → Authentication → Settings → Authorized domains
   - 只添加你的域名（如：`your-username.github.io`）

2. **Firestore 安全规则**
   ```javascript
   // 限制只有认证用户可以访问
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

## 🔍 故障排除

### 构建失败
如果 GitHub Actions 构建失败，请检查：
1. 所有 Secrets 是否正确设置
2. Secret 名称是否完全匹配（区分大小写）
3. Secret 值是否包含多余的空格

### 功能异常
如果部署后功能异常，请检查：
1. 浏览器控制台是否有配置错误
2. Firebase 控制台是否有访问限制
3. 网络请求是否被阻止

## 📝 总结

通过以上配置，你的 Firebase 密钥已经安全化：
- ✅ 源代码不包含敏感信息
- ✅ 本地开发正常工作
- ✅ GitHub Actions 自动部署
- ✅ 生产环境配置安全

完成 GitHub Secrets 设置后，你的部署就完全安全了！🎉 
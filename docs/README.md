# 📚 项目文档

Basketball Scorekeeper的完整技术文档和使用指南。

## 🚀 快速开始

### 新用户必读
1. **[项目总览](PROJECT_SUMMARY.md)** - 了解项目功能和架构
2. **[快速部署指南](DEPLOYMENT_QUICK_GUIDE.md)** - 5分钟完成部署

### 协作服务配置
选择一种协作服务配置：

- **[Firebase](FIREBASE_SETUP_GUIDE.md)** - Google云服务，全球可用
- **[LeanCloud](LEANCLOUD_COLLABORATION_IMPLEMENTATION.md)** - 国内云服务
- **[TableStore](DEPLOYMENT_QUICK_GUIDE.md)** ⭐推荐 - 阿里云TableStore + Tunnel实时推送

## 📋 文档目录

### 部署相关
| 文档 | 说明 |
|------|------|
| [DEPLOYMENT_QUICK_GUIDE.md](DEPLOYMENT_QUICK_GUIDE.md) | 完整部署指南（TableStore） |
| [SERVER_ENV_TEMPLATE.md](SERVER_ENV_TEMPLATE.md) | 环境变量配置模板 |
| [COLLABORATION_TEST_GUIDE.md](COLLABORATION_TEST_GUIDE.md) | 协作功能测试指南 |

### TableStore实现（推荐方案）
| 文档 | 说明 |
|------|------|
| [TABLESTORE_IMPLEMENTATION_SUMMARY.md](TABLESTORE_IMPLEMENTATION_SUMMARY.md) | 技术选型和架构说明 |
| [JAVA_TUNNEL_SERVICE.md](JAVA_TUNNEL_SERVICE.md) | Java Tunnel监听服务使用指南 |
| [JAVA_SERVICE_README.md](JAVA_SERVICE_README.md) | Java服务详细开发文档 |
| [SERVER_README.md](SERVER_README.md) | Node.js REST API文档 |

### Firebase/LeanCloud方案
| 文档 | 说明 |
|------|------|
| [FIREBASE_SETUP_GUIDE.md](FIREBASE_SETUP_GUIDE.md) | Firebase配置和部署 |
| [FIREBASE_SECURITY_SETUP.md](FIREBASE_SECURITY_SETUP.md) | Firebase安全规则 |
| [LEANCLOUD_COLLABORATION_IMPLEMENTATION.md](LEANCLOUD_COLLABORATION_IMPLEMENTATION.md) | LeanCloud实现说明 |

### 项目说明
| 文档 | 说明 |
|------|------|
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | 详细功能和组件说明 |

## 🎯 使用场景

### 场景1：首次部署TableStore方案

1. 阅读 [TABLESTORE_IMPLEMENTATION_SUMMARY.md](TABLESTORE_IMPLEMENTATION_SUMMARY.md) 了解架构
2. 按照 [DEPLOYMENT_QUICK_GUIDE.md](DEPLOYMENT_QUICK_GUIDE.md) 完成部署
3. 使用 [COLLABORATION_TEST_GUIDE.md](COLLABORATION_TEST_GUIDE.md) 测试

### 场景2：开发Node.js API

1. 查看 [SERVER_README.md](SERVER_README.md) 了解API接口
2. 参考 [SERVER_ENV_TEMPLATE.md](SERVER_ENV_TEMPLATE.md) 配置环境

### 场景3：开发Java Tunnel服务

1. 查看 [JAVA_TUNNEL_SERVICE.md](JAVA_TUNNEL_SERVICE.md) 快速开始
2. 参考 [JAVA_SERVICE_README.md](JAVA_SERVICE_README.md) 详细开发

### 场景4：使用Firebase/LeanCloud

1. 选择方案：[FIREBASE_SETUP_GUIDE.md](FIREBASE_SETUP_GUIDE.md) 或 [LEANCLOUD_COLLABORATION_IMPLEMENTATION.md](LEANCLOUD_COLLABORATION_IMPLEMENTATION.md)
2. 按照指南配置
3. 使用 [COLLABORATION_TEST_GUIDE.md](COLLABORATION_TEST_GUIDE.md) 测试

## 📊 架构图

### TableStore架构
```
┌─────────────┐    WebSocket     ┌──────────────┐    HTTP回调    ┌──────────────┐
│   前端应用   │ ◄──────────────► │  Node.js服务  │ ◄───────────► │  Java服务    │
│  (Browser)  │    HTTP API      │  (端口3001)   │                │  (端口8080)  │
└─────────────┘                  └──────────────┘                └──────┬───────┘
                                                                         │
                                                                  Tunnel Service
                                                                         │
                                                                  ┌──────▼──────┐
                                                                  │ TableStore  │
                                                                  └─────────────┘
```

### Firebase/LeanCloud架构
```
┌─────────────┐                  ┌─────────────────┐
│   前端应用   │ ◄──────────────► │  Firebase/      │
│  (Browser)  │    实时数据库     │  LeanCloud      │
└─────────────┘                  └─────────────────┘
```

## 🔗 外部链接

- [阿里云TableStore文档](https://help.aliyun.com/product/27278.html)
- [Tunnel Service指南](https://help.aliyun.com/document_detail/102373.html)
- [Firebase文档](https://firebase.google.com/docs)
- [LeanCloud文档](https://docs.leancloud.cn/)

## ⚡ 方案对比

| 特性 | TableStore | Firebase | LeanCloud |
|------|-----------|----------|-----------|
| **实时推送** | ✅ Tunnel主动推送 | ✅ 实时数据库 | ✅ 实时数据库 |
| **国内访问** | ⭐⭐⭐ 快速稳定 | ⭐ 较慢 | ⭐⭐ 较快 |
| **成本** | 按量付费，低 | 免费额度，中 | 免费额度，中 |
| **扩展性** | ⭐⭐⭐ 分布式 | ⭐⭐ 中等 | ⭐⭐ 中等 |
| **配置复杂度** | ⭐ 较复杂 | ⭐⭐ 简单 | ⭐⭐ 简单 |
| **推荐场景** | 生产环境 | 国际应用 | 国内小型应用 |

## 📝 文档更新

文档随项目持续更新。最后更新：**2025年10月**

## 💡 贡献指南

发现文档问题或有改进建议？
1. 提交Issue
2. 发起Pull Request
3. 联系维护者

---

**返回** [项目主页](../README.md)

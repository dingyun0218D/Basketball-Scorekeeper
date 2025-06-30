# LeanCloud协作功能实现总结

## 概述
为篮球计分器应用添加了LeanCloud协作服务支持，实现了多服务架构，用户可以在Firebase和LeanCloud之间切换选择协作后端服务。

## 实现内容

### 1. 协作服务架构重构

#### 服务接口抽象
- **位置**: `src/types/index.ts`
- **新增类型**:
  - `ServiceType`: 定义服务类型枚举 ('firebase' | 'leancloud')
  - `CollaborativeService`: 协作服务统一接口
  - `ServiceConfig`: 服务配置接口

#### Firebase服务适配
- **位置**: `src/services/firestoreService.ts`
- **修改**: 实现 `CollaborativeService` 接口
- **新增**: `getServiceName()` 方法

#### LeanCloud服务实现
- **位置**: `src/services/leancloudService.ts`
- **功能**: 完整实现协作服务接口
- **特性**:
  - 使用轮询机制实现实时同步（每2-3秒）
  - 支持游戏状态和事件的CRUD操作
  - 用户活动状态跟踪
  - 会话管理

#### 服务管理器
- **位置**: `src/services/collaborationServiceManager.ts`
- **功能**:
  - 统一管理多个协作服务
  - 提供服务切换功能
  - 服务配置管理
  - 服务可用性检查

### 2. 配置和依赖

#### LeanCloud配置
- **位置**: `src/config/leancloud.ts`
- **功能**: LeanCloud SDK初始化和配置管理
- **环境变量支持**: 支持从环境变量读取配置

#### 依赖管理
- **新增依赖**: `leancloud-storage`
- **环境变量**: 添加LeanCloud相关环境变量类型定义

### 3. 用户界面改进

#### 服务选择器组件
- **位置**: `src/components/Collaborative/ServiceSelector.tsx`
- **功能**:
  - 下拉选择器切换服务
  - 显示服务图标和描述
  - 支持禁用状态

#### 协作管理器增强
- **位置**: `src/components/Collaborative/CollaborativeGameManager.tsx`
- **改进**:
  - 在右上角集成服务选择器
  - 支持连接时切换服务的确认对话框
  - 保持原有UI布局不变

### 4. Hooks重构

#### useCollaborativeGame Hook
- **位置**: `src/hooks/useCollaborativeGame.ts`
- **改进**:
  - 添加 `serviceType` 参数支持
  - 集成服务管理器
  - 新增 `switchService` 方法
  - 返回当前服务类型信息

## 技术特点

### 1. 模块化设计
- 清晰的接口抽象
- 服务实现可独立扩展
- 配置统一管理

### 2. 向后兼容
- Firebase功能完全保持不变
- 现有代码无需修改
- 默认使用Firebase服务

### 3. 用户体验
- 无缝服务切换
- 直观的服务选择界面
- 详细的状态提示

### 4. 容错处理
- 网络异常处理
- 服务不可用时的降级
- 状态同步冲突解决

## 服务配置

### Firebase配置
```typescript
// 现有Firebase配置保持不变
{
  type: 'firebase',
  name: 'Firebase',
  description: '谷歌云端数据库，实时同步',
  icon: '🔥'
}
```

### LeanCloud配置
```typescript
{
  type: 'leancloud',
  name: 'LeanCloud',
  description: '国内云端服务，稳定可靠',
  icon: '☁️'
}
```

## 环境变量

### LeanCloud环境变量
```bash
VITE_LEANCLOUD_APP_ID=your-leancloud-app-id
VITE_LEANCLOUD_APP_KEY=your-leancloud-app-key
VITE_LEANCLOUD_SERVER_URL=https://your-subdomain.leancloud.app
```

## 使用方式

### 1. 服务选择
用户可以在协作弹窗的右上角通过下拉选择器切换服务：
- Firebase: 实时同步，支持全球访问
- LeanCloud: 国内优化，稳定可靠

### 2. 无缝切换
- 未连接时：直接切换服务类型
- 已连接时：显示确认对话框，切换后断开当前连接

### 3. 功能一致性
无论选择哪种服务，用户都享有完全相同的协作功能：
- 创建/加入会话
- 实时状态同步
- 在线用户显示
- 事件日志记录

## 技术考虑

### 1. 性能优化
- LeanCloud使用轮询机制，频率可调节
- Firebase保持原有实时同步优势
- 防抖处理减少不必要的同步

### 2. 数据一致性
- 两种服务使用相同的数据结构
- 统一的时间戳处理
- 一致的用户活动状态管理

### 3. 扩展性
- 接口设计支持添加更多服务
- 配置化的服务管理
- 插件式的服务架构

## 故障排除

### LeanCloud保留字段问题

**问题**: 使用LeanCloud时遇到保留字段错误，如 `key[createdAt] is reserved`

**原因**: LeanCloud有一些内置的保留字段，包括：
- `createdAt` - 对象创建时间
- `updatedAt` - 对象更新时间  
- `objectId` - 对象唯一标识
- `type` - 类型字段
- `timestamp` - 时间戳字段

**解决方案**: 
在LeanCloud服务实现中使用自定义字段名：
```typescript
// 替代保留字段
gameSession.set('gameCreatedAt', new Date());    // 替代 createdAt
gameSession.set('gameUpdatedAt', new Date());    // 替代 updatedAt
gameEvent.set('eventTimestamp', new Date());     // 替代 timestamp
gameEvent.set('gameEventType', event.type);      // 替代 type
```

**注意事项**:
- 读取数据时使用对应的自定义字段名
- 保持数据结构在两种服务间的一致性
- 新增字段时检查是否为保留字段

### LeanCloud类不存在问题

**问题**: 访问LeanCloud数据时遇到404错误，如 `Class or object doesn't exists. [404 GET https://...classes/GameEvent]`

**原因**: LeanCloud中的数据表（Class）需要先创建才能使用，第一次访问不存在的类会返回404错误。

**解决方案**: 
实现自动类初始化机制：
```typescript
// 确保类存在的方法
private async ensureClassExists(className: string): Promise<void> {
  if (this.initializedClasses.has(className)) {
    return;
  }

  try {
    // 尝试查询类是否存在
    const query = new AV.Query(className);
    query.limit(1);
    await query.find();
    this.initializedClasses.add(className);
  } catch (error: any) {
    if (error.code === 101 || error.message?.includes("doesn't exists")) {
      // 类不存在，创建示例对象来初始化类
      const ObjectClass = AV.Object.extend(className);
      const obj = new ObjectClass();
      // 设置必要字段...
      const saved = await obj.save();
      await saved.destroy(); // 立即删除示例对象
      this.initializedClasses.add(className);
    }
  }
}
```

**使用场景**:
- 在所有CRUD操作前调用 `ensureClassExists()`
- 缓存已初始化的类避免重复检查
- 自动创建和删除示例对象完成类初始化

**注意事项**:
- 类初始化只需要一次，使用缓存机制提高性能
- 监听方法中异步初始化避免阻塞订阅
- 初始化失败时提供详细错误信息

## 后续优化建议

1. **LeanCloud实时推送**: 配置LiveQuery实现真正的实时同步
2. **服务健康检查**: 添加服务可用性监控
3. **数据迁移**: 支持服务间数据迁移功能
4. **性能监控**: 添加服务性能指标收集

## 总结

本次实现成功为应用添加了多服务协作支持，保持了代码的模块化和可维护性。用户可以根据需要选择最适合的协作服务，获得一致且可靠的协作体验。通过避免LeanCloud保留字段的问题，确保了服务的稳定运行。 
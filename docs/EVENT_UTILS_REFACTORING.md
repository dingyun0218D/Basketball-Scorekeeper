# 事件工具模块化重构

## 概述
为了提高代码的可维护性和模块化程度，我们将 `GameContext.tsx` 中的事件处理逻辑拆分到独立的工具文件中。这种做法遵循了单一职责原则，使每个文件专注于特定类型的事件处理。

## 重构后的文件结构

### 新增的工具文件

#### 1. `src/utils/scoreEventUtils.ts`
- **功能**: 处理得分相关的事件和逻辑
- **函数**:
  - `createScoreEvent()` - 创建得分事件
  - `updatePlayerScoreStats()` - 更新球员得分统计
  - `updatePlayersPlusMinus()` - 更新球员正负值

#### 2. `src/utils/foulEventUtils.ts`
- **功能**: 处理犯规相关的事件和逻辑
- **函数**:
  - `createFoulEvent()` - 创建犯规事件
  - `updateTeamFouls()` - 更新队伍犯规数
  - `updatePlayerFouls()` - 更新球员犯规数

#### 3. `src/utils/timeoutEventUtils.ts`
- **功能**: 处理暂停相关的事件和逻辑
- **函数**:
  - `createTimeoutEvent()` - 创建暂停事件
  - `updateTeamTimeouts()` - 更新队伍暂停数
  - `hasTimeoutsRemaining()` - 检查是否还有暂停次数

#### 4. `src/utils/substitutionEventUtils.ts`
- **功能**: 处理换人相关的事件和逻辑
- **函数**:
  - `createSubstitutionEvent()` - 创建换人事件
  - `togglePlayerCourtStatus()` - 切换球员上场状态
  - `canPlayerEnterCourt()` - 检查是否可以上场

#### 5. `src/utils/quarterEventUtils.ts`
- **功能**: 处理节次相关的事件和逻辑
- **函数**:
  - `createQuarterEndEvent()` - 创建节次结束事件

#### 6. `src/utils/shotEventUtils.ts`
- **功能**: 处理投篮相关的事件和逻辑
- **函数**:
  - `createShotAttemptEvent()` - 创建投篮尝试事件
  - `updatePlayerShotStats()` - 更新球员投篮统计
  - `updateTeamPlayerShotStats()` - 更新队伍中球员的投篮统计

#### 7. `src/utils/undoEventUtils.ts`
- **功能**: 处理撤销操作相关的逻辑
- **函数**:
  - `canUndoScore()` - 检查是否可以撤销得分
  - `undoPlayerScoreStats()` - 撤销球员得分统计

#### 8. `src/utils/statisticsEventUtils.ts` (之前已存在)
- **功能**: 处理统计相关的事件和逻辑
- **函数**:
  - `createStatEvent()` - 创建统计事件
  - `createUndoEvent()` - 创建撤销事件

#### 9. `src/utils/eventUtils.ts`
- **功能**: 统一导出所有事件工具函数
- **作用**: 提供一个统一的入口点来导入所有事件工具

## 重构的好处

### 1. **模块化设计**
- 每个文件专注于特定类型的事件处理
- 符合单一职责原则
- 便于单独测试和维护

### 2. **代码复用**
- 事件创建逻辑可以在其他地方复用
- 减少重复代码

### 3. **可维护性提升**
- 逻辑清晰，易于理解和修改
- 当需要修改特定类型的事件逻辑时，只需要修改对应的工具文件

### 4. **类型安全**
- 保持了原有的 TypeScript 类型检查
- 函数参数和返回值都有明确的类型定义

## 使用示例

```typescript
// 在 GameContext.tsx 中使用
import { 
  createScoreEvent, 
  updatePlayerScoreStats, 
  updatePlayersPlusMinus 
} from '../utils/scoreEventUtils';

// 创建得分事件
const event = createScoreEvent(teamId, playerId, team, points, quarter, time);

// 更新球员统计
const updatedPlayer = updatePlayerScoreStats(player, points, scoreType);

// 更新正负值
const updatedPlayers = updatePlayersPlusMinus(players, points, true);
```

## 迁移说明

### GameContext.tsx 的变化
- 导入了所有新的工具函数
- 每个事件处理case都被简化，使用工具函数代替内联逻辑
- 保持了完全相同的功能和行为

### 代码逻辑完全不变
- 所有的业务逻辑都被完整地移植到工具函数中
- 游戏状态管理的行为与重构前完全一致
- 确保了重构的安全性

## 测试验证

项目构建成功 (`npm run build`)，说明：
- 所有类型检查通过
- 没有编译错误
- 模块导入导出正确
- 重构后的代码结构健康

这次重构大大提升了代码的组织性和可维护性，为后续功能开发打下了良好的基础。 
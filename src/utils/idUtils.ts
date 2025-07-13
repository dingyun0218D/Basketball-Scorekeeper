// ID生成工具函数

/**
 * 生成唯一ID
 * 使用时间戳 + 随机数的组合确保唯一性
 */
export const generateUniqueId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `${timestamp}-${random}`;
};

/**
 * 生成会话ID
 * 6位大写字母和数字的组合
 */
export const generateSessionId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * 生成球员ID
 * 使用team前缀 + 时间戳 + 随机数
 */
export const generatePlayerId = (teamId: string): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${teamId}-player-${timestamp}-${random}`;
};

/**
 * 生成队伍ID
 */
export const generateTeamId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `team-${timestamp}-${random}`;
};

/**
 * 验证ID格式
 */
export const isValidId = (id: string): boolean => {
  return typeof id === 'string' && id.length > 0 && /^[a-zA-Z0-9-_]+$/.test(id);
}; 
/**
 * 阿里云TableStore前端配置
 * 前端不直接连接TableStore，而是通过后端API和WebSocket
 */

export interface TableStoreClientConfig {
  apiBaseUrl: string;
  wsBaseUrl: string;
}

// 从环境变量读取配置
const getApiBaseUrl = (): string => {
  // 优先使用环境变量
  if (import.meta.env.VITE_TABLESTORE_API_URL) {
    return import.meta.env.VITE_TABLESTORE_API_URL;
  }
  
  // 开发环境默认配置
  if (import.meta.env.DEV) {
    return 'http://localhost:3001/api';
  }
  
  // 生产环境需要配置正确的URL
  return import.meta.env.VITE_TABLESTORE_API_URL || '';
};

const getWsBaseUrl = (): string => {
  // 优先使用环境变量
  if (import.meta.env.VITE_TABLESTORE_WS_URL) {
    return import.meta.env.VITE_TABLESTORE_WS_URL;
  }
  
  // 开发环境默认配置
  if (import.meta.env.DEV) {
    return 'ws://localhost:3001';
  }
  
  // 生产环境需要配置正确的URL
  return import.meta.env.VITE_TABLESTORE_WS_URL || '';
};

export const tablestoreConfig: TableStoreClientConfig = {
  apiBaseUrl: getApiBaseUrl(),
  wsBaseUrl: getWsBaseUrl()
};

// 验证配置
export const validateTableStoreConfig = (): boolean => {
  if (!tablestoreConfig.apiBaseUrl) {
    console.error('❌ TableStore API URL not configured');
    return false;
  }
  
  if (!tablestoreConfig.wsBaseUrl) {
    console.error('❌ TableStore WebSocket URL not configured');
    return false;
  }
  
  console.log('✅ TableStore config validated');
  console.log(`📡 API: ${tablestoreConfig.apiBaseUrl}`);
  console.log(`🔌 WebSocket: ${tablestoreConfig.wsBaseUrl}`);
  
  return true;
};


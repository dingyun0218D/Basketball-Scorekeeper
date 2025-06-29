import cloudbase from '@cloudbase/js-sdk';

// CloudBase 类型定义
interface CloudBaseApp {
  database(): CloudBaseDB;
  auth(): CloudBaseAuth;
}

interface CloudBaseDB {
  collection(name: string): unknown;
}

interface CloudBaseAuth {
  signInAnonymously(): Promise<unknown>;
}

// CloudBase 错误类型定义
interface CloudBaseError {
  code?: string;
  details?: string;
  message: string;
  stack?: string;
}

// 打印环境信息便于调试
console.log('CloudBase 环境配置检查:', {
  NODE_ENV: import.meta.env.NODE_ENV,
  PROD: import.meta.env.PROD,
  DEV: import.meta.env.DEV,
  envId: import.meta.env.VITE_CLOUDBASE_ENV_ID ? 'configured' : 'not set',
  region: import.meta.env.VITE_CLOUDBASE_REGION || 'default(ap-shanghai)',
  envVars: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_CLOUDBASE')),
});

// CloudBase 配置 - 使用环境变量
const cloudbaseConfig = {
  env: import.meta.env.VITE_CLOUDBASE_ENV_ID, // 环境ID
  region: import.meta.env.VITE_CLOUDBASE_REGION || 'ap-shanghai', // 默认上海区域
};

console.log('CloudBase 配置对象:', cloudbaseConfig);

// 验证必要的环境变量
const requiredEnvVars = [
  'VITE_CLOUDBASE_ENV_ID'
];

const missingEnvVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('缺少必要的 CloudBase 环境变量:', missingEnvVars);
  console.error('当前环境变量:', {
    VITE_CLOUDBASE_ENV_ID: import.meta.env.VITE_CLOUDBASE_ENV_ID || 'undefined',
    VITE_CLOUDBASE_REGION: import.meta.env.VITE_CLOUDBASE_REGION || 'undefined'
  });
  console.warn('CloudBase 功能将不可用，请配置环境变量后重启应用');
} else {
  console.log('CloudBase 环境变量检查通过');
}

// 初始化 CloudBase
let app: CloudBaseApp | null = null;
let db: CloudBaseDB | null = null;
let isAuthenticated = false;

// 认证状态 Promise，用于等待认证完成
let authPromise: Promise<void> | null = null;

try {
  if (!missingEnvVars.length) {
    console.log('开始初始化 CloudBase...');
    app = cloudbase.init(cloudbaseConfig);
    console.log('CloudBase app 初始化成功');
    
    db = app.database();
    console.log('CloudBase database 初始化成功');
    
    // 匿名登录并等待完成
    authPromise = app.auth().signInAnonymously()
      .then(() => {
        console.log('CloudBase 匿名登录成功');
        isAuthenticated = true;
      })
      .catch((error: Error) => {
        const cloudbaseError = error as CloudBaseError;
        console.error('CloudBase 匿名登录失败:', {
          error: error.message,
          stack: error.stack,
          code: cloudbaseError.code,
          details: cloudbaseError.details
        });
        isAuthenticated = false;
        throw error; // 重新抛出错误，让调用者知道登录失败
      });
  } else {
    console.warn('跳过 CloudBase 初始化，因为缺少必要的环境变量');
  }
} catch (error) {
  console.error('CloudBase 初始化失败，详细错误信息:', {
    error,
    message: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : 'No stack',
    type: typeof error,
    constructor: error?.constructor?.name,
    config: cloudbaseConfig
  });
  
  // 确保变量保持为 null
  app = null;
  db = null;
  isAuthenticated = false;
}

// 最终状态检查
console.log('CloudBase 初始化完成，最终状态:', {
  appReady: !!app,
  dbReady: !!db,
  missingEnvVars: missingEnvVars.length,
  isAvailable: !!app && !!db
});

// 等待认证完成的辅助函数
export const waitForAuth = async (): Promise<boolean> => {
  if (!authPromise) {
    console.warn('CloudBase 认证 Promise 不存在');
    return false;
  }
  
  try {
    await authPromise;
    console.log('CloudBase 认证等待完成，状态:', isAuthenticated);
    return isAuthenticated;
  } catch (error) {
    console.error('CloudBase 认证等待失败:', error);
    return false;
  }
};

export { app, db, isAuthenticated };
export default app; 
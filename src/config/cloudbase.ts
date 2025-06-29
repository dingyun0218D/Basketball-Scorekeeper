import cloudbase from '@cloudbase/js-sdk';

// CloudBase 配置 - 使用环境变量
const cloudbaseConfig = {
  env: import.meta.env.VITE_CLOUDBASE_ENV_ID, // 环境ID
  region: import.meta.env.VITE_CLOUDBASE_REGION || 'ap-shanghai', // 默认上海区域
};

// 验证必要的环境变量
const requiredEnvVars = [
  'VITE_CLOUDBASE_ENV_ID'
];

const missingEnvVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('缺少必要的 CloudBase 环境变量:', missingEnvVars);
  console.warn('CloudBase 功能将不可用，请配置环境变量后重启应用');
}

// 初始化 CloudBase
let app: any = null;
let db: any = null;

try {
  if (!missingEnvVars.length) {
    app = cloudbase.init(cloudbaseConfig);
    db = app.database();
    
    // 匿名登录
    app.auth().signInAnonymously().catch((error: any) => {
      console.warn('CloudBase 匿名登录失败:', error);
    });
  }
} catch (error) {
  console.error('CloudBase 初始化失败:', error);
}

export { app, db };
export default app; 
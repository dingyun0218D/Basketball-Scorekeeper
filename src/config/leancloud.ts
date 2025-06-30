import AV from 'leancloud-storage';

// LeanCloud 配置
const LEANCLOUD_CONFIG = {
  appId: import.meta.env.VITE_LEANCLOUD_APP_ID || 'your-app-id',
  appKey: import.meta.env.VITE_LEANCLOUD_APP_KEY || 'your-app-key',
  serverURLs: import.meta.env.VITE_LEANCLOUD_SERVER_URL || 'https://please-replace-with-your-customized.domain.com'
};

// 初始化 LeanCloud
export const initLeanCloud = () => {
  AV.init({
    appId: LEANCLOUD_CONFIG.appId,
    appKey: LEANCLOUD_CONFIG.appKey,
    serverURLs: LEANCLOUD_CONFIG.serverURLs
  });
};

// 调用初始化
initLeanCloud();

export { AV };
export default AV; 
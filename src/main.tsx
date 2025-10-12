import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { GameProvider } from './contexts/GameContextProvider'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { validateTableStoreConfig } from './config/tablestore'
import './index.css'

// 调试信息
console.log('🏀 篮球计分器启动中...');
console.log('当前路径:', window.location.pathname);
console.log('当前域名:', window.location.hostname);
console.log('完整 URL:', window.location.href);

// 验证 TableStore 配置
console.log('\n========================================');
console.log('🔧 验证 TableStore 配置');
console.log('========================================');
validateTableStoreConfig();
console.log('========================================\n');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <GameProvider>
        <App />
      </GameProvider>
    </ErrorBoundary>
  </React.StrictMode>,
) 
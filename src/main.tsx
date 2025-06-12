import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { GameProvider } from './contexts/GameContext'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import './index.css'

// 调试信息
console.log('🏀 篮球计分器启动中...');
console.log('当前路径:', window.location.pathname);
console.log('当前域名:', window.location.hostname);
console.log('完整 URL:', window.location.href);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <GameProvider>
        <App />
      </GameProvider>
    </ErrorBoundary>
  </React.StrictMode>,
) 
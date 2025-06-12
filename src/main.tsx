import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { GameProvider } from './contexts/GameContext'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <GameProvider>
        <App />
      </GameProvider>
    </ErrorBoundary>
  </React.StrictMode>,
) 
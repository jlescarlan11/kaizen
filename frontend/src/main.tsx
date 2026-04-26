import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { initSentry } from './app/sentry'
import './shared/styles/index.css'
import { SyncManager } from './features/transactions/lib/syncManager'

// Initialize Sentry before rendering so all errors are captured.
initSentry()

// Initialize background sync
SyncManager.init()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { GlobalErrorBoundary } from '@/components/shared/global-error-boundary'
import { capturePromiseRejection } from '@/lib/error-tracking'

window.addEventListener('unhandledrejection', capturePromiseRejection)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </StrictMode>
)

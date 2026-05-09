import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { logger } from './utils/logger';

// Global Error Handling
window.onerror = (message, source, lineno, colno, error) => {
  logger.error('Global Window Error', error || message, { source, lineno, colno });
};

window.onunhandledrejection = (event) => {
  logger.error('Unhandled Promise Rejection', event.reason);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

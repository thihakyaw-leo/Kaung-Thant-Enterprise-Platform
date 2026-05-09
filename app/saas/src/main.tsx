import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './lib/router'
import './i18n'
import './index.css'
import { logger } from './utils/logger';

// Global Error Handling
window.onerror = (message, source, lineno, colno, error) => {
  logger.error('Global Window Error', error || message, { source, lineno, colno });
};

window.onunhandledrejection = (event) => {
  logger.error('Unhandled Promise Rejection', event.reason);
};

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
)

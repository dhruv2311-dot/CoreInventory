import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'

// Apply persisted theme before first render to avoid flash
const savedTheme = (() => {
  try {
    const stored = localStorage.getItem('theme-preference');
    return stored ? JSON.parse(stored)?.state?.theme : null;
  } catch { return null; }
})();
document.documentElement.setAttribute('data-theme', savedTheme || 'dark');

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)


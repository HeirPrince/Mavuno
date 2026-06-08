import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import ClerkRoot from '@/providers/ClerkRoot';
import QueryProvider from '@/providers/QueryProvider';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ClerkRoot>
        <QueryProvider>
          <App />
        </QueryProvider>
      </ClerkRoot>
    </BrowserRouter>
  </StrictMode>,
);

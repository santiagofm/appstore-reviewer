import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AppsProvider } from './context/AppsContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppsProvider>
      <App />
    </AppsProvider>
  </StrictMode>,
);

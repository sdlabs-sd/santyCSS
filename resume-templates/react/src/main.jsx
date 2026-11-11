import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './santy.css'; // resolved by vite-plugin-santycss (purged in build)
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

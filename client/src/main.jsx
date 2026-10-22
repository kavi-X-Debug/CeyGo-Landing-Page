import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { prefersReducedMotion } from './lib/motion.js';
import './index.css';

// Enables the hidden starting state for reveal animations only when motion is allowed.
if (!prefersReducedMotion()) document.documentElement.classList.add('motion-ok');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);

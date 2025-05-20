
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure the DOM is fully loaded before mounting the app
function mount() {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error('Root element not found, retrying in 100ms...');
    setTimeout(mount, 100);
    return;
  }
  
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('App mounted successfully');
  } catch (error) {
    console.error('Error rendering the app:', error);
  }
}

// Start mounting logic - either when DOM is ready or immediately if already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}

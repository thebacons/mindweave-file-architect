
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Direct initialization approach for Stackblitz environment
const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('App mounted successfully');
  } catch (error) {
    console.error('Error rendering the app:', error);
    // Fallback rendering in case of errors
    rootElement.innerHTML = '<div style="padding: 20px; font-family: sans-serif;"><h2>Error loading application</h2><p>Please check console for details.</p></div>';
  }
} else {
  console.error('Root element not found - attempting to create one');
  // Emergency fallback - create root element if missing
  const newRoot = document.createElement('div');
  newRoot.id = 'root';
  document.body.appendChild(newRoot);
  
  try {
    const root = ReactDOM.createRoot(newRoot);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('App mounted on dynamically created root');
  } catch (error) {
    console.error('Error in fallback rendering:', error);
  }
}

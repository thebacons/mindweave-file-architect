
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Function to initialize the app
function initializeApp() {
  const rootElement = document.getElementById("root");

  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
  } else {
    console.error("Could not find root element");
  }
}

// Execute immediately - this works better in Stackblitz environments
initializeApp();
